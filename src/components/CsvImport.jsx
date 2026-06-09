import { useState } from 'react'
import { parseSpreadsheet, rowsToInterviews } from '../lib/import'

// Modal: upload .csv/.xlsx, map columns, preview, import.
export default function CsvImport({ onClose, onImport }) {
  const [parsed, setParsed] = useState(null)
  const [nameCol, setNameCol] = useState(0)
  const [notesCol, setNotesCol] = useState(1)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setErr(''); setBusy(true)
    try {
      const data = await parseSpreadsheet(file)
      if (!data.headers.length) { setErr('That file looks empty.'); setBusy(false); return }
      setParsed(data)
      // Heuristic: guess columns by header name.
      const lower = data.headers.map((h) => h.toLowerCase())
      const nameGuess = lower.findIndex((h) => /name|who|person|interviewee|segment|respondent/.test(h))
      const notesGuess = lower.findIndex((h) => /note|transcript|response|answer|feedback|comment|detail/.test(h))
      setNameCol(nameGuess >= 0 ? nameGuess : 0)
      setNotesCol(notesGuess >= 0 ? notesGuess : (data.headers.length > 1 ? 1 : 0))
    } catch {
      setErr('Could not read that file. Use a .csv or .xlsx with a header row.')
    } finally { setBusy(false) }
  }

  function doImport() {
    const interviews = rowsToInterviews(parsed.rows, nameCol, notesCol)
    if (!interviews.length) { setErr('No rows with notes found in the notes column.'); return }
    onImport(interviews)
  }

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="row-between">
          <h2>Import interviews</h2>
          <button className="small ghost" onClick={onClose}>Close</button>
        </div>
        <p className="hint">Upload a CSV or Excel file with one interview per row. We'll map the columns.</p>

        {!parsed && (
          <>
            <label>Choose file (.csv, .xlsx)</label>
            <input type="file" accept=".csv,.xlsx,.xls" onChange={handleFile} disabled={busy} />
            {busy && <p className="hint">Reading file…</p>}
          </>
        )}

        {parsed && (
          <>
            <div className="map-row">
              <div>
                <label>Name / segment column</label>
                <select value={nameCol} onChange={(e) => setNameCol(Number(e.target.value))}>
                  {parsed.headers.map((h, i) => <option key={i} value={i}>{h || `Column ${i + 1}`}</option>)}
                </select>
              </div>
              <div>
                <label>Interview notes column</label>
                <select value={notesCol} onChange={(e) => setNotesCol(Number(e.target.value))}>
                  {parsed.headers.map((h, i) => <option key={i} value={i}>{h || `Column ${i + 1}`}</option>)}
                </select>
              </div>
            </div>

            <table className="preview-table">
              <thead><tr><th>{parsed.headers[nameCol] || 'Name'}</th><th>{parsed.headers[notesCol] || 'Notes'}</th></tr></thead>
              <tbody>
                {parsed.rows.slice(0, 4).map((r, i) => (
                  <tr key={i}>
                    <td>{String(r[nameCol] ?? '').slice(0, 40)}</td>
                    <td>{String(r[notesCol] ?? '').slice(0, 80)}…</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="hint">{parsed.rows.length} rows found. Showing first 4.</p>

            <div className="row-between" style={{ marginTop: 16 }}>
              <button className="ghost" onClick={() => setParsed(null)}>Choose another file</button>
              <button className="primary" onClick={doImport}>Import {parsed.rows.length} interviews</button>
            </div>
          </>
        )}
        {err && <p className="err">{err}</p>}
      </div>
    </div>
  )
}
