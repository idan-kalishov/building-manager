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
import type { Task } from "../types";

const COL = "tasks";

export const subscribeTasks = (cb: (tasks: Task[]) => void) =>
  onSnapshot(query(collection(db, COL), orderBy("dueDate", "asc")), (snap) =>
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Task)),
  );

export const addTask = (data: Omit<Task, "id">) =>
  addDoc(collection(db, COL), { ...data, createdAt: serverTimestamp() });

export const updateTask = (id: string, data: Partial<Task>) =>
  updateDoc(doc(db, COL, id), data);

export const deleteTask = (id: string) => deleteDoc(doc(db, COL, id));
