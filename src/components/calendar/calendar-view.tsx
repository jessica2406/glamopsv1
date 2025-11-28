"use client";

import { useState } from 'react';
import { mockAppointments, mockServices, mockStaff } from '@/lib/mock-data';
import { format, startOfWeek, addDays, eachHourOfInterval, setHours, differenceInMinutes, areIntervalsOverlapping } from 'date-fns';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const weekStartsOn = 1; // Monday
  const weekStart = startOfWeek(currentDate, { weekStartsOn });

  const days = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));
  const timeSlots = eachHourOfInterval({
    start: setHours(new Date(0), 8),
    end: setHours(new Date(0), 20),
  });

  const handlePrevWeek = () => {
    setCurrentDate(prev => addDays(prev, -7));
  };

  const handleNextWeek = () => {
    setCurrentDate(prev => addDays(prev, 7));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handlePrevWeek}><ChevronLeft className="h-4 w-4" /></Button>
          <Button variant="outline" onClick={handleNextWeek}><ChevronRight className="h-4 w-4" /></Button>
          <Button variant="outline" onClick={handleToday}>Today</Button>
        </div>
        <h2 className="text-lg font-semibold text-center">
          {format(weekStart, 'MMMM yyyy')}
        </h2>
        <div className="w-full sm:w-auto"></div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-[auto_1fr] overflow-auto">
          {/* Time column */}
          <div className="grid grid-rows-[auto_1fr]">
             <div className="h-12"></div>
             <div className="border-r">
                {timeSlots.map(hour => (
                  <div key={hour.toISOString()} className="h-16 text-right pr-2 text-xs text-muted-foreground border-t -mt-px pt-1">
                    {format(hour, 'ha')}
                  </div>
                ))}
             </div>
          </div>
          
          {/* Day columns */}
          <div className="grid grid-cols-7 relative">
            {days.map(day => (
              <div key={day.toISOString()} className="border-r last:border-r-0">
                <div className="text-center p-2 border-b h-12">
                  <p className="text-sm font-medium">{format(day, 'E')}</p>
                  <p className="text-2xl font-bold">{format(day, 'd')}</p>
                </div>
                
                {/* Hour slots for this day */}
                <div className="relative">
                  {timeSlots.map(hour => (
                    <div key={hour.toISOString()} className="h-16 border-t -mt-px"></div>
                  ))}
                  
                  {/* Appointments for this day */}
                  {mockAppointments
                    .filter(apt => format(apt.startTime, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd'))
                    .map(apt => {
                      const service = mockServices.find(s => s.id === apt.serviceId);
                      const staff = mockStaff.find(s => s.id === apt.staffId);
                      const top = (differenceInMinutes(apt.startTime, setHours(day, 8)) / 60) * 64;
                      const height = (service?.duration || 0) / 60 * 64;

                      return (
                        <Popover key={apt.id}>
                          <PopoverTrigger asChild>
                            <div
                              className="absolute w-[calc(100%-0.5rem)] left-1 p-2 rounded-lg bg-primary/20 text-primary-foreground border border-primary/50 cursor-grab hover:bg-primary/30 transition-colors"
                              style={{ top: `${top}px`, height: `${height}px` }}
                              title={`${service?.name} with ${staff?.name}`}
                            >
                              <p className="text-xs font-bold text-primary truncate">{service?.name}</p>
                              <p className="text-xs text-primary/80 truncate">{apt.customerName}</p>
                            </div>
                          </PopoverTrigger>
                          <PopoverContent className="w-64">
                            <div className="space-y-2">
                              <h4 className="font-medium leading-none">{service?.name}</h4>
                              <p className="text-sm text-muted-foreground">{apt.customerName}</p>
                              <div className="flex items-center pt-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={staff?.avatarUrl} />
                                  <AvatarFallback>{staff?.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="ml-2">
                                  <p className="text-xs text-muted-foreground">with</p>
                                  <p className="text-sm font-medium">{staff?.name}</p>
                                </div>
                              </div>
                              <p className="text-sm pt-2">{format(apt.startTime, 'eeee, MMM d, h:mm a')} - {format(apt.endTime, 'h:mm a')}</p>
                            </div>
                          </PopoverContent>
                        </Popover>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
