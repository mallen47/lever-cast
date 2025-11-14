import { MainLayout } from "@/components/layout/MainLayout";

export default function PostsPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Recent Posts</h1>
          <p className="mt-2 text-muted-foreground">
            View and manage all your created content.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <p className="text-muted-foreground">
            Posts list coming soon...
          </p>
        </div>
      </div>
    </MainLayout>
  );
}

