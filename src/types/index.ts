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
  timestamp: string; // ISO date string
  oldDueDate?: string; // optional - if due date was changed
  newDueDate?: string;
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
  updates?: TaskUpdate[]; // stackable updates log
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
  createdAt?: any;
  updatedAt?: any;
  customFields?: { id: string; label: string; value: string }[];
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
}
