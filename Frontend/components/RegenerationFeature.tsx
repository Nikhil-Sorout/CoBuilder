import { BorderRadius, FontSizes, Shadows, Sizes, Spacing, Typography } from "@/constants/layout";
import { getAppColors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Platform, StyleSheet, Text, View } from "react-native";

interface RegenerationFeatureProps{
  setSectionPosition: (section: string, pos: number) => void;
}

export default function RegenerationFeature({setSectionPosition}: RegenerationFeatureProps) {
  const colorScheme = useColorScheme();
  const colors = getAppColors(colorScheme);

  return (
    <View
      onLayout={(event) => setSectionPosition("regenerationFeature", event.nativeEvent.layout.y)}
      style={[
        styles.section,
        {
          backgroundColor: colors.surface,
        },
      ]}
    >
      <View style={styles.container}>
        <View style={styles.contentWrapper}>
          {/* Left Side - Messaging */}
          <View style={styles.leftColumn}>
            <Text
              style={[
                styles.heading,
                {
                  color: colors.textPrimary,
                },
              ]}
            >
              Refine any part of your course, instantly
            </Text>
            <Text
              style={[
                styles.subheading,
                {
                  color: colors.textSecondary,
                },
              ]}
            >
              Courses don&apos;t always fit your exact needs. Adjust any module with a simple instruction—no need to start over or accept what doesn&apos;t work for you.
            </Text>
          </View>

          {/* Right Side - Regeneration Flow Visual */}
          <View style={styles.rightColumn}>
            <View
              style={[
                styles.flowVisual,
                {
                  backgroundColor: colors.surfaceElevated,
                  borderColor: colors.borderLight,
                },
              ]}
            >
              <Text
                style={[
                  styles.visualPlaceholderText,
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
        minWidth: (Sizes.maxContentWidth || 1400) * 0.2,
        flexBasis: "40%",
      },
      default: {
        width: "100%",
      },
    }),
  },
  heading: {
    fontFamily: Typography.h2.fontFamily,
    fontWeight: Typography.h2.fontWeight,
    letterSpacing: Typography.h2.letterSpacing,
    marginBottom: Spacing.lg,
    ...Platform.select({
      web: {
        fontSize: Typography.h1.fontSize,
        lineHeight: Typography.h1.lineHeight,
      },
      default: {
        fontSize: Typography.h2.fontSize,
        lineHeight: Typography.h2.lineHeight,
      },
    }),
  },
  subheading: {
    fontFamily: Typography.body.fontFamily,
    fontWeight: Typography.body.fontWeight,
    letterSpacing: Typography.body.letterSpacing,
    ...Platform.select({
      web: {
        fontSize: FontSizes.lg,
        lineHeight: FontSizes.lg * 1.6,
      },
      default: {
        fontSize: Typography.body.fontSize,
        lineHeight: Typography.body.fontSize * 1.6,
      },
    }),
  },
  rightColumn: {
    ...Platform.select({
      web: {
        flexBasis: "50%",
        minWidth: (Sizes.maxContentWidth || 1400) * 0.2,
      },
      default: {
        width: "100%",
      },
    }),
  },
  flowVisual: {
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
  visualPlaceholderText: {
    fontFamily: Typography.body.fontFamily,
    fontWeight: Typography.body.fontWeight,
    fontSize: Typography.body.fontSize,
    letterSpacing: Typography.body.letterSpacing,
  },
});
