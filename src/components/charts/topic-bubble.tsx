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

const COLORS = {
  positive: "#10B981", // Emerald
  negative: "#F43F5E", // Rose
  suggestion: "#3B82F6", // Blue
  neutral: "#64748B", // Slate
};

export function TopicBubble({ topics }: TopicBubbleProps) {
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
        <div className="rounded-lg border bg-white px-3 py-2 shadow-lg max-w-[200px]">
          <p className="text-xs font-semibold truncate" style={{ color }}>
            {item.name}
          </p>
          <div className="mt-1.5 space-y-1">
            <div className="flex justify-between text-[10px]">
              <span className="text-muted-foreground">Mentions</span>
              <span className="font-medium tabular-nums">{item.z}</span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="text-muted-foreground">Engagement</span>
              <span className="font-medium tabular-nums">
                {item.x.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="text-muted-foreground">Priority</span>
              <span className="font-medium tabular-nums">
                {(item.y * 100).toFixed(0)}%
              </span>
            </div>
          </div>
          {item.keywords.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {item.keywords.map((kw, i) => (
                <span
                  key={i}
                  className="px-1.5 py-0.5 text-[9px] rounded bg-slate-100 text-slate-600"
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
      <div className="h-full w-full flex items-center justify-center text-sm text-muted-foreground">
        No topics to display
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
            tick={{ fontSize: 9, fill: "#64748B" }}
            axisLine={{ stroke: "#E2E8F0" }}
            tickLine={false}
            label={{
              value: "Engagement",
              position: "bottom",
              offset: 0,
              style: { fontSize: 9, fill: "#94A3B8" },
            }}
          />
          <YAxis
            type="number"
            dataKey="y"
            name="Priority"
            domain={[0, 1]}
            tick={{ fontSize: 9, fill: "#64748B" }}
            axisLine={{ stroke: "#E2E8F0" }}
            tickLine={false}
            tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
            label={{
              value: "Priority",
              angle: -90,
              position: "insideLeft",
              offset: 10,
              style: { fontSize: 9, fill: "#94A3B8" },
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
            <span className="text-[9px] text-muted-foreground capitalize">
              {key === "positive" ? "Love" : key === "negative" ? "Dislike" : key === "suggestion" ? "Suggestions" : "Neutral"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
