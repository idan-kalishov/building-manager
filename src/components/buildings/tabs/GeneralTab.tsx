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
        value={data.general?.shops}
        onChange={(v: string) =>
          onChange({ general: { ...data.general, shops: v } })
        }
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
        value={data.general?.toolboxLocation}
        onChange={(v: string) =>
          onChange({ general: { ...data.general, toolboxLocation: v } })
        }
      />
      <Field
        label="מיקום ועד תיבה"
        value={data.general?.committeeBoxLocation}
        onChange={(v: string) =>
          onChange({ general: { ...data.general, committeeBoxLocation: v } })
        }
      />
      <Field
        label="מיקום צקים"
        value={data.general?.checksLocation}
        onChange={(v: string) =>
          onChange({ general: { ...data.general, checksLocation: v } })
        }
      />
      <Field
        label="מיקום סולם"
        value={data.general?.ladderLocation}
        onChange={(v: string) =>
          onChange({ general: { ...data.general, ladderLocation: v } })
        }
      />
    </div>
  );
}
