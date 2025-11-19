'use client';

import { LinkedInPreview } from "@/components/previews/LinkedInPreview";
import { XPreview } from "@/components/previews/XPreview";

interface PreviewContainerProps {
  linkedInContent: string;
  xContent: string;
  imageUrl?: string;
  selectedPlatforms: string[];
}

export function PreviewContainer({
  linkedInContent,
  xContent,
  imageUrl,
  selectedPlatforms,
}: PreviewContainerProps) {
  const showLinkedIn = selectedPlatforms.includes("linkedin");
  const showX = selectedPlatforms.includes("x");
  const hasSelection = showLinkedIn || showX;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Preview</h2>
      {hasSelection ? (
        <div className="grid gap-6 md:grid-cols-2">
          {showLinkedIn && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <span className="h-3 w-3 rounded-full bg-[#0077b5]" />
                LinkedIn
              </div>
              <LinkedInPreview content={linkedInContent} imageUrl={imageUrl} />
            </div>
          )}
          {showX && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <span className="h-3 w-3 rounded-full bg-black dark:bg-white" />
                X
              </div>
              <XPreview content={xContent} imageUrl={imageUrl} />
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Select at least one platform to see the preview.
        </p>
      )}
    </div>
  );
}

