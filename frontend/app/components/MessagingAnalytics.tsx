"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import MessageSearch from "./MessageSearch";
import type { ConversationAnalytics } from "../types";

interface MessagingAnalyticsProps {
  conversations: ConversationAnalytics[];
}

function formatHour(hour: number | null) {
  if (hour === null) return "N/A";
  const suffix = hour >= 12 ? "PM" : "AM";
  const display = hour % 12 === 0 ? 12 : hour % 12;
  return `${display}${suffix}`;
}

export default function MessagingAnalytics({
  conversations,
}: MessagingAnalyticsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [displayCount, setDisplayCount] = useState(20);
  const [expandedChat, setExpandedChat] = useState<string | null>(null);
  const [selectedChatForMessages, setSelectedChatForMessages] = useState<
    string | null
  >(null);

  const filteredConversations = useMemo(() => {
    return conversations
      .filter((conv) =>
        conv.chat_id.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      .slice(0, displayCount);
  }, [conversations, searchQuery, displayCount]);

  if (conversations.length === 0) {
    return null;
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="mt-12 w-full space-y-8"
    >
      <div>
        <p className="text-sm uppercase tracking-[0.35em] text-fuchsia-300/80">
          Messaging Analytics
        </p>
        <h3 className="mt-2 text-3xl font-semibold text-white">
          Who you chatted with most
        </h3>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setDisplayCount(20);
            }}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder-zinc-400 backdrop-blur-xl transition focus:border-fuchsia-300/50 focus:outline-none"
          />
        </div>
        <select
          value={displayCount}
          onChange={(e) => setDisplayCount(parseInt(e.target.value))}
          className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white backdrop-blur-xl transition focus:border-fuchsia-300/50 focus:outline-none"
        >
          <option value="10">Show 10</option>
          <option value="20">Show 20</option>
          <option value="50">Show 50</option>
          <option value="100">Show 100</option>
        </select>
      </div>

      {/* Conversations Table */}
      <div className="space-y-3 overflow-x-auto">
        {filteredConversations.length === 0 ? (
          <div className="rounded-lg border border-white/10 bg-white/5 p-6 text-center text-zinc-400">
            No conversations found
          </div>
        ) : (
          filteredConversations.map((conv, idx) => (
            <motion.div
              key={conv.chat_id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className="rounded-lg border border-white/10 bg-white/5 backdrop-blur-xl transition hover:border-fuchsia-300/20 hover:bg-white/10"
            >
              <button
                onClick={() =>
                  setExpandedChat(
                    expandedChat === conv.chat_id ? null : conv.chat_id,
                  )
                }
                className="w-full px-6 py-4 text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-white">{conv.chat_id}</h4>
                    <p className="mt-1 text-sm text-zinc-400">
                      {conv.total_messages.toLocaleString()} messages •{" "}
                      {conv.days_active} days active
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {conv.first_message_date} to {conv.last_message_date}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2 text-right">
                    <div className="rounded-full bg-fuchsia-300/10 px-3 py-1">
                      <p className="text-sm font-semibold text-fuchsia-300">
                        {conv.total_messages.toLocaleString()}
                      </p>
                    </div>
                    <span
                      className={`transition transform ${
                        expandedChat === conv.chat_id ? "rotate-180" : ""
                      }`}
                    >
                      ▼
                    </span>
                  </div>
                </div>
              </button>

              {/* Expanded Details */}
              {expandedChat === conv.chat_id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-white/10 px-6 py-4"
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <p className="text-xs uppercase tracking-widest text-zinc-500">
                        Most Active
                      </p>
                      <p className="text-sm text-white">
                        <span className="font-semibold">Date:</span>{" "}
                        {conv.most_active_date.date || "N/A"} (
                        {conv.most_active_date.count} messages)
                      </p>
                      <p className="text-sm text-white">
                        <span className="font-semibold">Hour:</span>{" "}
                        {formatHour(conv.most_active_hour.hour)} (
                        {conv.most_active_hour.count} messages)
                      </p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs uppercase tracking-widest text-zinc-500">
                        Participants
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {conv.senders.slice(0, 5).map((sender) => (
                          <span
                            key={sender}
                            className="rounded bg-white/10 px-2 py-1 text-xs text-zinc-300"
                          >
                            {sender}
                          </span>
                        ))}
                        {conv.senders.length > 5 && (
                          <span className="rounded bg-white/10 px-2 py-1 text-xs text-zinc-300">
                            +{conv.senders.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Hourly Distribution Chart */}
                    <div className="sm:col-span-2 space-y-2">
                      <p className="text-xs uppercase tracking-widest text-zinc-500">
                        Activity by Hour
                      </p>
                      <div className="flex h-16 items-end gap-1 rounded-lg bg-black/20 p-3">
                        {conv.hourly_distribution.map((point) => {
                          const maxCount = Math.max(
                            ...conv.hourly_distribution.map((p) => p.count),
                            1,
                          );
                          const height = (point.count / maxCount) * 100;
                          return (
                            <div
                              key={point.hour}
                              title={`${formatHour(point.hour)}: ${point.count} messages`}
                              className="group flex-1 rounded-sm bg-linear-to-t from-fuchsia-400 to-fuchsia-300 transition hover:from-fuchsia-300 hover:to-fuchsia-200"
                              style={{
                                height: `${Math.max(height, 5)}%`,
                                opacity: 0.7,
                              }}
                            />
                          );
                        })}
                      </div>
                    </div>

                    {/* Weekday Distribution */}
                    <div className="sm:col-span-2 space-y-2">
                      <p className="text-xs uppercase tracking-widest text-zinc-500">
                        Activity by Day
                      </p>
                      <div className="grid grid-cols-7 gap-1">
                        {conv.weekday_distribution.map((point) => {
                          const maxCount = Math.max(
                            ...conv.weekday_distribution.map((p) => p.count),
                            1,
                          );
                          const intensity = (point.count / maxCount) * 100;
                          return (
                            <div
                              key={point.weekday}
                              title={`${point.weekday}: ${point.count} messages`}
                              className="space-y-1"
                            >
                              <div
                                className="h-8 rounded-sm bg-linear-to-t from-fuchsia-400 to-fuchsia-300 transition"
                                style={{
                                  opacity: Math.max(intensity / 100, 0.3),
                                }}
                              />
                              <p className="text-center text-xs text-zinc-500">
                                {point.weekday.slice(0, 3)}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Message Search Button */}
                    <div className="sm:col-span-2">
                      <button
                        onClick={() => setSelectedChatForMessages(conv.chat_id)}
                        className="w-full rounded-lg bg-fuchsia-600 hover:bg-fuchsia-700 px-4 py-2 text-sm font-semibold text-white transition"
                      >
                        🔍 Search & Filter Messages
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))
        )}
      </div>

      <p className="text-xs text-zinc-500">
        Showing {filteredConversations.length} of {conversations.length}{" "}
        conversations
      </p>

      {/* Message Search Modal */}
      {selectedChatForMessages && (
        <MessageSearch
          chatId={selectedChatForMessages}
          onClose={() => setSelectedChatForMessages(null)}
        />
      )}
    </motion.section>
  );
}
