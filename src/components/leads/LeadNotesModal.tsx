import { useState, useRef } from "react";
import type { Lead } from "../../types";
import { updateLead } from "../../lib/leads.service";
import LeadNoteSection, { type LeadNote } from "./LeadNoteSection";

interface Props {
  lead: Lead;
  onClose: () => void;
}

interface CallSummary {
  id: string;
  timestamp: string;
  summary: string;
  transcript: string;
}

type UploadStatus = "idle" | "uploading" | "processing" | "done" | "error";

// ─── Proxy Configuration ──────────────────────────────────────────────────────
const PROXY_URL = "https://nameless-water-1203.vaadabait68.workers.dev";

// ─── API Functions ────────────────────────────────────────────────────────────

async function transcribeAudio(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("model", "whisper-large-v3-turbo");
  formData.append("language", "he");

  const res = await fetch(`${PROXY_URL}/api/transcribe`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw new Error(`תמלול נכשל: ${await res.text()}`);
  const data = await res.json();
  if (!data.text) throw new Error("לא התקבל תמלול");
  return data.text;
}

async function summarizeTranscript(transcript: string): Promise<string> {
  const res = await fetch(`${PROXY_URL}/api/summarize`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ transcript }),
  });

  if (!res.ok) throw new Error(`סיכום נכשל: ${await res.text()}`);
  const data = await res.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error("לא התקבלה תשובה");
  return text;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("he-IL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── Call Summary Card Component ─────────────────────────────────────────────

function CallSummaryCard({
  summary,
  onDelete,
}: {
  summary: CallSummary;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);

  const previewLine =
    summary.summary
      .split("\n")
      .find(
        (l) =>
          l.trim() &&
          !l.startsWith("✅") &&
          !l.startsWith("📅") &&
          !l.startsWith("🔔"),
      ) ?? "סיכום שיחה";

  return (
    <div className="bg-white border border-purple-100 rounded-xl overflow-hidden shadow-sm">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 text-right hover:bg-purple-50/40 transition-colors"
      >
        <span className="text-purple-400 text-lg shrink-0">🎙️</span>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-700 truncate">
            {previewLine}
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            {formatDate(summary.timestamp)}
          </p>
        </div>
        <span className="text-gray-300 text-sm shrink-0">
          {expanded ? "▲" : "▼"}
        </span>
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-purple-50">
          <div className="mt-3 text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">
            {summary.summary}
          </div>

          <button
            onClick={() => setShowTranscript((v) => !v)}
            className="mt-3 text-[11px] text-purple-500 hover:text-purple-700 underline underline-offset-2 transition-colors"
          >
            {showTranscript ? "הסתר תמלול" : "הצג תמלול מלא"}
          </button>

          {showTranscript && (
            <div className="mt-2 bg-gray-50 border border-gray-100 rounded-lg p-3 text-[11px] text-gray-500 leading-relaxed whitespace-pre-wrap max-h-40 overflow-y-auto">
              {summary.transcript}
            </div>
          )}

          <div className="flex justify-end mt-3">
            <button
              onClick={onDelete}
              className="text-[11px] text-red-400 hover:text-red-600 transition-colors"
            >
              🗑️ מחק שיחה
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function LeadNotesModal({ lead, onClose }: Props) {
  const [notesList, setNotesList] = useState<LeadNote[]>(
    (lead as any).notesList ?? [],
  );
  const [callSummaries, setCallSummaries] = useState<CallSummary[]>(
    (lead as any).callSummaries ?? [],
  );
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [pendingTranscript, setPendingTranscript] = useState<string | null>(
    null,
  );
  const [pendingSummary, setPendingSummary] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddNote = (message: string, author: string) => {
    const newNote: LeadNote = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      author,
      message,
    };
    const updated = [...notesList, newNote];
    setNotesList(updated);
    updateLead(lead.id!, { notesList: updated } as any);
  };

  const handleDeleteNote = (id: string) => {
    const updated = notesList.filter((n) => n.id !== id);
    setNotesList(updated);
    updateLead(lead.id!, { notesList: updated } as any);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPendingSummary(null);
    setPendingTranscript(null);
    setErrorMsg(null);
    setUploadStatus("uploading");

    try {
      const transcript = await transcribeAudio(file);
      setUploadStatus("processing");
      const summary = await summarizeTranscript(transcript);
      setPendingTranscript(transcript);
      setPendingSummary(summary);
      setUploadStatus("done");
    } catch (err: any) {
      setErrorMsg(err.message ?? "שגיאה לא ידועה");
      setUploadStatus("error");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSaveCallSummary = () => {
    if (!pendingSummary || !pendingTranscript) return;
    const newEntry: CallSummary = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      summary: pendingSummary,
      transcript: pendingTranscript,
    };
    const updated = [newEntry, ...callSummaries];
    setCallSummaries(updated);
    updateLead(lead.id!, { callSummaries: updated } as any);
    setPendingSummary(null);
    setPendingTranscript(null);
    setUploadStatus("idle");
  };

  const handleDiscard = () => {
    setPendingSummary(null);
    setPendingTranscript(null);
    setUploadStatus("idle");
  };

  const handleDeleteSummary = (id: string) => {
    const updated = callSummaries.filter((s) => s.id !== id);
    setCallSummaries(updated);
    updateLead(lead.id!, { callSummaries: updated } as any);
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      dir="rtl"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
          <div>
            <h2 className="font-bold text-gray-800 text-base">
              📋 שיחות והערות
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {lead.address || lead.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl w-8 h-8 flex items-center justify-center"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* ── Call Recordings Section ── */}
          <div className="px-4 pt-4 pb-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-purple-700 uppercase tracking-wide">
                🎙️ שיחות מוקלטות
              </p>
              {callSummaries.length > 0 && (
                <span className="text-[11px] bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full font-medium">
                  {callSummaries.length}
                </span>
              )}
            </div>

            {/* Upload trigger */}
            {(uploadStatus === "idle" || uploadStatus === "error") && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*,video/mp4"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-purple-200 rounded-xl py-2.5 text-xs text-purple-500 hover:bg-purple-50 hover:border-purple-300 transition-colors font-medium"
                >
                  + העלה הקלטת שיחה לתמלול אוטומטי
                </button>
                {uploadStatus === "error" && errorMsg && (
                  <p className="text-xs text-red-500 mt-2 text-center">
                    ❌ {errorMsg}
                  </p>
                )}
              </>
            )}

            {/* Loading */}
            {(uploadStatus === "uploading" ||
              uploadStatus === "processing") && (
              <div className="flex items-center gap-3 bg-purple-50 border border-purple-100 rounded-xl px-4 py-3">
                <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin shrink-0" />
                <p className="text-xs text-purple-600 font-medium">
                  {uploadStatus === "uploading"
                    ? "מתמלל הקלטה..."
                    : "מסכם עם AI..."}
                </p>
              </div>
            )}

            {/* Preview before saving */}
            {uploadStatus === "done" && pendingSummary && (
              <div className="bg-purple-50 border border-purple-200 rounded-xl overflow-hidden">
                <div className="px-3 py-2 bg-purple-100 flex items-center gap-2">
                  <span className="text-purple-600 text-sm">✨</span>
                  <p className="text-xs font-semibold text-purple-700">
                    סיכום מוכן לשמירה
                  </p>
                </div>
                <div className="p-3 text-xs text-gray-700 leading-relaxed whitespace-pre-wrap max-h-36 overflow-y-auto">
                  {pendingSummary}
                </div>
                <div className="flex gap-2 px-3 pb-3">
                  <button
                    onClick={handleSaveCallSummary}
                    className="flex-1 bg-purple-600 text-white py-2 rounded-lg text-xs font-semibold hover:bg-purple-700 transition-colors"
                  >
                    ✅ שמור שיחה
                  </button>
                  <button
                    onClick={handleDiscard}
                    className="px-3 py-2 border border-gray-300 text-gray-500 rounded-lg text-xs hover:bg-gray-50 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            {/* Saved summaries */}
            {callSummaries.length > 0 && (
              <div className="mt-3 space-y-2">
                {callSummaries.map((s) => (
                  <CallSummaryCard
                    key={s.id}
                    summary={s}
                    onDelete={() => handleDeleteSummary(s.id)}
                  />
                ))}
              </div>
            )}

            {callSummaries.length === 0 && uploadStatus === "idle" && (
              <p className="text-[11px] text-gray-400 text-center mt-2">
                עדיין לא הועלו הקלטות לליד זה
              </p>
            )}
          </div>

          {/* Divider */}
          <div className="mx-4 border-t border-gray-100 my-1" />

          {/* ── Notes Section ── */}
          <div className="px-4 pt-3 pb-4">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
              📝 הערות
            </p>
            <LeadNoteSection
              notes={notesList}
              onAddNote={handleAddNote}
              onDeleteNote={handleDeleteNote}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
