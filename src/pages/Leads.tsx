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

function isOverdue(dateStr?: string) {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
}

export default function Leads() {
  const { leads, setLeads } = useLeadsStore();
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [editing, setEditing] = useState<Lead | null>(null);
  const [viewing, setViewing] = useState<Lead | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<LeadStatus>("new");
  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState<LeadPriority | "all">(
    "all",
  );

  useEffect(() => {
    const unsub = subscribeLeads(setLeads);
    return unsub;
  }, []);

  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      const matchSearch =
        !search ||
        l.name?.toLowerCase().includes(search.toLowerCase()) ||
        l.address?.toLowerCase().includes(search.toLowerCase()) ||
        l.phone?.includes(search);
      const matchPriority =
        filterPriority === "all" || l.priority === filterPriority;
      return matchSearch && matchPriority;
    });
  }, [leads, search, filterPriority]);

  // Dashboard stats
  const stats = useMemo(
    () => ({
      newCount: leads.filter((l) => l.status === "new").length,
      activeCount: leads.filter((l) =>
        ["contacted", "proposal", "negotiation"].includes(l.status),
      ).length,
      closedMonth: leads.filter((l) => l.status === "closed").length,
      newBuildings: leads.filter((l) => l.status === "new").length,
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

      {/* ===== FILTERS + ADD ===== */}
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
        <button
          onClick={() => handleAdd("new")}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
        >
          + ליד חדש
        </button>
      </div>

      {/* ===== KANBAN BOARD ===== */}
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
                                {/* Priority color bar */}
                                {pri && (
                                  <div className={`h-1 w-full ${pri.bar}`} />
                                )}

                                <div className="p-3">
                                  {/* Address */}
                                  <p className="font-bold text-sm text-gray-800 leading-tight mb-1">
                                    🏢 {lead.address || lead.name}
                                  </p>

                                  {/* Tenants */}
                                  {lead.tenantsCount && (
                                    <p className="text-xs text-gray-500">
                                      👥 {lead.tenantsCount} דיירים
                                    </p>
                                  )}

                                  {/* Contact */}
                                  <p className="text-xs text-gray-600 mt-1">
                                    👤 {lead.name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    📞 {lead.phone}
                                  </p>

                                  {/* Competitor */}
                                  {lead.currentCompany && (
                                    <p className="text-xs text-gray-400 mt-1">
                                      🏢 {lead.currentCompany}
                                    </p>
                                  )}

                                  {/* Cost */}
                                  {lead.managementCost && (
                                    <p className="text-xs font-semibold text-gray-700 mt-1">
                                      💰 עלות {lead.managementCost}₪
                                    </p>
                                  )}

                                  {/* Follow up date */}
                                  {lead.followUpDate && (
                                    <p
                                      className={`text-xs mt-1 font-medium ${overdue ? "text-red-600" : "text-gray-500"}`}
                                    >
                                      📅 {overdue ? "⚠️ " : ""}
                                      {lead.followUpDate}
                                    </p>
                                  )}

                                  {/* Priority badge */}
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

                                  {/* Actions */}
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
