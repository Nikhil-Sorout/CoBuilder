import { BorderRadius, Breakpoints, Shadows, Sizes, Spacing, Typography } from "@/constants/layout";
import { getAppColors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Platform, StyleSheet, Text, View, useWindowDimensions } from "react-native";

interface FeaturesProps{
  setSectionPosition: (section: string, pos: number) => void;
}

interface FeatureCardProps {
  headline: string;
  description: string;
  colors: ReturnType<typeof getAppColors>;
  cardWidth?: number | string;
}

function FeatureCard({ headline, description, colors, cardWidth }: FeatureCardProps & { cardWidth?: number | string }) {
  return (
    <View
      style={[
        styles.featureCard,
        cardWidth ? { width: cardWidth as any } : undefined,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      {/* Icon / Visual Placeholder */}
      <View
        style={[
          styles.iconPlaceholder,
          {
            backgroundColor: colors.surfaceElevated,
            borderColor: colors.borderLight,
          },
        ]}
      >
        <Text
          style={[
            styles.iconPlaceholderText,
            {
              color: colors.textTertiary,
            },
          ]}
        >
          Icon
        </Text>
      </View>

      {/* Headline */}
      <Text
        style={[
          styles.featureHeadline,
          {
            color: colors.textPrimary,
          },
        ]}
      >
        {headline}
      </Text>

      {/* Description */}
      <Text
        style={[
          styles.featureDescription,
          {
            color: colors.textSecondary,
          },
        ]}
      >
        {description}
      </Text>
    </View>
  );
}

export default function Features({setSectionPosition}: FeaturesProps) {
  const colorScheme = useColorScheme();
  const colors = getAppColors(colorScheme);
  const { width } = useWindowDimensions();
  const containerPadding = Spacing.lg * 2; // left + right padding
  const maxContentWidth = (Sizes.maxContentWidth || 1400) + containerPadding;
  const availableWidth = Math.min(width, maxContentWidth) - containerPadding;
  
  const isTabletSize = width >= Breakpoints.md && width < Breakpoints.lg;
  const isDesktop = width >= Breakpoints.lg;

  // Calculate card width based on screen size
  const getCardWidth = () => {
    if (isDesktop) {
      // 4 cards per row: (availableWidth - 3 gaps of Spacing.xl) / 4
      const gapTotal = Spacing.xl * 3;
      const cardWidth = (availableWidth - gapTotal) / 4;
      return Math.max(cardWidth, 250); // Ensure minimum width
    } else if (isTabletSize) {
      // 2 cards per row: (availableWidth - 1 gap of Spacing.lg) / 2
      const gapTotal = Spacing.lg;
      const cardWidth = (availableWidth - gapTotal) / 2;
      return Math.max(cardWidth, 250); // Ensure minimum width
    } else {
      // Mobile: full width
      return "100%";
    }
  };

  const cardWidth = getCardWidth();

  const features = [
    {
      headline: "Prompt → Structured Course",
      description: "Transform a simple idea into a complete learning path with organized modules and chapters.",
    },
    {
      headline: "Regenerate Any Module",
      description: "Fine-tune any section that doesn't fit your needs with instant regeneration.",
    },
    {
      headline: "Visual Progress Tracking",
      description: "See your completion percentage, streaks, and modules finished at a glance.",
    },
    {
      headline: "Multiple Courses, One Dashboard",
      description: "Manage all your learning paths from a single, organized dashboard.",
    },
  ];

  return (
    <View
      onLayout={(event) => setSectionPosition("Features", event.nativeEvent.layout.y)}
      style={[
        styles.featuresSection,
        {
          backgroundColor: colors.surface,
        },
      ]}
    >
      <View style={styles.container}>
        {/* Section Header */}
        <View style={styles.header}>
          <Text
            style={[
              styles.sectionTitle,
              {
                color: colors.textPrimary,
              },
            ]}
          >
            Everything you need to learn
          </Text>
          <Text
            style={[
              styles.sectionSubtitle,
              {
                color: colors.textSecondary,
              },
            ]}
          >
            Built for learners who want structure, control, and clarity.
          </Text>
        </View>

        {/* Features Grid */}
        <View
          style={[
            styles.grid,
            isDesktop && styles.gridDesktop,
            isTabletSize && styles.gridTablet,
            !isDesktop && !isTabletSize && styles.gridMobile,
          ]}
        >
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              headline={feature.headline}
              description={feature.description}
              colors={colors}
              cardWidth={cardWidth}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  featuresSection: {
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
    paddingHorizontal: Spacing.md,
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
  sectionTitle: {
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
  sectionSubtitle: {
    fontFamily: Typography.body.fontFamily,
    fontWeight: Typography.body.fontWeight,
    letterSpacing: Typography.body.letterSpacing,
    textAlign: "center",
    ...Platform.select({
      web: {
        maxWidth: (Sizes.maxContentWidth || 1400) * 0.5, // 50% of max content width for optimal reading
        fontSize: Typography.body.fontSize,
        lineHeight: Typography.body.fontSize * 1.6,
      },
      default: {
        fontSize: Typography.body.fontSize,
        lineHeight: Typography.body.fontSize * 1.6,
      },
    }),
  },
  grid: {
    width: "100%",
  },
  gridDesktop: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    justifyContent: "center",
  },
  gridTablet: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.lg,
    justifyContent: "flex-start",
  },
  gridMobile: {
    flexDirection: "column",
    gap: Spacing.lg,
  },
  featureCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    ...Platform.select({
      web: {
        ...Shadows?.sm,
        minHeight: 200,
        minWidth: 250,
      },
      default: {
        minHeight: 180,
      },
    }),
  },
  iconPlaceholder: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
    ...Platform.select({
      web: {
        width: Sizes.iconSize["2xl"],
        height: Sizes.iconSize["2xl"],
      },
      default: {
        width: Sizes.iconSize.xl,
        height: Sizes.iconSize.xl,
      },
    }),
  },
  iconPlaceholderText: {
    fontFamily: Typography.caption.fontFamily,
    fontWeight: Typography.caption.fontWeight,
    fontSize: Typography.caption.fontSize,
    letterSpacing: Typography.caption.letterSpacing,
  },
  featureHeadline: {
    fontFamily: Typography.h4.fontFamily,
    fontWeight: Typography.h4.fontWeight,
    fontSize: Typography.h4.fontSize,
    lineHeight: Typography.h4.lineHeight,
    letterSpacing: Typography.h4.letterSpacing,
    marginBottom: Spacing.sm,
  },
  featureDescription: {
    fontFamily: Typography.body.fontFamily,
    fontWeight: Typography.body.fontWeight,
    fontSize: Typography.body.fontSize,
    lineHeight: Typography.body.fontSize * 1.5,
    letterSpacing: Typography.body.letterSpacing,
  },
});
