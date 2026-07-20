import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button, Modal } from "../../../lib/ui";
import { cn } from "../../../lib/cn";

const firmUsers = ["Jane Moreau", "A. Lindqvist", "R. Chen", "S. Okafor", "M. Ferreira"];

export default function ShareDashboardModal({
  open, onClose, sharedWith, onChange, dashboardName,
}: { open: boolean; onClose: () => void; sharedWith: string[]; onChange: (users: string[]) => void; dashboardName: string }) {
  const [copied, setCopied] = useState(false);

  function toggle(user: string) {
    onChange(sharedWith.includes(user) ? sharedWith.filter((u) => u !== user) : [...sharedWith, user]);
  }

  function copyLink() {
    navigator.clipboard?.writeText(window.location.href).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <Modal open={open} onClose={onClose} title="Share dashboard" sub={dashboardName} width="440px">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-400">Firm members</p>
      <div className="mb-4 space-y-1">
        {firmUsers.map((u) => (
          <label key={u} className={cn("flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px]", sharedWith.includes(u) ? "bg-accent-50 text-accent-800" : "text-ink-700 hover:bg-ink-50")}>
            <input type="checkbox" checked={sharedWith.includes(u)} onChange={() => toggle(u)} className="h-3.5 w-3.5 rounded border-ink-300 accent-accent-600" />
            {u}
          </label>
        ))}
      </div>
      <Button variant="secondary" className="w-full justify-center" onClick={copyLink}>
        {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Link copied" : "Copy link"}
      </Button>
    </Modal>
  );
}
