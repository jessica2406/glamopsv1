"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { ArrowRight, ArrowLeft, Users, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format, isBefore, startOfDay } from "date-fns";
import { Service, Staff } from "@/types";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getOrCreateCustomer, incrementCustomerVisits } from "@/lib/customer-actions";
import { useRouter } from "next/navigation";

const steps = [
  { id: 1, name: "Select Service" },
  { id: 2, name: "Choose Date & Time" },
  { id: 3, name: "Select Staff" },
  { id: 4, name: "Your Details" },
];

interface BookingWizardProps {
  salonId: string;
  services: Service[];
  staffList: Staff[];
  salonSlug: string;     // <-- added
}

export function BookingWizard({ salonId, services, staffList, salonSlug }: BookingWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>("no-preference");

  // Customer Details
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const progress = (step / steps.length) * 100;
  const service = services.find(s => s.id === selectedServiceId);

  const timeSlots = [
    "09:00","09:30","10:00","10:30","11:00","11:30",
    "12:00","12:30","13:00","13:30","14:00","14:30",
    "15:00","15:30","16:00","16:30","17:00","17:30"
  ];

  const handleNext = async () => {
    if (step < steps.length) {
      setStep(step + 1);
    } else {
      await handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!selectedServiceId || !selectedDate || !selectedTime || !name) return;
    setLoading(true);

    try {
      // 1. Staff handling
      let finalStaffId = selectedStaffId;
      let finalStaffName = "Any Available";

      if (selectedStaffId === "no-preference" && staffList.length > 0) {
        const randomStaff = staffList[Math.floor(Math.random() * staffList.length)];
        finalStaffId = randomStaff.id;
        finalStaffName = randomStaff.name;
      } else {
        const s = staffList.find(st => st.id === selectedStaffId);
        if (s) finalStaffName = s.name;
      }

      // 2. Combine date + time
      const [hours, minutes] = selectedTime.split(":").map(Number);
      const appointmentDate = new Date(selectedDate);
      appointmentDate.setHours(hours, minutes, 0, 0);

      // 3. Get or create customer
      const customerId = await getOrCreateCustomer(salonId, name, email);
      await incrementCustomerVisits(salonId, customerId);

      // 4. Create appointment
      const docRef = await addDoc(collection(db, "salons", salonId, "appointments"), {
        salonId,
        customerId,
        clientName: name,
        clientEmail: email,
        clientPhone: phone,
        serviceId: selectedServiceId,
        serviceName: service?.name,
        staffId: finalStaffId,
        staffName: finalStaffName,
        date: appointmentDate,
        duration: service?.duration,
        price: service?.price,
        status: "confirmed",
        createdAt: serverTimestamp()
      });

      // 5. Redirect to confirmation page
      router.push(`/book/${salonSlug}/appointment/${docRef.id}`);

    } catch (error) {
      console.error("Booking failed:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl shadow-2xl border-0 sm:border">
      <CardHeader className="bg-slate-50/50 border-b pb-6">
        <div className="flex items-center justify-between mb-4">
          <CardTitle className="text-xl">Book Appointment</CardTitle>
          <span className="text-sm font-medium text-muted-foreground">
            Step {step} of 4
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </CardHeader>

      <CardContent className="min-h-[400px] p-6 pt-8">
        {/* STEP 1 – SERVICE */}
        {step === 1 && (
          <RadioGroup value={selectedServiceId || ""} onValueChange={setSelectedServiceId}>
            <div className="grid gap-4">
              {services.map(svc => (
                <Label
                  key={svc.id}
                  htmlFor={svc.id}
                  className={cn(
                    "flex items-center justify-between space-x-4 rounded-xl border-2 p-4 cursor-pointer hover:border-primary/50 hover:bg-slate-50 transition",
                    selectedServiceId === svc.id ? "border-primary bg-primary/5" : "border-transparent bg-slate-50"
                  )}
                >
                  <RadioGroupItem value={svc.id} id={svc.id} className="sr-only" />
                  <div>
                    <div className="font-bold text-lg">{svc.name}</div>
                    <div className="text-sm text-muted-foreground">{svc.duration} minutes</div>
                  </div>
                  <div className="font-semibold text-lg">₹{svc.price}</div>
                </Label>
              ))}
            </div>
          </RadioGroup>
        )}

        {/* STEP 2 – DATE & TIME */}
        {step === 2 && (
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border shadow-sm p-3 w-full"
                disabled={date => isBefore(date, startOfDay(new Date()))}
              />
            </div>
            <div className="flex-1">
              <Label className="mb-3 block font-medium">Available Time Slots</Label>
              <div className="grid grid-cols-3 gap-3">
                {timeSlots.map(time => (
                  <Button
                    key={time}
                    variant={selectedTime === time ? "default" : "outline"}
                    onClick={() => setSelectedTime(time)}
                    className={cn(selectedTime === time && "ring-2 ring-offset-2 ring-primary")}
                  >
                    {time}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3 – STAFF */}
        {step === 3 && (
          <RadioGroup value={selectedStaffId ?? "no-preference"} onValueChange={setSelectedStaffId}>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">

              {/* No preference */}
              <Label
                htmlFor="no-preference"
                className={cn(
                  "cursor-pointer flex flex-col items-center justify-center rounded-xl border-2 bg-card p-6 text-center hover:bg-slate-50",
                  selectedStaffId === "no-preference" ? "border-primary bg-primary/5" : "border-muted"
                )}
              >
                <RadioGroupItem value="no-preference" id="no-preference" className="sr-only" />
                <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                  <Users className="h-8 w-8 text-slate-600" />
                </div>
                <p className="font-semibold">No Preference</p>
              </Label>

              {/* Staff List */}
              {staffList.map(staff => (
                <Label
                  key={staff.id}
                  htmlFor={staff.id}
                  className={cn(
                    "cursor-pointer flex flex-col items-center justify-center rounded-xl border-2 bg-card p-6 text-center hover:bg-slate-50",
                    selectedStaffId === staff.id ? "border-primary bg-primary/5" : "border-muted"
                  )}
                >
                  <RadioGroupItem value={staff.id} id={staff.id} className="sr-only" />
                  <Avatar className="mb-3 h-16 w-16">
                    <AvatarImage src={staff.avatarUrl} />
                    <AvatarFallback>{staff.name[0]}</AvatarFallback>
                  </Avatar>
                  <p className="font-semibold">{staff.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{staff.role}</p>
                </Label>
              ))}
            </div>
          </RadioGroup>
        )}

        {/* STEP 4 – CUSTOMER DETAILS */}
        {step === 4 && (
          <div className="space-y-6 max-w-md mx-auto">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between bg-slate-50/50 p-6 border-t">
        <Button variant="outline" onClick={handleBack} disabled={step === 1 || loading}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>

        <Button
          onClick={handleNext}
          disabled={
            loading ||
            (step === 1 && !selectedServiceId) ||
            (step === 2 && (!selectedDate || !selectedTime)) ||
            (step === 4 && !name)
          }
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {step === steps.length ? "Confirm Booking" : "Next Step"}
          {!loading && step !== steps.length && <ArrowRight className="ml-2 h-4 w-4" />}
        </Button>
      </CardFooter>
    </Card>
  );
}
