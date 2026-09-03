export default function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" aria-hidden>
      <rect width="28" height="28" rx="8" className="fill-signal-pass" />
      <path
        d="M8 10.5h12M8 14h12M8 17.5h8"
        stroke="white"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <circle cx="19" cy="17.5" r="2" fill="white" />
    </svg>
  );
}
