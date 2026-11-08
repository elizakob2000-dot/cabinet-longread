/* Появление заголовка «Идея» по словам и пунктов списка. Без JS контент виден сразу. */
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

  var targets = [].slice.call(wrap.querySelectorAll('.split, .rv'));
  if (reduced || !('IntersectionObserver' in window)) {
    targets.forEach(function (t) { t.classList.add('in'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    if (!entries[0].isIntersecting) return;
    io.disconnect();
    targets.forEach(function (t) { t.classList.add('in'); });
  }, { threshold: 0.25 });
  io.observe(wrap);
})();
