import { BorderRadius, Breakpoints, Shadows, Sizes, Spacing, Typography } from "@/constants/layout";
import { getAppColors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Platform, StyleSheet, Text, View, useWindowDimensions } from "react-native";

interface StepProps {
  title: string;
  description: string;
  colors: ReturnType<typeof getAppColors>;
}

function Step({ title, description, colors }: StepProps) {
  return (
    <View style={styles.step}>
      {/* Visual / Icon Placeholder */}
      <View
        style={[
          styles.stepVisual,
          {
            backgroundColor: colors.surfaceElevated,
            borderColor: colors.borderLight,
          },
        ]}
      >
        <Text
          style={[
            styles.stepVisualText,
            {
              color: colors.textTertiary,
            },
          ]}
        >
          Visual
        </Text>
      </View>

      {/* Step Content */}
      <View style={styles.stepContent}>
        <Text
          style={[
            styles.stepTitle,
            {
              color: colors.textPrimary,
            },
          ]}
        >
          {title}
        </Text>
        <Text
          style={[
            styles.stepDescription,
            {
              color: colors.textSecondary,
            },
          ]}
        >
          {description}
        </Text>
      </View>
    </View>
  );
}

export default function HowItWorks() {
  const colorScheme = useColorScheme();
  const colors = getAppColors(colorScheme);
  const { width } = useWindowDimensions();
  const isDesktop = width >= Breakpoints.lg;

  const steps = [
    {
      title: "Describe Your Goal",
      description: "Simply explain what you want to learn. No planning required—just tell us your goal.",
    },
    {
      title: "AI Builds the Course",
      description: "Get a complete learning path with organized modules, chapters, and clear objectives.",
    },
    {
      title: "Learn, Track, Regenerate",
      description: "Track your progress, check off completed items, and regenerate any section as needed.",
    },
  ];

  return (
    <View
      style={[
        styles.howItWorksSection,
        {
          backgroundColor: colors.background,
        },
      ]}
    >
      <View style={styles.container}>
        {/* Section Header */}
        <View style={styles.header}>
          <Text
            style={[
              styles.sectionHeading,
              {
                color: colors.textPrimary,
              },
            ]}
          >
            How it works
          </Text>
          <Text
            style={[
              styles.sectionSubheading,
              {
                color: colors.textSecondary,
              },
            ]}
          >
            Create a complete learning path in minutes
          </Text>
        </View>

        {/* Steps */}
        <View
          style={[
            styles.stepsContainer,
            isDesktop ? styles.stepsContainerDesktop : styles.stepsContainerMobile,
          ]}
        >
          {steps.map((step, index) => (
            <View key={index} style={styles.stepWrapper}>
              <Step
                title={step.title}
                description={step.description}
                colors={colors}
              />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  howItWorksSection: {
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
  header: {
    alignItems: "center",
    ...Platform.select({
      web: {
        marginBottom: Spacing["4xl"],
      },
      default: {
        marginBottom: Spacing["2xl"],
      },
    }),
  },
  sectionHeading: {
    fontFamily: Typography.h2.fontFamily,
    fontWeight: Typography.h2.fontWeight,
    letterSpacing: Typography.h2.letterSpacing,
    marginBottom: Spacing.md,
    textAlign: "center",
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
  sectionSubheading: {
    fontFamily: Typography.body.fontFamily,
    fontWeight: Typography.body.fontWeight,
    letterSpacing: Typography.body.letterSpacing,
    textAlign: "center",
    ...Platform.select({
      web: {
        maxWidth: (Sizes.maxContentWidth || 1400) * 0.5,
        fontSize: Typography.body.fontSize,
        lineHeight: Typography.body.fontSize * 1.6,
      },
      default: {
        fontSize: Typography.body.fontSize,
        lineHeight: Typography.body.fontSize * 1.6,
      },
    }),
  },
  stepsContainer: {
    width: "100%",
  },
  stepsContainerDesktop: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-start",
    gap: Spacing.xl,
  },
  stepsContainerMobile: {
    flexDirection: "column",
    gap: Spacing["2xl"],
  },
  stepWrapper: {
    ...Platform.select({
      web: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      },
      default: {
        width: "100%",
      },
    }),
  },
  step: {
    flex: 1,
    alignItems: "center",
    ...Platform.select({
      web: {
        width: 350,
      },
      default: {
        width: "100%",
      },
    }),
  },
  stepVisual: {
    aspectRatio: 16 / 9,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
    ...Platform.select({
      web: {
        ...Shadows?.sm,
        width: 300,
        alignSelf: "center",
      },
      default: {
        width: "100%",
      },
    }),
  },
  stepVisualText: {
    fontFamily: Typography.caption.fontFamily,
    fontWeight: Typography.caption.fontWeight,
    fontSize: Typography.caption.fontSize,
    letterSpacing: Typography.caption.letterSpacing,
  },
  stepContent: {
    alignItems: "center",
    width: "100%",
  },
  stepTitle: {
    fontFamily: Typography.h4.fontFamily,
    fontWeight: Typography.h4.fontWeight,
    fontSize: Typography.h4.fontSize,
    lineHeight: Typography.h4.lineHeight,
    letterSpacing: Typography.h4.letterSpacing,
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  stepDescription: {
    fontFamily: Typography.body.fontFamily,
    fontWeight: Typography.body.fontWeight,
    fontSize: Typography.body.fontSize,
    lineHeight: Typography.body.fontSize * 1.5,
    letterSpacing: Typography.body.letterSpacing,
    textAlign: "center",
    ...Platform.select({
      web: {
        maxWidth: 280,
      },
      default: {
        maxWidth: "100%",
      },
    }),
  },
});
