"use client";

import { useState } from "react";
import { mockServices, mockStaff } from "@/lib/mock-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { CheckCircle, ArrowRight, ArrowLeft, PartyPopper } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { format } from "date-fns";
import { Users } from "lucide-react";

const steps = [
  { id: 1, name: "Select Service" },
  { id: 2, name: "Choose Date & Time" },
  { id: 3, name: "Select Staff" },
  { id: 4, name: "Your Details" },
];

export function BookingWizard() {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const progress = (step / steps.length) * 100;
  const service = mockServices.find(s => s.id === selectedService);

  const timeSlots = ["09:00", "09:45", "10:30", "11:15", "13:00", "13:45", "14:30", "15:15", "16:00"];

  const handleNext = () => {
    if (step < steps.length) {
      setStep(step + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  if (isCompleted) {
    return (
        <Card className="w-full max-w-2xl text-center p-8 shadow-xl">
            <PartyPopper className="w-16 h-16 mx-auto text-green-500 mb-4" />
            <CardTitle className="text-2xl mb-2">Appointment Booked!</CardTitle>
            <CardDescription className="mb-4">
                Your {service?.name} with {mockStaff.find(s => s.id === selectedStaff)?.name} is confirmed for {format(selectedDate!, "MMMM d, yyyy")} at {selectedTime}.
            </CardDescription>
            <Button onClick={() => {
                setIsCompleted(false);
                setStep(1);
                setSelectedService(null);
                setSelectedStaff(null);
                setSelectedTime(null);
            }}>Book Another Appointment</Button>
        </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl shadow-xl">
      <CardHeader>
        <Progress value={progress} className="mb-4" />
        <CardTitle>{steps[step - 1].name}</CardTitle>
        <CardDescription>Step {step} of {steps.length}</CardDescription>
      </CardHeader>
      <CardContent className="min-h-[300px]">
        {step === 1 && (
          <RadioGroup value={selectedService || ""} onValueChange={setSelectedService}>
            <div className="space-y-4">
              {mockServices.map((service) => (
                <Label
                  key={service.id}
                  htmlFor={service.id}
                  className={cn(
                    "flex items-center space-x-4 rounded-md border p-4 transition-all hover:bg-accent/50",
                    selectedService === service.id && "bg-accent border-primary"
                  )}
                >
                  <RadioGroupItem value={service.id} id={service.id} />
                  <div className="flex-1">
                    <p className="font-semibold">{service.name}</p>
                    <p className="text-sm text-muted-foreground">{service.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">₹{service.price}</p>
                    <p className="text-sm text-muted-foreground">{service.duration} min</p>
                  </div>
                </Label>
              ))}
            </div>
          </RadioGroup>
        )}
        {step === 2 && (
          <div className="grid md:grid-cols-2 gap-8">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border p-0"
              disabled={(date) => date < new Date(new Date().toDateString())}
            />
            <div className="grid grid-cols-3 gap-2 self-start">
              {timeSlots.map(time => (
                <Button key={time} variant={selectedTime === time ? 'default' : 'outline'} onClick={() => setSelectedTime(time)}>
                  {time}
                </Button>
              ))}
            </div>
          </div>
        )}
        {step === 3 && (
  <RadioGroup 
    value={selectedStaff || "no-preference"} 
    onValueChange={setSelectedStaff}
  >
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      
      {/* 1. No Preference Option */}
      <Label
        htmlFor="no-preference"
        className={cn(
          "cursor-pointer flex flex-col items-center justify-center rounded-xl border-2 border-transparent bg-card p-4 text-center shadow-sm ring-1 ring-border transition-all hover:bg-accent hover:ring-primary/50",
          (selectedStaff === "no-preference" || !selectedStaff) && "border-primary bg-primary/5 ring-primary"
        )}
      >
        <RadioGroupItem value="no-preference" id="no-preference" className="sr-only" />
        
        {/* Icon Avatar */}
        <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Users className="h-8 w-8" />
        </div>
        
        <p className="font-semibold text-foreground">No Preference</p>
        <p className="text-xs text-muted-foreground mt-1">Maximum availability</p>
      </Label>

      {/* 2. Existing Staff Map */}
      {mockStaff.map((staff) => (
        <Label
          key={staff.id}
          htmlFor={staff.id}
          className={cn(
            "cursor-pointer flex flex-col items-center justify-center rounded-xl border-2 border-transparent bg-card p-4 text-center shadow-sm ring-1 ring-border transition-all hover:bg-accent hover:ring-primary/50",
            selectedStaff === staff.id && "border-primary bg-primary/5 ring-primary"
          )}
        >
          <RadioGroupItem value={staff.id} id={staff.id} className="sr-only" />
          
          <Avatar className="mb-3 h-20 w-20 ring-2 ring-background shadow-sm">
            <AvatarImage src={staff.avatarUrl} className="object-cover" />
            <AvatarFallback className="bg-muted text-muted-foreground">
                {staff.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          
          <p className="font-semibold text-foreground">{staff.name}</p>
          <p className="text-xs text-muted-foreground mt-1">Stylist</p>
        </Label>
      ))}
    </div>
  </RadioGroup>
)}
        {step === 4 && (
            <div className="space-y-4">
                <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" placeholder="Your full name" />
                </div>
                 <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="your@email.com" />
                </div>
                 <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" type="tel" placeholder="Your phone number" />
                </div>
            </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handleBack} disabled={step === 1}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button onClick={handleNext} disabled={(step === 1 && !selectedService) || (step === 2 && !selectedTime)}>
          {step === steps.length ? "Confirm Booking" : "Next"} <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
