import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTokkerConfig } from "@/lib/TokkerConfigContext";
import { useTokkerSession } from "@/hooks/useTokkerSession";
import TalkingAvatar from "@/components/tokker/TalkingAvatar";
import VadBadge from "@/components/tokker/VadBadge";
import TranscriptPanel from "@/components/tokker/TranscriptPanel";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import {
  AudioLines,
  Download,
  Mic,
  MicOff,
  Settings,
  Loader2,
} from "lucide-react";

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function Conversation() {
  const { config } = useTokkerConfig();
  const navigate = useNavigate();
  const session = useTokkerSession(config);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!config) navigate("/");
  }, [config, navigate]);

  if (!config) return null;

  const {
    messages,
    vadState,
    interim,
    active,
    error,
    busy,
    supported,
    start,
    stop,
  } = session;

  const downloadSession = async () => {
    if (messages.length === 0) return;
    const lines = messages
      .map((m) => `[${m.timestamp}] ${m.speaker}: ${m.text}`)
      .join("\n");
    const header =
      `Tokker Session\n` +
      `CEFR: ${config.cefrLevel} | Accent: ${config.accent} | Voice: ${config.gender} | Speed: ${config.speechSpeed}x\n` +
      `Grammar focus: ${config.grammarPoints.join(", ") || "general fluency"}\n` +
      `${"=".repeat(48)}\n\n`;
    triggerDownload(
      new Blob([header + lines], { type: "text/plain" }),
      `tokker-session-${Date.now()}.txt`
    );

    setDownloading(true);
    try {
      const summaryPrompt = `You are reviewing an English-practice conversation between a Spanish-speaking student and Tokker. In 2-3 friendly sentences in Spanish, summarize what the student practiced, mention one thing they did well, and one small thing to improve. Conversation:\n${lines}`;
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: summaryPrompt,
        response_json_schema: {
          type: "object",
          properties: { summary: { type: "string" } },
          required: ["summary"],
        },
      });
      const summary = res?.summary || "";
      if (summary) {
        const tts = await base44.integrations.Core.GenerateSpeech({
          text: summary,
          language_code: "es",
        });
        if (tts?.url) {
          const a = document.createElement("a");
          a.href = tts.url;
          a.download = `tokker-summary-${Date.now()}.mp3`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
      }
      await base44.entities.Session.create({
        cefr_level: config.cefrLevel,
        accent: config.accent,
        gender: config.gender,
        speech_speed: config.speechSpeed,
        grammar_points: config.grammarPoints,
        turns: messages.length,
        transcript: messages,
      });
    } catch (e) {
      /* ignore download/save errors */
    } finally {
      setDownloading(false);
    }
  };

  const endSession = () => {
    stop();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-5 py-6">
        {/* Top bar */}
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-400 flex items-center justify-center shadow-sm">
              <AudioLines className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-slate-900">
                Tokker
              </h1>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="font-medium text-slate-600">
                  {config.cefrLevel}
                </span>
                <span>·</span>
                <span>{config.accent}</span>
                <span>·</span>
                <span>{config.gender}</span>
                <span>·</span>
                <span>{config.speechSpeed}x</span>
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={endSession}
            className="rounded-lg border-slate-200 text-slate-600"
          >
            <Settings className="w-4 h-4 mr-2" />
            New setup
          </Button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* Conversation stage */}
          <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-slate-50/50 p-6 flex flex-col items-center justify-between min-h-[480px]">
            <div className="flex-1 flex flex-col items-center justify-center w-full">
              <TalkingAvatar vadState={vadState} />
              <div className="mt-6">
                <VadBadge vadState={vadState} />
              </div>
              {interim && (
                <p className="mt-4 text-sm text-slate-400 italic text-center max-w-xs">
                  “{interim}…”
                </p>
              )}
            </div>

            {!supported && (
              <p className="text-sm text-amber-600 text-center mb-4 max-w-xs">
                Live voice needs Chrome, Edge or Safari. You can still download
                the transcript after a session.
              </p>
            )}
            {error && (
              <p className="text-sm text-rose-500 text-center mb-4 max-w-xs">
                {error}
              </p>
            )}

            <div className="flex flex-col items-center gap-3 w-full mt-2">
              {!active ? (
                <Button
                  onClick={start}
                  disabled={!supported}
                  size="lg"
                  className="w-full max-w-xs bg-sky-400 hover:bg-sky-500 text-white rounded-xl h-12"
                >
                  <Mic className="w-5 h-5 mr-2" />
                  Start talking
                </Button>
              ) : (
                <Button
                  onClick={stop}
                  variant="outline"
                  size="lg"
                  className="w-full max-w-xs rounded-xl h-12 border-slate-300 text-slate-700"
                >
                  <MicOff className="w-5 h-5 mr-2" />
                  Pause
                </Button>
              )}

              <Button
                onClick={downloadSession}
                disabled={messages.length === 0 || downloading || busy}
                variant="ghost"
                className="w-full max-w-xs text-slate-600 hover:text-slate-900 rounded-xl"
              >
                {downloading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                {downloading
                  ? "Packaging…"
                  : "Download session audio & transcript"}
              </Button>
            </div>
          </div>

          {/* Transcript */}
          <div className="lg:col-span-3 rounded-2xl border border-slate-200 bg-white p-5 flex flex-col h-[480px] lg:h-auto lg:min-h-[480px]">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-700">
                Live transcript
              </h2>
              <span className="text-xs text-slate-400">
                {messages.length} turn{messages.length === 1 ? "" : "s"}
              </span>
            </div>
            <div className="flex-1 min-h-0">
              <TranscriptPanel messages={messages} interim={interim} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}