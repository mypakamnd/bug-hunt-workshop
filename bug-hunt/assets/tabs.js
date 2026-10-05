/* ---------------- Mobile tabs ---------------- */
(function () {
  const btns = Array.from(document.querySelectorAll('.mtabs button'));
  function show(t, scroll) {
    document.body.dataset.tab = t;
    btns.forEach(b => b.setAttribute('aria-selected', String(b.dataset.t === t)));
    if (scroll) window.scrollTo({ top: document.querySelector('.mtabs').offsetTop, behavior: 'smooth' });
  }
  btns.forEach(b => b.addEventListener('click', () => show(b.dataset.t, true)));
  show('spec', false);
})();
