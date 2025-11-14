import { MainLayout } from "@/components/layout/MainLayout";

export default function SettingsPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="mt-2 text-muted-foreground">
            Manage your account and app preferences.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <p className="text-muted-foreground">
            Settings interface coming soon...
          </p>
        </div>
      </div>
    </MainLayout>
  );
}

