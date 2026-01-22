import { BorderRadius, Breakpoints, Shadows, Sizes, Spacing, Typography } from "@/constants/layout";
import { getAppColors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Platform, StyleSheet, Text, View, useWindowDimensions } from "react-native";

interface AudienceTypesProps{
  setSectionPosition: (section: string, pos: number) => void;
}

interface AudienceCardProps {
  label: string;
  benefit: string;
  colors: ReturnType<typeof getAppColors>;
}

function AudienceCard({ label, benefit, colors }: AudienceCardProps) {
  return (
    <View
      style={[
        styles.audienceCard,
        {
          backgroundColor: colors.surface,
          borderColor: colors.borderLight,
        },
      ]}
    >
      {/* Icon / Illustration Placeholder */}
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

      {/* Audience Label */}
      <Text
        style={[
          styles.audienceLabel,
          {
            color: colors.textPrimary,
          },
        ]}
      >
        {label}
      </Text>

      {/* Benefit Line */}
      <Text
        style={[
          styles.benefitText,
          {
            color: colors.textSecondary,
          },
        ]}
      >
        {benefit}
      </Text>
    </View>
  );
}

const AUDIENCE_TYPES = [
  {
    label: "Students",
    benefit: "Exam prep and structured learning with clear progress tracking",
  },
  {
    label: "Job Switchers",
    benefit: "Role-specific learning paths with practical, focused content",
  },
  {
    label: "Developers",
    benefit: "Deep dives into custom topics with iterative learning",
  },
  {
    label: "Professionals Upskilling",
    benefit: "Time-efficient, targeted learning with measurable progress",
  },
  {
    label: "Self-Learners",
    benefit: "Explore freely with full control and built-in motivation",
  },
];

export default function AudienceTypes({setSectionPosition}: AudienceTypesProps) {
  const colorScheme = useColorScheme();
  const colors = getAppColors(colorScheme);
  const { width } = useWindowDimensions();
  const isDesktop = width >= Breakpoints.lg;
  const isTablet = width >= Breakpoints.md && width < Breakpoints.lg;

  return (
    <View
      onLayout={(event) => setSectionPosition("audienceTypes", event.nativeEvent.layout.y)}
      style={[
        styles.section,
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
              styles.heading,
              {
                color: colors.textPrimary,
              },
            ]}
          >
            Built for all kinds of learners
          </Text>
          <Text
            style={[
              styles.subheading,
              {
                color: colors.textSecondary,
              },
            ]}
          >
            Whether you&apos;re starting out or upskilling, find your path forward
          </Text>
        </View>

        {/* Audience Cards Grid */}
        <View
          style={[
            styles.cardsContainer,
            isDesktop ? styles.cardsContainerDesktop : isTablet ? styles.cardsContainerTablet : styles.cardsContainerMobile,
          ]}
        >
          {AUDIENCE_TYPES.map((audience, index) => (
            <View
              key={index}
              style={[
                styles.cardWrapper,
                isDesktop && styles.cardWrapperDesktop,
                isTablet && styles.cardWrapperTablet,
              ]}
            >
              <AudienceCard
                label={audience.label}
                benefit={audience.benefit}
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
  header: {
    alignItems: "center",
    ...Platform.select({
      web: {
        marginBottom: Spacing["3xl"],
      },
      default: {
        marginBottom: Spacing["2xl"],
      },
    }),
  },
  heading: {
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
  subheading: {
    fontFamily: Typography.body.fontFamily,
    fontWeight: Typography.body.fontWeight,
    letterSpacing: Typography.body.letterSpacing,
    textAlign: "center",
    ...Platform.select({
      web: {
        maxWidth: (Sizes.maxContentWidth || 1400) * 0.6,
        fontSize: Typography.body.fontSize,
        lineHeight: Typography.body.fontSize * 1.6,
      },
      default: {
        fontSize: Typography.body.fontSize,
        lineHeight: Typography.body.fontSize * 1.6,
      },
    }),
  },
  cardsContainer: {
    width: "100%",
  },
  cardsContainerDesktop: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: Spacing.xl,
  },
  cardsContainerTablet: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: Spacing.lg,
  },
  cardsContainerMobile: {
    flexDirection: "column",
    gap: Spacing.lg,
  },
  cardWrapper: {
    width: "100%",
  },
  cardWrapperDesktop: {
    flex: 1,
    minWidth: (Sizes.maxContentWidth || 1400) * 0.25,
    maxWidth: (Sizes.maxContentWidth || 1400) * 0.3,
  },
  cardWrapperTablet: {
    flex: 1,
    minWidth: (Sizes.maxContentWidth || 1400) * 0.35,
    maxWidth: (Sizes.maxContentWidth || 1400) * 0.48,
  },
  audienceCard: {
    width: "100%",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    alignItems: "center",
    ...Platform.select({
      web: {
        ...Shadows?.sm,
      },
      default: {
        ...Shadows?.sm,
      },
    }),
  },
  iconPlaceholder: {
    width: Sizes.iconSize.xl,
    height: Sizes.iconSize.xl,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  iconPlaceholderText: {
    fontFamily: Typography.caption.fontFamily,
    fontWeight: Typography.caption.fontWeight,
    fontSize: Typography.caption.fontSize,
    letterSpacing: Typography.caption.letterSpacing,
  },
  audienceLabel: {
    fontFamily: Typography.h4.fontFamily,
    fontWeight: Typography.h4.fontWeight,
    fontSize: Typography.h4.fontSize,
    lineHeight: Typography.h4.lineHeight,
    letterSpacing: Typography.h4.letterSpacing,
    marginBottom: Spacing.xs,
    textAlign: "center",
  },
  benefitText: {
    fontFamily: Typography.body.fontFamily,
    fontWeight: Typography.body.fontWeight,
    fontSize: Typography.body.fontSize,
    lineHeight: Typography.body.fontSize * 1.5,
    letterSpacing: Typography.body.letterSpacing,
    textAlign: "center",
    ...Platform.select({
      web: {
        maxWidth: (Sizes.maxContentWidth || 1400) * 0.25,
      },
      default: {
        width: "100%",
      },
    }),
  },
});
