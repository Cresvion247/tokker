import { ACCENTS, GENDERS, SPEED_OPTIONS } from "@/lib/tokkerConfig";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function VoiceControls({ config, onChange }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label className="text-xs font-medium text-slate-600">Accent</Label>
          <Select value={config.accent} onValueChange={(v) => onChange({ accent: v })}>
            <SelectTrigger className="h-9">
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
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-medium text-slate-600">Voice gender</Label>
          <Select value={config.gender} onValueChange={(v) => onChange({ gender: v })}>
            <SelectTrigger className="h-9">
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
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-medium text-slate-600">Speech speed</Label>
          <Select
            value={String(config.speechSpeed)}
            onValueChange={(v) => onChange({ speechSpeed: parseFloat(v) })}
          >
            <SelectTrigger className="h-9">
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
        </div>
      </div>
      <p className="text-xs text-slate-400 mt-3">
        Changes apply to Tokker's next reply.
      </p>
    </div>
  );
}