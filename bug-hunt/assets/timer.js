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
  const round = document.getElementById('fForm').dataset.round;
  // durationMinutes is either one number for every round or { icebreak: 10, full: 30 }
  const dm = cfg.durationMinutes;
  const rawMinutes = dm && typeof dm === 'object' ? dm[round] : dm;
  const minutes = Number(rawMinutes) > 0 ? Number(rawMinutes) : 10;
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
  const teamName = document.getElementById('teamName');
  // The team name is entered only on the start gate; the form just shows it.
  function lockTeam() {
    const claimed = store.get(CLAIM_KEY) || '';
    teamInput.value = claimed;
    if (teamName) teamName.textContent = claimed || '–';
  }

  let endAt = get(), tick = null;
  const fmt = ms => { const s = Math.max(0, Math.ceil(ms / 1000)); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); };
  const node = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };

  // Tell players up front that time-up saves and locks their answers.
  const lockText = 'เมื่อหมดเวลา ' + minutes + ' นาที ระบบจะบันทึกคำตอบอัตโนมัติ รวมข้อความที่พิมพ์ค้างไว้ และจะแก้ไขหรือเพิ่มคำตอบไม่ได้อีก';
  const formNote = node('p', 'auto-note', '⏰ ' + lockText);
  form.prepend(formNote);
  const toast = node('div', 'time-toast');
  toast.hidden = true; toast.setAttribute('role', 'status');
  document.body.append(toast);
  let warned = false;
  function warnLastMinute() {
    if (warned) return;
    warned = true;
    toast.textContent = '⏰ เหลือ 1 นาที · หมดเวลาแล้วระบบจะบันทึกคำตอบอัตโนมัติและแก้ไขไม่ได้';
    toast.hidden = false;
    setTimeout(() => { toast.hidden = true; }, 6000);
  }

  function lockForm(on) { form.querySelectorAll('input, select, textarea, button').forEach(el => { el.disabled = on; }); }
  function setPills(text, state) { pills.forEach(p => { p.textContent = text; p.dataset.state = state; }); }

  function showReady() {
    document.body.dataset.game = 'ready';
    wrap.inert = true;
    if (app) app.inert = false;
    if (restartBtn) restartBtn.hidden = true;
    lockForm(false);
    warned = false;
    formNote.textContent = '⏰ ' + lockText;
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
    const last = store.get('bh-team') || '';
    if (!used.includes(keyOf(last))) input.value = last;
    const msg = node('p', 'gate-msg', used.length ? 'เครื่องนี้เล่นรอบนี้ไปแล้ว ตั้งชื่อทีมใหม่เพื่อเล่นอีกรอบ' : '');
    field.append(label, input, msg, start);
    field.addEventListener('submit', e => { e.preventDefault(); startGame(input, msg, start); });
    gateBody.replaceChildren(
      (() => { const t = node('div', 'gate-title'); const a = node('a', 'home-link', 'BUG HUNT'); a.href = '/'; a.title = 'กลับหน้าหลัก'; t.append(a); return t; })(),
      node('p', 'gate-sub', document.querySelector('.title span').textContent),
      rules,
      node('div', 'gate-time', fmt(minutes * 60000)),
      node('p', 'gate-note', 'มีเวลา ' + minutes + ' นาที เวลาจะเริ่มนับทันทีที่กดเริ่มเกม · ชื่อทีมใช้ได้ทีมละครั้งต่อรอบ'),
      node('p', 'gate-warn', '⚠️ ' + lockText),
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
      if (left <= 60000) warnLastMinute();
    };
    update();
    tick = setInterval(update, 250);
  }

  function over(announce) {
    // Save the half-typed answer before the form locks (also on a reload after time ran out).
    const autoSaved = window.BugHuntFindings && window.BugHuntFindings.autoSave ? window.BugHuntFindings.autoSave() : 0;
    document.body.dataset.game = 'over';
    toast.hidden = true;
    formNote.textContent = '🔒 หมดเวลาแล้ว ระบบบันทึกคำตอบอัตโนมัติ และปิดการแก้ไขแล้ว';
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
      autoSaved ? node('p', 'gate-sub', 'ข้อความที่พิมพ์ค้างไว้ถูกบันทึกให้อัตโนมัติแล้ว') : null,
      n ? node('p', 'gate-sub', window.BugHuntApi && window.BugHuntApi.enabled ? 'คำตอบส่งถึงผู้จัดแล้ว รอดูเฉลยพร้อมกัน' : 'กด "คัดลอกทั้งหมด" แล้วนำไปวางในแชทของ session') : null,
      node('div', 'gate-actions', null)].filter(Boolean));
    gateBody.lastChild.append(close, again);
    const compare = document.getElementById('compare');
    if (compare) {
      const cmp = node('button', 'gate-btn', '⇄ เปรียบเทียบกับรอบ Ice breaking'); cmp.type = 'button';
      cmp.addEventListener('click', () => {
        overlay.hidden = true;
        document.body.dataset.tab = 'board';
        document.querySelectorAll('.mtabs button').forEach(b => b.setAttribute('aria-selected', String(b.dataset.t === 'board')));
        compare.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      gateBody.lastChild.prepend(cmp);
    }
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
    lockTeam();
    if (window.BugHuntFindings && window.BugHuntFindings.reset) window.BugHuntFindings.reset();
    const appReset = document.getElementById('appReset');
    if (appReset) appReset.click();
    document.body.dataset.tab = 'spec';
    document.querySelectorAll('.mtabs button').forEach(b => b.setAttribute('aria-selected', String(b.dataset.t === 'spec')));
    window.scrollTo(0, 0);
    showReady();
  }

  if (restartBtn) restartBtn.addEventListener('click', confirmRestart);

  function init() {
    lockTeam();
    // No team on this device (first visit, or a game started before names were required): ask first.
    if (!endAt || !store.get(CLAIM_KEY)) { endAt = 0; set(0); showReady(); }
    else if (endAt > Date.now()) play();
    else over(false);
  }

  // Access code (config.accessCodes[round] = SHA-256 hex). Unlocked once per browser for this session.
  const codeHash = cfg.accessCodes && cfg.accessCodes[round];
  const CODE_KEY = 'bh-code-' + round + '-' + (cfg.session || 'default');
  if (!codeHash || store.get(CODE_KEY) === codeHash) { init(); return; }
  document.body.dataset.game = 'closed';
  wrap.inert = true;
  setPills('🔒 ใส่รหัส', 'over');
  const cform = node('form', 'gate-field'); cform.noValidate = true;
  const cin = node('input'); cin.type = 'password'; cin.autocomplete = 'off'; cin.placeholder = 'รหัสเข้ารอบ'; cin.setAttribute('aria-label', 'รหัสเข้ารอบ');
  const cmsg = node('p', 'gate-msg', '');
  const cbtn = node('button', 'gate-btn', 'เข้าเล่น ▶'); cbtn.type = 'submit';
  cform.append(cin, cmsg, cbtn);
  const home = node('a', 'gate-btn ghost-btn', 'กลับหน้าหลัก'); home.href = '/';
  cform.addEventListener('submit', async e => {
    e.preventDefault();
    if (!window.crypto || !crypto.subtle) { cmsg.textContent = 'เปิดผ่าน https เพื่อใช้รหัส'; cmsg.className = 'gate-msg bad'; return; }
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(cin.value.trim()));
    const hex = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
    if (hex !== codeHash) { cmsg.textContent = 'รหัสไม่ถูกต้อง'; cmsg.className = 'gate-msg bad'; cin.select(); return; }
    store.set(CODE_KEY, codeHash);
    init();
  });
  gateBody.replaceChildren(
    node('div', 'gate-title', 'ใส่รหัสเข้ารอบ'),
    node('p', 'gate-sub', document.querySelector('.title span').textContent),
    node('p', 'gate-note', 'ผู้จัดจะบอกรหัสเมื่อเปิดรอบนี้'),
    cform, home);
  overlay.hidden = false;
  cin.focus();
})();
