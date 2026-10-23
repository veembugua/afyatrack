import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  type User as FirebaseUser,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import type { User } from "../types";

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("🔄 AuthContext: Listener attached (should only happen once)");
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      console.log("🔍 Firebase Auth State Changed. UID:", fbUser?.uid);
      setFirebaseUser(fbUser);

      if (fbUser) {
        const userDoc = await getDoc(doc(db, "users", fbUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data() as User;
          console.log("✅ Firestore User Loaded. Role:", userData.role);

          const safeUserData = {
            ...userData,
            uid: fbUser.uid,
            role: userData.role || "parent",
          };
          setUser(safeUserData);
        } else {
          console.warn("⚠️ No Firestore document for UID:", fbUser.uid);
          setUser(null);
        }
      } else {
        console.log("❌ User signed out");
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      console.log("🛑 AuthContext: Listener cleaned up");
      unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
