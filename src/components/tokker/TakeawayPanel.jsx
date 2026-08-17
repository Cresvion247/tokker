import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { Sparkles, AlertTriangle, Download, Volume2, ChevronDown } from "lucide-react";

const CATEGORIES = [
  { type: "pronunciation", label: "Pronunciation" },
  { type: "lexis", label: "Lexis" },
  { type: "structure", label: "Structure" },
  { type: "syntax", label: "Syntax" },
  { type: "spanglish", label: "Spanglish" },
  { type: "other", label: "Other" },
];

const TYPE_COLOR = {
  pronunciation: "bg-rose-50 text-rose-600 border-rose-100",
  lexis: "bg-violet-50 text-violet-600 border-violet-100",
  syntax: "bg-amber-50 text-amber-600 border-amber-100",
  structure: "bg-sky-50 text-sky-600 border-sky-100",
  spanglish: "bg-emerald-50 text-emerald-600 border-emerald-100",
  other: "bg-slate-50 text-slate-600 border-slate-100",
};

const TYPE_BORDER = {
  pronunciation: "border-rose-200",
  lexis: "border-violet-200",
  syntax: "border-amber-200",
  structure: "border-sky-200",
  spanglish: "border-emerald-200",
  other: "border-slate-200",
};

function downloadTips(issues) {
  if (!issues.length) return;
  let out = "TOKKER — Mistakes tracked this session\n" + "=".repeat(44) + "\n\n";
  CATEGORIES.forEach(({ type, label }) => {
    const items = issues.filter((i) => (i.type || "other") === type);
    if (!items.length) return;
    out += `${label} mistakes\n` + "-".repeat(Math.max(label.length + 9, 4)) + "\n";
    items.forEach((i) => {
      out += `  • "${i.error}" → "${i.correction}" (repeated ${i.count}x)\n`;
      if (i.type === "pronunciation") {
        if (i.wrongPronunciation) out += `      Cómo NO: ${i.wrongPronunciation}\n`;
        if (i.correctPronunciation) out += `      Cómo SÍ: ${i.correctPronunciation}\n`;
      }
      if (i.mnemonic) out += `      Tip: ${i.mnemonic}\n`;
    });
    out += "\n";
  });
  const url = URL.createObjectURL(new Blob([out], { type: "text/plain" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `tokker-tips-${Date.now()}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function MistakeCard({ issue, spotlight }) {
  const [open, setOpen] = useState(false);
  const color = TYPE_COLOR[issue.type] || TYPE_COLOR.other;
  const border = TYPE_BORDER[issue.type] || TYPE_BORDER.other;
  const repeating = issue.count > 1;
  const heavy = issue.count > 2;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -12, scale: 0.97 }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
        boxShadow: spotlight
          ? "0 0 0 2px rgba(56,189,248,0.55)"
          : "0 0 0 0px rgba(0,0,0,0)",
      }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      whileHover={{ y: -1 }}
      className={`rounded-xl border ${border} bg-white p-3 cursor-pointer ${
        spotlight ? "bg-sky-50/60" : "bg-slate-50/60"
      }`}
      onClick={() => setOpen((o) => !o)}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm text-slate-800 flex-1">
          <span className="text-slate-400 line-through">{issue.error}</span>
          <span className="text-slate-400"> → </span>
          <span className="font-medium text-slate-900">{issue.correction}</span>
        </p>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-2 pt-2 border-t border-slate-100 space-y-1.5">
              <span className={`inline-block rounded-full border px-2 py-0.5 text-[11px] font-medium ${color}`}>
                {issue.type}
              </span>
              {issue.type === "pronunciation" &&
                (issue.wrongPronunciation || issue.correctPronunciation) && (
                  <div className="space-y-0.5 text-xs">
                    {issue.wrongPronunciation && (
                      <p className="text-rose-500">
                        <span className="font-medium">Cómo NO:</span>{" "}
                        {issue.wrongPronunciation}
                      </p>
                    )}
                    {issue.correctPronunciation && (
                      <p className="text-emerald-600">
                        <span className="font-medium">Cómo SÍ:</span>{" "}
                        {issue.correctPronunciation}
                      </p>
                    )}
                  </div>
                )}
              {issue.mnemonic && (
                <p className="text-xs text-slate-500 italic">
                  <span className="not-italic font-medium text-slate-600">Tip:</span>{" "}
                  {issue.mnemonic}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-wrap items-center gap-x-2 mt-1.5 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1">
          {repeating && (
            <AlertTriangle
              className={`w-3 h-3 ${heavy ? "text-rose-500" : "text-amber-500"}`}
            />
          )}
          repeated {issue.count}x
        </span>
        {issue.correctPronunciation && (
          <>
            <span>·</span>
            <span className="inline-flex items-center gap-1 text-sky-600">
              <Volume2 className="w-3 h-3" />
              tap card for drill
            </span>
          </>
        )}
      </div>
    </motion.div>
  );
}

export default function TakeawayPanel({ issues }) {
  const [spotlightId, setSpotlightId] = useState(null);

  // The newest issue (highest lastSeen) gets a brief spotlight pulse so the
  // learner's eye is drawn to the just-noticed mistake in real time.
  const newestId = useMemo(() => {
    if (!issues.length) return null;
    return issues.reduce((a, b) => (b.lastSeen > a.lastSeen ? b : a)).id;
  }, [issues]);

  useEffect(() => {
    if (!newestId) return;
    setSpotlightId(newestId);
    const t = setTimeout(() => setSpotlightId(null), 3200);
    return () => clearTimeout(t);
  }, [newestId]);

  const totalOccurrences = issues.reduce((a, b) => a + b.count, 0);
  const repeatingCount = issues.filter((i) => i.count > 1).length;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-sky-500" />
          <h2 className="text-sm font-semibold text-slate-700">
            Mistakes tracked this session
          </h2>
        </div>
        <button
          onClick={() => downloadTips(issues)}
          disabled={!issues.length}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40"
        >
          <Download className="w-3.5 h-3.5" />
          Download tips
        </button>
      </div>
      <p className="text-xs text-slate-500 mb-4">
        Live, as they come up — tap any card for the full breakdown.
      </p>

      <div className="flex flex-wrap items-center gap-2 mb-4 text-xs text-slate-500">
        <span>
          {issues.length} issue{issues.length === 1 ? "" : "s"}
        </span>
        <span>·</span>
        <span>{totalOccurrences} total occurrences</span>
        {repeatingCount > 0 && (
          <>
            <span>·</span>
            <span className="inline-flex items-center gap-1 text-amber-600">
              <AlertTriangle className="w-3 h-3" />
              {repeatingCount} repeating
            </span>
          </>
        )}
      </div>

      <LayoutGroup>
        <AnimatePresence mode="popLayout">
          <div className="space-y-2">
            {issues
              .slice()
              .sort((a, b) => b.lastSeen - a.lastSeen)
              .map((i) => (
                <MistakeCard
                  key={i.id}
                  issue={i}
                  spotlight={spotlightId === i.id}
                />
              ))}
          </div>
        </AnimatePresence>
      </LayoutGroup>
    </div>
  );
}