import { useEffect, useState, useMemo } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import {
  subscribeLeads,
  updateLead,
  deleteLead,
  getOrderBetween,
} from "../lib/leads.service";
import { useLeadsStore } from "../store/leadsStore";
import type { Lead, LeadStatus, LeadPriority } from "../types";
import LeadFormModal from "../components/leads/LeadFormModal";
import LeadDetailModal from "../components/leads/LeadDetailModal";

// ─── Constants ────────────────────────────────────────────────────────────────

const COLUMNS: {
  id: LeadStatus;
  label: string;
  headerBg: string;
  bg: string;
  border: string;
}[] = [
  {
    id: "new",
    label: "לידים חדשים",
    headerBg: "bg-blue-600",
    bg: "bg-gray-50",
    border: "border-gray-200",
  },
  {
    id: "contacted",
    label: "יצירת קשר",
    headerBg: "bg-purple-600",
    bg: "bg-purple-50/30",
    border: "border-purple-200",
  },
  {
    id: "proposal",
    label: "הצעה נשלחה",
    headerBg: "bg-orange-500",
    bg: "bg-orange-50/30",
    border: "border-orange-200",
  },
  {
    id: "negotiation",
    label: "מעקב הצעה",
    headerBg: "bg-yellow-500",
    bg: "bg-yellow-50/30",
    border: "border-yellow-200",
  },
  {
    id: "closed",
    label: "נסגר",
    headerBg: "bg-green-600",
    bg: "bg-green-50/30",
    border: "border-green-200",
  },
  {
    id: "irrelevant",
    label: "לא רלוונטי",
    headerBg: "bg-gray-400",
    bg: "bg-gray-50",
    border: "border-gray-200",
  },
];

const PRIORITY: Record<
  LeadPriority,
  { label: string; bar: string; badge: string; text: string }
> = {
  high: {
    label: "גבוהה",
    bar: "bg-red-500",
    badge: "bg-red-100 text-red-700",
    text: "text-red-600",
  },
  medium: {
    label: "בינונית",
    bar: "bg-yellow-400",
    badge: "bg-yellow-100 text-yellow-700",
    text: "text-yellow-600",
  },
  low: {
    label: "נמוכה",
    bar: "bg-green-400",
    badge: "bg-green-100 text-green-700",
    text: "text-green-600",
  },
};

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  new: { label: "חדש", color: "bg-blue-100 text-blue-700" },
  contacted: { label: "יצירת קשר", color: "bg-purple-100 text-purple-700" },
  proposal: { label: "הצעה נשלחה", color: "bg-orange-100 text-orange-700" },
  negotiation: { label: "מעקב הצעה", color: "bg-yellow-100 text-yellow-700" },
  closed: { label: "נסגר ✅", color: "bg-green-100 text-green-700" },
  irrelevant: { label: "לא רלוונטי", color: "bg-gray-100 text-gray-500" },
};

const PRIORITY_LABEL: Record<LeadPriority, string> = {
  high: "🔴 גבוהה",
  medium: "🟡 בינונית",
  low: "🟢 נמוכה",
};

// Priority sort weight: high comes first when sorting asc
const PRIORITY_WEIGHT: Record<string, number> = { high: 3, medium: 2, low: 1 };

// Status sort order
const STATUS_ORDER: Record<string, number> = {
  new: 1,
  contacted: 2,
  proposal: 3,
  negotiation: 4,
  closed: 5,
  irrelevant: 6,
};

// ─── Sort types ───────────────────────────────────────────────────────────────

type SortKey =
  | "address"
  | "name"
  | "phone"
  | "tenantsCount"
  | "currentCompany"
  | "managementCost"
  | "status"
  | "priority"
  | "followUpDate"
  | null;

type SortDir = "asc" | "desc";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isOverdue(dateStr?: string) {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
}

