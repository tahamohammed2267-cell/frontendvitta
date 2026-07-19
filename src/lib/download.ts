// Triggers a real browser download of client-generated content — used for
// exports that can be derived from live store data (CSV/JSON), as opposed
// to the pre-made artifact files backing the Excel/Word/PDF/deck outputs.
function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function downloadJSON(data: unknown, filename: string) {
  saveBlob(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }), filename);
}

export function downloadCSV(rows: Record<string, unknown>[], filename: string) {
  if (rows.length === 0) {
    saveBlob(new Blob([""], { type: "text/csv" }), filename);
    return;
  }
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [headers.join(","), ...rows.map((r) => headers.map((h) => escape(r[h])).join(","))];
  saveBlob(new Blob([lines.join("\n")], { type: "text/csv" }), filename);
}
