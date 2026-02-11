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

let isRefreshing = false;
let failedQueue: any[] = [];

// Retry logic on unauthorized requests
apiClient.interceptors.response.use(
  response => response, // on fulfilled requests

  // on rejected requests
  async (error) => {
    const originalRequest = error.config;

    if(error.response?.status === 401 && !originalRequest._retry){
      if(isRefreshing){
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject});
        }).then(() => apiClient(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try{
        // Only for web, mobile specific logic will be added later
        await apiClient.post('/auth/refresh');
        failedQueue.forEach(p => p.resolve());
        failedQueue = [];

        return apiClient(originalRequest);
      } catch(refreshError){
        failedQueue.forEach(p => p.reject(refreshError));
        failedQueue = [];


        return Promise.reject(refreshError);
      } finally{
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
)

// Signup response types
export interface SignupResponse {
  message: string;
  user: {
    id: string;
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

// --- Course generation (backend: /generation/generateCourse) ---

/** Request body for generateCourse (snake_case for backend) */
export interface GenerateCourseRequest {
  topic: string;
  options?: {
    skill_level?: string;
    time_commitment?: string;
    learning_goal?: string;
  };
}

/** Lesson from backend (list view: content often null until ready) */
export interface ApiLesson {
  id: string;
  title: string;
  order: number;
  generation_status: string;
  content: Record<string, unknown> | null;
}

/** Chapter from backend */
export interface ApiChapter {
  id: string;
  title: string;
  order: number;
  lessons: ApiLesson[];
}

/** Module from backend */
export interface ApiModule {
  id: string;
  title: string;
  order: number;
  chapters: ApiChapter[];
}

/** Course from backend */
export interface ApiCourseResponse {
  id: string;
  title: string;
  topic: string;
  skill_level: string;
  learning_goal: string;
  duration_type: string;
  created_at: string;
  modules: ApiModule[];
}

export interface GenerateCourseResponse {
  course: ApiCourseResponse;
}

export interface GenerateCourseErrorResponse {
  error: string;
}

// --- Lessons (GET /lessons/:id, GET /lessons/:id/versions) ---

/** Response when lesson is still pending/generating (no content) */
export interface GetLessonGeneratingResponse {
  id: string;
  chapter_id: string;
  title: string;
  order: number;
  generation_status: 'pending' | 'generating';
  status: 'generating';
}

/** Response when lesson is ready (with content) or when requesting ?version=N */
export interface GetLessonReadyResponse {
  id: string;
  chapter_id: string;
  title: string;
  order: number;
  generation_status: string;
  content: Record<string, unknown>;
  estimated_minutes?: number;
  created_at: string;
  updated_at: string;
}

export type GetLessonResponse = GetLessonGeneratingResponse | GetLessonReadyResponse;

export interface GetLessonErrorResponse {
  error: string;
}

export interface LessonVersionItem {
  version: number;
  created_at: string;
  metadata?: Record<string, unknown>;
}

export interface GetLessonVersionsResponse {
  lesson_id: string;
  versions: LessonVersionItem[];
}

/**
 * Get a lesson by id. Optional version for older content.
 * When status is pending/generating, response has status: 'generating' and no content.
 */
export const getLesson = async (
  lessonId: string,
  version?: number
): Promise<GetLessonResponse> => {
  try {
    const params = version !== undefined ? { version } : {};
    const response = await apiClient.get<GetLessonResponse>(
      `/lessons/${lessonId}`,
      { params, timeout: 10000 }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<GetLessonErrorResponse>;
      if (axiosError.response) {
        throw {
          status: axiosError.response.status,
          message: axiosError.response.data?.error || 'Failed to load lesson',
        };
      } else if (axiosError.request) {
        throw {
          status: 0,
          message: 'Network error. Please check your connection.',
        };
      }
    }
    throw {
      status: 500,
      message: 'An unexpected error occurred',
    };
  }
};

/**
 * List content versions for a lesson (for "revisit older version" UI).
 */
export const getLessonVersions = async (
  lessonId: string
): Promise<GetLessonVersionsResponse> => {
  try {
    const response = await apiClient.get<GetLessonVersionsResponse>(
      `/lessons/${lessonId}/versions`,
      { timeout: 10000 }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<GetLessonErrorResponse>;
      if (axiosError.response) {
        throw {
          status: axiosError.response.status,
          message: axiosError.response.data?.error || 'Failed to load versions',
        };
      } else if (axiosError.request) {
        throw {
          status: 0,
          message: 'Network error. Please check your connection.',
        };
      }
    }
    throw {
      status: 500,
      message: 'An unexpected error occurred',
    };
  }
};

/**
 * Generate a course via backend AI.
 * Uses longer timeout (90s). Sends topic and options (defaults applied on server if omitted).
 */
export const generateCourse = async (
  topic: string,
  options?: { skill_level?: string; time_commitment?: string; learning_goal?: string }
): Promise<GenerateCourseResponse> => {
  try {
    const response = await apiClient.post<GenerateCourseResponse>(
      '/generation/generateCourse',
      { topic: topic.trim(), options: options ?? {} },
      { timeout: 90000 }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<GenerateCourseErrorResponse>;
      if (axiosError.response) {
        throw {
          status: axiosError.response.status,
          message: axiosError.response.data?.error || 'Failed to generate course',
        };
      } else if (axiosError.request) {
        throw {
          status: 0,
          message: 'Network error. Please check your connection.',
        };
      }
    }
    throw {
      status: 500,
      message: 'An unexpected error occurred',
    };
  }
};
