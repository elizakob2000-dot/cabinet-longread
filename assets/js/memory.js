/* Память пути: что посетитель уже видел и сделал. Живёт в браузере до закрытия вкладки, никуда не отправляется.
   Нужна для запоминания выбранного варианта внедрения и утверждённых макетов в прототипе. */
(function () {
  var KEY = 'lk_path';
  var ORDER = ['prototype', 'rollout', 'apply'];
  var NAMES = { prototype: 'Прототип', rollout: 'Внедрение', apply: 'Заявка' };
  var store = { pages: {}, blocks: {}, data: {} };

  try {
    var raw = sessionStorage.getItem(KEY);
    if (raw) {
      var o = JSON.parse(raw);
      if (o && typeof o === 'object') { store.pages = o.pages || {}; store.blocks = o.blocks || {}; store.data = o.data || {}; }
    }
  } catch (e) {}
  function save() { try { sessionStorage.setItem(KEY, JSON.stringify(store)); } catch (e) {} }

  var file = (location.pathname.split('/').pop() || 'index.html').replace(/\.html$/, '') || 'index';
  store.pages[file] = 1;
  save();

  var M = window.Memory = {
    page: file,
    order: ORDER,
    names: NAMES,
    seenPage: function (n) { return !!store.pages[n]; },
    get: function (k) { return store.data[k]; },
    set: function (k, v) { if (v === null || v === undefined) delete store.data[k]; else store.data[k] = v; save(); },
    reset: function () { store = { pages: {}, blocks: {}, data: {} }; try { sessionStorage.removeItem(KEY); } catch (e) {} }
  };

  /* выбранный вариант внедрения запоминаем по клику на кнопку */
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href*="variant="]');
    var m = a && /variant=([a-z]+)/.exec(a.getAttribute('href'));
    if (m) M.set('variant', m[1]);
    var r = e.target.closest && e.target.closest('[data-reset]');
    if (r) { M.reset(); location.href = 'index.html'; }
  });
})();