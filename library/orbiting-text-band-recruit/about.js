(() => {
  // Timeline: while the section sticks to the screen, the strip is pushed horizontally by the amount scrolled vertically. Items within 10px of the right edge turn on
  const box = document.querySelector(".ns-history");
  const body = box.querySelector(".ns-history__body");
  const lane = box.querySelector(".ns-history__lane");
  const items = lane.querySelectorAll(".ns-history__item");
  const height = () => box.style.setProperty("--sticky-h", `${lane.scrollWidth - lane.clientWidth + body.clientHeight}px`);
  height();
  new ResizeObserver(height).observe(lane);
  new ResizeObserver(height).observe(body);
  const check = () => {
    const edge = lane.scrollLeft + lane.clientWidth - 10;
    items.forEach((it, i) => { if (i && !it.classList.contains("is-inview") && it.offsetLeft <= edge) it.classList.add("is-inview"); });
  };
  const sync = () => {
    const r = box.getBoundingClientRect();
    if (scrollY > 0) items[0].classList.add("is-inview");
    if (r.top <= 0 && r.bottom >= innerHeight) lane.scrollLeft = scrollY - (r.top + scrollY);
    else if (r.bottom < innerHeight) lane.scrollLeft = lane.scrollWidth - lane.clientWidth;
    else lane.scrollLeft = 0;
    check();
  };
  let on = false;
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting && !on) { on = true; addEventListener("scroll", sync, { passive: true }); sync(); }
    else if (!e.isIntersecting && on) { on = false; removeEventListener("scroll", sync); }
  }).observe(box);
})();
