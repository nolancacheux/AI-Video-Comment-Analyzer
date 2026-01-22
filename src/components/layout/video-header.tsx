"use client";

import * as React from "react";
import { ExternalLink, MessageSquare, Calendar, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Video } from "@/types";

interface VideoHeaderProps {
  video: Video | null;
  totalComments: number;
  analyzedAt?: string;
  isLoading?: boolean;
}

export function VideoHeader({
  video,
  totalComments,
  analyzedAt,
  isLoading,
}: VideoHeaderProps) {
  if (isLoading) {
    return (
      <div className="flex items-center gap-4 rounded-lg border bg-white p-3">
        <Skeleton className="h-14 w-24 rounded flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="flex items-center justify-center rounded-lg border bg-white/50 p-4 text-sm text-muted-foreground">
        Enter a YouTube URL to begin analysis
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex items-center gap-3 rounded-md border bg-white p-2">
      {/* Thumbnail */}
      {video.thumbnail_url ? (
        <a
          href={`https://youtube.com/watch?v=${video.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="relative group flex-shrink-0"
        >
          <img
            src={video.thumbnail_url}
            alt={video.title}
            className="h-10 w-18 rounded object-cover"
          />
          <div className="absolute inset-0 rounded bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <ExternalLink className="h-3 w-3 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </a>
      ) : (
        <div className="h-10 w-18 rounded bg-slate-100 flex-shrink-0" />
      )}

      {/* Video Info */}
      <div className="flex-1 min-w-0">
        <h1 className="font-semibold text-xs truncate leading-tight">
          {video.title}
        </h1>
        <div className="flex items-center gap-2 mt-0.5">
          {video.channel_title && (
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <User className="h-2.5 w-2.5" />
              <span className="truncate max-w-[120px]">{video.channel_title}</span>
            </div>
          )}
          {video.published_at && (
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Calendar className="h-2.5 w-2.5" />
              <span>{new Date(video.published_at).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats Badges */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <Badge variant="secondary" className="gap-1 text-[10px] font-medium px-2 py-0.5">
          <MessageSquare className="h-2.5 w-2.5" />
          {totalComments.toLocaleString()}
        </Badge>
        {analyzedAt && (
          <Badge variant="outline" className="text-[10px] font-normal text-muted-foreground px-2 py-0.5">
            {formatDate(analyzedAt)}
          </Badge>
        )}
      </div>
    </div>
  );
}
