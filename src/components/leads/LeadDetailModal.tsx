import { useState } from "react";
import type { Lead, LeadPriority } from "../../types";
import { deleteLead, updateLead } from "../../lib/leads.service";
import ConfirmModal from "../ConfirmModal";
import InputModal from "../InputModal";
import LeadNoteSection, { type LeadNote } from "./LeadNoteSection";

interface Props {
  lead: Lead;
  onClose: () => void;
  onEdit: () => void;
}

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

// Simple text row
const Row = ({ label, value }: { label: string; value?: any }) =>
  value ? (
    <div className="flex justify-between py-2 border-b border-gray-100 last:border-0">
      <span className="text-gray-500 text-sm">{label}</span>
      <span className="text-gray-800 text-sm font-medium text-right max-w-[60%]">
        {String(value)}
      </span>
    </div>
  ) : null;

// Phone row with tap-to-call
const PhoneRow = ({ phone }: { phone?: string }) =>
  phone ? (
    <div className="flex justify-between items-center py-2 border-b border-gray-100">
      <span className="text-gray-500 text-sm">טלפון</span>
      <a
        href={`tel:${phone}`}
        className="flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-700 rounded-lg px-3 py-1 text-sm font-medium hover:bg-green-100 active:bg-green-200 transition-colors"
      >
        📞 {phone}
      </a>
    </div>
  ) : null;

export default function LeadDetailModal({ lead, onClose, onEdit }: Props) {
  const overdue = isOverdue(lead.followUpDate);
  const [showAddField, setShowAddField] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Local notes state — synced to Firestore on each add
  const [notesList, setNotesList] = useState<LeadNote[]>(
    (lead as any).notesList ?? [],
  );

  const handleDelete = async () => {
    await deleteLead(lead.id!);
    onClose();
  };

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

  const handleAddField = (label: string) => {
    const updated = [
      ...(lead.customFields || []),
      { id: crypto.randomUUID(), label, value: "" },
    ];
    updateLead(lead.id!, { customFields: updated });
    setShowAddField(false);
  };

  const handleFieldChange = (fieldId: string, value: string) => {
    const updated = (lead.customFields || []).map((f) =>
      f.id !== fieldId ? f : { ...f, value },
    );
    updateLead(lead.id!, { customFields: updated });
  };

  const handleDeleteField = (fieldId: string) => {
    const updated = (lead.customFields || []).filter((f) => f.id !== fieldId);
    updateLead(lead.id!, { customFields: updated });
    setConfirmDelete(null);
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      dir="rtl"
    >
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[92vh] flex flex-col">
        {/* ── Header ── */}
        <div className="flex justify-between items-center p-4 border-b">
          <div>
            <h2 className="text-xl font-bold">{lead.address || lead.name}</h2>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
              {STATUS_LABEL[lead.status]}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl w-8 h-8 flex items-center justify-center"
          >
            ×
          </button>
        </div>

        {/* ── Content ── */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Overdue warning */}
          {overdue && (
            <div className="bg-red-50 border border-red-300 rounded-lg px-3 py-2 text-red-600 text-sm font-medium">
              ⚠️ מועד המשך טיפול עבר! ({lead.followUpDate})
            </div>
          )}

          {lead.priority && (
            <div className="text-sm font-medium">
              עדיפות: {PRIORITY_LABEL[lead.priority]}
            </div>
          )}

          {/* Building */}
          <section>
            <h3 className="font-bold text-gray-700 mb-2 text-sm border-b pb-1">
              🏢 פרטי הבניין
            </h3>
            <Row label="כתובת" value={lead.address} />
            <Row label="מספר דיירים" value={lead.tenantsCount} />
          </section>

          {/* Contact */}
          <section>
            <h3 className="font-bold text-gray-700 mb-2 text-sm border-b pb-1">
              👤 פרטי קשר
            </h3>
            <Row label="שם ועד הבית" value={lead.name} />
            <PhoneRow phone={lead.phone} />
            <Row label="אימייל" value={lead.email} />
          </section>

          {/* Current state */}
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

          {/* Our proposal */}
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

          {/* Sales process */}
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

          {/* ── Notes section (new multi-note system) ── */}
          <LeadNoteSection
            notes={notesList}
            onAddNote={handleAddNote}
            onDeleteNote={handleDeleteNote}
          />

          {/* Custom fields */}
          {((lead.customFields || []).length > 0 || true) && (
            <section>
              <h3 className="font-bold text-gray-700 mb-2 text-sm border-b pb-1">
                📌 שדות נוספים
              </h3>
              {(lead.customFields || []).map((field) => (
                <div
                  key={field.id}
                  className="flex justify-between items-center py-2 border-b border-gray-100 gap-2"
                >
                  <span className="text-gray-500 text-sm w-1/3">
                    {field.label}
                  </span>
                  <input
                    className="text-sm text-gray-800 font-medium text-right flex-1 border-b border-transparent hover:border-gray-300 focus:border-blue-400 outline-none bg-transparent"
                    value={field.value}
                    onChange={(e) =>
                      handleFieldChange(field.id, e.target.value)
                    }
                  />
                  <button
                    onClick={() => setConfirmDelete(field.id)}
                    className="text-red-400 hover:text-red-600 text-xs px-1"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                onClick={() => setShowAddField(true)}
                className="mt-3 text-xs text-blue-500 hover:text-blue-700 border border-dashed border-blue-300 rounded-lg w-full py-2"
              >
                + הוסף שדה
              </button>
            </section>
          )}
        </div>

        {/* ── Footer ── */}
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
            🗑️
          </button>
          <button
            onClick={onClose}
            className="border py-2 px-4 rounded-lg hover:bg-gray-50 text-gray-600 text-sm"
          >
            סגור
          </button>
        </div>
      </div>

      {showAddField && (
        <InputModal
          title="שם השדה החדש"
          placeholder="לדוגמה: מספר חוזה"
          confirmLabel="הוסף שדה"
          onConfirm={handleAddField}
          onCancel={() => setShowAddField(false)}
        />
      )}

      {confirmDelete && (
        <ConfirmModal
          title="למחוק שדה?"
          confirmLabel="מחק"
          onConfirm={() => handleDeleteField(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}
