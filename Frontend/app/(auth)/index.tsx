import GoogleSignInWeb from "@/components/GoogleSignIn.web";
import { PlatformUtils } from "@/constants/layout";
import { getAppColors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { signup } from "@/utils/api";
import { validateAuthFields } from "@/utils/validation";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { authStyles as styles } from "./auth.styles";


export default function SignUp() {
  const colorScheme = useColorScheme();
  const colors = getAppColors(colorScheme);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [validationErrors, setValidationErrors] = useState<{
    username?: string;
    email?: string;
    password?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleUsernameChange = (text: string) => {
    setUsername(text);
    setApiError(null);
    const validation = validateAuthFields(email, password, text);
    setValidationErrors(validation.errors);
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    setApiError(null);
    const validation = validateAuthFields(text, password, username);
    setValidationErrors(validation.errors);
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    setApiError(null);
    const validation = validateAuthFields(email, text, username);
    setValidationErrors(validation.errors);
  };

  const isFormValid = () => {
    const validation = validateAuthFields(email, password, username);
    return validation.isValid;
  };

  const handleSignUp = async () => {
    const validation = validateAuthFields(email, password, username);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      setApiError(null);
      return;
    }

    setIsLoading(true);
    setApiError(null);
    setValidationErrors({});

    try {
      const response = await signup(username, email, password);
      
      // Check if the message indicates email was sent successfully
      const emailSentSuccessfully = 
        response.message.includes("check your email") ||
        response.message.includes("verification email");

      // Navigate to verification screen
      router.push({
        pathname: "/(auth)/verification",
        params: {
          email: email,
          emailSent: emailSentSuccessfully ? "true" : "false",
        },
      });
    } catch (error: any) {
      // Handle API errors
      if (error.status === 409) {
        // Conflict - email already exists
        setApiError(error.message || "User with this email already exists");
        // setValidationErrors({
        //   email: error.message || "User with this email already exists",
        // });
      } else if (error.status === 400) {
        // Bad request - validation error from server
        setApiError(error.message || "Invalid input. Please check your details.");
        // Try to map server errors to field errors
        if (error.message?.toLowerCase().includes("username")) {
          setValidationErrors({ username: error.message });
        } else if (error.message?.toLowerCase().includes("email")) {
          setValidationErrors({ email: error.message });
        } else if (error.message?.toLowerCase().includes("password")) {
          setValidationErrors({ password: error.message });
        }
      } else {
        // Other errors (500, network, etc.)
        setApiError(error.message || "An error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    // Handle Google sign in logic here
    console.log("Google sign in");
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
              Create Account
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Sign up to get started
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Username Input */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.textPrimary }]}>
                Username
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.input,
                    borderColor: validationErrors.username
                      ? colors.error || "#ef4444"
                      : colors.inputBorder,
                    color: colors.textPrimary,
                  },
                ]}
                placeholder="Enter your username"
                placeholderTextColor={colors.placeholder}
                value={username}
                onChangeText={handleUsernameChange}
                autoCapitalize="none"
                autoComplete="username"
              />
              {validationErrors.username && (
                <Text
                  style={[
                    styles.errorText,
                    { color: colors.error || "#ef4444" },
                  ]}
                >
                  {validationErrors.username}
                </Text>
              )}
            </View>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.textPrimary }]}>
                Email
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.input,
                    borderColor: validationErrors.email
                      ? colors.error || "#ef4444"
                      : colors.inputBorder,
                    color: colors.textPrimary,
                  },
                ]}
                placeholder="Enter your email"
                placeholderTextColor={colors.placeholder}
                value={email}
                onChangeText={handleEmailChange}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
              />
              {validationErrors.email && (
                <Text
                  style={[
                    styles.errorText,
                    { color: colors.error || "#ef4444" },
                  ]}
                >
                  {validationErrors.email}
                </Text>
              )}
            </View>
                

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.textPrimary }]}>
                Password
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.input,
                    borderColor: validationErrors.password
                      ? colors.error || "#ef4444"
                      : colors.inputBorder,
                    color: colors.textPrimary,
                  },
                ]}
                placeholder="Enter your password"
                placeholderTextColor={colors.placeholder}
                value={password}
                onChangeText={handlePasswordChange}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="password-new"
              />
              {validationErrors.password && (
                <Text
                  style={[
                    styles.errorText,
                    { color: colors.error || "#ef4444" },
                  ]}
                >
                  {validationErrors.password}
                </Text>
              )}
            </View>

            {/* API Error Message - Only show if there are no validation errors */}
            {apiError && Object.keys(validationErrors).length === 0 && (
              <View style={styles.inputContainer}>
                <Text
                  style={[
                    styles.errorText,
                    { color: colors.error || "#ef4444" },
                  ]}
                >
                  {apiError}
                </Text>
              </View>
            )}

            {/* Sign Up Button */}
            <TouchableOpacity
              style={[
                styles.primaryButton,
                {
                  backgroundColor: isFormValid() && !isLoading
                    ? colors.primary
                    : colors.primary + "80", // Add opacity for disabled state
                  minHeight: PlatformUtils.minTouchTarget,
                },
              ]}
              onPress={handleSignUp}
              activeOpacity={0.8}
              disabled={!isFormValid() || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.textInverse} />
              ) : (
                <Text style={[styles.primaryButtonText, { color: colors.textInverse }]}>
                  Sign Up
                </Text>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={[styles.divider, { backgroundColor: colors.divider }]} />
              <Text style={[styles.dividerText, { color: colors.textSecondary }]}>
                OR
              </Text>
              <View style={[styles.divider, { backgroundColor: colors.divider }]} />
            </View>

            {/* Google Sign In Button */}
            {Platform.OS === 'web' ? (
              <View style={styles.googleButtonContainer}>
                <GoogleSignInWeb />
              </View>
            ) : (
              <TouchableOpacity
                style={[
                  styles.googleButton,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    minHeight: PlatformUtils.minTouchTarget,
                  },
                ]}
                onPress={handleGoogleSignIn}
                activeOpacity={0.8}
              >
                <Text style={[styles.googleButtonText, { color: colors.textPrimary }]}>
                  Continue with Google 
                </Text>
                {/* <FontAwesome name="google" color={colors.textPrimary} size={FontSizes.md}/> */}
              </TouchableOpacity>
            )}

            {/* Login Link */}
            <View style={styles.loginContainer}>
              <Text style={[styles.loginText, { color: colors.textSecondary }]}>
                Already have an account?{" "}
              </Text>
              <TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
                <Text style={[styles.loginLink, { color: colors.primary }]}>
                  Login
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
