// Opportunity Solution Tree visual — the screenshot-worthy artifact.
function riceScore(s) {
  const r = Number(s.reach) || 0, i = Number(s.impact) || 0
  const c = Number(s.confidence) || 0, e = Number(s.effort) || 0
  return e === 0 ? 0 : Math.round((r * i * (c / 100)) / e)
}

export default function OSTree({ state }) {
  const { outcome, opportunities, solutions } = state
  if (!outcome && opportunities.length === 0) {
    return <p className="hint">Define an outcome and generate opportunities to see your tree.</p>
  }
  // Self-heal: a solution whose opportunityId no longer exists (e.g. opportunities
  // were regenerated) is shown under the first opportunity instead of vanishing.
  const oppIds = new Set(opportunities.map((o) => o.id))
  const solOf = (oId, isFirst) =>
    solutions.filter((s) => s.opportunityId === oId || (isFirst && !oppIds.has(s.opportunityId)))
  return (
    <div className="ost">
      <div className="ost-outcome">
        <span className="ost-label">Outcome</span>
        <p>{outcome || 'No outcome set'}</p>
      </div>
      <div className="ost-trunk" />
      <div className="ost-opps">
        {opportunities.length === 0 && <p className="hint">No opportunities yet.</p>}
        {opportunities.map((o, idx) => {
          const sols = solOf(o.id, idx === 0)
          return (
            <div key={o.id} className="ost-branch">
              <div className="ost-opp">
                <span className="ost-label">Opportunity</span>
                <p>{o.title}</p>
              </div>
              <div className="ost-sols">
                {sols.length === 0 && <span className="ost-empty">no solutions yet</span>}
                {sols.map((s) => (
                  <div key={s.id} className="ost-sol">
                    <p>{s.title || 'Untitled'}</p>
                    <span className="ost-rice">RICE {riceScore(s)}</span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
