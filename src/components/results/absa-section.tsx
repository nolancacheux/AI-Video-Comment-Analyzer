"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type {
  ABSAResult,
  AspectType,
  ABSARecommendation,
  RecommendationPriority,
} from "@/types";
import { cn } from "@/lib/utils";

interface ABSASectionProps {
  absa: ABSAResult;
  className?: string;
}

const ASPECT_LABELS: Record<AspectType, string> = {
  content: "Content",
  audio: "Audio",
  production: "Production",
  pacing: "Pacing",
  presenter: "Presenter",
};

const ASPECT_ICONS: Record<AspectType, string> = {
  content: "📚",
  audio: "🔊",
  production: "🎬",
  pacing: "⏱️",
  presenter: "🎤",
};

const ASPECT_DESCRIPTIONS: Record<AspectType, string> = {
  content: "Information quality and explanations",
  audio: "Sound and voice clarity",
  production: "Video editing and visuals",
  pacing: "Video length and rhythm",
  presenter: "Personality and delivery",
};

const PRIORITY_COLORS: Record<RecommendationPriority, string> = {
  critical: "bg-red-100 text-red-700 border-red-300",
  high: "bg-orange-100 text-orange-700 border-orange-300",
  medium: "bg-amber-100 text-amber-700 border-amber-300",
  low: "bg-green-100 text-green-700 border-green-300",
};

const PRIORITY_ORDER: RecommendationPriority[] = ["critical", "high", "medium", "low"];

function getHealthColor(score: number): string {
  if (score >= 70) return "text-emerald-600";
  if (score >= 40) return "text-amber-600";
  return "text-rose-600";
}

function getHealthBg(score: number): string {
  if (score >= 70) return "bg-emerald-500";
  if (score >= 40) return "bg-amber-500";
  return "bg-rose-500";
}

function getSentimentColor(score: number): string {
  if (score >= 0.3) return "text-emerald-600";
  if (score >= -0.2) return "text-slate-600";
  return "text-rose-600";
}

function HealthScoreCard({ health }: { health: ABSAResult["health"] }) {
  return (
    <Card className="border-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Channel Health Score</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <div
            className={cn(
              "text-5xl font-bold",
              getHealthColor(health.overall_score)
            )}
          >
            {Math.round(health.overall_score)}
          </div>
          <div className="flex-1">
            <Progress
              value={health.overall_score}
              className="h-3"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {health.trend === "improving" && "Trending up"}
              {health.trend === "stable" && "Stable"}
              {health.trend === "declining" && "Needs attention"}
            </p>
          </div>
        </div>

        {(health.strengths.length > 0 || health.weaknesses.length > 0) && (
          <div className="grid grid-cols-2 gap-4 mt-4">
            {health.strengths.length > 0 && (
              <div>
                <p className="text-xs font-medium text-emerald-600 mb-1">Strengths</p>
                <div className="flex flex-wrap gap-1">
                  {health.strengths.map((aspect) => (
                    <Badge key={aspect} variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
                      {ASPECT_LABELS[aspect]}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {health.weaknesses.length > 0 && (
              <div>
                <p className="text-xs font-medium text-rose-600 mb-1">Areas to Improve</p>
                <div className="flex flex-wrap gap-1">
                  {health.weaknesses.map((aspect) => (
                    <Badge key={aspect} variant="outline" className="text-xs bg-rose-50 text-rose-700 border-rose-200">
                      {ASPECT_LABELS[aspect]}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function AspectCard({ aspect, stats }: { aspect: AspectType; stats: ABSAResult["aspect_stats"][AspectType] }) {
  const healthScore = ((stats.sentiment_score + 1) / 2) * 100;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card className="border hover:shadow-md transition-shadow cursor-default">
            <CardContent className="pt-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{ASPECT_ICONS[aspect]}</span>
                  <div>
                    <h4 className="font-medium">{ASPECT_LABELS[aspect]}</h4>
                    <p className="text-xs text-muted-foreground">
                      {stats.mention_count} mentions ({stats.mention_percentage.toFixed(0)}%)
                    </p>
                  </div>
                </div>
                <div className={cn("text-lg font-bold", getSentimentColor(stats.sentiment_score))}>
                  {stats.sentiment_score >= 0 ? "+" : ""}{(stats.sentiment_score * 100).toFixed(0)}
                </div>
              </div>

              <div className="mt-3">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Negative</span>
                  <span>Positive</span>
                </div>
                <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className={cn("h-full transition-all", getHealthBg(healthScore))}
                    style={{ width: `${healthScore}%` }}
                  />
                </div>
              </div>

              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <span className="text-rose-600">{stats.negative_count} neg</span>
                <span className="text-slate-600">{stats.neutral_count} neu</span>
                <span className="text-emerald-600">{stats.positive_count} pos</span>
              </div>
            </CardContent>
          </Card>
        </TooltipTrigger>
        <TooltipContent>
          <p>{ASPECT_DESCRIPTIONS[aspect]}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Confidence: {(stats.avg_confidence * 100).toFixed(0)}%
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function RecommendationCard({ recommendation }: { recommendation: ABSARecommendation }) {
  return (
    <Card className="border">
      <CardContent className="pt-4">
        <div className="flex items-start gap-3">
          <Badge
            variant="outline"
            className={cn("text-xs shrink-0", PRIORITY_COLORS[recommendation.priority])}
          >
            {recommendation.priority.toUpperCase()}
          </Badge>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium">{recommendation.title}</h4>
            <p className="text-sm text-muted-foreground mt-1">{recommendation.description}</p>
            <p className="text-xs text-muted-foreground mt-2 italic">{recommendation.evidence}</p>

            {recommendation.action_items.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-medium text-muted-foreground mb-1">Action items:</p>
                <ul className="text-xs space-y-1">
                  {recommendation.action_items.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-muted-foreground">-</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ABSASection({ absa, className }: ABSASectionProps) {
  const sortedRecommendations = [...absa.recommendations].sort(
    (a, b) => PRIORITY_ORDER.indexOf(a.priority) - PRIORITY_ORDER.indexOf(b.priority)
  );

  const aspects: AspectType[] = ["content", "audio", "production", "pacing", "presenter"];

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Aspect Analysis</h3>
          <p className="text-sm text-muted-foreground">
            How viewers feel about different aspects of your content
          </p>
        </div>
        {absa.dominant_aspects.length > 0 && (
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Most discussed</p>
            <div className="flex gap-1 justify-end">
              {absa.dominant_aspects.slice(0, 2).map((aspect) => (
                <Badge key={aspect} variant="secondary" className="text-xs">
                  {ASPECT_ICONS[aspect]} {ASPECT_LABELS[aspect]}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      <HealthScoreCard health={absa.health} />

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {aspects.map((aspect) => {
          const stats = absa.aspect_stats[aspect];
          if (!stats) return null;
          return <AspectCard key={aspect} aspect={aspect} stats={stats} />;
        })}
      </div>

      {absa.summary && (
        <Card className="bg-muted/30">
          <CardContent className="pt-4">
            <p className="text-sm">{absa.summary}</p>
          </CardContent>
        </Card>
      )}

      {sortedRecommendations.length > 0 && (
        <div>
          <h4 className="font-medium mb-3">Recommendations</h4>
          <div className="space-y-3">
            {sortedRecommendations.map((rec, idx) => (
              <RecommendationCard key={idx} recommendation={rec} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
