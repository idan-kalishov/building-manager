// Dashboard.tsx
import { useEffect, useState, useMemo } from "react";
import {
  subscribeTasks,
  addTask,
  updateTask,
  deleteTask,
} from "../lib/tasks.service";
import type { Task, TaskPriority, TaskUpdate, Technician } from "../types";
import type { ContactPerson } from "../types";
import ConfirmModal from "../components/ConfirmModal";
import ContactPersonsSection from "../components/ContactPersonsSection";
import AddUpdateForm from "../components/updates/AddUpdateForm.tsx";
import SupplierSelector from "../components/suppliers/SupplierSelector.tsx";
import BuildingAddressInput from "../components/BuildingAddressInput";
import DueDatePicker from "../components/DueDatePicker";

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

const TECHNICIAN_COLORS: Record<Technician, string> = {
  גדי: "bg-blue-100 text-blue-800",
  עידן: "bg-purple-100 text-purple-800",
  אחר: "bg-gray-100 text-gray-800",
};

const TECHNICIAN_ICONS: Record<Technician, string> = {
  גדי: "👨‍🔧",
  עידן: "👷",
  אחר: "👤",
};

function isOverdue(dateStr?: string, done?: boolean) {
  if (!dateStr || done) return false;
  return new Date(dateStr) < new Date(new Date().toDateString());
}

function isToday(dateStr?: string) {
  if (!dateStr) return false;
  return dateStr === new Date().toISOString().split("T")[0];
}

function formatTaskDate(dateStr: string) {
  const [year, month, day] = dateStr.split("-");
  if (!year || !month || !day) return dateStr;
  return `${day}-${month}-${year}`;
}

