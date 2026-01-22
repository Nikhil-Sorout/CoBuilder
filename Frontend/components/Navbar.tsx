import { BorderRadius, PlatformUtils, Sizes, Spacing, Typography, ZIndex } from "@/constants/layout";
import { getAppColors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { router } from "expo-router";
import { Platform, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from "react-native";

export default function Navbar() {
  const colorScheme = useColorScheme();
  const colors = getAppColors(colorScheme);
  const isWeb = PlatformUtils.isWeb;
  const { width } = useWindowDimensions();
  const showCenterNav = isWeb && width >= 750;

  const handleLogoPress = () => {
    router.push("/");
  };

  const handleLoginPress = () => {
    router.push("/(auth)/login");
  };

  const handleGenerateCoursePress = () => {
    // Will add scroll functionality later
    console.log("Generate Course clicked");
  };

  const handleNavItemPress = (item: string) => {
    // Will add scroll functionality later
    console.log(`${item} clicked`);
  };

  return (
    <View
      style={[
        styles.navbar,
        {
          backgroundColor: colors.background,
          borderBottomColor: colors.border,
        },
      ]}
    >
      <View style={styles.container}>
        {/* Left: Logo / App name */}
        <TouchableOpacity
          onPress={handleLogoPress}
          style={styles.logoContainer}
          activeOpacity={0.7}
        >
          <Text style={[styles.logoText, { color: colors.textPrimary }]}>
            CoBuilder
          </Text>
        </TouchableOpacity>

        {/* Center: Navigation items (Web only, visible above 750px) */}
        {showCenterNav && (
          <View style={styles.centerNav}>
            <TouchableOpacity
              onPress={() => handleNavItemPress("Product")}
              style={styles.navItem}
              activeOpacity={0.7}
            >
              <Text style={[styles.navItemText, { color: colors.textSecondary }]}>
                Product
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleNavItemPress("How it Works")}
              style={styles.navItem}
              activeOpacity={0.7}
            >
              <Text style={[styles.navItemText, { color: colors.textSecondary }]}>
                How it Works
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleNavItemPress("Pricing")}
              style={styles.navItem}
              activeOpacity={0.7}
            >
              <Text style={[styles.navItemText, { color: colors.textSecondary }]}>
                Pricing
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Right: Login and CTA */}
        <View style={styles.rightNav}>
          <TouchableOpacity
            onPress={handleLoginPress}
            style={styles.loginButton}
            activeOpacity={0.7}
          >
            <Text style={[styles.loginText, { color: colors.textPrimary }]}>
              Login
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleGenerateCoursePress}
            style={[
              styles.ctaButton,
              {
                backgroundColor: colors.primary,
              },
            ]}
            activeOpacity={0.8}
          >
            <Text style={[styles.ctaText, { color: colors.textInverse }]}>
              Generate Course
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    width: "100%",
    borderBottomWidth: 1,
    zIndex: ZIndex.sticky,
    ...Platform.select({
      web: {
        position: "sticky" as const,
        top: 0,
      },
      default: {
        position: "relative" as const,
      },
    }),
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    ...Platform.select({
      web: {
        maxWidth: Sizes.maxContentWidth || 1400,
        alignSelf: "center",
        width: "100%",
      },
      default: {
        width: "100%",
      },
    }),
  },
  logoContainer: {
    flexShrink: 0,
  },
  logoText: {
    fontFamily: Typography.h4.fontFamily,
    fontWeight: "700",
    fontSize: Typography.h4.fontSize,
    lineHeight: Typography.h4.lineHeight,
    letterSpacing: Typography.h4.letterSpacing,
  },
  centerNav: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xl,
    flex: 1,
    justifyContent: "center",
    ...Platform.select({
      web: {
        display: "flex",
      },
      default: {
        display: "none",
      },
    }),
  },
  navItem: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  navItemText: {
    fontFamily: Typography.body.fontFamily,
    fontWeight: Typography.body.fontWeight,
    fontSize: Typography.body.fontSize,
    lineHeight: Typography.body.lineHeight,
    letterSpacing: Typography.body.letterSpacing,
  },
  rightNav: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    flexShrink: 1,
  },
  loginButton: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
  },
  loginText: {
    fontFamily: Typography.body.fontFamily,
    fontWeight: Typography.body.fontWeight,
    fontSize: Typography.body.fontSize,
    lineHeight: Typography.body.lineHeight,
    letterSpacing: Typography.body.letterSpacing,
  },
  ctaButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    ...Platform.select({
      web: {
        minHeight: 40,
      },
      default: {
        minHeight: 44,
      },
    }),
  },
  ctaText: {
    fontFamily: Typography.button.fontFamily,
    fontWeight: Typography.button.fontWeight,
    fontSize: Typography.button.fontSize,
    lineHeight: Typography.button.lineHeight,
    letterSpacing: Typography.button.letterSpacing,
    color: "#ffffff",
  },
});
