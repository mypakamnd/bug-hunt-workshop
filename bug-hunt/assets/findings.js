/* ---------------- Findings form (both game pages) ----------------
 * The form's data-round ("icebreak" | "full") decides which fields exist.
 * "full" is the stored value for the Workshop round (/workshop); it stays "full" to match the database.
 * Every entry is kept in this browser; when Supabase is configured it is
 * also sent to the facilitator dashboard, and unsent entries retry later.
 */
(function () {
  const $ = id => document.getElementById(id);
  const api = window.BugHuntApi;
  const form = $('fForm');
  const round = form.dataset.round;
  const full = round === 'full';
  const KEY = 'bh-' + round + '-' + api.session;

  if ($('fReq')) {
    const REQS = ['ทั่วไป / ไม่ระบุ'].concat(Array.from({ length: 17 }, (_, i) => 'REQ-' + String(i + 1).padStart(2, '0')));
    $('fReq').append(...REQS.map(r => { const o = document.createElement('option'); o.value = r; o.textContent = r; return o; }));
  }
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { return []; } };
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) {} };
  let items = load();
  try { $('fTeam').value = localStorage.getItem('bh-team') || ''; } catch (e) {}
  const node = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };

  $('syncNote').textContent = api.enabled
    ? 'ส่งถึงผู้จัดอัตโนมัติ และเก็บสำเนาไว้ในเครื่องนี้'
    : 'บันทึกไว้ในเบราว์เซอร์นี้ หมดเวลาแล้วกด "คัดลอกทั้งหมด" ไปวางในแชทของ session';

  function render() {
    if (full) {
      const bugs = items.filter(i => i.kind === 'bug').length;
      $('score').textContent = '🐞 ' + bugs + ' · ❓ ' + (items.length - bugs);
    } else {
      $('score').textContent = '🔍 ' + items.length;
    }
    $('mcount').textContent = items.length ? '(' + items.length + ')' : '';
    const feed = $('feed'); feed.replaceChildren();
    if (!items.length) feed.append(node('p', 'muted', 'ยังไม่มีรายการ เจออะไรแปลก ๆ บันทึกไว้ได้เลย'));
    items.forEach((it, idx) => {
      const box = node('div', 'item ' + (full ? (it.kind === 'req' ? 'req' : 'bug') : 'plain'));
      const h = node('div', 'h');
      if (full) h.append(node('span', 'chip ' + (it.kind === 'req' ? 'req' : 'bug'), it.kind === 'req' ? 'REQ ไม่ชัด' : 'BUG'), node('span', 'chip ref', it.req));
      else h.append(node('span', 'chip ref', '#' + (idx + 1)));
      if (api.enabled) h.append(node('span', 'chip ' + (it.sent ? 'ok' : 'ref'), it.sent ? 'ส่งแล้ว' : 'รอส่ง'));
      if (!it.sent || !api.enabled) {
        const del = node('button', 'act', 'ลบ'); del.type = 'button'; del.style.marginLeft = 'auto';
        del.addEventListener('click', () => { items.splice(idx, 1); save(); render(); });
        h.append(del);
      }
      box.append(h, node('p', null, it.detail));
      feed.append(box);
    });
  }

  let sending = false;
  async function flush(team) {
    if (!api.enabled || sending) return true;
    const pending = items.filter(i => !i.sent);
    if (!pending.length) return true;
    sending = true;
    try {
      await api.insert(pending.map(i => ({ round, team: i.team || team, kind: full ? i.kind : null, req: full ? i.req : null, detail: i.detail })));
      pending.forEach(i => { i.sent = true; });
      save();
      return true;
    } catch (e) {
      console.warn(e);
      return false;
    } finally { sending = false; render(); }
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const team = $('fTeam').value.trim(), detail = $('fText').value.trim(), msg = $('fMsg');
    if (!team) { msg.textContent = 'ใส่ชื่อทีมหรือชื่อเล่นก่อน'; msg.className = 'msg bad'; $('fTeam').focus(); return; }
    if (detail.length < 5) { msg.textContent = 'เล่ารายละเอียดเพิ่มอีกนิด'; msg.className = 'msg bad'; $('fText').focus(); return; }
    try { localStorage.setItem('bh-team', team); } catch (e) {}
    const it = { team, detail, sent: false };
    if (full) { it.kind = document.querySelector('input[name=kind]:checked').value; it.req = $('fReq').value; }
    items.push(it); save(); render();
    $('fText').value = '';
    $('fSubmit').disabled = true;
    const ok = await flush(team);
    $('fSubmit').disabled = false;
    if (!api.enabled) { msg.textContent = 'บันทึกแล้ว! หาต่อเลย'; msg.className = 'msg ok'; }
    else if (ok) { msg.textContent = 'ส่งถึงผู้จัดแล้ว! หาต่อเลย'; msg.className = 'msg ok'; }
    else { msg.textContent = 'ส่งไม่สำเร็จ บันทึกไว้ในเครื่องแล้ว จะลองส่งใหม่ตอนบันทึกครั้งถัดไป'; msg.className = 'msg bad'; }
  });

  $('copyBtn').addEventListener('click', async () => {
    const team = $('fTeam').value.trim() || 'ไม่ระบุทีม';
    const head = full
      ? 'Bug Hunt (Workshop) · ' + team + ' (🐞 ' + items.filter(i => i.kind === 'bug').length + ' · ❓ ' + items.filter(i => i.kind === 'req').length + ')'
      : 'Bug Hunt · ' + team + ' (เจอ ' + items.length + ' อย่าง)';
    const lines = [head].concat(items.map((it, i) => (i + 1) + '. ' + (full ? '[' + (it.kind === 'req' ? 'REQ ไม่ชัด' : 'BUG') + '] ' + it.req + ': ' : '') + it.detail));
    const text = lines.join('\n'), area = $('copyArea'), msg = $('copyMsg');
    try { await navigator.clipboard.writeText(text); msg.textContent = 'คัดลอกแล้ว นำไปวางในแชทได้เลย'; msg.className = 'msg ok'; area.hidden = true; }
    catch (e) { area.value = text; area.hidden = false; area.focus(); area.select(); msg.textContent = 'คัดลอกอัตโนมัติไม่ได้ ข้อความถูกเลือกไว้แล้ว กด Ctrl/Cmd + C'; msg.className = 'msg bad'; }
  });

  window.BugHuntFindings = {
    count: () => items.length,
    // Clears only this browser's copy; answers already sent to the dashboard stay there.
    reset: () => { items = []; save(); render(); $('fText').value = ''; $('fMsg').textContent = ''; $('copyMsg').textContent = ''; $('copyArea').hidden = true; }
  };
  render();
  flush($('fTeam').value.trim());
})();
