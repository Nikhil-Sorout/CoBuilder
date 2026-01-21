export interface ValidationResult {
  isValid: boolean;
  errors: {
    username?: string;
    email?: string;
    password?: string;
  };
}

/**
 * Validates email format
 * @param email - Email address to validate
 * @returns Error message if invalid, undefined if valid
 */
function validateEmail(email: string): string | undefined {
  if (!email || email.trim().length === 0) {
    return "Email is required";
  }

  // Basic email regex pattern
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email.trim())) {
    return "Enter a valid email address";
  }

  return undefined;
}

/**
 * Validates username format
 * @param username - Username to validate
 * @returns Error message if invalid, undefined if valid
 */
function validateUsername(username: string): string | undefined {
  if (!username || username.trim().length === 0) {
    return "Username is required";
  }

  const trimmedUsername = username.trim();

  // Minimum length check
  if (trimmedUsername.length < 3) {
    return "Username must be at least 3 characters";
  }

  // Maximum length check
  if (trimmedUsername.length > 20) {
    return "Username must be less than 20 characters";
  }

  // Check for valid characters (alphanumeric, underscore, hyphen)
  const usernameRegex = /^[a-zA-Z0-9_-]+$/;
  if (!usernameRegex.test(trimmedUsername)) {
    return "Username can only contain letters, numbers, underscores, and hyphens";
  }

  return undefined;
}

/**
 * Validates password strength
 * @param password - Password to validate
 * @returns Error message if invalid, undefined if valid
 */
function validatePassword(password: string): string | undefined {
  if (!password || password.length === 0) {
    return "Password is required";
  }

  const errors: string[] = [];

  // Minimum length check
  if (password.length < 8) {
    errors.push("Password is too short (minimum 8 characters)");
  }

  // Check for uppercase letter
  if (!/[A-Z]/.test(password)) {
    errors.push("Include uppercase letters");
  }

  // Check for lowercase letter
  if (!/[a-z]/.test(password)) {
    errors.push("Include lowercase letters");
  }

  // Check for number
  if (!/[0-9]/.test(password)) {
    errors.push("Include numbers");
  }

  // Check for special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push("Include special characters to increase strength");
  }

  // Return the first error or undefined if all checks pass
  return errors.length > 0 ? errors[0] : undefined;
}

/**
 * Validates username, email and password fields
 * @param username - Username to validate (optional for login)
 * @param email - Email address to validate
 * @param password - Password to validate
 * @returns ValidationResult with isValid flag and error messages
 */
export function validateAuthFields(
  email: string,
  password: string,
  username?: string
): ValidationResult {
  const usernameError = username !== undefined ? validateUsername(username) : undefined;
  const emailError = validateEmail(email);
  const passwordError = validatePassword(password);

  return {
    isValid: !usernameError && !emailError && !passwordError,
    errors: {
      username: usernameError,
      email: emailError,
      password: passwordError,
    },
  };
}
