/* Фоновое видео: лёгкий файл на телефонах, полный на десктопе. Пауза вне экрана. */
(function () {
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var mobile = matchMedia('(max-width: 700px)');
  var videos = [].slice.call(document.querySelectorAll('.bg-video'));

  function play(v) {
    try {
      var p = v.play();
      if (p && p.catch) p.catch(function () {});
    } catch (e) {}
  }

  videos.forEach(function (v) {
    v.muted = true;
    v.defaultMuted = true;
    if (reduced) { v.removeAttribute('autoplay'); return; }

    function pick() {
      var src = mobile.matches ? v.dataset.srcMobile : v.dataset.srcDesktop;
      if (v.getAttribute('src') !== src) { v.src = src; v.load(); }
      play(v);
    }
    pick();
    if (mobile.addEventListener) mobile.addEventListener('change', pick);

    // телефоны в режиме экономии ждут касания: запускаем при первом
    ['touchend', 'pointerdown', 'click'].forEach(function (t) {
      document.addEventListener(t, function () { if (v.paused && inView(v)) play(v); }, { passive: true });
    });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) play(v); else v.pause();
      }).observe(v);
    }
  });

  function inView(el) {
    var r = el.getBoundingClientRect();
    return r.bottom > 0 && r.top < innerHeight;
  }
})();
