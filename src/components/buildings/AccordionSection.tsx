import { useState } from "react";

interface Props {
  title: string;
  icon: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export default function AccordionSection({
  title,
  icon,
  children,
  defaultOpen = false,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden mb-3 shadow-sm">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center px-5 py-4 bg-gray-50 hover:bg-blue-50 transition-colors group"
      >
        <span className="font-semibold text-gray-700 text-base group-hover:text-blue-700">
          {icon} {title}
        </span>
        <span
          className={`text-gray-400 transition-transform duration-200 text-xl ${open ? "rotate-180" : ""}`}
        >
          ▼
        </span>
      </button>
      {open && (
        <div className="p-5 bg-white border-t border-gray-100">{children}</div>
      )}
    </div>
  );
}
