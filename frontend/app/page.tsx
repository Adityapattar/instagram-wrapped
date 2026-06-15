"use client";

import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import UploadSection from "./components/UploadSection";
import Dashboard from "./components/Dashboard";
import MessagingAnalytics from "./components/MessagingAnalytics";
import type {
  ActivityResponse,
  AnalyticsPayload,
  ConversationAnalytics,
  ConversationsResponse,
  EmojiPoint,
  HeatmapPoint,
  StatCard,
  TimelinePoint,
  UploadResponse,
} from "./types";

const BACKEND_URL = "http://localhost:8000";

async function fetchApi<T>(path: string): Promise<T> {
  const response = await fetch(`${BACKEND_URL}${path}`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to load ${path}`);
  }
  return response.json();
}

export default function Home() {
  const [uploadResult, setUploadResult] = useState<UploadResponse | null>(null);
  const [stats, setStats] = useState<StatCard | null>(null);
  const [timeline, setTimeline] = useState<TimelinePoint[]>([]);
  const [activity, setActivity] = useState<ActivityResponse | null>(null);
  const [emojis, setEmojis] = useState<EmojiPoint[]>([]);
  const [heatmap, setHeatmap] = useState<HeatmapPoint[]>([]);
  const [conversations, setConversations] = useState<ConversationAnalytics[]>(
    [],
  );
  const [statusMessage, setStatusMessage] = useState(
    "Upload your Instagram export to unlock Wrapped insights.",
  );
  const [loading, setLoading] = useState(false);

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    setStatusMessage("Analyzing your export and preparing Wrapped insights...");

    try {
      const analyticsData = await fetchApi<AnalyticsPayload>("/analytics");
      setStats(analyticsData.stats);
      setTimeline(analyticsData.timeline);
      setActivity(analyticsData.activity);
      setEmojis(analyticsData.emojis);
      setHeatmap(analyticsData.heatmap);

      // Fetch conversations data
      const conversationsData = await fetchApi<ConversationsResponse>(
        "/conversations?limit=100",
      );
      setConversations(conversationsData.conversations);

      setStatusMessage("Your Wrapped dashboard is ready.");
    } catch (error) {
      setStatusMessage(
        "Unable to load analytics right now. Try again in a moment.",
      );
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleUploadComplete = useCallback(
    async (response: UploadResponse) => {
      setUploadResult(response);
      await loadAnalytics();
    },
    [loadAnalytics],
  );

  return (
    <main className="min-h-screen bg-black text-white overflow-hidden">
      <div className="relative overflow-hidden pb-24 pt-10">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_top,rgba(192,38,211,0.22),transparent_30%)]" />
        <div className="pointer-events-none absolute right-0 top-24 h-96 w-96 rounded-full bg-fuchsia-500/10 blur-3xl" />

        <div className="relative mx-auto flex max-w-7xl flex-col gap-12 px-6 lg:px-10">
          <motion.section
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-fuchsia-200 shadow-[0_20px_120px_rgba(192,38,211,0.12)]">
              <span className="h-2 w-2 rounded-full bg-fuchsia-300" />
              Instagram Wrapped • Chat analytics
            </div>

            <div className="space-y-8">
              <div className="space-y-6">
                <p className="text-sm uppercase tracking-[0.35em] text-fuchsia-300/90">
                  Your message story, revealed
                </p>
                <h1 className="max-w-3xl text-6xl font-semibold tracking-tight text-white sm:text-7xl">
                  Instagram Wrapped
                </h1>
                <p className="max-w-2xl text-lg text-zinc-300 sm:text-xl">
                  Upload your Instagram export ZIP and get instant message
                  analytics with daily timelines, emoji mood, peak hours, reply
                  speed, and streak highlights.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  {
                    title: "Fast analysis",
                    description:
                      "Upload once and see story-worthy stats in seconds.",
                  },
                  {
                    title: "Privacy first",
                    description:
                      "All data is processed by your backend, not shared.",
                  },
                  {
                    title: "Trend insights",
                    description:
                      "Reveal peak hours, late-night energy, and emoji mood.",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="rounded-[28px] border border-white/10 bg-white/5 p-6"
                  >
                    <p className="text-sm uppercase tracking-[0.28em] text-zinc-400">
                      {item.title}
                    </p>
                    <p className="mt-4 text-base leading-7 text-zinc-300">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1 }}
              className="grid gap-4 sm:grid-cols-3"
            >
              <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
                <p className="text-sm uppercase tracking-[0.28em] text-zinc-400">
                  Chats imported
                </p>
                <p className="mt-4 text-4xl font-semibold text-white">
                  {uploadResult?.chat_count ?? "—"}
                </p>
              </div>
              <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
                <p className="text-sm uppercase tracking-[0.28em] text-zinc-400">
                  Total messages
                </p>
                <p className="mt-4 text-4xl font-semibold text-white">
                  {uploadResult?.imported_messages.toLocaleString() ?? "—"}
                </p>
              </div>
              <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
                <p className="text-sm uppercase tracking-[0.28em] text-zinc-400">
                  Status
                </p>
                <p className="mt-4 text-4xl font-semibold text-white">
                  {loading
                    ? "Analyzing..."
                    : uploadResult
                      ? "Ready"
                      : "Awaiting upload"}
                </p>
              </div>
            </motion.div>
          </motion.section>

          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08 }}
            className="mx-auto w-full max-w-7xl rounded-[36px] border border-white/10 bg-white/5 p-8 shadow-[0_40px_120px_rgba(22,21,28,0.35)]"
          >
            <div className="mb-6">
              <p className="text-sm uppercase tracking-[0.3em] text-zinc-400">
                Upload
              </p>
              <h2 className="mt-3 text-3xl font-semibold text-white">
                Start your Wrapped journey
              </h2>
              <p className="mt-4 text-sm leading-7 text-zinc-300">
                Upload your export securely and let the backend extract your
                chat files for a full messaging deep dive.
              </p>
            </div>
            <UploadSection onUploadComplete={handleUploadComplete} />
          </motion.div>

          <div className="rounded-[3rem] border border-white/10 bg-white/5 p-8 shadow-[0_40px_120px_rgba(22,21,28,0.35)]">
            <p className="text-sm uppercase tracking-[0.3em] text-zinc-400">
              Experience
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-white">
              A cinematic Wrapped interface
            </h2>
            <p className="mt-4 max-w-3xl text-zinc-300">
              After upload, explore a dashboard built for story-first insights,
              from your most active hours to your favorite emojis and longest
              streaks.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                {
                  label: "Late night energy",
                  value: "Discover your after-dark conversations",
                },
                {
                  label: "Reply rhythm",
                  value: "Track your average reply time",
                },
                {
                  label: "Emoji mood",
                  value: "See which reactions define the year",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-3xl border border-white/10 bg-black/20 p-5"
                >
                  <p className="text-sm uppercase tracking-[0.25em] text-zinc-400">
                    {item.label}
                  </p>
                  <p className="mt-3 text-base leading-7 text-zinc-200">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 pb-24 lg:px-10">
        {stats && activity && heatmap.length > 0 ? (
          <>
            <Dashboard
              stats={stats}
              timeline={timeline}
              activity={activity}
              emojis={emojis}
              heatmap={heatmap}
            />
            {conversations.length > 0 && (
              <MessagingAnalytics conversations={conversations} />
            )}
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="rounded-[36px] border border-white/10 bg-white/5 p-10 text-center text-zinc-300"
          >
            <p className="text-lg font-semibold text-white">{statusMessage}</p>
            <p className="mt-3 max-w-2xl mx-auto text-sm leading-7">
              Upload your Instagram export to see your messages transformed into
              timelines, activity charts, streaks, and Wrapped-style insights.
            </p>
          </motion.div>
        )}
      </div>
    </main>
  );
}
