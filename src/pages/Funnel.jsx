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

  return (
    <div className="funnel">
      <div className="row-between funnel-top">
        <button className="small" onClick={() => nav('/app')}>← Projects</button>
        <div className="header-right">
          <span className="save-status">{saving ? 'Saving…' : 'Saved'}</span>
        </div>
      </div>

      <div className="export-bar">
        <button className="small" onClick={() => setView(view === 'steps' ? 'tree' : 'steps')}>
          {view === 'steps' ? 'View tree' : 'View steps'}
        </button>
        <button className="small" onClick={() => downloadMarkdown(project.name, state)}>Export .md</button>
        <button className="small" onClick={() => downloadPdf(project.name, state)}>Export PDF</button>
        <button className="small" onClick={toggleShare}>
          {project.is_public ? 'Disable share link' : 'Share read-only link'}
        </button>
      </div>
      {shareMsg && <p className="hint share-msg">{shareMsg}</p>}

      {view === 'tree' ? (
        <OSTree state={state} />
      ) : (
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
            {step === 0 && <Outcome {...props} />}
            {step === 1 && <Interviews {...props} />}
            {step === 2 && <PainPoints {...props} />}
            {step === 3 && <Opportunities {...props} />}
            {step === 4 && <Solutions {...props} />}
          </main>

          <footer className="navfoot">
            <button disabled={step === 0} onClick={() => setStep(step - 1)}>← Back</button>
            <button disabled={step === STEPS.length - 1} onClick={() => setStep(step + 1)}>Next →</button>
          </footer>
        </>
      )}
    </div>
  )
}
