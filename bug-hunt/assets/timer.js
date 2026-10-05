/* ---------------- Game timer ----------------
 * ready  : the page is covered and locked until the player presses Start
 * playing: countdown runs; the end time is kept in this browser so a refresh resumes it
 * over   : the app and the form are locked; the player can still read and copy their list
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

  let endAt = get(), tick = null;
  const fmt = ms => { const s = Math.max(0, Math.ceil(ms / 1000)); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); };
  const node = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };

  function lockForm(on) { form.querySelectorAll('input, select, textarea, button').forEach(el => { el.disabled = on; }); }
  function setPills(text, state) { pills.forEach(p => { p.textContent = text; p.dataset.state = state; }); }

  function showReady() {
    document.body.dataset.game = 'ready';
    wrap.inert = true;
    setPills('⏱ ' + fmt(minutes * 60000), 'ready');
    const rules = document.querySelector('.mission').cloneNode(true);
    rules.className = 'gate-rules';
    const start = node('button', 'gate-btn', 'เริ่มเกม ▶'); start.type = 'button';
    start.addEventListener('click', begin);
    gateBody.replaceChildren(
      node('div', 'gate-title', 'BUG HUNT'),
      node('p', 'gate-sub', document.querySelector('.title span').textContent),
      rules,
      node('div', 'gate-time', fmt(minutes * 60000)),
      node('p', 'gate-note', 'มีเวลา ' + minutes + ' นาที เวลาจะเริ่มนับทันทีที่กดเริ่มเกม'),
      start);
    overlay.hidden = false;
    start.focus();
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
    if (!announce) return;
    const n = window.BugHuntFindings ? window.BugHuntFindings.count() : 0;
    const close = node('button', 'gate-btn', 'ดูรายการของฉัน'); close.type = 'button';
    close.addEventListener('click', () => {
      overlay.hidden = true;
      document.body.dataset.tab = 'board';
      document.querySelectorAll('.mtabs button').forEach(b => b.setAttribute('aria-selected', String(b.dataset.t === 'board')));
      document.getElementById('board-h').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    gateBody.replaceChildren(
      node('div', 'gate-title', 'หมดเวลา!'),
      node('div', 'gate-time', String(n)),
      node('p', 'gate-note', n ? 'คุณบันทึกสิ่งที่เจอไว้ ' + n + ' อย่าง' : 'ยังไม่ได้บันทึกสิ่งที่เจอเลย'),
      n ? node('p', 'gate-sub', window.BugHuntApi && window.BugHuntApi.enabled ? 'คำตอบส่งถึงผู้จัดแล้ว รอดูเฉลยพร้อมกัน' : 'กด "คัดลอกทั้งหมด" แล้วนำไปวางในแชทของ session') : null,
      close);
    overlay.hidden = false;
    close.focus();
  }

  if (!endAt) showReady();
  else if (endAt > Date.now()) play();
  else over(false);
})();
