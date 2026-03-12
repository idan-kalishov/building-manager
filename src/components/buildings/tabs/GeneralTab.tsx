import type { Building } from "../../../types";

interface Props {
  data: Building;
  onChange: (v: Partial<Building>) => void;
}

const Field = ({ label, value, onChange, type = "text" }: any) => (
  <div className="flex flex-col gap-1">
    <label className="text-sm font-medium text-gray-600">{label}</label>
    <input
      type={type}
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
    />
  </div>
);

export default function GeneralTab({ data, onChange }: Props) {
  const g = data.general || {};
  const updateGeneral = (key: string, v: string) =>
    onChange({ general: { ...g, [key]: v } });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Field
        label="כתובת הבניין"
        value={data.address}
        onChange={(v: string) => onChange({ address: v })}
      />
      <Field
        label="מספר דירות"
        type="number"
        value={data.units}
        onChange={(v: string) => onChange({ units: +v })}
      />
      <Field
        label="מספר קומות"
        type="number"
        value={data.floors}
        onChange={(v: string) => onChange({ floors: +v })}
      />
      <Field
        label="מספר חנויות"
        value={g.shops}
        onChange={(v: string) => updateGeneral("shops", v)}
      />
      <Field
        label="קוד כניסה"
        value={data.entryCode}
        onChange={(v: string) => onChange({ entryCode: v })}
      />
      <Field
        label="תחילת הסכם"
        type="date"
        value={data.contractStart}
        onChange={(v: string) => onChange({ contractStart: v })}
      />
      <Field
        label="מיקום ארגז כלים"
        value={g.toolboxLocation}
        onChange={(v: string) => updateGeneral("toolboxLocation", v)}
      />
      <Field
        label="מיקום ועד תיבה"
        value={g.committeeBoxLocation}
        onChange={(v: string) => updateGeneral("committeeBoxLocation", v)}
      />
      <Field
        label="מיקום צקים"
        value={g.checksLocation}
        onChange={(v: string) => updateGeneral("checksLocation", v)}
      />
      <Field
        label="מיקום סולם"
        value={g.ladderLocation}
        onChange={(v: string) => updateGeneral("ladderLocation", v)}
      />
      <Field
        label="שיבר מרכזי"
        value={g.mainShiver}
        onChange={(v: string) => updateGeneral("mainShiver", v)}
      />
      <Field
        label="לוח חשמל ראשי"
        value={g.mainElectricPanel}
        onChange={(v: string) => updateGeneral("mainElectricPanel", v)}
      />
      <Field
        label="אחראי צ'קים לספקים"
        value={g.checksResponsible}
        onChange={(v: string) => updateGeneral("checksResponsible", v)}
      />
      <Field
        label="מיקום ערכת עזרה ראשונה"
        value={g.firstAidLocation}
        onChange={(v: string) => updateGeneral("firstAidLocation", v)}
      />
      <Field
        label="דייר איש קשר טכני"
        value={g.techContactTenant}
        onChange={(v: string) => updateGeneral("techContactTenant", v)}
      />
      <Field
        label="מנקה שיכול לעזור בבניין"
        value={g.helperCleaner}
        onChange={(v: string) => updateGeneral("helperCleaner", v)}
      />
      <Field
        label="מנהל לקוח (בניין)"
        value={g.clientManager}
        onChange={(v: string) => updateGeneral("clientManager", v)}
      />
    </div>
  );
}
