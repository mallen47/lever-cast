"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Linkedin } from "lucide-react";

function XLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 1200 1227"
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      <path d="M714.163 519.284 1160.89 0H1059.1L667.137 450.887 355.681 0H0l468.492 681.821L0 1226.37h101.792l410.325-481.153L844.319 1226.37H1200L714.163 519.284ZM568.752 684.306l-47.556-67.86L138.6 79.755h170.783l305.024 435.288 47.556 67.86 409.219 583.941H900.397L568.752 684.306Z" />
    </svg>
  );
}

const platforms = [
  {
    id: "linkedin",
    label: "LinkedIn",
    icon: Linkedin,
  },
  {
    id: "x",
    label: "X",
    icon: XLogo,
  },
];

interface PlatformSelectorProps {
  selectedPlatforms: string[];
  onToggle: (platformId: string) => void;
}

export function PlatformSelector({
  selectedPlatforms,
  onToggle,
}: PlatformSelectorProps) {
  return (
    <div className="space-y-3">
      <Label className="text-base font-semibold">Select Platforms</Label>
      <div className="flex flex-wrap gap-3">
        {platforms.map((platform) => {
          const Icon = platform.icon;
          const isSelected = selectedPlatforms.includes(platform.id);
          return (
            <Button
              key={platform.id}
              type="button"
              variant={isSelected ? "default" : "outline"}
              className={cn(
                "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                isSelected
                  ? "bg-accent text-accent-foreground hover:bg-accent/90"
                  : "border-border text-muted-foreground hover:text-foreground"
              )}
              onClick={() => onToggle(platform.id)}
            >
              <Icon className="h-4 w-4" />
              <span>{platform.label}</span>
            </Button>
          );
        })}
      </div>
      <p className="text-sm text-muted-foreground">
        Choose which platforms you'd like to publish to. We'll add more options
        soon.
      </p>
    </div>
  );
}


