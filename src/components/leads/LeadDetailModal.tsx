import type { Lead, LeadPriority } from "../../types";
import { deleteLead } from "../../lib/leads.service";

interface Props {
  lead: Lead;
  onClose: () => void;
  onEdit: () => void;
}

const Row = ({ label, value }: { label: string; value?: any }) =>
  value ? (
    <div className="flex justify-between py-2 border-b border-gray-100 last:border-0">
      <span className="text-gray-500 text-sm">{label}</span>
      <span className="text-gray-800 text-sm font-medium text-right max-w-[60%]">
        {String(value)}
      </span>
    </div>
  ) : null;

const PRIORITY_LABEL: Record<LeadPriority, string> = {
  high: "🔴 גבוהה",
  medium: "🟡 בינונית",
  low: "🟢 נמוכה",
};

const STATUS_LABEL: Record<string, string> = {
  new: "ליד חדש",
  contacted: "יצירת קשר",
  proposal: "הצעה נשלחה",
  negotiation: "מעקב הצעה",
  closed: "נסגר ✅",
  irrelevant: "לא רלוונטי ❌",
};

function isOverdue(dateStr?: string) {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
}

export default function LeadDetailModal({ lead, onClose, onEdit }: Props) {
  const overdue = isOverdue(lead.followUpDate);

  const handleDelete = async () => {
    if (confirm("למחוק ליד זה?")) {
      await deleteLead(lead.id!);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      dir="rtl"
    >
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <div>
            <h2 className="text-xl font-bold">{lead.address || lead.name}</h2>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
              {STATUS_LABEL[lead.status]}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Warning banner */}
          {overdue && (
            <div className="bg-red-50 border border-red-300 rounded-lg px-3 py-2 text-red-600 text-sm font-medium">
              ⚠️ מועד המשך טיפול עבר! ({lead.followUpDate})
            </div>
          )}

          {/* Priority */}
          {lead.priority && (
            <div className="text-sm font-medium">
              עדיפות: {PRIORITY_LABEL[lead.priority]}
            </div>
          )}

          <section>
            <h3 className="font-bold text-gray-700 mb-2 text-sm border-b pb-1">
              🏢 פרטי הבניין
            </h3>
            <Row label="כתובת" value={lead.address} />
            <Row label="מספר דיירים" value={lead.tenantsCount} />
          </section>

          <section>
            <h3 className="font-bold text-gray-700 mb-2 text-sm border-b pb-1">
              👤 פרטי קשר
            </h3>
            <Row label="שם ועד הבית" value={lead.name} />
            <Row label="טלפון" value={lead.phone} />
            <Row label="אימייל" value={lead.email} />
          </section>

          <section>
            <h3 className="font-bold text-gray-700 mb-2 text-sm border-b pb-1">
              🏢 מצב נוכחי
            </h3>
            <Row label="חברה מתחרה" value={lead.currentCompany} />
            <Row
              label="עלות חודשית נוכחית"
              value={lead.currentCost ? `₪${lead.currentCost}` : undefined}
            />
          </section>

          <section>
            <h3 className="font-bold text-gray-700 mb-2 text-sm border-b pb-1">
              💰 הצעה שלנו
            </h3>
            <Row
              label="עלות ניהול"
              value={
                lead.managementCost ? `₪${lead.managementCost}` : undefined
              }
            />
            <Row label="עלות ניקיון" value={lead.cleaningCost} />
            <Row label="עלות גינון" value={lead.gardeningCost} />
          </section>

          <section>
            <h3 className="font-bold text-gray-700 mb-2 text-sm border-b pb-1">
              📅 תהליך מכירה
            </h3>
            <Row label="תאריך שליחת הצעה" value={lead.proposalDate} />
            <Row
              label="וידוא קבלת הצעה"
              value={
                lead.proposalConfirmed === true
                  ? "אישרו ✅"
                  : lead.proposalConfirmed === false
                    ? "לא ענו ❌"
                    : undefined
              }
            />

            <Row label="מועד המשך טיפול" value={lead.followUpDate} />
            <Row label="המשך טיפול" value={lead.followUpNotes} />
          </section>

          {lead.notes && (
            <section>
              <h3 className="font-bold text-gray-700 mb-2 text-sm border-b pb-1">
                📝 הערות
              </h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                {lead.notes}
              </p>
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-2 p-4 border-t">
          <button
            onClick={onEdit}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium text-sm"
          >
            ✏️ עריכה
          </button>
          <button
            onClick={handleDelete}
            className="border border-red-400 text-red-500 px-4 py-2 rounded-lg hover:bg-red-50 text-sm"
          >
            🗑️ מחיקה
          </button>
          <button
            onClick={onClose}
            className="border py-2 px-4 rounded-lg hover:bg-gray-50 text-gray-600 text-sm"
          >
            סגור
          </button>
        </div>
      </div>
    </div>
  );
}
