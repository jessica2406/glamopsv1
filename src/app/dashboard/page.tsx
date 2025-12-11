"use client"

import { useSalon } from "@/hooks/useSalon";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, Timestamp } from "firebase/firestore";
import { format } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Store, Loader2 } from "lucide-react";

import { SummaryCards } from "@/components/dashboard/summary-cards";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { AppointmentsList } from "@/components/dashboard/appointments-list";
import { NewAppointmentModal } from "@/components/dashboard/new-appointment-modal";

export default function DashboardPage() {
  const { salon, loading, user } = useSalon();
  const router = useRouter();

  const [appointments, setAppointments] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [revenueData, setRevenueData] = useState<any[]>([]);

  // 1. Protect Route
  useEffect(() => {
    if (!loading && !user) router.push("/login");
    else if (!loading && user && !salon) router.push("/onboarding");
  }, [user, salon, loading, router]);

  // 2. Fetch Data
  useEffect(() => {
    if (!salon) return;

    // DEBUG LOG: Open your browser console (F12) to see this
    console.log("🔍 DASHBOARD LOADED. Salon Data:", salon);
    console.log("❓ Is Demo?", salon.type === 'demo' || salon.id === 'demo-salon');

    const fetchData = async () => {
      try {
        // If Demo, we don't query Firebase (Mock data logic usually handled inside hooks or mocked here)
        // For now, let's just use the logic we had. 
        // Note: In a real app, you might want to return mock appointments from useSalon directly for demo.
        // But for now, we will wrap the firebase call.

        if (salon.type === 'demo') {
            // Use Mock Data for Charts if in demo mode
            // We can import mockAppointments from lib/mock-data if needed
            // For now, let's just leave the lists empty or use what's passed
            return; 
        }

        const apptsRef = collection(db, "salons", salon.id, "appointments");
        const apptsSnap = await getDocs(apptsRef);

        const rawAppts: any[] = [];
        let totalRevenue = 0;
        
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthlyTotals: Record<string, number> = {};
        months.forEach(m => monthlyTotals[m] = 0);

        apptsSnap.docs.forEach(doc => {
          const d = doc.data();
          
          let dateObj = new Date();
          if (d.date instanceof Timestamp) {
            dateObj = d.date.toDate();
          } else if (typeof d.date === 'string') {
            dateObj = new Date(d.date);
          } else if (d.date instanceof Date) {
            dateObj = d.date;
          }

          const price = Number(d.price) || 0;

          rawAppts.push({ id: doc.id, ...d, date: dateObj, price });
          totalRevenue += price;

          const monthName = format(dateObj, "MMM");
          if (monthlyTotals[monthName] !== undefined) {
            monthlyTotals[monthName] += price;
          }
        });

        const chartData = months.map(name => ({
          name,
          total: monthlyTotals[name]
        }));

        rawAppts.sort((a, b) => b.date.getTime() - a.date.getTime());

        setAppointments(rawAppts);
        setRevenueData(chartData);

      } catch (e) {
        console.error("Dashboard Fetch Error:", e);
      }
    };

    fetchData();
  }, [salon]);

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;
  if (!salon) return null;

  // 3. DETECT DEMO MODE (Robust Check)
  const isDemoMode = salon.type === 'demo' || salon.id === 'demo-salon';

  return (
    <div className="flex flex-col gap-6 p-6">
      
      {/* --- DEMO BAR (Purple) --- */}
      {isDemoMode && (
        <div className="bg-primary w-full rounded-xl px-6 py-4 text-white shadow-xl animate-in slide-in-from-top-4 duration-500">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
               <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                  <Sparkles className="h-5 w-5 text-yellow-300" />
               </div>
               <div>
                  <h3 className="text-lg font-bold leading-tight">Demo Mode Active</h3>
                  <p className="text-sm text-indigo-100">
                    You are viewing sample data. Ready to build your own?
                  </p>
               </div>
            </div>
            
            <Link href="/onboarding">
               {/* Note: We use an onClick here to clear the cookie so they can actually onboard! */}
               <Button 
                 size="lg" 
                 variant="secondary" 
                 className="w-full font-bold shadow-sm sm:w-auto hover:bg-white hover:text-indigo-600 border-0"
                 onClick={() => {
                   document.cookie = "glamops_demo_mode=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
                 }}
               >
                  <Store className="mr-2 h-4 w-4" />
                  Set up real salon
                  <ArrowRight className="ml-2 h-4 w-4" />
               </Button>
            </Link>
          </div>
        </div>
      )}

      {/* --- HEADER --- */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
             Here's what's happening at <span className="font-semibold text-primary">{salon.name}</span>.
          </p>
        </div>
        
        {/* Only show "New Appointment" for Real Salons */}
        {!isDemoMode && (
            <div className="flex items-center gap-2">
                <NewAppointmentModal />
            </div>
        )}
      </div>

      {/* --- WIDGETS --- */}
      {/* Pass isDemo to SummaryCards if you want it to show fake data, or relying on mock hook */}
      <SummaryCards />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="lg:col-span-4 rounded-xl border bg-card p-1 shadow-sm">
          <RevenueChart />
        </div>

        <div className="lg:col-span-3 rounded-xl border bg-card shadow-sm overflow-hidden">
          <AppointmentsList 
            appointments={appointments} 
            currency={salon?.currency || 'USD'} 
          />
        </div>
      </div>

    </div>
  );
}