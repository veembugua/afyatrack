import {
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import type {
  User,
  Child,
  Vaccination,
  HealthFacility,
  VaccineSchedule,
} from "../types";

export const fetchUsersByRole = async (role: string): Promise<User[]> => {
  const q = query(collection(db, "users"), where("role", "==", role));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      uid: doc.id,
      name: data.name || "",
      email: data.email || "",
      role: data.role,
      country: data.country || "",
      facilityId: data.facilityId,
      phone: data.phone,
    } as User;
  });
};

export const fetchAllChildren = async (): Promise<Child[]> => {
  const snapshot = await getDocs(collection(db, "children"));
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      firstName: data.firstName || "",
      lastName: data.lastName || "",
      dateOfBirth: data.dateOfBirth?.toDate?.() || new Date(data.dateOfBirth),
      gender: data.gender || "male",
      parentId: data.parentId || "",
      facilityId: data.facilityId || "",
      country: data.country || "",
      birthWeight: data.birthWeight,
      birthLength: data.birthLength,
    } as Child;
  });
};

export const fetchAllVaccinations = async (): Promise<Vaccination[]> => {
  const snapshot = await getDocs(collection(db, "vaccinations"));
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      childId: data.childId || "",
      vaccineId: data.vaccineId || "",
      scheduledDate:
        data.scheduledDate?.toDate?.() || new Date(data.scheduledDate),
      administeredDate: data.administeredDate
        ? data.administeredDate.toDate
          ? data.administeredDate.toDate()
          : new Date(data.administeredDate)
        : undefined,
      status: data.status || "pending",
      administeredBy: data.administeredBy || "",
      facilityId: data.facilityId || "",
      batchNumber: data.batchNumber,
      notes: data.notes,
    } as Vaccination;
  });
};

export const fetchAllFacilities = async (): Promise<HealthFacility[]> => {
  const snapshot = await getDocs(collection(db, "healthFacilities"));
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    const facilityType = data.type as
      | "clinic"
      | "hospital"
      | "healthCentre"
      | "dispensary"
      | undefined;
    return {
      id: doc.id,
      name: data.name || "",
      region: data.region || "",
      country: data.country || "",
      type: facilityType || "clinic",
      address: data.address || "",
      phone: data.phone || "",
      isActive: data.isActive ?? true,
      createdAt: data.createdAt?.toDate?.() || new Date(),
    } as HealthFacility;
  });
};

// ✅ NEW: Fetch all vaccine schedules for analytics
export const fetchAllVaccineSchedules = async (): Promise<
  VaccineSchedule[]
> => {
  const snapshot = await getDocs(collection(db, "vaccineSchedule"));
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name || "",
      ageInWeeks: data.ageInWeeks || 0,
      disease: data.disease || "",
      country: data.country || "",
      isActive: data.isActive ?? true,
    } as VaccineSchedule;
  });
};

export const addFacility = async (
  name: string,
  region: string,
  country: string,
  type: "clinic" | "hospital" | "healthCentre" | "dispensary" = "clinic",
  address: string = "",
  phone: string = "",
): Promise<string> => {
  const docRef = await addDoc(collection(db, "healthFacilities"), {
    name,
    region,
    country,
    type,
    address,
    phone,
    isActive: true,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

export const updateFacility = async (
  facilityId: string,
  updates: Partial<HealthFacility>,
): Promise<void> => {
  await updateDoc(doc(db, "healthFacilities", facilityId), updates);
};

export const updateUserFacility = async (
  userId: string,
  facilityId: string | null,
): Promise<void> => {
  await updateDoc(doc(db, "users", userId), {
    facilityId: facilityId || null,
  });
};
