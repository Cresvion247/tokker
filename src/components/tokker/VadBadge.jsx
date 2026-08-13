const STATES = {
  idle: { label: "Idle", dot: "bg-slate-400", pulse: false },
  listening: { label: "Listening…", dot: "bg-sky-500", pulse: true },
  thinking: { label: "Thinking…", dot: "bg-amber-500", pulse: true },
  speaking: { label: "Speaking…", dot: "bg-emerald-500", pulse: true },
};

export default function VadBadge({ vadState }) {
  const s = STATES[vadState] || STATES.idle;
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 shadow-sm">
      <span className="relative flex h-2.5 w-2.5">
        {s.pulse && (
          <span
            className={`absolute inline-flex h-full w-full rounded-full ${s.dot} opacity-60 animate-ping`}
          />
        )}
        <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${s.dot}`} />
      </span>
      <span className="text-sm font-medium text-slate-700">{s.label}</span>
    </div>
  );
}