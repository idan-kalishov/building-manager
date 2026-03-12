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

export default function SuppliersTab({
  data,
  onChange,
}: {
  data: any;
  onChange: (section: any, v: any) => void;
}) {
  const clean = data.cleaning || {};
  const gard = data.gardening || {};
  const comm = data.committee || {};

  const f = (section: string, obj: any, key: string) => ({
    value: obj[key],
    onChange: (v: string) => onChange(section, { [key]: v }),
  });

  return (
    <div>
      <Section title="🧹 ניקיון" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field label="שם מנקה" {...f("cleaning", clean, "name")} />
        <Field label="טלפון מנקה" {...f("cleaning", clean, "phone")} />
        <Field label="ז.ת מנקה" {...f("cleaning", clean, "idNumber")} />
        <Field
          label="מספר פעמים בשבוע"
          {...f("cleaning", clean, "weeklyFrequency")}
        />
        <Field label="ימי ניקיון" {...f("cleaning", clean, "days")} />
        <Field
          label="ניקוי מסדרונות"
          {...f("cleaning", clean, "corridorsDays")}
        />
        <Field
          label="ניקוי חדר מדרגות"
          {...f("cleaning", clean, "stairsDays")}
        />
        <Field label="דגשים בניקיון" {...f("cleaning", clean, "notes")} />
        <Field label="דגם לובי" {...f("cleaning", clean, "lobbyModel")} />
        <Field label="צבע לובי" {...f("cleaning", clean, "lobbyColor")} />
        <Field
          label="דגם מסדרונות"
          {...f("cleaning", clean, "corridorModel")}
        />
        <Field
          label="צבע מסדרונות"
          {...f("cleaning", clean, "corridorColor")}
        />
        <Field
          label="דגם חדר מדרגות"
          {...f("cleaning", clean, "stairsModel")}
        />
        <Field
          label="צבע חדר מדרגות"
          {...f("cleaning", clean, "stairsColor")}
        />
      </div>

      <Section title="🌿 גינון" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field label="שם גנן" {...f("gardening", gard, "gardenerName")} />
        <Field label="טלפון גנן" {...f("gardening", gard, "gardenerPhone")} />
        <Field
          label="מספר פעמים בחודש"
          {...f("gardening", gard, "frequency")}
        />
        <Field
          label="מערכת השקיה אוטומטית"
          {...f("gardening", gard, "autoIrrigation")}
        />
        <Field
          label="דגם מערכת השקייה"
          {...f("gardening", gard, "irrigationModel")}
        />
        <Field
          label="מיקום מערכת השקיה"
          {...f("gardening", gard, "irrigationLocation")}
        />
        <Field
          label="מיקום שיבר הגינה"
          {...f("gardening", gard, "gardenShiverLocation")}
        />
        <Field
          label="ימי הוצאת גזם"
          {...f("gardening", gard, "trimmingDays")}
        />
        <Field
          label="טלפון איסוף גזם"
          {...f("gardening", gard, "trimmingPickupPhone")}
        />
      </div>

      <Section title="🏛️ ועד הבית" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field
          label="מיקום תיבת ועד"
          {...f("committee", comm, "boxLocation")}
        />
        <Field
          label="שיטת חלוקת דמי ועד"
          {...f("committee", comm, "feeDistribution")}
        />
        <Field
          label="תהליך קבלת צ'ק"
          {...f("committee", comm, "checkProcess")}
        />
        <Field
          label="מספר חתימות על צ'ק"
          {...f("committee", comm, "signaturesRequired")}
        />
      </div>
    </div>
  );
}
