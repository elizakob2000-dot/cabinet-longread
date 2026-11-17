/* На узком экране меню можно листать вбок: текущий раздел сразу показываем. */
(function () {
  var nav = document.querySelector('.nav');
  var cur = nav && nav.querySelector('.on');
  if (!cur) return;
  nav.scrollLeft = Math.max(0, cur.offsetLeft - (nav.clientWidth - cur.offsetWidth) / 2);
})();
/* «Этапы реализации» в меню показывает этапы, даже если страницу открыли с главной */
(function () {
  var root = document.documentElement;
  if (location.hash === '#approach') root.classList.remove('from-home');
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href$="#approach"]');
    if (a) root.classList.remove('from-home');
  });
})();