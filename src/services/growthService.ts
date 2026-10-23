import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import type { GrowthRecord } from "../types";

export const addGrowthRecord = async (
  childId: string,
  measurementDate: string,
  weight: number,
  height: number,
  headCircumference: number | undefined,
  notes: string | undefined,
  healthWorkerId: string,
  facilityId: string,
) => {
  await addDoc(collection(db, "growthRecords"), {
    childId,
    measurementDate,
    weight,
    height,
    headCircumference: headCircumference || null,
    notes: notes || "",
    recordedBy: healthWorkerId,
    facilityId,
    createdAt: serverTimestamp(),
  });
};

export const fetchGrowthRecordsByChild = async (
  childId: string,
): Promise<GrowthRecord[]> => {
  // ✅ Removed orderBy to avoid requiring a composite index
  const q = query(
    collection(db, "growthRecords"),
    where("childId", "==", childId),
  );

  const snapshot = await getDocs(q);
  const records = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as GrowthRecord[];

  // ✅ Sort client-side by measurementDate (Ascending)
  return records.sort((a, b) => {
    const dateA = new Date(a.measurementDate).getTime();
    const dateB = new Date(b.measurementDate).getTime();
    return dateA - dateB;
  });
};
