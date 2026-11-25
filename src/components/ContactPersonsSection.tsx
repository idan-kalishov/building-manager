import { useState } from "react";
import type { ContactPerson } from "../types";

const CONTACT_ROLES = ["נציג ועד", "דייר", "בעל דירה", "אחר"];
const EMPTY_PERSON: Omit<ContactPerson, "id"> = {
  name: "",
  phone: "",
  role: "",
  notes: "",
};

interface ContactPersonsSectionProps {
  contactPersons: ContactPerson[];
  onChange: (persons: ContactPerson[]) => void;
}

export default function ContactPersonsSection({
  contactPersons,
  onChange,
}: ContactPersonsSectionProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPerson, setNewPerson] =
    useState<Omit<ContactPerson, "id">>(EMPTY_PERSON);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingPerson, setEditingPerson] =
    useState<Omit<ContactPerson, "id">>(EMPTY_PERSON);

  const updateEditingDraft = (
    update: (current: Omit<ContactPerson, "id">) => Omit<ContactPerson, "id">,
  ) => {
    const updatedPerson = update(editingPerson);
    setEditingPerson(updatedPerson);
    if (!editingId) return;

    onChange(
      contactPersons.map((person) =>
        person.id === editingId
          ? {
              ...person,
              ...updatedPerson,
              name: updatedPerson.name || "",
              phone: String(updatedPerson.phone || ""),
            }
          : person,
      ),
    );
  };

  const handleAdd = () => {
    onChange([
      ...contactPersons,
      {
        id: Date.now().toString(),
        ...newPerson,
        name: newPerson.name || "",
        phone: String(newPerson.phone || ""),
      },
    ]);
    setNewPerson(EMPTY_PERSON);
    setShowAddForm(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("למחוק איש קשר זה?")) {
      onChange(contactPersons.filter((person) => person.id !== id));
      if (editingId === id) setEditingId(null);
    }
  };

  const handleEdit = (person: ContactPerson) => {
    setEditingId(person.id);
    setEditingPerson({
      name: person.name || "",
      phone: String(person.phone || ""),
      role: person.role || "",
      notes: person.notes || "",
    });
    setShowAddForm(false);
  };

  const handleCancelAdd = () => {
    setNewPerson(EMPTY_PERSON);
    setShowAddForm(false);
  };

  const renderFields = (
    person: Omit<ContactPerson, "id">,
    setPerson: (
      update: (current: Omit<ContactPerson, "id">) => Omit<ContactPerson, "id">,
    ) => void,
  ) => (
    <div className="space-y-3">
      <label className="flex flex-col gap-1 text-sm font-medium text-gray-600">
        שם
        <input
          value={person.name}
          onChange={(event) =>
            setPerson((current) => ({ ...current, name: event.target.value }))
          }
          placeholder="שם איש קשר"
          className="w-full rounded-lg border px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium text-gray-600">
        טלפון
        <input
          value={person.phone}
          onChange={(event) =>
            setPerson((current) => ({ ...current, phone: event.target.value }))
          }
          placeholder="מספר טלפון"
          type="tel"
          dir="ltr"
          className="w-full rounded-lg border px-3 py-3 text-left text-base focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium text-gray-600">
        תפקיד
        <select
          value={person.role || ""}
          onChange={(event) =>
            setPerson((current) => ({ ...current, role: event.target.value }))
          }
          className="w-full rounded-lg border bg-white px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          <option value="">ללא תפקיד</option>
          {person.role && !CONTACT_ROLES.includes(person.role) && (
            <option value={person.role}>{person.role}</option>
          )}
          {CONTACT_ROLES.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium text-gray-600">
        הערה
        <input
          value={person.notes || ""}
          onChange={(event) =>
            setPerson((current) => ({ ...current, notes: event.target.value }))
          }
          placeholder="הערה"
          className="w-full rounded-lg border px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
      </label>
    </div>
  );

  return (
    <div className="rounded-lg border bg-gray-50 p-3">
      <div className="mb-2 flex items-center justify-between">
        <label className="text-base font-medium text-gray-700">
          👤 אנשי קשר
          <span className="mr-2 text-sm text-gray-500">
            ({contactPersons.length})
          </span>
        </label>
        <button
          type="button"
          onClick={() => {
            setEditingId(null);
            setShowAddForm((visible) => !visible);
          }}
          className="rounded bg-blue-500 px-3 py-2 text-sm text-white hover:bg-blue-600"
        >
          {showAddForm ? "− ביטול" : "+ הוסף"}
        </button>
      </div>

      {showAddForm && (
        <div className="mb-3 space-y-3 rounded-lg border bg-white p-3">
          {renderFields(newPerson, setNewPerson)}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleAdd}
              className="flex-1 rounded bg-green-600 py-2 text-base text-white hover:bg-green-700"
            >
              הוסף איש קשר
            </button>
            <button
              type="button"
              onClick={handleCancelAdd}
              className="flex-1 rounded border py-2 text-base text-gray-600 hover:bg-gray-50"
            >
              ביטול
            </button>
          </div>
        </div>
      )}

      <div className="max-h-64 space-y-2 overflow-y-auto">
        {contactPersons.length === 0 ? (
          <div className="py-2 text-center text-base text-gray-500">
            אין אנשי קשר
          </div>
        ) : (
          contactPersons.map((person) => (
            <div
              key={person.id}
              className="flex items-start justify-between gap-2 rounded-lg border bg-white p-3"
            >
              {editingId === person.id ? (
                <div className="min-w-0 flex-1 space-y-3">
                  {renderFields(editingPerson, updateEditingDraft)}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => handleEdit(person)}
                  className="min-w-0 flex-1 rounded-lg text-right focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                  aria-label={`עריכת איש קשר ${person.name || ""}`}
                >
                  {person.name && (
                    <div className="break-words text-base font-semibold text-gray-800">
                      {person.name}
                    </div>
                  )}
                  {person.phone && (
                    <div dir="ltr" className="mt-1 break-all text-left text-base text-gray-700">
                      📞 {person.phone}
                    </div>
                  )}
                  {(person.role || person.notes) && (
                    <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm text-gray-600">
                      {person.role && <span>🏷️ {person.role}</span>}
                      {person.notes && <span>📝 {person.notes}</span>}
                    </div>
                  )}
                  {!person.name && !person.phone && !person.role && !person.notes && (
                    <span className="text-sm text-gray-500">
                      איש קשר ללא פרטים
                    </span>
                  )}
                </button>
              )}
              <button
                type="button"
                onClick={() => handleDelete(person.id)}
                aria-label="מחק איש קשר"
                className="shrink-0 rounded px-2 py-1 text-sm text-red-500 hover:bg-red-50 hover:text-red-700"
              >
                🗑️
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
