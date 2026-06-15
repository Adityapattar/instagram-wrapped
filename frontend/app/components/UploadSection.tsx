"use client";

import { motion } from "framer-motion";
import { useCallback, useId, useState, type DragEvent } from "react";
import type { UploadResponse } from "../types";

const API_UPLOAD_URL = "http://localhost:8000/upload";

interface UploadSectionProps {
  onUploadComplete: (response: UploadResponse) => void;
}

function normalizeFile(file: File | null | undefined) {
  if (!file) {
    return null;
  }
  return file.name.toLowerCase().endsWith(".zip") ? file : null;
}

function createUploadRequest(file: File, onProgress: (value: number) => void) {
  return new Promise<UploadResponse>((resolve, reject) => {
    const form = new FormData();
    form.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", API_UPLOAD_URL, true);
    xhr.responseType = "json";

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const response = xhr.response as UploadResponse | null;
        if (!response || !response.success) {
          reject(new Error("Upload completed but the response was malformed."));
          return;
        }
        resolve(response);
        return;
      }

      let message = "Upload failed.";
      if (xhr.response && typeof xhr.response === "object") {
        message =
          (xhr.response as Record<string, unknown>).detail?.toString?.() ??
          (xhr.response as Record<string, unknown>).message?.toString?.() ??
          JSON.stringify(xhr.response);
      } else if (xhr.statusText) {
        message = xhr.statusText;
      } else {
        message = `Upload failed with status ${xhr.status}`;
      }
      reject(new Error(message));
    };

    xhr.onerror = () =>
      reject(
        new Error(
          "Network error while uploading file. Make sure the backend at http://localhost:8000 is running.",
        ),
      );
    xhr.send(form);
  });
}

export default function UploadSection({
  onUploadComplete,
}: UploadSectionProps) {
  const [dragging, setDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadMessage, setUploadMessage] = useState<string>(
    "Drop your Instagram ZIP file here or click to browse.",
  );

  const handleFile = useCallback(
    async (file: File | null) => {
      setUploadError(null);
      if (!file) {
        setUploadError("Please select a valid ZIP file.");
        return;
      }

      setUploadProgress(0);
      setUploadMessage(`Uploading ${file.name}...`);

      try {
        const response = await createUploadRequest(file, setUploadProgress);
        setUploadMessage(
          `Imported ${response.imported_messages} messages across ${response.chat_count} chats.`,
        );
        onUploadComplete(response);
      } catch (error) {
        setUploadError((error as Error).message);
        setUploadMessage(
          "Drop your Instagram ZIP file here or click to browse.",
        );
      }
    },
    [onUploadComplete],
  );

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setDragging(false);
      const file = event.dataTransfer.files?.[0];
      handleFile(normalizeFile(file));
    },
    [handleFile],
  );

  const inputId = useId();

  return (
    <section className="mt-10 mx-auto w-full max-w-5xl rounded-4xl border-[3px] border-white/10 bg-white/5 p-6 shadow-[0_30px_120px_rgba(22,21,28,0.35)] backdrop-blur-xl sm:p-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.4em] text-fuchsia-300/80">
            Upload your export
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-white">
            Analyze your Instagram conversations
          </h2>
        </div>
        <span className="rounded-full bg-fuchsia-500/10 px-4 py-2 text-sm text-fuchsia-200 ring-1 ring-fuchsia-400/20">
          ZIP only
        </span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        onDragEnter={() => setDragging(true)}
        onDragLeave={() => setDragging(false)}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDrop={handleDrop}
        className={`group relative overflow-hidden rounded-[28px] border-2 p-8 text-center transition ${
          dragging
            ? "border-fuchsia-400/80 bg-white/10"
            : "border-white/10 bg-white/5"
        }`}
      >
        <input
          id={inputId}
          type="file"
          accept=".zip"
          className="absolute inset-0 h-full w-full opacity-0 cursor-pointer"
          onChange={(event) =>
            handleFile(normalizeFile(event.target.files?.[0] ?? null))
          }
        />

        <div className="pointer-events-none">
          <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-3xl bg-fuchsia-500/10 text-fuchsia-300 ring-1 ring-fuchsia-300/20">
            <span className="text-3xl">📦</span>
          </div>
          <p className="text-lg font-medium text-white">
            Drag & drop your export
          </p>
          <p className="mt-3 text-sm text-zinc-300">
            We’ll extract messages and surface wrapped analytics instantly.
          </p>
          <p className="mt-4 text-sm text-zinc-400">{uploadMessage}</p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              className="rounded-full bg-fuchsia-500 px-8 py-3 text-sm font-semibold text-white transition hover:scale-[1.02]"
            >
              Browse ZIP
            </button>
            <span className="text-sm text-zinc-400">
              or drop your file here
            </span>
          </div>
        </div>

        {uploadProgress > 0 && uploadProgress < 100 ? (
          <div className="mt-8 h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-linear-to-r from-fuchsia-400 via-fuchsia-500 to-violet-400"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        ) : null}

        {uploadError ? (
          <p className="mt-5 text-sm text-rose-300">{uploadError}</p>
        ) : null}
      </motion.div>
    </section>
  );
}
