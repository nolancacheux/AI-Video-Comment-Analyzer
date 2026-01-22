"use client";

import * as React from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { Topic } from "@/types";

interface TopicBubbleProps {
  topics: Topic[];
}

// Editorial color palette - warm and sophisticated
const COLORS = {
  positive: "#059669", // emerald-600 (love)
  negative: "#DC2626", // red-600 (dislike)
  suggestion: "#2563EB", // blue-600
  neutral: "#78716C", // stone-500
};

const LEGEND_LABELS: Record<keyof typeof COLORS, string> = {
  positive: "Love",
  negative: "Dislike",
  suggestion: "Suggestions",
  neutral: "Neutral",
};

export function TopicBubble({ topics }: TopicBubbleProps): JSX.Element {
  // Transform topics into scatter data
  // X = engagement, Y = priority score, Z (size) = mention count
  const data = topics.slice(0, 10).map((topic, index) => ({
    name: topic.name,
    x: topic.total_engagement,
    y: topic.priority_score,
    z: topic.mention_count,
    sentiment: topic.sentiment_category,
    keywords: topic.keywords.slice(0, 3),
    index,
  }));

  const maxEngagement = Math.max(...data.map((d) => d.x), 1);
  const maxMentions = Math.max(...data.map((d) => d.z), 1);

  const formatEngagement = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(0)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
    return value.toString();
  };

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{
      payload: {
        name: string;
        x: number;
        y: number;
        z: number;
        sentiment: string;
        keywords: string[];
      };
    }>;
  }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      const color = COLORS[item.sentiment as keyof typeof COLORS] || COLORS.neutral;
      return (
        <div className="rounded-xl border border-stone-200 bg-white px-3 py-2 shadow-[0_4px_6px_rgba(28,25,23,0.07)] max-w-[200px]">
          <p className="text-xs font-semibold font-body truncate" style={{ color }}>
            {item.name}
          </p>
          <div className="mt-1.5 space-y-1">
            <div className="flex justify-between text-[10px]">
              <span className="text-stone-500 font-body">Mentions</span>
              <span className="font-medium tabular-nums text-stone-700">{item.z}</span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="text-stone-500 font-body">Engagement</span>
              <span className="font-medium tabular-nums text-stone-700">
                {item.x.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="text-stone-500 font-body">Priority</span>
              <span className="font-medium tabular-nums text-stone-700">
                {(item.y * 100).toFixed(0)}%
              </span>
            </div>
          </div>
          {item.keywords.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {item.keywords.map((kw, i) => (
                <span
                  key={i}
                  className="px-1.5 py-0.5 text-[9px] rounded bg-stone-100 text-stone-600"
                >
                  {kw}
                </span>
              ))}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  if (data.length === 0) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center text-sm text-stone-500 font-body">
        <span>No topics detected</span>
        <span className="text-xs mt-1 text-stone-400">Need 2+ comments per category</span>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
          <XAxis
            type="number"
            dataKey="x"
            name="Engagement"
            domain={[0, maxEngagement * 1.1]}
            tickFormatter={formatEngagement}
            tick={{ fontSize: 9, fill: "#78716C" }}
            axisLine={{ stroke: "#E7E5E4" }}
            tickLine={false}
            label={{
              value: "Engagement",
              position: "bottom",
              offset: 0,
              style: { fontSize: 9, fill: "#A8A29E" },
            }}
          />
          <YAxis
            type="number"
            dataKey="y"
            name="Priority"
            domain={[0, 1]}
            tick={{ fontSize: 9, fill: "#78716C" }}
            axisLine={{ stroke: "#E7E5E4" }}
            tickLine={false}
            tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
            label={{
              value: "Priority",
              angle: -90,
              position: "insideLeft",
              offset: 10,
              style: { fontSize: 9, fill: "#A8A29E" },
            }}
          />
          <ZAxis
            type="number"
            dataKey="z"
            range={[50, 400]}
            domain={[0, maxMentions]}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: "3 3" }} />
          <Scatter data={data} fillOpacity={0.7}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[entry.sentiment as keyof typeof COLORS] || COLORS.neutral}
                stroke={COLORS[entry.sentiment as keyof typeof COLORS] || COLORS.neutral}
                strokeWidth={1}
              />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
      {/* Legend */}
      <div className="flex justify-center gap-4 mt-1">
        {Object.entries(COLORS).map(([key, color]) => (
          <div key={key} className="flex items-center gap-1">
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span className="text-[9px] text-stone-600 font-body capitalize">
              {LEGEND_LABELS[key as keyof typeof COLORS]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
