"use client";

import Link from "next/link";
import { ArrowRight, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { EvidenceStrip } from "@/components/blocks/evidence-strip";
import { SummaryCard } from "@/components/blocks/summary-card";
import { Button } from "@/components/ui/button";
import type { AnalysisResult, Comment } from "@/types";

interface OverviewContentProps {
  analysis: AnalysisResult;
  comments: Comment[];
}

export function OverviewContent({ analysis, comments }: OverviewContentProps) {
  const { sentiment, topics, summaries, total_comments } = analysis;

  // Calculate percentages
  const positivePercent = Math.round(
    (sentiment.positive_count / total_comments) * 100
  );
  const negativePercent = Math.round(
    (sentiment.negative_count / total_comments) * 100
  );
  const suggestionPercent = Math.round(
    (sentiment.suggestion_count / total_comments) * 100
  );
  const neutralPercent = Math.round(
    (sentiment.neutral_count / total_comments) * 100
  );

  // Determine dominant sentiment
  const dominantSentiment =
    sentiment.positive_count > sentiment.negative_count
      ? "positive"
      : sentiment.negative_count > sentiment.positive_count
        ? "negative"
        : "balanced";

  // Net tone
  const netTone = positivePercent - negativePercent;
  const toneLabel =
    netTone > 20
      ? "Very Positive"
      : netTone > 0
        ? "Positive"
        : netTone < -20
          ? "Very Negative"
          : netTone < 0
            ? "Negative"
            : "Balanced";

  // Top topic
  const topTopic = topics.length > 0
    ? topics.reduce((a, b) => (a.mention_count > b.mention_count ? a : b))
    : null;

  // Group comments by sentiment and sort by likes
  const commentsBySentiment = {
    positive: comments
      .filter((c) => c.sentiment === "positive")
      .sort((a, b) => b.like_count - a.like_count),
    negative: comments
      .filter((c) => c.sentiment === "negative")
      .sort((a, b) => b.like_count - a.like_count),
    suggestion: comments
      .filter((c) => c.sentiment === "suggestion")
      .sort((a, b) => b.like_count - a.like_count),
    neutral: comments
      .filter((c) => c.sentiment === "neutral")
      .sort((a, b) => b.like_count - a.like_count),
  };

  // Top evidence comments (one from each sentiment)
  const topEvidence = [
    ...commentsBySentiment.positive.slice(0, 1),
    ...commentsBySentiment.negative.slice(0, 1),
    ...commentsBySentiment.suggestion.slice(0, 1),
  ]
    .filter(Boolean)
    .sort((a, b) => b.like_count - a.like_count)
    .slice(0, 3);

  // Calculate total likes by sentiment
  const likesBySentiment = {
    positive: commentsBySentiment.positive.reduce((sum, c) => sum + c.like_count, 0),
    negative: commentsBySentiment.negative.reduce((sum, c) => sum + c.like_count, 0),
    suggestion: commentsBySentiment.suggestion.reduce((sum, c) => sum + c.like_count, 0),
    neutral: commentsBySentiment.neutral.reduce((sum, c) => sum + c.like_count, 0),
  };

  const ToneIcon =
    netTone > 0 ? TrendingUp : netTone < 0 ? TrendingDown : Minus;
  const toneColor =
    netTone > 0 ? "text-[#2D7A5E]" : netTone < 0 ? "text-[#C44536]" : "text-[#6B7280]";

  return (
    <div className="space-y-8">
      {/* Top Row: Narrative Summary + Evidence Strip */}
      <div className="grid grid-cols-3 gap-6 reveal stagger-1">
        {/* Narrative Summary */}
        <div className="col-span-2 rounded-xl border border-[#E8E4DC] bg-white p-6">
          <h2 className="text-xl font-display font-semibold text-[#1E3A5F] mb-4">
            At a Glance
          </h2>
          <div className="space-y-4">
            {/* Main insight */}
            <p className="text-lg text-[#1E3A5F] leading-relaxed">
              {dominantSentiment === "positive" && (
                <>
                  Audience reception is <span className="font-semibold text-[#2D7A5E]">mostly positive</span> ({positivePercent}%)
                  with viewers appreciating the content.
                </>
              )}
              {dominantSentiment === "negative" && (
                <>
                  Audience reception is <span className="font-semibold text-[#C44536]">mostly critical</span> ({negativePercent}%)
                  with viewers expressing concerns.
                </>
              )}
              {dominantSentiment === "balanced" && (
                <>
                  Audience reception is <span className="font-semibold text-[#6B7280]">balanced</span> with
                  a mix of positive and negative feedback.
                </>
              )}
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-4 pt-4 border-t border-[#E8E4DC]">
              <div>
                <p className="text-xs text-[#6B7280] uppercase tracking-wider mb-1">Breakdown</p>
                <p className="text-sm text-[#1E3A5F]">
                  <span className="text-[#2D7A5E]">{positivePercent}% positive</span>,{" "}
                  <span className="text-[#C44536]">{negativePercent}% negative</span>
                </p>
              </div>
              <div>
                <p className="text-xs text-[#6B7280] uppercase tracking-wider mb-1">Net Tone</p>
                <div className="flex items-center gap-1.5">
                  <ToneIcon className={`h-4 w-4 ${toneColor}`} />
                  <span className={`text-sm font-medium ${toneColor}`}>{toneLabel}</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-[#6B7280] uppercase tracking-wider mb-1">Top Topic</p>
                <p className="text-sm text-[#1E3A5F] truncate">
                  {topTopic ? `"${topTopic.phrase || topTopic.name}"` : "None"}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#6B7280] uppercase tracking-wider mb-1">Suggestions</p>
                <p className="text-sm text-[#4A7C9B]">
                  {sentiment.suggestion_count > 0
                    ? `${sentiment.suggestion_count} actionable`
                    : "None detected"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Evidence Strip */}
        <div className="rounded-xl border border-[#E8E4DC] bg-white p-4">
          <EvidenceStrip comments={topEvidence} />
        </div>
      </div>

      {/* Structured Summary Cards */}
      <div className="reveal stagger-2">
        <h2 className="text-lg font-display font-semibold text-[#1E3A5F] mb-4">
          Sentiment Breakdown
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <SummaryCard
            sentiment="positive"
            summary={summaries?.positive}
            topics={topics}
            commentCount={sentiment.positive_count}
            totalLikes={likesBySentiment.positive}
          />
          <SummaryCard
            sentiment="negative"
            summary={summaries?.negative}
            topics={topics}
            commentCount={sentiment.negative_count}
            totalLikes={likesBySentiment.negative}
          />
          <SummaryCard
            sentiment="suggestion"
            summary={summaries?.suggestion}
            topics={topics}
            commentCount={sentiment.suggestion_count}
            totalLikes={likesBySentiment.suggestion}
          />
        </div>
      </div>

      {/* Quick Navigation */}
      <div className="flex items-center justify-center gap-4 reveal stagger-3">
        <Button variant="outline" asChild className="gap-2">
          <Link href={`/analysis/${analysis.id}/topics`}>
            View Topics
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
        <Button variant="outline" asChild className="gap-2">
          <Link href={`/analysis/${analysis.id}/comments`}>
            Explore Comments
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
        <Button variant="outline" asChild className="gap-2">
          <Link href={`/analysis/${analysis.id}/charts`}>
            View Charts
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
