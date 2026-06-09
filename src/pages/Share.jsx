import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getPublicProject, normaliseState } from '../lib/data'
import Outcome from '../steps/1_Outcome'
import Interviews from '../steps/2_Interviews'
import PainPoints from '../steps/3_PainPoints'
import Opportunities from '../steps/4_Opportunities'
import Solutions from '../steps/5_Solutions'
import OSTree from '../components/OSTree'

// Public, read-only view. No auth needed — relies on the is_public RLS policy.
export default function Share() {
  const { id } = useParams()
  const [project, setProject] = useState(undefined)

  useEffect(() => {
    getPublicProject(id).then(setProject).catch(() => setProject(null))
  }, [id])

  if (project === undefined) return <div className="loading"><div className="skel" /></div>
  if (!project) return (
    <div className="loading">
      <p>This project is private or doesn't exist.</p>
      <Link to="/" className="btn-primary">Go home</Link>
    </div>
  )

  const st = normaliseState(project.state)
  const props = { state: st, update: () => {}, readOnly: true }
  return (
    <div className="share-view">
      <div className="share-banner">
        <span>Read-only shared discovery project</span>
        <Link to="/" className="small">Build your own →</Link>
      </div>
      <h1>{project.name}</h1>
      <OSTree state={st} />
      <div className="share-sections">
        <Outcome {...props} />
        <Interviews {...props} />
        <PainPoints {...props} />
        <Opportunities {...props} />
        <Solutions {...props} />
      </div>
    </div>
  )
}
