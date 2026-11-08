/* Заголовок «Идея» появляется по словам, пункты списка поднимаются.
   Первые строки заголовка выглядывают из-под первого экрана, поэтому слова
   выходят уже после того, как отыграла анимация первого экрана. Без JS контент виден сразу. */
(function () {
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var lead = document.querySelector('.split');
  var wrap = document.querySelector('.idea__grid');
  if (!lead || !wrap) return;

  var words = lead.textContent.trim().split(/\s+/);
  lead.setAttribute('aria-label', words.join(' '));
  lead.innerHTML = words.map(function (w, i) {
    return '<span class="w" aria-hidden="true" style="--i:' + i + '">' + w + '</span>';
  }).join(' ');

  var points = [].slice.call(wrap.querySelectorAll('.rv'));
  function showLead() { lead.classList.add('in'); }
  function showPoints() { points.forEach(function (p) { p.classList.add('in'); }); }

  if (reduced || !('IntersectionObserver' in window)) { showLead(); showPoints(); return; }

  var HERO_DONE = 4600; /* мс от загрузки: к этому моменту первый экран готов */
  var leadIO = new IntersectionObserver(function (entries) {
    if (!entries[0].isIntersecting) return;
    leadIO.disconnect();
    setTimeout(showLead, Math.max(0, HERO_DONE - performance.now()));
  }, { threshold: 0.01 });
  leadIO.observe(lead);

  var pointsIO = new IntersectionObserver(function (entries) {
    if (!entries[0].isIntersecting) return;
    pointsIO.disconnect();
    showPoints();
  }, { threshold: 0.3 });
  pointsIO.observe(wrap.querySelector('.idea__points'));
})();