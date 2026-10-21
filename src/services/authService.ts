import {
  createUserWithEmailAndPassword,
  signInWithPhoneNumber,
  type ConfirmationResult,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import type { UserRole } from "../types";

interface RegisterData {
  name: string;
  email?: string;
  phone?: string;
  password?: string;
  role: UserRole;
  country: string;
  facilityId?: string;
}

// Register with email + password
export const registerWithEmail = async (data: RegisterData) => {
  if (!data.email || !data.password) {
    throw new Error("Email and password are required");
  }

  // 1. Create Firebase Auth user
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    data.email,
    data.password,
  );

  // 2. Create user profile in Firestore
  await setDoc(doc(db, "users", userCredential.user.uid), {
    uid: userCredential.user.uid,
    name: data.name,
    email: data.email,
    phone: data.phone || "",
    role: data.role,
    country: data.country,
    facilityId: data.facilityId || null,
    createdAt: serverTimestamp(),
    lastLogin: serverTimestamp(),
  });

  return userCredential.user;
};

// Send OTP to phone number
export const sendOtp = async (
  phoneNumber: string,
): Promise<ConfirmationResult> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const verifier = (window as any).recaptchaVerifier;
  return signInWithPhoneNumber(auth, phoneNumber, verifier);
};

// Complete phone registration (called after OTP verification)
export const completePhoneRegistration = async (
  uid: string,
  data: RegisterData,
) => {
  await setDoc(doc(db, "users", uid), {
    uid,
    name: data.name,
    phone: data.phone || "",
    role: data.role,
    country: data.country,
    facilityId: data.facilityId || null,
    createdAt: serverTimestamp(),
    lastLogin: serverTimestamp(),
  });
};
