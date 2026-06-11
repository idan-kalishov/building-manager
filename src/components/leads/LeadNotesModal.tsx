import { useState } from "react";
import type { Lead } from "../../types";
import { updateLead } from "../../lib/leads.service";
import LeadNoteSection, { type LeadNote } from "./LeadNoteSection";

interface Props {
  lead: Lead;
  onClose: () => void;
}

export default function LeadNotesModal({ lead, onClose }: Props) {
  const [notesList, setNotesList] = useState<LeadNote[]>(
    (lead as any).notesList ?? [],
  );

  const handleAddNote = (message: string, author: string) => {
    const newNote: LeadNote = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      author,
      message,
    };
    const updated = [...notesList, newNote];
    setNotesList(updated);
    updateLead(lead.id!, { notesList: updated } as any);
  };

  const handleDeleteNote = (id: string) => {
    const updated = notesList.filter((n) => n.id !== id);
    setNotesList(updated);
    updateLead(lead.id!, { notesList: updated } as any);
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      dir="rtl"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div>
            <h2 className="font-bold text-gray-800 text-base">📝 הערות</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {lead.address || lead.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl w-8 h-8 flex items-center justify-center"
          >
            ×
          </button>
        </div>

        {/* Notes */}
        <div className="flex-1 overflow-y-auto p-4">
          <LeadNoteSection
            notes={notesList}
            onAddNote={handleAddNote}
            onDeleteNote={handleDeleteNote}
          />
        </div>
      </div>
    </div>
  );
}
