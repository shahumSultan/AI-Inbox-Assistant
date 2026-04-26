/**
 * InboxAI logo mark — geometric inbox tray + AI spark.
 * Gradient: Indigo → Cyan (matching brand palette from design system).
 * Compact mode (size ≤ 22): single centre dot; full mode: 3-dot AI spark.
 */
export default function LogoMark({ size = 40 }: { size?: number }) {
  const rx = Math.round(size * 0.22);
  const compact = size <= 22;
  const gradId = `logo-grad-${size}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="oklch(64% 0.22 265)" />
          <stop offset="100%" stopColor="oklch(72% 0.16 200)" />
        </linearGradient>
      </defs>

      {/* Background tile */}
      <rect width="40" height="40" rx={rx} fill={`url(#${gradId})`} />

      {/* Tray body */}
      <rect x="8" y="10" width="24" height="16" rx="2.5" fill="white" fillOpacity="0.12" />
      <rect x="8" y="10" width="24" height="16" rx="2.5" fill="none" stroke="white" strokeOpacity="0.75" strokeWidth="1.6" />

      {/* Tray slot / bottom lip */}
      <path d="M8 22 L8 26 Q8 28 10 28 L30 28 Q32 28 32 26 L32 22" fill="white" fillOpacity="0.08" />
      <path d="M8 22 L8 26 Q8 28 10 28 L30 28 Q32 28 32 26 L32 22" fill="none" stroke="white" strokeOpacity="0.5" strokeWidth="1.6" />

      {/* AI spark */}
      {compact ? (
        <circle cx="20" cy="18" r="3" fill="white" />
      ) : (
        <>
          <circle cx="20"   cy="18" r="2.2" fill="white" />
          <circle cx="14.5" cy="18" r="1.3" fill="white" opacity="0.7" />
          <circle cx="25.5" cy="18" r="1.3" fill="white" opacity="0.7" />
          <line x1="16.7" y1="18" x2="17.8" y2="18" stroke="white" strokeWidth="0.9" opacity="0.45" />
          <line x1="22.2" y1="18" x2="23.3" y2="18" stroke="white" strokeWidth="0.9" opacity="0.45" />
        </>
      )}
    </svg>
  );
}
