import { useEffect, useState, type ReactNode } from "react";
import type {
  ContactPerson,
  Lead,
  LeadPriority,
  LeadStatus,
} from "../../types";
import { deleteLead, updateLead } from "../../lib/leads.service";
import ConfirmModal from "../ConfirmModal";
import InputModal from "../InputModal";
import LeadNoteSection, { type LeadNote } from "./LeadNoteSection";

interface Props {
  lead: Lead;
  onClose: () => void;
}

interface CallSummary {
  id: string;
  timestamp: string;
  summary: string;
  transcript: string;
}

const PRIORITY_LABEL: Record<LeadPriority, string> = {
  high: "🔴 גבוהה",
  medium: "🟡 בינונית",
  low: "🟢 נמוכה",
};

const STATUS_LABEL: Record<LeadStatus, string> = {
  new: "ליד חדש",
  contacted: "יצירת קשר",
  proposal: "הצעה נשלחה",
  negotiation: "מעקב הצעה",
  closed: "נסגר ✅",
  irrelevant: "לא רלוונטי ❌",
};

const STATUS_OPTIONS: { value: LeadStatus; label: string }[] = [
  { value: "new", label: STATUS_LABEL.new },
  { value: "contacted", label: STATUS_LABEL.contacted },
  { value: "proposal", label: STATUS_LABEL.proposal },
  { value: "negotiation", label: STATUS_LABEL.negotiation },
  { value: "closed", label: STATUS_LABEL.closed },
  { value: "irrelevant", label: STATUS_LABEL.irrelevant },
];

const PRIORITY_OPTIONS: { value: LeadPriority | ""; label: string }[] = [
  { value: "", label: "ללא עדיפות" },
  { value: "high", label: PRIORITY_LABEL.high },
  { value: "medium", label: PRIORITY_LABEL.medium },
  { value: "low", label: PRIORITY_LABEL.low },
];

