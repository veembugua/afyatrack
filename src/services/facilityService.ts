import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import type { HealthFacility } from "../types";

export const fetchFacilities = async (): Promise<HealthFacility[]> => {
  console.log(
    "[AfyaTrack] Querying project:",
    import.meta.env.VITE_FIREBASE_PROJECT_ID,
  );

  try {
    const snapshot = await getDocs(collection(db, "healthFacilities"));

    console.log("[AfyaTrack] Documents found:", snapshot.size);

    snapshot.docs.forEach((doc) => {
      console.log("[AfyaTrack] Document:", doc.id, doc.data());
    });

    const facilities = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as HealthFacility[];

    return facilities.sort((a, b) => a.name.localeCompare(b.name));
  } catch (err) {
    console.error("[AfyaTrack] fetchFacilities FAILED:", err);
    throw err;
  }
};
