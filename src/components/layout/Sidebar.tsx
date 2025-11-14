"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileEdit,
  History,
  Settings,
  LayoutTemplate,
  User,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

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
  const [showProfileMenu, setShowProfileMenu] = useState(false);

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
            <Link
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
            </Link>
          );
        })}
      </nav>

      {/* Profile section */}
      <div className="border-t border-sidebar-border p-4">
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
              "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              "focus:outline-none focus:ring-2 focus:ring-accent",
              "text-sidebar-foreground"
            )}
            aria-label="Profile menu"
          >
            <User className="h-5 w-5 shrink-0" />
            {!isCollapsed && (
              <>
                <span className="flex-1 text-left">Profile</span>
                <span className="text-xs text-muted-foreground">▼</span>
              </>
            )}
          </button>

          {showProfileMenu && !isCollapsed && (
            <div className="absolute bottom-full left-0 mb-2 w-full rounded-lg border border-sidebar-border bg-sidebar p-1 shadow-lg">
              <button
                onClick={() => {
                  // Mock logout - just close menu for now
                  setShowProfileMenu(false);
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

