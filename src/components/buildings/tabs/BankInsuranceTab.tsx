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

const Section = ({ title }: { title: string }) => (
  <h3 className="font-semibold text-gray-700 mt-5 mb-3 pb-1 border-b">
    {title}
  </h3>
);

export default function BankInsuranceTab({
  data,
  onChange,
}: {
  data: any;
  onChange: (section: any, v: any) => void;
}) {
  const b = data.bank || {};
  const ins = data.insurance || {};

  const f = (section: string, obj: any, key: string) => ({
    value: obj[key],
    onChange: (v: string) => onChange(section, { [key]: v }),
  });

  return (
    <div>
      <Section title="🏦 בנק" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field label="שם סניף" {...f("bank", b, "bankBranchName")} />
        <Field label="מספר סניף" {...f("bank", b, "bankBranchNumber")} />
        <Field label="מספר חשבון" {...f("bank", b, "bankAccountNumber")} />
        <Field label="מורשה חתימה בבנק" {...f("bank", b, "bankSignatory")} />
        <Field
          label="מספר חתימות על צ'ק"
          {...f("bank", b, "signaturesRequired")}
        />
      </div>

      <Section title="📄 ביטוח" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field label="סוג ביטוח" {...f("insurance", ins, "type")} />
        <Field label="חברת ביטוח" {...f("insurance", ins, "company")} />
        <Field label="סוכן ביטוח" {...f("insurance", ins, "agent")} />
        <Field label="טלפון סוכנות" {...f("insurance", ins, "agencyPhone")} />
        <Field label="מייל סוכנות" {...f("insurance", ins, "agencyEmail")} />
        <Field label="מספר פוליסה" {...f("insurance", ins, "policyNumber")} />
        <Field label="מספר לקוח" {...f("insurance", ins, "clientNumber")} />
        <Field label="אמצעי תשלום" {...f("insurance", ins, "paymentMethod")} />
        <Field
          label="ביטוח נזקי צנרת – ספק"
          {...f("insurance", ins, "pipeDamageProvider")}
        />
        <Field
          label="ביטוח נזקי צנרת – טלפון"
          {...f("insurance", ins, "pipeDamagePhone")}
        />
        <Field label="השתתפות עצמית" {...f("insurance", ins, "deductible")} />
        <Field label="עלות ביקור" {...f("insurance", ins, "visitCost")} />
      </div>
    </div>
  );
}