function sortLeads(leads: Lead[], key: SortKey, dir: SortDir): Lead[] {
  if (!key) return leads;
  return [...leads].sort((a, b) => {
    let aVal: any;
    let bVal: any;

    if (key === "priority") {
      aVal = PRIORITY_WEIGHT[a.priority ?? ""] ?? 0;
      bVal = PRIORITY_WEIGHT[b.priority ?? ""] ?? 0;
    } else if (key === "status") {
      aVal = STATUS_ORDER[a.status ?? ""] ?? 99;
      bVal = STATUS_ORDER[b.status ?? ""] ?? 99;
    } else if (key === "followUpDate") {
      // Empty dates go to the bottom always
      if (!a.followUpDate && !b.followUpDate) return 0;
      if (!a.followUpDate) return 1;
      if (!b.followUpDate) return -1;
      aVal = new Date(a.followUpDate).getTime();
      bVal = new Date(b.followUpDate).getTime();
    } else if (key === "managementCost" || key === "tenantsCount") {
      aVal = Number(a[key]) || 0;
      bVal = Number(b[key]) || 0;
    } else {
      aVal = ((a[key] as string) ?? "").toLowerCase();
      bVal = ((b[key] as string) ?? "").toLowerCase();
    }

    if (aVal < bVal) return dir === "asc" ? -1 : 1;
    if (aVal > bVal) return dir === "asc" ? 1 : -1;
    return 0;
  });
}

// ─── Table View ───────────────────────────────────────────────────────────────

interface TableViewProps {
  leads: Lead[];
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (key: SortKey) => void;
  onEdit: (lead: Lead) => void;
  onView: (lead: Lead) => void;
  onDelete: (e: React.MouseEvent, id: string) => void;
}

interface ColConfig {
  key: SortKey;
  label: string;
  className?: string;
}

const TABLE_COLUMNS: ColConfig[] = [
  { key: "address", label: "כתובת" },
  { key: "name", label: "שם ועד" },
  { key: "phone", label: "טלפון" },
  { key: "tenantsCount", label: "דיירים" },
  { key: "currentCompany", label: "חברה נוכחית" },
  { key: "managementCost", label: "עלות ניהול" },
  { key: "status", label: "סטטוס" },
  { key: "priority", label: "עדיפות" },
  { key: "followUpDate", label: "מועד מעקב" },
];

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) {
    return <span className="text-gray-300 text-xs mr-1">⇅</span>;
  }
  return (
    <span className="text-blue-500 text-xs mr-1">
      {dir === "asc" ? "↑" : "↓"}
    </span>
  );
}

