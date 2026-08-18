"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export interface TrendPoint {
  date: string;
  score: number;
  statements: number;
  branches: number;
}

export default function TrendChart({ data }: { data: TrendPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -16 }}>
        <CartesianGrid stroke="#272C34" vertical={false} />
        <XAxis
          dataKey="date"
          stroke="#8A93A3"
          fontSize={11}
          tickLine={false}
          axisLine={{ stroke: "#272C34" }}
        />
        <YAxis
          stroke="#8A93A3"
          fontSize={11}
          tickLine={false}
          axisLine={false}
          domain={[0, 100]}
        />
        <Tooltip
          contentStyle={{
            background: "#15181D",
            border: "1px solid #272C34",
            borderRadius: 8,
            fontSize: 12,
          }}
          labelStyle={{ color: "#8A93A3" }}
        />
        <Line type="monotone" dataKey="score" stroke="#3ED598" strokeWidth={2} dot={false} name="Score" />
        <Line type="monotone" dataKey="statements" stroke="#5FA8FF" strokeWidth={1.5} dot={false} name="Stmt. Coverage" strokeDasharray="4 3" />
      </LineChart>
    </ResponsiveContainer>
  );
}
