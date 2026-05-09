"use client";

import {
  useState, useCallback, useRef,
  DragEvent, ChangeEvent
} from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Breakdown {
  contact: number;
  sections: number;
  actionVerbs: number;
  length: number;
}

interface IndividualScore {
  fileName: string;
  totalScore: number;
  breakdown: Breakdown;
  feedback: string[];
}

interface BatchReport {
  batchSize: number;
  averageCalibreScore: number;
  highPerformers: number;
  atRisk: number;
  topWeaknesses: string[];
  individualScores: IndividualScore[];
}

type AppState = "upload" | "loading" | "dashboard";

// ─── Sub-components ───────────────────────────────────────────────────────────

function MetricCard({
  label, value, sub,
}: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="print-card rounded-xl border border-[var(--color-brand-700)] bg-[var(--color-brand-900)] p-6 flex flex-col gap-1">
      <p className="text-xs uppercase tracking-widest text-[var(--color-brand-400)]">{label}</p>
      <p className="text-4xl font-bold text-[var(--color-brand-100)]">{value}</p>
      {sub && <p className="text-xs text-[var(--color-brand-400)]">{sub}</p>}
    </div>
  );
}

// ─── Upload View ──────────────────────────────────────────────────────────────

function UploadView({
  onSubmit,
}: {
  onSubmit: (files: File[]) => void;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const merge = useCallback((incoming: FileList | null) => {
    if (!incoming) return;
    const pdfs = Array.from(incoming).filter((f) => f.type === "application/pdf");
    setFiles((prev) => {
      const combined = [...prev, ...pdfs];
      const seen = new Set<string>();
      return combined.filter((f) => {
        const k = `${f.name}-${f.size}`;
        return seen.has(k) ? false : (seen.add(k), true);
      });
    });
  }, []);

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    merge(e.dataTransfer.files);
  };

  const remove = (i: number) =>
    setFiles((p) => p.filter((_, idx) => idx !== i));

  return (
    <main className="min-h-dvh flex flex-col items-center justify-center px-6 py-16 gap-10">
      <header className="text-center space-y-2">
        <p className="text-xs tracking-[0.25em] uppercase text-[var(--color-accent)]">
          Institutional Assessment
        </p>
        <h1
          className="text-5xl md:text-6xl font-bold"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Student Caliber Engine
        </h1>
        <p className="text-sm text-[var(--color-brand-400)] max-w-md mx-auto leading-relaxed">
          Upload up to 30 PDF resumes. The engine scores the batch deterministically
          and returns a consolidated readiness report.
        </p>
      </header>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`
          relative w-full max-w-2xl rounded-2xl border-2 border-dashed cursor-pointer
          flex flex-col items-center justify-center gap-4 p-14 text-center
          transition-all duration-200
          ${dragging
            ? "border-[var(--color-accent)] bg-[var(--color-accent)]/5 scale-[1.01]"
            : "border-[var(--color-brand-600)] bg-[var(--color-brand-900)] hover:border-[var(--color-brand-400)]"
          }
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,application/pdf"
          multiple
          className="hidden"
          onChange={(e: ChangeEvent<HTMLInputElement>) => merge(e.target.files)}
        />
        <span className="text-5xl">{dragging ? "📂" : "📁"}</span>
        <div>
          <p className="text-base font-semibold text-[var(--color-brand-200)]">
            {dragging ? "Release to add files" : "Drop PDF resumes here"}
          </p>
          <p className="text-xs text-[var(--color-brand-400)] mt-1">
            or{" "}
            <span className="text-[var(--color-accent)] underline underline-offset-2">
              browse files
            </span>{" "}
            · PDF only · max 30 files
          </p>
        </div>
        {files.length > 0 && (
          <span className="text-xs bg-[var(--color-accent)]/10 text-[var(--color-accent)] px-3 py-1 rounded-full border border-[var(--color-accent)]/20">
            {files.length} file{files.length !== 1 ? "s" : ""} queued
          </span>
        )}
      </div>

      {/* File list */}
      {files.length > 0 && (
        <ul className="w-full max-w-2xl space-y-2 max-h-56 overflow-y-auto">
          {files.map((f, i) => (
            <li
              key={`${f.name}-${i}`}
              className="flex items-center justify-between bg-[var(--color-brand-900)] border border-[var(--color-brand-800)] rounded-lg px-4 py-2.5 text-sm"
            >
              <span className="truncate text-[var(--color-brand-200)] max-w-[78%]">
                📄 {f.name}
              </span>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-[var(--color-brand-400)] text-xs">
                  {(f.size / 1024).toFixed(0)} KB
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); remove(i); }}
                  className="text-[var(--color-brand-400)] hover:text-red-400 transition-colors text-xs"
                >
                  ✕
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <button
        onClick={(e) => { e.stopPropagation(); if (files.length) onSubmit(files); }}
        disabled={files.length === 0}
        className={`
          px-10 py-3.5 rounded-xl text-sm font-semibold tracking-wide transition-all
          ${files.length > 0
            ? "bg-[var(--color-accent)] text-[var(--color-brand-950)] hover:bg-[var(--color-accent-dim)] shadow-lg shadow-[var(--color-accent)]/20 cursor-pointer"
            : "bg-[var(--color-brand-800)] text-[var(--color-brand-600)] cursor-not-allowed"
          }
        `}
      >
        Analyse {files.length > 0 ? `${files.length} Resume${files.length !== 1 ? "s" : ""}` : "Resumes"} →
      </button>
    </main>
  );
}

// ─── Loading View ─────────────────────────────────────────────────────────────

function LoadingView({ count }: { count: number }) {
  return (
    <main className="min-h-dvh flex flex-col items-center justify-center gap-6 text-center px-6">
      <div className="w-12 h-12 rounded-full border-2 border-[var(--color-brand-600)] border-t-[var(--color-accent)] animate-spin" />
      <p className="text-sm text-[var(--color-brand-400)]">
        Processing institutional batch ({count} file{count !== 1 ? "s" : ""})…
      </p>
    </main>
  );
}

// ─── Dashboard View ───────────────────────────────────────────────────────────

function DashboardView({
  report,
  onReset,
}: {
  report: BatchReport;
  onReset: () => void;
}) {
  return (
    <div className="print-container min-h-dvh w-full max-w-4xl mx-auto px-6 py-12 space-y-10">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs tracking-[0.25em] uppercase text-[var(--color-accent)] no-print">
            Batch Complete
          </p>
          <h1
            className="text-4xl font-bold mt-1"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Institutional Caliber Report
          </h1>
          <p className="text-sm text-[var(--color-brand-400)] mt-1 print:text-black">
            {new Date().toLocaleDateString("en-GB", {
              day: "numeric", month: "long", year: "numeric",
            })}
          </p>
        </div>
        <div className="flex gap-3 no-print">
          <button
            onClick={() => window.print()}
            className="print:hidden px-5 py-2.5 rounded-lg text-sm font-semibold border border-[var(--color-brand-600)] text-[var(--color-brand-200)] hover:border-[var(--color-brand-400)] transition-colors cursor-pointer"
          >
            ↓ Download PDF Report
          </button>
          <button
            onClick={onReset}
            className="print:hidden px-5 py-2.5 rounded-lg text-sm font-semibold bg-[var(--color-brand-800)] text-[var(--color-brand-400)] hover:text-[var(--color-brand-200)] transition-colors cursor-pointer"
          >
            ← New Batch
          </button>
        </div>
      </div>

      {/* Metric cards - RENAMED FOR BUSINESS REQUIREMENTS */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="Batch Size"                   value={report.batchSize}            sub="resumes processed" />
        <MetricCard label="Consolidated Calibre Score"   value={`${report.averageCalibreScore} / 100`} />
        <MetricCard label="Shortlist Potential"          value={report.highPerformers}        sub="scored ≥ 80" />
        <MetricCard label="High-Risk Pipeline"           value={report.atRisk}                sub="scored < 60" />
      </section>

      {/* Top weaknesses - REFRAMED FOR INSTITUTIONAL CONTEXT */}
      <section className="print-card rounded-xl border border-[var(--color-brand-700)] bg-[var(--color-brand-900)] p-8 space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--color-brand-200)]">
          ATS Readiness & Insights
        </h2>
        
        {report.topWeaknesses.length > 0 ? (
          <>
            <p className="text-sm text-[var(--color-brand-400)]">
              Across the evaluated batch, the deterministic parser identified the following core ATS compliance gaps. Addressing these at the curriculum level will directly improve institutional placement rates:
            </p>
            <ul className="space-y-3 mt-4">
              {report.topWeaknesses.map((w, i) => (
                <li key={i} className="flex items-center gap-4 text-sm bg-[var(--color-brand-950)] p-4 rounded-lg border border-[var(--color-brand-800)]">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-[var(--color-danger)]/10 text-[var(--color-danger)] flex items-center justify-center text-xs font-bold border border-[var(--color-danger)]/20">
                    {i + 1}
                  </span>
                  <span className="text-[var(--color-brand-100)] font-medium">{w}</span>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="text-sm text-emerald-400 bg-emerald-400/10 p-4 rounded-lg border border-emerald-400/20">
            ✓ No major systemic weaknesses detected. The current batch demonstrates excellent ATS formatting compliance.
          </p>
        )}
      </section>

      <footer className="print:hidden text-center text-xs text-[var(--color-brand-600)] pb-4 no-print pt-8">
        Student Caliber Engine · Institutional View
      </footer>
    </div>
  );
}

// ─── Root Page ────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [appState, setAppState]     = useState<AppState>("upload");
  const [fileCount, setFileCount]   = useState(0);
  const [report, setReport]         = useState<BatchReport | null>(null);
  const [error, setError]           = useState<string | null>(null);

  const handleSubmit = async (files: File[]) => {
    setFileCount(files.length);
    setError(null);
    setAppState("loading");

    const form = new FormData();
    files.forEach((f) => form.append("resumes", f));

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";
      
      const res = await fetch(`${API_BASE}/api/resumes/upload`, {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || `Server error ${res.status}`);
      }

      const data: BatchReport = await res.json();
      setReport(data);
      setAppState("dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setAppState("upload");
    }
  };

  const handleReset = () => {
    setReport(null);
    setError(null);
    setAppState("upload");
  };

  return (
    <>
      {error && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm no-print shadow-xl">
          {error}
          <button onClick={() => setError(null)} className="ml-4 opacity-60 hover:opacity-100 cursor-pointer">✕</button>
        </div>
      )}

      {appState === "upload"    && <UploadView onSubmit={handleSubmit} />}
      {appState === "loading"   && <LoadingView count={fileCount} />}
      {appState === "dashboard" && report && (
        <DashboardView report={report} onReset={handleReset} />
      )}
    </>
  );
}