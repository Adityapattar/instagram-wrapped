"use client";

import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type {
  ActivityPayload,
  EmojiPoint,
  HeatmapPoint,
  StatSummary,
  TimelinePoint,
} from "@/types/analytics";

const WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

interface InsightsPanelProps {
  stats: StatSummary | null;
  timeline: TimelinePoint[];
  activity: ActivityPayload | null;
  emojis: EmojiPoint[];
  heatmap: HeatmapPoint[];
}

const formatHour = (hour: number) => `${hour}:00`;

export function InsightsPanel({
  stats,
  timeline,
  activity,
  emojis,
  heatmap,
}: InsightsPanelProps) {
  const peakHour = stats?.peak_talking_hour;
  const heatmapIndex = new Map<string, number>();
  heatmap.forEach((entry) => {
    heatmapIndex.set(`${entry.weekday}-${entry.hour}`, entry.count);
  });

  return (
    <div className="space-y-10">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4"
      >
        {[
          { label: "Total Messages", value: stats?.total_messages ?? 0 },
          {
            label: "Peak Hour",
            value: peakHour != null ? `${peakHour}:00` : "—",
          },
          {
            label: "Favorite Emoji",
            value: stats?.favorite_emoji?.emoji ?? "—",
          },
          {
            label: "Longest Streak",
            value: `${stats?.longest_streak_days ?? 0} days`,
          },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-3xl border border-zinc-800 bg-zinc-950/90 p-6 shadow-xl shadow-black/30"
          >
            <p className="text-sm uppercase tracking-[0.28em] text-zinc-500">
              {card.label}
            </p>
            <p className="mt-4 text-3xl font-semibold text-white">
              {card.value}
            </p>
          </div>
        ))}
      </motion.div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-zinc-800 bg-zinc-950/90 p-6 shadow-xl shadow-black/30"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-zinc-500">
                Message Timeline
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-white">
                Daily cadence
              </h3>
            </div>
          </div>
          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={timeline}
                margin={{ top: 16, right: 16, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#5eead4" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#5eead4" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#2f2f2f" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => value.slice(5)}
                  tick={{ fill: "#9ca3af", fontSize: 11 }}
                />
                <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "1px solid #334155",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#22c55e"
                  fill="url(#gradient)"
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-zinc-800 bg-zinc-950/90 p-6 shadow-xl shadow-black/30"
        >
          <p className="text-sm uppercase tracking-[0.28em] text-zinc-500">
            Emoji Spotlight
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-white">
            Top reactions
          </h3>
          <div className="mt-6 space-y-3">
            {emojis.slice(0, 8).map((emoji) => (
              <div
                key={emoji.emoji}
                className="flex items-center justify-between rounded-3xl border border-zinc-800 bg-zinc-900/70 px-4 py-3"
              >
                <span className="text-2xl">{emoji.emoji}</span>
                <span className="text-sm text-zinc-400">
                  {emoji.count} uses
                </span>
              </div>
            ))}
            {emojis.length === 0 && (
              <p className="text-sm text-zinc-500">
                Upload your data to explore emoji trends.
              </p>
            )}
          </div>
        </motion.div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-zinc-800 bg-zinc-950/90 p-6 shadow-xl shadow-black/30"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-zinc-500">
                Hourly activity
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-white">
                Pulse by hour
              </h3>
            </div>
          </div>
          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={activity?.hourly ?? []}
                margin={{ top: 16, right: 16, left: 0, bottom: 0 }}
              >
                <CartesianGrid stroke="#2f2f2f" vertical={false} />
                <XAxis
                  dataKey="hour"
                  tickFormatter={formatHour}
                  tick={{ fill: "#9ca3af", fontSize: 11 }}
                />
                <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "1px solid #334155",
                  }}
                />
                <Bar dataKey="count" fill="#38bdf8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-zinc-800 bg-zinc-950/90 p-6 shadow-xl shadow-black/30"
        >
          <p className="text-sm uppercase tracking-[0.28em] text-zinc-500">
            Conversation heatmap
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-white">
            Late-night flow
          </h3>
          <div className="mt-6 space-y-2">
            {WEEKDAYS.map((weekday) => (
              <div key={weekday} className="flex items-center gap-4">
                <span className="w-20 text-sm text-zinc-400">{weekday}</span>
                <div className="grid w-full grid-cols-24 gap-0.5">
                  {Array.from({ length: 24 }, (_, hour) => {
                    const count = heatmapIndex.get(`${weekday}-${hour}`) ?? 0;
                    const opacity = Math.min(0.95, 0.15 + count / 20);
                    return (
                      <div
                        key={hour}
                        title={`${weekday} ${formatHour(hour)}: ${count} messages`}
                        className="h-6 rounded-full transition"
                        style={{
                          backgroundColor: `rgba(56, 189, 248, ${opacity})`,
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
