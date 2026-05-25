import { useState } from "react";
import type { TaskUpdate, Technician } from "../../types";

interface TaskUpdateSectionProps {
  updates: TaskUpdate[];
  onAddUpdate: (update: Omit<TaskUpdate, "id" | "timestamp">) => void;
}

const TECHNICIAN_COLORS: Record<Technician, string> = {
  גדי: "bg-blue-100 text-blue-800",
  עידן: "bg-purple-100 text-purple-800",
  אחר: "bg-gray-100 text-gray-800",
};

const TECHNICIAN_ICONS: Record<Technician, string> = {
  גדי: "👨‍🔧",
  עידן: "👷",
  אחר: "👤",
};

const TECHNICIANS: Technician[] = ["גדי", "עידן", "אחר"];

export default function TaskUpdateSection({
  updates,
  onAddUpdate,
}: TaskUpdateSectionProps) {
  const [technician, setTechnician] = useState<Technician>("גדי");
  const [updateMessage, setUpdateMessage] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddUpdate = () => {
    if (!updateMessage.trim()) {
      alert("אנא הזן תוכן עדכון");
      return;
    }

    onAddUpdate({
      technician,
      message: updateMessage.trim(),
    });

    setUpdateMessage("");
    setTechnician("גדי");
    setShowAddForm(false);
  };

  return (
    <div className="border-t pt-4 mt-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-md font-semibold text-gray-700 flex items-center gap-2">
          📋 היסטוריית עדכונים
          <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
            {updates.length}
          </span>
        </h3>
        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="text-sm bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600"
        >
          {showAddForm ? "− ביטול" : "+ הוסף עדכון"}
        </button>
      </div>

      {/* Add Update Form */}
      {showAddForm && (
        <div className="bg-gray-50 rounded-lg p-3 mb-4 space-y-3">
          <div className="flex gap-2">
            {TECHNICIANS.map((tech) => (
              <button
                key={tech}
                type="button"
                onClick={() => setTechnician(tech)}
                className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-all
                  ${
                    technician === tech
                      ? "bg-blue-600 text-white"
                      : "bg-white border border-gray-300 text-gray-600 hover:bg-gray-100"
                  }`}
              >
                {TECHNICIAN_ICONS[tech]} {tech}
              </button>
            ))}
          </div>
          <textarea
            value={updateMessage}
            onChange={(e) => setUpdateMessage(e.target.value)}
            placeholder="תאר מה בוצע, מה נמצא, או סטטוס עדכני..."
            rows={2}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
          />
          <button
            onClick={handleAddUpdate}
            className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 text-sm font-medium"
          >
            שמור עדכון
          </button>
        </div>
      )}

      {/* Updates List */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {updates.length === 0 ? (
          <div className="text-center py-4 text-gray-400 text-sm">
            אין עדכונים עדיין
          </div>
        ) : (
          [...updates].reverse().map((update) => (
            <div key={update.id} className="bg-gray-50 rounded-lg p-3 text-sm">
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${TECHNICIAN_COLORS[update.technician]}`}
                >
                  {TECHNICIAN_ICONS[update.technician]} {update.technician}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(update.timestamp).toLocaleString("he-IL")}
                </span>
              </div>
              <p className="text-gray-700">{update.message}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
