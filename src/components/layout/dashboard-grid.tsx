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
        "grid h-full gap-4 p-6",
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
    <div className={cn("grid grid-cols-3 gap-4", className)}>{children}</div>
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
        "flex flex-col rounded-xl bg-white overflow-hidden",
        "shadow-[0_4px_6px_rgba(28,25,23,0.07),0_2px_4px_rgba(28,25,23,0.05)]",
        "transition-shadow duration-150 hover:shadow-[0_10px_15px_rgba(28,25,23,0.1),0_4px_6px_rgba(28,25,23,0.05)]",
        className
      )}
    >
      <div className="flex items-center justify-between px-5 py-3 border-b border-stone-100">
        <div>
          <h3 className="font-display text-sm font-semibold text-stone-800 tracking-tight">
            {title}
          </h3>
          {subtitle && (
            <p className="text-[11px] text-stone-500 mt-0.5 font-body">
              {subtitle}
            </p>
          )}
        </div>
        {action}
      </div>
      <div className="flex-1 p-4 min-h-0">{children}</div>
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
        "flex flex-col rounded-xl bg-white overflow-hidden",
        "shadow-[0_4px_6px_rgba(28,25,23,0.07),0_2px_4px_rgba(28,25,23,0.05)]",
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
        "flex flex-col rounded-xl bg-white overflow-hidden",
        "shadow-[0_4px_6px_rgba(28,25,23,0.07),0_2px_4px_rgba(28,25,23,0.05)]",
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
    <div className={cn("grid grid-cols-4 gap-4", className)}>{children}</div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  color?: "love" | "dislike" | "suggestion" | "neutral";
  icon?: React.ReactNode;
}

export function StatCard({
  label,
  value,
  subValue,
  color = "neutral",
  icon,
}: StatCardProps) {
  // Editorial color scheme with warm, sophisticated tones
  const colorConfig = {
    love: {
      bg: "bg-white",
      border: "border-l-4 border-l-emerald-500",
      tint: "bg-emerald-50/50",
      value: "text-emerald-600",
      label: "text-emerald-700/80",
      iconBg: "bg-emerald-100",
    },
    dislike: {
      bg: "bg-white",
      border: "border-l-4 border-l-rose-500",
      tint: "bg-rose-50/50",
      value: "text-rose-600",
      label: "text-rose-700/80",
      iconBg: "bg-rose-100",
    },
    suggestion: {
      bg: "bg-white",
      border: "border-l-4 border-l-blue-500",
      tint: "bg-blue-50/50",
      value: "text-blue-600",
      label: "text-blue-700/80",
      iconBg: "bg-blue-100",
    },
    neutral: {
      bg: "bg-white",
      border: "border-l-4 border-l-stone-400",
      tint: "bg-stone-50/50",
      value: "text-stone-600",
      label: "text-stone-700/80",
      iconBg: "bg-stone-100",
    },
  };

  const config = colorConfig[color];

  return (
    <div
      className={cn(
        "relative rounded-xl overflow-hidden",
        "shadow-[0_4px_6px_rgba(28,25,23,0.07),0_2px_4px_rgba(28,25,23,0.05)]",
        "transition-all duration-150",
        "hover:shadow-[0_10px_15px_rgba(28,25,23,0.1),0_4px_6px_rgba(28,25,23,0.05)]",
        "hover:-translate-y-0.5",
        config.bg,
        config.border
      )}
    >
      {/* Subtle tint overlay */}
      <div className={cn("absolute inset-0", config.tint)} />

      <div className="relative px-5 py-4 flex flex-col">
        {/* Label with small caps */}
        <p
          className={cn(
            "small-caps text-[11px] font-medium tracking-wider mb-1",
            config.label
          )}
        >
          {label}
        </p>

        {/* Large number in display font */}
        <div className="flex items-baseline gap-2">
          <span
            className={cn(
              "font-display text-4xl font-bold tabular-nums tracking-tight",
              config.value
            )}
          >
            {typeof value === "number" ? value.toLocaleString() : value}
          </span>
          {subValue && (
            <span className="text-base font-body text-stone-500">
              {subValue}
            </span>
          )}
        </div>

        {/* Optional icon in corner */}
        {icon && (
          <div
            className={cn(
              "absolute top-3 right-3 p-2 rounded-lg opacity-30",
              config.iconBg
            )}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
