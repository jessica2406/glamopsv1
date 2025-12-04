// src/types/index.ts

import { Timestamp } from "firebase/firestore";

export interface Appointment {
  id: string;
  salonId: string;
  customerId?: string; 
  clientName: string;
  clientEmail?: string;
  serviceId: string;
  serviceName: string;
  staffId: string;
  staffName: string;
  date: Date;
  duration: number;
  price: number;
  status: "confirmed" | "completed" | "cancelled" | "noshow";
  notes?: string;
  createdAt?: Date | Timestamp;
}

export interface Customer {
  id: string;
  salonId: string;
  name: string;
  email?: string;
  phone?: string;
  totalVisits: number;
  lastVisit?: Date;
  createdAt: Date | Timestamp;
}

export interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
  description?: string;
}

// THIS IS THE IMPORTANT ONE
export interface Staff {
  id: string;
  name: string;
  role: string;
  avatarUrl?: string; // <--- This must be here
  active?: boolean;
  workingHours?: { start: string; end: string };
  salonId?: string;
  createdAt?: Date | Timestamp;
}