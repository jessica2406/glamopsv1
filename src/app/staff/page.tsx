import { AppLayout } from "@/components/app-layout";
import { StaffList } from "@/components/staff/staff-list";
export const dynamic = 'force-dynamic';

export default function StaffPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Staff Management</h1>
          <p className="text-muted-foreground">
            Add, view, and manage your team members.
          </p>
        </div>
        <StaffList />
      </div>
    </AppLayout>
  );
}
