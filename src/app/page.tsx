"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Heart, Lightbulb, MessageSquare } from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { MLInfoPanel } from "@/components/analysis/ml-info-panel";
import { ProgressTerminal } from "@/components/analysis/progress-terminal";
import { UrlInput } from "@/components/url-input";
import { ErrorDisplay } from "@/components/error-display";
import { GlobalNav } from "@/components/navigation/global-nav";
import { useAnalysis } from "@/hooks/useAnalysis";
import { getAnalysisHistory, deleteAnalysis } from "@/lib/api";
import type { AnalysisHistoryItem } from "@/types";

export default function Home() {
  const router = useRouter();
  const {
    isAnalyzing,
    progress,
    stage,
    logs,
    result,
    error,
    videoTitle,
    commentsFound,
    commentsAnalyzed,
    mlMetrics,
    startAnalysis,
    cancelAnalysis,
    reset,
  } = useAnalysis();

  const [history, setHistory] = useState<AnalysisHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  // Load history on mount
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const data = await getAnalysisHistory(20);
        setHistory(data);
      } catch (err) {
        console.error("Failed to load history:", err);
      } finally {
        setIsLoadingHistory(false);
      }
    };
    loadHistory();
  }, []);

  // Refresh history when analysis completes
  useEffect(() => {
    if (!isAnalyzing && result) {
      const refreshHistory = async () => {
        try {
          const data = await getAnalysisHistory(20);
          setHistory(data);
        } catch (err) {
          console.error("Failed to refresh history:", err);
        }
      };
      refreshHistory();
    }
  }, [isAnalyzing, result]);

  // Redirect to analysis page when complete
  useEffect(() => {
    if (result?.id && !isAnalyzing) {
      router.push(`/analysis/${result.id}`);
    }
  }, [result, isAnalyzing, router]);

  const handleValidUrl = useCallback(
    (url: string) => {
      startAnalysis(url);
    },
    [startAnalysis]
  );

  const handleSelectHistory = useCallback(
    (item: AnalysisHistoryItem) => {
      router.push(`/analysis/${item.id}`);
    },
    [router]
  );

  const handleNewAnalysis = useCallback(() => {
    reset();
  }, [reset]);

  const handleDeleteHistory = useCallback(
    async (id: number) => {
      try {
        await deleteAnalysis(id);
        setHistory((prev) => prev.filter((item) => item.id !== id));
      } catch (err) {
        console.error("Failed to delete analysis:", err);
      }
    },
    []
  );

  const showInputState = !isAnalyzing && !error;
  const showAnalyzingState = isAnalyzing;
  const showErrorState = error && !isAnalyzing;

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#FAF8F5] flex flex-col">
      {/* Global Navigation */}
      <GlobalNav />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          history={history}
          isLoadingHistory={isLoadingHistory}
          onNewAnalysis={handleNewAnalysis}
          onSelectHistory={handleSelectHistory}
          onDeleteHistory={handleDeleteHistory}
          selectedId={undefined}
          isAnalyzing={isAnalyzing}
        />

        {/* Main Content */}
        <main className="flex-1 flex flex-col h-full overflow-hidden p-6">
          {/* Input State */}
          {showInputState && (
            <div className="h-full flex items-center justify-center fade-up">
              <div className="w-full max-w-xl space-y-8">
                {/* Hero Section */}
                <div className="text-center space-y-3">
                  <h1 className="text-4xl font-display font-semibold tracking-tight text-[#1E3A5F]">
                    AI Video Comment Analyzer
                  </h1>
                  <p className="text-lg text-[#6B7280] font-body">
                    Understand your audience with ML-powered sentiment analysis and topic detection
                  </p>
                </div>

                {/* URL Input */}
                <UrlInput onValidUrl={handleValidUrl} />

                {/* Feature Badges */}
                <div className="flex items-center justify-center gap-6 text-sm text-[#6B7280] font-body">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-[#2D7A5E]/10">
                      <Heart className="h-4 w-4 text-[#2D7A5E]" />
                    </div>
                    <span>Sentiment Analysis</span>
                  </div>
                  <div className="h-4 w-px bg-[#E8E4DC]" />
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-[#4A7C9B]/10">
                      <MessageSquare className="h-4 w-4 text-[#4A7C9B]" />
                    </div>
                    <span>Topic Detection</span>
                  </div>
                  <div className="h-4 w-px bg-[#E8E4DC]" />
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-[#D4714E]/10">
                      <Lightbulb className="h-4 w-4 text-[#D4714E]" />
                    </div>
                    <span>Actionable Insights</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Analyzing State */}
          {showAnalyzingState && (
            <div className="h-full grid grid-cols-3 gap-6">
              {/* Terminal - Takes 2 columns */}
              <div className="col-span-2">
                <ProgressTerminal
                  currentStage={stage || "validating"}
                  progress={progress}
                  logs={logs}
                  videoTitle={videoTitle || undefined}
                  commentsFound={commentsFound || undefined}
                  commentsAnalyzed={commentsAnalyzed || undefined}
                  onCancel={cancelAnalysis}
                />
              </div>

              {/* ML Panel */}
              <div className="space-y-4">
                <MLInfoPanel
                  isProcessing={true}
                  modelName={mlMetrics.modelName}
                  processingSpeed={mlMetrics.processingSpeed}
                  tokensProcessed={mlMetrics.tokensProcessed}
                  avgConfidence={mlMetrics.avgConfidence}
                  currentBatch={mlMetrics.currentBatch}
                  totalBatches={mlMetrics.totalBatches}
                  processingTimeSeconds={mlMetrics.processingTimeSeconds}
                />

                {/* Live Metrics */}
                <div className="rounded-xl border border-[#E8E4DC] bg-white p-4 space-y-3 shadow-sm">
                  <h4 className="text-sm font-semibold text-[#1E3A5F]">Live Metrics</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#6B7280]">Comments Found</span>
                      <span className="font-mono font-semibold tabular-nums text-[#1E3A5F]">
                        {commentsFound.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#6B7280]">Analyzed</span>
                      <span className="font-mono font-semibold tabular-nums text-[#D4714E]">
                        {commentsAnalyzed.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#6B7280]">Processing Time</span>
                      <span className="font-mono font-semibold tabular-nums text-[#1E3A5F]">
                        {mlMetrics.processingTimeSeconds.toFixed(1)}s
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error State */}
          {showErrorState && (
            <div className="h-full flex items-center justify-center">
              <div className="max-w-md">
                <ErrorDisplay message={error} onRetry={handleNewAnalysis} />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
