import { useState } from "react";
import { addBuilding, updateBuilding } from "../../lib/buildings.service";
import GeneralTab from "./tabs/GeneralTab";
import TechnicalTab from "./tabs/TechnicalTab";
import SuppliersTab from "./tabs/SuppliersTab";
import BankInsuranceTab from "./tabs/BankInsuranceTab";
import KeysTab from "./tabs/KeysTab";
import NotesTab from "./tabs/NotesTab";
import type { Building } from "../../types";

const TABS = [
  { id: "general", label: "כללי" },
  { id: "technical", label: "טכני" },
  { id: "suppliers", label: "ספקים" },
  { id: "bank", label: "בנק וביטוח" },
  { id: "keys", label: "מפתחות" },
  { id: "notes", label: "הערות" },
];

interface Props {
  building: Building | null;
  onClose: () => void;
}

export default function BuildingFormModal({ building, onClose }: Props) {
  const [activeTab, setActiveTab] = useState("general");
  const [data, setData] = useState<Building>(
    building || { address: "", floors: 0, units: 0 },
  );

  const update = (section: keyof Building, values: any) =>
    setData((prev) => ({
      ...prev,
      [section]: { ...(prev[section] as any), ...values },
    }));

  const handleSave = async () => {
    if (building?.id) {
      await updateBuilding(building.id, data);
    } else {
      await addBuilding(data);
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      dir="rtl"
    >
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">
            {building ? "עריכת בניין" : "בניין חדש"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto border-b">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2 text-sm whitespace-nowrap font-medium border-b-2 transition-colors
                ${activeTab === t.id ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === "general" && (
            <GeneralTab
              data={data}
              onChange={(v) => setData((p) => ({ ...p, ...v }))}
            />
          )}
          {activeTab === "technical" && (
            <TechnicalTab
              data={data.technical || {}}
              onChange={(v: any) => update("technical", v)}
            />
          )}
          {activeTab === "suppliers" && (
            <SuppliersTab
              data={data.suppliers || {}}
              onChange={(v: any) => update("suppliers", v)}
            />
          )}
          {activeTab === "bank" && (
            <BankInsuranceTab
              data={{ ...data.bank, ...data.insurance }}
              onChange={(v: any) => update("bank", v)}
            />
          )}
          {activeTab === "keys" && (
            <KeysTab
              data={data.keys || {}}
              onChange={(v: any) => update("keys", v)}
            />
          )}
          {activeTab === "notes" && (
            <NotesTab
              data={data}
              onChange={(v: any) => setData((p) => ({ ...p, ...v }))}
            />
          )}
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
