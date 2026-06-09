import MethodNote from '../components/MethodNote'

const EV_LABEL = {
  past_behaviour: 'past behaviour', money_spent: 'money spent', time_spent: 'time spent',
  workaround: 'workaround', abandoned_attempt: 'abandoned attempt', emotional: 'emotional',
}

export default function PainPoints({ state, update, readOnly }) {
  function setSeverity(id, severity) {
    update({ painpoints: state.painpoints.map((p) => (p.id === id ? { ...p, severity } : p)) })
  }
  function remove(id) { update({ painpoints: state.painpoints.filter((p) => p.id !== id) }) }
  function editText(id, text) {
    update({ painpoints: state.painpoints.map((p) => (p.id === id ? { ...p, text } : p)) })
  }

  const order = { high: 0, medium: 1, low: 2 }
  const sorted = [...state.painpoints].sort((a, b) => order[a.severity] - order[b.severity])

  return (
    <div className="step">
      <h2>3 · Pain points</h2>
      <p className="hint">Extracted signals ranked by severity. Edit, re-rank, or drop noise.</p>
      <MethodNote title="Signal vs noise">
        Signal is what people actually did: money spent, time wasted, workarounds built, attempts abandoned.
        Noise is compliments, "I would use that", and feature requests. Only signal earns a pain point.
        Each card shows the evidence type the model found.
      </MethodNote>

      {sorted.length === 0 && <p className="hint">No pain points yet — extract them in step 2.</p>}

      {sorted.map((p) => (
        <div key={p.id} className={`card sev-${p.severity}`}>
          <textarea rows={2} value={p.text} disabled={readOnly}
            onChange={(e) => editText(p.id, e.target.value)} />
          <div className="tag-row">
            {p.evidence_type && <span className="tag">{EV_LABEL[p.evidence_type] || p.evidence_type}</span>}
          </div>
          {p.evidence && <p className="evidence">Evidence: {p.evidence}</p>}
          {!readOnly && (
            <div className="row-between">
              <div className="sev-buttons">
                {['high', 'medium', 'low'].map((s) => (
                  <button key={s} className={`small ${p.severity === s ? 'active' : ''}`}
                    onClick={() => setSeverity(p.id, s)}>{s}</button>
                ))}
              </div>
              <button className="small danger" onClick={() => remove(p.id)}>Remove</button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
