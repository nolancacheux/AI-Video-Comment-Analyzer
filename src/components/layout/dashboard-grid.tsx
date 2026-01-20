"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface DashboardGridProps {
  children: React.ReactNode;
  className?: string;
}

export function DashboardGrid({ children, className }: DashboardGridProps) {
  return (
    <div
      className={cn(
        "grid h-full gap-3 p-4",
        // Main grid layout: 3 columns for charts, then topics row, then comments row
        "grid-rows-[auto_1fr_1fr_1fr]",
        className
      )}
    >
      {children}
    </div>
  );
}

interface ChartRowProps {
  children: React.ReactNode;
  className?: string;
}

export function ChartRow({ children, className }: ChartRowProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-3 gap-3",
        className
      )}
    >
      {children}
    </div>
  );
}

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

export function ChartCard({
  title,
  subtitle,
  children,
  className,
  action,
}: ChartCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col rounded-lg border bg-white overflow-hidden",
        className
      )}
    >
      <div className="flex items-center justify-between px-4 py-2.5 border-b bg-[#FAFAFA]">
        <div>
          <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
          {subtitle && (
            <p className="text-[10px] text-muted-foreground mt-0.5">{subtitle}</p>
          )}
        </div>
        {action}
      </div>
      <div className="flex-1 p-3 min-h-0">{children}</div>
    </div>
  );
}

interface TopicsRowProps {
  children: React.ReactNode;
  className?: string;
}

export function TopicsRow({ children, className }: TopicsRowProps) {
  return (
    <div
      className={cn(
        "flex flex-col rounded-lg border bg-white overflow-hidden",
        className
      )}
    >
      {children}
    </div>
  );
}

interface CommentsRowProps {
  children: React.ReactNode;
  className?: string;
}

export function CommentsRow({ children, className }: CommentsRowProps) {
  return (
    <div
      className={cn(
        "flex flex-col rounded-lg border bg-white overflow-hidden",
        className
      )}
    >
      {children}
    </div>
  );
}

interface StatsGridProps {
  children: React.ReactNode;
  className?: string;
}

export function StatsGrid({ children, className }: StatsGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-4 gap-3",
        className
      )}
    >
      {children}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  color?: "emerald" | "rose" | "blue" | "slate" | "indigo";
  icon?: React.ReactNode;
}

export function StatCard({
  label,
  value,
  subValue,
  color = "slate",
  icon,
}: StatCardProps) {
  const colorClasses = {
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-700",
    rose: "bg-rose-50 border-rose-200 text-rose-700",
    blue: "bg-blue-50 border-blue-200 text-blue-700",
    slate: "bg-slate-50 border-slate-200 text-slate-700",
    indigo: "bg-indigo-50 border-indigo-200 text-indigo-700",
  };

  const valueColorClasses = {
    emerald: "text-emerald-600",
    rose: "text-rose-600",
    blue: "text-blue-600",
    slate: "text-slate-600",
    indigo: "text-indigo-600",
  };

  return (
    <div
      className={cn(
        "rounded-lg border px-3 py-2.5 flex items-center gap-3",
        colorClasses[color]
      )}
    >
      {icon && (
        <div className="flex-shrink-0 opacity-60">
          {icon}
        </div>
      )}
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wider font-medium opacity-70">
          {label}
        </p>
        <p
          className={cn(
            "text-xl font-bold tabular-nums tracking-tight",
            valueColorClasses[color]
          )}
        >
          {typeof value === "number" ? value.toLocaleString() : value}
        </p>
        {subValue && (
          <p className="text-[10px] opacity-60">{subValue}</p>
        )}
      </div>
    </div>
  );
}
