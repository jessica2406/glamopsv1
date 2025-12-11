import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { User } from "firebase/auth";

export interface SalonData {
  id: string;
  name: string;
  type: "real" | "demo"; 
  currency: string;
  ownerId: string;
  slug: string;
}

export function useSalon() {
  const [user, setUser] = useState<User | null>(null);
  const [salon, setSalon] = useState<SalonData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. ROBUST COOKIE CHECK
    // Check if the specific string exists in the cookie jar
    const cookieString = typeof document !== 'undefined' ? document.cookie : "";
    const isDemo = cookieString.indexOf("glamops_demo_mode=true") !== -1;

    console.log("🍪 useSalon Check:", { cookieString, isDemo });

    if (isDemo) {
      console.log("✨ DEMO MODE DETECTED - Skipping Firebase");
      setUser({ uid: "demo-user", email: "demo@glamops.com" } as User);
      setSalon({
        id: "demo-salon",
        name: "GlamOps Demo Salon",
        type: "demo", 
        currency: "USD",
        ownerId: "demo-user",
        slug: "demo-salon"
      });
      setLoading(false);
      return; 
    }

    // 2. REAL FIREBASE LOGIC
    const unsubscribeAuth = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      
      if (!currentUser) {
        setSalon(null);
        setLoading(false);
        return;
      }

      const salonRef = doc(db, "salons", currentUser.uid);

      const unsubscribeSnapshot = onSnapshot(salonRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          // Force type 'real' for DB data so dashboard knows the difference
          setSalon({ id: docSnap.id, ...data, type: "real" } as SalonData);
        } else {
          setSalon(null);
        }
        setLoading(false);
      }, (error) => {
        console.error("Error fetching salon:", error);
        setLoading(false);
      });

      return () => unsubscribeSnapshot();
    });

    return () => unsubscribeAuth();
  }, []);

  return { user, salon, loading };
}