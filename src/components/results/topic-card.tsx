"use client";

import * as React from "react";
import { MessageSquare, ThumbsUp, AlertTriangle, Lightbulb, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { Topic, PriorityLevel, SentimentType } from "@/types";

interface TopicCardProps {
  topic: Topic;
  isSelected?: boolean;
  onClick?: () => void;
}

const SENTIMENT_CONFIG = {
  positive: {
    icon: Heart,
    bg: "bg-emerald-50",
    border: "border-emerald-200 hover:border-emerald-300",
    selectedBorder: "ring-2 ring-emerald-400",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    label: "Love",
  },
  negative: {
    icon: AlertTriangle,
    bg: "bg-rose-50",
    border: "border-rose-200 hover:border-rose-300",
    selectedBorder: "ring-2 ring-rose-400",
    iconBg: "bg-rose-100",
    iconColor: "text-rose-600",
    label: "Dislike",
  },
  suggestion: {
    icon: Lightbulb,
    bg: "bg-blue-50",
    border: "border-blue-200 hover:border-blue-300",
    selectedBorder: "ring-2 ring-blue-400",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    label: "Suggestion",
  },
  neutral: {
    icon: MessageSquare,
    bg: "bg-slate-50",
    border: "border-slate-200 hover:border-slate-300",
    selectedBorder: "ring-2 ring-slate-400",
    iconBg: "bg-slate-100",
    iconColor: "text-slate-600",
    label: "Neutral",
  },
};

const PRIORITY_CONFIG = {
  high: { bg: "bg-red-100", text: "text-red-700", label: "High Priority" },
  medium: { bg: "bg-amber-100", text: "text-amber-700", label: "Medium" },
  low: { bg: "bg-slate-100", text: "text-slate-600", label: "Low" },
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
        "flex flex-col rounded-lg border p-3 text-left transition-all w-56 flex-shrink-0",
        config.bg,
        config.border,
        isSelected && config.selectedBorder
      )}
    >
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
              "text-[9px] px-1.5 py-0 font-medium",
              priorityConfig.bg,
              priorityConfig.text
            )}
          >
            {priorityConfig.label}
          </Badge>
        )}
      </div>

      {/* Topic Name */}
      <h4 className="font-semibold text-sm leading-tight mb-1 line-clamp-2">
        {topic.name}
      </h4>

      {/* Keywords */}
      <div className="flex flex-wrap gap-1 mb-2">
        {topic.keywords.slice(0, 3).map((keyword, index) => (
          <span
            key={index}
            className="px-1.5 py-0.5 text-[9px] rounded bg-white/60 text-slate-600"
          >
            {keyword}
          </span>
        ))}
      </div>

      {/* Stats */}
      <div className="flex items-center gap-3 mt-auto pt-2 border-t border-current/10">
        <div className="flex items-center gap-1">
          <MessageSquare className="h-3 w-3 text-muted-foreground" />
          <span className="text-[10px] tabular-nums font-medium">
            {topic.mention_count}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <ThumbsUp className="h-3 w-3 text-muted-foreground" />
          <span className="text-[10px] tabular-nums font-medium">
            {topic.total_engagement.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Recommendation Preview */}
      {topic.recommendation && (
        <p className="text-[10px] text-muted-foreground mt-2 line-clamp-2">
          {topic.recommendation}
        </p>
      )}
    </button>
  );
}
