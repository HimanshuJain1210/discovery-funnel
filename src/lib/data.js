import { supabase } from './supabase'

export function emptyState() {
  return {
    idea: '',
    outcome: '',
    questions: [],
    interviews: [],
    painpoints: [],
    opportunities: [],
    solutions: [],
    synthesis: null,
  }
}

// Guarantees every array/string key exists so components never crash on old or partial rows.
export function normaliseState(s) {
  const base = emptyState()
  if (!s || typeof s !== 'object') return base
  return {
    idea: s.idea || '',
    outcome: s.outcome || '',
    questions: Array.isArray(s.questions) ? s.questions : [],
    interviews: Array.isArray(s.interviews) ? s.interviews : [],
    painpoints: Array.isArray(s.painpoints) ? s.painpoints : [],
    opportunities: Array.isArray(s.opportunities) ? s.opportunities : [],
    solutions: Array.isArray(s.solutions) ? s.solutions : [],
    synthesis: s.synthesis || null,
  }
}

// ---- Project CRUD (per-user via RLS) ----

export async function listProjects(userId) {
  const { data, error } = await supabase
    .from('projects')
    .select('id, name, state, is_public, created_at, updated_at')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function getProject(id) {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  return data
}

// Public read — works for anonymous visitors because of the public RLS policy.
export async function getPublicProject(id) {
  const { data, error } = await supabase
    .from('projects')
    .select('id, name, state, is_public')
    .eq('id', id)
    .eq('is_public', true)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function createProject(userId, name) {
  const { data, error } = await supabase
    .from('projects')
    .insert({ user_id: userId, name, state: emptyState() })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function renameProject(id, name) {
  const { error } = await supabase.from('projects').update({ name }).eq('id', id)
  if (error) throw error
}

export async function deleteProject(id) {
  const { error } = await supabase.from('projects').delete().eq('id', id)
  if (error) throw error
}

export async function setPublic(id, isPublic) {
  const { error } = await supabase.from('projects').update({ is_public: isPublic }).eq('id', id)
  if (error) throw error
}

export async function saveState(id, state) {
  const { error } = await supabase
    .from('projects')
    .update({ state, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

// ---- Progress helper: % complete per stage, drives UI + dashboard ----

export function stageProgress(raw) {
  const s = normaliseState(raw)
  return [
    s.idea && s.outcome ? 100 : (s.idea || s.outcome ? 50 : 0),
    s.questions.length > 0 ? (s.interviews.length > 0 ? 100 : 50) : 0,
    s.painpoints.length > 0 ? 100 : 0,
    s.opportunities.length > 0 ? 100 : 0,
    s.solutions.length > 0 ? (s.solutions.some((x) => x.experiment) ? 100 : 50) : 0,
  ]
}

export function overallProgress(s) {
  const p = stageProgress(s)
  return Math.round(p.reduce((a, b) => a + b, 0) / p.length)
}
