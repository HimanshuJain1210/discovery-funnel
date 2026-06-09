import { Link } from 'react-router-dom'

const STAGES = [
  ['Outcome', 'Define a measurable outcome, not a feature.'],
  ['Interviews', 'Mom Test questions, CSV import, pain-point extraction.'],
  ['Pain points', 'Separate real signal from polite noise.'],
  ['Opportunities', 'Cluster pains into needs worth solving.'],
  ['Solutions', 'RICE-score ideas and test the riskiest assumption.'],
]

export default function Landing() {
  return (
    <div className="landing">
      <section className="hero">
        <span className="eyebrow">Continuous product discovery</span>
        <h1>From a fuzzy idea to <span className="grad">evidence-backed bets</span> — guided every step.</h1>
        <p className="lede">
          An AI-assisted discovery workspace that runs the method and teaches it as you go:
          interviews, pain points, opportunities, and prioritised, testable solutions.
        </p>
        <div className="cta-row">
          <Link to="/app" className="btn-primary">Start a discovery project</Link>
        </div>
      </section>

      <section className="metrics">
        <div className="metric"><div className="num">5</div><div className="lbl">Guided stages</div></div>
        <div className="metric"><div className="num">4</div><div className="lbl">AI analysis steps</div></div>
        <div className="metric"><div className="num">∞</div><div className="lbl">Projects, synced</div></div>
      </section>

      <section className="stages">
        <h2>The five stages</h2>
        <div className="stage-grid">
          {STAGES.map(([t, d], i) => (
            <div key={t} className="stage-card">
              <span className="stage-num">{i + 1}</span>
              <h3>{t}</h3>
              <p className="hint">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="method-sec">
        <span className="eyebrow">Grounded in real practice</span>
        <h2>Not a vibe. A method.</h2>
        <ul className="method-list">
          <li><strong>The Mom Test</strong> — questions that surface truth, not politeness.</li>
          <li><strong>Opportunity Solution Tree</strong> — Teresa Torres' structure: outcome → opportunities → solutions.</li>
          <li><strong>RICE prioritisation</strong> — score solutions on reach, impact, confidence, effort.</li>
          <li><strong>Riskiest-assumption testing</strong> — the cheapest experiment that could prove you wrong.</li>
        </ul>
      </section>

      <footer className="landing-foot">
        <Link to="/app" className="btn-primary">Open the app</Link>
      </footer>
    </div>
  )
}
