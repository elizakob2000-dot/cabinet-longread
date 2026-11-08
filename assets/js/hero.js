/* Первый экран: считает, куда каждой «вещи» схлопываться (к плашке), и запускает анимацию.
   Без этого скрипта и при «меньше движения» остаётся итоговое состояние. */
(function () {
  var hero = document.getElementById('top');
  if (!hero) return;
  var badge = hero.querySelector('.hero__badge');
  var things = [].slice.call(hero.querySelectorAll('.thing'));

  function measure() {
    var b = badge.getBoundingClientRect();
    var bx = b.left + b.width / 2, by = b.top + b.height / 2;
    things.forEach(function (t) {
      var r = t.getBoundingClientRect();
      t.style.setProperty('--dx', (bx - (r.left + r.width / 2)) + 'px');
      t.style.setProperty('--dy', (by - (r.top + r.height / 2)) + 'px');
    });
  }

  function start() {
    hero.classList.remove('play');
    measure();
    void hero.offsetWidth;
    hero.classList.add('play');
  }

  window.heroReplay = start;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  start();
  addEventListener('resize', measure);
})();