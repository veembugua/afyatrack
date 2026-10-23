import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  onSnapshot,
  serverTimestamp,
  type DocumentData,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import type { Child } from "../types";

export const addChild = async (
  childData: Omit<Child, "id" | "createdAt" | "updatedAt">,
): Promise<string> => {
  // ✅ Build the document data, only including optional fields if they have values
  const documentData: Record<string, unknown> = {
    firstName: childData.firstName,
    lastName: childData.lastName,
    dateOfBirth: childData.dateOfBirth.toISOString(),
    gender: childData.gender,
    parentId: childData.parentId,
    facilityId: childData.facilityId,
    country: childData.country,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  // ✅ Only add birthWeight if it has a valid value
  if (childData.birthWeight !== undefined && childData.birthWeight !== null) {
    documentData.birthWeight = childData.birthWeight;
  }

  // ✅ Only add birthLength if it has a valid value
  if (childData.birthLength !== undefined && childData.birthLength !== null) {
    documentData.birthLength = childData.birthLength;
  }

  const docRef = await addDoc(collection(db, "children"), documentData);
  return docRef.id;
};

export const subscribeChildrenByParent = (
  parentId: string,
  onChildren: (children: Child[]) => void,
  onError: (error: Error) => void,
): (() => void) => {
  const q = query(
    collection(db, "children"),
    where("parentId", "==", parentId),
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const children = snapshot.docs.map((doc: DocumentData) => ({
        id: doc.id,
        ...doc.data(),
        dateOfBirth:
          doc.data().dateOfBirth?.toDate?.() ||
          new Date(doc.data().dateOfBirth),
      })) as Child[];
      onChildren(children);
    },
    onError,
  );
};

// Fetch children assigned to a specific health facility
export const fetchChildrenByFacility = async (
  facilityId: string,
): Promise<Child[]> => {
  const q = query(
    collection(db, "children"),
    where("facilityId", "==", facilityId),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    dateOfBirth:
      doc.data().dateOfBirth?.toDate?.() || new Date(doc.data().dateOfBirth),
  })) as Child[];
};
