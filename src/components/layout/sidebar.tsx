"use client";

import * as React from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  History,
  Cpu,
  Activity,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import type { AnalysisHistoryItem } from "@/types";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  history: AnalysisHistoryItem[];
  isLoadingHistory: boolean;
  onNewAnalysis: () => void;
  onSelectHistory: (item: AnalysisHistoryItem) => void;
  selectedId?: number;
  isAnalyzing: boolean;
  mlStatus: "ready" | "processing" | "idle";
}

export function Sidebar({
  isCollapsed,
  onToggle,
  history,
  isLoadingHistory,
  onNewAnalysis,
  onSelectHistory,
  selectedId,
  isAnalyzing,
  mlStatus,
}: SidebarProps) {
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div
      className={cn(
        "relative flex h-full flex-col border-r bg-[#FAFAFA] transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-3 top-6 z-10 h-6 w-6 rounded-full border bg-white shadow-sm"
        onClick={onToggle}
      >
        {isCollapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </Button>

      {/* New Analysis Button */}
      <div className="p-3">
        <Button
          onClick={onNewAnalysis}
          disabled={isAnalyzing}
          className={cn(
            "w-full bg-indigo-600 hover:bg-indigo-700 text-white",
            isCollapsed && "px-0"
          )}
        >
          <Plus className="h-4 w-4" />
          {!isCollapsed && <span className="ml-2">New Analysis</span>}
        </Button>
      </div>

      <Separator />

      {/* History Section */}
      {!isCollapsed && (
        <div className="px-3 py-2">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            <History className="h-3 w-3" />
            History
          </div>
        </div>
      )}

      <ScrollArea className="flex-1 px-2">
        {isLoadingHistory ? (
          <div className="space-y-2 p-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="h-9 w-16 rounded" />
                {!isCollapsed && (
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-2 w-2/3" />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-1 py-2">
            {history.map((item) => (
              <button
                key={item.id}
                onClick={() => onSelectHistory(item)}
                className={cn(
                  "w-full flex items-center gap-2 rounded-lg p-2 text-left transition-colors hover:bg-white",
                  selectedId === item.id && "bg-white shadow-sm ring-1 ring-border"
                )}
              >
                {item.video_thumbnail ? (
                  <img
                    src={item.video_thumbnail}
                    alt=""
                    className="h-9 w-16 rounded object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="h-9 w-16 rounded bg-slate-200 flex-shrink-0" />
                )}
                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate leading-tight">
                      {item.video_title}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Clock className="h-2.5 w-2.5 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground">
                        {formatTimeAgo(item.analyzed_at)}
                      </span>
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </ScrollArea>

      <Separator />

      {/* ML Status Section */}
      <div className={cn("p-3", isCollapsed && "flex justify-center")}>
        {isCollapsed ? (
          <div
            className={cn(
              "h-8 w-8 rounded-full flex items-center justify-center",
              mlStatus === "ready" && "bg-emerald-100 text-emerald-600",
              mlStatus === "processing" && "bg-indigo-100 text-indigo-600 animate-pulse",
              mlStatus === "idle" && "bg-slate-100 text-slate-400"
            )}
          >
            <Cpu className="h-4 w-4" />
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              <Cpu className="h-3 w-3" />
              ML Pipeline
            </div>
            <div className="rounded-lg bg-white p-2.5 border">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Status</span>
                <div className="flex items-center gap-1.5">
                  <div
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      mlStatus === "ready" && "bg-emerald-500",
                      mlStatus === "processing" && "bg-indigo-500 animate-pulse",
                      mlStatus === "idle" && "bg-slate-300"
                    )}
                  />
                  <span
                    className={cn(
                      "text-xs font-medium capitalize",
                      mlStatus === "ready" && "text-emerald-600",
                      mlStatus === "processing" && "text-indigo-600",
                      mlStatus === "idle" && "text-slate-400"
                    )}
                  >
                    {mlStatus}
                  </span>
                </div>
              </div>
              <Separator className="my-2" />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Model</span>
                <span className="text-[10px] font-mono text-slate-600 truncate max-w-[100px]">
                  BERT-sentiment
                </span>
              </div>
              {mlStatus === "processing" && (
                <>
                  <Separator className="my-2" />
                  <div className="flex items-center gap-1.5">
                    <Activity className="h-3 w-3 text-indigo-500 animate-pulse" />
                    <span className="text-[10px] text-indigo-600">
                      Processing...
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
