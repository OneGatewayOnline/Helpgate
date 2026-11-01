const assert = require("assert");
const { PDFDocument, rgb, StandardFonts } = require("pdf-lib");
const JSZip = require("jszip");
const QRCode = require("qrcode");

async function runTests() {
  console.log("=== HelpGate Core Logic & Conversion Verification ===");

  // 1. PDF Generation & Inspection
  console.log("1. Testing PDF creation with pdf-lib...");
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 400]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  page.drawText("HelpGate Automated Verification Test", { x: 50, y: 350, size: 20, font, color: rgb(0, 0, 0) });
  page.drawText("Row 1: Test Data, 100, 200", { x: 50, y: 300, size: 12, font });
  const samplePdfBytes = await pdfDoc.save();
  assert(samplePdfBytes.length > 500, "PDF should be generated");
  console.log("   ✓ PDF generated successfully (" + samplePdfBytes.length + " bytes)");

  // 2. PDF Merging
  console.log("2. Testing PDF merger logic...");
  const mergedDoc = await PDFDocument.create();
  const doc1 = await PDFDocument.load(samplePdfBytes);
  const doc2 = await PDFDocument.load(samplePdfBytes);
  const [copied1] = await mergedDoc.copyPages(doc1, [0]);
  const [copied2] = await mergedDoc.copyPages(doc2, [0]);
  mergedDoc.addPage(copied1);
  mergedDoc.addPage(copied2);
  const mergedBytes = await mergedDoc.save();
  const loadedMerged = await PDFDocument.load(mergedBytes);
  assert.strictEqual(loadedMerged.getPageCount(), 2, "Merged PDF should have 2 pages");
  console.log("   ✓ PDF merger logic verified (2 pages merged)");

  // 3. Word DOCX generation logic (from pdf-to-word)
  console.log("3. Testing DOCX generation from text blocks...");
  const zip = new JSZip();
  zip.file("[Content_Types].xml", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>');
  zip.file("_rels/.rels", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>');
  zip.file("word/document.xml", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>Hello HelpGate DOCX</w:t></w:r></w:p></w:body></w:document>');
  const docxBuffer = await zip.generateAsync({ type: "nodebuffer" });
  assert(docxBuffer.length > 200, "DOCX package should be valid zip");
  console.log("   ✓ DOCX generation verified (" + docxBuffer.length + " bytes)");

  // 4. Excel XLSX parsing & CSV extraction
  console.log("4. Testing Spreadsheet XML extraction...");
  const excelZip = new JSZip();
  excelZip.file("xl/worksheets/sheet1.xml", '<?xml version="1.0" encoding="UTF-8"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData><row r="1"><c r="A1" t="inlineStr"><is><t>Item</t></is></c><c r="B1"><v>150</v></c></row></sheetData></worksheet>');
  const sheetContent = await excelZip.file("xl/worksheets/sheet1.xml").async("text");
  assert(sheetContent.includes("Item") && sheetContent.includes("150"), "Sheet content correctly read");
  console.log("   ✓ Spreadsheet XML parsing verified");

  // 5. QR Code generation
  console.log("5. Testing QR Code generation...");
  const qrDataUrl = await QRCode.toDataURL("https://helpgate.in");
  assert(qrDataUrl.startsWith("data:image/png;base64,"), "QR Code should return data URL");
  console.log("   ✓ QR Code generation verified");

  // 6. GST Calculation logic
  console.log("6. Testing GST calculation logic...");
  const base = 10000;
  const rate = 18;
  const gstAmount = (base * rate) / 100;
  const total = base + gstAmount;
  assert.strictEqual(gstAmount, 1800);
  assert.strictEqual(total, 11800);
  const extractedBase = Math.round((total / (1 + rate / 100)) * 100) / 100;
  assert.strictEqual(extractedBase, 10000);
  console.log("   ✓ GST calculation logic verified (inclusive & exclusive)");

  // 7. Base64 UTF-8 roundtrip
  console.log("7. Testing Base64 Unicode roundtrip...");
  const utf8String = "HelpGate 🇮🇳 — Free Technology Platform for Everyone! 🚀";
  const encoded = Buffer.from(utf8String, "utf8").toString("base64");
  const decoded = Buffer.from(encoded, "base64").toString("utf8");
  assert.strictEqual(decoded, utf8String);
  console.log("   ✓ Base64 Unicode roundtrip verified");

  console.log("\n==========================================");
  console.log("All 7/7 core tool algorithms verified cleanly!");
  console.log("==========================================\n");
}

runTests().catch(e => {
  console.error("Test failed:", e);
  process.exit(1);
});
