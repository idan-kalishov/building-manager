// lib/suppliers.service.ts
import { db } from "./firebase";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  where,
  getDocs,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import type { Supplier } from "../types";

const COL = "suppliers";

export const subscribeSuppliers = (cb: (suppliers: Supplier[]) => void) =>
  onSnapshot(
    query(collection(db, COL), orderBy("name", "asc")),
    (snap) => {
      const suppliers = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as Supplier[];
      cb(suppliers);
    },
    (error) => {
      console.error("Error fetching suppliers:", error);
    },
  );

export const addSupplier = async (data: Omit<Supplier, "id">) => {
  const docRef = await addDoc(collection(db, COL), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    isActive: true,
    tasksCount: 0,
  });
  return docRef;
};

export const updateSupplier = (id: string, data: Partial<Supplier>) =>
  updateDoc(doc(db, COL, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });

export const deleteSupplier = (id: string) => deleteDoc(doc(db, COL, id));

export const getSupplierById = async (id: string) => {
  const snap = await getDocs(query(collection(db, COL), where("id", "==", id)));
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() } as Supplier;
};

export const incrementSupplierTasks = async (
  supplierId: string,
  increment: number = 1,
) => {
  const supplierRef = doc(db, COL, supplierId);
  await updateDoc(supplierRef, {
    tasksCount: increment,
    updatedAt: serverTimestamp(),
  });
};