const EMPTY_TASK: Partial<Task> = {
  priority: "medium",
  updates: [],
  contactPersons: [],
  notes: "",
};

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
  const [deleteUpdateConfirm, setDeleteUpdateConfirm] = useState<{
    taskId: string;
    updateId: string;
  } | null>(null);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [showAddUpdateForTask, setShowAddUpdateForTask] = useState<
    string | null
  >(null);
  const [editingUpdate, setEditingUpdate] = useState<{
    taskId: string;
    update: TaskUpdate;
  } | null>(null);
  const [contactPersons, setContactPersons] = useState<ContactPerson[]>([]);
  const [taskNotes, setTaskNotes] = useState("");
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>("");
  const [selectedSupplierName, setSelectedSupplierName] = useState<string>("");

  useEffect(() => {
    const unsub = subscribeTasks(setTasks);
    return unsub;
  }, []);

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_TASK);
    setContactPersons([]);
    setTaskNotes("");
    setSelectedSupplierId("");
    setSelectedSupplierName("");
    setShowForm(true);
  };

  const openEdit = (task: Task) => {
    setEditing(task);
    setForm({ ...task });
    setContactPersons(task.contactPersons || []);
    setTaskNotes(task.notes || "");
    setSelectedSupplierId(task.supplierId || "");
    setSelectedSupplierName(task.supplierName || "");
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title) return alert("כותרת היא שדה חובה");

    const taskData = {
      ...form,
      updates: form.updates || [],
      contactPersons: contactPersons.map((person) => ({
        id: person.id,
        name: person.name || "",
        phone: String(person.phone || ""),
        ...(person.role ? { role: person.role } : {}),
        ...(person.notes ? { notes: person.notes } : {}),
      })),
      notes: taskNotes,
      supplierId: selectedSupplierId,
      supplierName: selectedSupplierName,
    };

    try {
      if (editing?.id) {
        await updateTask(editing.id, taskData);
      } else {
        await addTask(taskData as Omit<Task, "id">);
      }
    } catch (error) {
      console.error("Failed to save task", error);
      alert("שמירת המשימה נכשלה. הפרטים נשארו פתוחים—נסו שוב.");
      return;
    }
    setShowForm(false);
    setForm(EMPTY_TASK);
    setContactPersons([]);
    setTaskNotes("");
    setSelectedSupplierId("");
    setSelectedSupplierName("");
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

  const handleAddUpdate = async (
    taskId: string,
    updateData: Omit<TaskUpdate, "id" | "timestamp">,
  ) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const newUpdate: TaskUpdate = {
      id: Date.now().toString(),
      ...updateData,
      timestamp: new Date().toISOString(),
    };

    await updateTask(taskId, {
      updates: [...(task.updates || []), newUpdate],
      ...(updateData.newDueDate ? { dueDate: updateData.newDueDate } : {}),
    });
    setShowAddUpdateForTask(null);
  };

  const handleEditUpdate = async () => {
    if (!editingUpdate) return;

    const { taskId, update } = editingUpdate;

    if (!update.message.trim()) {
      alert("אנא הזן תוכן עדכון");
      return;
    }

    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const updatedUpdates = task.updates?.map((u) =>
      u.id === update.id
        ? {
            ...u,
            message: update.message.trim(),
            technician: update.technician,
            timestamp: new Date().toISOString(),
          }
        : u,
    );

    await updateTask(taskId, { updates: updatedUpdates });
    setEditingUpdate(null);
  };

  const handleDeleteUpdate = async () => {
    if (!deleteUpdateConfirm) return;

    const task = tasks.find((t) => t.id === deleteUpdateConfirm.taskId);
    if (!task) return;

    const updatedUpdates = task.updates?.filter(
      (u) => u.id !== deleteUpdateConfirm.updateId,
    );
    await updateTask(deleteUpdateConfirm.taskId, { updates: updatedUpdates });
    setDeleteUpdateConfirm(null);
  };

  const startEditUpdate = (taskId: string, update: TaskUpdate) => {
    setEditingUpdate({ taskId, update });
    setShowAddUpdateForTask(null);
  };

  const cancelEditUpdate = () => {
    setEditingUpdate(null);
  };

  const toggleExpand = (taskId: string) => {
    setExpandedTaskId(expandedTaskId === taskId ? null : taskId);
    setShowAddUpdateForTask(null);
    setEditingUpdate(null);
  };

  const updateEditingUpdate = (field: keyof TaskUpdate, value: any) => {
    if (!editingUpdate) return;
    setEditingUpdate({
      ...editingUpdate,
      update: {
        ...editingUpdate.update,
        [field]: value,
      },
    });
  };

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
    <div dir="rtl" className="max-w-5xl mx-auto pb-20">
      <h1 className="text-2xl font-bold mb-4">📋 לוח משימות</h1>

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
          const isExpanded = expandedTaskId === task.id;
          const hasUpdates = task.updates && task.updates.length > 0;
          const showAddForm = showAddUpdateForTask === task.id;
          const isEditing = editingUpdate?.taskId === task.id;

          return (
            <div
              key={task.id}
              className="grid grid-cols-[minmax(5.5rem,0.9fr)_minmax(0,3fr)] items-stretch gap-2 sm:grid-cols-[minmax(7rem,0.8fr)_minmax(0,3fr)] sm:gap-3"
            >
              <div
                className={`flex min-h-20 min-w-0 flex-col items-center justify-start gap-2 rounded-2xl border border-blue-100 bg-blue-50 px-2 py-5 text-center text-base font-semibold leading-snug text-blue-900 sm:min-h-0 sm:flex-row sm:items-start sm:justify-center sm:px-3 sm:py-5 sm:text-base
                  ${task.done ? "opacity-60" : ""}`}
                aria-label={`בניין: ${task.buildingAddress || "לא צוין"}`}
              >
                <span className="shrink-0 text-xl sm:text-2xl" aria-hidden="true">
                  🏢
                </span>
                <span className="min-w-0 break-words leading-snug">
                  {task.buildingAddress || "לא צוין"}
                </span>
              </div>
              <div
                className={`min-w-0 overflow-hidden rounded-2xl border bg-white shadow-sm transition-all
                ${overdue ? "border-red-400 bg-red-50/50" : pri.border}
                ${task.done ? "opacity-50" : ""}`}
              >
              {/* Task Header - Clickable */}
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-stretch gap-x-3 gap-y-3 p-4 md:gap-4 md:p-4">
                <button
                  type="button"
                  aria-expanded={isExpanded}
                  onClick={() => toggleExpand(task.id ?? "")}
                  className="col-span-2 flex w-full min-w-0 items-center gap-3 rounded-xl py-3 text-right transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 md:col-span-1"
                  aria-label={`משימה: ${task.title}`}
                >
                  <span
                    className={`h-4 w-4 shrink-0 rounded-full ${pri.dot}`}
                    aria-label={pri.label}
                  />
                  <span
                    className={`min-w-0 flex-1 break-words text-2xl font-bold leading-snug md:text-lg ${task.done ? "line-through text-gray-400" : "text-gray-900"}`}
                  >
                    {task.title}
                  </span>
                  {hasUpdates && (
                    <span className="hidden shrink-0 rounded-full bg-blue-100 px-2 py-1 text-sm text-blue-700 sm:inline">
                      📝 {task.updates!.length}
                    </span>
                  )}
                  <span className="shrink-0 text-gray-500" aria-hidden="true">
                    {isExpanded ? "▲" : "▼"}
                  </span>
                </button>

                {/* Actions */}
                <div className="col-span-2 flex items-center justify-end gap-2 border-t border-gray-100 pt-2 md:col-span-1 md:border-0 md:pt-0">
                  {!task.done ? (
                    <button
                      onClick={() => handleDoneClick(task)}
                      aria-label="סיים משימה"
                      className="rounded-lg bg-green-600 px-3 py-3 text-base font-semibold text-white transition-colors hover:bg-green-700"
                    >
                      ✓ סיים
                    </button>
                  ) : (
                    <button
                      onClick={() => toggleDone(task)}
                      aria-label="פתח משימה מחדש"
                      className="rounded-lg border border-gray-300 px-3 py-3 text-base text-gray-600 hover:bg-gray-50"
                    >
                      ↩️ פתח מחדש
                    </button>
                  )}
                  <button
                    onClick={() => openEdit(task)}
                    aria-label="ערוך משימה"
                    className="rounded-lg border border-blue-300 px-3 py-3 text-base text-blue-700 hover:bg-blue-50"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(task)}
                    aria-label="מחק משימה"
                    className="rounded-lg border border-red-300 px-3 py-3 text-base text-red-600 hover:bg-red-50"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              {/* Expanded Task Details and Updates */}
              {isExpanded && (
                <div className="border-t bg-gray-50/70 px-4 py-4 md:px-6">
                  <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {task.description && (
                      <div className="rounded-xl border border-gray-100 bg-white p-3 sm:col-span-2 lg:col-span-3">
                        <p className="mb-1 text-sm font-semibold text-gray-500">
                          פירוט
                        </p>
                        <p className="whitespace-pre-wrap text-base leading-relaxed text-gray-800">
                          {task.description}
                        </p>
                      </div>
                    )}
                    {task.dueDate && (
                      <div className="rounded-xl border border-gray-100 bg-white p-3">
                        <p className="mb-1 text-sm font-semibold text-gray-500">
                          תאריך יעד
                        </p>
                        <p
                          className={`text-base font-medium ${overdue ? "text-red-600" : today ? "text-orange-600" : "text-gray-800"}`}
                        >
                          <span dir="ltr" className="inline-block">
                            📅 {formatTaskDate(task.dueDate)}
                          </span>
                          {(overdue || today) && (
                            <span>{overdue ? " · באיחור" : " · היום"}</span>
                          )}
                        </p>
                      </div>
                    )}
                    <div className="rounded-xl border border-gray-100 bg-white p-3">
                      <p className="mb-1 text-sm font-semibold text-gray-500">
                        עדיפות
                      </p>
                      <p className={`text-base font-medium ${pri.text}`}>
                        {pri.label}
                      </p>
                    </div>
                    {task.supplierName && (
                      <div className="rounded-xl border border-gray-100 bg-white p-3">
                        <p className="mb-1 text-sm font-semibold text-gray-500">
                          ספק
                        </p>
                        <p className="text-base text-blue-700">
                          🔧 {task.supplierName}
                        </p>
                      </div>
                    )}
                    {task.contactPersons?.length ? (
                      <div className="rounded-xl border border-gray-100 bg-white p-3 sm:col-span-2">
                        <p className="mb-2 text-sm font-semibold text-gray-500">
                          אנשי קשר
                        </p>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {task.contactPersons.map((person) => (
                            <div
                              key={person.id}
                              className="flex min-w-0 items-start gap-3 rounded-xl border border-gray-200 bg-white p-3 shadow-sm"
                            >
                              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xl text-blue-700">
                                👤
                              </span>
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="break-words text-base font-semibold text-gray-900">
                                    {person.name || "איש קשר"}
                                  </span>
                                  {person.role && (
                                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                                      {person.role}
                                    </span>
                                  )}
                                </div>
                                {person.phone ? (
                                  <a
                                    href={`tel:${person.phone.replace(/[^\d+]/g, "")}`}
                                    dir="ltr"
                                    className="mt-2 inline-flex max-w-full items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-left text-base font-semibold text-green-700 hover:bg-green-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400"
                                    aria-label={`התקשר אל ${person.name || "איש קשר"} במספר ${person.phone}`}
                                  >
                                    <span aria-hidden="true">📞</span>
                                    <span className="break-all">{person.phone}</span>
                                  </a>
                                ) : (
                                  <span className="mt-2 block text-sm text-gray-500">
                                    אין מספר טלפון
                                  </span>
                                )}
                                {person.notes && (
                                  <p className="mt-2 break-words text-sm text-gray-600">
                                    {person.notes}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                    {task.notes && (
                      <div className="rounded-xl border border-gray-100 bg-white p-3 sm:col-span-2 lg:col-span-3">
                        <p className="mb-1 text-sm font-semibold text-gray-500">
                          הערות
                        </p>
                        <p className="whitespace-pre-wrap text-base leading-relaxed text-gray-800">
                          {task.notes}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-3">
                    {/* Header with add button */}
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-semibold text-gray-700 flex items-center gap-2">
                        📋 היסטוריית עדכונים
                        <span className="rounded-full bg-gray-200 px-2 py-1 text-sm">
                          {task.updates?.length || 0}
                        </span>
                      </h4>
                      {!task.done && !isEditing && (
                        <button
                          onClick={() =>
                            setShowAddUpdateForTask(
                              showAddForm ? null : task.id!,
                            )
                          }
                          className="rounded-lg bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
                        >
                          {showAddForm ? "− ביטול" : "+ הוסף עדכון"}
                        </button>
                      )}
                    </div>

                    {/* Add Update Form - Using the new component */}
                    {showAddForm && !task.done && !isEditing && (
                      <AddUpdateForm
                        currentDueDate={task.dueDate}
                        onAddUpdate={(updateData) =>
                          handleAddUpdate(task.id!, updateData)
                        }
                        onCancel={() => setShowAddUpdateForTask(null)}
                      />
                    )}

                    {/* Edit Update Form */}
                    {isEditing && editingUpdate && (
                      <div className="bg-white rounded-lg p-3 space-y-3 border border-yellow-400">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-yellow-600">
                            ✏️ עריכת עדכון
                          </span>
                          <button
                            onClick={cancelEditUpdate}
                            className="text-xs text-gray-500 hover:text-gray-700"
                          >
                            ביטול
                          </button>
                        </div>
                        <div className="flex gap-2">
                          {["גדי", "עידן", "אחר"].map((tech) => (
                            <button
                              key={tech}
                              type="button"
                              onClick={() =>
                                updateEditingUpdate(
                                  "technician",
                                  tech as Technician,
                                )
                              }
                              className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-all
                                ${
                                  editingUpdate.update.technician === tech
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
                        <textarea
                          value={editingUpdate.update.message}
                          onChange={(e) =>
                            updateEditingUpdate("message", e.target.value)
                          }
                          rows={2}
                          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
                        />
                        <button
                          onClick={handleEditUpdate}
                          className="w-full bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600 text-sm font-medium"
                        >
                          עדכן שינויים
                        </button>
                      </div>
                    )}

                    {/* Updates List */}
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {!task.updates || task.updates.length === 0 ? (
                        <div className="text-center py-4 text-gray-400 text-sm">
                          אין עדכונים עדיין
                        </div>
                      ) : (
                        [...task.updates].reverse().map((update) => (
                          <div
                            key={update.id}
                            className="bg-white rounded-lg p-3 text-sm border group hover:shadow-sm transition-shadow"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${TECHNICIAN_COLORS[update.technician]}`}
                                >
                                  {TECHNICIAN_ICONS[update.technician]}{" "}
                                  {update.technician}
                                </span>
                                <span className="text-xs text-gray-400">
                                  {new Date(update.timestamp).toLocaleString(
                                    "he-IL",
                                  )}
                                </span>
                                {update.oldDueDate && update.newDueDate && (
                                  <span className="text-xs bg-yellow-50 text-yellow-700 px-1.5 py-0.5 rounded-full">
                                    📅 תאריך עודכן
                                  </span>
                                )}
                              </div>
                              {!task.done && !isEditing && (
                                <div className="flex shrink-0 gap-2">
                                  <button
                                    onClick={() =>
                                      startEditUpdate(task.id!, update)
                                    }
                                    className="text-xs text-blue-500 hover:text-blue-700 px-1"
                                    title="ערוך עדכון"
                                  >
                                    ✏️
                                  </button>
                                  <button
                                    onClick={() =>
                                      setDeleteUpdateConfirm({
                                        taskId: task.id!,
                                        updateId: update.id,
                                      })
                                    }
                                    className="text-xs text-red-500 hover:text-red-700 px-1"
                                    title="מחק עדכון"
                                  >
                                    🗑️
                                  </button>
                                </div>
                              )}
                            </div>
                            <p className="text-gray-700">{update.message}</p>
                            {update.oldDueDate && update.newDueDate && (
                              <div className="text-xs text-gray-500 bg-gray-50 rounded p-1.5 mt-1">
                                <span className="line-through text-red-500 ml-2">
                                  {update.oldDueDate}
                                </span>
                                <span className="text-green-600 font-medium">
                                  → {update.newDueDate}
                                </span>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
            </div>
          );
        })}
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-4"
          dir="rtl"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowForm(false);
          }}
        >
          <div className="bg-white rounded-2xl w-full max-w-xl flex flex-col max-h-[92vh]">
            <div className="flex justify-between items-center p-5 md:p-6 border-b">
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

            <div className="p-5 md:p-6 space-y-5 overflow-y-auto flex-1">
              <div className="flex flex-col gap-1">
                <label className="text-base font-medium text-gray-700">
                  כותרת *
                </label>
                <input
                  value={form.title || ""}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, title: e.target.value }))
                  }
                  placeholder="לדוגמה: לבדוק מעלית בבניין..."
                  className="border rounded-lg px-3 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-base font-medium text-gray-700">
                  פירוט
                </label>
                <textarea
                  value={form.description || ""}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, description: e.target.value }))
                  }
                  rows={2}
                  className="border rounded-lg px-3 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-base font-medium text-gray-700">
                  בניין קשור
                </label>
                <BuildingAddressInput
                  value={form.buildingAddress || ""}
                  onChange={(buildingAddress) =>
                    setForm((p) => ({ ...p, buildingAddress }))
                  }
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-base font-medium text-gray-700">
                  תאריך יעד
                </label>
                <DueDatePicker
                  value={form.dueDate || ""}
                  onChange={(dueDate) =>
                    setForm((p) => ({ ...p, dueDate }))
                  }
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-base font-medium text-gray-700">
                  עדיפות
                </label>
                <div className="flex gap-2">
                  {(["high", "medium", "low"] as TaskPriority[]).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setForm((d) => ({ ...d, priority: p }))}
                      className={`flex-1 py-3 rounded-lg text-base border transition-colors
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

              {/* Supplier Selector */}
              <div className="flex flex-col gap-1">
                <label className="text-base font-medium text-gray-700">
                  🔧 ספק
                </label>
                <SupplierSelector
                  selectedSupplierId={selectedSupplierId}
                  onSelect={(id: any, name: any) => {
                    setSelectedSupplierId(id);
                    setSelectedSupplierName(name);
                  }}
                  placeholder="חפש או בחר ספק..."
                />
              </div>

              {/* Contact Persons Section */}
              <ContactPersonsSection
                contactPersons={contactPersons}
                onChange={setContactPersons}
              />

              {/* Notes Section */}
              <div className="flex flex-col gap-1">
                <label className="text-base font-medium text-gray-700">
                  📝 הערות
                </label>
                <textarea
                  value={taskNotes}
                  onChange={(e) => setTaskNotes(e.target.value)}
                  placeholder="הוסף הערות כלליות למשימה..."
                  rows={2}
                  className="border rounded-lg px-3 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-2 p-5 md:p-6 border-t text-base">
              <button
                onClick={handleSave}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium"
              >
                💾 שמור
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 border py-3 rounded-lg hover:bg-gray-50 text-gray-600"
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal for Task Delete/Done */}
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

      {/* Confirm Modal for Delete Update */}
      {deleteUpdateConfirm && (
        <ConfirmModal
          title="למחוק עדכון זה?"
          message="הפעולה הזו לא ניתנת לביטול"
          confirmLabel="מחק"
          confirmColor="bg-red-500 hover:bg-red-600"
          onConfirm={handleDeleteUpdate}
          onCancel={() => setDeleteUpdateConfirm(null)}
        />
      )}
    </div>
  );
}
