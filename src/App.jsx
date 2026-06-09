import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import { useTheme } from './lib/theme'
import Landing from './pages/Landing'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import Funnel from './pages/Funnel'
import Share from './pages/Share'

function ThemeButton() {
  const { theme, cycle } = useTheme()
  const label = theme === 'system' ? 'Auto' : theme === 'light' ? 'Light' : 'Dark'
  return <button className="small theme-btn" onClick={cycle} title="Toggle theme">{label}</button>
}

function TopBar({ session }) {
  const nav = useNavigate()
  async function signOut() { await supabase.auth.signOut(); nav('/') }
  return (
    <header className="topbar">
      <Link to="/" className="brand">Discovery Funnel</Link>
      <div className="header-right">
        <ThemeButton />
        {session && <button className="small" onClick={signOut}>Sign out</button>}
      </div>
    </header>
  )
}

export default function App() {
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  return (
    <BrowserRouter>
      <div className="shell">
        <Routes>
          {/* Public routes work without waiting on auth */}
          <Route path="/" element={<><TopBar session={session} /><Landing /></>} />
          <Route path="/share/:id" element={<><TopBar session={session} /><Share /></>} />

          <Route path="/login" element={<><TopBar session={session} /><Auth /></>} />

          <Route path="/app" element={
            <><TopBar session={session} />
              {session === undefined ? <div className="loading"><div className="skel" /></div>
                : session ? <Dashboard session={session} /> : <Navigate to="/login" />}
            </>} />

          <Route path="/app/:id" element={
            <><TopBar session={session} />
              {session === undefined ? <div className="loading"><div className="skel" /></div>
                : session ? <Funnel session={session} /> : <Navigate to="/login" />}
            </>} />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
