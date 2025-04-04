"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MessageSquare, Settings, Home } from "lucide-react";

interface SidebarNavItemProps {
  href: string;
  title: string;
  icon: React.ReactNode;
}

export function SidebarNavItem({ href, title, icon }: SidebarNavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link href={href} passHref>
      <Button
        variant={isActive ? "secondary" : "ghost"}
        className={cn(
          "w-full justify-start gap-2",
          isActive ? "bg-secondary" : "hover:bg-secondary/50",
        )}
      >
        {icon}
        <span>{title}</span>
      </Button>
    </Link>
  );
}

export function Sidebar() {
  return (
    <div className="flex h-full flex-col border-r p-4">
      <div className="space-y-2">
        <SidebarNavItem
          href="/dashboard"
          title="Dashboard"
          icon={<Home size={18} />}
        />
        <SidebarNavItem
          href="/chat"
          title="Chat"
          icon={<MessageSquare size={18} />}
        />
        <SidebarNavItem
          href="/settings"
          title="Settings"
          icon={<Settings size={18} />}
        />
      </div>
    </div>
  );
}
