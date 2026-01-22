import { BorderRadius, FontSizes, Shadows, Sizes, Spacing, Typography } from "@/constants/layout";
import { getAppColors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface HeroProps{
  setSectionPosition: (section: string, pos: number) => void;
  scrollToSection: (section: string) => void;
}


export default function Hero({setSectionPosition, scrollToSection}: HeroProps) {
  const colorScheme = useColorScheme();
  const colors = getAppColors(colorScheme);

  const handleGenerateCoursePress = () => {
    // Will add behavior later
    scrollToSection("FinalCTA");
    console.log("Generate My Course clicked");
  };

  const handleSeeHowItWorksPress = () => {
    // Will add scroll behavior later
    scrollToSection("HowItWorks");
    console.log("See how it works clicked");
  };

  return (
    <View
      onLayout={(event) => setSectionPosition("Hero", event.nativeEvent.layout.y)}
      style={[
        styles.hero,
        {
          backgroundColor: colors.background,
        },
      ]}
    >
      <View style={styles.container}>
        {/* Two-column layout on desktop, single-column on mobile */}
        <View style={styles.contentWrapper}>
          {/* Left Column: Primary Content */}
          <View style={styles.leftColumn}>
            {/* Headline */}
            <Text
              style={[
                styles.headline,
                {
                  color: colors.textPrimary,
                },
              ]}
            >
              Build a complete, structured course from a single prompt.
            </Text>

            {/* Subheadline */}
            <Text
              style={[
                styles.subheadline,
                {
                  color: colors.textSecondary,
                },
              ]}
            >
              Create organized learning modules with chapters, checklists, and progress tracking—all automatically structured for you.
            </Text>

            {/* CTAs */}
            <View style={styles.ctaContainer}>
              {/* Primary CTA */}
              <TouchableOpacity
                onPress={handleGenerateCoursePress}
                style={[
                  styles.primaryCTA,
                  {
                    backgroundColor: colors.primary,
                  },
                ]}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.primaryCTAText,
                    {
                      color: colors.textInverse,
                    },
                  ]}
                >
                  Generate My Course
                </Text>
              </TouchableOpacity>

              {/* Secondary CTA */}
              <TouchableOpacity
                onPress={handleSeeHowItWorksPress}
                style={styles.secondaryCTA}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.secondaryCTAText,
                    {
                      color: colors.textSecondary,
                    },
                  ]}
                >
                  See how it works
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Right Column: Visual Proof (Placeholder) */}
          <View style={styles.rightColumn}>
            <View
              style={[
                styles.visualPlaceholder,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.placeholderText,
                  {
                    color: colors.textTertiary,
                  },
                ]}
              >
                Visual to come here
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    width: "100%",
    ...Platform.select({
      web: {
        minHeight: Sizes.screenHeight * 0.8, // ~80vh equivalent using screen height
      },
      default: {
        minHeight: Sizes.screenHeight * 0.5, // ~50vh equivalent for mobile
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
        paddingVertical: Spacing["4xl"],
      },
      default: {
        paddingVertical: Spacing["2xl"],
      },
    }),
  },
  contentWrapper: {
    flex: 1,
    flexWrap: "wrap",
    ...Platform.select({
      web: {
        flexDirection: "row",
        alignItems: "center",
        gap: Spacing["3xl"],
      },
      default: {
        flexDirection: "column",
        gap: Spacing.xl,
      },
    }),
  },
  leftColumn: {
    ...Platform.select({
      web: {
        minWidth: (Sizes.maxContentWidth || 1400) * 0.20,
        flexBasis: "40%"
      },
      default: {
        width: "100%",
      },
    }),
  },
  headline: {
    fontFamily: Typography.h1.fontFamily,
    fontWeight: Typography.h1.fontWeight,
    letterSpacing: Typography.h1.letterSpacing,
    marginBottom: Spacing.lg,
    ...Platform.select({
      web: {
        fontSize: FontSizes["5xl"],
        lineHeight: FontSizes["5xl"] * 1.17, // ~56px for 48px font
        maxWidth: (Sizes.maxContentWidth || 1400) * 0.5, // 50% of max content width for optimal reading
      },
      default: {
        fontSize: Typography.h1.fontSize,
        lineHeight: Typography.h1.lineHeight,
      },
    }),
  },
  subheadline: {
    fontFamily: Typography.body.fontFamily,
    fontWeight: Typography.body.fontWeight,
    letterSpacing: Typography.body.letterSpacing,
    marginBottom: Spacing["2xl"],
    ...Platform.select({
      web: {
        fontSize: FontSizes.lg,
        lineHeight: FontSizes.lg * 1.56, // ~28px for 18px font
      },
      default: {
        fontSize: Typography.body.fontSize,
        lineHeight: Typography.body.fontSize * 1.6,
      },
    }),
  },
  ctaContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.lg,
    flexWrap: "wrap",
  },
  primaryCTA: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
    ...Platform.select({
      web: {
        minHeight: 52,
        minWidth: 200,
      },
      default: {
        minHeight: Sizes.buttonHeight.md,
      },
    }),
  },
  primaryCTAText: {
    fontFamily: Typography.button.fontFamily,
    fontWeight: "600",
    letterSpacing: Typography.button.letterSpacing,
    ...Platform.select({
      web: {
        fontSize: FontSizes.base,
      },
      default: {
        fontSize: Typography.button.fontSize,
      },
    }),
  },
  secondaryCTA: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  secondaryCTAText: {
    fontFamily: Typography.body.fontFamily,
    fontWeight: Typography.body.fontWeight,
    letterSpacing: Typography.body.letterSpacing,
    ...Platform.select({
      web: {
        fontSize: FontSizes.base,
      },
      default: {
        fontSize: Typography.body.fontSize,
      },
    }),
  },
  rightColumn: {
    ...Platform.select({
      web: {
        minWidth: (Sizes.maxContentWidth || 1400) * 0.20,
        flexBasis: "50%"
      },
      default: {
        width: "100%",
        marginTop: Spacing.lg,
      },
    }),
  },
  visualPlaceholder: {
    width: "100%",
    aspectRatio: Platform.select({
      web: 4 / 3,
      default: 16 / 9,
    }),
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      web: {
        ...Shadows?.lg,
      },
      default: {
        ...Shadows?.md,
      },
    }),
  },
  placeholderText: {
    fontFamily: Typography.body.fontFamily,
    fontWeight: Typography.body.fontWeight,
    fontSize: Typography.body.fontSize,
    letterSpacing: Typography.body.letterSpacing,
  },
});
