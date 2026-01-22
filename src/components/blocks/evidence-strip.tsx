"use client";

import { ThumbsUp, Quote } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Comment } from "@/types";

interface EvidenceStripProps {
  comments: Comment[];
  className?: string;
}

export function EvidenceStrip({ comments, className }: EvidenceStripProps) {
  if (comments.length === 0) {
    return null;
  }

  // Take top 3 comments by likes
  const topComments = comments.slice(0, 3);

  const getSentimentStyle = (sentiment: string | null) => {
    switch (sentiment) {
      case "positive":
        return "border-l-[#2D7A5E] bg-[#2D7A5E]/5";
      case "negative":
        return "border-l-[#C44536] bg-[#C44536]/5";
      case "suggestion":
        return "border-l-[#4A7C9B] bg-[#4A7C9B]/5";
      default:
        return "border-l-[#6B7280] bg-[#6B7280]/5";
    }
  };

  const truncateText = (text: string, maxLength: number = 80) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + "...";
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
        <Quote className="h-3.5 w-3.5" />
        <span>Top Evidence</span>
      </div>
      <div className="space-y-2">
        {topComments.map((comment) => (
          <div
            key={comment.id}
            className={cn(
              "p-3 rounded-lg border-l-4 transition-colors hover:brightness-95",
              getSentimentStyle(comment.sentiment)
            )}
          >
            <p className="text-sm text-[#1E3A5F] leading-relaxed">
              "{truncateText(comment.text)}"
            </p>
            <div className="mt-2 flex items-center gap-2 text-xs text-[#6B7280]">
              <ThumbsUp className="h-3 w-3" />
              <span className="font-medium">{comment.like_count.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
