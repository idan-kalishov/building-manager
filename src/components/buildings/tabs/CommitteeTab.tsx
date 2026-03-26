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

export default function CommitteeTab({
  data,
  onChange,
}: {
  data: any;
  onChange: (section: any, v: any) => void;
}) {
  const comm = data.committee || {};
  const muni = data.municipality || {};
  const cult = data.culturalAssociation || {};

  const f = (section: string, obj: any, key: string) => ({
    value: obj[key],
    onChange: (v: string) => onChange(section, { [key]: v }),
  });

  return (
    <div>
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
