import { useState, useRef, useEffect } from "react";
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

// ─── Helper: Convert File to Base64 ──────────────────────────────────────────

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === "string") {
        const base64 = reader.result.split(",")[1];
        resolve(base64);
      } else {
        reject(new Error("Failed to convert file to base64"));
      }
    };
    reader.onerror = (error) => reject(error);
  });
}

// ─── API Functions ────────────────────────────────────────────────────────────

async function transcribeAudio(file: File): Promise<string> {
  console.log("📁 File details:", {
    name: file.name,
    type: file.type || "empty (iOS issue)",
    size: `${(file.size / 1024).toFixed(2)} KB`,
  });

  try {
    // Convert to base64 - this avoids FormData CORS issues on mobile
    const base64Data = await fileToBase64(file);

    // Determine MIME type for M4A
    let mimeType = file.type;
    if (!mimeType || mimeType === "") {
      if (file.name.toLowerCase().endsWith(".m4a")) {
        mimeType = "audio/mp4";
      } else if (file.name.toLowerCase().endsWith(".mp3")) {
        mimeType = "audio/mpeg";
      } else if (file.name.toLowerCase().endsWith(".wav")) {
        mimeType = "audio/wav";
      } else {
        mimeType = "audio/mpeg";
      }
    }

    console.log("📤 Sending to proxy via base64...");

    const res = await fetch(`${PROXY_URL}/api/transcribe-base64`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        file: base64Data,
        filename: file.name,
        mimeType: mimeType,
        model: "whisper-large-v3-turbo",
        language: "he",
      }),
    });

    console.log("📥 Response status:", res.status);

    const responseText = await res.text();
    console.log("📥 Response body:", responseText);

    if (!res.ok) {
      throw new Error(`תמלול נכשל: ${responseText}`);
    }

    const data = JSON.parse(responseText);

    if (!data.text) {
      throw new Error("לא התקבל תמלול מהשרת");
    }
    return data.text;
  } catch (err: any) {
    console.error("💥 Upload error:", err);
    throw err;
  }
}

async function summarizeTranscript(transcript: string): Promise<string> {
  console.log("📝 Summarizing transcript, length:", transcript.length);

  try {
    const res = await fetch(`${PROXY_URL}/api/summarize`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ transcript }),
    });

    console.log("📥 Summarize response status:", res.status);

    if (!res.ok) {
      const errorText = await res.text();
      console.error("❌ Summarize error:", errorText);
      throw new Error(`סיכום נכשל: ${errorText}`);
    }

    const data = await res.json();
    console.log("✅ Summarize response:", data);

    const text = data.choices?.[0]?.message?.content;
    if (!text) {
      throw new Error("לא התקבלה תשובה מהשרת");
    }
    return text;
  } catch (err: any) {
    console.error("💥 Summarize error:", err);
    throw err;
  }
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
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    console.log("📱 LeadNotesModal mounted");
    console.log("🔗 Proxy URL:", PROXY_URL);
  }, []);

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
    if (!file) {
      console.warn("⚠️ No file selected");
      return;
    }

    console.log("📱 File selected:", {
      name: file.name,
      type: file.type || "(empty - iOS issue)",
      size: `${(file.size / 1024).toFixed(2)} KB`,
    });

    setPendingSummary(null);
    setPendingTranscript(null);
    setErrorMsg(null);
    setUploadProgress(0);
    setUploadStatus("uploading");

    try {
      const transcript = await transcribeAudio(file);
      console.log("✅ Transcription complete, length:", transcript.length);

      setUploadProgress(50);
      setUploadStatus("processing");

      const summary = await summarizeTranscript(transcript);
      console.log("✅ Summarization complete, length:", summary.length);

      setUploadProgress(100);

      setPendingTranscript(transcript);
      setPendingSummary(summary);
      setUploadStatus("done");
    } catch (err: any) {
      console.error("💥 Upload error:", err);
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
    setUploadProgress(0);
  };

  const handleDiscard = () => {
    setPendingSummary(null);
    setPendingTranscript(null);
    setUploadStatus("idle");
    setUploadProgress(0);
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
                  accept=".m4a,audio/*,video/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <button
                  onClick={() => {
                    console.log("📁 File input triggered");
                    fileInputRef.current?.click();
                  }}
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

            {/* Loading with progress */}
            {(uploadStatus === "uploading" ||
              uploadStatus === "processing") && (
              <div className="bg-purple-50 border border-purple-100 rounded-xl px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin shrink-0" />
                  <p className="text-xs text-purple-600 font-medium">
                    {uploadStatus === "uploading"
                      ? "מתמלל הקלטה..."
                      : "מסכם עם AI..."}
                  </p>
                </div>
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="mt-2 w-full bg-purple-200 rounded-full h-1.5">
                    <div
                      className="bg-purple-600 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                )}
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
