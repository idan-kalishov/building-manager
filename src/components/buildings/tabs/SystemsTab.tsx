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

export default function SystemsTab({
  data,
  onChange,
}: {
  data: any;
  onChange: (section: any, v: any) => void;
}) {
  const ic = data.intercom || {};
  const elev = data.elevator || {};
  const sec = data.security || {};
  const ac = data.airConditioning || {};
  const fire = data.firefighting || {};
  const roof = data.roof || {};

  const f = (section: string, obj: any, key: string) => ({
    value: obj[key],
    onChange: (v: string) => onChange(section, { [key]: v }),
  });

  return (
    <div>
      <Section title="🔔 אינטרקום" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field label="דגם" {...f("intercom", ic, "model")} />
        <Field label="קוד כניסה" {...f("intercom", ic, "entryCode")} />
        <Field label="מצלמה" {...f("intercom", ic, "camera")} />
        <Field label="סוג קודן" {...f("intercom", ic, "coderType")} />
        <Field label="מיקום מערכת" {...f("intercom", ic, "location")} />
        <Field label="קוד טכנאי" {...f("intercom", ic, "techCode")} />
      </div>

      <Section title="🛗 מעלית" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field label="מספר מעליות" {...f("elevator", elev, "count")} />
        <Field label="מספר תחנות" {...f("elevator", elev, "stationsCount")} />
        <Field label="סוג מעלית" {...f("elevator", elev, "type")} />
        <Field label="חברת מעליות" {...f("elevator", elev, "company")} />
        <Field label="טלפון חברה" {...f("elevator", elev, "companyPhone")} />
        <Field label="מהנדס מעליות" {...f("elevator", elev, "engineer")} />
        <Field label="טלפון מהנדס" {...f("elevator", elev, "engineerPhone")} />
        <Field
          label="עלות קריאת שרות"
          {...f("elevator", elev, "serviceCallCost")}
        />
        <Field label="ביטוח חלפים" {...f("elevator", elev, "partsInsurance")} />
        <Field label="ספק הטלפון" {...f("elevator", elev, "phoneProvider")} />
        <Field
          label="על שם מי קו הטלפון"
          {...f("elevator", elev, "phoneLineOwner")}
        />
        <Field
          label="מספר קו הטלפון"
          {...f("elevator", elev, "phoneLineNumber")}
        />
        <Field
          label="מיקום חדר מעלית"
          {...f("elevator", elev, "roomLocation")}
        />
        <Field label="מפתח לחדר מעלית" {...f("elevator", elev, "roomKey")} />
        <Field
          label="צורת תשלום לחברת המעליות"
          {...f("elevator", elev, "paymentMethod")}
        />
      </div>

      <Section title="📷 מצלמות אבטחה" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field label="מערכת אבטחה" {...f("security", sec, "system")} />
        <Field
          label="מיקום מצלמות"
          {...f("security", sec, "cameraLocations")}
        />
        <Field label="ספק אבטחה" {...f("security", sec, "provider")} />
        <Field label="טלפון ספק" {...f("security", sec, "providerPhone")} />
      </div>

      <Section title="❄️ מיזוג אוויר" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field label="מערכות מיזוג" {...f("airConditioning", ac, "systems")} />
        <Field
          label="ספק תחזוקה"
          {...f("airConditioning", ac, "maintenanceProvider")}
        />
        <Field
          label="טלפון ספק"
          {...f("airConditioning", ac, "maintenancePhone")}
        />
      </div>

      <Section title="🧯 כיבוי אש" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field label="חברה" {...f("firefighting", fire, "company")} />
        <Field
          label="טלפון חברה"
          {...f("firefighting", fire, "companyPhone")}
        />
      </div>

      <Section title="🏠 גג" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field label="סוג איטום" {...f("roof", roof, "sealType")} />
        <Field label="חברה שאטמה" {...f("roof", roof, "sealCompany")} />
        <Field label="טלפון חברה" {...f("roof", roof, "sealCompanyPhone")} />
        <Field label="שנת איטום אחרון" {...f("roof", roof, "lastSealYear")} />
        <Field label="שטח הגג במ״ר" {...f("roof", roof, "areaSqm")} />
        <Field label="אחריות עד" {...f("roof", roof, "warrantyUntil")} />
        <Field label="מיקום מפתח לגג" {...f("roof", roof, "keyLocation")} />
      </div>
    </div>
  );
}
