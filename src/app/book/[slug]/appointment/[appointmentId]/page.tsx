"use client"

import { useEffect, useState, use } from "react"
import { db } from "@/lib/firebase"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Calendar, Clock, MapPin, User, CheckCircle, XCircle, Edit } from "lucide-react"
import { format, isBefore, startOfDay } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Calendar as CalendarPicker } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

export default function AppointmentDetailsPage({ params }: { params: Promise<{ slug: string; appointmentId: string }> }) {
  const { slug, appointmentId } = use(params)
  
  const [loading, setLoading] = useState(true)
  const [appointment, setAppointment] = useState<any>(null)
  const [salon, setSalon] = useState<any>(null)
  
  // Reschedule State
  const [isRescheduling, setIsRescheduling] = useState(false)
  const [newDate, setNewDate] = useState<Date | undefined>(undefined)
  const [newTime, setNewTime] = useState<string>("")
  const [updateLoading, setUpdateLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  // 1. Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { collection, query, where, getDocs } = await import("firebase/firestore")
        const q = query(collection(db, "salons"), where("slug", "==", slug))
        const salonSnap = await getDocs(q)
        
        if (salonSnap.empty) throw new Error("Salon not found")
        const salonData = { id: salonSnap.docs[0].id, ...salonSnap.docs[0].data() }
        setSalon(salonData)

        const apptRef = doc(db, "salons", salonData.id, "appointments", appointmentId)
        const apptSnap = await getDoc(apptRef)
        
        if (apptSnap.exists()) {
          const data = apptSnap.data()
          setAppointment({ 
            id: apptSnap.id, 
            ...data,
            date: data.date?.toDate ? data.date.toDate() : new Date(data.date) 
          })
        }
      } catch (error) {
        console.error("Error", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [slug, appointmentId])

  // 2. Handle Cancel
  const handleCancel = async () => {
    if (!salon || !appointment) return
    try {
       await updateDoc(doc(db, "salons", salon.id, "appointments", appointment.id), { status: "cancelled" })
       setAppointment((prev: any) => ({ ...prev, status: "cancelled" }))
    } catch (e) {
      alert("Failed to cancel")
    }
  }

  // 3. Handle Reschedule
  const handleReschedule = async () => {
    if (!newDate || !newTime || !salon) return
    setUpdateLoading(true)
    try {
        // Construct new date object
        const [hours, minutes] = newTime.split(":").map(Number)
        const updatedDate = new Date(newDate)
        updatedDate.setHours(hours, minutes, 0, 0)

        // Update Firestore
        await updateDoc(doc(db, "salons", salon.id, "appointments", appointment.id), { 
            date: updatedDate,
            status: "confirmed" // Re-confirm if it was cancelled
        })

        // Update UI
        setAppointment((prev: any) => ({ ...prev, date: updatedDate, status: "confirmed" }))
        setDialogOpen(false)
        setNewDate(undefined)
        setNewTime("")
        alert("Appointment rescheduled successfully!")

    } catch (error) {
        console.error("Reschedule failed", error)
        alert("Failed to reschedule. Please try again.")
    } finally {
        setUpdateLoading(false)
    }
  }

  const timeSlots = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "13:00", "13:30", "14:00", "14:30", "15:00", "16:00", "17:00"]

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>
  if (!appointment) return <div className="min-h-screen flex items-center justify-center">Appointment not found</div>

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-primary">
        <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                {appointment.status === 'cancelled' ? <XCircle className="h-8 w-8 text-red-600" /> : <CheckCircle className="h-8 w-8 text-green-600" />}
            </div>
            <CardTitle className="text-2xl">
                {appointment.status === 'cancelled' ? 'Appointment Cancelled' : 'Booking Confirmed!'}
            </CardTitle>
            <CardDescription>
                Ref: <span className="font-mono">{appointment.id.slice(0, 8)}</span>
            </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-primary" />
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Date</p>
                        <p className="font-semibold">{format(appointment.date, "EEEE, MMMM do, yyyy")}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-primary" />
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Time</p>
                        <p className="font-semibold">{format(appointment.date, "h:mm a")}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-primary" />
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Service</p>
                        <p className="font-semibold">{appointment.serviceName}</p>
                    </div>
                </div>
            </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 bg-slate-50/50 p-6">
            {/* RESCHEDULE MODAL */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                    <Button variant="default" className="w-full">
                        <Edit className="mr-2 h-4 w-4" /> Reschedule Date/Time
                    </Button>
                </DialogTrigger>
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
                        <Button className="w-full" onClick={handleReschedule} disabled={updateLoading || !newDate || !newTime}>
                            {updateLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Confirm New Time
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* CANCEL BUTTON */}
            {appointment.status !== 'cancelled' && (
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="outline" className="w-full text-red-600 hover:bg-red-50">
                            Cancel Appointment
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Go Back</AlertDialogCancel>
                            <AlertDialogAction onClick={handleCancel} className="bg-red-600">Yes, Cancel</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
            
            <Button variant="ghost" size="sm" onClick={() => window.location.href = `/book/${slug}`}>
                Back to Booking Page
            </Button>
        </CardFooter>
      </Card>
    </div>
  )
}