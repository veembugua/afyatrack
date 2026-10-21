import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  type DocumentData,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import type { Child } from "../types";

export const addChild = async (
  childData: Omit<Child, "id" | "createdAt" | "updatedAt">,
): Promise<string> => {
  const docRef = await addDoc(collection(db, "children"), {
    ...childData,
    dateOfBirth: childData.dateOfBirth.toISOString(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

export const fetchChildrenByParent = async (
  parentId: string,
): Promise<Child[]> => {
  const q = query(
    collection(db, "children"),
    where("parentId", "==", parentId),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc: DocumentData) => ({
    id: doc.id,
    ...doc.data(),
    dateOfBirth:
      doc.data().dateOfBirth?.toDate?.() || new Date(doc.data().dateOfBirth),
  })) as Child[];
};
