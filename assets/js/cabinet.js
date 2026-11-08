/* Сцена «Всё в одном кабинете»: вкладки собираются в кабинет по мере прокрутки,
   три плюса подсвечивают зоны макета. */
(function () {
  var scene = document.getElementById('cabinet');
  var cab = document.getElementById('cab');
  var mess = document.getElementById('mess');
  if (!scene || !cab || !mess) return;

  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hoverable = matchMedia('(hover: hover)').matches;
  function $(s, r) { return [].slice.call((r || document).querySelectorAll(s)); }

  var bn = document.getElementById('bn');
  var bt = document.getElementById('bt');
  var bar = document.getElementById('bar');
  var ht = document.getElementById('ht');
  var go = document.getElementById('go');
  var hintRow = document.getElementById('hr');
  var after = document.getElementById('after');
  var desc = document.getElementById('desc');
  var win = document.querySelector('.k-win');
  var list = document.getElementById('lst');
  var items = $('.k-item', list);
  var chips = [].slice.call(mess.children).map(function (el) { return { el: el, dx: 0, dy: 0 }; });

  var ROT = [-3, 2, -1.5, 3, -2, 1.5, -2.5];
  var SHIFT = [0, 6, 0, -4, 4, 0, -2];
  var PLACEHOLDER = 'Нажмите на плюс — подсветим его в кабинете';
  var auto = false, autoP = 0, anim = 0;

  function clamp(x) { return Math.max(0, Math.min(1, x)); }
  function ease(t) { return 1 - Math.pow(1 - t, 3); }
  function plural(n) {
    var m = n % 10, h = n % 100;
    return (m === 1 && h !== 11) ? 'вкладка' : (m > 1 && m < 5 && (h < 10 || h > 20)) ? 'вкладки' : 'вкладок';
  }

  /* подсветка зон для плюса n (0 — без подсветки) */
  function setActive(n) {
    $('.k-z.k-on').forEach(function (z) { z.classList.remove('k-on'); });
    items.forEach(function (b) { b.classList.remove('k-act'); });
    desc.textContent = PLACEHOLDER;
    win.classList.toggle('k-focus', !!n);
    list.classList.toggle('k-focus', !!n);
    if (!n) return;
    $('.k-z[data-n="' + n + '"]').forEach(function (z) { z.classList.add('k-on'); });
    items[n - 1].classList.add('k-act');
    desc.textContent = items[n - 1].dataset.t;
  }

  /* автоподсветка: один круг по трём плюсам, затем останавливается */
  var timer = 0, step = 0, touched = false, played = false;
  function stopCycle() { clearInterval(timer); timer = 0; }
  function startCycle() {
    if (timer || touched || played) return;
    step = 1; setActive(1);
    timer = setInterval(function () {
      if (step >= items.length) { stopCycle(); played = true; setActive(0); return; }
      step++; setActive(step);
    }, 2400);
  }

  items.forEach(function (b, i) {
    var n = i + 1;
    function on() { touched = true; stopCycle(); setActive(n); }
    function off() { setActive(0); }
    b.addEventListener('focus', on);
    b.addEventListener('blur', off);
    b.addEventListener('click', on);
    if (hoverable) {
      b.addEventListener('mouseenter', on);
      b.addEventListener('mouseleave', off);
    }
  });
  setActive(0);

  /* геометрия «вкладок»: смещение каждой к центру */
  function measure() {
    var s = mess.getBoundingClientRect();
    var cx = s.left + s.width / 2, cy = s.top + s.height / 2;
    chips.forEach(function (c) { c.el.style.transform = 'none'; });
    chips.forEach(function (c) {
      var r = c.el.getBoundingClientRect();
      c.dx = r.left + r.width / 2 - cx;
      c.dy = r.top + r.height / 2 - cy;
    });
    render(progress());
  }

  function progress() {
    if (reduced) return 1;
    if (auto) return autoP;
    var r = scene.getBoundingClientRect();
    var total = scene.offsetHeight - innerHeight;
    return total > 0 ? clamp(-r.top / total) : 0;
  }

  function render(p) {
    var left = 0;
    chips.forEach(function (c, i) {
      var t = clamp((p - 0.04 - i * 0.07) / 0.3);
      var e = ease(t);
      var o = t < 0.7 ? 1 : 1 - (t - 0.7) / 0.3;
      c.el.style.transform = 'translate(' + (-c.dx * e) + 'px,' + (-c.dy * e + SHIFT[i] * (1 - e)) + 'px) rotate(' + (ROT[i] * (1 - e)) + 'deg) scale(' + (1 - 0.75 * e) + ')';
      c.el.style.opacity = o;
      if (t < 0.6) left++;
    });
    var ce = ease(clamp((p - 0.5) / 0.3));
    cab.style.opacity = ce;
    cab.style.transform = 'translateY(' + (28 * (1 - ce)) + 'px) scale(' + (0.96 + 0.04 * ce) + ')';

    bn.textContent = left > 0 ? left : 1;
    bt.textContent = left > 0 ? plural(left) + ' по одному проекту' : 'личный кабинет вместо вкладок';
    bar.style.width = (p * 100) + '%';

    var a = clamp((p - 0.8) / 0.14);
    after.style.opacity = a;
    after.style.pointerEvents = a > 0.6 ? 'auto' : 'none';
    hintRow.style.opacity = 1 - a;
    hintRow.style.pointerEvents = a > 0.2 ? 'none' : 'auto';

    var started = p > 0.04;
    ht.textContent = started
      ? (auto ? 'Собираем кабинет…' : 'Продолжайте прокручивать')
      : (auto ? 'Нажмите кнопку — вкладки соберутся в кабинет' : 'Прокрутите вниз — вкладки соберутся в кабинет');
    go.style.opacity = started ? 0 : 1;
    go.style.pointerEvents = started ? 'none' : 'auto';

    if (p > 0.97) {
      startCycle();
    } else {
      stopCycle(); touched = false; played = false; setActive(0);
    }
  }

  /* режим «меньше движения»: сразу итоговое состояние */
  if (reduced) {
    scene.classList.add('k-static');
    chips.forEach(function (c) { c.el.style.opacity = 0; });
    cab.style.opacity = 1;
    bn.textContent = '1';
    bt.textContent = 'личный кабинет вместо вкладок';
    return;
  }

  var pinned = document.querySelector('.k-pinned');
  function pinWorks() {
    return getComputedStyle(pinned).position === 'sticky' && scene.offsetHeight - innerHeight > 150;
  }
  function playAuto() {
    if (anim) return;
    var t0 = performance.now(), D = 5200;
    (function frame(t) {
      autoP = clamp((t - t0) / D);
      render(autoP);
      if (autoP < 1) anim = requestAnimationFrame(frame); else anim = 0;
    })(t0);
  }

  if (!pinWorks()) {
    /* запасной вариант: закрепление недоступно, сцена проигрывается сама */
    auto = true;
    scene.classList.add('k-auto');
    go.addEventListener('click', playAuto);
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (e) {
        if (e[0].isIntersecting) { io.disconnect(); setTimeout(playAuto, 600); }
      }, { threshold: 0.6 });
      io.observe(scene);
    }
  } else {
    var ticking = false;
    addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () { ticking = false; render(progress()); });
    }, { passive: true });
    go.addEventListener('click', function () {
      scrollTo({ top: scene.offsetTop + scene.offsetHeight - innerHeight, behavior: 'smooth' });
    });
  }

  addEventListener('resize', measure);
  measure();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
})();
