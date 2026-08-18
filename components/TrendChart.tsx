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
import { useTheme } from "@/lib/useTheme";
import { THEME_COLORS } from "@/lib/theme-colors";

export interface TrendPoint {
  date: string;
  score: number;
  statements: number;
  branches: number;
}

export default function TrendChart({ data }: { data: TrendPoint[] }) {
  const theme = useTheme();
  const c = THEME_COLORS[theme];

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -16 }}>
        <CartesianGrid stroke={c.line} vertical={false} />
        <XAxis dataKey="date" stroke={c.mist} fontSize={11} tickLine={false} axisLine={{ stroke: c.line }} />
        <YAxis stroke={c.mist} fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} />
        <Tooltip
          contentStyle={{
            background: c.panel,
            border: `1px solid ${c.line}`,
            borderRadius: 8,
            fontSize: 12,
          }}
          labelStyle={{ color: c.mist }}
        />
        <Line type="monotone" dataKey="score" stroke={c.pass} strokeWidth={2} dot={false} name="Score" />
        <Line
          type="monotone"
          dataKey="statements"
          stroke={c.info}
          strokeWidth={1.5}
          dot={false}
          name="Stmt. Coverage"
          strokeDasharray="4 3"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
