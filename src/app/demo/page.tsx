import { AppLayout } from "@/components/app-layout";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { AppointmentsList } from "@/components/dashboard/appointments-list";
import { Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function DemoDashboardPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Banner: Moved INSIDE AppLayout to prevent overlap issues */}
        <div className="relative overflow-hidden rounded-xl bg-primary px-6 py-4 shadow-lg">
          <div className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-10 transition-opacity" />
          <div className="relative flex flex-col items-center justify-between gap-4 sm:flex-row text-primary-foreground">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div className="space-y-0.5">
                <h3 className="font-semibold leading-none text-white">
                  Demo Mode Active
                </h3>
                <p className="text-sm text-primary-foreground/80">
                  You are viewing generated data. Changes here won't be saved.
                </p>
              </div>
            </div>
            
            <Link 
              href="/onboarding"
              className="group flex items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-bold text-primary transition-all hover:bg-white/90 hover:shadow-md"
            >
              Set up real salon
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Existing Dashboard Content */}
        <div className="flex flex-col gap-2">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Here's a snapshot of your demo salon today.</p>
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