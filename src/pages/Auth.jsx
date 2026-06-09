import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Auth() {
  const [email, setEmail] = useState('')
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  async function sendLink() {
    if (!email) return
    setBusy(true); setMsg('')
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/app` },
    })
    setMsg(error ? error.message : 'Check your email for the login link.')
    setBusy(false)
  }

  return (
    <div className="auth">
      <h1>Sign in</h1>
      <p className="hint">We'll email you a magic link — no password.</p>
      <input type="email" placeholder="you@email.com" value={email}
        onChange={(e) => setEmail(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && sendLink()} />
      <button onClick={sendLink} disabled={busy}>{busy ? 'Sending…' : 'Send magic link'}</button>
      {msg && <p className="hint">{msg}</p>}
    </div>
  )
}
