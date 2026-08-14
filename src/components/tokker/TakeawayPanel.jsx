import { Sparkles, AlertTriangle, Download } from "lucide-react";

const CATEGORIES = [
  { type: "pronunciation", label: "Pronunciation mistakes" },
  { type: "lexis", label: "Lexis mistakes" },
  { type: "structure", label: "Structural mistakes" },
  { type: "syntax", label: "Syntax mistakes" },
  { type: "spanglish", label: "Spanglish mistakes" },
  { type: "other", label: "Other mistakes" },
];

const TYPE_COLOR = {
  pronunciation: "bg-rose-50 text-rose-600 border-rose-100",
  lexis: "bg-violet-50 text-violet-600 border-violet-100",
  syntax: "bg-amber-50 text-amber-600 border-amber-100",
  structure: "bg-sky-50 text-sky-600 border-sky-100",
  spanglish: "bg-emerald-50 text-emerald-600 border-emerald-100",
  other: "bg-slate-50 text-slate-600 border-slate-100",
};

function downloadTips(issues) {
  if (!issues.length) return;
  let out =
    "TOKKER — Mistakes tracked this session\n" +
    "=".repeat(44) +
    "\n\n";
  CATEGORIES.forEach(({ type, label }) => {
    const items = issues.filter((i) => (i.type || "other") === type);
    if (!items.length) return;
    out += `${label}\n` + "-".repeat(Math.max(label.length, 4)) + "\n";
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

export default function TakeawayPanel({ issues }) {
  const totalOccurrences = issues.reduce((a, b) => a + b.count, 0);

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
        Live record of what came up as you talked, grouped by type.
      </p>

      {issues.length === 0 ? (
        <p className="text-sm text-slate-400">
          No notable errors tracked yet — keep talking!
        </p>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2 mb-4 text-xs text-slate-500">
            <span>
              {issues.length} issue{issues.length === 1 ? "" : "s"}
            </span>
            <span>·</span>
            <span>{totalOccurrences} total occurrences</span>
          </div>
          <div className="space-y-5">
            {CATEGORIES.map(({ type, label }) => {
              const items = issues.filter(
                (i) => (i.type || "other") === type
              );
              if (!items.length) return null;
              const color = TYPE_COLOR[type] || TYPE_COLOR.other;
              return (
                <div key={type}>
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${color}`}
                    >
                      {label}
                    </span>
                    <span className="text-xs text-slate-400">{items.length}</span>
                  </div>
                  <div className="space-y-2">
                    {items
                      .slice()
                      .sort((a, b) => b.count - a.count)
                      .map((i, idx) => (
                        <div
                          key={idx}
                          className="rounded-xl border border-slate-100 bg-slate-50/60 p-3"
                        >
                          <p className="text-sm text-slate-800">
                            <span className="text-slate-400 line-through">
                              {i.error}
                            </span>
                            {" → "}
                            <span className="font-medium text-slate-900">
                              {i.correction}
                            </span>
                          </p>
                          {i.type === "pronunciation" &&
                            (i.wrongPronunciation || i.correctPronunciation) && (
                              <div className="mt-1.5 space-y-0.5 text-xs">
                                {i.wrongPronunciation && (
                                  <p className="text-rose-500">
                                    <span className="font-medium">Cómo NO:</span>{" "}
                                    {i.wrongPronunciation}
                                  </p>
                                )}
                                {i.correctPronunciation && (
                                  <p className="text-emerald-600">
                                    <span className="font-medium">Cómo SÍ:</span>{" "}
                                    {i.correctPronunciation}
                                  </p>
                                )}
                              </div>
                            )}
                          <div className="flex flex-wrap items-center gap-x-2 mt-1 text-xs text-slate-500">
                            <span className="inline-flex items-center gap-1">
                              {i.count > 1 && (
                                <AlertTriangle className="w-3 h-3 text-amber-500" />
                              )}
                              repeated {i.count}x
                            </span>
                            {i.mnemonic && (
                              <>
                                <span>·</span>
                                <span className="italic">tip: {i.mnemonic}</span>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}