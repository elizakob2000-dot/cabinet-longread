/* Счётчик «от 1 до 5 человек» при появлении на экране. */
(function () {
  var el = document.getElementById('cnt');
  if (!el || matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;

  el.textContent = '1';
  var io = new IntersectionObserver(function (entries) {
    if (!entries[0].isIntersecting) return;
    io.disconnect();
    var t0 = performance.now();
    (function frame(t) {
      var p = Math.min(1, (t - t0) / 1800);
      el.textContent = Math.min(5, Math.floor(1 + p * 4.999));
      if (p < 1) requestAnimationFrame(frame);
    })(t0);
  }, { threshold: 0.5 });
  io.observe(el);
})();
