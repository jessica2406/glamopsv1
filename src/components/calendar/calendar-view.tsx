"use client";

import { useState } from "react";
import {
  format,
  startOfWeek,
  addDays,
  eachHourOfInterval,
  setHours,
  differenceInMinutes,
  isSameDay,
  addMinutes,
} from "date-fns";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Clock, User } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { AppointmentActions } from "../dashboard/appointment-actions";



interface CalendarViewProps {
  appointments: any[]; // Data from Firestore
}

export function CalendarView({ appointments }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(() => new Date());

  // Settings
  const weekStartsOn = 1; // 0 = Sunday, 1 = Monday
  const startHour = 8; // 8 AM
  const endHour = 20; // 8 PM
  const hourHeight = 64; // Height in pixels per hour slot

  const weekStart = startOfWeek(currentDate, { weekStartsOn });

  const days = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));
  const timeSlots = eachHourOfInterval({
    start: setHours(new Date(0), startHour),
    end: setHours(new Date(0), endHour),
  });

  return (
    <Card className="border-0 shadow-none">
      {/* HEADER CONTROLS */}
      <CardHeader className="flex flex-row items-center justify-between p-2 pb-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setCurrentDate((prev) => addDays(prev, -7))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setCurrentDate((prev) => addDays(prev, 7))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(new Date())}
          >
            Today
          </Button>
        </div>
        <h2 className="text-sm font-semibold">
          {format(weekStart, "MMM d")} -{" "}
          {format(addDays(weekStart, 6), "MMM d, yyyy")}
        </h2>
      </CardHeader>

      <CardContent className="p-0">
        <div className="flex flex-col h-[500px] overflow-y-auto border rounded-md">
          {/* GRID HEADER (Days) */}
          <div className="flex border-b sticky top-0 bg-background z-10">
            <div className="w-12 flex-shrink-0 border-r bg-muted/30"></div>{" "}
            {/* Time Column Header */}
            <div className="grid grid-cols-7 flex-1">
              {days.map((day) => (
                <div
                  key={day.toISOString()}
                  className="text-center py-2 border-r last:border-r-0"
                >
                  <p className="text-xs text-muted-foreground uppercase">
                    {format(day, "EEE")}
                  </p>
                  <div
                    className={cn(
                      "text-sm font-bold w-7 h-7 mx-auto flex items-center justify-center rounded-full mt-1",
                      isSameDay(day, new Date())
                        ? "bg-primary text-primary-foreground"
                        : ""
                    )}
                  >
                    {format(day, "d")}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* GRID BODY */}
          <div className="flex relative">
            {/* Time Labels Column */}
            <div className="w-12 flex-shrink-0 border-r bg-muted/10">
              {timeSlots.map((hour) => (
                <div
                  key={hour.toISOString()}
                  style={{ height: `${hourHeight}px` }}
                  className="text-right pr-2 text-[10px] text-muted-foreground pt-1 border-b border-transparent"
                >
                  {format(hour, "h a")}
                </div>
              ))}
            </div>

            {/* Days Columns */}
            <div className="grid grid-cols-7 flex-1 relative">
              {/* Background Grid Lines */}
              <div className="absolute inset-0 grid grid-rows-[repeat(13,1fr)] w-full h-full pointer-events-none z-0">
                {timeSlots.map((_, i) => (
                  <div
                    key={i}
                    style={{ height: `${hourHeight}px` }}
                    className="border-b w-full border-dashed border-gray-100"
                  ></div>
                ))}
              </div>

              {days.map((day) => (
                <div
                  key={day.toISOString()}
                  className="relative border-r last:border-r-0 h-full"
                >
                  {/* RENDER APPOINTMENTS FOR THIS DAY */}
                  {appointments
                    .filter((apt) => isSameDay(apt.date, day))
                    .map((apt) => {
                      // Calculations
                      const startTime = apt.date; // Firestore Date
                      const duration = apt.duration || 60; // Default 60 mins if missing

                      // Calculate Top Position relative to 8 AM
                      const startMinutes = differenceInMinutes(
                        startTime,
                        setHours(day, startHour)
                      );
                      const top = (startMinutes / 60) * hourHeight;
                      const height = (duration / 60) * hourHeight;

                      return (
                        <Popover key={apt.id}>
                          <PopoverTrigger asChild>
                            <div
                              className="absolute left-1 right-1 rounded bg-primary/10 border-l-2 border-primary cursor-pointer hover:bg-primary/20 transition-all z-10 p-1 overflow-hidden"
                              style={{
                                top: `${Math.max(0, top)}px`,
                                height: `${Math.max(20, height)}px`,
                              }}
                            >
                              <div className="text-[10px] font-bold text-primary truncate leading-tight">
                                {apt.clientName}
                              </div>
                              {height > 30 && (
                                <div className="text-[9px] text-primary/70 truncate">
                                  {apt.serviceName}
                                </div>
                              )}
                            </div>
                          </PopoverTrigger>
                          <PopoverContent className="w-64 p-3 shadow-xl">
                            <div className="space-y-2">
                              <div className="flex justify-between items-start border-b pb-2">
                                <h4 className="font-semibold text-sm">
                                  {apt.serviceName}
                                </h4>
                                {/* ADD THIS LINE */}
                                <div className="-mt-1 -mr-2">
                                  <AppointmentActions
                                    appointment={apt}
                                    
                                  />
                                </div>
                              </div>

                              <div className="space-y-1 text-sm">
                                {/* ... existing info details ... */}

                                {/* Update Status Badge Logic */}
                                <div className="pt-2 flex items-center justify-between text-xs">
                                  <span
                                    className={cn(
                                      "px-2 py-0.5 rounded-full capitalize",
                                      apt.status === "cancelled"
                                        ? "bg-red-100 text-red-700"
                                        : apt.status === "completed"
                                        ? "bg-green-100 text-green-700"
                                        : "bg-green-100 text-green-700"
                                    )}
                                  >
                                    {apt.status || "Confirmed"}
                                  </span>
                                  <span className="font-bold">
                                    ${apt.price}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      );
                    })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
