"use client";

import { usePathname } from "next/navigation";
import {
  FileEdit,
  History,
  Settings,
  LayoutTemplate,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NavLink } from "./NavLink";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const navigationItems = [
  {
    name: "New Post",
    href: "/edit-post",
    icon: FileEdit,
  },
  {
    name: "Recent Posts",
    href: "/posts",
    icon: History,
  },
  {
    name: "Templates",
    href: "/templates",
    icon: LayoutTemplate,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex flex-col border-r border-border bg-sidebar transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header with toggle button */}
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
        {!isCollapsed && (
          <h1 className="text-lg font-semibold text-sidebar-foreground">
            Levercast
          </h1>
        )}
        <button
          onClick={onToggle}
          className={cn(
            "ml-auto rounded-lg p-2 transition-colors",
            "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            "focus:outline-none focus:ring-2 focus:ring-accent"
          )}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <Menu className="h-5 w-5" />
          ) : (
            <X className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Navigation items */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <NavLink
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                "focus:outline-none focus:ring-2 focus:ring-accent",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!isCollapsed && <span>{item.name}</span>}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}

