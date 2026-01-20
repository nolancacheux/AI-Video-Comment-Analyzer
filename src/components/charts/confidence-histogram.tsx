"use client";

import * as React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface ConfidenceHistogramProps {
  // Distribution of confidence scores in bins (0-10%, 10-20%, etc.)
  distribution?: number[];
  avgConfidence?: number;
}

export function ConfidenceHistogram({
  distribution,
  avgConfidence = 0.85,
}: ConfidenceHistogramProps) {
  // If no distribution provided, simulate one based on avg confidence
  const bins = distribution || generateDistribution(avgConfidence);

  const data = bins.map((count, index) => ({
    range: `${index * 10}-${(index + 1) * 10}%`,
    count,
    midpoint: index * 10 + 5,
  }));

  const getBarColor = (midpoint: number) => {
    if (midpoint >= 80) return "#10B981"; // High confidence - emerald
    if (midpoint >= 60) return "#3B82F6"; // Medium confidence - blue
    if (midpoint >= 40) return "#F59E0B"; // Low-medium - amber
    return "#F43F5E"; // Low confidence - rose
  };

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{
      payload: { range: string; count: number };
    }>;
  }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="rounded-lg border bg-white px-3 py-2 shadow-lg">
          <p className="text-xs font-medium text-slate-700">
            Confidence: {item.range}
          </p>
          <p className="text-sm font-bold tabular-nums">
            {item.count.toLocaleString()} comments
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-full w-full flex flex-col">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
          barSize={20}
        >
          <XAxis
            dataKey="range"
            tick={{ fontSize: 8, fill: "#64748B" }}
            axisLine={{ stroke: "#E2E8F0" }}
            tickLine={false}
            interval={1}
          />
          <YAxis
            tick={{ fontSize: 9, fill: "#64748B" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "#F8FAFC" }} />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.midpoint)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      {/* Average indicator */}
      <div className="flex items-center justify-center gap-2 mt-1">
        <span className="text-[10px] text-muted-foreground">Avg Confidence:</span>
        <span className="text-xs font-bold text-indigo-600 tabular-nums">
          {(avgConfidence * 100).toFixed(1)}%
        </span>
      </div>
    </div>
  );
}

// Generate a realistic confidence distribution around a mean
function generateDistribution(avgConfidence: number): number[] {
  const bins = new Array(10).fill(0);
  const totalSamples = 100;
  const peakBin = Math.floor(avgConfidence * 10);

  for (let i = 0; i < 10; i++) {
    const distance = Math.abs(i - peakBin);
    const weight = Math.exp(-distance * 0.5);
    bins[i] = Math.round(weight * totalSamples * (0.8 + Math.random() * 0.4));
  }

  return bins;
}
