"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format } from "date-fns"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
// 1. IMPORT THE ACTIONS COMPONENT
import { AppointmentActions } from "./appointment-actions" 

interface AppointmentsListProps {
  appointments: any[]
  currency?: string
}

export function AppointmentsList({ appointments, currency = 'USD' }: AppointmentsListProps) {
    const safeAppointments = Array.isArray(appointments) ? appointments : [];
    const recentAppointments = safeAppointments.slice(0, 10);

    return (
        <Card className="shadow-sm h-full">
            <CardHeader>
                <CardTitle>Recent Appointments</CardTitle>
                <CardDescription>Live data from your salon.</CardDescription>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[350px] pr-4">
                    <div className="space-y-4">
                        {recentAppointments.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                                <p>No appointments found.</p>
                            </div>
                        ) : (
                            recentAppointments.map((appointment) => (
                                <div key={appointment.id} className="group flex items-center justify-between space-x-4 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                                    
                                    {/* LEFT: Info */}
                                    <div className="flex items-center gap-4 overflow-hidden">
                                        <Avatar className="h-10 w-10 border">
                                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${appointment.staffName || 'user'}`} />
                                            <AvatarFallback>{appointment.staffName ? appointment.staffName.charAt(0) : "?"}</AvatarFallback>
                                        </Avatar>
                                        <div className="space-y-1 truncate">
                                            <p className="text-sm font-medium leading-none truncate">{appointment.clientName}</p>
                                            <p className="text-xs text-muted-foreground truncate">
                                                {appointment.serviceName} w/ {appointment.staffName}
                                            </p>
                                        </div>
                                    </div>

                                    {/* RIGHT: Actions */}
                                    <div className="flex items-center gap-3">
                                        <div className="text-right hidden sm:block">
                                            <p className="text-sm font-bold">
                                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(appointment.price || 0)}
                                            </p>
                                            <div className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
                                                <span className={cn(
                                                    "w-2 h-2 rounded-full",
                                                    appointment.status === 'cancelled' ? "bg-red-500" :
                                                    appointment.status === 'completed' ? "bg-green-500" :
                                                    "bg-blue-500"
                                                )} />
                                                {appointment.date ? format(new Date(appointment.date), "MMM d") : ""}
                                            </div>
                                        </div>

                                        {/* 2. PLACE THE ACTIONS COMPONENT HERE */}
                                        <AppointmentActions appointment={appointment} />
                                        
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    )
}