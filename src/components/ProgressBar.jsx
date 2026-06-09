export default function ProgressBar({ value, label }) {
  return (
    <div className="pbar-wrap">
      {label && <span className="pbar-label">{label}</span>}
      <div className="pbar">
        <div className="pbar-fill" style={{ width: `${value}%` }} />
      </div>
      <span className="pbar-pct">{value}%</span>
    </div>
  )
}
