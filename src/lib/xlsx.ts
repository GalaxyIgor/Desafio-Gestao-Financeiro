// Gerador de arquivos .xlsx (Office Open XML) sem dependências externas.
// Monta um pacote ZIP (método "store", sem compressão) com as partes mínimas
// que o Excel exige. Suporta células de texto e numéricas.

export type Cell = string | number | null | undefined;

export interface Sheet {
  name: string;
  rows: Cell[][];
}

// --- CRC32 ------------------------------------------------------------------

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    crc = CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

// --- XML helpers ------------------------------------------------------------

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// Converte índice de coluna (0-based) para referência A1 ("A", "B", ..., "AA").
function columnRef(index: number): string {
  let ref = "";
  let n = index + 1;
  while (n > 0) {
    const rem = (n - 1) % 26;
    ref = String.fromCharCode(65 + rem) + ref;
    n = Math.floor((n - 1) / 26);
  }
  return ref;
}

function sheetXml(rows: Cell[][]): string {
  const body = rows
    .map((row, r) => {
      const cells = row
        .map((cell, c) => {
          const ref = `${columnRef(c)}${r + 1}`;
          if (cell === null || cell === undefined || cell === "") {
            return "";
          }
          if (typeof cell === "number" && Number.isFinite(cell)) {
            return `<c r="${ref}"><v>${cell}</v></c>`;
          }
          return `<c r="${ref}" t="inlineStr"><is><t xml:space="preserve">${escapeXml(
            String(cell),
          )}</t></is></c>`;
        })
        .join("");
      return `<row r="${r + 1}">${cells}</row>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${body}</sheetData></worksheet>`;
}

// --- ZIP (store) ------------------------------------------------------------

interface ZipEntry {
  name: string;
  data: Uint8Array;
}

function encode(text: string): Uint8Array {
  return new TextEncoder().encode(text);
}

function buildZip(entries: ZipEntry[]): Uint8Array {
  const chunks: Uint8Array[] = [];
  const central: Uint8Array[] = [];
  let offset = 0;

  for (const entry of entries) {
    const nameBytes = encode(entry.name);
    const crc = crc32(entry.data);
    const size = entry.data.length;

    const local = new Uint8Array(30 + nameBytes.length);
    const lv = new DataView(local.buffer);
    lv.setUint32(0, 0x04034b50, true); // assinatura local file header
    lv.setUint16(4, 20, true); // versão necessária
    lv.setUint16(6, 0, true); // flags
    lv.setUint16(8, 0, true); // método = store
    lv.setUint16(10, 0, true); // hora
    lv.setUint16(12, 0, true); // data
    lv.setUint32(14, crc, true);
    lv.setUint32(18, size, true); // tamanho comprimido
    lv.setUint32(22, size, true); // tamanho original
    lv.setUint16(26, nameBytes.length, true);
    lv.setUint16(28, 0, true); // extra field
    local.set(nameBytes, 30);

    chunks.push(local, entry.data);

    const cd = new Uint8Array(46 + nameBytes.length);
    const cv = new DataView(cd.buffer);
    cv.setUint32(0, 0x02014b50, true); // assinatura central directory
    cv.setUint16(4, 20, true); // versão criador
    cv.setUint16(6, 20, true); // versão necessária
    cv.setUint16(8, 0, true);
    cv.setUint16(10, 0, true);
    cv.setUint16(12, 0, true);
    cv.setUint16(14, 0, true);
    cv.setUint32(16, crc, true);
    cv.setUint32(20, size, true);
    cv.setUint32(24, size, true);
    cv.setUint16(28, nameBytes.length, true);
    cv.setUint16(30, 0, true);
    cv.setUint16(32, 0, true);
    cv.setUint16(34, 0, true);
    cv.setUint16(36, 0, true);
    cv.setUint32(38, 0, true);
    cv.setUint32(42, offset, true);
    cd.set(nameBytes, 46);
    central.push(cd);

    offset += local.length + size;
  }

  const centralSize = central.reduce((sum, c) => sum + c.length, 0);
  const end = new Uint8Array(22);
  const ev = new DataView(end.buffer);
  ev.setUint32(0, 0x06054b50, true); // assinatura end of central directory
  ev.setUint16(8, entries.length, true);
  ev.setUint16(10, entries.length, true);
  ev.setUint32(12, centralSize, true);
  ev.setUint32(16, offset, true);

  const total =
    chunks.reduce((sum, c) => sum + c.length, 0) + centralSize + end.length;
  const out = new Uint8Array(total);
  let pos = 0;
  for (const c of chunks) {
    out.set(c, pos);
    pos += c.length;
  }
  for (const c of central) {
    out.set(c, pos);
    pos += c.length;
  }
  out.set(end, pos);
  return out;
}

// --- API pública ------------------------------------------------------------

export function buildWorkbook(sheets: Sheet[]): Blob {
  const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>${sheets
    .map(
      (_, i) =>
        `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`,
    )
    .join("")}</Types>`;

  const rootRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`;

  const workbook = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${sheets
    .map(
      (s, i) =>
        `<sheet name="${escapeXml(sanitizeSheetName(s.name))}" sheetId="${
          i + 1
        }" r:id="rId${i + 1}"/>`,
    )
    .join("")}</sheets></workbook>`;

  const workbookRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${sheets
    .map(
      (_, i) =>
        `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${
          i + 1
        }.xml"/>`,
    )
    .join("")}</Relationships>`;

  const entries: ZipEntry[] = [
    { name: "[Content_Types].xml", data: encode(contentTypes) },
    { name: "_rels/.rels", data: encode(rootRels) },
    { name: "xl/workbook.xml", data: encode(workbook) },
    { name: "xl/_rels/workbook.xml.rels", data: encode(workbookRels) },
    ...sheets.map((s, i) => ({
      name: `xl/worksheets/sheet${i + 1}.xml`,
      data: encode(sheetXml(s.rows)),
    })),
  ];

  return new Blob([buildZip(entries) as BlobPart], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

// Nomes de aba do Excel: máx. 31 caracteres e sem : \ / ? * [ ]
function sanitizeSheetName(name: string): string {
  return name.replace(/[:\\/?*[\]]/g, " ").slice(0, 31) || "Planilha";
}

export function downloadWorkbook(sheets: Sheet[], filename: string): void {
  const blob = buildWorkbook(sheets);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
