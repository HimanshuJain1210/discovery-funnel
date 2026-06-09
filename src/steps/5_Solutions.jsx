import { useState } from 'react'
import { callGroq } from '../lib/groq'
import MethodNote from '../components/MethodNote'

function rice(s) {
  const reach = Number(s.reach) || 0, impact = Number(s.impact) || 0
  const confidence = Number(s.confidence) || 0, effort = Number(s.effort) || 0
  if (effort === 0) return 0
  return Math.round((reach * impact * (confidence / 100)) / effort)
}
function clampNum(field, raw) {
  let n = Number(raw)
  if (Number.isNaN(n)) return ''
  // Sensible bounds per field so the score can't lie.
  if (field === 'confidence') n = Math.min(100, Math.max(0, n))
  else if (field === 'impact') n = Math.min(3, Math.max(0, n))
  else n = Math.max(0, n) // reach, effort
  return n
}

export const STATUSES = [
  { key: 'not_started', label: 'Not started' },
  { key: 'building', label: 'Building' },
  { key: 'validated', label: 'Validated' },
  { key: 'invalidated', label: 'Invalidated' },
]
const STATUS_LABEL = Object.fromEntries(STATUSES.map((s) => [s.key, s.label]))

export default function Solutions({ state, update, readOnly, goTo }) {
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
  function editNum(id, field, value) { edit(id, field, clampNum(field, value)) }
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
  const top = sorted[0]
  const hasScored = state.solutions.length > 0
  const validatedCount = state.solutions.filter((s) => s.status === 'validated').length
  const invalidatedCount = state.solutions.filter((s) => s.status === 'invalidated').length

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
        <button className="primary" onClick={add} disabled={state.opportunities.length === 0}>+ Add solution</button>
      )}
      {state.opportunities.length === 0 && (
        <p className="hint">No opportunities yet. {!readOnly && goTo && (
          <button className="small" onClick={() => goTo(3)}>← Go to step 4 to generate them</button>
        )}</p>
      )}

      {sorted.map((s) => (
        <div key={s.id} className="card">
          <div className="row-between">
            <input placeholder="Solution title" disabled={readOnly}
              value={s.title} onChange={(e) => edit(s.id, 'title', e.target.value)} />
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              {s.status && s.status !== 'not_started' && (
                <span className={`status-pill st-${s.status}`}>{STATUS_LABEL[s.status]}</span>
              )}
              <span className="rice-badge">RICE {rice(s)}</span>
            </div>
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
                  onChange={(e) => editNum(s.id, key, e.target.value)} />
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

              {/* Experiment result tracker — closes the discovery loop */}
              <div className="tracker">
                <label>Experiment status</label>
                <div className="status-row">
                  {STATUSES.map((st) => (
                    <button key={st.key} disabled={readOnly}
                      className={`small status-btn ${s.status === st.key ? 'active' : ''} st-${st.key}`}
                      onClick={() => edit(s.id, 'status', st.key)}>{st.label}</button>
                  ))}
                </div>
                {(s.status === 'validated' || s.status === 'invalidated') && (
                  <>
                    <label>Result — what did the metric actually do?</label>
                    <input placeholder={`e.g. hit ${s.experiment.metric || 'the metric'}: 32% vs ${s.experiment.threshold || 'target'}`}
                      disabled={readOnly} value={s.result || ''}
                      onChange={(e) => edit(s.id, 'result', e.target.value)} />
                  </>
                )}
                {s.status && s.status !== 'not_started' && (
                  <>
                    <label>What you learned</label>
                    <textarea rows={2} disabled={readOnly}
                      placeholder="The takeaway — what this changes about your next move."
                      value={s.learnings || ''} onChange={(e) => edit(s.id, 'learnings', e.target.value)} />
                  </>
                )}
              </div>
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

      {/* #1 — completion state: gives the funnel a real ending */}
      {!readOnly && hasScored && (
        <div className="complete-card">
          <span className="eyebrow">Discovery loop</span>
          <h3>{validatedCount > 0 ? "You've closed the loop." : "You've run a full discovery cycle."}</h3>
          {top && (
            <p className="hint">
              Your highest-priority bet is <strong style={{ color: 'var(--text)' }}>{top.title || 'your top solution'}</strong> (RICE {rice(top)}).
              {!top.experiment && ' Draft its experiment card above before you build.'}
              {top.experiment && !top.status && ' Run it, then log the result above to close the loop.'}
              {top.status === 'validated' && ' Validated — strong evidence to build.'}
              {top.status === 'invalidated' && ' Invalidated — better to learn this now than after building.'}
            </p>
          )}
          {(validatedCount > 0 || invalidatedCount > 0) && (
            <p className="hint">{validatedCount} validated · {invalidatedCount} invalidated · {state.solutions.length} total</p>
          )}
          <div className="complete-actions">
            {goTo && <button onClick={() => goTo('tree')}>View the tree</button>}
            {goTo && <button onClick={() => goTo('insights')}>See insights</button>}
            <button className="primary" onClick={() => goTo && goTo('export')}>Export / share</button>
          </div>
        </div>
      )}
    </div>
  )
}
