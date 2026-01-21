import { PlatformUtils, Spacing } from "@/constants/layout";
import { getAppColors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { router, useLocalSearchParams } from "expo-router";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { authStyles as styles } from "./auth.styles";

export default function Verification() {
  const colorScheme = useColorScheme();
  const colors = getAppColors(colorScheme);
  const { email, emailSent } = useLocalSearchParams<{
    email: string;
    emailSent: string;
  }>();

  const isEmailSent = emailSent === "true";

  const handleBackToLogin = () => {
    router.replace("/(auth)/login");
  };

  const handleTryAgain = () => {
    router.back();
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
              {isEmailSent ? "Check Your Email" : "Email Not Sent"}
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {isEmailSent
                ? "We've sent a verification link to your email"
                : "We couldn't send the verification email"}
            </Text>
          </View>

          {/* Content */}
          <View style={styles.form}>
            {isEmailSent ? (
              <>
                {/* Email Display */}
                <View
                  style={[
                    styles.inputContainer,
                    {
                      backgroundColor: colors.surface,
                      padding: Spacing.md,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.label,
                      { color: colors.textSecondary, marginBottom: 4 },
                    ]}
                  >
                    Email Address
                  </Text>
                  <Text style={[styles.subtitle, { color: colors.textPrimary }]}>
                    {email}
                  </Text>
                </View>

                {/* Instructions */}
                <View style={styles.inputContainer}>
                  <Text
                    style={[
                      styles.subtitle,
                      { color: colors.textSecondary, textAlign: "center" },
                    ]}
                  >
                    Please check your email and click on the verification link to
                    activate your account. The link will expire in 24 hours.
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
                    style={[
                      styles.primaryButtonText,
                      { color: colors.textInverse },
                    ]}
                  >
                    Back to Login
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                {/* Error Message */}
                <View style={styles.inputContainer}>
                  <Text
                    style={[
                      styles.subtitle,
                      { color: colors.textSecondary, textAlign: "center" },
                    ]}
                  >
                    We encountered an issue sending the verification email to:
                  </Text>
                  <View
                    style={[
                      styles.inputContainer,
                      {
                        backgroundColor: colors.surface,
                        padding: Spacing.md,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: colors.error || "#ef4444",
                        marginTop: Spacing.sm,
                      },
                    ]}
                  >
                    <Text style={[styles.subtitle, { color: colors.textPrimary }]}>
                      {email}
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
                    Please contact customer support or try signing up again with a
                    different email address.
                  </Text>
                </View>

                {/* Action Buttons */}
                <TouchableOpacity
                  style={[
                    styles.primaryButton,
                    {
                      backgroundColor: colors.primary,
                      minHeight: PlatformUtils.minTouchTarget,
                    },
                  ]}
                  onPress={handleTryAgain}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.primaryButtonText,
                      { color: colors.textInverse },
                    ]}
                  >
                    Try Again
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.googleButton,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      minHeight: PlatformUtils.minTouchTarget,
                    },
                  ]}
                  onPress={handleBackToLogin}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.googleButtonText,
                      { color: colors.textPrimary },
                    ]}
                  >
                    Back to Login
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
