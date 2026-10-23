import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import type { Vaccination, VaccineSchedule } from "../types";

// Fetch all vaccines recorded for a specific child
export const fetchVaccinationsByChild = async (
  childId: string,
): Promise<Vaccination[]> => {
  // ✅ Removed orderBy to avoid requiring a composite index
  const q = query(
    collection(db, "vaccinations"),
    where("childId", "==", childId),
  );

  const snapshot = await getDocs(q);
  const vaccinations = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    scheduledDate:
      doc.data().scheduledDate?.toDate?.() ||
      new Date(doc.data().scheduledDate),
    administeredDate:
      doc.data().administeredDate?.toDate?.() ||
      (doc.data().administeredDate
        ? new Date(doc.data().administeredDate)
        : undefined),
  })) as Vaccination[];

  // ✅ Sort client-side by scheduledDate (Ascending)
  return vaccinations.sort((a, b) => {
    const dateA = new Date(a.scheduledDate).getTime();
    const dateB = new Date(b.scheduledDate).getTime();
    return dateA - dateB;
  });
};

// Fetch the standard schedule for a country to determine what's due
export const fetchVaccineScheduleByCountry = async (
  country: string,
): Promise<VaccineSchedule[]> => {
  // ✅ Removed orderBy to avoid requiring a composite index
  const q = query(
    collection(db, "vaccineSchedule"),
    where("country", "==", country),
    where("isActive", "==", true),
  );

  const snapshot = await getDocs(q);
  const schedule = snapshot.docs.map((doc) => doc.data() as VaccineSchedule);

  // ✅ Sort client-side by ageInWeeks (Ascending)
  return schedule.sort((a, b) => a.ageInWeeks - b.ageInWeeks);
};

// Record a new vaccination (called by Health Worker)
export const recordVaccination = async (
  childId: string,
  vaccineId: string,
  scheduledDate: Date,
  facilityId: string,
  healthWorkerId: string,
  batchNumber?: string,
  notes?: string,
) => {
  await addDoc(collection(db, "vaccinations"), {
    childId,
    vaccineId,
    scheduledDate: scheduledDate.toISOString(),
    administeredDate: new Date().toISOString(),
    status: "completed",
    administeredBy: healthWorkerId,
    facilityId,
    batchNumber: batchNumber || "",
    notes: notes || "",
    createdAt: serverTimestamp(),
  });
};

// Mark a vaccine as missed or skipped
export const updateVaccinationStatus = async (
  vaccinationId: string,
  status: "missed" | "skipped",
  notes?: string,
) => {
  const ref = doc(db, "vaccinations", vaccinationId);
  await updateDoc(ref, {
    status,
    notes: notes || "",
  });
};
