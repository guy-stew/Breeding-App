"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";

type TestPoint = { date: string; levelNgMl: number };

export default function ProgesteroneChart({ tests }: { tests: TestPoint[] }) {
  const data = tests.map((t, i) => ({
    day: i + 1,
    date: new Date(t.date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
    }),
    level: t.levelNgMl,
  }));

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11 }}
            stroke="#a3a3a3"
          />
          <YAxis
            tick={{ fontSize: 11 }}
            stroke="#a3a3a3"
            label={{
              value: "ng/ml",
              angle: -90,
              position: "insideLeft",
              style: { fontSize: 11, fill: "#a3a3a3" },
            }}
          />
          <Tooltip
            formatter={(value) => [`${value} ng/ml`, "Progesterone"]}
            labelFormatter={(label) => label}
          />
          <ReferenceLine
            y={2}
            stroke="#f59e0b"
            strokeDasharray="4 4"
            label={{ value: "LH surge (~2)", position: "right", fontSize: 10, fill: "#f59e0b" }}
          />
          <ReferenceLine
            y={5}
            stroke="#ec4899"
            strokeDasharray="4 4"
            label={{ value: "Ovulation (~5)", position: "right", fontSize: 10, fill: "#ec4899" }}
          />
          <Line
            type="monotone"
            dataKey="level"
            stroke="#ec4899"
            strokeWidth={2}
            dot={{ fill: "#ec4899", r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
