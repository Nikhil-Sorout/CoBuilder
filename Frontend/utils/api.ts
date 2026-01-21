import axios, { AxiosError } from 'axios';
import { Platform } from 'react-native';

// Base API URL - update this to match your backend URL
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'x-platform': Platform.OS,
  },
  timeout: 10000, // 10 seconds timeout
  withCredentials: Platform.OS === 'web', // Include cookies on web
});

// Signup response types
export interface SignupResponse {
  message: string;
  user: {
    id: number;
    username: string;
    email: string;
    is_verified: boolean;
  };
}

export interface SignupErrorResponse {
  error: string;
  login_with_google?: string;
}

// Login response types
export interface LoginResponse {
  message: string;
  accessToken?: string; // Only for mobile platforms
  refreshToken?: string; // Only for mobile platforms
  user: {
    id: string;
    username: string;
    email: string;
    is_verified: boolean;
  };
}

export interface LoginErrorResponse {
  error: string;
  login_with_google?: string;
}

// Google Auth response types
export interface GoogleAuthResponse {
  message: string;
  accessToken?: string; // Only for mobile platfomrs
  refreshToken?: string; // Only for mobile platforms
  user: {
    id: string;
    username: string;
    email: string;
    is_verified: boolean;
  };
}

export interface GoogleAuthErrorResponse {
  error: string;
}

// Exchange Code response types
export interface ExchangeCodeResponse {
  message: string;
  accessToken?: string;    // Only for mobile platforms
  refreshToken?: string; // Only for mobile platforms
  user: {
    id: string;
    username: string;
    email: string;
    is_verified: boolean;
  };
}

export interface ExchangeCodeErrorResponse {
  error: string;
}

/**
 * Sign up a new user
 * @param username - User's username
 * @param email - User's email
 * @param password - User's password
 * @returns Promise with signup response or throws error
 */
export const signup = async (
  username: string,
  email: string,
  password: string
): Promise<SignupResponse> => {
  try {
    const response = await apiClient.post<SignupResponse>('/auth/signup', {
      username,
      email,
      password,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<SignupErrorResponse>;
      if (axiosError.response) {
        // Server responded with error status
        throw {
          status: axiosError.response.status,
          message: axiosError.response.data?.error || 'An error occurred during signup',
        };
      } else if (axiosError.request) {
        // Request was made but no response received
        throw {
          status: 0,
          message: 'Network error. Please check your connection.',
        };
      }
    }
    // Unknown error
    throw {
      status: 500,
      message: 'An unexpected error occurred',
    };
  }
};

/**
 * Login a user
 * @param email - User's email
 * @param password - User's password
 * @returns Promise with login response or throws error
 */
export const login = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  try {
    const response = await apiClient.post<LoginResponse>('/auth/login', {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<LoginErrorResponse>;
      if (axiosError.response) {
        // Server responded with error status
        throw {
          status: axiosError.response.status,
          message: axiosError.response.data?.error || 'An error occurred during login',
        };
      } else if (axiosError.request) {
        // Request was made but no response received
        throw {
          status: 0,
          message: 'Network error. Please check your connection.',
        };
      }
    }
    // Unknown error
    throw {
      status: 500,
      message: 'An unexpected error occurred',
    };
  }
};

/**
 * Authenticate with Google OAuth
 * @param idToken - Google ID token from Google Sign-In
 * @returns Promise with Google auth response or throws error
 */
export const googleAuth = async (
  idToken: string
): Promise<GoogleAuthResponse> => {
  try {
    const response = await apiClient.post<GoogleAuthResponse>('/auth/google', {
      idToken,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<GoogleAuthErrorResponse>;
      if (axiosError.response) {
        // Server responded with error status
        throw {
          status: axiosError.response.status,
          message: axiosError.response.data?.error || 'An error occurred during Google authentication',
        };
      } else if (axiosError.request) {
        // Request was made but no response received
        throw {
          status: 0,
          message: 'Network error. Please check your connection.',
        };
      }
    }
    // Unknown error
    throw {
      status: 500,
      message: 'An unexpected error occurred',
    };
  }
};

/**
 * Exchange verification code for authentication tokens
 * @param code - Verification code from email link
 * @returns Promise with exchange code response or throws error
 */
export const exchangeCode = async (
  code: string
): Promise<ExchangeCodeResponse> => {
  try {
    const response = await apiClient.post<ExchangeCodeResponse>('/auth/exchange-code', {
      code,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ExchangeCodeErrorResponse>;
      if (axiosError.response) {
        // Server responded with error status
        throw {
          status: axiosError.response.status,
          message: axiosError.response.data?.error || 'An error occurred during code exchange',
        };
      } else if (axiosError.request) {
        // Request was made but no response received
        throw {
          status: 0,
          message: 'Network error. Please check your connection.',
        };
      }
    }
    // Unknown error
    throw {
      status: 500,
      message: 'An unexpected error occurred',
    };
  }
};
