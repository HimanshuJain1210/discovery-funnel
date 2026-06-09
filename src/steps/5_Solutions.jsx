import { useState } from 'react'
import { callGroq } from '../lib/groq'
import MethodNote from '../components/MethodNote'

function rice(s) {
  const reach = Number(s.reach) || 0, impact = Number(s.impact) || 0
  const confidence = Number(s.confidence) || 0, effort = Number(s.effort) || 0
  if (effort === 0) return 0
  return Math.round((reach * impact * (confidence / 100)) / effort)
}

export default function Solutions({ state, update, readOnly }) {
  const [loadingId, setLoadingId] = useState(null)
  const [err, setErr] = useState('')

  function add() {
    update({ solutions: [...state.solutions, {
      id: crypto.randomUUID(), title: '',
      opportunityId: state.opportunities[0]?.id || '',
      reach: 100, impact: 2, confidence: 80, effort: 2, experiment: null,
    }] })
  }
  function edit(id, field, value) {
    update({ solutions: state.solutions.map((s) => (s.id === id ? { ...s, [field]: value } : s)) })
  }
  function remove(id) { update({ solutions: state.solutions.filter((s) => s.id !== id) }) }

  async function draftExperiment(s) {
    const opp = state.opportunities.find((o) => o.id === s.opportunityId)
    if (!s.title) { setErr('Give the solution a title first.'); return }
    setErr(''); setLoadingId(s.id)
    try {
      const exp = await callGroq('experiments', { solution: s.title, opportunity: opp ? opp.title : '' })
      edit(s.id, 'experiment', exp)
    } catch (e) { setErr(e.message) } finally { setLoadingId(null) }
  }

  const sorted = [...state.solutions].sort((a, b) => rice(b) - rice(a))

  return (
    <div className="step">
      <h2>5 · Solutions</h2>
      <p className="hint">Add solutions, RICE-score them (auto), and test the riskiest assumption before building.</p>
      <MethodNote title="RICE & riskiest assumption">
        RICE = (Reach × Impact × Confidence) ÷ Effort — a rough priority score, not gospel.
        Before building the top one, find the single assumption that would sink it if false,
        and test that as cheaply as possible. Sorted by RICE below.
      </MethodNote>

      {!readOnly && (
        <button onClick={add} disabled={state.opportunities.length === 0}>+ Add solution</button>
      )}
      {state.opportunities.length === 0 && <p className="hint">Generate opportunities in step 4 first.</p>}

      {sorted.map((s) => (
        <div key={s.id} className="card">
          <div className="row-between">
            <input placeholder="Solution title" disabled={readOnly}
              value={s.title} onChange={(e) => edit(s.id, 'title', e.target.value)} />
            <span className="rice-badge">RICE {rice(s)}</span>
          </div>

          <label>Addresses opportunity</label>
          <select value={s.opportunityId} disabled={readOnly}
            onChange={(e) => edit(s.id, 'opportunityId', e.target.value)}>
            {state.opportunities.map((o) => <option key={o.id} value={o.id}>{o.title}</option>)}
          </select>

          <div className="rice-grid">
            {[['reach', 'Reach (people/qtr)'], ['impact', 'Impact (0.25–3)'],
              ['confidence', 'Confidence (%)'], ['effort', 'Effort (person-mo)']].map(([key, label]) => (
              <div key={key}>
                <label>{label}</label>
                <input type="number" value={s[key]} disabled={readOnly}
                  onChange={(e) => edit(s.id, key, e.target.value)} />
              </div>
            ))}
          </div>

          {!readOnly && (
            <button className="small" onClick={() => draftExperiment(s)} disabled={loadingId === s.id}>
              {loadingId === s.id ? 'Drafting…' : s.experiment ? 'Redraft experiment' : 'Draft experiment card'}
            </button>
          )}

          {s.experiment && (
            <div className="experiment">
              {s.experiment.risk_type && <span className="tag">{s.experiment.risk_type} risk</span>}
              <p><strong>Riskiest assumption:</strong> {s.experiment.assumption}</p>
              <p><strong>Hypothesis:</strong> {s.experiment.hypothesis}</p>
              <p><strong>Method:</strong> {s.experiment.method}</p>
              <p><strong>Metric:</strong> {s.experiment.metric} — success at {s.experiment.threshold}</p>
              {s.experiment.duration && <p><strong>Duration:</strong> {s.experiment.duration}</p>}
            </div>
          )}

          {!readOnly && (
            <div className="row-between"><span />
              <button className="small danger" onClick={() => remove(s.id)}>Remove</button>
            </div>
          )}
        </div>
      ))}
      {err && <p className="err">{err}</p>}
    </div>
  )
}
