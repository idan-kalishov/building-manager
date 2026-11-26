// components/AddUpdateForm.tsx
import { useState } from "react";
import type { Technician, TaskUpdate } from "../../types";

interface AddUpdateFormProps {
  currentDueDate?: string;
  onAddUpdate: (update: Omit<TaskUpdate, "id" | "timestamp">) => void;
  onCancel?: () => void;
}

const TECHNICIANS: Technician[] = ["גדי", "עידן", "אחר"];

export default function AddUpdateForm({
  currentDueDate,
  onAddUpdate,
  onCancel,
}: AddUpdateFormProps) {
  const [technician, setTechnician] = useState<Technician>("גדי");
  const [message, setMessage] = useState("");
  const [updateDueDate, setUpdateDueDate] = useState(false);
  const [newDueDate, setNewDueDate] = useState(currentDueDate || "");

  const submitUpdate = () => {
    if (!message.trim()) {
      alert("אנא הזן תוכן עדכון");
      return;
    }

    onAddUpdate({
      technician,
      message: message.trim(),
      ...(updateDueDate && currentDueDate ? { oldDueDate: currentDueDate } : {}),
      ...(updateDueDate && newDueDate ? { newDueDate } : {}),
    });

    // Reset form
    setMessage("");
    setTechnician("גדי");
    setUpdateDueDate(false);
    setNewDueDate(currentDueDate || "");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitUpdate();
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 pt-4 border-t space-y-3">
      <h4 className="text-sm font-semibold text-gray-700">➕ הוסף עדכון</h4>

      {/* Technician Selection */}
      <div className="flex gap-2">
        {TECHNICIANS.map((tech) => (
          <button
            key={tech}
            type="button"
            onClick={() => setTechnician(tech)}
            className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-all
              ${
                technician === tech
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
          >
            {tech === "גדי" && "👨‍🔧"}
            {tech === "עידן" && "👷"}
            {tech === "אחר" && "👤"} {tech}
          </button>
        ))}
      </div>

      {/* Update Message */}
      <textarea
        autoFocus
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            submitUpdate();
          }
        }}
        placeholder="למשל: בדקתי את המעלית, תקלה במנוע... או: תיקון הושלם, מחכה לאישור..."
        rows={2}
        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
        required
      />

      {/* Option to update due date */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="updateDueDate"
          checked={updateDueDate}
          onChange={(e) => setUpdateDueDate(e.target.checked)}
          className="rounded"
        />
        <label htmlFor="updateDueDate" className="text-sm text-gray-600">
          📅 עדכן תאריך יעד
        </label>
      </div>

      {updateDueDate && (
        <input
          type="date"
          value={newDueDate}
          onChange={(e) => setNewDueDate(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          required
        />
      )}

      {/* Buttons */}
      <div className="flex gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="w-full px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50 text-sm"
          >
            ביטול
          </button>
        )}
      </div>
    </form>
  );
}
