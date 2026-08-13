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
  const [issues, setIssues] = useState([]);

  const supported =
    !!SpeechRecognition && typeof window !== "undefined" && "speechSynthesis" in window;

  const recognitionRef = useRef(null);
  const historyRef = useRef([]);
  const issuesRef = useRef({});
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
    return `You are Tokker, an expert bilingual language coach specialising in Spanish↔English learning — including Spanglish interference across pronunciation, lexis, syntax and structures — and an expert in all types of English exam preparation (Cambridge, IELTS, TOEFL, EOI, school and university English, aptitude tests, etc.).

TEACHING APPROACH — Dogme ELT:
- Dogme is conversation-driven and materials-light. Topics, vocabulary and language points EMERGE from the learner's own talk and life. Do NOT impose topics, syllabi, drills or grammar lists. Teach to the moment: follow the learner and notice language as it naturally arises.
- Keep the flow conversational. Address language lightly when it comes up, then return to the dialogue.

BEHAVIOUR:
- Speak primarily in English at the learner's CEFR level (${c.cefrLevel}) — natural, never above it.
- Target accent: ${c.accent} English, with natural idioms and pronunciation for that variety.
- Keep turns short: 1 to 3 sentences. Balanced turn-taking: respond, ask ONE open question, then yield. Never monologue or list exercises.
- When the learner makes a Spanglish mistake or an error of pronunciation/lexis/syntax/structure, briefly switch to Spanish to gently correct it, explain the underlying logic, then prompt them to continue in English.
- For recurring (fossilised) errors, suggest an innovative, memorable strategy or mnemonic to help break the habit.
- When goals or tests come up, give concise, practical, up-to-date exam-preparation advice.
- Be warm, encouraging and patient. No markdown in your spoken reply. Reply only with what you would say out loud.

You also keep a private machine-readable record of the errors you noticed in the student's LAST message, for tracking and a later takeaway. Classify each error as exactly one of: pronunciation, lexis, syntax, structure, spanglish. Give the original error, the corrected form, and a short mnemonic or tip when useful. If the last message had no errors, return an empty errors array.`;
  }, []);

  const pickVoice = useCallback(() => {
    const c = configRef.current;
    if (typeof window === "undefined" || !window.speechSynthesis) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices.length) return null;
    const target = LANG_MAP[c.accent];

    const naturalScore = (v) => {
      const n = v.name.toLowerCase();
      let score = 0;
      if (n.includes("natural")) score += 5;
      if (n.includes("premium") || n.includes("enhanced")) score += 4;
      if (n.includes("google")) score += 3;
      if (/(samantha|karen|serena|daniel|rishi|aria|jenny)/.test(n)) score += 2;
      return score;
    };

    let candidates = voices.filter(
      (v) => v.lang === target || v.lang?.startsWith(target)
    );

    if (c.gender !== "Neutral") {
      const femaleHints = ["female", "samantha", "karen", "catherine", "moira", "tessa", "fiona", "serena", "zira", "susan", "aria", "jenny"];
      const maleHints = ["male", "daniel", "alex", "fred", "tom", "arthur", "oliver", "rishi", "aaron", "guy", "ryan"];
      const hints = c.gender === "Female" ? femaleHints : maleHints;
      const gendered = candidates.filter((v) =>
        hints.some((h) => v.name.toLowerCase().includes(h))
      );
      if (gendered.length) candidates = gendered;
    }

    const ranked = candidates
      .slice()
      .sort((a, b) => naturalScore(b) - naturalScore(a));
    return ranked[0] || voices.find((v) => v.lang?.startsWith("en")) || voices[0];
  }, []);

  const speak = useCallback(
    (text) => {
      return new Promise((resolve) => {
        if (typeof window === "undefined" || !window.speechSynthesis) {
          resolve();
          return;
        }
        const chunks =
          text
            .match(/[^.!?…]+[.!?…]*\s*/g)
            ?.map((s) => s.trim())
            .filter(Boolean) || [text];
        if (!chunks.length) {
          resolve();
          return;
        }
        const v = pickVoice();
        const c = configRef.current;
        const lang = LANG_MAP[c.accent];
        const rate = c.speechSpeed;
        window.speechSynthesis.cancel();
        speakingRef.current = true;
        setVadState("speaking");
        let remaining = chunks.length;
        const onFinish = () => {
          remaining -= 1;
          if (remaining === 0) {
            speakingRef.current = false;
            resolve();
          }
        };
        chunks.forEach((chunk) => {
          const u = new SpeechSynthesisUtterance(chunk);
          if (v) u.voice = v;
          u.lang = lang;
          u.rate = rate;
          u.pitch = 1.0;
          u.onend = onFinish;
          u.onerror = onFinish;
          window.speechSynthesis.speak(u);
        });
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

  const recordErrors = useCallback((errors) => {
    if (!errors || !errors.length) { setIssues(Object.values(issuesRef.current)); return; }
    const acc = issuesRef.current;
    errors.forEach((e) => {
      if (!e || !e.error) return;
      const key = `${e.type || "other"}::${e.error.trim().toLowerCase()}`;
      if (acc[key]) {
        acc[key].count += 1;
        if (e.mnemonic) acc[key].mnemonic = e.mnemonic;
      } else {
        acc[key] = {
          type: e.type || "other",
          error: e.error,
          correction: e.correction || "",
          mnemonic: e.mnemonic || "",
          count: 1,
        };
      }
    });
    setIssues(Object.values(acc));
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
            properties: {
              reply: { type: "string" },
              errors: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    type: { type: "string", enum: ["pronunciation", "lexis", "syntax", "structure", "spanglish"] },
                    error: { type: "string" },
                    correction: { type: "string" },
                    mnemonic: { type: "string" },
                  },
                  required: ["type", "error", "correction"],
                },
              },
            },
            required: ["reply", "errors"],
          },
        });
        const reply = (res && res.reply) || "Sorry, could you say that again?";
        historyRef.current.push({ role: "assistant", content: reply });
        addMessage("Tokker", reply);
        recordErrors(res && res.errors);
        await speak(reply);
      } catch (e) {
        setError("Could not reach Tokker. Please try again.");
        historyRef.current.pop();
      } finally {
        setBusy(false);
      }
    },
    [buildSystemPrompt, speak, addMessage, recordErrors]
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
    issuesRef.current = {};
    setIssues([]);
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
    issues,
    supported,
    start,
    stop,
  };
}