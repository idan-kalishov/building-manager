import { useState } from "react";
import { addLead, updateLead } from "../../lib/leads.service";
import type { Lead, LeadStatus, LeadPriority } from "../../types";

interface Props {
  lead?: Lead | null;
  defaultStatus?: LeadStatus;
  onClose: () => void;
}

const Field = ({ label, value, onChange, type = "text" }: any) => (
  <div className="flex flex-col gap-1">
    <label className="text-sm font-medium text-gray-600">{label}</label>
    <input
      type={type}
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
    />
  </div>
);

export default function LeadFormModal({
  lead,
  defaultStatus = "new",
  onClose,
}: Props) {
  const [data, setData] = useState<Partial<Lead>>(
    lead || { status: defaultStatus },
  );

  const f = (key: keyof Lead) => ({
    value: data[key],
    onChange: (v: any) => setData((p) => ({ ...p, [key]: v })),
  });

  const handleSave = async () => {
    if (!data.name || !data.phone) return alert("שם וטלפון הם שדות חובה");
    if (lead?.id) {
      await updateLead(lead.id, data);
    } else {
      await addLead(data as Omit<Lead, "id">);
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      dir="rtl"
    >
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">
            {lead ? "עריכת ליד" : "ליד חדש"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Fields */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* עדיפות */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-600">עדיפות</label>
            <div className="flex gap-2">
              {[
                { v: "high", label: "🔴 גבוהה" },
                { v: "medium", label: "🟡 בינונית" },
                { v: "low", label: "⚪ נמוכה" },
              ].map((p) => (
                <button
                  key={p.v}
                  type="button"
                  onClick={() =>
                    setData((d) => ({ ...d, priority: p.v as LeadPriority }))
                  }
                  className={`flex-1 py-2 rounded-lg text-sm border transition-colors
                    ${
                      data.priority === p.v
                        ? "bg-blue-600 text-white border-blue-600"
                        : "border-gray-300 hover:bg-gray-50"
                    }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <Field label="שם ועד הבית *" {...f("name")} />
          <Field label="כתובת הבניין" {...f("address")} />
          <Field label="מספר דיירים" {...f("tenantsCount")} type="number" />
          <Field label="טלפון *" {...f("phone")} type="tel" />
          <Field label="אימייל" {...f("email")} type="email" />
          <Field label="חברה מתחרה נוכחית" {...f("currentCompany")} />
          <Field
            label="עלות חודשית נוכחית (₪)"
            {...f("currentCost")}
            type="number"
          />
          <Field
            label="עלות ניהול מוצעת (₪)"
            {...f("managementCost")}
            type="number"
          />
          <Field label="עלות ניקיון + מס' פעמים" {...f("cleaningCost")} />
          <Field label="עלות גינון + מס' פעמים" {...f("gardeningCost")} />
          <Field label="תאריך שליחת הצעה" {...f("proposalDate")} type="date" />
          <Field label="תאריך המשך טיפול" {...f("followUpDate")} type="date" />

          {/* וידאו */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-600">
              וידוא קבלת ההצעה
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() =>
                  setData((p) => ({ ...p, proposalConfirmed: true }))
                }
                className={`flex-1 py-2 rounded-lg text-sm border transition-colors
        ${
          data.proposalConfirmed === true
            ? "bg-green-600 text-white border-green-600"
            : "border-gray-300 hover:bg-gray-50"
        }`}
              >
                ✅ אישרו קבלה
              </button>
              <button
                type="button"
                onClick={() =>
                  setData((p) => ({ ...p, proposalConfirmed: false }))
                }
                className={`flex-1 py-2 rounded-lg text-sm border transition-colors
        ${
          data.proposalConfirmed === false &&
          data.proposalConfirmed !== undefined
            ? "bg-red-500 text-white border-red-500"
            : "border-gray-300 hover:bg-gray-50"
        }`}
              >
                ❌ לא ענו
              </button>
            </div>
          </div>

          {/* סטטוס */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-600">סטטוס</label>
            <select
              value={data.status || "new"}
              onChange={(e) =>
                setData((p) => ({ ...p, status: e.target.value as LeadStatus }))
              }
              className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              <option value="new">ליד חדש</option>
              <option value="contacted">יצירת קשר</option>
              <option value="proposal">הצעה נשלחה</option>
              <option value="negotiation">משא ומתן</option>
              <option value="closed">נסגר ✅</option>
              <option value="irrelevant">לא רלוונטי ❌</option>
            </select>
          </div>

          {/* הערות */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-600">הערות</label>
            <textarea
              value={data.notes || ""}
              onChange={(e) =>
                setData((p) => ({ ...p, notes: e.target.value }))
              }
              rows={3}
              className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 p-4 border-t">
          <button
            onClick={handleSave}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium"
          >
            💾 שמור
          </button>
          <button
            onClick={onClose}
            className="flex-1 border py-2 rounded-lg hover:bg-gray-50 text-gray-600"
          >
            ביטול
          </button>
        </div>
      </div>
    </div>
  );
}
