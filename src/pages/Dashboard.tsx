import { useEffect, useState, useMemo } from "react";
import {
  subscribeTasks,
  addTask,
  updateTask,
  deleteTask,
} from "../lib/tasks.service";
import type { Task, TaskPriority } from "../types";
import ConfirmModal from "../components/ConfirmModal";

const PRIORITY_CONFIG: Record<
  TaskPriority,
  {
    label: string;
    bg: string;
    text: string;
    border: string;
    dot: string;
  }
> = {
  high: {
    label: "🔴 גבוהה",
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-300",
    dot: "bg-red-500",
  },
  medium: {
    label: "🟡 בינונית",
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    border: "border-yellow-300",
    dot: "bg-yellow-400",
  },
  low: {
    label: "🟢 נמוכה",
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-300",
    dot: "bg-green-400",
  },
};

function isOverdue(dateStr?: string, done?: boolean) {
  if (!dateStr || done) return false;
  return new Date(dateStr) < new Date(new Date().toDateString());
}

function isToday(dateStr?: string) {
  if (!dateStr) return false;
  return dateStr === new Date().toISOString().split("T")[0];
}

const EMPTY_TASK: Partial<Task> = { priority: "medium" };

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [form, setForm] = useState<Partial<Task>>(EMPTY_TASK);
  const [filter, setFilter] = useState<"all" | "today" | "overdue" | "done">(
    "all",
  );
  const [confirm, setConfirm] = useState<{
    type: "delete" | "done";
    task: Task;
  } | null>(null);

  useEffect(() => {
    const unsub = subscribeTasks(setTasks);
    return unsub;
  }, []);

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_TASK);
    setShowForm(true);
  };

  const openEdit = (task: Task) => {
    setEditing(task);
    setForm({ ...task });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title) return alert("כותרת היא שדה חובה");
    if (editing?.id) {
      await updateTask(editing.id, form);
    } else {
      await addTask(form as Omit<Task, "id">);
    }
    setShowForm(false);
    setForm(EMPTY_TASK);
    setEditing(null);
  };

  const toggleDone = async (task: Task) => {
    await updateTask(task.id!, { done: !task.done });
  };

  const handleDelete = (task: Task) => setConfirm({ type: "delete", task });
  const handleDoneClick = (task: Task) => setConfirm({ type: "done", task });

  const handleConfirm = async () => {
    if (!confirm) return;
    if (confirm.type === "delete") await deleteTask(confirm.task.id!);
    if (confirm.type === "done") await toggleDone(confirm.task);
    setConfirm(null);
  };

  const stats = useMemo(
    () => ({
      total: tasks.filter((t) => !t.done).length,
      overdue: tasks.filter((t) => isOverdue(t.dueDate, t.done)).length,
      today: tasks.filter((t) => isToday(t.dueDate) && !t.done).length,
      done: tasks.filter((t) => t.done).length,
    }),
    [tasks],
  );

  const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };

  const filteredTasks = useMemo(() => {
    let filtered = tasks;
    if (filter === "today")
      filtered = tasks.filter((t) => isToday(t.dueDate) && !t.done);
    if (filter === "overdue")
      filtered = tasks.filter((t) => isOverdue(t.dueDate, t.done));
    if (filter === "done") filtered = tasks.filter((t) => t.done);
    if (filter === "all") filtered = tasks.filter((t) => !t.done);

    return [...filtered].sort((a, b) => {
      const aOver = isOverdue(a.dueDate, a.done) ? 0 : 1;
      const bOver = isOverdue(b.dueDate, b.done) ? 0 : 1;
      if (aOver !== bOver) return aOver - bOver;
      const aPri = priorityOrder[a.priority || "low"];
      const bPri = priorityOrder[b.priority || "low"];
      if (aPri !== bPri) return aPri - bPri;
      return (a.dueDate || "").localeCompare(b.dueDate || "");
    });
  }, [tasks, filter]);

  return (
    <div dir="rtl" className="max-w-3xl mx-auto pb-20">
      <h1 className="text-2xl font-bold mb-4">📋 לוח משימות</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {[
          {
            label: "פתוחות",
            value: stats.total,
            color: "bg-blue-600",
            onClick: () => setFilter("all"),
          },
          {
            label: "להיום",
            value: stats.today,
            color: "bg-orange-500",
            onClick: () => setFilter("today"),
          },
          {
            label: "באיחור",
            value: stats.overdue,
            color: "bg-red-600",
            onClick: () => setFilter("overdue"),
          },
          {
            label: "הושלמו",
            value: stats.done,
            color: "bg-green-600",
            onClick: () => setFilter("done"),
          },
        ].map((s) => (
          <button
            key={s.label}
            onClick={s.onClick}
            className={`${s.color} text-white rounded-xl p-3 flex items-center gap-3 shadow
              hover:opacity-90 active:scale-95 transition-all text-right`}
          >
            <span className="text-3xl font-black">{s.value}</span>
            <span className="text-sm font-medium">{s.label}</span>
          </button>
        ))}
      </div>

      {/* Filters + Add */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {[
          { id: "all", label: "פתוחות" },
          { id: "today", label: "היום" },
          { id: "overdue", label: "באיחור" },
          { id: "done", label: "הושלמו" },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id as any)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
              ${
                filter === f.id
                  ? "bg-blue-600 text-white"
                  : "bg-white border border-gray-300 text-gray-600 hover:bg-gray-50"
              }`}
          >
            {f.label}
          </button>
        ))}
        <button
          onClick={openAdd}
          className="mr-auto bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 text-sm font-medium"
        >
          + משימה חדשה
        </button>
      </div>

      {/* Task List */}
      <div className="space-y-2">
        {filteredTasks.length === 0 && (
          <div className="text-center text-gray-400 py-16 text-sm">
            {filter === "done"
              ? "אין משימות שהושלמו"
              : "🎉 אין משימות! הכל נקי"}
          </div>
        )}

        {filteredTasks.map((task) => {
          const pri = task.priority
            ? PRIORITY_CONFIG[task.priority]
            : PRIORITY_CONFIG.medium;
          const overdue = isOverdue(task.dueDate, task.done);
          const today = isToday(task.dueDate);

          return (
            <div
              key={task.id}
              className={`bg-white rounded-xl border shadow-sm p-4 flex gap-3 items-start transition-all
                ${overdue ? "border-red-400 bg-red-50/50" : pri.border}
                ${task.done ? "opacity-50" : ""}`}
            >
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2 flex-wrap">
                  <p
                    className={`font-semibold text-sm ${task.done ? "line-through text-gray-400" : "text-gray-800"}`}
                  >
                    {task.title}
                  </p>
                  <span
                    className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${pri.dot}`}
                  />
                </div>

                {task.description && (
                  <p className="text-xs text-gray-500 mt-1">
                    {task.description}
                  </p>
                )}

                <div className="flex gap-3 mt-1.5 flex-wrap">
                  {task.buildingAddress && (
                    <span className="text-xs text-gray-500">
                      🏢 {task.buildingAddress}
                    </span>
                  )}
                  {task.dueDate && (
                    <span
                      className={`text-xs font-medium
                      ${overdue ? "text-red-600" : today ? "text-orange-500" : "text-gray-500"}`}
                    >
                      📅 {overdue ? "⚠️ " : ""}
                      {task.dueDate}
                      {today && !overdue ? " (היום)" : ""}
                    </span>
                  )}
                  <span className={`text-xs font-medium ${pri.text}`}>
                    {pri.label}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-1 flex-shrink-0 items-start mt-0.5">
                {!task.done ? (
                  <button
                    onClick={() => handleDoneClick(task)}
                    className="text-xs bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
                  >
                    ✓ סיים
                  </button>
                ) : (
                  <button
                    onClick={() => toggleDone(task)}
                    className="text-xs border border-gray-300 text-gray-400 px-2 py-1.5 rounded-lg hover:bg-gray-50"
                  >
                    ↩️ פתח מחדש
                  </button>
                )}
                <button
                  onClick={() => openEdit(task)}
                  className="text-xs border border-blue-300 text-blue-600 px-2 py-1.5 rounded hover:bg-blue-50"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(task)}
                  className="text-xs border border-red-300 text-red-500 px-2 py-1.5 rounded hover:bg-red-50"
                >
                  🗑️
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-4"
          dir="rtl"
        >
          <div className="bg-white rounded-2xl w-full max-w-md flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-bold">
                {editing ? "עריכת משימה" : "משימה חדשה"}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-600">
                  כותרת *
                </label>
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
                <label className="text-sm font-medium text-gray-600">
                  פירוט
                </label>
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

              <div className="flex flex-col gap-1">
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

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-600">
                  עדיפות
                </label>
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
                      {PRIORITY_CONFIG[p].label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 p-4 border-t">
              <button
                onClick={handleSave}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium"
              >
                💾 שמור
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 border py-2 rounded-lg hover:bg-gray-50 text-gray-600"
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {confirm && (
        <ConfirmModal
          title={confirm.type === "delete" ? "למחוק משימה זו?" : "לסמן כהושלם?"}
          message={confirm.task.title}
          confirmLabel={confirm.type === "delete" ? "מחק" : "כן, סיימתי ✓"}
          confirmColor={
            confirm.type === "delete"
              ? "bg-red-500 hover:bg-red-600"
              : "bg-green-500 hover:bg-green-600"
          }
          onConfirm={handleConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}
