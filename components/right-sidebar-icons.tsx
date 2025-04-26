"use client";

import { User } from "lucide-react";
import { SparklesIcon } from "@/components/icons";
import { cn } from "@/lib/utils";
import { socialLinks } from "./right-sidebar";
import Link from "next/link";

interface RightSidebarIconsProps {
  hasStarterKit: boolean;
  onStarterKitClick: () => void;
  starterKitLoading: boolean;
}

export function RightSidebarIcons({ hasStarterKit, onStarterKitClick, starterKitLoading }: RightSidebarIconsProps) {
  return (
    <div className="flex items-center justify-center gap-3 mb-3">
      {/* Dashboard Icon */}
      <Link href="/profile" legacyBehavior>
        <a className="flex items-center justify-center size-8 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" title="Dashboard">
          <span className="size-4 text-green-600 dark:text-green-400 flex items-center justify-center"><User size={16} /></span>
        </a>
      </Link>
      {/* Social Icons */}
      {socialLinks.map((link) => (
        <a
          key={link.name}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center size-8 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          title={link.name}
        >
          <span className={cn("size-4 flex items-center justify-center", link.color)}><link.icon size={16} /></span>
        </a>
      ))}
      {/* Starter Kit Icon Only */}
      <button
        type="button"
        className={cn(
          "relative size-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors",
          { "animate-pulse": !hasStarterKit && !starterKitLoading }
        )}
        onClick={onStarterKitClick}
        disabled={starterKitLoading}
        title={hasStarterKit ? "You have a starter kit" : "Ask the agent for a starter kit!"}
      >
        <span className="size-4 flex items-center justify-center"><SparklesIcon size={16} /></span>
        {!hasStarterKit && !starterKitLoading && (
          <span className="absolute -top-1 -right-1 flex size-3">
            <span className="animate-ping absolute inline-flex size-full rounded-full bg-sky-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full size-3 bg-sky-500"></span>
          </span>
        )}
      </button>
    </div>
  );
}
