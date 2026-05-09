"use client";

import { useState, useCallback, DragEvent, ChangeEvent } from "react";

type UploadState = "idle" | "dragging" | "ready";

export default function HomePage() {
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [files, setFiles] = useState<File[]>([]);

  const acceptFiles = useCallback((incoming: FileList | null) => {
    if (!incoming) return;
    const pdfs = Array.from(incoming).filter((f) => f.type === "application/pdf");
    setFiles((prev) => {
      const merged = [...prev, ...pdfs];
      // Deduplicate by name+size
      const seen = new Set<string>();
      return merged.filter((f) => {
        const key = `${f.name}-${f.size}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    });
    setUploadState("ready");
  }, []);

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setUploadState("idle");
    acceptFiles(e.dataTransfer.files);
  };

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    acceptFiles(e.target.files);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    if (files.length <= 1) setUploadState("idle");
  };

  const handleSubmit = async () => {
    if (files.length === 0) return;
    const form = new FormData();
    files.forEach((f) => form.append("resumes", f));
    // Phase 2: wire up to /api/resumes/upload
    console.log("Submitting", files.length, "files");
  };

  return (
    <main className="min-h-dvh flex flex-col items-center justify-center px-6 py-16 gap-12">

      {/* Header */}
      <header className="text-center space-y-3">
        <p className="text-xs tracking-[0.25em] uppercase text-[var(--color-accent)] font-mono">
          Assessment Tool
        </p>
        <h1
          className="text-5xl md:text-6xl font-bold leading-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Student Caliber Engine
        </h1>
        <p className="text-[var(--color-brand-400)] text-sm max-w-md mx-auto leading-relaxed">
          Upload up to 30 PDF résumés. The engine deterministically scores each
          one and generates a batch ranking report — no AI, no guesswork.
        </p>
      </header>

      {/* Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setUploadState("dragging"); }}
        onDragLeave={() => setUploadState(files.length ? "ready" : "idle")}
        onDrop={onDrop}
        className={`
          relative w-full max-w-2xl rounded-2xl border-2 border-dashed
          transition-all duration-200 cursor-pointer
          flex flex-col items-center justify-center gap-4 p-14 text-center
          ${uploadState === "dragging"
            ? "border-[var(--color-accent)] bg-[var(--color-accent)]/5 scale-[1.01]"
            : "border-[var(--color-brand-600)] bg-[var(--color-brand-900)] hover:border-[var(--color-brand-400)]"
          }
        `}
      >
        <input
          id="file-input"
          type="file"
          accept=".pdf,application/pdf"
          multiple
          className="absolute inset-0 opacity-0 cursor-pointer"
          onChange={onInputChange}
        />

        {/* Icon */}
        <div className={`text-5xl transition-transform duration-200 ${uploadState === "dragging" ? "scale-110" : ""}`}>
          {uploadState === "dragging" ? "📂" : "📁"}
        </div>

        <div>
          <p className="text-base font-semibold text-[var(--color-brand-200)]">
            {uploadState === "dragging" ? "Release to add files" : "Drop PDF résumés here"}
          </p>
          <p className="text-xs text-[var(--color-brand-400)] mt-1">
            or <span className="text-[var(--color-accent)] underline underline-offset-2">browse files</span> · PDF only · max 30 files
          </p>
        </div>

        {files.length > 0 && (
          <span className="text-xs bg-[var(--color-accent)]/10 text-[var(--color-accent)] px-3 py-1 rounded-full border border-[var(--color-accent)]/20">
            {files.length} file{files.length !== 1 ? "s" : ""} queued
          </span>
        )}
      </div>

      {/* File List */}
      {files.length > 0 && (
        <ul className="w-full max-w-2xl space-y-2 max-h-64 overflow-y-auto pr-1">
          {files.map((file, i) => (
            <li
              key={`${file.name}-${i}`}
              className="flex items-center justify-between bg-[var(--color-brand-900)] border border-[var(--color-brand-800)] rounded-lg px-4 py-2.5 text-sm"
            >
              <span className="truncate text-[var(--color-brand-200)] max-w-[80%]">
                📄 {file.name}
              </span>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-[var(--color-brand-400)] text-xs">
                  {(file.size / 1024).toFixed(0)} KB
                </span>
                <button
                  onClick={() => removeFile(i)}
                  className="text-[var(--color-brand-400)] hover:text-red-400 transition-colors text-xs cursor-pointer"
                  aria-label="Remove file"
                >
                  ✕
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={files.length === 0}
        className={`
          px-10 py-3.5 rounded-xl text-sm font-semibold tracking-wide transition-all duration-200
          ${files.length > 0
            ? "bg-[var(--color-accent)] text-[var(--color-brand-950)] hover:bg-[var(--color-accent-dim)] shadow-lg shadow-[var(--color-accent)]/20 cursor-pointer"
            : "bg-[var(--color-brand-800)] text-[var(--color-brand-600)] cursor-not-allowed"
          }
        `}
      >
        Analyse {files.length > 0 ? `${files.length} Résumé${files.length !== 1 ? "s" : ""}` : "Résumés"} →
      </button>

      {/* Footer */}
      <footer className="text-[var(--color-brand-600)] text-xs tracking-widest uppercase">
        Phase 1 — Skeleton
      </footer>
    </main>
  );
}