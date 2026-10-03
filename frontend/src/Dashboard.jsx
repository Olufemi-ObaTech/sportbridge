import { useEffect, useState } from 'react'

const accountRoles = ['player', 'coach', 'agent', 'academy', 'super_admin']
const roleLabels = {
  player: 'Player',
  coach: 'Coach',
  agent: 'Agent / Scout',
  academy: 'Academy / Club',
  super_admin: 'Super Admin',
}

const blankPlayer = {
  display_name: '',
  position: '',
  age: '',
  country: '',
  bio: '',
  is_public: false,
}

function Dashboard({ supabase, user, onBack }) {
  const [profile, setProfile] = useState(null)
  const [profileName, setProfileName] = useState('')
  const [player, setPlayer] = useState(null)
  const [playerDraft, setPlayerDraft] = useState(blankPlayer)
  const [adminUsers, setAdminUsers] = useState([])
  const [accountCount, setAccountCount] = useState(0)
  const [roleDrafts, setRoleDrafts] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    let active = true

    const loadDashboard = async () => {
      try {
        const { data: account, error: profileError } = await supabase
          .from('profiles')
          .select('id, email, full_name, role, created_at')
          .eq('id', user.id)
          .single()

        if (profileError) throw profileError
        if (!active) return

        setProfile(account)
        setProfileName(account.full_name ?? '')

        if (account.role === 'super_admin') {
          const { data, count, error: usersError } = await supabase
            .from('profiles')
            .select('id, email, full_name, role, created_at', { count: 'exact' })
            .order('created_at', { ascending: false })
            .limit(200)

          if (usersError) throw usersError
          if (!active) return
          setAdminUsers(data ?? [])
          setAccountCount(count ?? data?.length ?? 0)
          setRoleDrafts(Object.fromEntries((data ?? []).map((accountRow) => [accountRow.id, accountRow.role])))
        } else if (account.role === 'player') {
          const { data, error: playerError } = await supabase
            .from('players')
            .select('id, display_name, position, age, country, bio, is_public')
            .eq('profile_id', user.id)
            .maybeSingle()

          if (playerError) throw playerError
          if (!active) return
          setPlayer(data)
          setPlayerDraft({
            display_name: data?.display_name ?? account.full_name ?? '',
            position: data?.position ?? '',
            age: data?.age == null ? '' : String(data.age),
            country: data?.country ?? '',
            bio: data?.bio ?? '',
            is_public: data?.is_public ?? false,
          })
        }
      } catch (loadError) {
        if (active) setError(loadError.message || 'Could not load this dashboard.')
      } finally {
        if (active) setLoading(false)
      }
    }

    loadDashboard()

    return () => { active = false }
  }, [supabase, user.id])

  const saveAccount = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setNotice('')

    const { data, error: saveError } = await supabase
      .from('profiles')
      .update({ full_name: profileName.trim() || null })
      .eq('id', user.id)
      .select('id, email, full_name, role, created_at')
      .single()

    setSaving(false)
    if (saveError) {
      setError(saveError.message)
      return
    }

    setProfile(data)
    setNotice('Account details saved.')
  }

  const savePlayer = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setNotice('')

    const payload = {
      profile_id: user.id,
      display_name: playerDraft.display_name.trim() || profileName.trim() || 'Player',
      position: playerDraft.position.trim() || null,
      age: playerDraft.age ? Number(playerDraft.age) : null,
      country: playerDraft.country.trim() || null,
      bio: playerDraft.bio.trim() || null,
      is_public: playerDraft.is_public,
    }
    const query = player
      ? supabase.from('players').update(payload).eq('id', player.id).eq('profile_id', user.id)
      : supabase.from('players').insert(payload)
    const { data, error: saveError } = await query.select('id, display_name, position, age, country, bio, is_public').single()

    setSaving(false)
    if (saveError) {
      setError(saveError.message)
      return
    }

    setPlayer(data)
    setPlayerDraft({
      display_name: data.display_name ?? '',
      position: data.position ?? '',
      age: data.age == null ? '' : String(data.age),
      country: data.country ?? '',
      bio: data.bio ?? '',
      is_public: data.is_public ?? false,
    })
    setNotice('Player profile saved.')
  }

  const saveRole = async (accountId) => {
    setSaving(true)
    setError('')
    setNotice('')
    const { data, error: saveError } = await supabase
      .from('profiles')
      .update({ role: roleDrafts[accountId] })
      .eq('id', accountId)
      .select('id, email, full_name, role, created_at')
      .single()

    setSaving(false)
    if (saveError) {
      setError(saveError.message)
      return
    }

    setAdminUsers((current) => current.map((row) => row.id === data.id ? data : row))
    setNotice(`Updated ${data.email}'s role.`)
  }

  return (
    <main id="main-content" className="flex-grow-1">
      <div className="container py-5">
        <div className="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-4">
          <div>
            <span className="text-uppercase small fw-semibold text-muted">SportBridge account</span>
            <h1 className="h2 fw-bold mb-1" style={{ color: 'var(--fc-blue-700)' }}>{profile?.role === 'super_admin' ? 'Admin dashboard' : 'Your dashboard'}</h1>
            <p className="text-muted mb-0">{user.email}</p>
          </div>
          <button className="btn btn-outline-primary" onClick={onBack} type="button"><i className="bi bi-arrow-left me-1" aria-hidden="true" />Back to home</button>
        </div>

        {error && <div className="alert alert-danger" role="alert">{error}</div>}
        {notice && <div className="alert alert-success" role="status">{notice}</div>}
        {loading ? <div className="py-5 text-center text-muted" role="status"><span className="spinner-border spinner-border-sm me-2" />Loading your dashboard...</div>
          : profile?.role === 'super_admin' ? <>
            <div className="row g-3 mb-4">
              <div className="col-12 col-md-4"><div className="card h-100 p-4"><span className="small text-muted">Registered accounts</span><strong className="display-6 fw-bold">{accountCount}</strong></div></div>
              <div className="col-12 col-md-4"><div className="card h-100 p-4"><span className="small text-muted">Players</span><strong className="display-6 fw-bold">{adminUsers.filter((account) => account.role === 'player').length}</strong></div></div>
              <div className="col-12 col-md-4"><div className="card h-100 p-4"><span className="small text-muted">Other roles</span><strong className="display-6 fw-bold">{adminUsers.filter((account) => account.role !== 'player' && account.role !== 'super_admin').length}</strong></div></div>
            </div>
            <section className="card p-3 p-md-4" aria-labelledby="admin-users-heading">
              <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3"><h2 className="h4 mb-0" id="admin-users-heading">User accounts</h2><span className="small text-muted">Showing up to 200 accounts</span></div>
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead><tr><th scope="col">Name</th><th scope="col">Email</th><th scope="col">Role</th><th scope="col">Joined</th><th scope="col"><span className="visually-hidden">Actions</span></th></tr></thead>
                  <tbody>{adminUsers.map((account) => <tr key={account.id}>
                    <td>{account.full_name || 'Unnamed account'}</td><td>{account.email}</td>
                    <td><select aria-label={`Role for ${account.email}`} className="form-select form-select-sm" disabled={account.id === user.id || saving} onChange={(event) => setRoleDrafts((current) => ({ ...current, [account.id]: event.target.value }))} value={roleDrafts[account.id] ?? account.role}>{accountRoles.map((role) => <option key={role} value={role}>{roleLabels[role]}</option>)}</select></td>
                    <td>{account.created_at ? new Date(account.created_at).toLocaleDateString() : '—'}</td>
                    <td><button className="btn btn-sm btn-outline-primary" disabled={account.id === user.id || saving || roleDrafts[account.id] === account.role} onClick={() => saveRole(account.id)} type="button">Save role</button></td>
                  </tr>)}</tbody>
                </table>
              </div>
            </section>
          </> : <div className="row g-4">
            <div className="col-12 col-lg-5">
              <section className="card p-4" aria-labelledby="account-details-heading">
                <h2 className="h4 mb-3" id="account-details-heading">Account details</h2>
                <p className="small text-muted">Role: <strong className="text-body">{roleLabels[profile?.role] ?? profile?.role}</strong></p>
                <form className="d-grid gap-3" onSubmit={saveAccount}>
                  <label className="form-label mb-0">Full name<input className="form-control mt-1" onChange={(event) => setProfileName(event.target.value)} value={profileName} /></label>
                  <label className="form-label mb-0">Email<input className="form-control mt-1" readOnly value={profile?.email ?? user.email ?? ''} /></label>
                  <button className="btn btn-primary" disabled={saving} type="submit">{saving ? 'Saving...' : 'Save account details'}</button>
                </form>
              </section>
            </div>
            <div className="col-12 col-lg-7">
              {profile?.role === 'player' ? <section className="card p-4" aria-labelledby="player-profile-heading">
                <h2 className="h4 mb-3" id="player-profile-heading">Player profile</h2>
                <form className="row g-3" onSubmit={savePlayer}>
                  <div className="col-12 col-md-6"><label className="form-label" htmlFor="player-display-name">Display name</label><input className="form-control" id="player-display-name" onChange={(event) => setPlayerDraft((current) => ({ ...current, display_name: event.target.value }))} value={playerDraft.display_name} /></div>
                  <div className="col-12 col-md-6"><label className="form-label" htmlFor="player-position">Position</label><input className="form-control" id="player-position" onChange={(event) => setPlayerDraft((current) => ({ ...current, position: event.target.value }))} value={playerDraft.position} /></div>
                  <div className="col-12 col-md-6"><label className="form-label" htmlFor="player-age">Age</label><input className="form-control" id="player-age" max="100" min="1" onChange={(event) => setPlayerDraft((current) => ({ ...current, age: event.target.value }))} type="number" value={playerDraft.age} /></div>
                  <div className="col-12 col-md-6"><label className="form-label" htmlFor="player-country">Country</label><input className="form-control" id="player-country" onChange={(event) => setPlayerDraft((current) => ({ ...current, country: event.target.value }))} value={playerDraft.country} /></div>
                  <div className="col-12"><label className="form-label" htmlFor="player-bio">About</label><textarea className="form-control" id="player-bio" onChange={(event) => setPlayerDraft((current) => ({ ...current, bio: event.target.value }))} rows="4" value={playerDraft.bio} /></div>
                  <div className="col-12"><div className="form-check"><input className="form-check-input" checked={playerDraft.is_public} id="player-is-public" onChange={(event) => setPlayerDraft((current) => ({ ...current, is_public: event.target.checked }))} type="checkbox" /><label className="form-check-label" htmlFor="player-is-public">Show my profile in the public player directory</label></div></div>
                  <div className="col-12"><button className="btn btn-primary" disabled={saving} type="submit">{saving ? 'Saving...' : player ? 'Save player profile' : 'Create player profile'}</button></div>
                </form>
              </section> : <section className="card p-4"><h2 className="h4">Your workspace</h2><p className="text-muted mb-0">Your {roleLabels[profile?.role] ?? 'account'} account is ready. More role-specific tools will appear here as they are connected to Supabase.</p></section>}
            </div>
          </div>}
      </div>
    </main>
  )
}

export default Dashboard