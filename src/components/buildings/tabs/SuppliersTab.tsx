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
  const lights = data.lights || {};
  const muni = data.municipality || {};
  const cult = data.culturalAssociation || {};

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
        <Field
          label="מנקה מוציא חשבוניות"
          {...f("cleaning", clean, "hasInvoices")}
        />
        <Field
          label="מנקה ביטוח לאומי – פנקס"
          {...f("cleaning", clean, "nationalInsuranceBooklet")}
        />
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
        <Field label="מפיצי ריח" {...f("cleaning", clean, "airFreshener")} />
        <Field
          label="מפיצי ריח מיקום"
          {...f("cleaning", clean, "airFreshenerLocation")}
        />
        <Field label="דגשים בניקיון" {...f("cleaning", clean, "notes")} />
      </div>

      <Section title="💡 נורות ותאורה" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field label="נורות כללי" {...f("lights", lights, "general")} />
        <Field
          label="מיקום נורות ספייר"
          {...f("lights", lights, "spareLocation")}
        />
        <Field label="לובי – דגם" {...f("lights", lights, "lobbyModel")} />
        <Field label="לובי – צבע" {...f("lights", lights, "lobbyColor")} />
        <Field
          label="מסדרונות – דגם"
          {...f("lights", lights, "corridorModel")}
        />
        <Field
          label="מסדרונות – צבע"
          {...f("lights", lights, "corridorColor")}
        />
        <Field
          label="חדר מדרגות – דגם"
          {...f("lights", lights, "stairsModel")}
        />
        <Field
          label="חדר מדרגות – צבע"
          {...f("lights", lights, "stairsColor")}
        />
        <Field
          label="מפיצי ריח – מספר סידורי"
          {...f("lights", lights, "airFreshenerSerial")}
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
          label="מיקום צינור השקייה"
          {...f("gardening", gard, "irrigationPipeLocation")}
        />
        <Field
          label="מיקום שיבר הגינה"
          {...f("gardening", gard, "gardenShiverLocation")}
        />
      </div>

      <Section title="🏛️ ועד הבית" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field
          label="מיקום תיבת ועד"
          {...f("committee", comm, "boxLocation")}
        />
        <Field
          label="מיקום הנחת צ'קים"
          {...f("committee", comm, "checksPlacementLocation")}
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

      <Section title="🏙️ עירייה" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field
          label="פרטי רשומה"
          {...f("municipality", muni, "registrationDetails")}
        />
        <Field
          label="מספר רשומה"
          {...f("municipality", muni, "registrationNumber")}
        />
        <Field
          label="ימי הוצאת חפצים"
          {...f("municipality", muni, "itemRemovalDays")}
        />
        <Field
          label="ימי פינוי גזם"
          {...f("municipality", muni, "pruningRemovalDays")}
        />
        <Field
          label="תחנת תברואה שם"
          {...f("municipality", muni, "sanitationStationName")}
        />
        <Field
          label="תחנת תברואה טלפון"
          {...f("municipality", muni, "sanitationStationPhone")}
        />
      </div>

      <Section title="🏘️ האגודה לתרבות הדיור" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field
          label="שם נציג"
          {...f("culturalAssociation", cult, "representativeName")}
        />
        <Field
          label="טלפון נציג"
          {...f("culturalAssociation", cult, "representativePhone")}
        />
        <Field
          label="מנוי לבניין"
          {...f("culturalAssociation", cult, "hasSubscription")}
        />
      </div>
    </div>
  );
}
