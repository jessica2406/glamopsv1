"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { useSalon } from "@/hooks/useSalon"
import { db } from "@/lib/firebase"
import { doc, updateDoc, collection, getDocs } from "firebase/firestore"
import { CalendarIcon, Clock, Loader2 } from "lucide-react"
import { format, isBefore, startOfDay } from "date-fns"
import { cn } from "@/lib/utils"
import { Appointment, Service, Staff } from "@/types"

interface EditAppointmentModalProps {
  appointment: Appointment | null
  open: boolean
  onClose: () => void
}

export function EditAppointmentModal({ appointment, open, onClose }: EditAppointmentModalProps) {
  const { salon } = useSalon()
  const [loading, setLoading] = useState(false)
  
  // Lists
  const [services, setServices] = useState<Service[]>([])
  const [staffList, setStaffList] = useState<Staff[]>([])

  // Form State
  const [date, setDate] = useState<Date>()
  const [timeSlot, setTimeSlot] = useState<string>("")
  const [serviceId, setServiceId] = useState("")
  const [staffId, setStaffId] = useState("")

  // 1. Fetch Lists (Services/Staff) when modal opens
  useEffect(() => {
    if (open && salon) {
      const fetchData = async () => {
        const svcSnap = await getDocs(collection(db, "salons", salon.id, "services"))
        const stfSnap = await getDocs(collection(db, "salons", salon.id, "staff"))
        setServices(svcSnap.docs.map(d => ({ id: d.id, ...d.data() } as Service)))
        setStaffList(stfSnap.docs.map(d => ({ id: d.id, ...d.data() } as Staff)))
      }
      fetchData()
    }
  }, [open, salon])

  // 2. Pre-fill Data from Appointment
  useEffect(() => {
    if (appointment) {
      // Set IDs
      setServiceId(appointment.serviceId)
      setStaffId(appointment.staffId)
      
      // Handle Date/Time Split
      // Assuming appointment.date is a JS Date object (handled by your hook)
      const apptDate = appointment.date 
      setDate(apptDate)
      
      // Extract "HH:mm" from the date object
      const hours = apptDate.getHours().toString().padStart(2, '0')
      const minutes = apptDate.getMinutes().toString().padStart(2, '0')
      setTimeSlot(`${hours}:${minutes}`)
    }
  }, [appointment])

  const generateTimeSlots = () => {
    const slots = []
    for (let hour = 9; hour <= 20; hour++) {
      const h = hour < 10 ? `0${hour}` : hour
      slots.push(`${h}:00`)
      slots.push(`${h}:30`)
    }
    return slots
  }

  const handleUpdate = async () => {
    if (!appointment || !salon || !date || !timeSlot) return
    setLoading(true)

    try {
      // Reconstruct Date Object
      const [h, m] = timeSlot.split(":").map(Number)
      const newDate = new Date(date)
      newDate.setHours(h, m, 0, 0)

      // Find selected objects to update names/prices if changed
      const selectedService = services.find(s => s.id === serviceId)
      const selectedStaff = staffList.find(s => s.id === staffId)

      const apptRef = doc(db, "salons", salon.id, "appointments", appointment.id)
      
      await updateDoc(apptRef, {
        date: newDate,
        serviceId,
        serviceName: selectedService?.name, // Update snapshot data
        price: selectedService?.price,      // Update price if service changed
        duration: selectedService?.duration,
        staffId,
        staffName: selectedStaff?.name
      })

      onClose()
    } catch (error) {
      console.error("Error updating appointment:", error)
      alert("Failed to update")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Reschedule Appointment</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Service & Staff */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Service</Label>
              <Select value={serviceId} onValueChange={setServiceId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {services.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Staff</Label>
              <Select value={staffId} onValueChange={setStaffId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {staffList.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date Picker */}
          <div className="space-y-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  disabled={(d) => isBefore(d, startOfDay(new Date()))}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time Slot */}
          <div className="space-y-2">
            <Label>Time</Label>
            <Select value={timeSlot} onValueChange={setTimeSlot}>
              <SelectTrigger>
                <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {generateTimeSlots().map(slot => (
                  <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button className="w-full" onClick={handleUpdate} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}