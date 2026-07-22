import { useState } from "react";
import { portfolioProjects } from "../../../../lib/portfolioData";
import { Button, Modal } from "../../../../lib/ui";
import { addCustomGroup, type CustomGroup } from "./customGroupStore";

export default function CustomGroupBuilderModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: (group: CustomGroup) => void }) {
  const [name, setName] = useState("");
  const [projectIds, setProjectIds] = useState<string[]>([]);

  function toggle(id: string) {
    setProjectIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
  }

  function close() {
    setName(""); setProjectIds([]); onClose();
  }

  function create() {
    if (projectIds.length < 2) return;
    const label = name.trim() || `Custom Group (${projectIds.length} projects)`;
    const group = addCustomGroup(label, projectIds);
    onCreated(group);
    close();
  }

  return (
    <Modal open={open} onClose={close} title="Build a custom benchmark group" sub="Select 2 or more projects, then name and save the group" width="480px">
      <input
        value={name} onChange={(e) => setName(e.target.value)} placeholder="Group name (e.g. European Assets)"
        className="mb-2.5 w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-[12.5px] outline-none placeholder:text-ink-400 focus:border-accent-500"
      />
      <div className="mb-4 max-h-[280px] space-y-0.5 overflow-y-auto rounded-lg border border-ink-100 p-1.5">
        {portfolioProjects.map((p) => (
          <label key={p.id} className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[12.5px] hover:bg-ink-50">
            <input type="checkbox" checked={projectIds.includes(p.id)} onChange={() => toggle(p.id)} className="h-3.5 w-3.5 rounded border-ink-300 accent-accent-600" />
            <span className="truncate font-medium text-ink-800">{p.name}</span>
          </label>
        ))}
      </div>
      <div className="flex justify-between">
        <Button variant="ghost" onClick={close}>Cancel</Button>
        <Button className={projectIds.length < 2 ? "pointer-events-none opacity-40" : ""} onClick={create}>Save group ({projectIds.length})</Button>
      </div>
    </Modal>
  );
}
