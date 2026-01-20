"use client";

import * as React from "react";
import {
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import type { AnalysisHistoryItem } from "@/types";

interface SidebarProps {
  history: AnalysisHistoryItem[];
  isLoadingHistory: boolean;
  onNewAnalysis: () => void;
  onSelectHistory: (item: AnalysisHistoryItem) => void;
  onDeleteHistory?: (id: number) => void;
  selectedId?: number;
  isAnalyzing: boolean;
}

export function Sidebar({
  history,
  isLoadingHistory,
  onNewAnalysis,
  onSelectHistory,
  onDeleteHistory,
  selectedId,
  isAnalyzing,
}: SidebarProps) {
  const [historyExpanded, setHistoryExpanded] = React.useState(true);

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

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (onDeleteHistory) {
      onDeleteHistory(id);
    }
  };

  return (
    <div className="flex h-full w-56 flex-col border-r bg-white">
      {/* New Analysis Button */}
      <div className="p-2">
        <Button
          onClick={onNewAnalysis}
          disabled={isAnalyzing}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-9"
        >
          <Plus className="h-4 w-4" />
          <span className="ml-2 text-sm">New Analysis</span>
        </Button>
      </div>

      {/* History Section */}
      <button
        onClick={() => setHistoryExpanded(!historyExpanded)}
        className="flex items-center justify-between px-3 py-2 hover:bg-slate-50 transition-colors"
      >
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
          History
        </span>
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-slate-400">{history.length}</span>
          {historyExpanded ? (
            <ChevronUp className="h-3 w-3 text-slate-400" />
          ) : (
            <ChevronDown className="h-3 w-3 text-slate-400" />
          )}
        </div>
      </button>

      {historyExpanded && (
        <ScrollArea className="flex-1 min-h-0">
          <div className="px-2 pb-2">
            {isLoadingHistory ? (
              <div className="space-y-1">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-lg" />
                ))}
              </div>
            ) : history.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">
                No analyses yet
              </p>
            ) : (
              <div className="space-y-1">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className={cn(
                      "group relative flex items-center gap-2 rounded-lg p-2 cursor-pointer transition-colors hover:bg-slate-50",
                      selectedId === item.id && "bg-indigo-50 ring-1 ring-indigo-200"
                    )}
                    onClick={() => onSelectHistory(item)}
                  >
                    {item.video_thumbnail ? (
                      <img
                        src={item.video_thumbnail}
                        alt=""
                        className="h-8 w-14 rounded object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="h-8 w-14 rounded bg-slate-100 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate leading-tight text-slate-700">
                        {item.video_title}
                      </p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Clock className="h-2.5 w-2.5 text-slate-400" />
                        <span className="text-[10px] text-slate-400">
                          {formatTimeAgo(item.analyzed_at)}
                        </span>
                      </div>
                    </div>
                    {onDeleteHistory && (
                      <button
                        onClick={(e) => handleDelete(e, item.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50 transition-all"
                        title="Delete"
                      >
                        <Trash2 className="h-3 w-3 text-red-400 hover:text-red-600" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
