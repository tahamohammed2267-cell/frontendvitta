// Generates real, openable Excel / Word / PDF / PowerPoint files client-side
// from live store data — these are genuine files (valid .xlsx/.docx/.pdf/.pptx
// binaries), just built from fixture-backed content instead of a real model.
import ExcelJS from "exceljs";
import { Document, HeadingLevel, Packer, Paragraph, TextRun } from "docx";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import PptxGenJS from "pptxgenjs";

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

export interface BlueprintRow {
  cell: string;
  field: string;
  value: string;
  state: "populated" | "computed" | "missing";
  src?: string;
  page?: number;
}

export async function generateExcelBlueprint(rows: BlueprintRow[], dealName: string) {
  const wb = new ExcelJS.Workbook();
  wb.creator = "vitta";
  const ws = wb.addWorksheet("Blueprint");
  ws.columns = [
    { header: "Cell", key: "cell", width: 14 },
    { header: "Canonical field", key: "field", width: 28 },
    { header: "Value", key: "value", width: 20 },
    { header: "State", key: "state", width: 16 },
    { header: "Source document", key: "src", width: 30 },
    { header: "Page", key: "page", width: 8 },
  ];
  ws.getRow(1).font = { bold: true };
  rows.forEach((r) => ws.addRow({ cell: r.cell, field: r.field, value: r.value || "—", state: r.state, src: r.src ?? "—", page: r.page ?? "" }));
  const buf = await wb.xlsx.writeBuffer();
  saveBlob(new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), `${dealName}_blueprint.xlsx`);
}

export interface MemoSection {
  title: string;
  body: string;
}

export async function generateMemoDocx(sections: MemoSection[], dealName: string) {
  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({ text: `${dealName} — IC Memo`, heading: HeadingLevel.TITLE }),
          ...sections.flatMap((s) => [
            new Paragraph({ text: s.title, heading: HeadingLevel.HEADING_1, spacing: { before: 240 } }),
            new Paragraph({ children: [new TextRun(s.body)] }),
          ]),
        ],
      },
    ],
  });
  const blob = await Packer.toBlob(doc);
  saveBlob(blob, `${dealName}_IC_Memo.docx`);
}

export async function generateMemoPdf(sections: MemoSection[], dealName: string) {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const margin = 56;
  const pageWidth = 612;
  const pageHeight = 792;
  const maxWidth = pageWidth - margin * 2;

  let page = pdf.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;

  function wrap(text: string, size: number, f: typeof font) {
    const words = text.split(/\s+/);
    const lines: string[] = [];
    let line = "";
    for (const w of words) {
      const trial = line ? `${line} ${w}` : w;
      if (f.widthOfTextAtSize(trial, size) > maxWidth) {
        if (line) lines.push(line);
        line = w;
      } else {
        line = trial;
      }
    }
    if (line) lines.push(line);
    return lines;
  }

  function ensureSpace(lineHeight: number) {
    if (y < margin + lineHeight) {
      page = pdf.addPage([pageWidth, pageHeight]);
      y = pageHeight - margin;
    }
  }

  page.drawText(`${dealName} — IC Memo`, { x: margin, y, size: 20, font: bold, color: rgb(0.07, 0.09, 0.12) });
  y -= 34;

  for (const s of sections) {
    ensureSpace(28);
    page.drawText(s.title, { x: margin, y, size: 13, font: bold, color: rgb(0.05, 0.37, 0.27) });
    y -= 20;
    for (const line of wrap(s.body, 10.5, font)) {
      ensureSpace(16);
      page.drawText(line, { x: margin, y, size: 10.5, font, color: rgb(0.1, 0.12, 0.16) });
      y -= 15;
    }
    y -= 12;
  }

  const bytes = await pdf.save();
  saveBlob(new Blob([bytes as BlobPart], { type: "application/pdf" }), `${dealName}_IC_Memo.pdf`);
}

export async function generateDeckPptx(slideTitles: string[], dealName: string) {
  const pptx = new PptxGenJS();
  slideTitles.forEach((title, i) => {
    const slide = pptx.addSlide();
    slide.addText(title, { x: 0.5, y: 0.4, w: 9, h: 0.8, fontSize: 24, bold: true, color: "12161F" });
    slide.addText(`${dealName} · ${i + 1} / ${slideTitles.length}`, { x: 0.5, y: 5.2, w: 9, h: 0.3, fontSize: 10, color: "8A93A6" });
  });
  const blob = (await pptx.write({ outputType: "blob" })) as Blob;
  saveBlob(blob, `${dealName}_IC_Deck.pptx`);
}
