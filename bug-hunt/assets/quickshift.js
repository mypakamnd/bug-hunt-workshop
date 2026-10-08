/* ---------------- QuickShift app (intentionally buggy) ---------------- */
(function () {
  const screen = document.getElementById('screen');
  const day = n => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + n); return d; };
  const today = day(0);
  const fmt = d => d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' });
  const JOBS = [
    { id: 'j1', title: 'พนักงานเสิร์ฟ ร้านอาหารญี่ปุ่น', place: 'สยาม', wage: 900, unit: 'วัน', start: day(1), posted: day(0), closes: day(3), desc: 'ดูแลลูกค้า รับออเดอร์ เสิร์ฟอาหาร กะ 10:00–19:00' },
    { id: 'j3', title: 'ผู้ช่วยงานอีเวนต์', place: 'เมืองทองธานี', wage: 1200, unit: 'วัน', start: day(7), posted: day(-1), closes: day(5), desc: 'จัดบูธ ต้อนรับแขก แจกของที่ระลึก งาน 2 วัน' },
    { id: 'j2', title: 'แพ็กของ คลังสินค้าออนไลน์', place: 'บางนา', wage: 650, unit: 'วัน', start: day(3), posted: day(-2), closes: day(2), desc: 'แพ็กสินค้าตามออเดอร์ ยืนทำงานได้ทั้งวัน' },
    { id: 'j4', title: 'บาริสต้า คาเฟ่', place: 'อารีย์', wage: 120, unit: 'ชม.', start: day(2), posted: day(-3), closes: day(1), desc: 'ชงกาแฟ ดูแลหน้าร้าน มีประสบการณ์จะพิจารณาเป็นพิเศษ' },
    { id: 'j6', title: 'ส่งเอกสาร (มีมอเตอร์ไซค์)', place: 'สาทร', wage: 750, unit: 'วัน', start: day(1), posted: day(-5), closes: day(4), desc: 'รับ-ส่งเอกสารในเขตสาทร สีลม มีค่าน้ำมันให้' },
    { id: 'j5', title: 'พนักงานนับสต็อก ห้างสรรพสินค้า', place: 'สยาม', wage: 800, unit: 'วัน', start: day(4), posted: day(-6), closes: day(-1), desc: 'นับสต็อกสินค้าประจำไตรมาส ทำงานกลางคืน' }
  ];
  let st;
  function reset() { st = { view: 'list', q: '', sort: 'latest', order: null, job: null, apps: [], badge: 0, errors: {}, form: {} }; render(); }
  const el = (tag, attrs, ...kids) => {
    const n = document.createElement(tag);
    for (const k in attrs || {}) {
      if (k === 'class') n.className = attrs[k];
      else if (k.startsWith('on')) n.addEventListener(k.slice(2), attrs[k]);
      else if (attrs[k] !== false && attrs[k] != null) n.setAttribute(k, attrs[k] === true ? '' : attrs[k]);
    }
    kids.flat().forEach(c => c != null && n.append(c.nodeType ? c : document.createTextNode(c)));
    return n;
  };
  const isClosed = j => j.closes < today;
  const isHot = j => (j.start - today) / 864e5 <= 1;
  const wageText = j => '฿' + j.wage.toLocaleString('en-US') + ' / ' + j.unit;

  function bar(title, back) {
    return el('div', { class: 'app-bar' },
      el('div', { class: 'brand' },
        back ? el('button', { class: 'back', type: 'button', onclick: back }, '‹ กลับ') : el('span', { class: 'logo' }, 'QuickShift'),
        el('span', { style: 'font-size:13px;opacity:.9' }, title || 'หางานพาร์ทไทม์')));
  }
  function tabs() {
    return el('nav', { class: 'app-tabs' },
      el('button', { type: 'button', class: st.view === 'mine' ? '' : 'on', onclick: () => go('list') }, 'หางาน'),
      el('button', { type: 'button', class: st.view === 'mine' ? 'on' : '', onclick: () => go('mine') }, 'งานที่สมัคร', st.badge ? el('span', { class: 'badge' }, String(st.badge)) : null));
  }
  function go(v, job) { st.view = v; if (job) st.job = job; st.errors = {}; render(); }

  function listView() {
    const b = bar();
    const input = el('input', { type: 'search', placeholder: 'ค้นหางาน หรือสถานที่', value: st.q, 'aria-label': 'ค้นหางาน' });
    input.addEventListener('input', e => { st.q = e.target.value; renderList(); });
    const sel = el('select', { 'aria-label': 'เรียงลำดับ' },
      el('option', { value: 'latest' }, 'ล่าสุด'), el('option', { value: 'wage' }, 'ค่าจ้างสูงสุด'));
    sel.value = st.sort;
    sel.addEventListener('change', e => { st.sort = e.target.value; renderList(); });
    b.append(el('div', { class: 'search' }, input, sel));
    const body = el('div', { class: 'app-body', id: 'appList' });
    function renderList() {
      // BUG: search matches title only (REQ-02 says title or place)
      // BUG: the search text is not trimmed, so a trailing space finds nothing
      let rows = JOBS.filter(j => j.title.includes(st.q));
      if (st.sort === 'wage') {
        rows = rows.slice().sort((a, b) => String(b.wage).localeCompare(String(a.wage))); // BUG: string sort
        st.order = rows.map(j => j.id);
      } else if (st.order) {
        // BUG: once sorted by wage, "ล่าสุด" keeps the wage order instead of re-sorting
        rows = rows.slice().sort((a, b) => st.order.indexOf(a.id) - st.order.indexOf(b.id));
      } else rows = rows.slice().sort((a, b) => b.posted - a.posted);
      body.replaceChildren(
        el('div', { class: 'count' }, 'พบ ' + JOBS.length + ' งาน'), // BUG: ignores search result
        ...rows.map(j => el('button', { class: 'job', type: 'button', onclick: () => go('detail', j) },
          el('span', { class: 't' }, j.title, isHot(j) && !isClosed(j) ? el('span', { class: 'pill hot' }, 'ด่วน') : null, isClosed(j) ? el('span', { class: 'pill closed' }, 'ปิดรับแล้ว') : null),
          el('span', { class: 'm' }, '📍 ' + j.place + ' · เริ่ม ' + fmt(j.start)),
          el('span', { class: 'w' }, wageText(j)))),
        rows.length ? null : el('p', { class: 'empty' }, 'ไม่พบงานที่ค้นหา'));
    }
    renderList();
    return [b, body, tabs()];
  }

  function detailView() {
    const j = st.job;
    // BUG: going back from the job detail clears the search text and the sort
    return [bar('รายละเอียดงาน', () => { st.q = ''; st.sort = 'latest'; go('list'); }),
      el('div', { class: 'app-body' },
        el('div', { class: 'detail' },
          el('h3', null, j.title),
          el('span', { class: 'w', style: 'color:var(--app-brand);font-weight:600;font-size:17px' }, wageText(j)),
          el('dl', { class: 'kv' },
            el('dt', null, 'สถานที่'), el('dd', null, j.place),
            el('dt', null, 'เริ่มงาน'), el('dd', null, fmt(j.start)),
            el('dt', null, 'รับสมัครถึง'), el('dd', null, fmt(j.start)), // BUG: shows the start date, not the closing date
            el('dt', null, 'โพสต์เมื่อ'), el('dd', null, fmt(j.posted))),
          el('p', { style: 'margin:0;font-size:13.5px' }, j.desc),
          // BUG: closed jobs still get an enabled apply button (REQ-07)
          el('button', { class: 'btn', type: 'button', onclick: () => go('apply') }, 'สมัครงานนี้'))),
      tabs()];
  }

  function field(id, label, input, hint) {
    return el('div', { class: 'field' }, el('label', { for: id }, label), input, hint ? el('span', { class: 'hint' }, hint) : null,
      st.errors[id] ? el('span', { class: 'err' }, st.errors[id]) : null);
  }
  function applyView() {
    const f = st.form;
    const name = el('input', { id: 'a-name', type: 'text', value: f.name || '' });
    const age = el('input', { id: 'a-age', type: 'number', value: f.age || '' });
    const phone = el('input', { id: 'a-phone', type: 'tel', value: f.phone || '', placeholder: '08xxxxxxxx' });
    const start = el('input', { id: 'a-start', type: 'date', value: f.start || '' });
    const file = el('input', { id: 'a-file', type: 'file' });
    const terms = el('input', { id: 'a-terms', type: 'checkbox', checked: !!f.terms });
    const form = el('form', { class: 'form', novalidate: true },
      el('div', { style: 'font-size:13px;color:var(--app-muted)' }, 'สมัคร: ' + st.job.title),
      field('a-name', 'ชื่อ-นามสกุล *', name),
      field('a-age', 'อายุ *', age),
      field('a-phone', 'เบอร์โทรศัพท์ *', phone),
      field('a-start', 'วันที่เริ่มงานได้ *', start),
      field('a-file', 'แนบ resume', file, 'ไม่บังคับ'),
      el('label', { class: 'check' }, terms, el('span', null, 'ฉันยอมรับเงื่อนไขการใช้งาน')),
      st.errors['a-terms'] ? el('span', { class: 'err', style: 'color:var(--app-err);font-size:12px' }, st.errors['a-terms']) : null,
      el('button', { class: 'btn', type: 'submit' }, 'ยืนยันการสมัคร'));
    form.addEventListener('submit', e => {
      e.preventDefault();
      st.form = { name: name.value, age: age.value, phone: phone.value, start: start.value, terms: terms.checked };
      const er = {};
      if (!name.value) er['a-name'] = 'กรุณากรอกชื่อ-นามสกุล';              // BUG: spaces-only passes
      if (!(Number(age.value) > 18)) er['a-age'] = 'ผู้สมัครต้องมีอายุ 18 ปีขึ้นไป'; // BUG: 18 rejected
      if (!/^\d{9,10}$/.test(phone.value)) er['a-phone'] = 'กรุณากรอกอีเมลให้ถูกต้อง'; // BUG: wrong message
      if (!start.value) er['a-start'] = 'กรุณาเลือกวันที่';                     // BUG: past dates accepted
      if (!terms.checked) er['a-terms'] = 'กรุณายอมรับเงื่อนไข';
      st.errors = er;
      if (Object.keys(er).length) { st.form.start = ''; render(); return; } // BUG: a validation error wipes the chosen start date
      // BUG: no duplicate check (REQ-13)
      st.apps.push({ job: st.job, at: new Date() });
      st.badge++;
      st.form = {};
      go('done');
    });
    return [bar('ใบสมัคร', () => go('detail')), el('div', { class: 'app-body' }, form), tabs()];
  }

  function doneView() {
    return [bar('สมัครสำเร็จ'),
      el('div', { class: 'app-body' }, el('div', { class: 'done' },
        el('div', { class: 'ok' }, '✓'),
        el('strong', { style: 'font-size:17px' }, 'สมัครงานสำเร็จ!'),
        el('span', null, 'ตำแหน่ง: ' + JOBS[0].title), // BUG: always shows the first job
        el('span', { style: 'color:var(--app-muted);font-size:13px' }, 'เราจะแจ้งผลให้ทราบ'),
        el('button', { class: 'btn sec', type: 'button', onclick: () => go('mine') }, 'กลับไปหางาน'))), // BUG: opens งานที่สมัคร instead of the job list
      tabs()];
  }

  function mineView() {
    const body = el('div', { class: 'app-body' });
    if (!st.apps.length) body.append(el('p', { class: 'empty' }, 'ยังไม่ได้สมัครงาน'));
    st.apps.forEach(a => body.append(el('div', { class: 'job' },
      el('span', { class: 't' }, a.job.title),
      // BUG: always shows the first job's location
      el('span', { class: 'm' }, 'สมัครเมื่อ ' + a.at.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' · ' + JOBS[0].place),
      el('div', { style: 'display:flex;justify-content:space-between;align-items:center;margin-top:4px' },
        el('span', { class: 'pill closed' }, 'รอผล'),
        // BUG: always removes the first application; badge is not updated
        el('button', { class: 'btn sec small', type: 'button', onclick: () => { st.apps.splice(0, 1); render(); } }, 'ยกเลิกการสมัคร')))));
    return [bar('งานที่สมัคร'), body, tabs()];
  }

  function render() {
    const v = { list: listView, detail: detailView, apply: applyView, done: doneView, mine: mineView }[st.view]();
    screen.replaceChildren(...v.filter(Boolean));
  }
  document.getElementById('appReset').addEventListener('click', reset);
  reset();
})();
