import { useEffect } from "react";
import { FileText, X } from "lucide-react";
import { useStore } from "../lib/store";

// The "provenance moment" — clicking any source chip anywhere in the app
// opens this drawer with a styled facsimile of the cited document page so
// a reviewer never has to take an extracted value on faith.
export default function SourceDrawer() {
  const drawer = useStore((s) => s.sourceDrawer);
  const close = useStore((s) => s.closeSourceDrawer);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  if (!drawer) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-ink-950/20" onClick={close} />
      <div className="fixed inset-y-0 right-0 z-50 flex w-[420px] flex-col border-l border-ink-200 bg-white shadow-[0_0_32px_rgba(11,14,20,0.14)]">
        <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-ink-100 px-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-ink-100 text-ink-600"><FileText size={15} /></div>
          <p className="text-[13.5px] font-semibold">Source</p>
          <button onClick={close} className="ml-auto rounded-md p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700"><X size={15} /></button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          {drawer.field && (
            <div className="mb-4 space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">Field</p>
              <p className="text-[15px] font-semibold tracking-tight">{drawer.field}</p>
              {drawer.value && <p className="num text-[20px] font-semibold tracking-tight text-ink-900">{drawer.value}</p>}
              {typeof drawer.confidence === "number" && drawer.confidence > 0 && (
                <p className="text-[12px] text-ink-500">Confidence <span className="num font-medium text-ink-700">{Math.round(drawer.confidence * 100)}%</span></p>
              )}
            </div>
          )}

          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-400">Document page</p>
          <div className="rounded-lg border border-ink-200 bg-ink-50/60 p-5">
            <div className="mb-4 flex items-center justify-between border-b border-ink-200 pb-3">
              <p className="truncate text-[12.5px] font-medium text-ink-700">{drawer.doc}</p>
              {drawer.page > 0 && <span className="num shrink-0 text-[11px] text-ink-400">page {drawer.page}</span>}
            </div>
            {drawer.snippet ? (
              <p className="font-serif text-[14px] leading-relaxed text-ink-800">
                …{drawer.snippet.replace(/^…|…$/g, "")}…
              </p>
            ) : (
              <p className="text-[12.5px] italic text-ink-400">No excerpt captured for this citation — open the document to review in full.</p>
            )}
          </div>
          <p className="mt-3 text-[11px] text-ink-400">Extracted automatically · every canonical value traces back to a source document and page.</p>
        </div>
      </div>
    </>
  );
}
