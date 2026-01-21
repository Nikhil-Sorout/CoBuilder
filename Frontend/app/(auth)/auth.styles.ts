import {
  BorderRadius,
  Spacing,
  Typography,
} from "@/constants/layout";
import { StyleSheet } from "react-native";

export const authStyles = StyleSheet.create({
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
    paddingTop: Spacing['3xl'],
    alignSelf: 'center',
    width: '100%',
    maxWidth: 400,
  },
  header: {
    marginBottom: Spacing['3xl'],
  },
  title: {
    ...Typography.h1,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.body,
  },
  form: {
    gap: Spacing.lg,
  },
  inputContainer: {
    gap: Spacing.sm,
  },
  label: {
    ...Typography.label,
  },
  input: {
    ...Typography.body,
    width: '100%',
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: Typography.body.fontSize,
  },
  primaryButton: {
    width: '100%',
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.md,
  },
  primaryButtonText: {
    ...Typography.button,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: Spacing.lg,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    ...Typography.caption,
    paddingHorizontal: Spacing.md,
  },
  googleButton: {
    width: '100%',
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    gap: Spacing.sm,
    flexDirection: "row",
  },
  googleButtonContainer: {
    width: '100%',
    alignItems: "center",
    justifyContent: "center",
    // height: 20
  },
  googleButtonText: {
    ...Typography.button,
  },
  // Container styles for both login and sign up links
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: Spacing.lg,
  },
  loginText: {
    ...Typography.body,
  },
  loginLink: {
    ...Typography.button,
    textDecorationLine: "underline",
  },
  signUpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: Spacing.lg,
  },
  signUpText: {
    ...Typography.body,
  },
  signUpLink: {
    ...Typography.button,
    textDecorationLine: "underline",
  },
  errorText: {
    ...Typography.caption,
    marginTop: Spacing.xs,
  },
});

