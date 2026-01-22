"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import type { SentimentSummary, SentimentType, Topic } from "@/types";

interface ResultsOverviewProps {
  sentiment: SentimentSummary;
  totalComments: number;
  topics: Topic[];
  className?: string;
}

const SENTIMENT_HEADLINES: Record<SentimentType, string> = {
  positive: "Mostly positive",
  negative: "Mostly negative",
  suggestion: "Suggestion-focused",
  neutral: "Mostly neutral",
};

function formatMentions(count: number): string {
  const label = count === 1 ? "mention" : "mentions";
  return `${count} ${label}`;
}

function getNetLabel(netSentiment: number): string {
  if (netSentiment === 0) {
    return "Balanced";
  }
  if (netSentiment > 0) {
    return `+${netSentiment}`;
  }
  return `${netSentiment}`;
}

function getNetDetail(netSentiment: number): string {
  if (netSentiment === 0) {
    return "Positive and negative are even";
  }
  if (netSentiment > 0) {
    return "More positive than negative";
  }
  return "More negative than positive";
}

function getSuggestionStatus(count: number): string {
  if (count === 0) {
    return "None detected";
  }
  return `${count} comment${count === 1 ? "" : "s"}`;
}

function getSuggestionDetail(count: number, percent: number): string {
  if (count === 0) {
    return "No suggestion comments";
  }
  return `${percent}% of comments`;
}

function getHeadline(
  hasComments: boolean,
  dominantSentiment: SentimentType,
  percentages: Record<SentimentType, number>
): string {
  if (!hasComments) {
    return "No comments analyzed";
  }
  return `${SENTIMENT_HEADLINES[dominantSentiment]} (${percentages[dominantSentiment]}%)`;
}

function getBreakdown(
  hasComments: boolean,
  percentages: Record<SentimentType, number>
): string {
  if (!hasComments) {
    return "No comments were analyzed for this video.";
  }
  return `${percentages.positive}% positive, ${percentages.negative}% negative, ${percentages.suggestion}% suggestions, ${percentages.neutral}% neutral.`;
}

export function ResultsOverview({
  sentiment,
  totalComments,
  topics,
  className,
}: ResultsOverviewProps): JSX.Element {
  const hasComments = totalComments > 0;
  const totalForPercent = hasComments ? totalComments : 1;

  const percentages = {
    positive: Math.round((sentiment.positive_count / totalForPercent) * 100),
    negative: Math.round((sentiment.negative_count / totalForPercent) * 100),
    suggestion: Math.round((sentiment.suggestion_count / totalForPercent) * 100),
    neutral: Math.round((sentiment.neutral_count / totalForPercent) * 100),
  };

  const dominantSentiment = useMemo<SentimentType>(() => {
    const entries: Array<{ key: SentimentType; count: number }> = [
      { key: "positive", count: sentiment.positive_count },
      { key: "negative", count: sentiment.negative_count },
      { key: "suggestion", count: sentiment.suggestion_count },
      { key: "neutral", count: sentiment.neutral_count },
    ];
    return entries.reduce((best, current) => (
      current.count > best.count ? current : best
    )).key;
  }, [sentiment]);

  const topTopic = useMemo(() => {
    if (topics.length === 0) {
      return null;
    }
    return topics.reduce((best, topic) => (
      topic.mention_count > best.mention_count ? topic : best
    ));
  }, [topics]);

  const netSentiment = sentiment.positive_count - sentiment.negative_count;
  const netLabel = getNetLabel(netSentiment);
  const netDetail = getNetDetail(netSentiment);
  const suggestionStatus = getSuggestionStatus(sentiment.suggestion_count);
  const suggestionDetail = getSuggestionDetail(sentiment.suggestion_count, percentages.suggestion);
  const headline = getHeadline(hasComments, dominantSentiment, percentages);
  const breakdown = getBreakdown(hasComments, percentages);

  return (
    <div
      className={cn(
        "rounded-xl border border-stone-200 bg-white p-5 shadow-sm",
        className
      )}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <p className="text-[11px] uppercase tracking-wider text-stone-500">
            At a glance
          </p>
          <h2 className="font-display text-lg font-semibold text-stone-800">
            {headline}
          </h2>
          <p className="text-sm text-stone-600">
            {breakdown}
            {hasComments && (
              <span className="ml-1">
                Based on {totalComments.toLocaleString()} comments.
              </span>
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-stone-100 bg-stone-50/70 p-3">
            <p className="text-[11px] uppercase tracking-wider text-stone-500">
              Net tone
            </p>
            <p className="font-display text-lg font-semibold text-stone-800">
              {netLabel}
            </p>
            <p className="text-xs text-stone-500">{netDetail}</p>
          </div>

          <div className="rounded-lg border border-stone-100 bg-stone-50/70 p-3">
            <p className="text-[11px] uppercase tracking-wider text-stone-500">
              Top topic
            </p>
            <p
              className="text-sm font-semibold text-stone-800 truncate"
              title={topTopic ? (topTopic.phrase || topTopic.name) : undefined}
            >
              {topTopic ? (topTopic.phrase || topTopic.name) : "No topics detected"}
            </p>
            <p className="text-xs text-stone-500">
              {topTopic ? formatMentions(topTopic.mention_count) : "No topic data"}
            </p>
          </div>

          <div className="rounded-lg border border-stone-100 bg-stone-50/70 p-3">
            <p className="text-[11px] uppercase tracking-wider text-stone-500">
              Suggestions
            </p>
            <p className="text-sm font-semibold text-stone-800">
              {suggestionStatus}
            </p>
            <p className="text-xs text-stone-500">{suggestionDetail}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
