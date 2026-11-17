/* Демо кабинета клиента: проекты, этапы, материалы и утверждение макетов. Есть пустое состояние и успех. */
(function () {
  var root = document.getElementById('demo');
  if (!root) return;
  var M = window.Memory || { get: function () {}, set: function () {} };
  var main = document.getElementById('demoMain');
  var head = document.getElementById('demoProject');
  var status = document.getElementById('demoStatus');
  var stages = ['Бриф', 'Концепция', 'Дизайн', 'Согласование', 'Запуск'];
  var data;
  function fresh() {
    data = {
      campaign: { name: 'Рекламная кампания', done: 3, tiles: 3, docs: ['Договор', 'Смета'], approval: true, approved: false },
      brand: { name: 'Сайт для бренда', done: 1, tiles: 2, docs: ['Договор'], approval: false },
      rebrand: { name: 'Ребрендинг', empty: true }
    };
    /* макеты уже утверждали: так и оставляем, пока человек сам не сбросит демо */
    if (M.get('approved')) { data.campaign.approved = true; data.campaign.done = 4; }
  }
  var current = 'campaign';
  fresh();

  function render() {
    var p = data[current];
    head.textContent = p.name;
    [].forEach.call(root.querySelectorAll('[data-p]'), function (b) { b.setAttribute('aria-current', b.dataset.p === current ? 'true' : 'false'); });
    if (p.empty) {
      main.innerHTML = '<div class="zone"><b>Материалы проекта</b><p class="empty">Здесь появятся материалы проекта</p><div class="actions"><button type="button" class="btn btn--line" data-example>Показать пример проекта</button></div></div>';
      return;
    }
    var st = stages.map(function (s, i) { return '<li' + (i < p.done ? ' class="done"' : '') + '>' + s + '</li>'; }).join('');
    var tiles = new Array(p.tiles + 1).join('<i></i>');
    var docs = p.docs.map(function (d) { return '<li>' + d + '</li>'; }).join('');
    var approval = !p.approval
      ? '<p class="empty">Пока ничего не ждёт утверждения</p>'
      : (p.approved
        ? '<p class="ok-line"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>Макеты утверждены</p>'
        : '<button type="button" class="btn" data-approve>Утвердить макеты</button>');
    main.innerHTML =
      '<div class="zone"><b>Этапы работ</b><ol class="stages">' + st + '</ol></div>' +
      '<div class="zone"><b>Материалы</b><div class="tiles">' + tiles + '</div></div>' +
      '<div class="zone"><b>Документы</b><ul class="docs">' + docs + '</ul></div>' +
      '<div class="zone"><b>На утверждении</b>' + approval + '</div>';
  }

  root.addEventListener('click', function (e) {
    var t = e.target.closest('button');
    if (!t) return;
    if (t.dataset.p) { current = t.dataset.p; status.textContent = ''; render(); }
    else if (t.hasAttribute('data-example')) { current = 'campaign'; status.textContent = 'Показан пример проекта'; render(); }
    else if (t.hasAttribute('data-approve')) {
      data.campaign.approved = true; data.campaign.done = 4; M.set('approved', true);
      status.textContent = 'Макеты утверждены, этап «Согласование» пройден';
      render();
      var okLine = main.querySelector('.ok-line'); if (okLine) { okLine.setAttribute('tabindex', '-1'); okLine.focus(); }
    }
  });
  document.getElementById('demoReset').addEventListener('click', function () { M.set('approved', null); fresh(); current = 'campaign'; status.textContent = 'Демо сброшено'; render(); });
  render();
})();