function LeadTableView({
  leads,
  sortKey,
  sortDir,
  onSort,
  onEdit,
  onView,
  onDelete,
}: TableViewProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm bg-white">
      <table className="w-full text-sm" dir="rtl">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs">
            {/* Row number — not sortable */}
            <th className="px-3 py-3 text-right font-semibold w-8 text-gray-400">
              #
            </th>

            {TABLE_COLUMNS.map((col) => (
              <th
                key={col.key}
                onClick={() => onSort(col.key)}
                className="px-3 py-3 text-right font-semibold cursor-pointer select-none hover:bg-gray-100 transition-colors whitespace-nowrap"
              >
                <span className="inline-flex items-center gap-0.5">
                  <SortIcon active={sortKey === col.key} dir={sortDir} />
                  {col.label}
                </span>
              </th>
            ))}

            {/* Actions — not sortable */}
            <th className="px-3 py-3 text-right font-semibold text-gray-400">
              פעולות
            </th>
          </tr>
        </thead>
        <tbody>
          {leads.length === 0 && (
            <tr>
              <td colSpan={11} className="text-center py-12 text-gray-400">
                אין לידים להצגה
              </td>
            </tr>
          )}
          {leads.map((lead, i) => {
            const overdue = isOverdue(lead.followUpDate);
            const status = STATUS_LABEL[lead.status] ?? {
              label: lead.status,
              color: "bg-gray-100 text-gray-600",
            };

            return (
              <tr
                key={lead.id}
                onClick={() => onView(lead)}
                className={`border-b border-gray-100 hover:bg-blue-50/40 cursor-pointer transition-colors
                  ${i % 2 === 0 ? "bg-white" : "bg-gray-50/40"}
                  ${overdue ? "ring-1 ring-inset ring-red-300" : ""}`}
              >
                <td className="px-3 py-3 text-gray-400 text-xs">{i + 1}</td>

                <td className="px-3 py-3 font-semibold text-gray-800 max-w-[160px] truncate">
                  {lead.address || "—"}
                </td>

                <td className="px-3 py-3 text-gray-700">{lead.name || "—"}</td>

                <td className="px-3 py-3 text-gray-600 font-mono text-xs">
                  {lead.phone || "—"}
                </td>

                <td className="px-3 py-3 text-gray-500 text-center">
                  {lead.tenantsCount ? `${lead.tenantsCount} 👥` : "—"}
                </td>

                <td className="px-3 py-3 text-gray-500 max-w-[120px] truncate">
                  {lead.currentCompany || "—"}
                </td>

                <td className="px-3 py-3 text-gray-700 font-medium">
                  {lead.managementCost ? `₪${lead.managementCost}` : "—"}
                </td>

                <td className="px-3 py-3">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${status.color}`}
                  >
                    {status.label}
                  </span>
                </td>

                <td className="px-3 py-3 text-xs whitespace-nowrap">
                  {lead.priority ? PRIORITY_LABEL[lead.priority] : "—"}
                </td>

                <td
                  className={`px-3 py-3 text-xs font-medium whitespace-nowrap ${
                    overdue ? "text-red-600" : "text-gray-500"
                  }`}
                >
                  {lead.followUpDate
                    ? `${overdue ? "⚠️ " : ""}${lead.followUpDate}`
                    : "—"}
                </td>

                <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                  <div className="flex gap-1">
                    <button
                      onClick={() => onEdit(lead)}
                      className="text-xs border border-blue-300 text-blue-600 px-2 py-1 rounded hover:bg-blue-50"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={(e) => lead.id && onDelete(e, lead.id)}
                      className="text-xs border border-red-300 text-red-500 px-2 py-1 rounded hover:bg-red-50"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Leads() {
  const { leads, setLeads } = useLeadsStore();
  const [viewMode, setViewMode] = useState<"table" | "kanban">("table");
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [editing, setEditing] = useState<Lead | null>(null);
  const [viewing, setViewing] = useState<Lead | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<LeadStatus>("new");
  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState<LeadPriority | "all">(
    "all",
  );
  const [sortKey, setSortKey] = useState<SortKey>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  useEffect(() => {
    const unsub = subscribeLeads(setLeads);
    return unsub;
  }, []);

  // Clicking the same column flips direction; new column resets to asc
  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const filteredLeads = useMemo(() => {
    const base = leads.filter((l) => {
      const matchSearch =
        !search ||
        l.name?.toLowerCase().includes(search.toLowerCase()) ||
        l.address?.toLowerCase().includes(search.toLowerCase()) ||
        l.phone?.includes(search);
      const matchPriority =
        filterPriority === "all" || l.priority === filterPriority;
      return matchSearch && matchPriority;
    });
    return sortLeads(base, sortKey, sortDir);
  }, [leads, search, filterPriority, sortKey, sortDir]);

  // Dashboard stats (always from raw leads, not filtered)
  const stats = useMemo(
    () => ({
      newCount: leads.filter((l) => l.status === "new").length,
      activeCount: leads.filter((l) =>
        ["contacted", "proposal", "negotiation"].includes(l.status),
      ).length,
      closedMonth: leads.filter((l) => l.status === "closed").length,
    }),
    [leads],
  );

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const { destination, draggableId } = result;
    const newStatus = destination.droppableId as LeadStatus;
    const destLeads = filteredLeads
      .filter((l) => l.status === newStatus)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const filtered = destLeads.filter((l) => l.id !== draggableId);
    const beforeItem = filtered[destination.index - 1];
    const afterItem = filtered[destination.index];
    const newOrder = getOrderBetween(beforeItem?.order, afterItem?.order);
    updateLead(draggableId, { status: newStatus, order: newOrder });
  };

  const handleAdd = (status: LeadStatus) => {
    setEditing(null);
    setDefaultStatus(status);
    setShowForm(true);
  };

  const handleEdit = (e: React.MouseEvent, lead: Lead) => {
    e.stopPropagation();
    setEditing(lead);
    setShowForm(true);
  };

  const handleEditFromTable = (lead: Lead) => {
    setEditing(lead);
    setShowForm(true);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("למחוק ליד זה?")) deleteLead(id);
  };

  const handleCardClick = (lead: Lead) => {
    setViewing(lead);
    setShowDetail(true);
  };

  return (
    <div dir="rtl" className="h-full flex flex-col gap-4">
      {/* ===== DASHBOARD BAR ===== */}
      <div className="flex gap-3 flex-wrap flex-shrink-0">
        <div className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-xl font-bold text-sm shadow">
          <span className="text-xl font-black">{stats.newCount}</span>
          <span>• לידים חדשים</span>
        </div>
        <div className="flex items-center gap-2 bg-green-600 text-white px-5 py-3 rounded-xl font-bold text-sm shadow">
          <span className="text-xl font-black">{stats.activeCount}</span>
          <span>• הצעות פעילות</span>
        </div>
        <div className="flex items-center gap-2 bg-orange-500 text-white px-5 py-3 rounded-xl font-bold text-sm shadow">
          <span className="text-xl font-black">{stats.closedMonth}</span>
          <span>• נסגרו החודש</span>
        </div>
        <div className="flex items-center gap-2 bg-gray-200 text-gray-700 px-5 py-3 rounded-xl font-bold text-sm shadow mr-auto">
          <span className="text-xl font-black">{leads.length}</span>
          <span>• סה"כ לידים</span>
        </div>
      </div>

      {/* ===== FILTERS + VIEW TOGGLE + ADD ===== */}
      <div className="flex gap-2 flex-wrap flex-shrink-0">
        <input
          placeholder="🔍 חיפוש לפי שם, כתובת, טלפון..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm flex-1 min-w-48 focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value as any)}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          <option value="all">כל העדיפויות</option>
          <option value="high">🔴 גבוהה</option>
          <option value="medium">🟡 בינונית</option>
          <option value="low">🟢 נמוכה</option>
        </select>

        {/* VIEW TOGGLE */}
        <div className="flex border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <button
            onClick={() => setViewMode("table")}
            title="תצוגת טבלה"
            className={`px-3 py-2 text-sm font-medium transition-colors ${
              viewMode === "table"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-500 hover:bg-gray-50"
            }`}
          >
            ☰ טבלה
          </button>
          <button
            onClick={() => setViewMode("kanban")}
            title="תצוגת קנבן"
            className={`px-3 py-2 text-sm font-medium transition-colors border-r border-gray-200 ${
              viewMode === "kanban"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-500 hover:bg-gray-50"
            }`}
          >
            ⊞ קנבן
          </button>
        </div>

        <button
          onClick={() => handleAdd("new")}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
        >
          + ליד חדש
        </button>
      </div>

      {/* ===== TABLE VIEW ===== */}
      {viewMode === "table" && (
        <div className="flex-1 overflow-auto">
          <LeadTableView
            leads={filteredLeads}
            sortKey={sortKey}
            sortDir={sortDir}
            onSort={handleSort}
            onEdit={handleEditFromTable}
            onView={handleCardClick}
            onDelete={handleDelete}
          />
        </div>
      )}

      {/* ===== KANBAN BOARD ===== */}
      {viewMode === "kanban" && (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-3 overflow-x-auto pb-4 flex-1 items-start">
            {COLUMNS.map((col) => {
              const colLeads = filteredLeads
                .filter((l) => l.status === col.id)
                .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

              return (
                <div
                  key={col.id}
                  className={`flex-shrink-0 w-60 rounded-xl border ${col.border} flex flex-col overflow-hidden shadow-sm`}
                >
                  {/* Column header */}
                  <div
                    className={`${col.headerBg} text-white px-3 py-2 flex justify-between items-center`}
                  >
                    <span className="font-bold text-sm">{col.label}</span>
                    <span className="bg-white/30 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {colLeads.length}
                    </span>
                  </div>

                  <Droppable droppableId={col.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 min-h-20 p-2 space-y-2 transition-colors ${col.bg}
                          ${snapshot.isDraggingOver ? "bg-blue-50" : ""}`}
                      >
                        {colLeads.map((lead, index) => {
                          const pri = lead.priority
                            ? PRIORITY[lead.priority]
                            : null;
                          const overdue = isOverdue(lead.followUpDate);

                          return (
                            <Draggable
                              key={lead.id}
                              draggableId={lead.id!}
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  onClick={() => handleCardClick(lead)}
                                  className={`bg-white rounded-lg shadow-sm border overflow-hidden cursor-pointer transition-all select-none
                                    ${snapshot.isDragging ? "shadow-xl rotate-1 scale-105 border-blue-300" : "border-gray-100 hover:shadow-md"}
                                    ${overdue ? "ring-2 ring-red-400" : ""}`}
                                >
                                  {pri && (
                                    <div className={`h-1 w-full ${pri.bar}`} />
                                  )}

                                  <div className="p-3">
                                    <p className="font-bold text-sm text-gray-800 leading-tight mb-1">
                                      🏢 {lead.address || lead.name}
                                    </p>
                                    {lead.tenantsCount && (
                                      <p className="text-xs text-gray-500">
                                        👥 {lead.tenantsCount} דיירים
                                      </p>
                                    )}
                                    <p className="text-xs text-gray-600 mt-1">
                                      👤 {lead.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      📞 {lead.phone}
                                    </p>
                                    {lead.currentCompany && (
                                      <p className="text-xs text-gray-400 mt-1">
                                        🏢 {lead.currentCompany}
                                      </p>
                                    )}
                                    {lead.managementCost && (
                                      <p className="text-xs font-semibold text-gray-700 mt-1">
                                        💰 עלות {lead.managementCost}₪
                                      </p>
                                    )}
                                    {lead.followUpDate && (
                                      <p
                                        className={`text-xs mt-1 font-medium ${overdue ? "text-red-600" : "text-gray-500"}`}
                                      >
                                        📅 {overdue ? "⚠️ " : ""}
                                        {lead.followUpDate}
                                      </p>
                                    )}
                                    {pri && (
                                      <span
                                        className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full font-medium ${pri.badge}`}
                                      >
                                        {pri.label}
                                      </span>
                                    )}
                                    {lead.proposalConfirmed === true && (
                                      <p className="text-xs text-green-600 mt-1">
                                        ✅ אישרו קבלה
                                      </p>
                                    )}
                                    {lead.proposalConfirmed === false && (
                                      <p className="text-xs text-red-500 mt-1">
                                        ❌ לא ענו
                                      </p>
                                    )}
                                    {lead.notes && (
                                      <div className="mt-2 bg-gray-50 rounded-lg p-2 border border-gray-100">
                                        <p className="text-xs text-gray-500 leading-relaxed">
                                          💬 {lead.notes}
                                        </p>
                                      </div>
                                    )}
                                    <div
                                      className="flex gap-1 mt-2"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <button
                                        onClick={(e) => handleEdit(e, lead)}
                                        className="flex-1 text-xs border border-blue-400 text-blue-600 py-1 rounded hover:bg-blue-50"
                                      >
                                        ✏️
                                      </button>
                                      <button
                                        onClick={(e) =>
                                          lead.id && handleDelete(e, lead.id)
                                        }
                                        className="text-xs border border-red-300 text-red-500 px-2 py-1 rounded hover:bg-red-50"
                                      >
                                        🗑️
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}

                        <button
                          onClick={() => handleAdd(col.id)}
                          className="w-full text-xs text-gray-400 hover:text-gray-600 py-2 border border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
                        >
                          + הוסף
                        </button>
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      )}

      {/* ===== MODALS ===== */}
      {showForm && (
        <LeadFormModal
          lead={editing}
          defaultStatus={defaultStatus}
          onClose={() => setShowForm(false)}
        />
      )}
      {showDetail && viewing && (
        <LeadDetailModal
          lead={viewing}
          onClose={() => setShowDetail(false)}
          onEdit={() => {
            setShowDetail(false);
            setEditing(viewing);
            setShowForm(true);
          }}
        />
      )}
    </div>
  );
}
