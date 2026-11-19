// About — timeline strip (original s-timeline). While on screen it advances to the next cell every 3 seconds (looping back to the first at the end), and it pauses when the pointer is on the strip or arrows.
// 29-bar scale per cell — each time it moves width/28 of the cell away from the screen center (or the cell center if hovered), the bars drop to 0·16·34·50,
// In the cell holding the center, the center ±4 bars turn white and the year name lights up
(() => {
  const cards = document.querySelector("[data-tcards]");
  if (!cards) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Endless strip (original infinite) — attach one more copy of the cell set, and when it moves onto the attached copy, once the move ends it secretly returns to the same-shaped original cell position
  const own = [...cards.querySelectorAll("[data-titem]")], n0 = own.length;
  own.forEach((it) => { const c = it.cloneNode(true); c.setAttribute("aria-hidden", "true"); c.querySelectorAll("button").forEach((b) => b.setAttribute("tabindex", "-1")); cards.appendChild(c); });
  const items = [...cards.children];
  const N = 29, MID = Math.floor(N / 2), WHITE = 4;
  const segs = items.map((it) => {
    const svg = it.querySelector(".tseg__grid"), year = it.querySelector(".tseg__year");
    const bars = Array.from({ length: N }, () => svg.appendChild(document.createElementNS("http://www.w3.org/2000/svg", "path")));
    return { it, svg, year, bars };
  });
  let at = 0, hovered = -1;
  const level = (u, left, c, w) => { const b = Math.abs(left + (u / (N - 1)) * w - c) / (w / (N - 1)); return b < 0.5 ? 0 : b < 1.5 ? 16 : b < 2.5 ? 34 : 50; };
  const draw = () => {
    const s = innerWidth / 2;
    segs.forEach(({ svg, year, bars }, i) => {
      const r = svg.getBoundingClientRect();
      if (r.right < 0 || r.left > innerWidth || r.bottom < 0 || r.top > innerHeight) return;
      const on = hovered === i || (s >= r.left && s <= r.right), c = on ? r.left + r.width / 2 : s;
      bars.forEach((p, u) => {
        const d = `M ${((u / (N - 1)) * 100).toFixed(3)} ${level(u, r.left, c, r.width)} V 100`;
        if (p.getAttribute("d") !== d) p.setAttribute("d", d);
        p.classList.toggle("is-center", u === MID);
        p.classList.toggle("is-white", on && Math.abs(u - MID) <= WHITE);
      });
      year.classList.toggle("is-center", on);
    });
  };
  const place = (i, still) => {
    if (still) { cards.style.transition = "none"; cards.style.transform = `translateX(${-i * items[0].offsetWidth}px)`; void cards.offsetWidth; cards.style.transition = ""; }
    else cards.style.transform = `translateX(${-i * items[0].offsetWidth}px)`;
  };
  const go = (n) => {
    if (n === at) return;
    if (n < 0) { place(n0, true); n = n0 - 1; }
    at = n;
    place(at, false);
    if (at >= n0) cards.addEventListener("transitionend", () => { at -= n0; place(at, true); }, { once: true });
  };
  let timer = null, seen = false, held = false;
  const arm = () => { clearInterval(timer); if (!reduce && seen && !held) timer = setInterval(() => go(at + 1), 3000); };
  const nudge = (n) => { go(n); arm(); };
  document.querySelector("[data-tl-prev]")?.addEventListener("click", () => nudge(at - 1));
  document.querySelector("[data-tl-next]")?.addEventListener("click", () => nudge(at + 1));
  items.forEach((it, i) => {
    it.addEventListener("pointerenter", () => { hovered = i; });
    it.addEventListener("pointerleave", () => { if (hovered === i) hovered = -1; });
    it.addEventListener("click", () => nudge(i));
  });
  for (const zone of [cards.parentElement, document.querySelector(".tline__ctrl")]) {
    zone?.addEventListener("pointerenter", () => { held = true; arm(); });
    zone?.addEventListener("pointerleave", () => { held = false; arm(); });
  }
  const section = cards.closest("section") || cards;
  new IntersectionObserver(([e]) => {
    seen = e.isIntersecting; arm();
    if (seen) gsap.ticker.add(draw); else gsap.ticker.remove(draw);
  }).observe(section);
  draw();
})();
