"use client";

import { Heart, AlertTriangle, Lightbulb, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SentimentType, SentimentSummaryText, Topic } from "@/types";

interface SummaryCardProps {
  sentiment: SentimentType;
  summary?: SentimentSummaryText | null;
  topics: Topic[];
  commentCount: number;
  totalLikes: number;
  className?: string;
}

const sentimentConfig = {
  positive: {
    label: "Positive",
    icon: Heart,
    borderColor: "border-l-[#2D7A5E]",
    bgColor: "bg-[#2D7A5E]/5",
    iconColor: "text-[#2D7A5E]",
    headerBg: "bg-[#2D7A5E]",
  },
  negative: {
    label: "Negative",
    icon: AlertTriangle,
    borderColor: "border-l-[#C44536]",
    bgColor: "bg-[#C44536]/5",
    iconColor: "text-[#C44536]",
    headerBg: "bg-[#C44536]",
  },
  suggestion: {
    label: "Suggestions",
    icon: Lightbulb,
    borderColor: "border-l-[#4A7C9B]",
    bgColor: "bg-[#4A7C9B]/5",
    iconColor: "text-[#4A7C9B]",
    headerBg: "bg-[#4A7C9B]",
  },
  neutral: {
    label: "Neutral",
    icon: MessageSquare,
    borderColor: "border-l-[#6B7280]",
    bgColor: "bg-[#6B7280]/5",
    iconColor: "text-[#6B7280]",
    headerBg: "bg-[#6B7280]",
  },
};

export function SummaryCard({
  sentiment,
  summary,
  topics,
  commentCount,
  totalLikes,
  className,
}: SummaryCardProps) {
  const config = sentimentConfig[sentiment];
  const Icon = config.icon;

  // Get topics for this sentiment
  const sentimentTopics = topics
    .filter((t) => t.sentiment_category === sentiment)
    .slice(0, 5);

  const hasEnoughData = commentCount >= 5;

  return (
    <div
      className={cn(
        "rounded-xl border border-[#E8E4DC] bg-white overflow-hidden card-hover",
        className
      )}
    >
      {/* Header */}
      <div className={cn("px-4 py-3 flex items-center gap-3", config.headerBg)}>
        <Icon className="h-5 w-5 text-white" />
        <h3 className="font-semibold text-white">{config.label}</h3>
        <span className="ml-auto text-sm text-white/80 font-mono">
          {commentCount} comments
        </span>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Top Themes */}
        <div>
          <h4 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-2">
            Top Themes
          </h4>
          {sentimentTopics.length > 0 ? (
            <ul className="space-y-1">
              {sentimentTopics.map((topic) => (
                <li
                  key={topic.id}
                  className="text-sm text-[#1E3A5F] flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current opacity-40" />
                  <span className="truncate">{topic.phrase || topic.name}</span>
                  <span className="text-xs text-[#6B7280] ml-auto">
                    {topic.mention_count}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-[#6B7280] italic">No topics detected</p>
          )}
        </div>

        {/* Evidence */}
        <div>
          <h4 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-2">
            Evidence
          </h4>
          <p className="text-sm text-[#1E3A5F]">
            {commentCount} comments, {totalLikes.toLocaleString()} total likes
          </p>
        </div>

        {/* Summary / Action */}
        <div>
          <h4 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-2">
            Summary
          </h4>
          {hasEnoughData && summary?.summary ? (
            <p className="text-sm text-[#1E3A5F] leading-relaxed">
              {summary.summary}
            </p>
          ) : (
            <p className="text-sm text-[#6B7280] italic">
              {hasEnoughData
                ? "AI summary unavailable"
                : "Not enough data for a reliable summary (need 5+ comments)"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
