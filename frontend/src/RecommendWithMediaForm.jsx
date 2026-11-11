/**
 * RecommendWithMediaForm.jsx
 * Recommend a player to an agent/club WITH an attached highlight video or CV.
 * Used by: CoachDashboard, AcademyDashboard, SportsAnalystDashboard
 *
 * Props:
 *   supabase — Supabase client
 *   user     — authenticated user
 *   role     — 'coach' | 'academy' | 'sports_analyst'
 *   onSaved  — callback after successful recommendation
 */

import { useState } from 'react'
import { blockContactInfo } from './lib/uploadGuards'

export default function RecommendWithMediaForm({ supabase, user, _role, onSaved }) {
  const [search,      setSearch]      = useState('')
  const [players,     setPlayers]     = useState([])
  const [selectedId,  setSelectedId]  = useState('')
  const [selectedName,setSelectedName]= useState('')
  const [targetName,  setTargetName]  = useState('')
  const [note,        setNote]        = useState('')
  const [mediaType,   setMediaType]   = useState('video') // 'video' | 'cv' | 'none'
  const [file,        setFile]        = useState(null)
  const [busy,        setBusy]        = useState(false)
  const [done,        setDone]        = useState('')
  const [error,       setError]       = useState('')

  const searchPlayers = async (q) => {
    setSearch(q)
    if (!q || q.length < 2 || !supabase) { setPlayers([]); return }
    const { data } = await supabase.from('players')
      .select('id, display_name, position, current_club, profile_id')
      .ilike('display_name', `%${q}%`).limit(8)
    setPlayers(data ?? [])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedId || !targetName.trim()) { setError('Select a player and enter the agent or club name.'); return }
    if (note && blockContactInfo(note)) { setError('Please do not include contact details in the note.'); return }
    setBusy(true); setError('')

    let mediaUrl = null
    // Upload media file if provided
    if (file && mediaType !== 'none') {
      const ext = file.name.split('.').pop()
      const path = `recommendations/${user.id}/${Date.now()}.${ext}`
      const { data: up, error: ue } = await supabase.storage.from('public-media').upload(path, file, { upsert: false })
      if (ue) { setError('File upload failed: ' + ue.message); setBusy(false); return }
      const { data: pub } = supabase.storage.from('public-media').getPublicUrl(up.path)
      mediaUrl = pub?.publicUrl ?? null
    }

    // Find agent/club to recommend to
    const { data: agentData } = await supabase.from('agent_profiles')
      .select('id, user_id, agency_name')
      .ilike('agency_name', `%${targetName}%`).limit(1).maybeSingle()

    const payload = {
      recommender_user_id:  user.id,
      player_id:            selectedId,
      recommended_to_name:  targetName.trim(),
      note:                 note.trim() || null,
      recommended_to_type:  agentData ? 'agent' : 'agent', // defaults to 'agent' if found; academy lookup TODO
      sport:                'football',
    }
    if (agentData) payload.agent_profile_id = agentData.id

    // Store recommendation
    const { error: recErr } = await supabase.from('agent_recommendations').insert(payload)
    if (recErr) { setError(recErr.message); setBusy(false); return }

    // If media was uploaded, also post to Community Feed
    if (mediaUrl) {
      await supabase.from('feed_posts').insert({
        author_id:  user.id,
        sport:      'football',
        content:    `Recommending ${selectedName} to ${targetName}. ${note.trim() || ''}`.trim(),
        media_urls: [{ url: mediaUrl, type: mediaType }],
        visibility: 'public',
        status:     'published',
      })
    }

    setBusy(false)
    setDone(`${selectedName} recommended to ${agentData?.agency_name ?? targetName} successfully${mediaUrl ? ' — media attached' : ''}.`)
    onSaved?.()
  }

  if (done) {
    return (
      <div className="text-center py-4">
        <i className="bi bi-check-circle-fill text-success fs-2 d-block mb-3" />
        <h3 className="h5 fw-bold mb-2">Recommendation sent!</h3>
        <p className="text-muted mb-4">{done}</p>
        <button className="btn btn-primary btn-sm" type="button"
          onClick={() => { setDone(''); setSelectedId(''); setSelectedName(''); setTargetName(''); setNote(''); setFile(null); setSearch(''); setPlayers([]) }}>
          Recommend another player
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="d-grid gap-4">
      {/* Player search */}
      <div>
        <label className="form-label fw-semibold">Search for player <span className="text-danger">*</span></label>
        <input className="form-control" type="search" placeholder="Type player name…"
          value={search} onChange={(e) => searchPlayers(e.target.value)} />
        {players.length > 0 && (
          <ul className="list-group mt-1">
            {players.map((p) => (
              <li key={p.id}
                className={`list-group-item list-group-item-action d-flex align-items-center gap-2${selectedId === p.id ? ' active' : ''}`}
                style={{ cursor:'pointer' }}
                onClick={() => { setSelectedId(p.id); setSelectedName(p.display_name); setSearch(p.display_name); setPlayers([]) }}>
                <i className="bi bi-person-arms-up" />
                <span className="fw-semibold">{p.display_name}</span>
                {p.position && <span className="badge text-bg-primary ms-auto">{p.position}</span>}
                {p.current_club && <span className="small text-muted">{p.current_club}</span>}
              </li>
            ))}
          </ul>
        )}
        {selectedId && (
          <div className="alert alert-success py-2 small mt-2 d-flex align-items-center gap-2">
            <i className="bi bi-check-circle-fill" />Selected: <strong>{selectedName}</strong>
          </div>
        )}
      </div>

      {/* Recommend to */}
      <div>
        <label className="form-label fw-semibold">Recommend to (agent, club or academy name) <span className="text-danger">*</span></label>
        <input className="form-control" placeholder="e.g. Global Talent Agency, Elite London FC"
          value={targetName} onChange={(e) => setTargetName(e.target.value)} required />
      </div>

      {/* Media attachment */}
      <div>
        <label className="form-label fw-semibold">Attach media (optional)</label>
        <div className="d-flex gap-3 mb-2">
          {[['video','bi-camera-video','Highlight video'],['cv','bi-file-earmark-person','Player CV'],['none','bi-x-circle','No attachment']].map(([type,icon,label]) => (
            <label key={type} className={`d-flex align-items-center gap-2 px-3 py-2 rounded border ${mediaType===type?'border-primary bg-primary bg-opacity-10':''}`} style={{cursor:'pointer'}}>
              <input type="radio" name="media-type" value={type} checked={mediaType===type} onChange={()=>setMediaType(type)} />
              <i className={`bi ${icon}`} />{label}
            </label>
          ))}
        </div>
        {mediaType !== 'none' && (
          <input className="form-control" type="file"
            accept={mediaType === 'video' ? 'video/*' : '.pdf,application/pdf'}
            onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        )}
      </div>

      {/* Note */}
      <div>
        <label className="form-label fw-semibold" htmlFor="rec-note">
          Your recommendation note <span className="text-muted fw-normal">(optional)</span>
        </label>
        <textarea id="rec-note" className="form-control" rows={3}
          placeholder="Why are you recommending this player? Key stats, strengths, data insights…"
          value={note} onChange={(e) => setNote(e.target.value)} maxLength={1000} />
        {blockContactInfo(note) && (
          <div className="small text-danger mt-1"><i className="bi bi-exclamation-circle me-1" />No contact details allowed.</div>
        )}
      </div>

      {error && <div className="alert alert-danger py-2 small">{error}</div>}

      <div>
        <button className="btn btn-primary px-5" type="submit" disabled={busy || !selectedId || !targetName.trim()}>
          {busy ? <><span className="spinner-border spinner-border-sm me-2" />Sending…</> : <><i className="bi bi-send-check me-2" />Send Recommendation{file ? ' with Media' : ''}</>}
        </button>
      </div>
    </form>
  )
}
