import { AppLayout } from "@/components/app-layout";
import { SettingsContent } from "@/components/settings/settings-content";

export default function SettingsPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your salon settings and integrations.
          </p>
        </div>
        <SettingsContent />
      </div>
    </AppLayout>
  );
}
