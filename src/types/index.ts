// User roles
export type UserRole = "parent" | "healthWorker" | "admin";

// User profile
export interface User {
  uid: string;
  role: UserRole;
  name: string;
  email?: string;
  phone?: string;
  facilityId?: string;
  country: string; // ISO code (e.g., "KE", "UG", "TZ")
  createdAt: Date;
  lastLogin: Date;
}

// Child profile
export interface Child {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: "male" | "female";
  parentId: string;
  facilityId: string;
  country: string;
  bloodGroup?: string;
  birthWeight?: number; // kg
  birthLength?: number; // cm
  createdAt: Date;
  updatedAt: Date;
}

// Vaccination record
export type VaccinationStatus = "pending" | "completed" | "missed" | "skipped";

export interface Vaccination {
  id: string;
  childId: string;
  vaccineId: string;
  scheduledDate: Date;
  administeredDate?: Date;
  status: VaccinationStatus;
  administeredBy?: string;
  facilityId: string;
  batchNumber?: string;
  notes?: string;
  createdAt: Date;
}

// Growth record
export interface GrowthRecord {
  id: string;
  childId: string;
  date: Date;
  weight: number; // kg
  height: number; // cm
  headCircumference?: number; // cm
  recordedBy: string;
  notes?: string;
}

// Appointment
export type AppointmentType = "vaccination" | "checkup" | "follow-up";
export type AppointmentStatus =
  | "scheduled"
  | "completed"
  | "cancelled"
  | "missed";

export interface Appointment {
  id: string;
  childId: string;
  facilityId: string;
  date: Date;
  type: AppointmentType;
  status: AppointmentStatus;
  reminderSent: boolean;
  notes?: string;
  createdAt: Date;
}

// Vaccine schedule (configurable per country)
export interface VaccineSchedule {
  id: string;
  country: string; // ISO code
  name: string;
  ageInWeeks: number;
  description: string;
  disease: string;
  doseNumber: number;
  isBooster: boolean;
  isActive: boolean;
}

// Health facility
export interface HealthFacility {
  id: string;
  name: string;
  type: "dispensary" | "healthCentre" | "hospital" | "clinic";
  address: string;
  country: string;
  region: string;
  phone: string;
  coordinates?: { lat: number; lng: number };
  createdAt: Date;
}
