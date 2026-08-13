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

const GREETINGS = {
  A1: [
    "Hi! I'm Tokker. Let's practise English together. How are you today?",
    "Hello! I am Tokker. Nice to meet you. How are you feeling today?",
    "Hi there! I'm Tokker. Let's talk in English. What is your name?",
    "Hello! I'm Tokker, your English friend. What do you like to do?",
    "Hi! I'm Tokker. Let's learn English. How is your day?",
  ],
  A2: [
    "Hello! I'm Tokker. Let's practise English a little. What did you do today?",
    "Hi! I'm Tokker. Nice to see you. Tell me, how was your weekend?",
    "Hello! I'm Tokker. Let's speak English together. What do you enjoy?",
    "Hi there! I'm Tokker. Let's have a short chat. Have you got any plans?",
    "Hello! I'm Tokker. How are you today? Let's talk a little.",
  ],
  B1: [
    "Hi! I'm Tokker. Let's just chat in English and see where it goes. What's been on your mind recently?",
    "Hello, I'm Tokker. Great to see you. What have you been up to lately?",
    "Hi! I'm Tokker. Let's talk — anything you like. How's your week going?",
    "Hey there, I'm Tokker. Let's keep it easy and see what comes up. What's new with you?",
    "Hello! I'm Tokker. Ready for some English? Tell me something about your day.",
  ],
  B2: [
    "Hi — I'm Tokker. Let's talk freely; you lead the way. What's caught your attention lately?",
    "Hello, I'm Tokker. Good to have you here. What have you been thinking about?",
    "Hey, I'm Tokker. Let's dive in. Anything on your mind you'd like to explore?",
    "Hi there — I'm Tokker. Let's chat and see where it takes us. How have things been?",
    "Hello! I'm Tokker. Let's keep things flowing. What's a topic you enjoy talking about?",
  ],
  C1: [
    "Hello — I'm Tokker. Let's talk; you lead the way. What would you like to explore today?",
    "Hi, I'm Tokker. Good to see you. What's been occupying your thoughts recently?",
    "Hello — I'm Tokker. Let's just see where the conversation goes. Anything in particular?",
    "Hi there, I'm Tokker. Let's have a proper chat. What's been on your mind?",
    "Hello, I'm Tokker. Let's get into it — what would you care to discuss?",
  ],
  C2: [
    "Hello — I'm Tokker. Let's talk. Where would you like to begin?",
    "Hi, I'm Tokker. Delighted to chat. What's been drawing your interest lately?",
    "Hello — I'm Tokker. Let's see where this takes us. Anything you'd like to unpack?",
    "Good to see you — I'm Tokker. Let's converse freely. What's been on your mind?",
    "Hello, I'm Tokker. Let's talk and let it unfold. What would you like to dive into?",
  ],
};

export function greetingFor(level) {
  const options = GREETINGS[level] || GREETINGS.B1;
  return options[Math.floor(Math.random() * options.length)];
}

export function timestampNow() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}