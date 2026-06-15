"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import type { MessageDetail, ChatMessagesResponse } from "../types";

interface MessageSearchProps {
  chatId: string;
  onClose: () => void;
}

function formatTimestamp(timestamp: number) {
  const date = new Date(timestamp);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default function MessageSearch({ chatId, onClose }: MessageSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [minLength, setMinLength] = useState(0);
  const [maxLength, setMaxLength] = useState(10000);
  const [messages, setMessages] = useState<MessageDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "length">("date");

  const BACKEND_URL =
    process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, "") ||
    "http://localhost:8000";

  const fetchMessages = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        q: searchQuery,
        min_len: minLength.toString(),
        max_len: maxLength.toString(),
        limit: "1000",
      });

      const response = await fetch(
        `${BACKEND_URL}/messages/${encodeURIComponent(chatId)}?${params}`,
        { cache: "no-store" },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }

      const data: ChatMessagesResponse = await response.json();
      let sorted = [...data.messages];

      if (sortBy === "length") {
        sorted.sort(
          (a, b) => (b.message?.length || 0) - (a.message?.length || 0),
        );
      }

      setMessages(sorted);
    } catch (err) {
      setError("Error fetching messages. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleFilterChange = () => {
    fetchMessages();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl border border-white/10 bg-black/95 backdrop-blur-xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-fuchsia-300/80">
              Message Search
            </p>
            <h3 className="mt-1 text-lg font-semibold text-white">{chatId}</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-white/10 transition text-zinc-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Controls */}
        <div className="border-b border-white/10 px-6 py-4 space-y-4">
          {/* Search Input */}
          <div>
            <label className="text-xs uppercase tracking-widest text-zinc-400 block mb-2">
              Search Keywords
            </label>
            <input
              type="text"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleFilterChange()}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder-zinc-500 backdrop-blur transition focus:border-fuchsia-300/50 focus:outline-none"
            />
          </div>

          {/* Length Filter */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs uppercase tracking-widest text-zinc-400 block mb-2">
                Min Length: {minLength} chars
              </label>
              <input
                type="range"
                min="0"
                max="maxLength"
                value={minLength}
                onChange={(e) => setMinLength(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-zinc-400 block mb-2">
                Max Length: {maxLength} chars
              </label>
              <input
                type="range"
                min="minLength"
                max="10000"
                value={maxLength}
                onChange={(e) => setMaxLength(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          {/* Sort & Filter Buttons */}
          <div className="flex gap-2 flex-wrap">
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as "date" | "length");
                fetchMessages();
              }}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white backdrop-blur transition focus:border-fuchsia-300/50 focus:outline-none"
            >
              <option value="date">Sort by Date</option>
              <option value="length">Sort by Length (Longest First)</option>
            </select>
            <button
              onClick={handleFilterChange}
              disabled={loading}
              className="rounded-lg bg-fuchsia-600 hover:bg-fuchsia-700 disabled:bg-fuchsia-600/50 px-4 py-2 text-sm font-semibold text-white transition"
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}
        </div>

        {/* Messages Table */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-zinc-400">Loading messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-zinc-400">No messages found</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-zinc-500 mb-3">
                Found {messages.length} message(s)
              </p>
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  className="rounded-lg border border-white/10 bg-white/5 p-3 hover:bg-white/10 transition"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-zinc-500">
                        {formatTimestamp(msg.timestamp)}
                      </p>
                      <p className="text-xs font-semibold text-fuchsia-300 mt-1">
                        {msg.sender}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-right">
                      <span className="text-xs bg-fuchsia-300/20 text-fuchsia-300 rounded px-2 py-1">
                        {msg.message?.length || 0} chars
                      </span>
                      {msg.message_type !== "text" && (
                        <span className="text-xs bg-blue-300/20 text-blue-300 rounded px-2 py-1">
                          {msg.message_type}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-white wrap-break-word whitespace-pre-wrap">
                    {msg.message || "(empty message)"}
                  </p>
                  {msg.reaction && (
                    <p className="text-xs text-zinc-400 mt-2">
                      <span className="font-semibold">Reactions:</span>{" "}
                      {msg.reaction}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
