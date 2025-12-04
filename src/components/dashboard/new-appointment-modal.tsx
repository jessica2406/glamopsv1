"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { useSalon } from "@/hooks/useSalon"
import { db } from "@/lib/firebase"
import { collection, addDoc, getDocs, serverTimestamp } from "firebase/firestore"
import { Plus, Loader2, CalendarIcon, Clock } from "lucide-react"
import { format, isBefore, startOfDay } from "date-fns"
import { cn } from "@/lib/utils"
// Import the new actions
import { getOrCreateCustomer, incrementCustomerVisits } from "@/lib/customer-actions"

export function NewAppointmentModal() {
  const { salon } = useSalon()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  
  // Data for Dropdowns
  const [services, setServices] = useState<any[]>([])
  const [staff, setStaff] = useState<any[]>([])

  // Form Fields
  const [clientName, setClientName] = useState("")
  const [clientEmail, setClientEmail] = useState("") // New Field
  const [serviceId, setServiceId] = useState("")
  const [staffId, setStaffId] = useState("")
  
  // Date & Time State
  const [date, setDate] = useState<Date>()
  const [timeSlot, setTimeSlot] = useState<string>("")

  // Fetch lists when modal opens
  useEffect(() => {
    if (open && salon) {
      const fetchData = async () => {
        // Only fetch if in Real Mode (or if you have a demo collection setup)
        // Assuming Firestore logic applies to both for now based on your structure
        const svcSnap = await getDocs(collection(db, "salons", salon.id, "services"))
        const stfSnap = await getDocs(collection(db, "salons", salon.id, "staff"))
        
        setServices(svcSnap.docs.map(d => ({id: d.id, ...d.data()})))
        setStaff(stfSnap.docs.map(d => ({id: d.id, ...d.data()})))
      }
      fetchData()
    }
  }, [open, salon])

  const generateTimeSlots = () => {
    const slots = []
    const startHour = 9  // 9:00 AM
    const endHour = 20   // 8:00 PM
    for (let hour = startHour; hour <= endHour; hour++) {
      const h = hour < 10 ? `0${hour}` : hour
      slots.push(`${h}:00`)
      slots.push(`${h}:30`)
    }
    return slots
  }
  const timeSlots = generateTimeSlots()

  const handleSubmit = async () => {
    if (!clientName || !serviceId || !staffId || !date || !timeSlot) return alert("Please fill all required fields")
    
    setLoading(true)
    try {
      const [hours, minutes] = timeSlot.split(":").map(Number)
      const appointmentDate = new Date(date)
      appointmentDate.setHours(hours, minutes, 0, 0)

      const selectedService = services.find(s => s.id === serviceId)
      const selectedStaff = staff.find(s => s.id === staffId)

      // --- NEW LOGIC START ---
      let customerId = "";
      
      // If we are in 'demo' mode, we might skip creating real customer docs 
      // or simply treat them as real docs in the demo salon.
      // Since your demo mode writes to a specific salonId, we can treat it as real logic.
      if (salon?.id) {
         // 1. Get or Create Customer
         customerId = await getOrCreateCustomer(salon.id, clientName, clientEmail)
         
         // 2. Increment their visit count
         await incrementCustomerVisits(salon.id, customerId)
      }
      // --- NEW LOGIC END ---

      await addDoc(collection(db, "salons", salon!.id, "appointments"), {
        customerId, // Linked!
        clientName,
        clientEmail, // Saved on appt for quick reference
        serviceId,
        serviceName: selectedService.name,
        price: selectedService.price,
        duration: selectedService.duration,
        staffId,
        staffName: selectedStaff.name,
        date: appointmentDate,
        status: "confirmed",
        salonId: salon!.id,
        createdAt: serverTimestamp()
      })
      
      setOpen(false)
      // Reset Form
      setClientName("")
      setClientEmail("")
      setDate(undefined)
      setTimeSlot("")
      setServiceId("")
      setStaffId("")

    } catch (e) {
      console.error(e)
      alert("Failed to book appointment")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="mr-2 h-4 w-4" /> New Appointment</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Appointment</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
            
            {/* 1. Client Name & Email */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Client Name *</Label>
                    <Input placeholder="Jane Doe" value={clientName} onChange={e => setClientName(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label>Email (*)</Label>
                    <Input placeholder="jane@example.com" value={clientEmail} onChange={e => setClientEmail(e.target.value)} />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* 2. Service Selection */}
                <div className="space-y-2">
                    <Label>Service *</Label>
                    <Select value={serviceId} onValueChange={setServiceId}>
                        <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                        <SelectContent>
                            {services.length === 0 && <SelectItem value="none" disabled>No services found</SelectItem>}
                            {services.map(s => <SelectItem key={s.id} value={s.id}>{s.name} (${s.price})</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>

                {/* 3. Staff Selection */}
                <div className="space-y-2">
                    <Label>Staff *</Label>
                    <Select value={staffId} onValueChange={setStaffId}>
                        <SelectTrigger><SelectValue placeholder="Assign..." /></SelectTrigger>
                        <SelectContent>
                            {staff.length === 0 && <SelectItem value="none" disabled>No staff found</SelectItem>}
                            {staff.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* 4. Date Picker */}
            <div className="space-y-2">
                <Label>Date *</Label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn(
                                "w-full justify-start text-left font-normal",
                                !date && "text-muted-foreground"
                            )}
                        >
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
                            disabled={(date) => isBefore(date, startOfDay(new Date()))}
                        />
                    </PopoverContent>
                </Popover>
            </div>

            {/* 5. Time Slot */}
            <div className="space-y-2">
                <Label>Time (9 AM - 8 PM) *</Label>
                <Select value={timeSlot} onValueChange={setTimeSlot} disabled={!date}>
                    <SelectTrigger>
                        <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                        <SelectValue placeholder="Select Time Slot" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                        {timeSlots.map(slot => (
                            <SelectItem key={slot} value={slot}>
                                {slot}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <Button className="w-full mt-4" onClick={handleSubmit} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirm Booking
            </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}