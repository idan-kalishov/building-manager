export type LeadStatus =
  | "new"
  | "contacted"
  | "proposal"
  | "negotiation"
  | "closed"
  | "irrelevant";
export type LeadPriority = "high" | "medium" | "low";

export type TaskPriority = "high" | "medium" | "low";

export interface Task {
  id?: string;
  title: string;
  description?: string;
  buildingAddress?: string;
  dueDate?: string;
  priority?: TaskPriority;
  done?: boolean;
  createdAt?: any;
}

export interface Lead {
  id?: string;
  // פרטי ועד
  address?: string;
  tenantsCount?: number;
  name: string;
  phone: string;
  email?: string;
  // תחרות
  currentCompany?: string;
  currentCost?: number;
  // הצעה
  proposalDate?: string;
  proposalConfirmed?: boolean;
  followUpDate?: string;
  followUpNotes?: string;
  // עלויות מוצעות
  managementCost?: number;
  cleaningCost?: string;
  gardeningCost?: string;
  // מטא
  status: LeadStatus;
  priority?: LeadPriority;
  order?: number;
  notes?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface Building {
  id?: string;
  address: string;
  floors: number;
  units: number;
  entryCode?: string;
  contractStart?: string;
  notes?: string;
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
  municipality?: Record<string, any>;
  committee?: Record<string, any>;
}
