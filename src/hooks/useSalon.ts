import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { User } from "firebase/auth";
import { useRouter } from "next/navigation";

export interface SalonData {
  id: string;
  name: string;
  type: "real" | "demo"; // This flag controls your UI logic
  currency: string;
  ownerId: string;
  slug: string;
}

export function useSalon() {
  const [user, setUser] = useState<User | null>(null);
  const [salon, setSalon] = useState<SalonData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // 1. Listen for Auth Changes
    const unsubscribeAuth = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      
      if (!currentUser) {
        setLoading(false);
        return;
      }

      // 2. Listen for the Salon Document
      // Since salonId === userId, we look up doc(db, 'salons', uid)
      const salonRef = doc(db, "salons", currentUser.uid);

      const unsubscribeSnapshot = onSnapshot(salonRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setSalon({ id: docSnap.id, ...data } as SalonData);
        } else {
          // User exists, but Salon Doc is missing. 
          // This happens if they skipped onboarding.
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