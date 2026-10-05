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

  return { enabled, session, insert, list };
})();
