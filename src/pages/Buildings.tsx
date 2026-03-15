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

      <div className="flex flex-col gap-2">
        {buildings.map((b) => (
          <div
            key={b.id}
            onClick={() => navigate(`/buildings/${b.id}`)}
            className="flex items-center justify-between bg-white px-4 py-4 rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:bg-gray-50 hover:border-blue-200 transition-all"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🏢</span>
              <p className="font-semibold text-gray-800">{b.address}</p>
            </div>

            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={(e) => handleEdit(e, b)}
                className="border border-blue-400 text-blue-600 px-3 py-1 rounded-lg text-sm hover:bg-blue-50"
              >
                ✏️
              </button>
              <button
                onClick={(e) => b.id && handleDelete(e, b.id)}
                className="border border-red-300 text-red-500 px-3 py-1 rounded-lg text-sm hover:bg-red-50"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
        {buildings.length === 0 && (
          <p className="text-gray-400 text-center py-10">אין בניינים עדיין.</p>
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
