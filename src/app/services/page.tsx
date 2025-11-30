import { AppLayout } from "@/components/app-layout";
import { ServicesTable } from "@/components/services/services-table";
export const dynamic = 'force-dynamic';

export default function ServicesPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Services</h1>
          <p className="text-muted-foreground">
            Manage the services your salon offers.
          </p>
        </div>
        <ServicesTable />
      </div>
    </AppLayout>
  );
}
