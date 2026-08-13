import { Sparkles, AlertTriangle } from "lucide-react";

const TYPE_LABEL = {
  pronunciation: "Pronunciation",
  lexis: "Lexis",
  syntax: "Syntax",
  structure: "Structure",
  spanglish: "Spanglish",
  other: "Other",
};

const TYPE_COLOR = {
  pronunciation: "bg-rose-50 text-rose-600 border-rose-100",
  lexis: "bg-violet-50 text-violet-600 border-violet-100",
  syntax: "bg-amber-50 text-amber-600 border-amber-100",
  structure: "bg-sky-50 text-sky-600 border-sky-100",
  spanglish: "bg-emerald-50 text-emerald-600 border-emerald-100",
  other: "bg-slate-50 text-slate-600 border-slate-100",
};

export default function TakeawayPanel({ issues }) {
  const repeated = issues.filter((i) => i.count > 1);
  const totalOccurrences = issues.reduce((a, b) => a + b.count, 0);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center gap-2 mb-1">
        <Sparkles className="w-4 h-4 text-sky-500" />
        <h2 className="text-sm font-semibold text-slate-700">Session takeaway</h2>
      </div>
      <p className="text-xs text-slate-500 mb-4">
        A quiet record of what came up. Download the full report for researched
        strategies, mnemonics and exam advice.
      </p>

      {issues.length === 0 ? (
        <p className="text-sm text-slate-400">
          No notable errors tracked this session — nice work!
        </p>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2 mb-4 text-xs text-slate-500">
            <span>
              {issues.length} issue{issues.length === 1 ? "" : "s"}
            </span>
            <span>·</span>
            <span>{repeated.length} repeating</span>
            <span>·</span>
            <span>{totalOccurrences} total occurrences</span>
          </div>
          <div className="space-y-2">
            {[...issues]
              .sort((a, b) => b.count - a.count)
              .map((i, idx) => {
                const color = TYPE_COLOR[i.type] || TYPE_COLOR.other;
                return (
                  <div
                    key={idx}
                    className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3"
                  >
                    <span
                      className={`shrink-0 mt-0.5 rounded-full border px-2 py-0.5 text-[11px] font-medium ${
                        color
                      }`}
                    >
                      {TYPE_LABEL[i.type] || i.type}
                    </span>
                    <div className="min-w-0 flex-1">
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
                            <span className="italic">mnemonic: {i.mnemonic}</span>
                          </>
                        )}
                      </div>
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