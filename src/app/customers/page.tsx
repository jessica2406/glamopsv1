"use client";

// 1. Remove AppLayout import
import { CustomersTable } from "@/components/customers/customers-table";

// 2. Keep this if you need it for build settings
export const dynamic = 'force-dynamic';

export default function CustomersPage() {
  return (
    // 3. Use a standard container with padding (p-6)
    <div className="flex flex-col gap-6 p-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">
            View and manage your customer database.
          </p>
        </div>
        
        {/* The table component handles its own internal layout */}
        <CustomersTable />
    </div>
  );
}