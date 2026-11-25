import { useEffect, useRef, useState } from "react";

interface DueDatePickerProps {
  value: string;
  onChange: (value: string) => void;
}

const WEEKDAYS = ["א", "ב", "ג", "ד", "ה", "ו", "ש"];

function parseDate(value: string) {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function DueDatePicker({ value, onChange }: DueDatePickerProps) {
  const selectedDate = parseDate(value);
  const [open, setOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(
    () => selectedDate || new Date(),
  );
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const closeOnOutsideClick = (event: MouseEvent) => {
      if (
        event.target instanceof Node &&
        !containerRef.current?.contains(event.target)
      ) {
        setOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const startDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const calendarDays: (number | null)[] = [
    ...Array.from({ length: startDay }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];
  const today = formatDate(new Date());
  const monthLabel = visibleMonth.toLocaleDateString("he-IL", {
    month: "long",
    year: "numeric",
  });

  const changeMonth = (amount: number) => {
    setVisibleMonth(new Date(year, month + amount, 1));
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => {
          if (!open) setVisibleMonth(selectedDate || new Date());
          setOpen((current) => !current);
        }}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="w-full border rounded-lg px-3 py-3 text-lg text-right focus:outline-none focus:ring-2 focus:ring-blue-300"
      >
        {selectedDate
          ? selectedDate.toLocaleDateString("he-IL")
          : "בחר תאריך..."}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="בחירת תאריך יעד"
          dir="rtl"
          className="absolute right-0 top-full z-20 mt-2 w-72 rounded-xl border border-gray-200 bg-white p-3 shadow-lg"
        >
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => changeMonth(-1)}
              aria-label="חודש קודם"
              className="h-10 w-10 rounded-lg border text-xl hover:bg-gray-50"
            >
              →
            </button>
            <span className="text-base font-semibold">{monthLabel}</span>
            <button
              type="button"
              onClick={() => changeMonth(1)}
              aria-label="חודש הבא"
              className="h-10 w-10 rounded-lg border text-xl hover:bg-gray-50"
            >
              ←
            </button>
          </div>

          <div className="grid grid-cols-7 text-center">
            {WEEKDAYS.map((day) => (
              <span
                key={day}
                className="py-2 text-sm font-medium text-gray-500"
              >
                {day}
              </span>
            ))}
            {calendarDays.map((day, index) => {
              if (day === null) {
                return <span key={`empty-${index}`} />;
              }

              const date = formatDate(new Date(year, month, day));
              const isSelected = date === value;
              return (
                <button
                  key={date}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => {
                    onChange(date);
                    setOpen(false);
                  }}
                  className={`h-9 rounded-lg text-base hover:bg-blue-50 ${
                    isSelected
                      ? "bg-blue-600 font-semibold text-white hover:bg-blue-700"
                      : date === today
                        ? "border border-blue-300 font-semibold text-blue-700"
                        : "text-gray-800"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {value && (
            <button
              type="button"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
              className="mt-2 w-full rounded-lg py-2 text-base text-gray-600 hover:bg-gray-50"
            >
              נקה תאריך
            </button>
          )}
        </div>
      )}
    </div>
  );
}
