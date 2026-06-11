import type { Lead, LeadPriority } from "../../types";
import { deleteLead } from "../../lib/leads.service";

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

function isOverdue(dateStr?: string) {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
}

interface Props {
  leads: Lead[];
  onEdit: (lead: Lead) => void;
  onView: (lead: Lead) => void;
}

export default function LeadTableView({ leads, onEdit, onView }: Props) {
  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("למחוק ליד זה?")) deleteLead(id);
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
      <table className="w-full text-sm" dir="rtl">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs">
            <th className="px-3 py-3 text-right font-semibold w-8">#</th>
            <th className="px-3 py-3 text-right font-semibold">כתובת</th>
            <th className="px-3 py-3 text-right font-semibold">שם ועד</th>
            <th className="px-3 py-3 text-right font-semibold">טלפון</th>
            <th className="px-3 py-3 text-right font-semibold">דיירים</th>
            <th className="px-3 py-3 text-right font-semibold">חברה נוכחית</th>
            <th className="px-3 py-3 text-right font-semibold">עלות ניהול</th>
            <th className="px-3 py-3 text-right font-semibold">סטטוס</th>
            <th className="px-3 py-3 text-right font-semibold">עדיפות</th>
            <th className="px-3 py-3 text-right font-semibold">מועד מעקב</th>
            <th className="px-3 py-3 text-right font-semibold">פעולות</th>
          </tr>
        </thead>
        <tbody>
          {leads.length === 0 && (
            <tr>
              <td colSpan={11} className="text-center py-10 text-gray-400">
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
                  ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}
                  ${overdue ? "ring-1 ring-inset ring-red-300" : ""}`}
              >
                <td className="px-3 py-3 text-gray-400 font-mono">{i + 1}</td>
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
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}
                  >
                    {status.label}
                  </span>
                </td>
                <td className="px-3 py-3 text-xs">
                  {lead.priority ? PRIORITY_LABEL[lead.priority] : "—"}
                </td>
                <td
                  className={`px-3 py-3 text-xs font-medium ${overdue ? "text-red-600" : "text-gray-500"}`}
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
                      onClick={(e) => lead.id && handleDelete(e, lead.id)}
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
