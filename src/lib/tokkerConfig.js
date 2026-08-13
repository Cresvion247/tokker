export const ACCENTS = [
  { value: "US", label: "American (US)", lang: "en-US" },
  { value: "UK", label: "British (UK)", lang: "en-GB" },
  { value: "AUS", label: "Australian (AUS)", lang: "en-AU" },
];

export const GENDERS = [
  { value: "Female", label: "Female" },
  { value: "Male", label: "Male" },
  { value: "Neutral", label: "Neutral" },
];

export const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];

export const CEFR_DESCRIPTIONS = {
  A1: "Beginner — simple words and phrases",
  A2: "Elementary — basic, everyday expressions",
  B1: "Intermediate — clear, routine situations",
  B2: "Upper-Intermediate — fluent, spontaneous talk",
  C1: "Advanced — flexible, complex ideas",
  C2: "Proficient — effortless, nuanced speech",
};

export const SPEED_OPTIONS = [0.75, 0.85, 0.95, 1.0, 1.1, 1.2, 1.25];

export function greetingFor(level) {
  if (level === "A1" || level === "A2")
    return "Hello! I'm Tokker. Let's practise English together. How are you today?";
  if (level === "B1" || level === "B2")
    return "Hi! I'm Tokker. Let's just chat in English and see where it goes. What's been on your mind recently?";
  return "Hello — I'm Tokker. Let's talk; you lead the way. What would you like to talk about today?";
}

export function timestampNow() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}