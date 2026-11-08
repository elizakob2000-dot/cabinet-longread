/* Подсветка текущего раздела в верхней и боковой навигации. */
(function () {
  if (!('IntersectionObserver' in window)) return;
  var links = [].slice.call(document.querySelectorAll('.nav a, .side-nav a'));
  var ids = [];
  links.forEach(function (l) {
    var id = l.getAttribute('href').slice(1);
    if (ids.indexOf(id) < 0) ids.push(id);
  });

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      links.forEach(function (l) {
        var on = l.getAttribute('href') === '#' + e.target.id;
        l.classList.toggle('on', on);
        if (on) l.setAttribute('aria-current', 'location'); else l.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  ids.forEach(function (id) {
    var s = document.getElementById(id);
    if (s) io.observe(s);
  });
})();
