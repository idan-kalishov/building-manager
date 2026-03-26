const Field = ({ label, value, onChange }: any) => (
  <div className="flex flex-col gap-1">
    <label className="text-sm font-medium text-gray-600">{label}</label>
    <input
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
    />
  </div>
);

export default function KeysTab({ data, onChange }: any) {
  const f = (key: string) => ({
    value: data[key],
    onChange: (v: string) => onChange({ [key]: v }),
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Field label="מפתח לתיבת ועד" {...f("mailboxKey")} />
      <Field label="מיקום ספייר מפתחות" {...f("spareKeysLocation")} />
      <Field label="מספר ספייר מפתחות לדיירים" {...f("spareKeysCount")} />
    </div>
  );
}
