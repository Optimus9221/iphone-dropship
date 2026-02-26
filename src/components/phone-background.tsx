export function PhoneBackground({ patternId = "phones" }: { patternId?: string }) {
  return (
    <div className="absolute inset-0 -z-10">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-indigo-950/90 to-slate-900" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.25),transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_80%_50%,rgba(168,85,247,0.15),transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_20%_80%,rgba(34,211,238,0.1),transparent)]" />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
        }}
      />
      <svg className="absolute inset-0 h-full w-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id={patternId} x="0" y="0" width="200" height="400" patternUnits="userSpaceOnUse">
            <rect x="40" y="20" width="120" height="240" rx="16" fill="none" stroke="currentColor" strokeWidth="1" />
            <rect x="55" y="35" width="90" height="180" rx="4" fill="none" stroke="currentColor" strokeWidth="0.5" />
            <circle cx="100" cy="230" r="8" fill="none" stroke="currentColor" strokeWidth="0.5" />
            <rect x="40" y="260" width="120" height="240" rx="16" fill="none" stroke="currentColor" strokeWidth="1" />
            <rect x="55" y="275" width="90" height="180" rx="4" fill="none" stroke="currentColor" strokeWidth="0.5" />
            <circle cx="100" cy="470" r="8" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>
      <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-indigo-500/10 blur-[120px]" />
      <div className="absolute right-1/4 bottom-1/4 h-80 w-80 rounded-full bg-cyan-500/10 blur-[100px]" />
    </div>
  );
}
