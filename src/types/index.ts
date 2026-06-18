// types.ts
export type LeadStatus =
  | "new"
  | "contacted"
  | "proposal"
  | "negotiation"
  | "closed"
  | "irrelevant";
export type LeadPriority = "high" | "medium" | "low";

export type TaskPriority = "high" | "medium" | "low";
export type Technician = "גדי" | "עידן" | "אחר";

export interface TaskUpdate {
  id: string;
  technician: Technician;
  message: string;
  timestamp: string;
  oldDueDate?: string;
  newDueDate?: string;
}

export interface ContactPerson {
  id: string;
  name: string;
  phone: string;
  role?: string;
  notes?: string;
}

export interface Task {
  id?: string;
  title: string;
  description?: string;
  buildingAddress?: string;
  dueDate?: string;
  priority?: TaskPriority;
  done?: boolean;
  createdAt?: any;
  updates?: TaskUpdate[];
  contactPersons?: ContactPerson[];
  notes?: string;
  supplierId?: string; // קישור לספק
  supplierName?: string; // שם הספק (להצגה מהירה)
}

export interface LeadNote {
  id: string;
  timestamp: string;
  author: string;
  message: string;
}

export interface Lead {
  id?: string;
  address?: string;
  tenantsCount?: number;
  name: string;
  phone: string;
  email?: string;
  currentCompany?: string;
  currentCost?: number;
  proposalDate?: string;
  proposalConfirmed?: boolean;
  followUpDate?: string;
  followUpNotes?: string;
  managementCost?: number;
  cleaningCost?: string;
  gardeningCost?: string;
  status: LeadStatus;
  priority?: LeadPriority;
  order?: number;
  notes?: string;
  notesList?: LeadNote[];
  createdAt?: any;
  updatedAt?: any;
  customFields?: { id: string; label: string; value: string }[];
}

export interface GlobalCustomField {
  id: string;
  label: string;
}

export interface GlobalCustomSection {
  id: string;
  title: string;
  fields: GlobalCustomField[];
}

export interface Building {
  id?: string;
  address: string;
  floors: number;
  units: number;
  entryCode?: string;
  contractStart?: string;
  notes?: string;
  specialNotes?: string;
  general?: Record<string, any>;
  technical?: Record<string, any>;
  intercom?: Record<string, any>;
  suppliers?: Record<string, any>;
  gardening?: Record<string, any>;
  bank?: Record<string, any>;
  insurance?: Record<string, any>;
  gas?: Record<string, any>;
  roof?: Record<string, any>;
  parking?: Record<string, any>;
  electricity?: Record<string, any>;
  elevator?: Record<string, any>;
  firefighting?: Record<string, any>;
  keys?: Record<string, any>;
  water?: Record<string, any>;
  cleaning?: Record<string, any>;
  lights?: Record<string, any>;
  security?: Record<string, any>;
  airConditioning?: Record<string, any>;
  shelter?: Record<string, any>;
  gates?: Record<string, any>;
  municipality?: Record<string, any>;
  committee?: Record<string, any>;
  culturalAssociation?: Record<string, any>;
  customSections?: {
    id: string;
    title: string;
    fields: { id: string; label: string; value: string }[];
  }[];
  customSectionValues?: Record<string, Record<string, string>>;
}

// types.ts - הוסף את זה בסוף הקובץ

export type SupplierCategory =
  | "elevator" // מעליות
  | "electricity" // חשמל
  | "plumbing" // אינסטלציה
  | "cleaning" // ניקיון
  | "gardening" // גינון
  | "security" // אבטחה
  | "construction" // בניה
  | "air_conditioning" // מיזוג
  | "it" // IT
  | "other"; // אחר

export interface Supplier {
  id?: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  category: SupplierCategory;
  contactPerson?: string;
  notes?: string;
  website?: string;
  createdAt?: any;
  updatedAt?: any;
  isActive?: boolean;
  rating?: 1 | 2 | 3 | 4 | 5;
  tasksCount?: number; // מספר משימות מקושרות
}

// עדכן את Task
