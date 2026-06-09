import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { listProjects, createProject, renameProject, deleteProject, overallProgress } from '../lib/data'
import ProgressBar from '../components/ProgressBar'

export default function Dashboard({ session }) {
  const [projects, setProjects] = useState(null)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  // Modal state replaces native prompt()/confirm() (#6, #7)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [renaming, setRenaming] = useState(null) // project being renamed
  const [renameVal, setRenameVal] = useState('')
  const [deleting, setDeleting] = useState(null) // project being deleted
  const nav = useNavigate()

  async function refresh() {
    try { setProjects(await listProjects(session.user.id)) }
    catch (e) { setErr(e.message) }
  }
  useEffect(() => { refresh() }, [])

  async function confirmCreate() {
    setBusy(true)
    try {
      const p = await createProject(session.user.id, newName.trim() || 'Untitled project')
      nav(`/app/${p.id}`)
    } catch (e) { setErr(e.message); setBusy(false); setCreating(false) }
  }
  async function confirmRename() {
    const name = renameVal.trim()
    if (name && name !== renaming.name) { await renameProject(renaming.id, name); refresh() }
    setRenaming(null)
  }
  async function confirmDelete() {
    await deleteProject(deleting.id); setDeleting(null); refresh()
  }

  if (projects === null) return <div className="loading"><div className="skel" /><div className="skel" /></div>

  return (
    <div className="dashboard">
      <div className="dash-head">
        <div>
          <span className="eyebrow">Workspace</span>
          <h2 style={{ marginTop: 4 }}>Your projects</h2>
        </div>
        <button className="primary" onClick={() => { setNewName(''); setCreating(true) }} disabled={busy}>+ New project</button>
      </div>
      {err && <p className="err">{err}</p>}

      {projects.length === 0 && (
        <div className="empty">
          <p>No projects yet. Each project is one product discovery cycle.</p>
          <button className="primary" onClick={() => { setNewName(''); setCreating(true) }} disabled={busy}>Create your first project</button>
        </div>
      )}

      <div className="proj-grid">
        {projects.map((p) => (
          <div key={p.id} className="proj-card" onClick={() => nav(`/app/${p.id}`)}>
            <div className="proj-head">
              <h3>{p.name}</h3>
              {p.is_public && <span className="tag">public</span>}
            </div>
            <ProgressBar value={overallProgress(p.state)} />
            <p className="hint">Updated {new Date(p.updated_at).toLocaleDateString()}</p>
            <div className="proj-actions" onClick={(e) => e.stopPropagation()}>
              <button className="small" onClick={() => nav(`/app/${p.id}`)}>Open</button>
              <button className="small" onClick={() => { setRenameVal(p.name); setRenaming(p) }}>Rename</button>
              <button className="small danger" onClick={() => setDeleting(p)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      {creating && (
        <Modal title="Name your project" onClose={() => setCreating(false)}>
          <input autoFocus placeholder="e.g. JEE answer-feedback tool" value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && confirmCreate()} />
          <div className="row-between" style={{ marginTop: 16 }}>
            <button className="ghost" onClick={() => setCreating(false)}>Cancel</button>
            <button className="primary" onClick={confirmCreate} disabled={busy}>{busy ? 'Creating…' : 'Create project'}</button>
          </div>
        </Modal>
      )}

      {renaming && (
        <Modal title="Rename project" onClose={() => setRenaming(null)}>
          <input autoFocus value={renameVal} onChange={(e) => setRenameVal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && confirmRename()} />
          <div className="row-between" style={{ marginTop: 16 }}>
            <button className="ghost" onClick={() => setRenaming(null)}>Cancel</button>
            <button className="primary" onClick={confirmRename}>Save</button>
          </div>
        </Modal>
      )}

      {deleting && (
        <Modal title="Delete project?" onClose={() => setDeleting(null)}>
          <p className="hint">"{deleting.name}" will be permanently deleted. This can't be undone.</p>
          <div className="row-between" style={{ marginTop: 16 }}>
            <button className="ghost" onClick={() => setDeleting(null)}>Cancel</button>
            <button className="danger" onClick={confirmDelete}>Delete permanently</button>
          </div>
        </Modal>
      )}
    </div>
  )
}

function Modal({ title, onClose, children }) {
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{title}</h2>
        {children}
      </div>
    </div>
  )
}
