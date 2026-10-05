/* ---------------- Compare rounds (workshop page only) ----------------
 * When the workshop round is over, show this team's ice-breaking answers next to
 * its workshop answers. Ice-breaking answers come from the database by team name
 * (the name this device used in round 1, or the workshop name), falling back to
 * the copy kept in this browser.
 */
(function () {
  const box = document.getElementById('compare');
  if (!box) return;
  const cfg = window.BUG_HUNT_CONFIG || {};
  const api = window.BugHuntApi;
  const session = cfg.session || 'default';
  const store = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const node = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
  const localIce = () => { try { return JSON.parse(store('bh-icebreak-' + session) || '[]'); } catch (e) { return []; } };

  let iceName = store('bh-claim-icebreak-' + session) || '';
  let loadedFor = null;

  async function iceAnswers(name) {
    if (api && api.enabled && name) {
      try {
        const rows = await api.listTeam('icebreak', name);
        if (rows.length) return { rows: rows.map(r => ({ detail: r.detail })), from: 'db' };
      } catch (e) { console.warn(e); }
    }
    const local = localIce();
    return { rows: local, from: local.length ? 'local' : 'none' };
  }

  function col(title, sub, cls) {
    const c = node('div', 'cmp-col ' + cls);
    c.append(node('span', 'cmp-round', title), node('p', 'cmp-sub', sub));
    return c;
  }

  async function render() {
    const workTeam = (document.getElementById('fTeam').value || '').trim();
    const name = iceName || workTeam;
    if (loadedFor === name + '|' + (window.BugHuntFindings ? window.BugHuntFindings.count() : 0)) return;
    loadedFor = name + '|' + (window.BugHuntFindings ? window.BugHuntFindings.count() : 0);
    box.replaceChildren(node('div', 'col-head', null), node('p', 'muted', 'กำลังโหลดคำตอบรอบ Ice breaking…'));
    box.firstChild.append(node('h2', null, 'เปรียบเทียบ 2 รอบ'), node('span', 'tag', 'ROUND 1 vs 2'));

    const ice = await iceAnswers(name);
    const work = window.BugHuntFindings ? window.BugHuntFindings.items() : [];
    const bugs = work.filter(i => i.kind === 'bug').length, reqs = work.filter(i => i.kind === 'req').length;

    const left = col('ROUND 1 · ICE BREAKING', 'ยังไม่มี requirement', 'ice');
    left.append(node('div', 'cmp-num', String(ice.rows.length)), node('p', 'cmp-unit', 'สิ่งที่เจอ'));
    const ul1 = node('ul', 'cmp-list');
    ice.rows.forEach(r => ul1.append(node('li', null, r.detail)));
    if (!ice.rows.length) ul1.append(node('li', 'muted', 'ไม่พบคำตอบรอบ Ice breaking ของชื่อทีมนี้'));
    left.append(ul1);

    const right = col('ROUND 2 · WORKSHOP', 'มี requirement + skill จาก session', 'ws');
    const nums = node('div', 'cmp-split');
    nums.append(node('span', 'bugc', '🐞 ' + bugs + ' Bug'), node('span', 'reqc', '❓ ' + reqs + ' Req ไม่ชัด'));
    right.append(node('div', 'cmp-num', String(work.length)), nums);
    const ul2 = node('ul', 'cmp-list');
    work.forEach(i => { const li = node('li'); li.append(node('span', 'chip ' + (i.kind === 'req' ? 'req' : 'bug'), i.kind === 'req' ? 'REQ' : 'BUG'), document.createTextNode(' ' + (i.req && i.req !== 'ทั่วไป / ไม่ระบุ' ? i.req + ': ' : '') + i.detail)); ul2.append(li); });
    if (!work.length) ul2.append(node('li', 'muted', 'รอบนี้ยังไม่ได้บันทึกอะไร'));
    right.append(ul2);

    const cols = node('div', 'cmp-cols'); cols.append(left, right);

    const diff = work.length - ice.rows.length;
    const lines = [];
    if (ice.rows.length) lines.push(diff > 0 ? 'รอบนี้เจอมากขึ้น ' + diff + ' อย่าง' : diff === 0 ? 'จำนวนที่เจอเท่ากับรอบแรก' : 'รอบนี้เจอน้อยกว่ารอบแรก ' + (-diff) + ' อย่าง แต่แยกได้แล้วว่าอะไรคือ Bug อะไรคือ Req ไม่ชัด');
    if (reqs) lines.push('Req ไม่ชัด ' + reqs + ' ข้อ คือสิ่งที่รอบแรกยังมองไม่เห็น เพราะยังไม่มี requirement ให้เทียบ');
    if (!lines.length) lines.push('ลองเทียบดูว่ารอบไหนเราเจอสิ่งที่สำคัญกว่ากัน');
    const sum = node('div', 'cmp-summary');
    lines.forEach(l => sum.append(node('p', null, l)));

    const src = node('p', 'cmp-src', ice.from === 'db' ? 'รอบ 1 ดึงจาก dashboard ด้วยชื่อทีม "' + name + '"' : ice.from === 'local' ? 'รอบ 1 ใช้คำตอบที่บันทึกไว้ในเครื่องนี้' : '');
    const form = node('form', 'cmp-name');
    const input = node('input'); input.type = 'text'; input.maxLength = 40; input.value = name; input.setAttribute('aria-label', 'ชื่อทีมตอน Ice breaking');
    const btn = node('button', 'ghost', 'ค้นหา'); btn.type = 'submit';
    form.append(node('span', null, 'ชื่อทีมตอน Ice breaking'), input, btn);
    form.addEventListener('submit', e => { e.preventDefault(); iceName = input.value.trim(); loadedFor = null; render(); });

    box.replaceChildren(box.firstChild, sum, cols, src, form);
  }

  function sync() {
    const over = document.body.dataset.game === 'over';
    box.hidden = !over;
    if (over) render();
    else loadedFor = null;
  }
  new MutationObserver(sync).observe(document.body, { attributes: true, attributeFilter: ['data-game'] });
  sync();
})();
