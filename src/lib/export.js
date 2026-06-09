
function riceScore(s) {
  const r = Number(s.reach) || 0, i = Number(s.impact) || 0
  const c = Number(s.confidence) || 0, e = Number(s.effort) || 0
  return e === 0 ? 0 : Math.round((r * i * (c / 100)) / e)
}

export function toMarkdown(name, s) {
  const L = []
  L.push(`# ${name}`, '')
  L.push(`## 1. Outcome`, '')
  L.push(`**Idea:** ${s.idea || '—'}`, '')
  L.push(`**Target outcome:** ${s.outcome || '—'}`, '')

  L.push(`## 2. Interview questions (Mom Test)`, '')
  s.questions.length
    ? s.questions.forEach((q, i) => L.push(`${i + 1}. ${q}`))
    : L.push('_None yet._')
  L.push('')

  L.push(`### Interviews logged`, '')
  s.interviews.length
    ? s.interviews.forEach((iv) => L.push(`- **${iv.name || 'Unnamed'}** — ${iv.notes || ''}`))
    : L.push('_None yet._')
  L.push('')

  if (s.synthesis) {
    const sy = s.synthesis
    L.push(`### Synthesis`, '')
    if (sy.summary) L.push(sy.summary, '')
    if (Array.isArray(sy.themes)) sy.themes.forEach((t) => L.push(`- **${t.title}** (${t.frequency ?? '?'}) — ${t.description || ''}`))
    if (sy.confidence) L.push('', `Confidence: ${sy.confidence}`)
    L.push('')
  }

  L.push(`## 3. Pain points`, '')
  s.painpoints.length
    ? s.painpoints.forEach((p) =>
        L.push(`- [${p.severity?.toUpperCase()}] ${p.text}${p.source ? ` — from ${p.source}` : ''}${p.evidence ? ` _(evidence: ${p.evidence})_` : ''}`))
    : L.push('_None yet._')
  L.push('')

  L.push(`## 4. Opportunities`, '')
  s.opportunities.length
    ? s.opportunities.forEach((o) => L.push(`- **${o.title}** — ${o.rationale || ''}`))
    : L.push('_None yet._')
  L.push('')

  L.push(`## 5. Solutions (RICE-scored)`, '')
  if (s.solutions.length) {
    const sorted = [...s.solutions].sort((a, b) => riceScore(b) - riceScore(a))
    sorted.forEach((sol) => {
      const opp = s.opportunities.find((o) => o.id === sol.opportunityId)
      L.push(`### ${sol.title || 'Untitled'} — RICE ${riceScore(sol)}${sol.status && sol.status !== 'not_started' ? ` [${sol.status.toUpperCase()}]` : ''}`)
      if (opp) L.push(`Addresses: ${opp.title}`)
      L.push(`Reach ${sol.reach} · Impact ${sol.impact} · Confidence ${sol.confidence}% · Effort ${sol.effort}`)
      if (sol.experiment) {
        const e = sol.experiment
        L.push('', `**Experiment** (${e.risk_type})`)
        L.push(`- Assumption: ${e.assumption}`)
        L.push(`- Hypothesis: ${e.hypothesis}`)
        L.push(`- Method: ${e.method}`)
        L.push(`- Metric: ${e.metric} — success at ${e.threshold}`)
        if (e.duration) L.push(`- Duration: ${e.duration}`)
      }
      if (sol.result) L.push(`- Result: ${sol.result}`)
      if (sol.learnings) L.push(`- Learned: ${sol.learnings}`)
      L.push('')
    })
  } else {
    L.push('_None yet._', '')
  }

  L.push('---', '_Generated with Product Discovery Funnel._')
  return L.join('\n')
}

export function downloadMarkdown(name, s) {
  const blob = new Blob([toMarkdown(name, s)], { type: 'text/markdown' })
  triggerDownload(blob, `${slug(name)}.md`)
}

export async function downloadPdf(name, s) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const margin = 48
  const width = doc.internal.pageSize.getWidth() - margin * 2
  let y = margin

  const line = (text, size = 11, bold = false, gap = 16) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal')
    doc.setFontSize(size)
    const wrapped = doc.splitTextToSize(text, width)
    wrapped.forEach((w) => {
      if (y > doc.internal.pageSize.getHeight() - margin) { doc.addPage(); y = margin }
      doc.text(w, margin, y)
      y += gap
    })
  }
  const space = (h = 8) => { y += h }

  line(name, 20, true, 26)
  space()
  line('1. Outcome', 14, true, 20)
  line(`Idea: ${s.idea || '—'}`)
  line(`Target outcome: ${s.outcome || '—'}`); space()

  line('2. Interview questions', 14, true, 20)
  s.questions.length ? s.questions.forEach((q, i) => line(`${i + 1}. ${q}`)) : line('None yet.')
  space()

  line('3. Pain points', 14, true, 20)
  s.painpoints.length
    ? s.painpoints.forEach((p) => line(`[${p.severity?.toUpperCase()}] ${p.text}`))
    : line('None yet.')
  space()

  line('4. Opportunities', 14, true, 20)
  s.opportunities.length
    ? s.opportunities.forEach((o) => line(`• ${o.title}`))
    : line('None yet.')
  space()

  line('5. Solutions (RICE-scored)', 14, true, 20)
  if (s.solutions.length) {
    const sorted = [...s.solutions].sort((a, b) => riceScore(b) - riceScore(a))
    sorted.forEach((sol) => {
      line(`${sol.title || 'Untitled'} — RICE ${riceScore(sol)}`, 12, true, 18)
      line(`Reach ${sol.reach} · Impact ${sol.impact} · Confidence ${sol.confidence}% · Effort ${sol.effort}`, 10)
      if (sol.experiment) {
        const e = sol.experiment
        line(`Experiment (${e.risk_type}) — assumption: ${e.assumption}`, 10)
        line(`Hypothesis: ${e.hypothesis}`, 10)
        line(`Method: ${e.method} | Metric: ${e.metric} → ${e.threshold}`, 10)
      }
      space(6)
    })
  } else line('None yet.')

  doc.save(`${slug(name)}.pdf`)
}

function slug(name) {
  return (name || 'discovery').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}
function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}
