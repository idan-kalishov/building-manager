import { db } from "./firebase";
import {
  collection,
  addDoc,
  updateDoc,
  deleteField,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
  writeBatch,
} from "firebase/firestore";
import type { Lead } from "../types";

export type LeadCollection = "leads" | "propertyLeads";

export const subscribeLeads = (
  cb: (leads: Lead[]) => void,
  collectionName: LeadCollection = "leads",
) =>
  onSnapshot(
    query(collection(db, collectionName), orderBy("order", "asc")),
    (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Lead)),
  );

export const addLead = async (
  data: Omit<Lead, "id">,
  collectionName: LeadCollection = "leads",
) => {
  // שים בסוף הרשימה
  const order = Date.now();
  return addDoc(collection(db, collectionName), {
    ...data,
    order,
    createdAt: serverTimestamp(),
  });
};

export const bulkAddLeads = async (
  leadsList: Omit<Lead, "id">[],
  collectionName: LeadCollection = "leads",
) => {
  const CHUNK_SIZE = 450; // מגבלת אצווה של פיירבייס היא 500
  const baseOrder = Date.now();

  for (let i = 0; i < leadsList.length; i += CHUNK_SIZE) {
    const chunk = leadsList.slice(i, i + CHUNK_SIZE);
    const batch = writeBatch(db);
    const colRef = collection(db, collectionName);

    chunk.forEach((lead, idx) => {
      const newDocRef = doc(colRef);
      // סינון שדות ריקים או undefined כדי ש-Firestore לא יזרוק שגיאה
      const cleanData = Object.fromEntries(
        Object.entries(lead).filter(([, value]) => value !== undefined && value !== ""),
      );

      batch.set(newDocRef, {
        ...cleanData,
        order: baseOrder + (i + idx) * 1000,
        createdAt: serverTimestamp(),
      });
    });

    await batch.commit();
  }
};

export const updateLead = (
  id: string,
  data: Partial<Lead>,
  collectionName: LeadCollection = "leads",
) => {
  const updates = Object.fromEntries(
    Object.entries(data).map(([field, value]) => [
      field,
      value === undefined ? deleteField() : value,
    ]),
  );
  return updateDoc(doc(db, collectionName, id), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

export const deleteLead = (
  id: string,
  collectionName: LeadCollection = "leads",
) => deleteDoc(doc(db, collectionName, id));

// חישוב order חדש בין שני כרטיסים
export const getOrderBetween = (before?: number, after?: number): number => {
  if (before === undefined && after === undefined) return 1000;
  if (before === undefined) return after! / 2;
  if (after === undefined) return before + 1000;
  return (before + after) / 2;
};