function isOverdue(dateStr?: string) {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("he-IL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface EditableFieldProps {
  label: string;
  value?: string | number | null;
  displayValue?: (
    value: string | number | null | undefined,
  ) => string;
  linkHref?: string;
  type?: "text" | "email" | "number" | "tel" | "date";
  multiline?: boolean;
  options?: { value: string; label: string }[];
  action?: ReactNode;
  onSave: (value: string) => Promise<void>;
}

function EditableField({
  label,
  value,
  displayValue,
  linkHref,
  type = "text",
  multiline = false,
  options,
  action,
  onSave,
}: EditableFieldProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value == null ? "" : String(value));
  const [savedValue, setSavedValue] = useState<string | number | null>();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const currentValue = savedValue === undefined ? value : savedValue;

  useEffect(() => {
    setSavedValue(undefined);
    setDraft(value == null ? "" : String(value));
  }, [value]);

  const startEditing = () => {
    setDraft(value == null ? "" : String(value));
    setError("");
    setEditing(true);
  };

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      await onSave(draft);
      setSavedValue(draft);
      setEditing(false);
    } catch (saveError) {
      console.error("Failed to update lead field", saveError);
      setError("השמירה נכשלה. נסו שוב.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="py-2 border-b border-gray-100 last:border-0">
      <div className="flex justify-between items-center gap-3">
        <span className="text-gray-500 text-sm">{label}</span>
        {editing ? (
          <div className="flex flex-1 items-center justify-end gap-2">
            {options ? (
              <select
                aria-label={label}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                className="min-w-0 border rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                autoFocus
              >
                {options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : multiline ? (
              <textarea
                aria-label={label}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                className="min-w-0 flex-1 border rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                rows={2}
                autoFocus
              />
            ) : (
              <input
                aria-label={label}
                type={type}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                className="min-w-0 flex-1 border rounded-lg px-2 py-1 text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-300"
                autoFocus
              />
            )}
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50"
            >
              {saving ? "שומר..." : "שמירה"}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              disabled={saving}
              className="text-xs text-gray-500 hover:text-gray-700 disabled:opacity-50"
            >
              ביטול
            </button>
          </div>
        ) : (
          <>
            {linkHref ? (
              <a
                href={linkHref}
                aria-label={`${label}: ${String(currentValue)}`}
                className="cursor-pointer text-green-700 text-sm font-medium text-right max-w-[65%] break-words hover:text-green-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-300 rounded"
              >
                {displayValue
                  ? displayValue(currentValue)
                  : currentValue == null || currentValue === ""
                    ? "—"
                    : String(currentValue)}
              </a>
            ) : (
              <button
                type="button"
                onClick={startEditing}
                aria-label={`עריכת ${label}`}
                className="cursor-pointer text-gray-800 text-sm font-medium text-right max-w-[65%] break-words hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 rounded"
              >
                {displayValue
                  ? displayValue(currentValue)
                  : currentValue == null || currentValue === ""
                    ? "—"
                    : String(currentValue)}
              </button>
            )}
            {linkHref && (
              <button
                type="button"
                onClick={startEditing}
                aria-label={`עריכת ${label}`}
                className="cursor-pointer text-gray-400 text-xs hover:text-blue-700"
              >
                ✏️
              </button>
            )}
            {action}
          </>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function CallSummaryCard({ summary }: { summary: CallSummary }) {
  const [expanded, setExpanded] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);

  const previewLine =
    summary.summary
      .split("\n")
      .find(
        (l) =>
          l.trim() &&
          !l.startsWith("✅") &&
          !l.startsWith("📅") &&
          !l.startsWith("🔔"),
      ) ?? "סיכום שיחה";

  return (
    <div className="bg-white border border-purple-100 rounded-xl overflow-hidden shadow-sm">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 text-right hover:bg-purple-50/40 transition-colors"
      >
        <span className="text-purple-400 text-lg shrink-0">🎙️</span>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-700 truncate">
            {previewLine}
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            {formatDate(summary.timestamp)}
          </p>
        </div>
        <span className="text-gray-300 text-sm shrink-0">
          {expanded ? "▲" : "▼"}
        </span>
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-purple-50">
          <div className="mt-3 text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">
            {summary.summary}
          </div>
          <button
            onClick={() => setShowTranscript((v) => !v)}
            className="mt-3 text-[11px] text-purple-500 hover:text-purple-700 underline underline-offset-2 transition-colors"
          >
            {showTranscript ? "הסתר תמלול" : "הצג תמלול מלא"}
          </button>
          {showTranscript && (
            <div className="mt-2 bg-gray-50 border border-gray-100 rounded-lg p-3 text-[11px] text-gray-500 leading-relaxed whitespace-pre-wrap max-h-40 overflow-y-auto">
              {summary.transcript}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function LeadDetailModal({ lead, onClose }: Props) {
  const overdue = isOverdue(lead.followUpDate);
  const [showAddField, setShowAddField] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const contactPersons: ContactPerson[] = lead.contactPersons?.length
    ? lead.contactPersons
    : [{ id: "legacy-contact", name: lead.name, phone: lead.phone }];
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContact, setNewContact] = useState({ name: "", phone: "" });
  const [contactError, setContactError] = useState("");

  const [notesList, setNotesList] = useState<LeadNote[]>(
    lead.notesList ?? [],
  );
  const callSummaries: CallSummary[] = (lead as any).callSummaries ?? [];

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
    updateLead(lead.id!, { notesList: updated });
  };

  const handleEditNote = async (id: string, message: string) => {
    const updated = notesList.map((note) =>
      note.id === id ? { ...note, message } : note,
    );
    await updateLead(lead.id!, { notesList: updated });
    setNotesList(updated);
  };

  const handleDeleteNote = (id: string) => {
    const updated = notesList.filter((n) => n.id !== id);
    setNotesList(updated);
    updateLead(lead.id!, { notesList: updated });
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

  const saveContactPersons = async (updated: ContactPerson[]) => {
    const primaryContact = updated[0];
    await updateLead(lead.id!, {
      contactPersons: updated,
      name: primaryContact.name,
      phone: primaryContact.phone,
    });
  };

  const updateContact = async (
    contactId: string,
    field: "name" | "phone",
    value: string,
  ) => {
    const updated = contactPersons.map((person) =>
      person.id === contactId ? { ...person, [field]: value } : person,
    );
    await saveContactPersons(updated);
  };

  const addContact = async () => {
    const name = newContact.name.trim();
    const phone = newContact.phone.trim();
    if (!name || !phone) {
      setContactError("יש למלא שם וטלפון.");
      return;
    }

    const updated = [
      ...contactPersons,
      { id: crypto.randomUUID(), name, phone },
    ];
    try {
      await saveContactPersons(updated);
      setNewContact({ name: "", phone: "" });
      setContactError("");
      setShowAddContact(false);
    } catch (error) {
      console.error("Failed to add lead contact", error);
      setContactError("שמירת איש הקשר נכשלה. נסו שוב.");
    }
  };

  const deleteContact = async (contactId: string) => {
    if (contactPersons.length <= 1) return;
    if (!confirm("למחוק את איש הקשר?")) return;

    const updated = contactPersons.filter((person) => person.id !== contactId);
    try {
      await saveContactPersons(updated);
      setContactError("");
    } catch (error) {
      console.error("Failed to delete lead contact", error);
      setContactError("מחיקת איש הקשר נכשלה. נסו שוב.");
    }
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
            <EditableField
              label="סטטוס"
              value={lead.status}
              displayValue={(value) =>
                STATUS_OPTIONS.find((option) => option.value === value)?.label ??
                "—"
              }
              options={STATUS_OPTIONS}
              onSave={async (value) => {
                const status = STATUS_OPTIONS.find(
                  (option) => option.value === value,
                )?.value;
                if (!status) throw new Error("Invalid lead status");
                await updateLead(lead.id!, { status });
              }}
            />
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
          {overdue && (
            <div className="bg-red-50 border border-red-300 rounded-lg px-3 py-2 text-red-600 text-sm font-medium">
              ⚠️ מועד המשך טיפול עבר! ({lead.followUpDate})
            </div>
          )}

          <EditableField
            label="עדיפות"
            value={lead.priority ?? ""}
            displayValue={(value) =>
              PRIORITY_OPTIONS.find((option) => option.value === value)?.label ??
              "—"
            }
            options={PRIORITY_OPTIONS}
            onSave={async (value) => {
              const priority = PRIORITY_OPTIONS.find(
                (option) => option.value === value,
              )?.value;
              if (priority === undefined) {
                throw new Error("Invalid lead priority");
              }
              await updateLead(lead.id!, { priority: priority || undefined });
            }}
          />

          <section>
            <h3 className="font-bold text-gray-700 mb-2 text-sm border-b pb-1">
              🏢 פרטי הבניין
            </h3>
            <EditableField
              label="כתובת"
              value={lead.address}
              onSave={(value) =>
                updateLead(lead.id!, { address: value || undefined })
              }
            />
            <EditableField
              label="מספר דיירים"
              value={lead.tenantsCount}
              type="number"
              onSave={(value) =>
                updateLead(lead.id!, {
                  tenantsCount: value === "" ? undefined : Number(value),
                })
              }
            />
          </section>

          <section>
            <h3 className="font-bold text-gray-700 mb-2 text-sm border-b pb-1">
              👤 פרטי קשר
            </h3>
            <div className="space-y-3">
              {contactPersons.map((person, index) => (
                <div
                  key={person.id}
                  className="rounded-lg border border-gray-200 bg-gray-50 px-3"
                >
                  <div className="flex items-center justify-between border-b border-gray-200">
                    <span className="py-2 text-xs font-semibold text-gray-500">
                      איש קשר {index + 1}
                    </span>
                    {contactPersons.length > 1 && (
                      <button
                        type="button"
                        onClick={() => deleteContact(person.id)}
                        className="py-2 text-xs text-red-500 hover:text-red-700"
                      >
                        הסרה
                      </button>
                    )}
                  </div>
                  <EditableField
                    label="שם"
                    value={person.name}
                    onSave={(value) =>
                      updateContact(person.id, "name", value)
                    }
                  />
                  <EditableField
                    label="טלפון"
                    value={person.phone}
                    linkHref={
                      person.phone ? `tel:${person.phone}` : undefined
                    }
                    type="tel"
                    onSave={(value) =>
                      updateContact(person.id, "phone", value)
                    }
                  />
                </div>
              ))}
            </div>
            {showAddContact && (
              <div className="mt-3 space-y-2 rounded-lg border border-blue-200 bg-blue-50/50 p-3">
                <input
                  aria-label="שם איש קשר חדש"
                  placeholder="שם איש קשר"
                  value={newContact.name}
                  onChange={(event) =>
                    setNewContact((contact) => ({
                      ...contact,
                      name: event.target.value,
                    }))
                  }
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
                <input
                  aria-label="טלפון איש קשר חדש"
                  placeholder="טלפון"
                  type="tel"
                  value={newContact.phone}
                  onChange={(event) =>
                    setNewContact((contact) => ({
                      ...contact,
                      phone: event.target.value,
                    }))
                  }
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={addContact}
                    className="flex-1 rounded-lg bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    הוספה
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddContact(false);
                      setContactError("");
                    }}
                    className="rounded-lg border px-3 py-2 text-sm text-gray-600 hover:bg-white"
                  >
                    ביטול
                  </button>
                </div>
              </div>
            )}
            <button
              type="button"
              onClick={() => {
                setShowAddContact((visible) => !visible);
                setContactError("");
              }}
              className="mt-3 w-full rounded-lg border border-dashed border-blue-300 py-2 text-sm text-blue-600 hover:bg-blue-50"
            >
              + הוספת איש קשר
            </button>
            {contactError && (
              <p role="alert" className="mt-2 text-xs text-red-600">
                {contactError}
              </p>
            )}
            <EditableField
              label="אימייל"
              value={lead.email}
              type="email"
              onSave={(value) =>
                updateLead(lead.id!, { email: value || undefined })
              }
            />
          </section>

          <section>
            <h3 className="font-bold text-gray-700 mb-2 text-sm border-b pb-1">
              🏢 מצב נוכחי
            </h3>
            <EditableField
              label="חברה מתחרה"
              value={lead.currentCompany}
              onSave={(value) =>
                updateLead(lead.id!, { currentCompany: value || undefined })
              }
            />
            <EditableField
              label="עלות חודשית נוכחית"
              value={lead.currentCost}
              type="number"
              displayValue={(value) =>
                value == null || value === "" ? "—" : `₪${value}`
              }
              onSave={(value) =>
                updateLead(lead.id!, {
                  currentCost: value === "" ? undefined : Number(value),
                })
              }
            />
          </section>

          <section>
            <h3 className="font-bold text-gray-700 mb-2 text-sm border-b pb-1">
              💰 הצעה שלנו
            </h3>
            <EditableField
              label="עלות ניהול"
              value={lead.managementCost}
              type="number"
              displayValue={(value) =>
                value == null || value === "" ? "—" : `₪${value}`
              }
              onSave={(value) =>
                updateLead(lead.id!, {
                  managementCost: value === "" ? undefined : Number(value),
                })
              }
            />
            <EditableField
              label="עלות ניקיון"
              value={lead.cleaningCost}
              onSave={(value) =>
                updateLead(lead.id!, { cleaningCost: value || undefined })
              }
            />
            <EditableField
              label="עלות גינון"
              value={lead.gardeningCost}
              onSave={(value) =>
                updateLead(lead.id!, { gardeningCost: value || undefined })
              }
            />
          </section>

          <section>
            <h3 className="font-bold text-gray-700 mb-2 text-sm border-b pb-1">
              📅 תהליך מכירה
            </h3>
            <EditableField
              label="תאריך שליחת הצעה"
              value={lead.proposalDate}
              type="date"
              onSave={(value) =>
                updateLead(lead.id!, { proposalDate: value || undefined })
              }
            />
            <EditableField
              label="וידוא קבלת הצעה"
              value={
                lead.proposalConfirmed === undefined
                  ? ""
                  : String(lead.proposalConfirmed)
              }
              displayValue={(value) =>
                value === "true"
                  ? "אישרו ✅"
                  : value === "false"
                    ? "לא ענו ❌"
                    : "—"
              }
              options={[
                { value: "", label: "לא ידוע" },
                { value: "true", label: "אישרו ✅" },
                { value: "false", label: "לא ענו ❌" },
              ]}
              onSave={(value) =>
                updateLead(lead.id!, {
                  proposalConfirmed:
                    value === "" ? undefined : value === "true",
                })
              }
            />
            <EditableField
              label="מועד המשך טיפול"
              value={lead.followUpDate}
              type="date"
              onSave={(value) =>
                updateLead(lead.id!, { followUpDate: value || undefined })
              }
            />
            <EditableField
              label="המשך טיפול"
              value={lead.followUpNotes}
              multiline
              onSave={(value) =>
                updateLead(lead.id!, { followUpNotes: value || undefined })
              }
            />
          </section>

          {callSummaries.length > 0 && (
            <section>
              <div className="flex items-center justify-between border-b pb-1 mb-3">
                <h3 className="font-bold text-gray-700 text-sm">
                  🎙️ שיחות מוקלטות
                </h3>
                <span className="text-[11px] bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full font-medium">
                  {callSummaries.length}
                </span>
              </div>
              <div className="space-y-2">
                {callSummaries.map((s) => (
                  <CallSummaryCard key={s.id} summary={s} />
                ))}
              </div>
            </section>
          )}

          <LeadNoteSection
            notes={notesList}
            onAddNote={handleAddNote}
            onEditNote={handleEditNote}
            onDeleteNote={handleDeleteNote}
          />

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
                  onChange={(e) => handleFieldChange(field.id, e.target.value)}
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
        </div>

        {/* ── Footer ── */}
        <div className="flex gap-2 p-4 border-t">
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
