"use client"

import { useSalon } from "@/hooks/useSalon";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, onSnapshot, orderBy, Timestamp } from "firebase/firestore";
import { format } from "date-fns";

// UI Components
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Calendar as CalendarIcon, List, Grid3X3 } from "lucide-react";
import { cn } from "@/lib/utils";

// Custom Components
import { CalendarView } from "@/components/calendar/calendar-view";
import { NewAppointmentModal } from "@/components/dashboard/new-appointment-modal";
// 1. IMPORT ACTIONS
import { AppointmentActions } from "@/components/dashboard/appointment-actions";

export default function CalendarPage() {
  const { salon } = useSalon();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 2. STATE FOR VIEW PREFERENCE (Default to "list")
  const [view, setView] = useState("list");

  // 3. PERSISTENCE LOGIC
  useEffect(() => {
    // Load saved preference on mount
    const savedView = localStorage.getItem("calendar-view-preference");
    if (savedView) {
      setView(savedView);
    }
  }, []);

  const handleViewChange = (newView: string) => {
    setView(newView);
    localStorage.setItem("calendar-view-preference", newView);
  };

  useEffect(() => {
    if (!salon) return;

    const q = query(
        collection(db, "salons", salon.id, "appointments"),
        orderBy("date", "asc") 
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => {
        const d = doc.data();
        return {
            id: doc.id,
            ...d,
            date: d.date instanceof Timestamp ? d.date.toDate() : new Date(d.date)
        };
      });
      setAppointments(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [salon]);

  return (
    <div className="flex flex-col gap-6 p-6">
        
      {/* Control Tabs with State */}
      <Tabs value={view} onValueChange={handleViewChange} className="w-full space-y-6">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
                <p className="text-muted-foreground">Manage your schedule and bookings.</p>
            </div>
            
            <div className="flex items-center gap-2">
                <TabsList>
                    <TabsTrigger value="list"><List className="w-4 h-4 mr-2"/>List</TabsTrigger>
                    <TabsTrigger value="grid"><Grid3X3 className="w-4 h-4 mr-2"/>Grid</TabsTrigger>
                </TabsList>
                <NewAppointmentModal />
            </div>
        </div>

        {/* --- VIEW 1: VISUAL GRID --- */}
        <TabsContent value="grid" className="mt-0">
             <CalendarView appointments={appointments} />
        </TabsContent>

        {/* --- VIEW 2: LIST VIEW --- */}
        <TabsContent value="list" className="mt-0">
            <div className="grid gap-4">
                {appointments.length === 0 && !loading ? (
                    <Card className="p-12 text-center text-muted-foreground">
                        <CalendarIcon className="mx-auto h-10 w-10 mb-4 opacity-20" />
                        <p>No upcoming appointments.</p>
                        <p className="text-sm">Click "New Appointment" to book your first client.</p>
                    </Card>
                ) : (
                    appointments.map((apt) => (
                        <Card key={apt.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                            <div className="flex gap-4 items-center">
                                <div className="bg-primary/10 p-3 rounded-lg text-primary font-bold text-center min-w-[60px]">
                                    <div className="text-xs uppercase">{format(apt.date, "MMM")}</div>
                                    <div className="text-xl">{format(apt.date, "dd")}</div>
                                </div>
                                <div>
                                    <div className="font-semibold text-lg">{apt.clientName}</div>
                                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                                        <Clock className="w-3 h-3" /> 
                                        {format(apt.date, "h:mm a")} • {apt.serviceName} with {apt.staffName}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                                <div className="text-right hidden sm:block">
                                    <div className="font-bold">
                                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: salon?.currency || 'USD' }).format(apt.price)}
                                    </div>
                                    <div className={cn(
                                        "text-xs uppercase tracking-wide px-2 py-0.5 rounded-full inline-block mt-1",
                                        apt.status === 'cancelled' ? "bg-red-100 text-red-700" :
                                        apt.status === 'completed' ? "bg-green-100 text-green-700" :
                                        "bg-secondary text-secondary-foreground"
                                    )}>
                                        {apt.status || 'Confirmed'}
                                    </div>
                                </div>
                                
                                {/* 4. ADDED ACTIONS HERE */}
                                <AppointmentActions 
                                    appointment={apt}  
                                />
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}