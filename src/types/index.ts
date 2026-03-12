export type LeadStatus =
  | "new"
  | "contacted"
  | "proposal"
  | "negotiation"
  | "closed"
  | "irrelevant";

export interface Lead {
  id?: string;
  name: string;
  phone: string;
  email?: string;
  currentCompany?: string;
  currentCost?: number;
  proposalDate?: string;
  proposalVideoSent?: boolean;
  status: LeadStatus;
  managementCost?: number;
  cleaningCost?: number;
  gardeningCost?: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Building {
  id?: string;
  address: string;
  floors: number;
  units: number;
  entryCode?: string;
  contractStart?: string;
  general?: Record<string, any>;
  technical?: Record<string, any>;
  suppliers?: Record<string, any>;
  bank?: Record<string, any>;
  insurance?: Record<string, any>;
  keys?: Record<string, any>;
  notes?: string;
}
