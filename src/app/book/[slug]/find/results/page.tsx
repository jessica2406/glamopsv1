"use client"

import { useEffect, useState, use } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Calendar, Clock, AlertCircle, LogOut, Edit, User, ShieldCheck } from "lucide-react"
import { format, isBefore, startOfDay } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Calendar as CalendarPicker } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"

const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return "bg-green-100 text-green-800 hover:bg-green-100";
      case 'cancelled': return "bg-red-100 text-red-800 hover:bg-red-100";
      default: return "bg-slate-100 text-slate-800 hover:bg-slate-100";
    }
}

export default function AppointmentResultsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const router = useRouter()
  
  const [loading, setLoading] = useState(true)
  const [appointments, setAppointments] = useState<any[]>([])
  
  // User Profile State
  const [userEmail, setUserEmail] = useState<string>("")
  const [userName, setUserName] = useState<string>("")
  
  // Interaction State
  const [selectedAppt, setSelectedAppt] = useState<any>(null) 
  const [newDate, setNewDate] = useState<Date | undefined>(undefined)
  const [newTime, setNewTime] = useState<string>("")
  const [updateLoading, setUpdateLoading] = useState(false)
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false)

  // 1. Fetch Data via SECURE API
  const refreshData = async () => {
      try {
        // Optimistic UI: Get email from local storage immediately for display
        const storedEmail = localStorage.getItem('userEmail');
        if (storedEmail) setUserEmail(storedEmail);

        const res = await fetch(`/api/my-appointments?slug=${slug}`);
        
        if (res.status === 401) {
            router.push(`/book/${slug}/find`);
            return;
        }
        if (!res.ok) throw new Error("Failed to fetch");

        const data = await res.json();
        const appts = data.appointments || [];

        // Formatting Dates
        const formattedAppts = appts.map((a: any) => ({
            ...a,
            date: new Date(a.date)
        }));

        setAppointments(formattedAppts);

        // Extract Name from the first appointment if available
        if (appts.length > 0) {
            // Check common field names
            const name = appts[0].clientName || appts[0].name || appts[0].customerName || "Guest";
            setUserName(name);
        }

      } catch (error) {
        console.error("Error fetching appointments:", error)
      } finally {
        setLoading(false)
      }
  }

  useEffect(() => {
    refreshData()
  }, [slug, router])


  // 2. Handle Cancel (via Secure API)
  const handleCancel = async (apptId: string) => {
    try {
       const res = await fetch('/api/appointment-action', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ slug, appointmentId: apptId, action: 'cancel' })
       });

       if (!res.ok) throw new Error("Failed to cancel");

       setAppointments(prev => prev.map(a => 
         a.id === apptId ? { ...a, status: "cancelled" } : a
       ))
    } catch (e) {
      alert("Failed to cancel appointment. Please try again.")
    }
  }

  // 3. Reschedule Logic
  const openReschedule = (appt: any) => {
    setSelectedAppt(appt)
    setNewDate(undefined)
    setNewTime("")
    setRescheduleDialogOpen(true)
  }

  const handleRescheduleSubmit = async () => {
    if (!newDate || !newTime || !selectedAppt) return
    setUpdateLoading(true)
    try {
        const [hours, minutes] = newTime.split(":").map(Number)
        const updatedDate = new Date(newDate)
        updatedDate.setHours(hours, minutes, 0, 0)

        const res = await fetch('/api/appointment-action', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                slug, 
                appointmentId: selectedAppt.id, 
                action: 'reschedule',
                newDate: updatedDate.toISOString() 
            })
        });

        if (!res.ok) throw new Error("Failed to reschedule");

        setAppointments(prev => prev.map(a => 
            a.id === selectedAppt.id ? { ...a, date: updatedDate, status: "confirmed" } : a
        ))

        setRescheduleDialogOpen(false)
        setSelectedAppt(null)
        alert("Rescheduled successfully!")

    } catch (error) {
        console.error("Reschedule failed", error)
        alert("Failed to reschedule.")
    } finally {
        setUpdateLoading(false)
    }
  }

  const handleLogout = async () => {
      try {
          // 1. Clear Server Cookie
          await fetch('/api/logout', { method: 'POST' });
          
          // 2. Clear Local Storage
          localStorage.removeItem('userEmail');
          
          // 3. Redirect to Find Page (Middleware will now allow this because cookie is gone)
          window.location.href = `/book/${slug}/find`;
      } catch (e) {
          console.error("Logout failed", e);
      }
  }

  const timeSlots = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "13:00", "13:30", "14:00", "14:30", "15:00", "16:00", "17:00"]

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary h-8 w-8" /></div>

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b pb-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                    Hi, {userName || "there"}! <span className="text-2xl">👋</span>
                </h1>
                <div className="flex items-center gap-2 mt-2 text-slate-600 bg-white px-3 py-1 rounded-full border w-fit shadow-sm">
                    <User className="h-4 w-4" />
                    <span className="text-sm font-medium">{userEmail}</span>
                    <ShieldCheck className="h-4 w-4 text-green-500 ml-1" />
                    <span className="text-xs text-green-600 font-bold">Verified</span>
                </div>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
                <Button variant="outline" onClick={handleLogout} className="flex-1 md:flex-none text-slate-600">
                    <LogOut className="mr-2 h-4 w-4" /> Exit
                </Button>
                <Button onClick={() => router.push(`/book/${slug}`)} className="flex-1 md:flex-none shadow-md shadow-primary/20">
                    Book New Service
                </Button>
            </div>
        </div>

        {/* APPOINTMENTS LIST */}
        {appointments.length === 0 ? (
            <Card className="p-12 text-center text-slate-500 flex flex-col items-center border-dashed">
                <AlertCircle className="h-12 w-12 mb-4 opacity-50" />
                <h3 className="text-lg font-semibold text-slate-900">No appointments yet</h3>
                <p className="mb-6">It looks like you haven't booked anything with us yet.</p>
                <Button onClick={() => router.push(`/book/${slug}`)}>
                    Book your first appointment
                </Button>
            </Card>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {appointments.map((appt) => (
                    <Card key={appt.id} className="border-t-4 border-t-primary shadow-md hover:shadow-lg transition-shadow bg-white">
                        <CardHeader className="pb-2 flex flex-row justify-between items-start space-y-0">
                            <div>
                                <CardTitle className="text-lg font-bold text-slate-800">{appt.serviceName || "Service"}</CardTitle>
                                <CardDescription className="font-mono text-xs mt-1 text-slate-400">Ref: {appt.id.slice(0, 8)}</CardDescription>
                            </div>
                            <Badge className={getStatusColor(appt.status)} variant="secondary">
                                {appt.status === 'cancelled' ? 'Cancelled' : 'Confirmed'}
                            </Badge>
                        </CardHeader>
                        
                        <CardContent className="space-y-4 pt-4">
                            <div className="flex items-center gap-3 p-2 rounded-md bg-slate-50">
                                <Calendar className="h-4 w-4 text-primary" />
                                <span className="font-medium text-sm text-slate-700">{format(appt.date, "EEEE, MMMM do, yyyy")}</span>
                            </div>
                            <div className="flex items-center gap-3 p-2 rounded-md bg-slate-50">
                                <Clock className="h-4 w-4 text-primary" />
                                <span className="font-medium text-sm text-slate-700">{format(appt.date, "h:mm a")}</span>
                            </div>
                        </CardContent>

                        <CardFooter className="bg-slate-50/50 p-4 flex gap-2 justify-end border-t">
                            {appt.status !== 'cancelled' && (
                                <>
                                    <Button variant="outline" size="sm" onClick={() => openReschedule(appt)} className="bg-white hover:bg-slate-100">
                                        <Edit className="h-3 w-3 mr-2" /> Reschedule
                                    </Button>

                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                                Cancel
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Cancel Appointment?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Are you sure you want to cancel your <strong>{appt.serviceName}</strong>?
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Keep it</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleCancel(appt.id)} className="bg-red-600 hover:bg-red-700">
                                                    Yes, Cancel
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </>
                            )}
                            {appt.status === 'cancelled' && (
                                <Button variant="outline" size="sm" onClick={() => openReschedule(appt)} className="w-full">
                                    Book Again
                                </Button>
                            )}
                        </CardFooter>
                    </Card>
                ))}
            </div>
        )}

        {/* RESCHEDULE DIALOG (Hidden) */}
        <Dialog open={rescheduleDialogOpen} onOpenChange={setRescheduleDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Reschedule Appointment</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Select New Date</Label>
                        <div className="flex justify-center border rounded-md p-2">
                            <CalendarPicker 
                                mode="single" 
                                selected={newDate} 
                                onSelect={setNewDate} 
                                disabled={(date) => isBefore(date, startOfDay(new Date()))}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Select New Time</Label>
                        <Select onValueChange={setNewTime}>
                            <SelectTrigger>
                                <SelectValue placeholder="Pick a time slot" />
                            </SelectTrigger>
                            <SelectContent className="max-h-[200px]">
                                {timeSlots.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button className="w-full" onClick={handleRescheduleSubmit} disabled={updateLoading || !newDate || !newTime}>
                        {updateLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Confirm Change
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}