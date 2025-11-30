export const dynamic = 'force-dynamic';

import { AppLayout } from "@/components/app-layout";
import { CustomersTable } from "@/components/customers/customers-table";

export default function CustomersPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">
            View and manage your customer database.
          </p>
        </div>
        <CustomersTable />
      </div>
    </AppLayout>
  );
}
