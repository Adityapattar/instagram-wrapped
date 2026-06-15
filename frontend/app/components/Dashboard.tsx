"use client";

import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type {
  ActivityResponse,
  EmojiPoint,
  HeatmapPoint,
  StatCard,
  TimelinePoint,
} from "../types";

const WEEKDAY_ORDER = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

function StatisticTile({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
}) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition hover:border-fuchsia-300/20">
      <p className="text-sm uppercase tracking-[0.3em] text-zinc-400">
        {title}
      </p>
      <p
        className="mt-4 text-3xl font-semibold text-white truncate"
        title={typeof value === "string" ? value : ""}
      >
        {value}
      </p>
      {subtitle ? (
        <p className="mt-2 text-sm text-zinc-400">{subtitle}</p>
      ) : null}
    </div>
  );
}

function formatHour(hour: number) {
  const suffix = hour >= 12 ? "PM" : "AM";
  const display = hour % 12 === 0 ? 12 : hour % 12;
  return `${display}${suffix}`;
}

export default function Dashboard({
  stats,
  timeline,
  activity,
  emojis,
  heatmap,
}: {
  stats: StatCard;
  timeline: TimelinePoint[];
  activity: ActivityResponse;
  emojis: EmojiPoint[];
  heatmap: HeatmapPoint[];
}) {
  return (
    <section className="mt-16 w-full space-y-12">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-fuchsia-300/80">
              Your Wrapped
            </p>
            <h2 className="mt-2 mb-6 text-4xl font-semibold text-white sm:text-5xl">
              Your conversation story.
            </h2>
          </div>
          <div className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-zinc-300">
            {timeline.length} days of message history loaded
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-5">
          <StatisticTile
            title="Total messages"
            value={stats.total_messages.toLocaleString()}
          />
          <StatisticTile
            title="Total chats"
            value={stats.total_chats.toLocaleString()}
          />
          <StatisticTile
            title="Favorite emoji"
            value={stats.favorite_emoji?.emoji ?? "—"}
            subtitle={
              stats.favorite_emoji
                ? `${stats.favorite_emoji.count} uses`
                : "No emoji data"
            }
          />
          <StatisticTile
            title="Top chat"
            value={stats.most_chatted_with?.chat_id ?? "—"}
            subtitle={
              stats.most_chatted_with
                ? `${stats.most_chatted_with.count} msgs`
                : undefined
            }
          />
          <StatisticTile
            title="Avg length"
            value={`${stats.average_message_length.toFixed(1)} chars`}
          />
        </div>

        <div className="mt-8 rounded-[36px] border border-white/10 bg-linear-to-r from-fuchsia-900/40 via-slate-950/40 to-indigo-950/30 p-6 shadow-[0_40px_120px_rgba(22,21,28,0.35)]">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-zinc-400">
                Wrapped highlights
              </p>
              <h3 className="mt-2 text-3xl font-semibold text-white">
                The stats your DMs are hiding.
              </h3>
            </div>
            <p className="text-sm text-zinc-300 max-w-2xl">
              These are the most curious insights from your messages — who you
              texted most, what night you stayed up, and how long your average
              messages really are.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-3xl border border-white/10 bg-black/20 p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">
                Most chatted with
              </p>
              <p
                className="mt-4 text-2xl font-semibold text-white truncate"
                title={stats.most_chatted_with?.chat_id ?? ""}
              >
                {stats.most_chatted_with?.chat_id ?? "—"}
              </p>
              <p className="mt-2 text-sm text-zinc-400">
                {stats.most_chatted_with
                  ? `${stats.most_chatted_with.count.toLocaleString()} messages`
                  : "No chat data"}
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-black/20 p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">
                Busiest weekday
              </p>
              <p className="mt-4 text-2xl font-semibold text-white">
                {stats.most_active_weekday?.weekday ?? "—"}
              </p>
              <p className="mt-2 text-sm text-zinc-400">
                {stats.most_active_weekday
                  ? `${stats.most_active_weekday.count.toLocaleString()} messages`
                  : "No weekday data"}
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-black/20 p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">
                Night owl chat
              </p>
              <p
                className="mt-4 text-2xl font-semibold text-white truncate"
                title={stats.night_owl_chat?.chat_id ?? ""}
              >
                {stats.night_owl_chat?.chat_id ?? "—"}
              </p>
              <p className="mt-2 text-sm text-zinc-400">
                {stats.night_owl_chat
                  ? `${stats.night_owl_chat.count.toLocaleString()} late-night messages`
                  : "No late-night data"}
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-black/20 p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">
                Media messages
              </p>
              <p className="mt-4 text-2xl font-semibold text-white">
                {stats.media_messages.toLocaleString()}
              </p>
              <p className="mt-2 text-sm text-zinc-400">
                Messages with photos, videos, or files.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-black/20 p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">
                Most used word
              </p>
              <p className="mt-4 text-2xl font-semibold text-white">
                {stats.most_used_word?.word ?? "—"}
              </p>
              <p className="mt-2 text-sm text-zinc-400">
                {stats.most_used_word
                  ? `${stats.most_used_word.count.toLocaleString()} times`
                  : "Insufficient word data"}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="rounded-[36px] border border-white/10 bg-white/5 p-6 shadow-[0_40px_120px_rgba(22,21,28,0.35)]"
      >
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-zinc-400">
              Top 5 chats
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-white">
              Your most active conversations
            </h3>
          </div>
          <span className="rounded-full bg-fuchsia-500/10 px-4 py-2 text-sm text-fuchsia-200 ring-1 ring-fuchsia-400/20">
            Top contacts
          </span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {activity.top_chats.length > 0 ? (
            activity.top_chats.slice(0, 5).map((chat) => (
              <div
                key={chat.chat_id}
                className="rounded-3xl border border-white/10 bg-black/20 p-5"
              >
                <p
                  className="text-xs uppercase tracking-[0.3em] text-zinc-400 truncate"
                  title={chat.chat_id}
                >
                  {chat.chat_id}
                </p>
                <p className="mt-4 text-2xl font-semibold text-white">
                  {chat.count.toLocaleString()}
                </p>
                <p className="mt-2 text-sm text-zinc-400">messages</p>
              </div>
            ))
          ) : (
            <div className="rounded-3xl border border-white/10 bg-black/20 p-6 text-center text-sm text-zinc-300">
              <p className="font-semibold text-white">No conversation data</p>
              <p className="mt-2">Upload your export to see your top chats.</p>
            </div>
          )}
        </div>
      </motion.div>

      <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="rounded-[36px] border border-white/10 bg-white/5 p-6 shadow-[0_40px_120px_rgba(22,21,28,0.35)]"
        >
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-zinc-400">
                Timeline
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-white">
                Messages over time
              </h3>
            </div>
            <span className="rounded-full bg-fuchsia-500/10 px-4 py-2 text-sm text-fuchsia-200 ring-1 ring-fuchsia-400/20">
              Daily trend
            </span>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={timeline}
                margin={{ top: 10, right: 16, left: -16, bottom: 8 }}
              >
                <defs>
                  <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#c026d3" stopOpacity={0.85} />
                    <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#a1a1aa", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fill: "#a1a1aa", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <CartesianGrid
                  stroke="rgba(255,255,255,0.08)"
                  vertical={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "#101014",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "#fff",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#d946ef"
                  fill="url(#lineGradient)"
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-5"
        >
          <div className="rounded-[36px] border border-white/10 bg-white/5 p-6">
            <div className="mb-5">
              <p className="text-sm uppercase tracking-[0.3em] text-zinc-400">
                Hourly activity
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-white">
                When you talk most
              </h3>
            </div>
            <div className="h-55">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={activity.hourly}
                  margin={{ top: 10, right: 0, left: -10, bottom: 0 }}
                >
                  <XAxis
                    dataKey="hour"
                    tickFormatter={formatHour}
                    tick={{ fill: "#a1a1aa", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "#a1a1aa", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#101014",
                      border: "1px solid rgba(255,255,255,0.08)",
                      color: "#fff",
                    }}
                  />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]} fill="#a855f7" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-[36px] border border-white/10 bg-white/5 p-6">
            <p className="text-sm uppercase tracking-[0.3em] text-zinc-400">
              Favorite emojis
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-white">
              Emoji mood board
            </h3>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {emojis.length > 0 ? (
                emojis.slice(0, 6).map((entry) => (
                  <div
                    key={entry.emoji}
                    className="rounded-3xl border border-white/10 bg-black/20 p-4"
                  >
                    <p className="text-3xl">{entry.emoji}</p>
                    <p className="mt-3 text-sm uppercase tracking-[0.2em] text-zinc-400">
                      uses
                    </p>
                    <p className="mt-1 text-2xl font-semibold text-white">
                      {entry.count}
                    </p>
                  </div>
                ))
              ) : (
                <div className="rounded-3xl border border-white/10 bg-black/20 p-6 text-center text-sm text-zinc-300">
                  <p className="font-semibold text-white">
                    No emoji data found
                  </p>
                  <p className="mt-2">
                    This export did not contain any emojis or the parser was
                    unable to detect them.
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65 }}
        className="rounded-[36px] border border-white/10 bg-white/5 p-6"
      >
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-zinc-400">
              Heatmap
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-white">
              Weekly activity heatmap
            </h3>
          </div>
          <span className="rounded-full bg-fuchsia-500/10 px-4 py-2 text-sm text-fuchsia-200 ring-1 ring-fuchsia-400/20">
            Late night ready
          </span>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-3">
            {WEEKDAY_ORDER.map((weekday) => {
              const dayEntries = heatmap.filter(
                (item) => item.weekday === weekday,
              );
              return (
                <div key={weekday} className="space-y-2">
                  <p className="text-sm font-semibold text-zinc-300">
                    {weekday}
                  </p>
                  <div className="grid gap-1 grid-cols-24">
                    {Array.from({ length: 24 }, (_, hour) => {
                      const item = dayEntries.find(
                        (entry) => entry.hour === hour,
                      );
                      const count = item?.count ?? 0;
                      const intensity = Math.min(1, count / 8);
                      return (
                        <div
                          key={`${weekday}-${hour}`}
                          className="aspect-square rounded-lg"
                          style={{
                            backgroundColor: `rgba(192, 38, 211, ${0.12 + intensity * 0.7})`,
                          }}
                          title={`${formatHour(hour)} — ${count} messages`}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="rounded-[28px] border border-white/10 bg-zinc-950/40 p-5 text-sm leading-7 text-zinc-300">
            <p className="text-lg font-semibold text-white">Wrapped insights</p>
            <p className="mt-4">
              Your heatmap helps identify your most active conversation windows
              and late-night catch-ups. The brighter the block, the more
              messages you sent during that hour.
            </p>
            <div className="mt-5 space-y-3">
              <div className="rounded-3xl bg-white/5 p-4">
                <p className="text-sm uppercase tracking-[0.25em] text-zinc-400">
                  Streak
                </p>
                <p className="mt-1 text-2xl font-semibold text-white">
                  {stats.longest_streak_days} days
                </p>
              </div>
              <div className="rounded-3xl bg-white/5 p-4">
                <p className="text-sm uppercase tracking-[0.25em] text-zinc-400">
                  Late night ratio
                </p>
                <p className="mt-1 text-2xl font-semibold text-white">
                  {(stats.late_night_activity.ratio * 100).toFixed(1)}%
                </p>
              </div>
              <div className="rounded-3xl bg-white/5 p-4">
                <p className="text-sm uppercase tracking-[0.25em] text-zinc-400">
                  Avg reply
                </p>
                <p className="mt-1 text-2xl font-semibold text-white">
                  {stats.average_reply_hours
                    ? `${stats.average_reply_hours.toFixed(1)}h`
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
