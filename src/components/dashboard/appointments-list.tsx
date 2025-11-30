"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format } from "date-fns"
import { ScrollArea } from "../ui/scroll-area"
import { useSalonData } from "@/hooks/use-salon-data"
import { Loader2 } from "lucide-react"

export function AppointmentsList() {
    const { appointments, loading } = useSalonData();

    // Filter for upcoming/confirmed and sort by Date
    const recentAppointments = appointments
        .filter(a => a.status !== "cancelled") // Show confirmed and completed
        .sort((a, b) => b.date - a.date) // Newest first
        .slice(0, 7);

    if (loading) {
        return (
            <Card className="shadow-sm h-[400px] flex items-center justify-center">
                 <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </Card>
        )
    }

    return (
        <Card className="shadow-sm">
            <CardHeader>
                <CardTitle>Recent Appointments</CardTitle>
                <CardDescription>Live data from your salon.</CardDescription>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[350px]">
                    <div className="space-y-4">
                        {recentAppointments.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-8">No appointments found.</p>
                        ) : (
                            recentAppointments.map((appointment) => (
                                <div key={appointment.id} className="flex items-center space-x-4 p-2 rounded-lg hover:bg-muted">
                                    <Avatar className="h-10 w-10">
                                        {/* If we saved avatarUrl in Firestore use it, else fallback */}
                                        <AvatarImage src={appointment.staffAvatar} />
                                        <AvatarFallback>{appointment.staffName ? appointment.staffName.charAt(0) : "?"}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 space-y-1">
                                        <p className="text-sm font-medium leading-none">{appointment.clientName}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {appointment.serviceName} with {appointment.staffName}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium">{format(appointment.date, "h:mm a")}</p>
                                        <p className="text-xs text-muted-foreground">{format(appointment.date, "MMM d")}</p>
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