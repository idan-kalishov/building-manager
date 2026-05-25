import { useState } from "react";
import type { Task, TaskPriority, TaskUpdate } from "../../types";
import TaskUpdateSection from "./TaskUpdateSection";

interface EditTaskModalProps {
  task: Task | null;
  onSave: (updatedTask: Partial<Task>) => void;
  onClose: () => void;
}

const PRIORITY_CONFIG: Record<TaskPriority, string> = {
  high: "🔴 גבוהה",
  medium: "🟡 בינונית",
  low: "🟢 נמוכה",
};

export default function EditTaskModal({
  task,
  onSave,
  onClose,
}: EditTaskModalProps) {
  const [form, setForm] = useState<Partial<Task>>(task || {});
  const [updates, setUpdates] = useState<TaskUpdate[]>(task?.updates || []);

  if (!task) return null;

  const handleAddUpdate = (newUpdate: Omit<TaskUpdate, "id" | "timestamp">) => {
    const updateWithMeta: TaskUpdate = {
      id: Date.now().toString(),
      ...newUpdate,
      timestamp: new Date().toISOString(),
    };
    setUpdates([...updates, updateWithMeta]);
  };

  const handleSave = () => {
    if (!form.title) {
      alert("כותרת היא שדה חובה");
      return;
    }
    onSave({ ...form, updates });
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-4"
      dir="rtl"
    >
      <div className="bg-white rounded-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-bold">עריכת משימה</h2>
          <button onClick={onClose} className="text-gray-400 text-2xl">
            ×
          </button>
        </div>

        <div className="p-4 space-y-3 overflow-y-auto flex-1">
          {/* Basic Fields */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-600">כותרת *</label>
            <input
              value={form.title || ""}
              onChange={(e) =>
                setForm((p) => ({ ...p, title: e.target.value }))
              }
              placeholder="לדוגמה: לבדוק מעלית בבניין..."
              className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-600">פירוט</label>
            <textarea
              value={form.description || ""}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
              rows={2}
              className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-600">
              בניין קשור
            </label>
            <input
              value={form.buildingAddress || ""}
              onChange={(e) =>
                setForm((p) => ({ ...p, buildingAddress: e.target.value }))
              }
              placeholder="כתובת הבניין"
              className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1 flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-600">
                תאריך יעד
              </label>
              <input
                type="date"
                value={form.dueDate || ""}
                onChange={(e) =>
                  setForm((p) => ({ ...p, dueDate: e.target.value }))
                }
                className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>

            <div className="flex-1 flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-600">סטטוס</label>
              <select
                value={form.done ? "done" : "open"}
                onChange={(e) =>
                  setForm((p) => ({ ...p, done: e.target.value === "done" }))
                }
                className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                <option value="open">🟢 פתוחה</option>
                <option value="done">✅ הושלמה</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-600">עדיפות</label>
            <div className="flex gap-2">
              {(["high", "medium", "low"] as TaskPriority[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setForm((d) => ({ ...d, priority: p }))}
                  className={`flex-1 py-2 rounded-lg text-sm border transition-colors
                    ${
                      form.priority === p
                        ? "bg-blue-600 text-white border-blue-600"
                        : "border-gray-300 hover:bg-gray-50"
                    }`}
                >
                  {PRIORITY_CONFIG[p]}
                </button>
              ))}
            </div>
          </div>

          {/* Update Section */}
          <TaskUpdateSection updates={updates} onAddUpdate={handleAddUpdate} />
        </div>

        <div className="flex gap-2 p-4 border-t">
          <button
            onClick={handleSave}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium"
          >
            💾 שמור שינויים
          </button>
          <button
            onClick={onClose}
            className="flex-1 border py-2 rounded-lg hover:bg-gray-50 text-gray-600"
          >
            ביטול
          </button>
        </div>
      </div>
    </div>
  );
}
