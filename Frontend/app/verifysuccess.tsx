import { BorderRadius, PlatformUtils, Spacing, Typography } from "@/constants/layout";
import { getAppColors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { exchangeCode } from "@/utils/api";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function VerifySuccess() {
  const colorScheme = useColorScheme();
  const colors = getAppColors(colorScheme);
  const { code } = useLocalSearchParams<{ code: string }>();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!code) {
      setError("Verification code is missing");
      setIsLoading(false);
      return;
    }

    const handleCodeExchange = async () => {
      try {
        const result = await exchangeCode(code);
        console.log("Code exchange successful: ", result);
        
        // Redirect to home page on success
        router.replace("/home");
      } catch (error: any) {
        console.error("Code exchange failed:", error);
        setError(error.message || "Failed to verify email. Please try again.");
        setIsLoading(false);
      }
    };

    handleCodeExchange();
  }, [code]);

  const handleBackToLogin = () => {
    router.replace("/(auth)/login");
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={PlatformUtils.safeAreaTop}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>
              {isLoading ? "Verifying Email" : error ? "Verification Failed" : "Email Verified"}
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {isLoading
                ? "Please wait while we verify your email..."
                : error
                ? "We couldn't verify your email address"
                : "Your email has been successfully verified"}
            </Text>
          </View>

          {/* Content */}
          <View style={styles.form}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                  Verifying your email...
                </Text>
              </View>
            ) : error ? (
              <>
                {/* Error Message */}
                <View style={styles.inputContainer}>
                  <View
                    style={[
                      styles.errorContainer,
                      {
                        backgroundColor: colors.errorLight || "#fee2e2",
                        borderColor: colors.error || "#ef4444",
                      },
                    ]}
                  >
                    <Text style={[styles.errorText, { color: colors.error || "#ef4444" }]}>
                      {error}
                    </Text>
                  </View>
                </View>

                {/* Instructions */}
                <View style={styles.inputContainer}>
                  <Text
                    style={[
                      styles.subtitle,
                      { color: colors.textSecondary, textAlign: "center" },
                    ]}
                  >
                    The verification link may have expired or is invalid. Please request a new verification email.
                  </Text>
                </View>

                {/* Back to Login Button */}
                <TouchableOpacity
                  style={[
                    styles.primaryButton,
                    {
                      backgroundColor: colors.primary,
                      minHeight: PlatformUtils.minTouchTarget,
                    },
                  ]}
                  onPress={handleBackToLogin}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[styles.primaryButtonText, { color: colors.textInverse }]}
                  >
                    Back to Login
                  </Text>
                </TouchableOpacity>
              </>
            ) : null}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: Spacing.xl,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: PlatformUtils.safeAreaTop + Spacing['3xl'],
    alignSelf: "center",
    width: "100%",
    maxWidth: 400,
  },
  header: {
    marginBottom: Spacing['3xl'],
  },
  title: {
    ...Typography.h1,
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  subtitle: {
    ...Typography.body,
    textAlign: "center",
  },
  form: {
    gap: Spacing.lg,
  },
  inputContainer: {
    gap: Spacing.sm,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing['3xl'],
    gap: Spacing.md,
  },
  loadingText: {
    ...Typography.body,
  },
  errorContainer: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  errorText: {
    ...Typography.body,
    textAlign: "center",
  },
  primaryButton: {
    width: "100%",
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.md,
  },
  primaryButtonText: {
    ...Typography.button,
  },
});
