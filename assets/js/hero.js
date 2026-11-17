/* Первый экран. Пока курсор на картинках (или после касания, Enter, пробела), почты, сообщений и таблиц становится
   всё больше, а когда их набралось много, они схлопываются в плашку «Личный кабинет». Плашка держится несколько секунд,
   потом всё возвращается и собирается заново, и так по кругу. Кнопка паузы останавливает цикл на кадре с плашкой.
   Первый раз картинки растут только пока курсор на них: ушёл раньше времени, и они по одной исчезают обратно.
   Прогресс p идёт от 0 до 1: чем он больше, тем больше картинок включено. */
(function () {
  var hero = document.getElementById('top');
  var stage = document.getElementById('stage');
  if (!hero || !stage) return;
  var list = stage.querySelector('.hero__things');
  var plateLink = hero.querySelector('.hero__plate a');
  var pause = hero.querySelector('.hero__pause');
  var live = document.getElementById('heroLive');
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  var UP = 2800;     /* мс от начала до плашки */
  var DOWN = 1100;   /* мс на возврат, если курсор ушёл раньше времени */
  var RESET = 900;   /* мс на возврат после плашки */
  var HOLD = 4500;   /* мс держится плашка */
  var REST = 1200;   /* мс передышки между кругами */

  var state = 'idle';   /* idle | build | hold | reset | rest */
  var p = 0, hover = false, auto = false, looping = false, paused = false, frozen = false;
  var holdLeft = 0, last = 0, raf = 0, visible = true, announced = false;

  hero.classList.add('play');

  /* добавочные картинки: заранее известные места (x, y в %, поворот, размер, какая) */
  var imgs = [['mail.png', 360, 318], ['chat.png', 360, 269], ['table.png', 360, 318]];
  var spots = [
    [60, 8, 6, 0.8, 1], [80, 6, -6, 0.7, 2], [90, 26, 9, 0.65, 0], [66, 26, -7, 0.7, 1],
    [50, 40, 10, 0.65, 0], [78, 44, 6, 0.75, 2], [54, 58, -8, 0.8, 0], [90, 60, 6, 0.7, 1],
    [68, 68, -5, 0.8, 2], [44, 76, 8, 0.75, 1], [22, 80, -6, 0.8, 0], [6, 88, 10, 0.7, 2],
    [34, 90, 5, 0.65, 1], [82, 84, -9, 0.7, 0]
  ];
  var extras = spots.map(function (s) {
    var im = imgs[s[4]];
    var li = document.createElement('li');
    li.className = 'thing extra';
    li.style.setProperty('--x', s[0] + '%');
    li.style.setProperty('--y', s[1] + '%');
    li.style.setProperty('--r', s[2] + 'deg');
    li.style.setProperty('--s', s[3]);
    li.innerHTML = '<img src="assets/img/' + im[0] + '" alt="" width="' + im[1] + '" height="' + im[2] + '">';
    list.appendChild(li);
    return li;
  });
  var all = [].slice.call(list.children);

  /* куда схлопываться: к центру плашки; считаем по layout-смещениям, transform на них не влияет */
  function center(el) {
    var x = 0, y = 0;
    for (var n = el; n && n !== stage; n = n.offsetParent) { x += n.offsetLeft; y += n.offsetTop; }
    return { x: x + el.offsetWidth / 2, y: y + el.offsetHeight / 2 };
  }
  function measure() {
    var cx = stage.clientWidth / 2, cy = stage.clientHeight / 2;
    if (plateLink) {
      var sr = stage.getBoundingClientRect(), pr = plateLink.getBoundingClientRect();
      cx = pr.left + pr.width / 2 - sr.left; cy = pr.top + pr.height / 2 - sr.top;
    }
    all.forEach(function (t) {
      var c = center(t);
      t.style.setProperty('--dx', (cx - c.x) + 'px');
      t.style.setProperty('--dy', (cy - c.y) + 'px');
    });
  }
  function paint() {
    /* картинок прибавляется всё быстрее: сначала по одной, к концу целыми горстями */
    var n = Math.floor(extras.length * Math.pow(p, 1.7) + 0.0001);
    extras.forEach(function (li, i) { li.classList.toggle('on', i < n); });
    stage.classList.toggle('is-active', p > 0.001);
  }
  function setDone(on) {
    stage.classList.toggle('is-done', on);
    stage.setAttribute('aria-label', on
      ? 'Теперь это личный кабинет'
      : 'Почта, мессенджеры и таблицы: наведите, чтобы их стало больше и они собрались в личный кабинет');
  }
  function enterHold() {
    state = 'hold'; p = 1; holdLeft = HOLD;
    extras.forEach(function (li) { li.classList.add('on'); });
    stage.classList.add('is-active');
    setDone(true);
    looping = true;   /* после первого раза цикл идёт сам */
    if (!announced && live) { live.textContent = 'Почта, мессенджеры и таблицы собрались в личный кабинет.'; announced = true; }
  }
  function enterReset() { state = 'reset'; setDone(false); }
  function frame(t) {
    raf = 0;
    if (!visible || paused) { last = 0; return; }
    var dt = last ? Math.min(64, t - last) : 16;
    last = t;
    if (state === 'idle' || state === 'build') {
      if (hover || auto || looping) { state = 'build'; p = Math.min(1, p + dt / UP); }
      else p = Math.max(0, p - dt / DOWN);
      paint();
      if (p >= 1) enterHold();
      else if (p <= 0 && !(hover || auto || looping)) { state = 'idle'; last = 0; return; }
    } else if (state === 'hold') {
      if (!frozen) holdLeft -= dt;
      if (holdLeft <= 0) enterReset();
    } else if (state === 'reset') {
      p = Math.max(0, p - dt / RESET);
      paint();
      if (p <= 0) {
        if (!(looping || hover || auto)) { state = 'idle'; last = 0; return; }
        state = 'rest'; holdLeft = REST;   /* короткая передышка: видны три исходные картинки */
      }
    } else if (state === 'rest') {
      holdLeft -= dt;
      if (holdLeft <= 0) state = 'idle';
    }
    raf = requestAnimationFrame(frame);
  }
  function run() { if (!raf && !paused && visible) raf = requestAnimationFrame(frame); }

  function start(how) {
    if (paused || state === 'hold' || state === 'reset' || state === 'rest') return;
    if (how === 'hover') hover = true; else auto = true;
    if (reduced) { enterHold(); looping = false; return; }
    run();
  }
  stage.addEventListener('pointerenter', function (e) { start(e.pointerType === 'mouse' || e.pointerType === 'pen' ? 'hover' : 'auto'); });
  stage.addEventListener('pointerleave', function () { hover = false; run(); });
  stage.addEventListener('click', function () { start('auto'); });
  stage.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    start('auto');
  });

  /* пока человек тянется к плашке или стоит на ней с клавиатуры, она не исчезает */
  if (plateLink) {
    ['mouseenter', 'focus'].forEach(function (n) { plateLink.addEventListener(n, function () { frozen = true; }); });
    ['mouseleave', 'blur'].forEach(function (n) { plateLink.addEventListener(n, function () { frozen = false; }); });
  }

  /* пауза: остаётся кадр с плашкой; «играть» начинает цикл с начала */
  if (pause) {
    pause.addEventListener('click', function () {
      paused = !paused;
      hero.classList.toggle('is-paused', paused);
      pause.setAttribute('aria-pressed', paused ? 'true' : 'false');
      pause.setAttribute('aria-label', paused ? 'Запустить анимацию' : 'Остановить анимацию');
      if (paused) {
        cancelAnimationFrame(raf); raf = 0; last = 0;
        enterHold(); looping = false; holdLeft = 1e9;
        if (live) live.textContent = 'Анимация остановлена.';
      } else {
        auto = true; looping = true; hover = false;
        state = 'reset'; setDone(false);
        if (live) live.textContent = 'Анимация запущена.';
        run();
      }
    });
  }

  /* вне экрана цикл стоит */
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (e) {
      visible = e[0].isIntersecting;
      if (visible) { last = 0; if (state !== 'idle' || hover || auto || looping) run(); }
    }).observe(hero);
  }

  measure();
  paint();
  addEventListener('resize', measure);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
})();