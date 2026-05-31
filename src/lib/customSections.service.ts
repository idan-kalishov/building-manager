import { db } from "./firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import type { GlobalCustomSection, GlobalCustomField } from "../types";

const COL = "customSections";

export const subscribeGlobalSections = (
  cb: (sections: GlobalCustomSection[]) => void,
) =>
  onSnapshot(collection(db, COL), (snap) =>
    cb(
      snap.docs
        .map(
          (d) =>
            ({
              id: d.id,
              title: d.data().title,
              fields: d.data().fields ?? [], // ← safe fallback
            }) as GlobalCustomSection,
        )
        .sort((a, b) => a.title.localeCompare(b.title, "he")),
    ),
  );

export const addGlobalSection = (title: string) =>
  addDoc(collection(db, COL), { title, fields: [] });

export const deleteGlobalSection = (id: string) => deleteDoc(doc(db, COL, id));

export const addGlobalField = (
  sectionId: string,
  currentFields: GlobalCustomField[] | undefined,
  label: string,
) =>
  updateDoc(doc(db, COL, sectionId), {
    fields: [...(currentFields ?? []), { id: crypto.randomUUID(), label }],
  });

export const deleteGlobalField = (
  sectionId: string,
  currentFields: GlobalCustomField[] | undefined,
  fieldId: string,
) =>
  updateDoc(doc(db, COL, sectionId), {
    fields: (currentFields ?? []).filter((f) => f.id !== fieldId),
  });
