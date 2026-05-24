import { useState, useCallback } from "react";
import * as XLSX from "xlsx";

interface ContactRow {
  [key: string]: string | number | undefined;
}

interface ParsedContact {
  displayName: string;
  phone: string;
}

const COL = {
  street: "רחוב",
  building: "בניין",
  unit: "יחידה",
  type: "סוג",
  firstName: "שם פרטי",
  lastName: "שם משפחה",
  mobile: "נייד",
};

// עמודות חובה — נייד אינו כלול כי יש אנשים ללא טלפון
const REQUIRED_COLS = [
  COL.street,
  COL.building,
  COL.unit,
  COL.type,
  COL.firstName,
  COL.lastName,
];

function detectHeaderRow(sheet: XLSX.WorkSheet): number {
  const ref = sheet["!ref"];
  if (!ref) return -1;

  const range = XLSX.utils.decode_range(ref);
  const targets = Object.values(COL);

  for (let r = range.s.r; r <= Math.min(range.e.r, 10); r++) {
    const cellValues: string[] = [];
    for (let c = range.s.c; c <= range.e.c; c++) {
      const cell = sheet[XLSX.utils.encode_cell({ r, c })];
      if (cell?.v != null) cellValues.push(String(cell.v).trim());
    }
    const matches = targets.filter((t) => cellValues.includes(t));
    if (matches.length >= 2) return r;
  }

  return -1;
}

function buildDisplayName(row: ContactRow): string {
  const type = String(row[COL.type] || "");
  const prefix = type.includes("בעל") ? "ב" : "ש";
  const first = String(row[COL.firstName] || "").trim();
  const last = String(row[COL.lastName] || "").trim();
  const street = String(row[COL.street] || "").trim();
  const bnum = String(row[COL.building] || "")
    .replace(".0", "")
    .trim();
  const unum = String(row[COL.unit] || "")
    .replace(".0", "")
    .trim();
  return `${prefix} ${first} ${last} - ${street} ${bnum}/${unum}`;
}

function parsePhone(raw: string | number | undefined): string {
  if (!raw) return "";
  const s = String(raw).replace(/\.0$/, "").trim();
  if (/e/i.test(s)) return String(Math.round(Number(s)));
  return s.replace(/-/g, "");
}

