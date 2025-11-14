import { MainLayout } from "@/components/layout/MainLayout";

export default function DashboardPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="mt-2 text-muted-foreground">
            Welcome to Levercast. Create, format, and share your content ideas
            across social media platforms.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-card-foreground">
              Quick Actions
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Get started by creating a new post or viewing your recent content.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-card-foreground">
              Recent Activity
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Your latest posts and updates will appear here.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-card-foreground">
              Templates
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Browse and use pre-defined content templates.
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

