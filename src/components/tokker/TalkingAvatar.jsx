import { motion } from "framer-motion";
import { Bot } from "lucide-react";

export default function TalkingAvatar({ vadState }) {
  const speaking = vadState === "speaking";
  const listening = vadState === "listening";
  const thinking = vadState === "thinking";
  const active = speaking || listening;

  const coreClass = speaking
    ? "bg-sky-400"
    : listening
    ? "bg-sky-300"
    : thinking
    ? "bg-amber-300"
    : "bg-slate-200";

  const ringClass = speaking
    ? "bg-sky-400"
    : listening
    ? "bg-sky-300"
    : thinking
    ? "bg-amber-300"
    : "bg-slate-300";

  return (
    <div className="relative flex items-center justify-center w-48 h-48">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className={`absolute rounded-full ${ringClass}`}
          style={{ width: "10rem", height: "10rem" }}
          animate={
            active
              ? { scale: [1, 1.35, 1], opacity: [0.3, 0.05, 0.3] }
              : { scale: 1, opacity: 0.12 }
          }
          transition={{
            duration: 1.8,
            repeat: Infinity,
            delay: i * 0.35,
            ease: "easeInOut",
          }}
        />
      ))}
      <div
        className={`relative z-10 w-28 h-28 rounded-full ${coreClass} flex items-center justify-center shadow-xl transition-colors duration-300`}
      >
        <Bot className="w-12 h-12 text-white" strokeWidth={1.6} />
      </div>
    </div>
  );
}