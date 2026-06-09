import { useState, lazy, Suspense } from 'react'
import { callGroq } from '../lib/groq'

const Charts = lazy(() => import('./Charts'))

function rice(s) {
  const r = Number(s.reach) || 0, i = Number(s.impact) || 0
  const c = Number(s.confidence) || 0, e = Number(s.effort) || 0
  return e === 0 ? 0 : Math.round((r * i * (c / 100)) / e)
}

export default function Insights({ state, update }) {
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const synth = state.synthesis

  const sevCounts = ['high', 'medium', 'low'].map((s) => ({
    name: s, value: state.painpoints.filter((p) => p.severity === s).length,
  }))
  const evCounts = {}
  state.painpoints.forEach((p) => { if (p.evidence_type) evCounts[p.evidence_type] = (evCounts[p.evidence_type] || 0) + 1 })
  const evData = Object.entries(evCounts).map(([k, v]) => ({ name: k.replace(/_/g, ' '), value: v }))
  const riceData = [...state.solutions].sort((a, b) => rice(b) - rice(a)).slice(0, 6)
    .map((s) => ({ name: (s.title || 'Untitled').slice(0, 18), RICE: rice(s) }))

  async function runSynthesis() {
    const interviews = state.interviews.filter((i) => i.notes)
    if (interviews.length === 0) { setErr('Add interviews first.'); return }
    setErr(''); setLoading(true)
    try {
      const result = await callGroq('synthesis', {
        idea: state.idea, outcome: state.outcome,
        interviews: interviews.map((i) => ({ name: i.name || 'Unnamed', notes: i.notes })),
      })
      update({ synthesis: result })
    } catch (e) { setErr(e.message) } finally { setLoading(false) }
  }

  const hasData = state.painpoints.length > 0 || state.solutions.length > 0

  return (
    <div className="step">
      <h2>Insights</h2>
      <p className="hint">Cross-interview synthesis and a live read on your discovery data.</p>

      <div className="stat-row">
        <div className="stat"><div className="big">{state.interviews.filter((i) => i.notes).length}</div><div className="lbl">Interviews</div></div>
        <div className="stat"><div className="big">{state.painpoints.length}</div><div className="lbl">Pain points</div></div>
        <div className="stat"><div className="big">{state.opportunities.length}</div><div className="lbl">Opportunities</div></div>
        <div className="stat"><div className="big">{state.solutions.length}</div><div className="lbl">Solutions</div></div>
      </div>

      <div className="synthesis">
        <div className="row-between">
          <h3>AI synthesis across interviews</h3>
          <button className="small primary" onClick={runSynthesis} disabled={loading}>
            {loading ? 'Analysing…' : synth ? 'Re-run' : 'Run synthesis'}
          </button>
        </div>
        {!synth && !loading && <p className="hint">Reads all your interviews and surfaces recurring themes, surprises, and what to investigate next.</p>}
        {synth && (
          <div style={{ marginTop: 12 }}>
            <p style={{ color: 'var(--text)' }}>{synth.summary}</p>
            {synth.confidence && <span className="tag">confidence: {synth.confidence}</span>}
            {Array.isArray(synth.themes) && (
              <div style={{ marginTop: 12 }}>
                {synth.themes.map((t, i) => (
                  <div key={i} className="theme-chip" title={t.description}>
                    {t.title} {typeof t.frequency === 'number' && <strong>· {t.frequency}</strong>}
                  </div>
                ))}
              </div>
            )}
            {Array.isArray(synth.surprises) && synth.surprises.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <strong style={{ fontSize: 13 }}>Surprises</strong>
                <ul style={{ margin: '6px 0', paddingLeft: 18 }}>
                  {synth.surprises.map((s, i) => <li key={i} style={{ color: 'var(--text-2)', fontSize: 13.5 }}>{s}</li>)}
                </ul>
              </div>
            )}
            {synth.next && <p className="evidence">Next: {synth.next}</p>}
          </div>
        )}
        {err && <p className="err">{err}</p>}
      </div>

      {hasData && (
        <div className="insights">
          {state.painpoints.length > 0 && (
            <div className="insight-card">
              <h3>Pain points by severity</h3>
              <Suspense fallback={<div className="skel" />}><Charts type="severity" data={sevCounts} /></Suspense>
            </div>
          )}
          {evData.length > 0 && (
            <div className="insight-card">
              <h3>Evidence types</h3>
              <Suspense fallback={<div className="skel" />}><Charts type="evidence" data={evData} /></Suspense>
            </div>
          )}
          {riceData.length > 0 && (
            <div className="insight-card" style={{ gridColumn: '1 / -1' }}>
              <h3>Solutions by RICE score</h3>
              <Suspense fallback={<div className="skel" />}><Charts type="rice" data={riceData} /></Suspense>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
