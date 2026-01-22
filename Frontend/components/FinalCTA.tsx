import { BorderRadius, FontSizes, Shadows, Sizes, Spacing, Typography } from "@/constants/layout";
import { getAppColors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface FinalCTAProps{
  setSectionPosition: (section: string, pos: number) => void;
}

export default function FinalCTA({setSectionPosition}: FinalCTAProps) {
  const colorScheme = useColorScheme();
  const colors = getAppColors(colorScheme);

  const handleGenerateCourse = () => {
    // TODO: Navigate to course generation or sign up
    console.log("Generate course clicked");
  };

  return (
    <View
      onLayout={(event) => setSectionPosition("FinalCTA", event.nativeEvent.layout.y)}
      style={[
        styles.section,
        {
          backgroundColor: colors.surface,
        },
      ]}
    >
      <View style={styles.container}>
        <View style={styles.content}>
          {/* Headline */}
          <Text
            style={[
              styles.headline,
              {
                color: colors.textPrimary,
              },
            ]}
          >
            Start building your personalized course in seconds
          </Text>

          {/* Supporting Line */}
          <Text
            style={[
              styles.supportingLine,
              {
                color: colors.textSecondary,
              },
            ]}
          >
            Free to get started
          </Text>

          {/* Primary CTA Button */}
          <TouchableOpacity
            onPress={handleGenerateCourse}
            style={[
              styles.ctaButton,
              {
                backgroundColor: colors.primary,
              },
            ]}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.ctaButtonText,
                {
                  color: colors.textInverse,
                },
              ]}
            >
              Generate Your First Course — Free
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    width: "100%",
    ...Platform.select({
      web: {
        paddingVertical: Spacing["4xl"],
      },
      default: {
        paddingVertical: Spacing["3xl"],
      },
    }),
  },
  container: {
    width: "100%",
    paddingHorizontal: Spacing.lg,
    ...Platform.select({
      web: {
        maxWidth: Sizes.maxContentWidth || 1400,
        alignSelf: "center",
      },
      default: {
        width: "100%",
      },
    }),
  },
  content: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.lg,
  },
  headline: {
    fontFamily: Typography.h1.fontFamily,
    fontWeight: Typography.h1.fontWeight,
    letterSpacing: Typography.h1.letterSpacing,
    textAlign: "center",
    ...Platform.select({
      web: {
        fontSize: FontSizes["3xl"],
        lineHeight: FontSizes["3xl"] * 1.2,
        maxWidth: (Sizes.maxContentWidth || 1400) * 0.7,
      },
      default: {
        fontSize: Typography.h1.fontSize,
        lineHeight: Typography.h1.lineHeight,
        paddingHorizontal: Spacing.md,
      },
    }),
  },
  supportingLine: {
    fontFamily: Typography.body.fontFamily,
    fontWeight: Typography.body.fontWeight,
    fontSize: Typography.body.fontSize,
    lineHeight: Typography.body.fontSize * 1.4,
    letterSpacing: Typography.body.letterSpacing,
    textAlign: "center",
    ...Platform.select({
      web: {
        marginTop: -Spacing.xs,
      },
      default: {
        marginTop: -Spacing.sm,
      },
    }),
  },
  ctaButton: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    ...Shadows?.md,
    ...Platform.select({
      web: {
        minWidth: Sizes.buttonWidth.sm,
        maxWidth: (Sizes.maxContentWidth || 1400) * 0.5,
        // minHeight: Sizes.buttonHeight.sm,
      },
      default: {
        width: "100%",
        maxWidth: Sizes.buttonWidth.sm,
        // minHeight: Sizes.buttonHeight.lg,
      },
    }),
  },
  ctaButtonText: {
    fontFamily: Typography.button.fontFamily,
    fontWeight: "600",
    letterSpacing: Typography.button.letterSpacing,
    textAlign: "center",
    ...Platform.select({
      web: {
        fontSize: FontSizes.lg,
        lineHeight: FontSizes.lg * 1.2,
      },
      default: {
        fontSize: Typography.button.fontSize,
        lineHeight: Typography.button.fontSize * 1.2,
      },
    }),
  },
});
