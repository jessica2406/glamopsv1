export const dynamic = 'force-dynamic';
import { AppLayout } from "@/components/app-layout";
import { CalendarView } from "@/components/calendar/calendar-view";

export default function CalendarPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground">
            View and manage your appointments.
          </p>
        </div>
        <CalendarView />
      </div>
    </AppLayout>
  );
}
