"use client"

import { useSalon } from "@/hooks/useSalon";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, Timestamp } from "firebase/firestore";
import { format } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Sparkles, ArrowRight } from "lucide-react";
import { CalendarView } from "@/components/calendar/calendar-view";

// YOUR EXISTING COMPONENTS
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { AppointmentsList } from "@/components/dashboard/appointments-list";
import { NewAppointmentModal } from "@/components/dashboard/new-appointment-modal";


export default function DashboardPage() {
  const { salon, loading, user } = useSalon();
  const router = useRouter();

  // Data State
  const [appointments, setAppointments] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [stats, setStats] = useState({
    revenue: 0,
    appointments: 0,
    clients: 0,  
    growth: 12, 
  });

  // 1. Protect Route
  useEffect(() => {
    if (!loading && !user) router.push("/");
    else if (!loading && user && !salon) router.push("/onboarding");
  }, [user, salon, loading, router]);

  // 2. Fetch Data (Works for BOTH Demo and Real)
  useEffect(() => {
    if (!salon) return;

    const fetchData = async () => {
      const apptsRef = collection(db, "salons", salon.id, "appointments");
      const staffRef = collection(db, "salons", salon.id, "staff");
      
      const [apptsSnap, staffSnap] = await Promise.all([
        getDocs(apptsRef),
        getDocs(staffRef)
      ]);

      const rawAppts: any[] = [];
      let totalRevenue = 0;
      
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const monthlyTotals: Record<string, number> = {};
      months.forEach(m => monthlyTotals[m] = 0);

      apptsSnap.docs.forEach(doc => {
        const d = doc.data();
        const date = d.date instanceof Timestamp ? d.date.toDate() : new Date(d.date);
        const price = Number(d.price) || 0;

        rawAppts.push({ id: doc.id, ...d, date, price });
        totalRevenue += price;

        const monthName = format(date, "MMM");
        if (monthlyTotals[monthName] !== undefined) {
          monthlyTotals[monthName] += price;
        }
      });

      const chartData = months.map(name => ({
        name,
        total: monthlyTotals[name]
      }));

      // Sort by newest
      rawAppts.sort((a, b) => b.date.getTime() - a.date.getTime());

      setAppointments(rawAppts);
      setRevenueData(chartData);
      setStats({
        revenue: totalRevenue,
        appointments: apptsSnap.size,
        clients: staffSnap.size, 
        growth: salon.type === 'demo' ? 12 : 0 // Fake growth for demo, 0 for new real salon
      });
    };

    fetchData();
  }, [salon]);

  if (!salon) return null;

  return (
    <div className="flex flex-col gap-6 p-6">
      
      {/* --- LOGIC: DEMO BANNER --- */}
      {/* Only shows if salon.type is 'demo' */}
      {salon.type === 'demo' && (
        <div className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 p-4 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Sparkles className="h-6 w-6 text-yellow-300" />
             </div>
             <div>
                <h3 className="font-bold text-lg">Demo Mode Active</h3>
                <p className="text-white/80 text-sm">You are viewing generated data. Feel free to explore!</p>
             </div>
          </div>
          <Link href="/onboarding">
             <Button variant="secondary" className="whitespace-nowrap font-semibold">
                Set up real salon <ArrowRight className="ml-2 h-4 w-4" />
             </Button>
          </Link>
        </div>
      )}

      {/* --- HEADER --- */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
             Welcome back! Here's a snapshot of <span className="font-semibold text-primary">{salon.name}</span> today.
          </p>
        </div>
        
        {/* Only show "New Appointment" button if NOT in demo mode (or keep both if you prefer) */}
        {salon.type === 'real' && (
    <div className="flex items-center gap-2">
        <NewAppointmentModal />
    </div>
)}
      </div>

      {/* --- 1. SUMMARY CARDS --- */}
      {/* 1. SUMMARY CARDS */}
      <SummaryCards />

<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
  <div className="col-span-4">
    <RevenueChart />
  </div>

  <div className="col-span-3">
    <AppointmentsList 
    appointments={appointments} 
    currency={salon?.currency || 'USD'} 
/>
  </div>
</div>

      </div>

  );
}