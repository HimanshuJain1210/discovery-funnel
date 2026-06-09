// Frontend never sees GROQ_API_KEY. It calls our own /api/groq endpoint,
// which holds the key server-side and returns parsed { result }.

export async function callGroq(step, payload) {
  const res = await fetch('/api/groq', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ step, payload }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Groq request failed')
  return data.result
}
