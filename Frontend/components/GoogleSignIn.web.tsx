import { loadGoogleIdentity } from "@/utils/loadGoogleIdentity";
import { router } from "expo-router";
import { useCallback, useEffect, useRef } from "react";
import { Platform } from "react-native";
import { useAuth } from '@/contexts/AuthContext';

// TypeScript types for Google Identity Services
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (
            element: HTMLElement | null,
            config?: {
              theme?: 'outline' | 'filled_blue' | 'filled_black';
              size?: 'large' | 'medium' | 'small';
            }
          ) => void;
        };
      };
    };
  }
}

export default function GoogleSignInWeb() {
  const isLoadingRef = useRef(false);
  const { googleAuth, isLoading: authLoading } = useAuth();
  
  const handleCredential = useCallback(async (response: { credential: string }) => {
    if (isLoadingRef.current || authLoading) return; // Prevent multiple calls
    
    isLoadingRef.current = true;
    try {
      await googleAuth(response.credential);
      console.log("Google auth successful");
      
      // Redirect to home page on success
      router.replace("/home");
    } catch (error: any) {
      console.error("Google authentication failed:", error);
      // Show error message to user
      alert(error.message || "Failed to authenticate with Google");
    } finally {
      isLoadingRef.current = false;
    }
  }, [googleAuth, authLoading]);

  useEffect(() => {
    if (Platform.OS !== "web") return;

    loadGoogleIdentity()
      .then(() => {
        window.google!.accounts.id.initialize({
          client_id: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID!,
          callback: handleCredential,
        });

        window.google!.accounts.id.renderButton(
          document.getElementById("google-signin"),
          { theme: "filled_blue", size: "large" }
        );
      })
      .catch((error) => {
        console.error("Failed to load Google Identity Services:", error);
      });
  }, [handleCredential]);

  if (Platform.OS !== "web") return null;

  return <div id="google-signin" />;
}
