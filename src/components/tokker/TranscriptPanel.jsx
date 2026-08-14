import { useEffect, useRef } from "react";

export default function TranscriptPanel({ messages, interim }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, interim]);

  return (
    <div className="flex flex-col h-full">
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-3 pr-1 pb-2"
      >
        {messages.length === 0 && (
          <p className="text-sm text-slate-400 text-center py-10">
            Your conversation will appear here.
          </p>
        )}
        {messages.map((m, i) => {
          const isStudent = m.speaker === "Student";
          return (
            <div
              key={i}
              className={`flex ${isStudent ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[82%] rounded-2xl px-4 py-2.5 ${
                  isStudent
                    ? "bg-sky-100 text-slate-900 rounded-br-sm"
                    : "bg-slate-100 text-slate-900 rounded-bl-sm"
                }`}
              >
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-semibold text-slate-500">
                    {m.speaker}
                  </span>
                  <span className="text-[10px] text-slate-400">{m.timestamp}</span>
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {m.text}
                </p>
              </div>
            </div>
          );
        })}
        {interim && (
          <div className="flex justify-end">
            <div className="max-w-[82%] rounded-2xl px-4 py-2.5 bg-sky-50 text-slate-400 italic rounded-br-sm">
              <p className="text-sm">{interim}…</p>
            </div>
          </div>
        )}
        <div />
      </div>
    </div>
  );
}