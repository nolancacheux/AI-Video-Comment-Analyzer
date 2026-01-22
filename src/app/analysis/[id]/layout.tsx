"use client";

import type { ReactNode } from "react";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { GlobalNav } from "@/components/navigation/global-nav";
import { AnalysisTabs } from "@/components/navigation/analysis-tabs";
import { VideoHeader } from "@/components/layout/video-header";
import { Skeleton } from "@/components/ui/skeleton";
import { useAnalysisData } from "@/hooks/useAnalysisData";

function AnalysisLayoutContent({
  children,
}: {
  children: ReactNode;
}): JSX.Element | null {
  const params = useParams();
  const router = useRouter();
  const analysisId = params.id ? parseInt(params.id as string, 10) : undefined;

  const { analysis, isLoading, error } = useAnalysisData({
    analysisId,
    autoLoad: true,
  });

  // Redirect to home if analysis not found
  useEffect(() => {
    if (error && !isLoading) {
      router.push("/");
    }
  }, [error, isLoading, router]);

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col overflow-hidden bg-[#FAF8F5]">
        <GlobalNav />
        <div className="border-b border-[#E8E4DC] bg-white flex-shrink-0">
          <div className="px-4 py-2">
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        <div className="border-b border-[#E8E4DC] bg-white flex-shrink-0">
          <div className="px-4">
            <Skeleton className="h-10 w-80" />
          </div>
        </div>
        <main className="flex-1 overflow-auto p-4">
          <Skeleton className="h-full w-full" />
        </main>
      </div>
    );
  }

  if (!analysis || !analysisId) {
    return null;
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#FAF8F5]">
      <GlobalNav />

      {/* Video Header */}
      <div className="border-b border-[#E8E4DC] bg-white flex-shrink-0">
        <div className="px-4 py-2">
          <VideoHeader
            video={analysis.video}
            totalComments={analysis.total_comments}
            analyzedAt={analysis.analyzed_at}
          />
        </div>
      </div>

      {/* Tab Navigation */}
      <AnalysisTabs analysisId={analysisId} />

      {/* Page Content */}
      <main className="flex-1 overflow-auto p-4">{children}</main>
    </div>
  );
}

export default function AnalysisLayout({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  return (
    <AnalysisLayoutContent>{children}</AnalysisLayoutContent>
  );
}
