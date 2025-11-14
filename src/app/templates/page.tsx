import { MainLayout } from "@/components/layout/MainLayout";

export default function TemplatesPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Templates</h1>
          <p className="mt-2 text-muted-foreground">
            Browse and select content formatting templates.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <p className="text-muted-foreground">
            Templates list coming soon...
          </p>
        </div>
      </div>
    </MainLayout>
  );
}

