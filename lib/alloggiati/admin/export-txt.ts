/**
 * Porting di generateAndDownloadTXT(): scarica le righe già costruite da
 * buildRecordsForSelected (formato fisso 168 char, separatore CRLF come
 * richiesto dallo standard Alloggiati Web).
 */
export function downloadRecordsTxt(records: string[], structureLabel: string): void {
  if (records.length === 0) return;
  const content = records.join("\r\n");
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const dateStr = new Date().toISOString().slice(0, 10);
  a.download = `alloggiati_${structureLabel.replace(/\s+/g, "_")}_${dateStr}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