function toGmailCSV(contacts: ParsedContact[]): string {
<<<<<<< HEAD
  // Google Contacts expects specific column names
  // Using "Given Name" and "Phone 1 - Value" format
  const header = "Given Name,Phone 1 - Value,Phone 1 - Type\n";
  const rows = contacts
    .filter((c) => c.phone)
    .map((c) => {
      // Escape quotes in display name
      const escapedName = c.displayName.replace(/"/g, '""');
      // Ensure phone is properly formatted
      const cleanPhone = c.phone.replace(/[^\d+]/g, "");
      return `"${escapedName}","${cleanPhone}","Mobile"`;
    })
=======
  const header = "Name,Phone 1 - Value,Phone 1 - Type\n";
  const rows = contacts
    .filter((c) => c.phone)
    .map((c) => `"${c.displayName.replace(/"/g, '""')}","${c.phone}","Mobile"`)
>>>>>>> fca747ee3617dd3c86bfb41eaca36e8f6efea17e
    .join("\n");
  return header + rows;
}

function downloadCSV(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ContactsImport() {
  const [contacts, setContacts] = useState<ParsedContact[]>([]);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [headerRowInfo, setHeaderRowInfo] = useState<number | null>(null);
  const [skippedCount, setSkippedCount] = useState(0);
  const [dragging, setDragging] = useState(false);

  const processFile = (file: File) => {
    setError("");
    setContacts([]);
    setHeaderRowInfo(null);
    setSkippedCount(0);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];

        const headerRow = detectHeaderRow(sheet);

        if (headerRow === -1) {
          setError(
            `לא נמצאה שורת כותרות בקובץ.\n\nהקפד שהקובץ מכיל עמודות כמו: ${Object.values(COL).join(", ")}`,
          );
          return;
        }

        setHeaderRowInfo(headerRow + 1);

        const rows = XLSX.utils.sheet_to_json<ContactRow>(sheet, {
          range: headerRow,
        });

        if (!rows.length) {
          setError("לא נמצאו נתונים מתחת לשורת הכותרות.");
          return;
        }

        // בדיקת עמודות חובה בלבד — נייד אינו חובה
        const keys = Object.keys(rows[0]);
        const missing = REQUIRED_COLS.filter((k) => !keys.includes(k));
        if (missing.length > 0) {
          setError(
            `חסרות עמודות: ${missing.join(", ")}\n\nעמודות שנמצאו: ${keys.join(", ")}`,
          );
          return;
        }

        // שורות ללא טלפון נדלגות בשקט
        const parsed: ParsedContact[] = rows
          .map((r) => ({
            displayName: buildDisplayName(r),
            phone: parsePhone(r[COL.mobile]),
          }))
          .filter((c) => c.phone);

        const skipped = rows.length - parsed.length;

        if (!parsed.length) {
          setError(
            `לא נמצא אף מספר טלפון בקובץ. ודא שהעמודה "${COL.mobile}" מכילה נתונים.`,
          );
          return;
        }

        setSkippedCount(skipped);
        setContacts(parsed);
      } catch {
        setError("שגיאה בקריאת הקובץ. ודא שזה קובץ Excel תקין (.xlsx / .xls)");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }, []);

  const handleDownload = () => {
    const csv = toGmailCSV(contacts);
    const base = fileName.replace(/\.[^.]+$/, "") || "contacts";
    downloadCSV(csv, `${base}_gmail.csv`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">
            ייצוא אנשי קשר לג'ימייל
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            העלה את קובץ האקסל המיוצא מהמערכת וקבל CSV מוכן לייבוא ישיר לג'ימייל
          </p>
        </div>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors cursor-pointer mb-6
            ${
              dragging
                ? "border-blue-400 bg-blue-50"
                : "border-gray-300 bg-white hover:border-blue-300 hover:bg-blue-50/40"
            }`}
          onClick={() => document.getElementById("file-input")?.click()}
        >
          <input
            id="file-input"
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={onFileChange}
          />
          <div className="text-4xl mb-3">📊</div>
          <p className="text-gray-600 font-medium">
            גרור קובץ Excel לכאן או לחץ לבחירה
          </p>
          <p className="text-gray-400 text-xs mt-1">נתמך: .xlsx, .xls</p>
          {fileName && (
            <p className="mt-3 text-sm text-blue-600 font-medium">
              ✓ {fileName}
            </p>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-6 text-sm whitespace-pre-line">
            {error}
          </div>
        )}

        {contacts.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm text-gray-500">
                  נמצאו{" "}
                  <span className="font-bold text-gray-800">
                    {contacts.length}
                  </span>{" "}
                  אנשי קשר
                  {skippedCount > 0 && (
                    <span className="mr-2 text-amber-500 text-xs">
                      ({skippedCount} ללא טלפון — דולגו)
                    </span>
                  )}
                </span>
                {headerRowInfo !== null && (
                  <span className="text-xs text-gray-400">
                    כותרות זוהו בשורה {headerRowInfo}
                  </span>
                )}
              </div>
              <button
                onClick={handleDownload}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <span>⬇️</span> הורד CSV לג'ימייל
              </button>
            </div>

            <div className="overflow-auto max-h-96">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="text-right px-5 py-3 text-gray-500 font-medium">
                      שם להצגה
                    </th>
                    <th className="text-right px-5 py-3 text-gray-500 font-medium">
                      טלפון
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.map((c, i) => (
                    <tr
                      key={i}
                      className="border-t border-gray-50 hover:bg-gray-50"
                    >
                      <td className="px-5 py-3 text-gray-800">
                        {c.displayName}
                      </td>
                      <td className="px-5 py-3 text-gray-500 font-mono">
                        {c.phone}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-blue-50 border-t border-blue-100 px-5 py-4">
              <p className="text-xs text-blue-700 font-semibold mb-1">
                איך לייבא לג'ימייל:
              </p>
              <ol className="text-xs text-blue-600 list-decimal list-inside space-y-0.5">
                <li>
                  פתח <strong>contacts.google.com</strong>
                </li>
                <li>
                  לחץ על <strong>ייבא</strong> (Import)
                </li>
                <li>בחר את קובץ ה-CSV שהורדת</li>
                <li>
                  לחץ <strong>ייבא</strong> — זהו!
                </li>
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
