/* Tiny Supabase REST client shared by the game pages and the dashboard. */
window.BugHuntApi = (function () {
  const cfg = window.BUG_HUNT_CONFIG || {};
  const base = (cfg.supabaseUrl || '').replace(/\/+$/, '');
  const key = cfg.supabaseAnonKey || '';
  const session = cfg.session || 'default';
  const enabled = !!(base && key);
  const headers = { apikey: key, 'Content-Type': 'application/json' };

  async function insert(rows) {
    const res = await fetch(base + '/rest/v1/findings', {
      method: 'POST',
      headers: Object.assign({ Prefer: 'return=minimal' }, headers),
      body: JSON.stringify(rows.map(r => Object.assign({ session }, r)))
    });
    if (!res.ok) throw new Error('insert ' + res.status + ': ' + (await res.text()).slice(0, 200));
  }

  async function list() {
    const q = '?select=id,created_at,round,team,kind,req,detail' +
      '&session=eq.' + encodeURIComponent(session) +
      '&order=created_at.desc&limit=2000';
    const res = await fetch(base + '/rest/v1/findings' + q, { headers });
    if (!res.ok) throw new Error('list ' + res.status + ': ' + (await res.text()).slice(0, 200));
    return res.json();
  }

  // Reserve a team name for this session + round. Resolves {ok:true} or {ok:false, reason:'taken'};
  // throws on network/server errors so the caller can ask the player to retry.
  async function claimTeam(round, team) {
    const name = team.trim();
    const sameName = '?select=id&limit=1&session=eq.' + encodeURIComponent(session) +
      '&round=eq.' + encodeURIComponent(round) + '&team=ilike.' + encodeURIComponent(name);
    const prev = await fetch(base + '/rest/v1/findings' + sameName, { headers });
    if (!prev.ok) throw new Error('check ' + prev.status);
    if ((await prev.json()).length) return { ok: false, reason: 'taken' };
    const res = await fetch(base + '/rest/v1/teams', {
      method: 'POST',
      headers: Object.assign({ Prefer: 'return=minimal' }, headers),
      body: JSON.stringify({ session, round, team: name })
    });
    if (res.ok) return { ok: true };
    if (res.status === 409) return { ok: false, reason: 'taken' };
    // teams table not created yet: fall back to the findings check above
    if (res.status === 404) return { ok: true, unchecked: true };
    throw new Error('claim ' + res.status + ': ' + (await res.text()).slice(0, 200));
  }

  // One team's answers in one round (team name matched case-insensitively).
  async function listTeam(round, team) {
    const q = '?select=detail,kind,req,created_at&order=created_at.asc&limit=200' +
      '&session=eq.' + encodeURIComponent(session) + '&round=eq.' + encodeURIComponent(round) +
      '&team=ilike.' + encodeURIComponent(team.trim());
    const res = await fetch(base + '/rest/v1/findings' + q, { headers });
    if (!res.ok) throw new Error('listTeam ' + res.status);
    return res.json();
  }

  return { enabled, session, insert, list, claimTeam, listTeam };
})();
