import { MainLayout } from "@/components/layout/MainLayout";

export default function EditPostPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">New Post</h1>
          <p className="mt-2 text-muted-foreground">
            Enter your content ideas and generate platform-specific formats.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <p className="text-muted-foreground">
            Content creation interface coming soon...
          </p>
        </div>
      </div>
    </MainLayout>
  );
}

