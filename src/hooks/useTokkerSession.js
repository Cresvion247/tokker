import { useState, useRef, useCallback, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { greetingFor, timestampNow } from "@/lib/tokkerConfig";

const SpeechRecognition =
  typeof window !== "undefined" &&
  (window.SpeechRecognition || window.webkitSpeechRecognition);

const LANG_MAP = { US: "en-US", UK: "en-GB", AUS: "en-AU" };

export function useTokkerSession(config) {
  const [messages, setMessages] = useState([]);
  const [vadState, setVadState] = useState("idle");
  const [interim, setInterim] = useState("");
  const [active, setActive] = useState(false);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const supported =
    !!SpeechRecognition && typeof window !== "undefined" && "speechSynthesis" in window;

  const recognitionRef = useRef(null);
  const historyRef = useRef([]);
  const speakingRef = useRef(false);
  const processingRef = useRef(false);
  const activeRef = useRef(false);
  const configRef = useRef(config);

  useEffect(() => {
    configRef.current = config;
  }, [config]);

  // Warm up the voice list (Chrome loads voices async).
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
    }
  }, []);

  const addMessage = useCallback((speaker, text) => {
    setMessages((prev) => [...prev, { speaker, text, timestamp: timestampNow() }]);
  }, []);

  const buildSystemPrompt = useCallback(() => {
    const c = configRef.current;
    const grammar = c?.grammarPoints?.length
      ? c.grammarPoints.join(", ")
      : "general fluency";
    return `You are Tokker, a friendly English conversation partner for a Spanish-speaking learner.
- Learner CEFR level: ${c.cefrLevel}. Speak primarily in English at that level — natural, never above it.
- Keep turns short: 1 to 3 sentences. Practice balanced turn-taking: respond, ask ONE question, then yield. Never monologue or list exercises.
- Target accent: ${c.accent} English. Use natural vocabulary and idioms for that variety.
- When the learner makes a "Spanglish" mistake, a grammar error, or an unnatural phrase, briefly switch to Spanish to gently correct it and explain the underlying logic in one or two sentences, then immediately prompt them to continue in English.
- Grammar focus for this session: ${grammar}.
- Be warm, encouraging and patient. Do not use markdown. Reply only with what you would say out loud.`;
  }, []);

  const pickVoice = useCallback(() => {
    const c = configRef.current;
    if (!window.speechSynthesis) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices.length) return null;
    const target = LANG_MAP[c.accent];
    let candidates = voices.filter(
      (v) => v.lang === target || v.lang?.startsWith(target)
    );
    if (c.gender !== "Neutral") {
      const femaleHints = [
        "female", "samantha", "karen", "catherine", "moira", "tessa",
        "fiona", "serena", "zira", "google uk english female", "google us english female", "susan",
      ];
      const maleHints = [
        "male", "daniel", "alex", "fred", "tom", "arthur",
        "oliver", "rishi", "google uk english male", "google us english male", "aaron",
      ];
      const hints = c.gender === "Female" ? femaleHints : maleHints;
      const match = candidates.find((v) =>
        hints.some((h) => v.name.toLowerCase().includes(h))
      );
      if (match) candidates = [match];
    }
    return (
      candidates[0] || voices.find((v) => v.lang?.startsWith("en")) || voices[0]
    );
  }, []);

  const speak = useCallback(
    (text) => {
      return new Promise((resolve) => {
        if (typeof window === "undefined" || !window.speechSynthesis) {
          resolve();
          return;
        }
        const u = new SpeechSynthesisUtterance(text);
        const v = pickVoice();
        if (v) u.voice = v;
        const c = configRef.current;
        u.lang = LANG_MAP[c.accent];
        u.rate = c.speechSpeed;
        u.onend = () => {
          speakingRef.current = false;
          resolve();
        };
        u.onerror = () => {
          speakingRef.current = false;
          resolve();
        };
        speakingRef.current = true;
        setVadState("speaking");
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(u);
      });
    },
    [pickVoice]
  );

  const startRecognition = useCallback(() => {
    const rec = recognitionRef.current;
    if (!rec) return;
    try {
      rec.start();
      setVadState("listening");
    } catch (_) {
      /* already started */
    }
  }, []);

  const stopRecognition = useCallback(() => {
    const rec = recognitionRef.current;
    if (!rec) return;
    try {
      rec.stop();
    } catch (_) {}
  }, []);

  const getAiReply = useCallback(
    async (userText) => {
      historyRef.current.push({ role: "user", content: userText });
      setVadState("thinking");
      setBusy(true);
      try {
        const convo = historyRef.current
          .map((m) => `${m.role === "user" ? "Student" : "Tokker"}: ${m.content}`)
          .join("\n");
        const prompt = `${buildSystemPrompt()}\n\nConversation so far:\n${convo}\n\nTokker:`;
        const res = await base44.integrations.Core.InvokeLLM({
          prompt,
          response_json_schema: {
            type: "object",
            properties: { reply: { type: "string" } },
            required: ["reply"],
          },
        });
        const reply = (res && res.reply) || "Sorry, could you say that again?";
        historyRef.current.push({ role: "assistant", content: reply });
        addMessage("Tokker", reply);
        await speak(reply);
      } catch (e) {
        setError("Could not reach Tokker. Please try again.");
        historyRef.current.pop();
      } finally {
        setBusy(false);
      }
    },
    [buildSystemPrompt, speak, addMessage]
  );

  const handleFinal = useCallback(
    async (text) => {
      if (speakingRef.current || processingRef.current) return;
      processingRef.current = true;
      addMessage("Student", text);
      stopRecognition();
      await getAiReply(text);
      processingRef.current = false;
      if (activeRef.current) startRecognition();
    },
    [addMessage, stopRecognition, getAiReply, startRecognition]
  );

  const initRecognition = useCallback(() => {
    if (!SpeechRecognition) return null;
    const rec = new SpeechRecognition();
    rec.lang = LANG_MAP[configRef.current.accent];
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = (e) => {
      let finalText = "";
      let interimText = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) finalText += r[0].transcript;
        else interimText += r[0].transcript;
      }
      if (interimText) setInterim(interimText);
      if (finalText.trim()) {
        setInterim("");
        handleFinal(finalText.trim());
      }
    };
    rec.onend = () => {
      if (activeRef.current && !speakingRef.current && !processingRef.current) {
        try {
          rec.start();
        } catch (_) {}
      }
    };
    rec.onerror = (e) => {
      if (e.error === "no-speech" || e.error === "aborted") return;
      setError(`Microphone error: ${e.error}`);
    };
    return rec;
  }, [handleFinal]);

  const start = useCallback(async () => {
    if (!supported) {
      setError("Your browser doesn't support live voice. Use Chrome, Edge or Safari.");
      return;
    }
    setError(null);
    historyRef.current = [];
    setMessages([]);
    activeRef.current = true;
    setActive(true);
    recognitionRef.current = initRecognition();
    const greeting = greetingFor(configRef.current.cefrLevel);
    addMessage("Tokker", greeting);
    historyRef.current.push({ role: "assistant", content: greeting });
    await speak(greeting);
    if (activeRef.current) startRecognition();
  }, [supported, initRecognition, addMessage, speak, startRecognition]);

  const stop = useCallback(() => {
    activeRef.current = false;
    setActive(false);
    speakingRef.current = false;
    processingRef.current = false;
    if (typeof window !== "undefined" && window.speechSynthesis)
      window.speechSynthesis.cancel();
    stopRecognition();
    recognitionRef.current = null;
    setVadState("idle");
    setInterim("");
  }, [stopRecognition]);

  useEffect(
    () => () => {
      activeRef.current = false;
      if (typeof window !== "undefined" && window.speechSynthesis)
        window.speechSynthesis.cancel();
      stopRecognition();
    },
    [stopRecognition]
  );

  return {
    messages,
    vadState,
    interim,
    active,
    error,
    busy,
    supported,
    start,
    stop,
  };
}