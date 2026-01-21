"use client";

import * as React from "react";
import { ThumbsUp, User, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { getHighlightedSegments } from "@/lib/highlight-words";
import type { Comment, SentimentType } from "@/types";

interface CommentCardProps {
  comment: Comment;
  topicName?: string;
  confidence?: number;
  showHighlighting?: boolean;
}

// Editorial design palette - warm and sophisticated
const SENTIMENT_COLORS = {
  positive: {
    bg: "bg-white",
    tint: "bg-emerald-50/40",
    border: "border-l-4 border-l-emerald-500 border-stone-200",
    text: "text-emerald-700",
    badge: "bg-emerald-100 text-emerald-700",
  },
  negative: {
    bg: "bg-white",
    tint: "bg-rose-50/40",
    border: "border-l-4 border-l-rose-500 border-stone-200",
    text: "text-rose-700",
    badge: "bg-rose-100 text-rose-700",
  },
  suggestion: {
    bg: "bg-white",
    tint: "bg-blue-50/40",
    border: "border-l-4 border-l-blue-500 border-stone-200",
    text: "text-blue-700",
    badge: "bg-blue-100 text-blue-700",
  },
  neutral: {
    bg: "bg-white",
    tint: "bg-stone-50/40",
    border: "border-l-4 border-l-stone-400 border-stone-200",
    text: "text-stone-700",
    badge: "bg-stone-100 text-stone-700",
  },
};

const HIGHLIGHT_COLORS = {
  positive: "bg-emerald-100/80 text-emerald-800 rounded px-0.5",
  negative: "bg-rose-100/80 text-rose-800 rounded px-0.5",
  suggestion: "bg-blue-100/80 text-blue-800 rounded px-0.5",
  normal: "",
};

export function CommentCard({
  comment,
  topicName,
  confidence,
  showHighlighting = true,
}: CommentCardProps) {
  const sentiment = comment.sentiment || "neutral";
  const colors = SENTIMENT_COLORS[sentiment];

  const renderHighlightedText = () => {
    if (!showHighlighting) {
      return <span>{comment.text}</span>;
    }

    const segments = getHighlightedSegments(comment.text);

    return (
      <>
        {segments.map((segment, index) => (
          <span
            key={index}
            className={HIGHLIGHT_COLORS[segment.type]}
          >
            {segment.text}
          </span>
        ))}
      </>
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div
      className={cn(
        "relative rounded-xl border p-3 transition-all",
        "shadow-[0_2px_4px_rgba(28,25,23,0.05)]",
        "hover:shadow-[0_4px_8px_rgba(28,25,23,0.08)]",
        colors.bg,
        colors.border
      )}
    >
      {/* Subtle tint overlay */}
      <div className={cn("absolute inset-0 rounded-xl", colors.tint)} />

      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className={cn(
                "h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0",
                colors.badge
              )}
            >
              <User className="h-3 w-3" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium font-body truncate text-stone-800">{comment.author_name}</p>
              {comment.published_at && (
                <p className="text-[10px] text-stone-500 font-body">
                  {formatDate(comment.published_at)}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Confidence Badge */}
            {confidence !== undefined && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-body border-stone-300 text-stone-600">
                {(confidence * 100).toFixed(0)}%
              </Badge>
            )}

            {/* Sentiment Badge */}
            <Badge className={cn("text-[10px] px-1.5 py-0 font-body", colors.badge)}>
              {sentiment === "positive" && "Love"}
              {sentiment === "negative" && "Dislike"}
              {sentiment === "suggestion" && "Suggestion"}
              {sentiment === "neutral" && "Neutral"}
            </Badge>
          </div>
        </div>

        {/* Comment Text */}
        <p className="text-sm leading-relaxed font-body text-stone-700">{renderHighlightedText()}</p>

        {/* Footer */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-200/80">
          <div
            className={cn(
              "flex items-center gap-1",
              comment.like_count >= 100
                ? "text-amber-600 font-semibold"
                : comment.like_count >= 10
                ? "text-stone-600"
                : "text-stone-400"
            )}
          >
            <ThumbsUp
              className={cn(
                "h-3 w-3",
                comment.like_count >= 100 && "fill-amber-500"
              )}
            />
            <span className="text-[10px] tabular-nums">
              {comment.like_count.toLocaleString()}
            </span>
          </div>

          {topicName && (
            <div className="flex items-center gap-1">
              <Tag className="h-3 w-3 text-stone-400" />
              <span className="text-[10px] text-stone-500 font-body truncate max-w-[100px]">
                {topicName}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
