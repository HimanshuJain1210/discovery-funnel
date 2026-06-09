// Teaches the discovery method inline. Collapsible so it doesn't clutter once learned.
import { useState } from 'react'

export default function MethodNote({ title, children }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="method-note">
      <button className="method-toggle" onClick={() => setOpen(!open)}>
        <span className="method-icon">{open ? '–' : '?'}</span> {title}
      </button>
      {open && <div className="method-body">{children}</div>}
    </div>
  )
}
