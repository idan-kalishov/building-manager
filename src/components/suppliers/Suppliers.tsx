// pages/Suppliers.tsx
import { useEffect, useState } from "react";
import {
  subscribeSuppliers,
  deleteSupplier,
  updateSupplier,
  addSupplier,
} from "../../lib/suppliers.service";
import type { Supplier, SupplierCategory } from "../../types";
import ConfirmModal from "../ConfirmModal";

const CATEGORY_LABELS: Record<SupplierCategory, string> = {
  elevator: "מעליות",
  electricity: "חשמל",
  plumbing: "אינסטלציה",
  cleaning: "ניקיון",
  gardening: "גינון",
  security: "אבטחה",
  construction: "בניה",
  air_conditioning: "מיזוג אוויר",
  it: "IT",
  other: "אחר",
};

const CATEGORY_COLORS: Record<SupplierCategory, string> = {
  elevator: "bg-blue-100 text-blue-800",
  electricity: "bg-yellow-100 text-yellow-800",
  plumbing: "bg-cyan-100 text-cyan-800",
  cleaning: "bg-green-100 text-green-800",
  gardening: "bg-emerald-100 text-emerald-800",
  security: "bg-red-100 text-red-800",
  construction: "bg-orange-100 text-orange-800",
  air_conditioning: "bg-purple-100 text-purple-800",
  it: "bg-indigo-100 text-indigo-800",
  other: "bg-gray-100 text-gray-800",
};

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [filter, setFilter] = useState<SupplierCategory | "all">("all");
  const [deleteConfirm, setDeleteConfirm] = useState<Supplier | null>(null);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSupplier, setNewSupplier] = useState<Partial<Supplier>>({
    name: "",
    phone: "",
    email: "",
    category: "other",
    contactPerson: "",
    notes: "",
  });

  useEffect(() => {
    const unsub = subscribeSuppliers((data) => {
      setSuppliers(data);
    });
    return unsub;
  }, []);

  const filteredSuppliers =
    filter === "all"
      ? suppliers
      : suppliers.filter((s) => s.category === filter);

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    await deleteSupplier(deleteConfirm.id!);
    setDeleteConfirm(null);
  };

  const handleUpdate = async () => {
    if (!editing) return;
    await updateSupplier(editing.id!, editing);
    setEditing(null);
  };

  const handleAddSupplier = async () => {
    if (!newSupplier.name || !newSupplier.phone) {
      alert("אנא מלא שם וטלפון");
      return;
    }

    try {
      await addSupplier(newSupplier as Omit<Supplier, "id">);
      setNewSupplier({
        name: "",
        phone: "",
        email: "",
        category: "other",
        contactPerson: "",
        notes: "",
      });
      setShowAddForm(false);
    } catch (error) {
      console.error("Error adding supplier:", error);
      alert("שגיאה בהוספת ספק");
    }
  };

  return (
    <div dir="rtl" className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">🏢 ניהול ספקים</h1>
          <span className="text-sm text-gray-500">
            {suppliers.length} ספקים
          </span>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center gap-2"
        >
          <span className="text-lg">+</span> ספק חדש
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
            ${
              filter === "all"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
        >
          הכל
        </button>
        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key as SupplierCategory)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
              ${
                filter === key
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Add Supplier Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl border p-4 mb-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">➕ הוסף ספק חדש</h3>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-gray-400 hover:text-gray-600 text-xl"
            >
              ×
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              value={newSupplier.name || ""}
              onChange={(e) =>
                setNewSupplier((p) => ({ ...p, name: e.target.value }))
              }
              placeholder="שם ספק *"
              className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <input
              value={newSupplier.phone || ""}
              onChange={(e) =>
                setNewSupplier((p) => ({ ...p, phone: e.target.value }))
              }
              placeholder="טלפון *"
              type="tel"
              className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <input
              value={newSupplier.email || ""}
              onChange={(e) =>
                setNewSupplier((p) => ({ ...p, email: e.target.value }))
              }
              placeholder="אימייל (אופציונלי)"
              type="email"
              className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <select
              value={newSupplier.category || "other"}
              onChange={(e) =>
                setNewSupplier((p) => ({
                  ...p,
                  category: e.target.value as SupplierCategory,
                }))
              }
              className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <input
              value={newSupplier.contactPerson || ""}
              onChange={(e) =>
                setNewSupplier((p) => ({ ...p, contactPerson: e.target.value }))
              }
              placeholder="איש קשר (אופציונלי)"
              className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <input
              value={newSupplier.notes || ""}
              onChange={(e) =>
                setNewSupplier((p) => ({ ...p, notes: e.target.value }))
              }
              placeholder="הערות (אופציונלי)"
              className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleAddSupplier}
              className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 font-medium"
            >
              💾 שמור ספק
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="flex-1 border py-2 rounded-lg hover:bg-gray-50 text-gray-600"
            >
              ביטול
            </button>
          </div>
        </div>
      )}

      {/* Suppliers List */}
      <div className="grid gap-3">
        {filteredSuppliers.length === 0 ? (
          <div className="text-center text-gray-400 py-16">
            אין ספקים {filter !== "all" && "בקטגוריה זו"}
            <br />
            <button
              onClick={() => setShowAddForm(true)}
              className="mt-3 text-blue-600 hover:text-blue-700 underline"
            >
              + הוסף ספק חדש
            </button>
          </div>
        ) : (
          filteredSuppliers.map((supplier) => (
            <div
              key={supplier.id}
              className="bg-white rounded-xl border p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-semibold text-lg">{supplier.name}</h3>
                    {supplier.category && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[supplier.category]}`}
                      >
                        {CATEGORY_LABELS[supplier.category]}
                      </span>
                    )}
                    {supplier.isActive === false && (
                      <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                        לא פעיל
                      </span>
                    )}
                    {supplier.tasksCount !== undefined &&
                      supplier.tasksCount > 0 && (
                        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                          📋 {supplier.tasksCount} משימות
                        </span>
                      )}
                  </div>

                  <div className="mt-2 flex flex-wrap gap-3 text-sm">
                    <span className="text-gray-600">📞 {supplier.phone}</span>
                    {supplier.email && (
                      <span className="text-gray-600">📧 {supplier.email}</span>
                    )}
                    {supplier.contactPerson && (
                      <span className="text-gray-600">
                        👤 {supplier.contactPerson}
                      </span>
                    )}
                  </div>

                  {supplier.notes && (
                    <p className="mt-2 text-sm text-gray-500 border-r-2 border-gray-200 pr-2">
                      📝 {supplier.notes}
                    </p>
                  )}
                </div>

                <div className="flex gap-1 mr-4">
                  <button
                    onClick={() => setEditing(supplier)}
                    className="text-xs border border-blue-300 text-blue-600 px-2 py-1.5 rounded hover:bg-blue-50"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(supplier)}
                    className="text-xs border border-red-300 text-red-500 px-2 py-1.5 rounded hover:bg-red-50"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit Modal */}
      {editing && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          dir="rtl"
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditing(null);
          }}
        >
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold mb-4">✏️ עריכת ספק</h2>
            <div className="space-y-3">
              <input
                value={editing.name}
                onChange={(e) =>
                  setEditing({ ...editing, name: e.target.value })
                }
                placeholder="שם ספק"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <input
                value={editing.phone}
                onChange={(e) =>
                  setEditing({ ...editing, phone: e.target.value })
                }
                placeholder="טלפון"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <input
                value={editing.email || ""}
                onChange={(e) =>
                  setEditing({ ...editing, email: e.target.value })
                }
                placeholder="אימייל"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <select
                value={editing.category || "other"}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    category: e.target.value as SupplierCategory,
                  })
                }
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <input
                value={editing.contactPerson || ""}
                onChange={(e) =>
                  setEditing({ ...editing, contactPerson: e.target.value })
                }
                placeholder="איש קשר"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <textarea
                value={editing.notes || ""}
                onChange={(e) =>
                  setEditing({ ...editing, notes: e.target.value })
                }
                placeholder="הערות"
                rows={2}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
              />
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleUpdate}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
              >
                💾 שמור
              </button>
              <button
                onClick={() => setEditing(null)}
                className="flex-1 border py-2 rounded-lg hover:bg-gray-50 text-gray-600"
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <ConfirmModal
          title="למחוק ספק זה?"
          message={`${deleteConfirm.name}\nהפעולה הזו לא ניתנת לביטול`}
          confirmLabel="מחק"
          confirmColor="bg-red-500 hover:bg-red-600"
          onConfirm={handleDelete}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </div>
  );
}
