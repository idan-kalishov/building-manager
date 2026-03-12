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

export default function TechnicalTab({ data, onChange }: any) {
  const f = (key: string) => ({
    value: data[key],
    onChange: (v: string) => onChange({ [key]: v }),
  });
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Field label="דגם אינטרקום" {...f("intercomModel")} />
      <Field label="קוד אינטרקום" {...f("intercomCode")} />
      <Field label="מיקום מערכת אינטרקום" {...f("intercomLocation")} />
      <Field label="לוח חשמל ראשי" {...f("mainElectricPanel")} />
      <Field label="שיבר מרכזי" {...f("mainShiver")} />
      <Field label="מיקום חדר מעלית" {...f("elevatorRoom")} />
      <Field label="חברת מעליות" {...f("elevatorCompany")} />
      <Field label="טלפון חברת מעליות" {...f("elevatorPhone")} />
      <Field label="גג – סוג איטום" {...f("roofSealType")} />
      <Field label="גג – שנת איטום אחרון" {...f("roofLastSeal")} />
      <Field label="מיקום שעון שבת" {...f("shabbatClockLocation")} />
      <Field label="מיקום ברז מים ראשי" {...f("mainWaterTap")} />
      <Field label="מיקום מד מים ראשי" {...f("mainWaterMeter")} />
      <Field label="ספק גז" {...f("gasSupplier")} />
      <Field label="מיקום שעוני גז" {...f("gasMetersLocation")} />
    </div>
  );
}
