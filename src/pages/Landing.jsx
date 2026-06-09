import { Link } from 'react-router-dom'

const STAGES = [
  ['Outcome', 'Define a measurable outcome, not a feature.'],
  ['Interviews', 'Generate Mom Test questions, log interviews, extract pain points.'],
  ['Pain points', 'Separate real signal from polite noise.'],
  ['Opportunities', 'Cluster pains into needs worth solving.'],
  ['Solutions', 'RICE-score ideas and test the riskiest assumption.'],
]

export default function Landing() {
  return (
    <div className="landing">
      <section className="hero">
        <h1>Product Discovery Funnel</h1>
        <p className="lede">
          A guided, AI-assisted workspace that walks you through continuous product discovery —
          from a measurable outcome to evidence-backed, prioritised, testable solutions.
          It does the work <em>and</em> teaches the method as you go.
        </p>
        <div className="cta-row">
          <Link to="/app" className="btn-primary">Start a discovery project</Link>
        </div>
        <p className="hint">Free to use · sign in with a magic link · your work syncs across devices.</p>
      </section>

      <section className="stages">
        <h2>The five stages</h2>
        <div className="stage-grid">
          {STAGES.map(([t, d], i) => (
            <div key={t} className="stage-card">
              <span className="stage-num">{i + 1}</span>
              <h3>{t}</h3>
              <p>{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="method">
        <h2>Grounded in real discovery practice</h2>
        <ul className="method-list">
          <li><strong>The Mom Test</strong> — questions that surface truth, not politeness.</li>
          <li><strong>Opportunity Solution Tree</strong> — Teresa Torres' structure, outcome → opportunities → solutions.</li>
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
