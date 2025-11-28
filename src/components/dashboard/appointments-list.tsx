"use client"

import { mockAppointments, mockServices, mockStaff } from "@/lib/mock-data"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { ScrollArea } from "../ui/scroll-area"

export function AppointmentsList() {
    const recentAppointments = mockAppointments
        .filter(a => a.status === "Confirmed")
        .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
        .slice(0, 7);

    return (
        <Card className="shadow-sm">
            <CardHeader>
                <CardTitle>Upcoming Appointments</CardTitle>
                <CardDescription>Here are your next confirmed appointments.</CardDescription>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[350px]">
                    <div className="space-y-4">
                        {recentAppointments.map((appointment) => {
                            const service = mockServices.find(s => s.id === appointment.serviceId);
                            const staff = mockStaff.find(s => s.id === appointment.staffId);
                            return (
                                <div key={appointment.id} className="flex items-center space-x-4 p-2 rounded-lg hover:bg-muted">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={staff?.avatarUrl} alt={staff?.name} />
                                        <AvatarFallback>{staff?.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 space-y-1">
                                        <p className="text-sm font-medium leading-none">{appointment.customerName}</p>
                                        <p className="text-sm text-muted-foreground">{service?.name}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium">{format(appointment.startTime, "h:mm a")}</p>
                                        <p className="text-xs text-muted-foreground">{format(appointment.startTime, "MMM d")}</p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    )
}
