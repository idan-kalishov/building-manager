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

export default function BankInsuranceTab({ data, onChange }: any) {
  const f = (key: string) => ({
    value: data[key],
    onChange: (v: string) => onChange({ [key]: v }),
  });
  return (
    <div className="space-y-6">
      <section>
        <h3 className="font-semibold text-gray-700 mb-3">🏦 בנק</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="שם סניף" {...f("bankBranchName")} />
          <Field label="מספר סניף" {...f("bankBranchNumber")} />
          <Field label="מספר חשבון" {...f("bankAccountNumber")} />
          <Field label="מורשה חתימה בבנק" {...f("bankSignatory")} />
        </div>
      </section>
      <section>
        <h3 className="font-semibold text-gray-700 mb-3">📋 ביטוח</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="חברת ביטוח" {...f("insuranceCompany")} />
          <Field label="סוכן ביטוח" {...f("insuranceAgent")} />
          <Field label="טלפון סוכנות" {...f("insurancePhone")} />
          <Field label="מספר פוליסה" {...f("insurancePolicyNumber")} />
          <Field label="מספר לקוח" {...f("insuranceClientNumber")} />
        </div>
      </section>
    </div>
  );
}
