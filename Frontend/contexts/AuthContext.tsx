import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import {
  login as apiLogin,
  signup as apiSignup,
  googleAuth as apiGoogleAuth,
  exchangeCode as apiExchangeCode,
  LoginResponse,
  SignupResponse,
  GoogleAuthResponse,
  ExchangeCodeResponse
} from '@/utils/api';

// User type definition
export interface User {
  id: string;
  username: string;
  email: string;
  is_verified: boolean;
  isLoggedIn: boolean;
}

// Auth context type
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  googleAuth: (idToken: string) => Promise<void>;
  exchangeCode: (code: string) => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize auth state from AsyncStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const userData = await AsyncStorage.getItem('userDetails');

        if (userData) {
          const parsedUser = JSON.parse(userData) as User;
          if (parsedUser.isLoggedIn) {
            setUser(parsedUser);
          } else {
            // Set default user if not logged in
            setUser({
              id: '',
              username: '',
              email: '',
              is_verified: false,
              isLoggedIn: false,
            });
          }
        } else {
          // Set default user if no data exists
          const defaultUser: User = {
            id: '',
            username: '',
            email: '',
            is_verified: false,
            isLoggedIn: false,
          };
          await AsyncStorage.setItem('userDetails', JSON.stringify(defaultUser));
          setUser(defaultUser);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Set default user on error
        setUser({
          id: '',
          username: '',
          email: '',
          is_verified: false,
          isLoggedIn: false,
        });
      } finally {
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, []);

  // Helper function to save user to AsyncStorage
  const saveUserToStorage = async (userData: User) => {
    try {
      await AsyncStorage.setItem('userDetails', JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error('Error saving user to storage:', error);
      throw error;
    }
  };

  // Helper function to save tokens for mobile platforms
  const saveTokens = async (accessToken?: string, refreshToken?: string) => {
    if (Platform.OS !== 'web' && accessToken && refreshToken) {
      try {
        await AsyncStorage.setItem('accessToken', accessToken);
        await AsyncStorage.setItem('refreshToken', refreshToken);
      } catch (error) {
        console.error('Error saving tokens:', error);
      }
    }
  };

  // Login function
  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      const response: LoginResponse = await apiLogin(email, password);

      if (response?.user) {
        const userData: User = {
          ...response.user,
          isLoggedIn: true,
        };
        await saveUserToStorage(userData);

        // Save tokens for mobile platforms
        if (response?.accessToken && response?.refreshToken) {
          await saveTokens(response.accessToken, response.refreshToken);
        }
      } else {
        throw new Error('Login response missing user data');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Signup function
  const signup = async (username: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response: SignupResponse = await apiSignup(username, email, password);

      if (response?.user) {
        const userData: User = {
          ...response.user,
          isLoggedIn: false, // User needs to verify email first
        };
        await saveUserToStorage(userData);

        // Check if email was sent successfully
        const emailSentSuccessfully =
          response?.message?.includes("check your email") ||
          response?.message?.includes("verification email");

        return emailSentSuccessfully;

      } else {
        throw new Error('Signup response missing user data');
      }
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const defaultUser: User = {
        id: '',
        username: '',
        email: '',
        is_verified: false,
        isLoggedIn: false,
      };
      await saveUserToStorage(defaultUser);

      // Clear tokens for mobile platforms
      if (Platform.OS !== 'web') {
        await AsyncStorage.removeItem('accessToken');
        await AsyncStorage.removeItem('refreshToken');
      }
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Google Auth function
  const googleAuth = async (idToken: string): Promise<void> => {
    setIsLoading(true);
    try {
      const response: GoogleAuthResponse = await apiGoogleAuth(idToken);

      if (response?.user) {
        const userData: User = {
          ...response.user,
          isLoggedIn: true,
        };
        await saveUserToStorage(userData);

        // Save tokens for mobile platforms
        if (response.accessToken && response.refreshToken) {
          await saveTokens(response.accessToken, response.refreshToken);
        }
      } else {
        throw new Error('Google auth response missing user data');
      }
    } catch (error) {
      console.error('Google auth error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Exchange code function (for email verification)
  const exchangeCode = async (code: string): Promise<void> => {
    setIsLoading(true);
    try {
      const response: ExchangeCodeResponse = await apiExchangeCode(code);

      if (response?.user) {
        const userData: User = {
          ...response.user,
          isLoggedIn: true,
        };
        await saveUserToStorage(userData);

        // Save tokens for mobile platforms
        if (response.accessToken && response.refreshToken) {
          await saveTokens(response.accessToken, response.refreshToken);
        }
      } else {
        throw new Error('Exchange code response missing user data');
      }
    } catch (error) {
      console.error('Exchange code error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Update user function
  const updateUser = async (userData: Partial<User>): Promise<void> => {
    if (!user) {
      throw new Error('No user logged in');
    }

    const updatedUser: User = {
      ...user,
      ...userData,
    };
    await saveUserToStorage(updatedUser);
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isInitialized,
    login,
    signup,
    logout,
    googleAuth,
    exchangeCode,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
