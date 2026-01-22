import { BorderRadius, Breakpoints, FontSizes, Shadows, Sizes, Spacing, Typography } from "@/constants/layout";
import { getAppColors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Platform, StyleSheet, Text, View, useWindowDimensions } from "react-native";

interface SocialProofProps{
  setSectionPosition: (section: string, pos: number) => void;
}

interface StatItemProps {
  number: string;
  label: string;
  colors: ReturnType<typeof getAppColors>;
}

function StatItem({ number, label, colors }: StatItemProps) {
  return (
    <View style={styles.statItem}>
      <Text
        style={[
          styles.statNumber,
          {
            color: colors.textPrimary,
          },
        ]}
      >
        {number}
      </Text>
      <Text
        style={[
          styles.statLabel,
          {
            color: colors.textSecondary,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const USAGE_STATS = [
  {
    number: "10,000+",
    label: "courses generated",
  },
  {
    number: "30+",
    label: "countries",
  },
  {
    number: "Thousands",
    label: "learning hours created",
  },
];

const TESTIMONIALS = [
  {
    text: "Helped me structure my learning for interviews. The modules are exactly what I needed.",
  },
  {
    text: "Perfect for switching careers. I got a clear path without spending weeks planning.",
  },
  {
    text: "Love how I can refine any part. It adapts as my goals change.",
  },
];

const LOGO_PLACEHOLDERS = Array(4).fill(null);

export default function SocialProof({setSectionPosition}: SocialProofProps) {
  const colorScheme = useColorScheme();
  const colors = getAppColors(colorScheme);
  const { width } = useWindowDimensions();
  const isDesktop = width >= Breakpoints.lg;
  const isTablet = width >= Breakpoints.md && width < Breakpoints.lg;

  return (
    <View
      onLayout={(event) => setSectionPosition("socialProof", event.nativeEvent.layout.y)}
      style={[
        styles.section,
        {
          backgroundColor: colors.background,
        },
      ]}
    >
      <View style={styles.container}>
        {/* Usage Stats */}
        <View
          style={[
            styles.statsContainer,
            isDesktop ? styles.statsContainerDesktop : styles.statsContainerMobile,
          ]}
        >
          {USAGE_STATS.map((stat, index) => (
            <StatItem
              key={index}
              number={stat.number}
              label={stat.label}
              colors={colors}
            />
          ))}
        </View>

        {/* Optional: Testimonials Section (commented out for now) */}
        <View style={styles.testimonialsContainer}>
          <Text style={[styles.testimonialsHeading, { color: colors.textPrimary }]}>
            Early user feedback
          </Text>
          <View
            style={[
              styles.testimonialsGrid,
              isDesktop ? styles.testimonialsGridDesktop : isTablet ? styles.testimonialsGridTablet : styles.testimonialsGridMobile,
            ]}
          >
            {TESTIMONIALS.map((testimonial, index) => (
              <View
                key={index}
                style={[
                  styles.testimonialCard,
                  { backgroundColor: colors.surface, borderColor: colors.borderLight },
                  isDesktop ? styles.testimonialCardDesktop : isTablet ? styles.testimonialCardTablet : undefined,
                ]}
              >
                <Text style={[styles.testimonialText, { color: colors.textSecondary }]}>
                  &ldquo;{testimonial.text}&rdquo;
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Optional: Logos/Badges Section (future-proof space) */}
        <View style={styles.logosContainer}>
          <Text style={[styles.logosHeading, { color: colors.textSecondary }]}>
            Trusted by learners worldwide
          </Text>
          <View style={styles.logosGrid}>
            {LOGO_PLACEHOLDERS.map((_, index) => (
              <View key={index} style={[styles.logoPlaceholder, { backgroundColor: colors.surfaceElevated, borderColor: colors.borderLight }]}>
                <Text style={[styles.logoPlaceholderText, { color: colors.textTertiary }]}>
                  Logo
                </Text>
              </View>
            ))}
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
        paddingVertical: Spacing["3xl"],
      },
      default: {
        paddingVertical: Spacing["2xl"],
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
  statsContainer: {
    width: "100%",
    alignItems: "center",
  },
  statsContainerDesktop: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing["3xl"],
  },
  statsContainerMobile: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: Spacing.xl,
  },
  statItem: {
    alignItems: "center",
    ...Platform.select({
      web: {
        minWidth: Sizes.buttonWidth.md,
      },
      default: {
        width: "100%",
      },
    }),
  },
  statNumber: {
    fontFamily: Typography.h2.fontFamily,
    fontWeight: Typography.h2.fontWeight,
    letterSpacing: Typography.h2.letterSpacing,
    marginBottom: Spacing.xs,
    ...Platform.select({
      web: {
        fontSize: FontSizes["3xl"],
        lineHeight: FontSizes["3xl"] * 1.2,
      },
      default: {
        fontSize: Typography.h2.fontSize,
        lineHeight: Typography.h2.lineHeight,
      },
    }),
  },
  statLabel: {
    fontFamily: Typography.body.fontFamily,
    fontWeight: Typography.body.fontWeight,
    fontSize: Typography.body.fontSize,
    lineHeight: Typography.body.fontSize * 1.4,
    letterSpacing: Typography.body.letterSpacing,
    textAlign: "center",
    textTransform: "lowercase",
  },
  testimonialsContainer: {
    width: "100%",
    marginTop: Spacing["2xl"],
    alignItems: "center",
  },
  testimonialsHeading: {
    fontFamily: Typography.h4.fontFamily,
    fontWeight: Typography.h4.fontWeight,
    fontSize: Typography.h4.fontSize,
    lineHeight: Typography.h4.lineHeight,
    letterSpacing: Typography.h4.letterSpacing,
    marginBottom: Spacing.lg,
    textAlign: "center",
  },
  testimonialsGrid: {
    width: "100%",
  },
  testimonialsGridDesktop: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: Spacing.lg,
  },
  testimonialsGridTablet: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: Spacing.lg,
  },
  testimonialsGridMobile: {
    flexDirection: "column",
    gap: Spacing.lg,
  },
  testimonialCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    ...Shadows?.sm,
  },
  testimonialCardDesktop: {
    flex: 1,
    minWidth: (Sizes.maxContentWidth || 1400) * 0.25,
    maxWidth: (Sizes.maxContentWidth || 1400) * 0.3,
  },
  testimonialCardTablet: {
    flex: 1,
    minWidth: (Sizes.maxContentWidth || 1400) * 0.35,
    maxWidth: (Sizes.maxContentWidth || 1400) * 0.48,
  },
  testimonialText: {
    fontFamily: Typography.body.fontFamily,
    fontWeight: Typography.body.fontWeight,
    fontSize: Typography.body.fontSize,
    lineHeight: Typography.body.fontSize * 1.5,
    letterSpacing: Typography.body.letterSpacing,
    fontStyle: "italic",
  },
  logosContainer: {
    width: "100%",
    marginTop: Spacing["2xl"],
    alignItems: "center",
  },
  logosHeading: {
    fontFamily: Typography.body.fontFamily,
    fontWeight: Typography.body.fontWeight,
    fontSize: Typography.body.fontSize,
    lineHeight: Typography.body.fontSize * 1.4,
    letterSpacing: Typography.body.letterSpacing,
    marginBottom: Spacing.lg,
    textAlign: "center",
  },
  logosGrid: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.xl,
  },
  logoPlaceholder: {
    width: Sizes.iconSize["2xl"] * 2,
    height: Sizes.iconSize["2xl"],
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logoPlaceholderText: {
    fontFamily: Typography.caption.fontFamily,
    fontWeight: Typography.caption.fontWeight,
    fontSize: Typography.caption.fontSize,
    letterSpacing: Typography.caption.letterSpacing,
  },
});
