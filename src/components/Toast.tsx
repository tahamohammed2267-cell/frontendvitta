import { CheckCircle2 } from "lucide-react";
import { useStore } from "../lib/store";

export default function Toast() {
  const toast = useStore((s) => s.toast);
  if (!toast) return null;
  return (
    <div className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 fade-up">
      <div className="flex items-center gap-2 rounded-lg border border-ink-800 bg-ink-900 px-4 py-2.5 text-[13px] font-medium text-white shadow-[0_8px_24px_rgba(11,14,20,0.25)]">
        <CheckCircle2 size={15} className="text-pos-600" />
        {toast}
      </div>
    </div>
  );
}
