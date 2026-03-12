import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { subscribeBuildings, deleteBuilding } from "../lib/buildings.service";
import { useBuildingsStore } from "../store/buildingsStore";
import BuildingFormModal from "../components/buildings/BuildingFormModal";
import type { Building } from "../types";

export default function Buildings() {
  const { buildings, setBuildings } = useBuildingsStore();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Building | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = subscribeBuildings(setBuildings);
    return unsub;
  }, []);

  const handleEdit = (e: React.MouseEvent, b: Building) => {
    e.stopPropagation();
    setEditing(b);
    setShowModal(true);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("למחוק את הבניין?")) deleteBuilding(id);
  };

  return (
    <div dir="rtl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">🏢 בניינים</h1>
        <button
          onClick={() => {
            setEditing(null);
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + הוסף בניין
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {buildings.map((b) => (
          <div
            key={b.id}
            onClick={() => navigate(`/buildings/${b.id}`)}
            className="bg-white rounded-xl shadow p-4 space-y-2 cursor-pointer hover:shadow-md hover:border-blue-300 border-2 border-transparent transition-all"
          >
            <h2 className="text-lg font-semibold">{b.address}</h2>
            <p className="text-gray-500 text-sm">
              {b.units} דירות | {b.floors} קומות
            </p>
            {b.contractStart && (
              <p className="text-gray-400 text-xs">
                תחילת הסכם: {b.contractStart}
              </p>
            )}
            <div className="flex gap-2 pt-2">
              <button
                onClick={(e) => handleEdit(e, b)}
                className="flex-1 border border-blue-500 text-blue-600 py-1 rounded hover:bg-blue-50"
              >
                ✏️ עריכה
              </button>
              <button
                onClick={(e) => b.id && handleDelete(e, b.id)}
                className="flex-1 border border-red-400 text-red-500 py-1 rounded hover:bg-red-50"
              >
                🗑️ מחיקה
              </button>
            </div>
          </div>
        ))}
        {buildings.length === 0 && (
          <p className="text-gray-400 col-span-3 text-center mt-10">
            אין בניינים עדיין.
          </p>
        )}
      </div>

      {showModal && (
        <BuildingFormModal
          building={editing}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
