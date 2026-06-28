// WhelpWise brand marks, inlined as SVG so they render crisply and never hit
// the Next image optimizer (which blocks SVGs by default).
//
// - Wordmark: ring + "whelpwise" (white text + bright green) — for the navy
//   header, which is dark in both light and dark mode.
// - FullLogo / FullLogoDark: ring + name + strapline, for the login screen
//   (two-file light/dark swap).

const FONT = "'Helvetica Neue', Arial, sans-serif";

export function Wordmark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 300 80" fill="none" role="img" aria-label="WhelpWise">
      <g transform="translate(40,40)">
        <circle cx="0" cy="0" r="20" fill="none" stroke="#4ade80" strokeWidth="4.5" />
        <circle cx="0" cy="20" r="4" fill="#4ade80" />
      </g>
      <text x="76" y="52" fontFamily={FONT} fontSize="30" fontWeight="500" fill="#f5f5f5">
        whelp<tspan fill="#4ade80">wise</tspan>
      </text>
    </svg>
  );
}

export function FullLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 420 120" fill="none" role="img" aria-label="WhelpWise — breeding records, kept right">
      <g transform="translate(56,52)">
        <circle cx="0" cy="0" r="30" fill="none" stroke="#15a34a" strokeWidth="7" />
        <circle cx="0" cy="30" r="6" fill="#15a34a" />
      </g>
      <text x="104" y="58" fontFamily={FONT} fontSize="38" fontWeight="500" fill="#1a1a1a">
        whelp<tspan fill="#15a34a">wise</tspan>
      </text>
      <text x="106" y="86" fontFamily={FONT} fontSize="14" fontWeight="400" fill="#5a5a5a">
        breeding records, kept right
      </text>
    </svg>
  );
}

export function FullLogoDark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 420 120" fill="none" role="img" aria-label="WhelpWise — breeding records, kept right">
      <g transform="translate(56,52)">
        <circle cx="0" cy="0" r="30" fill="none" stroke="#4ade80" strokeWidth="7" />
        <circle cx="0" cy="30" r="6" fill="#4ade80" />
      </g>
      <text x="104" y="58" fontFamily={FONT} fontSize="38" fontWeight="500" fill="#f5f5f5">
        whelp<tspan fill="#4ade80">wise</tspan>
      </text>
      <text x="106" y="86" fontFamily={FONT} fontSize="14" fontWeight="400" fill="#a3a3a3">
        breeding records, kept right
      </text>
    </svg>
  );
}
