import LessonContent from "@/components/LessonBlocks/LessonContent";
import { Spacing } from "@/constants/layout";
import { getAppColors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import type { LessonContentPayload } from "@/types/lesson";
import {
  getLesson,
  getLessonVersions,
  type GetLessonResponse,
  type GetLessonReadyResponse,
  type LessonVersionItem,
} from "@/utils/api";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const POLL_INTERVAL_MS = 4000;
const MAX_POLL_ATTEMPTS = 60; // ~4 min

function isGeneratingResponse(
  r: GetLessonResponse
): r is GetLessonResponse & { status: "generating" } {
  return "status" in r && r.status === "generating";
}

function hasContent(
  r: GetLessonResponse
): r is GetLessonResponse & { content: Record<string, unknown> } {
  return "content" in r && r.content != null && typeof r.content === "object";
}

export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = getAppColors(colorScheme);

  const [status, setStatus] = useState<"loading" | "generating" | "ready" | "failed" | "not_found">(
    "loading"
  );
  const [content, setContent] = useState<LessonContentPayload | null>(null);
  const [lessonMeta, setLessonMeta] = useState<{
    title: string;
    order: number;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<number | undefined>(undefined);
  const [versions, setVersions] = useState<LessonVersionItem[]>([]);

  const pollCountRef = useRef(0);
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch version list when lesson is ready
  useEffect(() => {
    if (!id || status !== "ready") return;
    getLessonVersions(id)
      .then((res) => setVersions(res.versions ?? []))
      .catch(() => setVersions([]));
  }, [id, status]);

  useEffect(() => {
    const lessonId = id;
    if (!lessonId) {
      setStatus("not_found");
      return;
    }

    let cancelled = false;
    setErrorMessage(null);
    if (selectedVersion === undefined) {
      setStatus("loading");
      setContent(null);
    }

    const stopPolling = () => {
      if (pollTimerRef.current) {
        clearTimeout(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    };

    const poll = () => {
      if (cancelled) return;
      pollCountRef.current += 1;
      if (pollCountRef.current > MAX_POLL_ATTEMPTS) {
        setStatus("failed");
        setErrorMessage("Lesson is taking longer than expected. Please try again later.");
        return;
      }
      getLesson(lessonId)
        .then((data) => {
          if (cancelled) return;
          if (isGeneratingResponse(data)) {
            pollTimerRef.current = setTimeout(poll, POLL_INTERVAL_MS);
            return;
          }
          if (hasContent(data)) {
            setStatus("ready");
            setLessonMeta({ title: data.title, order: data.order });
            setContent(data.content as unknown as LessonContentPayload);
            return;
          }
          if ((data as { generation_status?: string }).generation_status === "failed") {
            setStatus("failed");
            return;
          }
          pollTimerRef.current = setTimeout(poll, POLL_INTERVAL_MS);
        })
        .catch((e: any) => {
          if (cancelled) return;
          setStatus("failed");
          setErrorMessage(e?.message ?? "Failed to load lesson");
        });
    };

    const handleResponse = (data: GetLessonResponse) => {
      if (cancelled) return;
      if (isGeneratingResponse(data)) {
        setStatus("generating");
        setLessonMeta({ title: data.title, order: data.order });
        pollCountRef.current = 0;
        pollTimerRef.current = setTimeout(poll, POLL_INTERVAL_MS);
        return;
      }
      if (hasContent(data)) {
        setStatus("ready");
        setLessonMeta({ title: data.title, order: data.order });
        setContent(data.content as unknown as LessonContentPayload);
        return;
      }
      const withMeta = data as { title: string; order: number; generation_status?: string };
      if (withMeta.generation_status === "failed") {
        setStatus("failed");
        setLessonMeta({ title: withMeta.title, order: withMeta.order });
        return;
      }
      const ready = data as GetLessonReadyResponse;
      setStatus("ready");
      setLessonMeta({ title: ready.title, order: ready.order });
      if (ready.content) setContent(ready.content as unknown as LessonContentPayload);
    };

    if (selectedVersion !== undefined) {
      getLesson(lessonId, selectedVersion)
        .then((data) => {
          if (cancelled) return;
          if (hasContent(data)) {
            setStatus("ready");
            setLessonMeta({ title: data.title, order: data.order });
            setContent(data.content as unknown as LessonContentPayload);
          } else {
            setStatus("not_found");
          }
        })
        .catch((e: any) => {
          if (cancelled) return;
          if (e?.status === 404) setStatus("not_found");
          else {
            setStatus("failed");
            setErrorMessage(e?.message ?? "Failed to load version");
          }
        });
      return () => {
        cancelled = true;
      };
    }

    getLesson(lessonId)
      .then(handleResponse)
      .catch((e: any) => {
        if (cancelled) return;
        if (e?.status === 404) setStatus("not_found");
        else {
          setStatus("failed");
          setErrorMessage(e?.message ?? "Failed to load lesson");
        }
      });

    return () => {
      cancelled = true;
      stopPolling();
    };
  }, [id, selectedVersion]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  if (!id) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
            <Text style={[styles.backText, { color: colors.primary }]}>← Back</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.centered}>
          <Text style={[styles.message, { color: colors.textSecondary }]}>Lesson not found.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn} activeOpacity={0.7}>
          <Text style={[styles.backText, { color: colors.primary }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={1}>
          {lessonMeta?.title ?? "Lesson"}
        </Text>
      </View>

      {status === "loading" && (
        <View style={[styles.centered, styles.minHeight]}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.message, { color: colors.textSecondary, marginTop: Spacing.md }]}>
            Loading lesson…
          </Text>
        </View>
      )}

      {status === "generating" && (
        <View style={[styles.centered, styles.minHeight]}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.message, { color: colors.textSecondary, marginTop: Spacing.md }]}>
            Preparing lesson…
          </Text>
          <Text style={[styles.subMessage, { color: colors.textTertiary }]}>
            This usually takes a minute. We’ll update automatically.
          </Text>
        </View>
      )}

      {status === "ready" && content && (
        <>
          {(versions.length > 0 || selectedVersion !== undefined) && (
            <View style={[styles.versionBar, { borderBottomColor: colors.border }]}>
              <Text style={[styles.versionLabel, { color: colors.textSecondary }]}>
                Viewing:{" "}
              </Text>
              <View style={styles.versionPills}>
                <TouchableOpacity
                  onPress={() => setSelectedVersion(undefined)}
                  style={[
                    styles.versionPill,
                    {
                      backgroundColor:
                        selectedVersion === undefined ? colors.primary : colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.versionPillText,
                      {
                        color: selectedVersion === undefined ? "#fff" : colors.textPrimary,
                      },
                    ]}
                  >
                    Current
                  </Text>
                </TouchableOpacity>
                {versions.map((v) => (
                  <TouchableOpacity
                    key={v.version}
                    onPress={() => setSelectedVersion(v.version)}
                    style={[
                      styles.versionPill,
                      {
                        backgroundColor:
                          selectedVersion === v.version ? colors.primary : colors.surface,
                        borderColor: colors.border,
                      },
                    ]}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.versionPillText,
                        {
                          color:
                            selectedVersion === v.version ? "#fff" : colors.textPrimary,
                        },
                      ]}
                    >
                      Version {v.version}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <LessonContent content={content} />
          </ScrollView>
        </>
      )}

      {status === "failed" && (
        <View style={[styles.centered, styles.minHeight]}>
          <Text style={[styles.message, { color: colors.textPrimary }]}>
            This lesson couldn’t be generated.
          </Text>
          {errorMessage ? (
            <Text style={[styles.subMessage, { color: colors.textTertiary }]}>{errorMessage}</Text>
          ) : null}
          <TouchableOpacity
            onPress={handleBack}
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            activeOpacity={0.8}
          >
            <Text style={styles.retryButtonText}>Back to course</Text>
          </TouchableOpacity>
        </View>
      )}

      {status === "not_found" && (
        <View style={[styles.centered, styles.minHeight]}>
          <Text style={[styles.message, { color: colors.textSecondary }]}>Lesson not found.</Text>
          <TouchableOpacity
            onPress={handleBack}
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            activeOpacity={0.8}
          >
            <Text style={styles.retryButtonText}>Go back</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  backBtn: {
    paddingVertical: Spacing.sm,
    paddingRight: Spacing.md,
  },
  backText: {
    fontSize: 16,
    fontWeight: "500",
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing["2xl"],
  },
  versionBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    gap: Spacing.sm,
  },
  versionLabel: {
    fontSize: 14,
  },
  versionPills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xs,
  },
  versionPill: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 6,
    borderWidth: 1,
  },
  versionPillText: {
    fontSize: 13,
    fontWeight: "500",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.lg,
  },
  minHeight: {
    minHeight: 200,
  },
  message: {
    fontSize: 16,
    textAlign: "center",
  },
  subMessage: {
    fontSize: 14,
    marginTop: Spacing.sm,
    textAlign: "center",
  },
  retryButton: {
    marginTop: Spacing.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
});
