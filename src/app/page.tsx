import { AppLayout } from "@/components/app-layout";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { AppointmentsList } from "@/components/dashboard/appointments-list";

export default function DashboardPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Here's a snapshot of your salon today.</p>
        </div>
        <SummaryCards />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
          <div className="lg:col-span-4">
            <RevenueChart />
          </div>
          <div className="lg:col-span-3">
            <AppointmentsList />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
