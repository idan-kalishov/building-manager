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

export default function SuppliersTab({ data, onChange }: any) {
  const f = (key: string) => ({
    value: data[key],
    onChange: (v: string) => onChange({ [key]: v }),
  });
  return (
    <div className="space-y-6">
      <section>
        <h3 className="font-semibold text-gray-700 mb-3">🧹 מנקה</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="שם מנקה" {...f("cleanerName")} />
          <Field label="טלפון מנקה" {...f("cleanerPhone")} />
          <Field label="ימי ניקיון" {...f("cleaningDays")} />
          <Field label="מספר פעמים בשבוע" {...f("cleaningFrequency")} />
        </div>
      </section>
      <section>
        <h3 className="font-semibold text-gray-700 mb-3">🌿 גנן</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="שם גנן" {...f("gardenerName")} />
          <Field label="טלפון גנן" {...f("gardenerPhone")} />
          <Field label="מספר פעמים בחודש" {...f("gardeningFrequency")} />
        </div>
      </section>
      <section>
        <h3 className="font-semibold text-gray-700 mb-3">🔧 אינסטלטור</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="שם אינסטלטור" {...f("plumberName")} />
          <Field label="טלפון אינסטלטור" {...f("plumberPhone")} />
        </div>
      </section>
    </div>
  );
}
