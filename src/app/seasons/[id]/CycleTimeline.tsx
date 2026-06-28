// Horizontal season timeline. Pure markup — all positions come from day
// numbers in props (computed by cycle.ts). Estimated windows render hatched +
// dashed; confirmed windows render solid. Used by early / fertile states.

export type TimelineBand = { label: string; fromDay: number; toDay: number; color: string };
export type TimelineMarker = { day: number; label: string; sub?: string; color: string };

export default function CycleTimeline({
  minDay,
  maxDay,
  bands,
  window,
  windowColor,
  todayDay,
  todayLabel,
  markers,
  startLabel,
  endLabel,
  endLabelAccent,
}: {
  minDay: number;
  maxDay: number;
  bands: TimelineBand[];
  window?: { fromDay: number; toDay: number; estimated: boolean; label?: string };
  windowColor: string;
  todayDay: number;
  todayLabel: string;
  markers?: TimelineMarker[];
  startLabel: string;
  endLabel: string;
  endLabelAccent?: boolean;
}) {
  const span = Math.max(1, maxDay - minDay);
  const pct = (d: number) => Math.max(0, Math.min(100, ((d - minDay) / span) * 100));

  const windowStyle: React.CSSProperties = window
    ? window.estimated
      ? {
          left: `${pct(window.fromDay)}%`,
          width: `${pct(window.toDay) - pct(window.fromDay)}%`,
          backgroundImage: `repeating-linear-gradient(45deg, ${windowColor}55, ${windowColor}55 5px, transparent 5px, transparent 10px)`,
          border: `1.5px dashed ${windowColor}`,
        }
      : {
          left: `${pct(window.fromDay)}%`,
          width: `${pct(window.toDay) - pct(window.fromDay)}%`,
          background: windowColor,
        }
    : {};

  return (
    <div className="px-1">
      {/* Stage labels + today pill */}
      <div className="relative h-9">
        {bands.map((b) => (
          <span
            key={b.label}
            className="absolute bottom-0 -translate-x-1/2 text-[11px] text-neutral-500"
            style={{ left: `${pct((b.fromDay + b.toDay) / 2)}%` }}
          >
            {b.label}
          </span>
        ))}
        <span
          className="absolute top-0 -translate-x-1/2 whitespace-nowrap rounded-md bg-neutral-900 px-2 py-0.5 text-[11px] font-semibold text-white dark:bg-white dark:text-neutral-900"
          style={{ left: `${pct(todayDay)}%` }}
        >
          {todayLabel}
        </span>
      </div>

      {/* The bar */}
      <div className="relative h-4 overflow-visible rounded-full">
        {bands.map((b) => (
          <div
            key={b.label}
            className="absolute top-0 h-4 first:rounded-l-full last:rounded-r-full"
            style={{ left: `${pct(b.fromDay)}%`, width: `${pct(b.toDay) - pct(b.fromDay)}%`, background: b.color }}
          />
        ))}
        {window && <div className="absolute top-0 h-4 rounded-[3px]" style={windowStyle} />}
        {/* Today marker */}
        <div
          className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-neutral-900 bg-white dark:border-white"
          style={{ left: `${pct(todayDay)}%`, zIndex: 2 }}
        />
      </div>

      {/* Under-bar: end labels + window caption */}
      <div className="relative mt-1.5 h-5">
        <span className="absolute left-0 text-[11px] text-neutral-400">{startLabel}</span>
        <span className={`absolute right-0 text-[11px] ${endLabelAccent ? "font-semibold text-purple-500 dark:text-purple-300" : "text-neutral-400"}`}>
          {endLabel}
        </span>
        {window?.label && (
          <span
            className="absolute -translate-x-1/2 text-[11px] font-medium"
            style={{ left: `${pct((window.fromDay + window.toDay) / 2)}%`, color: windowColor }}
          >
            {window.label}
          </span>
        )}
      </div>

      {/* Sign markers (fertile) */}
      {markers && markers.length > 0 && (
        <div className="relative mt-3 h-12 border-t border-dashed border-neutral-200 pt-3 dark:border-neutral-700">
          {markers.map((m) => (
            <div key={m.label + m.day} className="absolute top-2 -translate-x-1/2 text-center" style={{ left: `${pct(m.day)}%` }}>
              <div className="mx-auto mb-1 h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-neutral-900" style={{ background: m.color }} />
              <span className="block whitespace-nowrap text-[11px] text-neutral-600 dark:text-neutral-300">{m.label}</span>
              {m.sub && <span className="block text-[10px] text-neutral-400">{m.sub}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
