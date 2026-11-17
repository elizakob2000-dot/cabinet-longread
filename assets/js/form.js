/* Форма заявки: пусто, ошибка, успех. Заявка уходит на сервис приёма заявок (адрес в config.js).
   Получилось: окно «Заявка отправлена». Не получилось: окно с контактами для прямой связи. */
(function () {
  var form = document.getElementById('applyForm');
  if (!form) return;
  var M = window.Memory || { get: function () {}, set: function () {} };
  var contact = document.getElementById('f-contact');
  var field = contact.closest('.field');
  var comment = document.getElementById('f-comment');
  var sendBtn = form.querySelector('button[type="submit"]');
  var dlgOk = document.getElementById('applyOk');
  var dlgFail = document.getElementById('applyFail');

  /* пришли со страницы «Внедрение» с выбранным вариантом: подставляем его в комментарий */
  try {
    var variants = { pilot: 'Пилот на одном проекте', all: 'Кабинеты для всех клиентов' };
    var chosen = new URLSearchParams(location.search).get('variant') || M.get('variant');
    if (variants[chosen] && comment && !comment.value) comment.value = 'Интересует вариант: ' + variants[chosen];
  } catch (e) {}

  function payload() {
    var v = function (id) { return document.getElementById(id).value.trim(); };
    return { name: v('f-name'), agency: v('f-agency'), contact: v('f-contact'), comment: v('f-comment'), _subject: 'Заявка на пилот личного кабинета' };
  }

  /* отправка: промис «получилось» или «нет» */
  function send(data) {
    var url = (window.SITE_CONFIG || {}).formEndpoint;
    if (!url) return Promise.reject(new Error('адрес формы не задан'));
    return fetch(url, { method: 'POST', headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      .then(function (r) { if (!r.ok) throw new Error('ответ ' + r.status); });
  }

  function open(dlg) {
    if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
  }
  [dlgOk, dlgFail].forEach(function (d) {
    d.addEventListener('click', function (e) {
      if (e.target.closest('[data-close]')) { d.close(); if (d === dlgFail) contact.focus(); }
    });
  });

  contact.addEventListener('input', function () { field.removeAttribute('data-error'); contact.removeAttribute('aria-invalid'); });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (contact.value.trim().length < 3) {
      field.setAttribute('data-error', '');
      contact.setAttribute('aria-invalid', 'true');
      contact.focus();
      return;
    }
    var label = sendBtn.textContent;
    sendBtn.disabled = true; sendBtn.textContent = 'Отправляем…';
    send(payload()).then(function () {
      M.set('applied', true);
      form.reset();
      open(dlgOk);
    }, function () {
      open(dlgFail);
    }).then(function () {
      sendBtn.disabled = false; sendBtn.textContent = label;
    });
  });
})();