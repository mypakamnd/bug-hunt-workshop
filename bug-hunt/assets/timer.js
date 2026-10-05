/* ---------------- Game timer ----------------
 * ready  : the page is covered and locked until the player presses Start
 * playing: countdown runs; the end time is kept in this browser so a refresh resumes it
 * over   : the app and the form are locked; the player can still read and copy their list
 * Start asks for a team name and reserves it for this round (database + this browser), so a team
 * cannot replay under the same name for extra time; "เล่นอีกรอบ" needs a new team name.
 * "เล่นอีกรอบ" clears the timer, this browser's list and the app, then shows the start gate again.
 * Add ?reset to the URL to clear this browser's timer (for rehearsals).
 */
(function () {
  const cfg = window.BUG_HUNT_CONFIG || {};
  const minutes = Number(cfg.durationMinutes) > 0 ? Number(cfg.durationMinutes) : 10;
  const round = document.getElementById('fForm').dataset.round;
  const KEY = 'bh-timer-' + round + '-' + (cfg.session || 'default');
  const wrap = document.querySelector('.wrap');
  const app = document.querySelector('[data-sec="app"]');
  const form = document.getElementById('fForm');
  const pills = Array.from(document.querySelectorAll('[data-timer]'));
  const overlay = document.getElementById('gate');
  const gateBody = document.getElementById('gateBody');

  const get = () => { try { return Number(localStorage.getItem(KEY)) || 0; } catch (e) { return 0; } };
  const set = v => { try { v ? localStorage.setItem(KEY, String(v)) : localStorage.removeItem(KEY); } catch (e) {} };
  if (/[?&]reset\b/.test(location.search)) set(0);
  const restartBtn = document.getElementById('restartBtn');
  const teamInput = document.getElementById('fTeam');
  const CLAIM_KEY = 'bh-claim-' + round + '-' + (cfg.session || 'default');
  const USED_KEY = 'bh-used-' + round + '-' + (cfg.session || 'default');
  const store = {
    get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch (e) {} }
  };
  const usedNames = () => { try { return JSON.parse(store.get(USED_KEY) || '[]'); } catch (e) { return []; } };
  const keyOf = t => t.trim().toLowerCase();
  function lockTeam() {
    const claimed = store.get(CLAIM_KEY);
    if (!claimed) return;
    teamInput.value = claimed;
    teamInput.readOnly = true;
    teamInput.title = 'ชื่อทีมถูกล็อกไว้จนจบรอบนี้';
  }

  let endAt = get(), tick = null;
  const fmt = ms => { const s = Math.max(0, Math.ceil(ms / 1000)); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); };
  const node = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };

  function lockForm(on) { form.querySelectorAll('input, select, textarea, button').forEach(el => { el.disabled = on; }); }
  function setPills(text, state) { pills.forEach(p => { p.textContent = text; p.dataset.state = state; }); }

  function showReady() {
    document.body.dataset.game = 'ready';
    wrap.inert = true;
    if (app) app.inert = false;
    if (restartBtn) restartBtn.hidden = true;
    lockForm(false);
    setPills('⏱ ' + fmt(minutes * 60000), 'ready');
    const rules = document.querySelector('.mission').cloneNode(true);
    rules.className = 'gate-rules';
    const start = node('button', 'gate-btn', 'เริ่มเกม ▶'); start.type = 'submit';
    const field = node('form', 'gate-field');
    field.noValidate = true;
    const label = node('label', null, 'ชื่อทีม');
    label.htmlFor = 'gateTeam';
    const input = node('input');
    input.id = 'gateTeam'; input.type = 'text'; input.maxLength = 40; input.autocomplete = 'off';
    input.placeholder = 'เช่น ทีมแมวส้ม';
    const used = usedNames();
    if (!used.includes(keyOf(teamInput.value || ''))) input.value = teamInput.value || '';
    const msg = node('p', 'gate-msg', used.length ? 'เครื่องนี้เล่นรอบนี้ไปแล้ว ตั้งชื่อทีมใหม่เพื่อเล่นอีกรอบ' : '');
    field.append(label, input, msg, start);
    field.addEventListener('submit', e => { e.preventDefault(); startGame(input, msg, start); });
    gateBody.replaceChildren(
      node('div', 'gate-title', 'BUG HUNT'),
      node('p', 'gate-sub', document.querySelector('.title span').textContent),
      rules,
      node('div', 'gate-time', fmt(minutes * 60000)),
      node('p', 'gate-note', 'มีเวลา ' + minutes + ' นาที เวลาจะเริ่มนับทันทีที่กดเริ่มเกม · ชื่อทีมใช้ได้ทีมละครั้งต่อรอบ'),
      field);
    overlay.hidden = false;
    input.focus();
  }

  async function startGame(input, msg, btn) {
    const team = input.value.trim();
    const bad = t => { msg.textContent = t; msg.className = 'gate-msg bad'; input.focus(); input.select(); };
    if (!team) return bad('ใส่ชื่อทีมก่อนเริ่มเกม');
    if (/[*%_\\",()]/.test(team)) return bad('ชื่อทีมห้ามมีเครื่องหมาย * % _ \\ " , ( )');
    if (usedNames().includes(keyOf(team))) return bad('เครื่องนี้ใช้ชื่อ "' + team + '" ในรอบนี้ไปแล้ว ตั้งชื่อทีมใหม่');
    const api = window.BugHuntApi;
    if (api && api.enabled) {
      btn.disabled = true; input.disabled = true;
      msg.textContent = 'กำลังตรวจชื่อทีม…'; msg.className = 'gate-msg';
      let res;
      try { res = await api.claimTeam(round, team); }
      catch (e) { console.warn(e); btn.disabled = false; input.disabled = false; return bad('ตรวจชื่อทีมไม่สำเร็จ เช็กอินเทอร์เน็ตแล้วกดเริ่มอีกครั้ง'); }
      btn.disabled = false; input.disabled = false;
      if (!res.ok) return bad('ชื่อทีม "' + team + '" มีคนใช้ในรอบนี้แล้ว ตั้งชื่ออื่น');
    }
    store.set(CLAIM_KEY, team);
    store.set(USED_KEY, JSON.stringify(usedNames().concat(keyOf(team))));
    store.set('bh-team', team);
    begin();
  }

  function begin() {
    endAt = Date.now() + minutes * 60000;
    set(endAt);
    play();
  }

  function play() {
    document.body.dataset.game = 'playing';
    overlay.hidden = true;
    wrap.inert = false;
    lockForm(false);
    lockTeam();
    if (restartBtn) restartBtn.hidden = true;
    clearInterval(tick);
    const update = () => {
      const left = endAt - Date.now();
      if (left <= 0) { clearInterval(tick); over(true); return; }
      setPills('⏱ ' + fmt(left), left <= 60000 ? 'last' : 'playing');
    };
    update();
    tick = setInterval(update, 250);
  }

  function over(announce) {
    document.body.dataset.game = 'over';
    wrap.inert = false;
    if (app) app.inert = true;
    lockForm(true);
    setPills('⏰ หมดเวลา', 'over');
    if (restartBtn) restartBtn.hidden = false;
    if (!announce) return;
    const n = window.BugHuntFindings ? window.BugHuntFindings.count() : 0;
    const close = node('button', 'gate-btn', 'ดูรายการของฉัน'); close.type = 'button';
    const again = node('button', 'gate-btn ghost-btn', '↺ เล่นอีกรอบ'); again.type = 'button';
    again.addEventListener('click', confirmRestart);
    close.addEventListener('click', () => {
      overlay.hidden = true;
      document.body.dataset.tab = 'board';
      document.querySelectorAll('.mtabs button').forEach(b => b.setAttribute('aria-selected', String(b.dataset.t === 'board')));
      document.getElementById('board-h').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    gateBody.replaceChildren(...[
      node('div', 'gate-title', 'หมดเวลา!'),
      node('div', 'gate-time', String(n)),
      node('p', 'gate-note', n ? 'คุณบันทึกสิ่งที่เจอไว้ ' + n + ' อย่าง' : 'ยังไม่ได้บันทึกสิ่งที่เจอเลย'),
      n ? node('p', 'gate-sub', window.BugHuntApi && window.BugHuntApi.enabled ? 'คำตอบส่งถึงผู้จัดแล้ว รอดูเฉลยพร้อมกัน' : 'กด "คัดลอกทั้งหมด" แล้วนำไปวางในแชทของ session') : null,
      node('div', 'gate-actions', null)].filter(Boolean));
    gateBody.lastChild.append(close, again);
    overlay.hidden = false;
    close.focus();
  }

  function confirmRestart() {
    const yes = node('button', 'gate-btn', '↺ เริ่มใหม่ทั้งหมด'); yes.type = 'button';
    const no = node('button', 'gate-btn ghost-btn', 'ยกเลิก'); no.type = 'button';
    yes.addEventListener('click', restart);
    no.addEventListener('click', () => { overlay.hidden = true; if (restartBtn) restartBtn.focus(); });
    const sent = window.BugHuntApi && window.BugHuntApi.enabled;
    gateBody.replaceChildren(
      node('div', 'gate-title', 'เล่นอีกรอบ?'),
      node('p', 'gate-note', 'เวลาจะเริ่มนับใหม่ แอปจะกลับไปหน้าแรก รายการที่บันทึกไว้ในเครื่องนี้จะถูกล้าง และต้องตั้งชื่อทีมใหม่'),
      sent ? node('p', 'gate-sub', 'คำตอบที่ส่งถึงผู้จัดไปแล้วยังอยู่ใน dashboard ตามเดิม') : node('p', 'gate-sub', 'ถ้ายังไม่ได้คัดลอกรายการไปวางในแชท ให้กดยกเลิกแล้วคัดลอกก่อน'),
      node('div', 'gate-actions', null));
    gateBody.lastChild.append(yes, no);
    overlay.hidden = false;
    no.focus();
  }

  function restart() {
    clearInterval(tick);
    endAt = 0;
    set(0);
    store.set(CLAIM_KEY, null);
    teamInput.readOnly = false;
    teamInput.title = '';
    teamInput.value = '';
    if (window.BugHuntFindings && window.BugHuntFindings.reset) window.BugHuntFindings.reset();
    const appReset = document.getElementById('appReset');
    if (appReset) appReset.click();
    document.body.dataset.tab = 'spec';
    document.querySelectorAll('.mtabs button').forEach(b => b.setAttribute('aria-selected', String(b.dataset.t === 'spec')));
    window.scrollTo(0, 0);
    showReady();
  }

  if (restartBtn) restartBtn.addEventListener('click', confirmRestart);

  if (!endAt) showReady();
  else if (endAt > Date.now()) play();
  else over(false);
})();
