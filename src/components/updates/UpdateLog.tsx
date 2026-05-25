import type { Technician, TaskUpdate } from "../../types";

interface UpdateLogProps {
  updates: TaskUpdate[];
}

const TECHNICIAN_COLORS: Record<Technician, string> = {
  גדי: "bg-blue-100 text-blue-800 border-blue-200",
  עידן: "bg-purple-100 text-purple-800 border-purple-200",
  אחר: "bg-gray-100 text-gray-800 border-gray-200",
};

const TECHNICIAN_ICONS: Record<Technician, string> = {
  גדי: "👨‍🔧",
  עידן: "👷",
  אחר: "👤",
};

export default function UpdateLog({ updates }: UpdateLogProps) {
  if (updates.length === 0) {
    return (
      <div className="text-center py-6 text-gray-400 text-sm border-t pt-4">
        📝 אין עדכונים עדיין
      </div>
    );
  }

  return (
    <div className="mt-4 border-t pt-4">
      <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
        <span>📋 היסטוריית עדכונים</span>
        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
          {updates.length}
        </span>
      </h4>
      <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
        {[...updates].reverse().map((update) => (
          <div
            key={update.id}
            className="bg-gray-50 rounded-lg p-3 border-r-4 border-blue-400 text-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${TECHNICIAN_COLORS[update.technician]}`}
                >
                  {TECHNICIAN_ICONS[update.technician]} {update.technician}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(update.timestamp).toLocaleString("he-IL")}
                </span>
              </div>
              {(update.oldDueDate || update.newDueDate) && (
                <span className="text-xs bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-full">
                  📅 תאריך עודכן
                </span>
              )}
            </div>

            <p className="text-gray-700 mb-2">{update.message}</p>

            {(update.oldDueDate || update.newDueDate) && (
              <div className="text-xs text-gray-500 bg-white rounded p-1.5 mt-1">
                {update.oldDueDate && (
                  <span className="line-through text-red-500 ml-2">
                    {update.oldDueDate}
                  </span>
                )}
                {update.newDueDate && (
                  <span className="text-green-600 font-medium">
                    → {update.newDueDate}
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
