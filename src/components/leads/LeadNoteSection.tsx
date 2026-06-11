import { useState, useRef } from "react";

// ─── Type ─────────────────────────────────────────────────────────────────────
// Add to your types.ts:
//   export interface LeadNote { id: string; timestamp: string; author: string; message: string; }
//   In Lead interface: notesList?: LeadNote[];

export interface LeadNote {
  id: string;
  timestamp: string;
  author: string;
  message: string;
}

interface Props {
  notes: LeadNote[];
  onAddNote: (message: string, author: string) => void;
  onDeleteNote?: (id: string) => void;
}

const AUTHORS = ["גדי", "עידן", "אחר"] as const;

const AUTHOR_COLORS: Record<string, string> = {
  גדי: "bg-blue-100 text-blue-800 border-blue-200",
  עידן: "bg-purple-100 text-purple-800 border-purple-200",
  אחר: "bg-gray-100 text-gray-800 border-gray-200",
};

const AUTHOR_BAR: Record<string, string> = {
  גדי: "border-blue-400",
  עידן: "border-purple-400",
  אחר: "border-gray-300",
};

export default function LeadNoteSection({
  notes,
  onAddNote,
  onDeleteNote,
}: Props) {
  const [message, setMessage] = useState("");
  const [author, setAuthor] = useState<string>("גדי");
  const [isListening, setIsListening] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const recognitionRef = useRef<any>(null);

  const startVoice = () => {
    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SR) {
      alert("הדפדפן שלך לא תומך בזיהוי קול. נסה Chrome.");
      return;
    }
    const recognition = new SR();
    recognition.lang = "he-IL";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      setShowForm(true);
      setAuthor("גדי"); // auto-assign voice to גדי
    };
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (e: any) => {
      const transcript: string = e.results[0][0].transcript;
      setMessage((prev) => (prev ? prev + " " + transcript : transcript));
    };
    recognition.onerror = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopVoice = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  const handleSubmit = () => {
    if (!message.trim()) return;
    onAddNote(message.trim(), author);
    setMessage("");
    setShowForm(false);
  };

  return (
    <section>
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-3 border-b pb-1">
        <h3 className="font-bold text-gray-700 text-sm flex items-center gap-2">
          📝 הערות
          {notes.length > 0 && (
            <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full font-normal text-gray-500">
              {notes.length}
            </span>
          )}
        </h3>
        <div className="flex items-center gap-2">
          {/* Voice button */}
          <button
            onClick={isListening ? stopVoice : startVoice}
            title="הכתבה קולית – ישויך לגדי אוטומטית"
            className={`w-8 h-8 rounded-full flex items-center justify-center text-base transition-all ${
              isListening
                ? "bg-red-500 text-white animate-pulse shadow-md shadow-red-200"
                : "bg-gray-100 hover:bg-green-100 text-gray-600"
            }`}
          >
            🎤
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="text-xs bg-blue-500 text-white px-3 py-1.5 rounded-lg hover:bg-blue-600 font-medium"
          >
            {showForm ? "ביטול" : "+ הערה"}
          </button>
        </div>
      </div>

      {/* ── Listening indicator ── */}
      {isListening && (
        <div className="mb-3 flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-3 py-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
          מאזין... דבר עכשיו
          <span className="mr-auto text-xs text-red-400">ישויך לגדי</span>
        </div>
      )}

      {/* ── Add form ── */}
      {showForm && (
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-3 mb-4 space-y-2">
          <div className="flex gap-2">
            {AUTHORS.map((a) => (
              <button
                key={a}
                onClick={() => setAuthor(a)}
                className={`flex-1 py-1.5 text-sm rounded-lg font-medium transition-all border ${
                  author === a
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                }`}
              >
                {a}
              </button>
            ))}
          </div>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="הוסף הערה..."
            rows={2}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none bg-white"
          />
          <button
            onClick={handleSubmit}
            disabled={!message.trim()}
            className="w-full bg-blue-600 disabled:opacity-40 text-white py-2 rounded-lg hover:bg-blue-700 text-sm font-medium transition-opacity"
          >
            💾 שמור הערה
          </button>
        </div>
      )}

      {/* ── Notes list ── */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {notes.length === 0 ? (
          <p className="text-center text-gray-400 text-xs py-5">
            אין הערות עדיין — לחץ 🎤 לדיקטציה קולית
          </p>
        ) : (
          [...notes].reverse().map((note) => (
            <div
              key={note.id}
              className={`bg-white rounded-lg p-3 text-sm border border-gray-100 border-r-4 ${
                AUTHOR_BAR[note.author] ?? "border-gray-300"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium border ${
                    AUTHOR_COLORS[note.author] ??
                    "bg-gray-100 text-gray-700 border-gray-200"
                  }`}
                >
                  {note.author}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">
                    {new Date(note.timestamp).toLocaleString("he-IL", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  {onDeleteNote && (
                    <button
                      onClick={() => onDeleteNote(note.id)}
                      title="מחק הערה"
                      className="text-gray-300 hover:text-red-500 transition-colors text-sm leading-none"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed">{note.message}</p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
