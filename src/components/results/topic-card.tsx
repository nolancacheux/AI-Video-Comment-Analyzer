"use client";

import * as React from "react";
import { MessageSquare, ThumbsUp, AlertTriangle, Lightbulb, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { Topic } from "@/types";

interface TopicCardProps {
  topic: Topic;
  isSelected?: boolean;
  onClick?: () => void;
}

// Editorial design palette - warm and sophisticated
const SENTIMENT_CONFIG = {
  positive: {
    icon: Heart,
    bg: "bg-white",
    tint: "bg-emerald-50/50",
    border: "border-l-4 border-l-emerald-500 border-stone-200 hover:border-stone-300",
    selectedBorder: "ring-2 ring-emerald-400 ring-offset-1",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    label: "Love",
  },
  negative: {
    icon: AlertTriangle,
    bg: "bg-white",
    tint: "bg-rose-50/50",
    border: "border-l-4 border-l-rose-500 border-stone-200 hover:border-stone-300",
    selectedBorder: "ring-2 ring-rose-400 ring-offset-1",
    iconBg: "bg-rose-100",
    iconColor: "text-rose-600",
    label: "Dislike",
  },
  suggestion: {
    icon: Lightbulb,
    bg: "bg-white",
    tint: "bg-blue-50/50",
    border: "border-l-4 border-l-blue-500 border-stone-200 hover:border-stone-300",
    selectedBorder: "ring-2 ring-blue-400 ring-offset-1",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    label: "Suggestion",
  },
  neutral: {
    icon: MessageSquare,
    bg: "bg-white",
    tint: "bg-stone-50/50",
    border: "border-l-4 border-l-stone-400 border-stone-200 hover:border-stone-300",
    selectedBorder: "ring-2 ring-stone-400 ring-offset-1",
    iconBg: "bg-stone-100",
    iconColor: "text-stone-600",
    label: "Neutral",
  },
};

const PRIORITY_CONFIG = {
  high: { bg: "bg-rose-100", text: "text-rose-700", label: "High Priority" },
  medium: { bg: "bg-amber-100", text: "text-amber-700", label: "Medium" },
  low: { bg: "bg-stone-100", text: "text-stone-600", label: "Low" },
};

export function TopicCard({ topic, isSelected, onClick }: TopicCardProps) {
  const sentiment = topic.sentiment_category || "neutral";
  const config = SENTIMENT_CONFIG[sentiment];
  const Icon = config.icon;
  const priorityConfig = topic.priority ? PRIORITY_CONFIG[topic.priority] : null;

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex flex-col rounded-xl border p-3 text-left transition-all w-56 flex-shrink-0",
        "shadow-[0_2px_4px_rgba(28,25,23,0.05)]",
        "hover:shadow-[0_4px_8px_rgba(28,25,23,0.08)] hover:-translate-y-0.5",
        config.bg,
        config.border,
        isSelected && config.selectedBorder
      )}
    >
      {/* Subtle tint overlay */}
      <div className={cn("absolute inset-0 rounded-xl", config.tint)} />

      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div
            className={cn(
              "h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0",
              config.iconBg
            )}
          >
            <Icon className={cn("h-4 w-4", config.iconColor)} />
          </div>

          {priorityConfig && (
            <Badge
              className={cn(
                "text-[9px] px-1.5 py-0 font-medium font-body",
                priorityConfig.bg,
                priorityConfig.text
              )}
            >
              {priorityConfig.label}
            </Badge>
          )}
        </div>

        {/* Topic Name */}
        <h4 className="font-semibold font-display text-sm leading-tight mb-1 line-clamp-2 text-stone-800">
          {topic.name}
        </h4>

        {/* Keywords */}
        <div className="flex flex-wrap gap-1 mb-2">
          {topic.keywords.slice(0, 3).map((keyword, index) => (
            <span
              key={index}
              className="px-1.5 py-0.5 text-[9px] rounded bg-stone-100 text-stone-600 font-body"
            >
              {keyword}
            </span>
          ))}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 mt-auto pt-2 border-t border-stone-200/80">
          <div className="flex items-center gap-1">
            <MessageSquare className="h-3 w-3 text-stone-400" />
            <span className="text-[10px] tabular-nums font-medium text-stone-600">
              {topic.mention_count}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <ThumbsUp className="h-3 w-3 text-stone-400" />
            <span className="text-[10px] tabular-nums font-medium text-stone-600">
              {topic.total_engagement.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Recommendation Preview */}
        {topic.recommendation && (
          <p className="text-[10px] text-stone-500 font-body mt-2 line-clamp-2">
            {topic.recommendation}
          </p>
        )}
      </div>
    </button>
  );
}
