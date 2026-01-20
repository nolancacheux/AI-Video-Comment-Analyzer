"use client";

import * as React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { SentimentSummary } from "@/types";

interface EngagementBarProps {
  sentiment: SentimentSummary;
}

const COLORS = {
  Love: "#10B981", // Emerald
  Dislike: "#F43F5E", // Rose
  Suggestions: "#3B82F6", // Blue
};

export function EngagementBar({ sentiment }: EngagementBarProps) {
  const data = [
    {
      name: "Love",
      engagement: sentiment.positive_engagement,
      fill: COLORS.Love,
    },
    {
      name: "Dislike",
      engagement: sentiment.negative_engagement,
      fill: COLORS.Dislike,
    },
    {
      name: "Suggestions",
      engagement: sentiment.suggestion_engagement,
      fill: COLORS.Suggestions,
    },
  ];

  const formatEngagement = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toString();
  };

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{
      name: string;
      value: number;
      payload: { name: string; fill: string };
    }>;
  }) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      return (
        <div className="rounded-lg border bg-white px-3 py-2 shadow-lg">
          <p
            className="text-xs font-medium"
            style={{ color: item.payload.fill }}
          >
            {item.payload.name}
          </p>
          <p className="text-sm font-bold tabular-nums">
            {item.value.toLocaleString()} likes
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
          barSize={20}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            horizontal={true}
            vertical={false}
            stroke="#E2E8F0"
          />
          <XAxis
            type="number"
            tickFormatter={formatEngagement}
            tick={{ fontSize: 10, fill: "#64748B" }}
            axisLine={{ stroke: "#E2E8F0" }}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 10, fill: "#64748B" }}
            axisLine={false}
            tickLine={false}
            width={70}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "#F8FAFC" }} />
          <Bar dataKey="engagement" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
