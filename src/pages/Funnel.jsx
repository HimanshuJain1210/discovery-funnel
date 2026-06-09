import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getProject, saveState, setPublic, stageProgress, normaliseState } from '../lib/data'
import { downloadMarkdown, downloadPdf } from '../lib/export'
import Outcome from '../steps/1_Outcome'
import Interviews from '../steps/2_Interviews'
import PainPoints from '../steps/3_PainPoints'
import Opportunities from '../steps/4_Opportunities'
import Solutions from '../steps/5_Solutions'
import OSTree from '../components/OSTree'
import Insights from '../components/Insights'
import ProgressBar from '../components/ProgressBar'

const STEPS = ['Outcome', 'Interviews', 'Pain points', 'Opportunities', 'Solutions']

export default function Funnel({ session }) {
  const { id } = useParams()
  const nav = useNavigate()
  const [project, setProject] = useState(null)
  const [state, setState] = useState(null)
  const [step, setStep] = useState(0)
  const [view, setView] = useState('steps') // 'steps' | 'tree'
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')
  const [shareMsg, setShareMsg] = useState('')
  const saveTimer = useRef(null)

  useEffect(() => {
    (async () => {
      try {
        const p = await getProject(id)
        if (!p) { setErr('Project not found.'); return }
        setProject(p); setState(normaliseState(p.state))
      } catch (e) { setErr(e.message) }
    })()
  }, [id])

  function update(patch) {
    setState((prev) => {
      const next = { ...prev, ...patch }
      if (saveTimer.current) clearTimeout(saveTimer.current)
      saveTimer.current = setTimeout(async () => {
        setSaving(true)
        try { await saveState(id, next) } catch (e) { console.error(e) }
        setSaving(false)
      }, 800)
      return next
    })
  }

  async function toggleShare() {
    const next = !project.is_public
    try {
      await setPublic(id, next)
      setProject({ ...project, is_public: next })
      if (next) {
        const url = `${window.location.origin}/share/${id}`
        await navigator.clipboard.writeText(url).catch(() => {})
        setShareMsg(`Public link copied: ${url}`)
      } else setShareMsg('Sharing turned off.')
    } catch (e) { setErr(e.message) }
  }

  if (err) return <div className="loading"><p className="err">{err}</p>
    <button className="small" onClick={() => nav('/app')}>← Back to projects</button></div>
  if (!state) return <div className="loading"><div className="skel" /><div className="skel" /><div className="skel" /></div>

  const props = { state, update, readOnly: false }
  const progress = stageProgress(state)

  // Unified navigation: step indices OR view names ('tree','insights','export').
  function goTo(target) {
    if (typeof target === 'number') { setView('steps'); setStep(target); return }
    if (target === 'export') { setView('steps'); window.scrollTo({ top: 0, behavior: 'smooth' }); return }
    setView(target) // 'tree' | 'insights'
  }
  const stepProps = { ...props, goTo }

  const hasOpps = state.opportunities.length > 0
  const hasAnyData = state.painpoints.length > 0 || state.solutions.length > 0 || hasOpps

  return (
    <div className="funnel">
      <div className="row-between funnel-top">
        <button className="small ghost" onClick={() => nav('/app')}>← Projects</button>
        <span className={`save-status ${saving ? 'saving' : ''}`}>{saving ? 'Saving' : 'Saved'}</span>
      </div>

      <div className="toolbar">
        <div className="tabs">
          <button className={`tab ${view === 'steps' ? 'active' : ''}`} onClick={() => setView('steps')}>Steps</button>
          <button className={`tab ${view === 'insights' ? 'active' : ''}`} onClick={() => setView('insights')}>Insights</button>
          <button className={`tab ${view === 'tree' ? 'active' : ''}`} onClick={() => setView('tree')}>Tree</button>
        </div>
        <div className="spacer" />
        <button className="small" onClick={() => downloadMarkdown(project.name, state)}>Export .md</button>
        <button className="small" onClick={() => downloadPdf(project.name, state)}>Export PDF</button>
        <button className="small" onClick={toggleShare}>
          {project.is_public ? 'Disable share' : 'Share link'}
        </button>
      </div>
      {shareMsg && <p className="hint share-msg">{shareMsg}</p>}

      {view === 'tree' && (hasOpps
        ? <OSTree state={state} />
        : <div className="empty"><p>Your tree builds itself as you work.</p>
            <button className="primary" onClick={() => goTo(3)}>Generate opportunities first</button></div>)}
      {view === 'insights' && (hasAnyData
        ? <Insights state={state} update={update} />
        : <div className="empty"><p>Insights appear once you have interviews or pain points.</p>
            <button className="primary" onClick={() => goTo(1)}>Start with interviews</button></div>)}
      {view === 'steps' && (
        <>
          <nav className="stepnav">
            {STEPS.map((label, i) => (
              <button key={i} className={`stepbtn ${i === step ? 'active' : ''}`} onClick={() => setStep(i)}>
                <span className="num">{i + 1}</span> {label}
                {progress[i] === 100 && <span className="check">✓</span>}
              </button>
            ))}
          </nav>

          <main>
            {step === 0 && <Outcome {...stepProps} />}
            {step === 1 && <Interviews {...stepProps} />}
            {step === 2 && <PainPoints {...stepProps} />}
            {step === 3 && <Opportunities {...stepProps} />}
            {step === 4 && <Solutions {...stepProps} />}
          </main>

          <footer className="navfoot">
            <button className="ghost" disabled={step === 0} onClick={() => setStep(step - 1)}>← Back</button>
            {step < STEPS.length - 1
              ? <button className="primary" onClick={() => setStep(step + 1)}>Next: {STEPS[step + 1]} →</button>
              : <button className="primary" onClick={() => goTo('tree')}>View the tree →</button>}
          </footer>
        </>
      )}
    </div>
  )
}
