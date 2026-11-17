/* Дорожная карта: узлы и линии загораются по очереди, когда блок виден. Без JS всё уже горит. */
(function () {
  var road = document.getElementById('road');
  if (!road) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) { road.classList.add('in'); return; }
  var io = new IntersectionObserver(function (e) {
    if (!e[0].isIntersecting) return;
    io.disconnect();
    road.classList.add('in');
  }, { threshold: 0.5 });
  io.observe(road);
})();