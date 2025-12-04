"use client";

import { SettingsContent } from "@/components/settings/settings-content";

export default function SettingsPage() {
  // We removed <AppLayout> because it is already in RootLayout
  return (
    <div className="space-y-6 p-6"> {/* Added padding for better spacing */}
      <div className="border-b pb-4"> {/* Added a border separator */}
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your salon settings and integrations.
        </p>
      </div>
      
      {/* The main content form */}
      <SettingsContent />
    </div>
  );
}