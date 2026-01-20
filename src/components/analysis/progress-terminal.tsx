"use client";

import * as React from "react";
import {
  Terminal,
  CheckCircle2,
  Circle,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { AnalysisStage, ProgressEvent } from "@/types";

interface ProgressTerminalProps {
  currentStage: AnalysisStage;
  progress: number;
  logs: ProgressEvent[];
  videoTitle?: string;
  commentsFound?: number;
  commentsAnalyzed?: number;
}

const STAGES: { id: AnalysisStage; label: string; icon: string }[] = [
  { id: "validating", label: "Validating URL", icon: "link" },
  { id: "fetching_metadata", label: "Fetching Metadata", icon: "film" },
  { id: "extracting_comments", label: "Extracting Comments", icon: "message-square" },
  { id: "analyzing_sentiment", label: "Analyzing Sentiment", icon: "brain" },
  { id: "detecting_topics", label: "Detecting Topics", icon: "tags" },
  { id: "generating_insights", label: "Generating Insights", icon: "sparkles" },
];

export function ProgressTerminal({
  currentStage,
  progress,
  logs,
  videoTitle,
  commentsFound,
  commentsAnalyzed,
}: ProgressTerminalProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const getStageStatus = (stageId: AnalysisStage) => {
    const stageIndex = STAGES.findIndex((s) => s.id === stageId);
    const currentIndex = STAGES.findIndex((s) => s.id === currentStage);

    if (currentStage === "complete") return "complete";
    if (currentStage === "error") {
      if (stageIndex < currentIndex) return "complete";
      if (stageIndex === currentIndex) return "error";
      return "pending";
    }
    if (stageIndex < currentIndex) return "complete";
    if (stageIndex === currentIndex) return "active";
    return "pending";
  };

  const formatTimestamp = () => {
    return new Date().toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div className="h-full flex flex-col rounded-lg border bg-slate-900 text-white overflow-hidden">
      {/* Terminal Header */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 border-b border-slate-700">
        <div className="flex gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
          <div className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
          <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
        </div>
        <Terminal className="h-3.5 w-3.5 text-slate-400 ml-2" />
        <span className="text-xs text-slate-400 font-mono">
          vidinsight-analysis
        </span>
      </div>

      {/* Progress Bar */}
      <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-slate-400">Overall Progress</span>
          <span className="text-xs font-mono text-emerald-400">
            {Math.round(progress)}%
          </span>
        </div>
        <Progress value={progress} className="h-1.5 bg-slate-700" />
      </div>

      {/* Stage Indicators */}
      <div className="px-4 py-3 border-b border-slate-700 bg-slate-800/30">
        <div className="grid grid-cols-6 gap-2">
          {STAGES.map((stage) => {
            const status = getStageStatus(stage.id);
            return (
              <div key={stage.id} className="text-center">
                <div
                  className={cn(
                    "h-7 w-7 rounded-full flex items-center justify-center mx-auto mb-1",
                    status === "complete" && "bg-emerald-500/20",
                    status === "active" && "bg-indigo-500/20",
                    status === "error" && "bg-red-500/20",
                    status === "pending" && "bg-slate-700"
                  )}
                >
                  {status === "complete" && (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  )}
                  {status === "active" && (
                    <Loader2 className="h-4 w-4 text-indigo-400 animate-spin" />
                  )}
                  {status === "error" && (
                    <AlertCircle className="h-4 w-4 text-red-400" />
                  )}
                  {status === "pending" && (
                    <Circle className="h-3 w-3 text-slate-500" />
                  )}
                </div>
                <span
                  className={cn(
                    "text-[9px] leading-tight block",
                    status === "complete" && "text-emerald-400",
                    status === "active" && "text-indigo-400",
                    status === "error" && "text-red-400",
                    status === "pending" && "text-slate-500"
                  )}
                >
                  {stage.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Stats */}
      {(videoTitle || commentsFound || commentsAnalyzed) && (
        <div className="px-4 py-2 border-b border-slate-700 flex items-center gap-4 text-xs">
          {videoTitle && (
            <span className="text-slate-400 truncate max-w-[200px]">
              <span className="text-slate-500">Video:</span> {videoTitle}
            </span>
          )}
          {commentsFound !== undefined && (
            <span className="text-emerald-400 tabular-nums">
              <span className="text-slate-500">Found:</span> {commentsFound.toLocaleString()}
            </span>
          )}
          {commentsAnalyzed !== undefined && commentsFound !== undefined && (
            <span className="text-indigo-400 tabular-nums">
              <span className="text-slate-500">Analyzed:</span>{" "}
              {commentsAnalyzed.toLocaleString()}/{commentsFound.toLocaleString()}
            </span>
          )}
        </div>
      )}

      {/* Log Output */}
      <ScrollArea className="flex-1 min-h-0">
        <div ref={scrollRef} className="p-4 font-mono text-xs space-y-1">
          {logs.map((log, index) => (
            <div key={index} className="flex gap-2">
              <span className="text-slate-500 flex-shrink-0">
                [{formatTimestamp()}]
              </span>
              <span
                className={cn(
                  log.stage === "error" && "text-red-400",
                  log.stage === "complete" && "text-emerald-400",
                  !["error", "complete"].includes(log.stage) && "text-slate-300"
                )}
              >
                {log.message}
              </span>
            </div>
          ))}
          {currentStage !== "complete" && currentStage !== "error" && (
            <div className="flex gap-2 animate-pulse">
              <span className="text-slate-500">[{formatTimestamp()}]</span>
              <span className="text-indigo-400">Processing...</span>
              <span className="inline-block animate-bounce">_</span>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
