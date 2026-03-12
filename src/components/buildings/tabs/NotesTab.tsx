export default function NotesTab({ data, onChange }: any) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-600">
        הערות כלליות לבניין
      </label>
      <textarea
        value={data.notes || ""}
        onChange={(e) => onChange({ notes: e.target.value })}
        rows={10}
        className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
        placeholder="הכנס הערות, מידע ייחודי לבניין..."
      />
    </div>
  );
}
