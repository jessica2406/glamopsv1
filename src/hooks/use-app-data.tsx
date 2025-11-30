"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, query, onSnapshot, addDoc, deleteDoc, updateDoc, doc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

// --- HOOK: Services (Targeting Sub-collection) ---
export function useServices() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) { setLoading(false); return; }
      
      // FIX: Pointing to "salons/{userId}/services" to match your screenshot
      const servicesRef = collection(db, "salons", user.uid, "services");
      
      const unsubscribe = onSnapshot(servicesRef, (snapshot) => {
        setServices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      });
      return () => unsubscribe();
    });
    return () => unsubscribeAuth();
  }, []);

  const addService = async (data: any) => {
    if (!auth.currentUser) return;
    const { id, ...serviceData } = data;
    // FIX: Add to the user's specific sub-collection
    await addDoc(collection(db, "salons", auth.currentUser.uid, "services"), serviceData);
  };

  const updateService = async (id: string, data: any) => {
    if (!auth.currentUser) return;
    const { id: _, ...updateData } = data;
    // FIX: Update in sub-collection
    await updateDoc(doc(db, "salons", auth.currentUser.uid, "services", id), updateData);
  };

  const deleteService = async (id: string) => {
    if (!auth.currentUser) return;
    // FIX: Delete from sub-collection
    await deleteDoc(doc(db, "salons", auth.currentUser.uid, "services", id));
  };

  return { services, loading, addService, updateService, deleteService };
}

// --- HOOK: Staff (Targeting Sub-collection) ---
export function useStaff() {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) { setLoading(false); return; }

      // FIX: Pointing to "salons/{userId}/staff"
      const staffRef = collection(db, "salons", user.uid, "staff");

      const unsubscribe = onSnapshot(staffRef, (snapshot) => {
        setStaff(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      });
      return () => unsubscribe();
    });
    return () => unsubscribeAuth();
  }, []);

  const addStaff = async (data: any) => {
    if (!auth.currentUser) return;
    const { id, ...staffData } = data;
    await addDoc(collection(db, "salons", auth.currentUser.uid, "staff"), { ...staffData, active: true });
  };

  const updateStaff = async (id: string, data: any) => {
    if (!auth.currentUser) return;
    const { id: _, ...updateData } = data;
    await updateDoc(doc(db, "salons", auth.currentUser.uid, "staff", id), updateData);
  };

  const deleteStaff = async (id: string) => {
    if (!auth.currentUser) return;
    await deleteDoc(doc(db, "salons", auth.currentUser.uid, "staff", id));
  };

  return { staff, loading, addStaff, updateStaff, deleteStaff };
}

// --- HOOK: Customers (Targeting Sub-collection) ---
export function useCustomers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) { setLoading(false); return; }

      // FIX: Pointing to "salons/{userId}/appointments"
      const apptRef = collection(db, "salons", user.uid, "appointments");
      
      const unsubscribe = onSnapshot(apptRef, (snapshot) => {
        const appts = snapshot.docs.map(d => d.data());
        const uniqueMap = new Map();
        
        appts.forEach((a: any) => {
          if (!uniqueMap.has(a.clientName)) {
            uniqueMap.set(a.clientName, {
              id: a.clientName,
              name: a.clientName,
              email: "guest@demo.com",
              phone: "N/A",
              totalAppointments: 0,
              lastVisit: new Date(0)
            });
          }
          const customer = uniqueMap.get(a.clientName);
          customer.totalAppointments += 1;
          const apptDate = a.date?.toDate ? a.date.toDate() : new Date(a.date);
          if (apptDate > customer.lastVisit) customer.lastVisit = apptDate;
        });

        setCustomers(Array.from(uniqueMap.values()));
        setLoading(false);
      });
      return () => unsubscribe();
    });
    return () => unsubscribeAuth();
  }, []);

  return { customers, loading };
}