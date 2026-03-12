interface Props {
  title: string;
  message?: string;
  confirmLabel?: string;
  confirmColor?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  title,
  message,
  confirmLabel = "אישור",
  confirmColor = "bg-red-500 hover:bg-red-600",
  onConfirm,
  onCancel,
}: Props) {
  return (
    <div
      className="fixed inset-0 bg-black/50 z-[60] flex items-end md:items-center justify-center p-4"
      dir="rtl"
    >
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl">
        <div className="p-6 text-center">
          <p className="text-lg font-bold text-gray-800 mb-2">{title}</p>
          {message && <p className="text-sm text-gray-500">{message}</p>}
        </div>
        <div className="flex gap-2 px-4 pb-4">
          <button
            onClick={onConfirm}
            className={`flex-1 ${confirmColor} text-white py-3 rounded-xl font-semibold text-sm transition-colors`}
          >
            {confirmLabel}
          </button>
          <button
            onClick={onCancel}
            className="flex-1 border border-gray-300 text-gray-600 py-3 rounded-xl font-semibold text-sm hover:bg-gray-50"
          >
            ביטול
          </button>
        </div>
      </div>
    </div>
  );
}
