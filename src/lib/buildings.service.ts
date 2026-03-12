import type { Building } from "../types";
import { db } from "./firebase";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

const COL = "buildings";

export const subscribeBuildings = (cb: (buildings: Building[]) => void) =>
  onSnapshot(collection(db, COL), (snap) =>
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Building)),
  );

export const addBuilding = (data: Omit<Building, "id">) =>
  addDoc(collection(db, COL), { ...data, createdAt: serverTimestamp() });

export const updateBuilding = (id: string, data: Partial<Building>) =>
  updateDoc(doc(db, COL, id), data);

export const deleteBuilding = (id: string) => deleteDoc(doc(db, COL, id));
