"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, query, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { isSameDay } from "date-fns";

// 1. Define the Shape of your Data to fix TypeScript errors
export interface Appointment {
  id: string;
  clientName: string;
  serviceName: string;
  staffName: string;
  date: Date;
  duration: number;
  price: number;
  status: string;
  notes?: string;
  // Add any other fields you expect from Firestore
}

export function useSalonData() {
  const [loading, setLoading] = useState(true);
  // 2. Tell React that this state holds an array of 'Appointment' objects
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState({
    revenue: 0,
    appointmentsToday: 0,
    customersTotal: 0,
    occupancy: 0,
  });

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setLoading(false);
        return;
      }

      const apptRef = collection(db, "salons", user.uid, "appointments");

      const unsubscribeSnapshot = onSnapshot(apptRef, (snapshot) => {
        // 3. Cast the data so TypeScript knows what it is
        const appts = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            clientName: data.clientName || "Unknown Client",
            serviceName: data.serviceName || "Unknown Service",
            staffName: data.staffName || "Staff",
            // Safely convert date
            date: data.date?.toDate ? data.date.toDate() : new Date(data.date),
            duration: Number(data.duration) || 60,
            price: Number(data.price) || 0,
            status: data.status || "confirmed",
            notes: data.notes || ""
          } as Appointment;
        });

        const today = new Date();
        const todayAppts = appts.filter(a => isSameDay(a.date, today));
        
        // Now TypeScript knows 'status', 'price', 'clientName', and 'duration' exist
        const revenueTotal = appts
          .filter(a => a.status !== 'cancelled')
          .reduce((sum, a) => sum + a.price, 0);

        const uniqueCustomers = new Set(appts.map(a => a.clientName)).size;

        const dailyCapacityMinutes = 8 * 60 * 4; 
        const todayMinutesBooked = todayAppts.reduce((sum, a) => sum + a.duration, 0);
        const occupancyRate = Math.round((todayMinutesBooked / dailyCapacityMinutes) * 100) || 0;

        setAppointments(appts);
        setStats({
          revenue: revenueTotal,
          appointmentsToday: todayAppts.length,
          customersTotal: uniqueCustomers,
          occupancy: occupancyRate > 100 ? 100 : occupancyRate
        });
        setLoading(false);
      });

      return () => unsubscribeSnapshot();
    });

    return () => unsubscribeAuth();
  }, []);

  return { appointments, stats, loading };
}