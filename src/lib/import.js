// Lazy-loads SheetJS only when a file is actually imported.
export async function parseSpreadsheet(file) {
  const XLSX = await import('xlsx')
  const buf = await file.arrayBuffer()
  const wb = XLSX.read(buf, { type: 'array' })
  const sheet = wb.Sheets[wb.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, blankrows: false })
  if (!rows.length) return { headers: [], rows: [] }
  const headers = rows[0].map((h) => String(h ?? '').trim())
  const body = rows.slice(1).filter((r) => r.some((c) => String(c ?? '').trim()))
  return { headers, rows: body }
}

// Build interview objects from parsed rows + chosen column indexes.
export function rowsToInterviews(rows, nameCol, notesCol) {
  return rows
    .map((r) => ({
      id: crypto.randomUUID(),
      name: String(r[nameCol] ?? '').trim() || 'Unnamed',
      notes: String(r[notesCol] ?? '').trim(),
    }))
    .filter((i) => i.notes)
}
