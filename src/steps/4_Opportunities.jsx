import { useState } from 'react'
import { callGroq } from '../lib/groq'
import MethodNote from '../components/MethodNote'

export default function Opportunities({ state, update, readOnly }) {
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  async function generate() {
    if (state.painpoints.length === 0) { setErr('Add pain points in step 3 first.'); return }
    setErr(''); setLoading(true)
    try {
      const opps = await callGroq('opportunities', {
        outcome: state.outcome,
        painpoints: state.painpoints.map((p) => ({ text: p.text, severity: p.severity })),
      })
      // Preserve existing IDs where the title matches, so solutions stay linked
      // to their opportunity even after a regenerate.
      const prev = state.opportunities
      const withIds = (Array.isArray(opps) ? opps : []).map((o) => {
        const match = prev.find((p) => p.title?.trim().toLowerCase() === o.title?.trim().toLowerCase())
        return { id: match ? match.id : crypto.randomUUID(), ...o }
      })
      update({ opportunities: withIds })
    } catch (e) { setErr(e.message) } finally { setLoading(false) }
  }

  function editTitle(id, title) {
    update({ opportunities: state.opportunities.map((o) => (o.id === id ? { ...o, title } : o)) })
  }
  function remove(id) { update({ opportunities: state.opportunities.filter((o) => o.id !== id) }) }

  return (
    <div className="step">
      <h2>4 · Opportunities</h2>
      <p className="hint">Pain points clustered into opportunities — needs to solve, not solutions yet.</p>
      <MethodNote title="Opportunity, not solution">
        An opportunity is framed from the customer's view as an unmet need: "students can't tell if their
        answer is exam-ready". The moment it sounds like a feature ("build an AI grader"), it's a solution —
        that belongs in step 5.
      </MethodNote>

      {!readOnly && (
        <button onClick={generate} disabled={loading}>
          {loading ? 'Clustering…' : state.opportunities.length ? 'Regenerate opportunities' : 'Generate opportunities'}
        </button>
      )}

      {state.opportunities.map((o) => (
        <div key={o.id} className="card">
          <textarea rows={2} value={o.title} disabled={readOnly}
            onChange={(e) => editTitle(o.id, e.target.value)} />
          {o.rationale && <p className="evidence">{o.rationale}</p>}
          {typeof o.pain_count === 'number' && (
            <span className="tag">{o.pain_count} pain point{o.pain_count === 1 ? '' : 's'}</span>
          )}
          {!readOnly && (
            <div className="row-between"><span />
              <button className="small danger" onClick={() => remove(o.id)}>Remove</button>
            </div>
          )}
        </div>
      ))}
      {err && <p className="err">{err}</p>}
    </div>
  )
}
