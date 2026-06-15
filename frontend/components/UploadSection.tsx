"use client";

import { motion } from "framer-motion";
import { useRef, useState } from "react";

interface UploadSectionProps {
  onUploadComplete: () => Promise<void>;
  onError: (message: string) => void;
}

export function UploadSection({
  onUploadComplete,
  onError,
}: UploadSectionProps) {
  const [dragActive, setDragActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState(
    "Upload your Instagram ZIP export and unlock your Wrapped insights.",
  );
  const inputRef = useRef<HTMLInputElement | null>(null);

  const uploadFile = (file: File) => {
    if (!file.name.toLowerCase().endsWith(".zip")) {
      onError("Please upload a valid .zip file exported from Instagram.");
      return;
    }

    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append("file", file);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        setProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = async () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        setStatus("Upload complete. Building your Wrapped experience...");
        setProgress(100);
        await onUploadComplete();
      } else {
        const payload = xhr.responseText ? JSON.parse(xhr.responseText) : null;
        onError(
          payload?.detail ||
            "Upload failed. Try a different Instagram export ZIP.",
        );
      }
    };

    xhr.onerror = () => {
      onError("Network error while uploading. Please try again.");
    };

    xhr.open("POST", "http://localhost:8000/upload");
    xhr.send(formData);
    setStatus("Uploading your ZIP…");
  };

  const handleFiles = (files: FileList | null) => {
    if (!files || !files[0]) {
      return;
    }
    uploadFile(files[0]);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto w-full max-w-full rounded-3xl border-[3px] border-zinc-500/90 bg-zinc-950/80 p-8 shadow-2xl shadow-black/30 backdrop-blur-xl"
    >
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragActive(false);
          handleFiles(event.dataTransfer.files);
        }}
        className={`rounded-3xl border-2 border-dashed p-8 text-center transition ${
          dragActive
            ? "border-emerald-400 bg-emerald-500/10"
            : "border-zinc-700"
        }`}
      >
        <p className="text-sm uppercase tracking-[0.35em] text-emerald-300/70">
          Drop ZIP or click to upload
        </p>
        <h2 className="mt-6 text-3xl font-semibold text-white">
          Instagram Wrapped Upload
        </h2>
        <p className="mt-3 text-sm leading-6 text-zinc-400">
          Upload the Instagram data export ZIP to generate chat analytics,
          timeline highlights, and conversation heatmaps.
        </p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-8 inline-flex items-center justify-center rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-300"
        >
          Choose ZIP file
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".zip"
          className="hidden"
          onChange={(event) => handleFiles(event.target.files)}
        />
      </div>

      <div className="mt-6 space-y-3 text-left">
        <p className="text-sm text-zinc-400">{status}</p>
        <div className="h-3 overflow-hidden rounded-full bg-zinc-800">
          <div
            className="h-full rounded-full bg-linear-to-r from-emerald-400 via-sky-400 to-violet-400 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        {progress > 0 && (
          <p className="text-xs text-zinc-500">Progress: {progress}%</p>
        )}
      </div>
    </motion.div>
  );
}
