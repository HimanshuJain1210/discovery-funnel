import MethodNote from '../components/MethodNote'

export default function Outcome({ state, update, readOnly, goTo }) {
  return (
    <div className="step">
      <h2>1 · Outcome</h2>
      <p className="hint">
        Discovery starts with a measurable outcome, not a feature. Define the idea you're
        exploring and the single outcome you're trying to move.
      </p>
      <MethodNote title="What makes a good outcome?">
        A good outcome is a number your team can influence — a behaviour change in customers,
        not a business metric you only control indirectly, and never a feature to ship.
        Good: "increase weekly active reviewers from 20% to 50%". Bad: "users love it" or "launch the grader".
      </MethodNote>

      <label>Product idea</label>
      <textarea rows={3} disabled={readOnly}
        placeholder="e.g. An AI study assistant that tells JEE students if their written answer is exam-ready"
        value={state.idea} onChange={(e) => update({ idea: e.target.value })} />

      <label>Target outcome (measurable)</label>
      <textarea rows={2} disabled={readOnly}
        placeholder="e.g. Increase the share of students who complete a full mock-test review from 20% to 50%"
        value={state.outcome} onChange={(e) => update({ outcome: e.target.value })} />

      {!readOnly && state.idea && state.outcome && goTo && (
        <button className="primary" style={{ marginTop: 18 }} onClick={() => goTo(1)}>
          Next: run interviews →
        </button>
      )}
    </div>
  )
}
