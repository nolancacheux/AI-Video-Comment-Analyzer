"use client";

import { Brain, MessageSquare, Tags, Sparkles, CheckCircle2, Loader2, Clock, Zap, Database } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PipelineModels, ModelStage } from "@/types";

interface MLInfoPanelProps {
  isProcessing: boolean;
  pipelineModels: PipelineModels;
  processingSpeed?: number;
  tokensProcessed?: number;
  processingTimeSeconds?: number;
}

const stageLabels: Record<ModelStage, string> = {
  pending: "Waiting",
  loading: "Loading",
  active: "Processing",
  embedding: "Embedding",
  clustering: "Clustering",
  connecting: "Connecting",
  generating: "Generating",
  complete: "Complete",
  unavailable: "Unavailable",
};

function ModelCard({
  icon,
  label,
  modelName,
  stage,
  detail,
  color,
}: Readonly<{
  icon: React.ReactNode;
  label: string;
  modelName: string;
  stage: ModelStage;
  detail?: string;
  color: string;
}>): JSX.Element {
  const isActive = stage !== "pending" && stage !== "complete" && stage !== "unavailable";
  const isComplete = stage === "complete";
  const isUnavailable = stage === "unavailable";

  const renderIcon = (): React.ReactNode => {
    if (isComplete) {
      return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
    }
    if (isActive) {
      return <Loader2 className="h-4 w-4 animate-spin" style={{ color }} />;
    }
    return <span className={isUnavailable ? "text-slate-400" : "text-slate-500"}>{icon}</span>;
  };

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-2.5 rounded-lg border transition-all",
        isActive && "bg-[#D4714E]/5 border-[#D4714E]/20",
        isComplete && "bg-emerald-50/50 border-emerald-200/50",
        isUnavailable && "bg-slate-50 border-slate-200 opacity-60",
        !isActive && !isComplete && !isUnavailable && "bg-slate-50/50 border-slate-200/50"
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          "h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0",
          isActive && `bg-[${color}]/10`,
          isComplete && "bg-emerald-100",
          !isActive && !isComplete && "bg-slate-100"
        )}
        style={isActive ? { backgroundColor: `${color}15` } : undefined}
      >
        {renderIcon()}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-700">{label}</span>
          {isActive && (
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-[#D4714E]/10 text-[#D4714E]">
              {stageLabels[stage]}
            </span>
          )}
        </div>
        <p className="text-[10px] font-mono text-slate-500 truncate" title={modelName}>
          {formatModelName(modelName)}
        </p>
      </div>

      {/* Detail/Status */}
      <div className="text-right flex-shrink-0">
        {detail && isActive && (
          <span className="text-[10px] font-medium text-[#D4714E] tabular-nums">{detail}</span>
        )}
        {isComplete && <span className="text-[10px] font-medium text-emerald-600">Done</span>}
        {isUnavailable && <span className="text-[10px] text-slate-400">Skipped</span>}
      </div>
    </div>
  );
}

function formatModelName(name: string): string {
  const parts = name.split("/");
  return parts.at(-1) ?? name;
}

export function MLInfoPanel({
  isProcessing,
  pipelineModels,
  processingSpeed = 0,
  tokensProcessed = 0,
  processingTimeSeconds = 0,
}: Readonly<MLInfoPanelProps>): JSX.Element {
  const hasStarted = processingTimeSeconds > 0 || isProcessing;

  return (
    <div className="rounded-lg border bg-white overflow-hidden">
      {/* Header */}
      <div className="px-4 py-2.5 border-b bg-[#FAFAFA] flex items-center gap-2">
        <Brain className="h-4 w-4 text-[#D4714E]" />
        <h3 className="text-sm font-semibold tracking-tight">ML Pipeline</h3>
        {isProcessing && (
          <span className="ml-auto flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E08B6D] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D4714E]"></span>
            </span>
            <span className="text-[10px] text-[#D4714E] font-medium">Active</span>
          </span>
        )}
      </div>

      <div className="p-3 space-y-3">
        {/* Model Cards */}
        <div className="space-y-2">
          <ModelCard
            icon={<MessageSquare className="h-4 w-4" />}
            label="Sentiment Analysis"
            modelName={pipelineModels.sentiment.name}
            stage={pipelineModels.sentiment.stage}
            detail={pipelineModels.sentiment.detail}
            color="#2D7A5E"
          />
          <ModelCard
            icon={<Tags className="h-4 w-4" />}
            label="Topic Detection"
            modelName={pipelineModels.topics.name}
            stage={pipelineModels.topics.stage}
            detail={pipelineModels.topics.detail}
            color="#9B7B5B"
          />
          <ModelCard
            icon={<Sparkles className="h-4 w-4" />}
            label="AI Summaries"
            modelName={pipelineModels.summaries.name}
            stage={pipelineModels.summaries.stage}
            detail={pipelineModels.summaries.detail}
            color="#D4714E"
          />
        </div>

        {/* Stats - Only show when processing or after */}
        {hasStarted && (
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-slate-400">
                <Zap className="h-3 w-3" />
              </div>
              <p className="text-sm font-bold tabular-nums text-slate-700">
                {processingSpeed.toFixed(1)}
                <span className="text-[9px] font-normal text-slate-400">/s</span>
              </p>
              <p className="text-[9px] text-slate-400">Speed</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-slate-400">
                <Database className="h-3 w-3" />
              </div>
              <p className="text-sm font-bold tabular-nums text-slate-700">
                {tokensProcessed.toLocaleString()}
              </p>
              <p className="text-[9px] text-slate-400">Tokens</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-slate-400">
                <Clock className="h-3 w-3" />
              </div>
              <p className="text-sm font-bold tabular-nums text-slate-700">
                {processingTimeSeconds.toFixed(1)}s
              </p>
              <p className="text-[9px] text-slate-400">Time</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
