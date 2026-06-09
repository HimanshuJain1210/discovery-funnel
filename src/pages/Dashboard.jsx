import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { listProjects, createProject, renameProject, deleteProject } from '../lib/data'
import { overallProgress } from '../lib/data'
import ProgressBar from '../components/ProgressBar'

export default function Dashboard({ session }) {
  const [projects, setProjects] = useState(null)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const nav = useNavigate()

  async function refresh() {
    try { setProjects(await listProjects(session.user.id)) }
    catch (e) { setErr(e.message) }
  }
  useEffect(() => { refresh() }, [])

  async function newProject() {
    setBusy(true)
    try {
      const p = await createProject(session.user.id, 'Untitled project')
      nav(`/app/${p.id}`)
    } catch (e) { setErr(e.message); setBusy(false) }
  }

  async function rename(p) {
    const name = prompt('Rename project', p.name)
    if (name && name !== p.name) { await renameProject(p.id, name); refresh() }
  }
  async function remove(p) {
    if (confirm(`Delete "${p.name}"? This cannot be undone.`)) { await deleteProject(p.id); refresh() }
  }

  if (projects === null) return <div className="loading"><div className="skel" /><div className="skel" /></div>

  return (
    <div className="dashboard">
      <div className="row-between">
        <h2>Your projects</h2>
        <button onClick={newProject} disabled={busy}>+ New project</button>
      </div>
      {err && <p className="err">{err}</p>}

      {projects.length === 0 && (
        <div className="empty">
          <p>No projects yet.</p>
          <button onClick={newProject} disabled={busy}>Create your first discovery project</button>
        </div>
      )}

      <div className="proj-grid">
        {projects.map((p) => (
          <div key={p.id} className="proj-card">
            <div className="proj-head" onClick={() => nav(`/app/${p.id}`)}>
              <h3>{p.name}</h3>
              {p.is_public && <span className="tag">public</span>}
            </div>
            <ProgressBar value={overallProgress(p.state)} />
            <p className="hint">Updated {new Date(p.updated_at).toLocaleDateString()}</p>
            <div className="proj-actions">
              <button className="small" onClick={() => nav(`/app/${p.id}`)}>Open</button>
              <button className="small" onClick={() => rename(p)}>Rename</button>
              <button className="small danger" onClick={() => remove(p)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
