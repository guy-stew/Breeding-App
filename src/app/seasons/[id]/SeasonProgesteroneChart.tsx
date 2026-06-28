"use client";

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer,
} from "recharts";

type TestPoint = { date: string; levelNgMl: number };

export default function SeasonProgesteroneChart({ tests }: { tests: TestPoint[] }) {
  const data = tests.map((t) => ({
    date: new Date(t.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
    level: t.levelNgMl,
  }));

  return (
    <ResponsiveContainer width="100%" height={210}>
      <LineChart data={data} margin={{ top: 8, right: 14, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-neutral-200 dark:text-neutral-800" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#9ca3af" />
        <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" width={32} />
        <Tooltip formatter={(v) => [`${v} ng/ml`, "Progesterone"]} />
        <ReferenceLine y={2} stroke="#f59e0b" strokeDasharray="6 4" label={{ value: "LH surge ≈ 2", position: "right", fontSize: 10, fill: "#b45309" }} />
        <ReferenceLine y={5} stroke="#16a34a" strokeDasharray="6 4" label={{ value: "Ovulation ≈ 5", position: "right", fontSize: 10, fill: "#15803d" }} />
        <Line type="monotone" dataKey="level" stroke="#2563eb" strokeWidth={2} dot={{ fill: "#2563eb", r: 4 }} activeDot={{ r: 6 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
