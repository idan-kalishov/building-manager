interface ConfirmModalProps {
  title: string;
  message: string;
  confirmLabel: string;
  confirmColor: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  title,
  message,
  confirmLabel,
  confirmColor,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      dir="rtl"
    >
      <div className="bg-white rounded-2xl w-full max-w-sm">
        <div className="p-6">
          <h3 className="text-lg font-bold mb-2">{title}</h3>
          <p className="text-gray-600 text-sm break-words">{message}</p>
        </div>
        <div className="flex gap-2 p-4 border-t">
          <button
            onClick={onConfirm}
            className={`flex-1 ${confirmColor} text-white py-2 rounded-lg font-medium`}
          >
            {confirmLabel}
          </button>
          <button
            onClick={onCancel}
            className="flex-1 border py-2 rounded-lg hover:bg-gray-50 text-gray-600"
          >
            ביטול
          </button>
        </div>
      </div>
    </div>
  );
}
