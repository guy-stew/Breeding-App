"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

// Collar colours mapped to chart-friendly hex values.
const COLOUR_MAP: Record<string, string> = {
  red: "#ef4444",
  blue: "#3b82f6",
  green: "#22c55e",
  yellow: "#eab308",
  purple: "#a855f7",
  orange: "#f97316",
  pink: "#ec4899",
};

function colourToHex(collar: string | null): string {
  if (!collar) return "#888888";
  return COLOUR_MAP[collar.toLowerCase()] ?? "#888888";
}

type PuppyWeightData = {
  collarColour: string | null;
  callName: string | null;
  weights: { date: string; weightG: number }[];
};

export default function GrowthChart({
  puppies,
  whelpDate,
}: {
  puppies: PuppyWeightData[];
  whelpDate: string;
}) {
  const whelpMs = new Date(whelpDate).getTime();

  // Build a unified dataset: one row per unique day number, with a column
  // per puppy. Recharts needs this "wide" shape.
  const dayMap = new Map<number, Record<string, number>>();

  for (const pup of puppies) {
    const key = pup.collarColour ?? pup.callName ?? "?";
    for (const w of pup.weights) {
      const day = Math.round(
        (new Date(w.date).getTime() - whelpMs) / (1000 * 60 * 60 * 24),
      );
      if (!dayMap.has(day)) dayMap.set(day, {});
      dayMap.get(day)![key] = w.weightG;
    }
  }

  const data = Array.from(dayMap.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([day, values]) => ({ day, ...values }));

  if (data.length === 0) {
    return (
      <p className="rounded-xl border border-neutral-200 bg-white p-4 text-center text-sm text-neutral-400 dark:border-neutral-800 dark:bg-neutral-900">
        No weight data to chart yet.
      </p>
    );
  }

  // One line per puppy.
  const lines = puppies.map((pup) => {
    const key = pup.collarColour ?? pup.callName ?? "?";
    return (
      <Line
        key={key}
        type="monotone"
        dataKey={key}
        stroke={colourToHex(pup.collarColour)}
        strokeWidth={2}
        dot={{ r: 3 }}
        name={key}
        connectNulls
      />
    );
  });

  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
          <XAxis
            dataKey="day"
            label={{ value: "Day", position: "insideBottomRight", offset: -5 }}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            tickFormatter={(g: number) =>
              g >= 1000 ? `${(g / 1000).toFixed(1)}kg` : `${g}g`
            }
            width={50}
          />
          <Tooltip
            formatter={(value) => {
              const g = Number(value);
              return g >= 1000
                ? `${(g / 1000).toFixed(2)} kg`
                : `${g} g`;
            }}
            labelFormatter={(day) => `Day ${day}`}
          />
          <Legend />
          {lines}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
