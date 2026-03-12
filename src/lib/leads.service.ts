import { db } from "./firebase";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import type { Lead } from "../types";

const COL = "leads";

export const subscribeLeads = (cb: (leads: Lead[]) => void) =>
  onSnapshot(query(collection(db, COL), orderBy("order", "asc")), (snap) =>
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Lead)),
  );

export const addLead = async (data: Omit<Lead, "id">) => {
  // שים בסוף הרשימה
  const order = Date.now();
  return addDoc(collection(db, COL), {
    ...data,
    order,
    createdAt: serverTimestamp(),
  });
};

export const updateLead = (id: string, data: Partial<Lead>) =>
  updateDoc(doc(db, COL, id), { ...data, updatedAt: serverTimestamp() });

export const deleteLead = (id: string) => deleteDoc(doc(db, COL, id));

// חישוב order חדש בין שני כרטיסים
export const getOrderBetween = (before?: number, after?: number): number => {
  if (before === undefined && after === undefined) return 1000;
  if (before === undefined) return after! / 2;
  if (after === undefined) return before + 1000;
  return (before + after) / 2;
};
