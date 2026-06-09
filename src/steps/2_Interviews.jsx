import { useState } from 'react'
import { callGroq } from '../lib/groq'
import MethodNote from '../components/MethodNote'

export default function Interviews({ state, update, readOnly }) {
  const [loadingQ, setLoadingQ] = useState(false)
  const [loadingP, setLoadingP] = useState(false)
  const [err, setErr] = useState('')

  async function genQuestions() {
    if (!state.idea || !state.outcome) { setErr('Fill in the idea and outcome in step 1 first.'); return }
    setErr(''); setLoadingQ(true)
    try {
      const qs = await callGroq('questions', { idea: state.idea, outcome: state.outcome })
      update({ questions: Array.isArray(qs) ? qs : [] })
    } catch (e) { setErr(e.message) } finally { setLoadingQ(false) }
  }

  function addInterview() {
    update({ interviews: [...state.interviews, { id: crypto.randomUUID(), name: '', notes: '' }] })
  }
  function editInterview(id, field, value) {
    update({ interviews: state.interviews.map((i) => (i.id === id ? { ...i, [field]: value } : i)) })
  }
  function removeInterview(id) {
    update({ interviews: state.interviews.filter((i) => i.id !== id) })
  }

  async function extractPain() {
    const notes = state.interviews.map((i) => i.notes).filter(Boolean).join('\n\n')
    if (!notes) { setErr('Add at least one interview with notes first.'); return }
    setErr(''); setLoadingP(true)
    try {
      const pains = await callGroq('painpoints', { notes })
      const withIds = (Array.isArray(pains) ? pains : []).map((p) => ({ id: crypto.randomUUID(), ...p }))
      update({ painpoints: [...state.painpoints, ...withIds] })
    } catch (e) { setErr(e.message) } finally { setLoadingP(false) }
  }

  return (
    <div className="step">
      <h2>2 · Interviews</h2>
      <p className="hint">
        Generate non-leading Mom Test questions, run interviews, paste notes, then extract pain points.
      </p>
      <MethodNote title="The Mom Test in one line">
        Ask about their life and past behaviour, never about your idea. People lie to be polite
        when you ask about the future or pitch them — but they can't fake what they actually did last week.
      </MethodNote>

      {!readOnly && (
        <button onClick={genQuestions} disabled={loadingQ}>
          {loadingQ ? 'Generating…' : state.questions.length ? 'Regenerate questions' : 'Generate Mom Test questions'}
        </button>
      )}

      {state.questions.length > 0 && (
        <ol className="qlist">{state.questions.map((q, i) => <li key={i}>{q}</li>)}</ol>
      )}

      <div className="row-between">
        <label>Interview log</label>
        {!readOnly && <button className="small" onClick={addInterview}>+ Add interview</button>}
      </div>

      {state.interviews.map((iv) => (
        <div key={iv.id} className="card">
          <div className="row-between">
            <input placeholder="Interviewee (name or segment)" disabled={readOnly}
              value={iv.name} onChange={(e) => editInterview(iv.id, 'name', e.target.value)} />
            {!readOnly && <button className="small danger" onClick={() => removeInterview(iv.id)}>Remove</button>}
          </div>
          <textarea rows={4} disabled={readOnly}
            placeholder="Paste raw notes: what they said, what they did, what it cost them…"
            value={iv.notes} onChange={(e) => editInterview(iv.id, 'notes', e.target.value)} />
        </div>
      ))}

      {!readOnly && state.interviews.length > 0 && (
        <button onClick={extractPain} disabled={loadingP}>
          {loadingP ? 'Extracting…' : 'Extract pain points from all notes'}
        </button>
      )}
      {err && <p className="err">{err}</p>}
    </div>
  )
}
