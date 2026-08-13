import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTokkerConfig } from "@/lib/TokkerConfigContext";
import {
  ACCENTS,
  GENDERS,
  CEFR_LEVELS,
  CEFR_DESCRIPTIONS,
  SPEED_OPTIONS,
} from "@/lib/tokkerConfig";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AudioLines, Mic } from "lucide-react";

export default function Setup() {
  const { setConfig } = useTokkerConfig();
  const navigate = useNavigate();

  const [accent, setAccent] = useState("US");
  const [gender, setGender] = useState("Female");
  const [speed, setSpeed] = useState(1.0);
  const [cefr, setCefr] = useState("B1");

  const start = () => {
    setConfig({
      accent,
      gender,
      speechSpeed: speed,
      cefrLevel: cefr,
    });
    navigate("/conversation");
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-5 py-12 sm:py-16">
        <header className="flex items-center gap-3 mb-10">
          <div className="w-11 h-11 rounded-2xl bg-sky-400 flex items-center justify-center shadow-sm">
            <AudioLines className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Tokker
            </h1>
            <p className="text-sm text-slate-500">
              Speak English. Get gently corrected in Spanish.
            </p>
          </div>
        </header>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl text-slate-900">
              Set up your session
            </CardTitle>
            <CardDescription>
              Choose how Tokker should sound. Topics and lessons will emerge
            naturally from your conversation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-7">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Accent">
                <Select value={accent} onValueChange={setAccent}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ACCENTS.map((a) => (
                      <SelectItem key={a.value} value={a.value}>
                        {a.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Voice gender">
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GENDERS.map((g) => (
                      <SelectItem key={g.value} value={g.value}>
                        {g.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Speech speed">
                <Select
                  value={String(speed)}
                  onValueChange={(v) => setSpeed(parseFloat(v))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SPEED_OPTIONS.map((s) => (
                      <SelectItem key={s} value={String(s)}>
                        {s.toFixed(2)}x
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field label="CEFR level">
                <Select value={cefr} onValueChange={setCefr}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CEFR_LEVELS.map((l) => (
                      <SelectItem key={l} value={l}>
                        {l} — {CEFR_DESCRIPTIONS[l]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <Button
              onClick={start}
              size="lg"
              className="w-full bg-sky-400 hover:bg-sky-500 text-white rounded-xl h-12 text-base"
            >
              <Mic className="w-5 h-5 mr-2" />
              Start conversation
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-slate-700">{label}</Label>
      {children}
    </div>
  );
}