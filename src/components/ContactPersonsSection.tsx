// components/ContactPersonsSection.tsx
import { useState } from "react";
import type { ContactPerson } from "../types";

interface ContactPersonsSectionProps {
  contactPersons: ContactPerson[];
  onChange: (persons: ContactPerson[]) => void;
}

export default function ContactPersonsSection({
  contactPersons,
  onChange,
}: ContactPersonsSectionProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPerson, setNewPerson] = useState<Omit<ContactPerson, "id">>({
    name: "",
    phone: "",
    role: "",
    notes: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleAdd = () => {
    if (!newPerson.name || !newPerson.phone) {
      alert("אנא מלא שם וטלפון");
      return;
    }

    const person: ContactPerson = {
      id: Date.now().toString(),
      ...newPerson,
    };

    onChange([...contactPersons, person]);
    setNewPerson({ name: "", phone: "", role: "", notes: "" });
    setShowAddForm(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("למחוק איש קשר זה?")) {
      onChange(contactPersons.filter((p) => p.id !== id));
    }
  };

  const handleEdit = (person: ContactPerson) => {
    setNewPerson({
      name: person.name,
      phone: person.phone,
      role: person.role || "",
      notes: person.notes || "",
    });
    setEditingId(person.id);
    setShowAddForm(true);
  };

  const handleUpdate = () => {
    if (!newPerson.name || !newPerson.phone) {
      alert("אנא מלא שם וטלפון");
      return;
    }

    onChange(
      contactPersons.map((p) =>
        p.id === editingId ? { ...p, ...newPerson } : p,
      ),
    );
    setNewPerson({ name: "", phone: "", role: "", notes: "" });
    setEditingId(null);
    setShowAddForm(false);
  };

  const handleCancel = () => {
    setNewPerson({ name: "", phone: "", role: "", notes: "" });
    setEditingId(null);
    setShowAddForm(false);
  };

  return (
    <div className="border rounded-lg p-3 bg-gray-50">
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-gray-700">
          👤 אנשי קשר
          <span className="text-xs text-gray-400 mr-2">
            ({contactPersons.length})
          </span>
        </label>
        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
        >
          {showAddForm ? "− ביטול" : "+ הוסף"}
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg p-3 space-y-2 mb-3 border">
          <div className="flex gap-2">
            <input
              value={newPerson.name}
              onChange={(e) =>
                setNewPerson((p) => ({ ...p, name: e.target.value }))
              }
              placeholder="שם מלא *"
              className="flex-1 border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <input
              value={newPerson.phone}
              onChange={(e) =>
                setNewPerson((p) => ({ ...p, phone: e.target.value }))
              }
              placeholder="טלפון *"
              type="tel"
              className="flex-1 border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
          <input
            value={newPerson.role || ""}
            onChange={(e) =>
              setNewPerson((p) => ({ ...p, role: e.target.value }))
            }
            placeholder="תפקיד (אופציונלי) - למשל: בעל דירה, נציג ועד"
            className="w-full border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          <input
            value={newPerson.notes || ""}
            onChange={(e) =>
              setNewPerson((p) => ({ ...p, notes: e.target.value }))
            }
            placeholder="הערה (אופציונלי)"
            className="w-full border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={editingId ? handleUpdate : handleAdd}
              className="flex-1 bg-green-600 text-white py-1.5 rounded text-sm hover:bg-green-700"
            >
              {editingId ? "עדכן" : "הוסף"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 border py-1.5 rounded text-sm text-gray-600 hover:bg-gray-50"
            >
              ביטול
            </button>
          </div>
        </div>
      )}

      {/* List of contacts */}
      <div className="space-y-1 max-h-40 overflow-y-auto">
        {contactPersons.length === 0 ? (
          <div className="text-center py-2 text-gray-400 text-sm">
            אין אנשי קשר
          </div>
        ) : (
          contactPersons.map((person) => (
            <div
              key={person.id}
              className="bg-white rounded-lg p-2 flex items-center justify-between group border"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm truncate">
                    {person.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    📞 {person.phone}
                  </span>
                </div>
                <div className="flex gap-2 text-xs text-gray-400">
                  {person.role && <span>🏷️ {person.role}</span>}
                  {person.notes && <span>📝 {person.notes}</span>}
                </div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => handleEdit(person)}
                  className="text-xs text-blue-500 hover:text-blue-700 px-1"
                >
                  ✏️
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(person.id)}
                  className="text-xs text-red-500 hover:text-red-700 px-1"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
