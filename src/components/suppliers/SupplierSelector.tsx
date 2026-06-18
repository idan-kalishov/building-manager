// components/SupplierSelector.tsx
import { useState, useEffect, useMemo } from "react";
import { subscribeSuppliers, addSupplier } from "../../lib/suppliers.service";
import type { Supplier, SupplierCategory } from "../../types";

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

interface SupplierSelectorProps {
  selectedSupplierId?: string;
  onSelect: (supplierId: string, supplierName: string) => void;
  onAddNew?: (supplier: Supplier) => void;
  className?: string;
  placeholder?: string;
}

export default function SupplierSelector({
  selectedSupplierId,
  onSelect,
  onAddNew,
  className = "",
  placeholder = "בחר ספק...",
}: SupplierSelectorProps) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
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

  const filteredSuppliers = useMemo(() => {
    if (!searchTerm) return suppliers;
    const term = searchTerm.toLowerCase();
    return suppliers.filter(
      (s) =>
        s.name.toLowerCase().includes(term) ||
        s.category?.toLowerCase().includes(term) ||
        s.contactPerson?.toLowerCase().includes(term) ||
        s.phone.includes(term),
    );
  }, [suppliers, searchTerm]);

  const handleAddSupplier = async () => {
    if (!newSupplier.name || !newSupplier.phone) {
      alert("אנא מלא שם וטלפון");
      return;
    }

    try {
      const docRef = await addSupplier(newSupplier as Omit<Supplier, "id">);
      const addedSupplier = {
        id: docRef.id,
        ...newSupplier,
      } as Supplier;

      // Update local state
      setSuppliers((prev) => [...prev, addedSupplier]);

      // Callback
      if (onAddNew) onAddNew(addedSupplier);
      onSelect(docRef.id, newSupplier.name);

      // Reset form
      setNewSupplier({ name: "", phone: "", email: "", category: "other" });
      setShowAddForm(false);
      setSearchTerm("");
    } catch (error) {
      console.error("Error adding supplier:", error);
      alert("שגיאה בהוספת ספק");
    }
  };

  const selectedSupplier = suppliers.find((s) => s.id === selectedSupplierId);

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Select Dropdown */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={placeholder}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            list="suppliers-list"
          />
          <datalist id="suppliers-list">
            {filteredSuppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} - {s.phone}{" "}
                {s.category && `(${CATEGORY_LABELS[s.category]})`}
              </option>
            ))}
          </datalist>
        </div>
        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-3 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 whitespace-nowrap"
        >
          {showAddForm ? "✕" : "+ ספק חדש"}
        </button>
      </div>

      {/* Selected Supplier Display */}
      {selectedSupplier && !searchTerm && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 flex items-center justify-between">
          <div>
            <span className="font-medium text-sm">{selectedSupplier.name}</span>
            <span className="text-xs text-gray-500 mr-2">
              📞 {selectedSupplier.phone}
            </span>
            {selectedSupplier.category && (
              <span className="text-xs text-gray-500 mr-2">
                🏷️ {CATEGORY_LABELS[selectedSupplier.category]}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              setSearchTerm("");
              onSelect("", "");
            }}
            className="text-xs text-red-500 hover:text-red-700"
          >
            ✕ הסר
          </button>
        </div>
      )}

      {/* Add New Supplier Form */}
      {showAddForm && (
        <div className="bg-gray-50 rounded-lg p-3 border space-y-2">
          <h4 className="text-sm font-medium text-gray-700">➕ הוסף ספק חדש</h4>
          <div className="flex gap-2">
            <input
              value={newSupplier.name || ""}
              onChange={(e) =>
                setNewSupplier((p) => ({ ...p, name: e.target.value }))
              }
              placeholder="שם ספק *"
              className="flex-1 border rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <input
              value={newSupplier.phone || ""}
              onChange={(e) =>
                setNewSupplier((p) => ({ ...p, phone: e.target.value }))
              }
              placeholder="טלפון *"
              type="tel"
              className="flex-1 border rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
          <div className="flex gap-2">
            <input
              value={newSupplier.email || ""}
              onChange={(e) =>
                setNewSupplier((p) => ({ ...p, email: e.target.value }))
              }
              placeholder="אימייל (אופציונלי)"
              type="email"
              className="flex-1 border rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <select
              value={newSupplier.category || "other"}
              onChange={(e) =>
                setNewSupplier((p) => ({
                  ...p,
                  category: e.target.value as SupplierCategory,
                }))
              }
              className="flex-1 border rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <input
            value={newSupplier.contactPerson || ""}
            onChange={(e) =>
              setNewSupplier((p) => ({ ...p, contactPerson: e.target.value }))
            }
            placeholder="איש קשר (אופציונלי)"
            className="w-full border rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleAddSupplier}
              className="flex-1 bg-green-600 text-white py-1.5 rounded-lg text-sm hover:bg-green-700"
            >
              הוסף ספק
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAddForm(false);
                setNewSupplier({ name: "", phone: "", category: "other" });
              }}
              className="flex-1 border py-1.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
            >
              ביטול
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
