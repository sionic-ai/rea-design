// Home page — circle bead flow (smaller toward the center), service row interaction
(() => {
  if (!window.gsap) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Bead flow — beads flow left at even intervals, and grow larger the farther they are from screen center (center 212px → edge 336px)
  const box = document.querySelector("[data-orbs]");
  if (box) {
    const row = box.querySelector(".dv-orbs__row");
    const orbs = [...row.children];
    orbs.forEach((o) => row.append(o.cloneNode(true)));
    const all = [...row.children];
    const gap = 270, speed = reduce ? 0 : 30;
    let off = 0, last = 0;
    const place = (now) => {
      const dt = last ? Math.max(1, now - last) : 16;
      last = now;
      off = (off + (speed * dt) / 1000) % (gap * all.length);
      const W = innerWidth, mid = W / 2, span = gap * all.length;
      all.forEach((o, i) => {
        let x = ((i * gap - off) % span + span) % span - gap;
        const d = Math.min(1, Math.abs(x - mid) / (W / 2));
        gsap.set(o, { x, scale: 1 + 0.585 * d * d });
      });
    };
    gsap.ticker.add(() => place(performance.now()));
    place(performance.now());
  }

  // Services: the hovered row darkens and the right photo swaps by overlapping
  const list = document.querySelector("[data-services]");
  if (list) {
    const items = [...list.querySelectorAll(".dv-service")];
    const pics = [...document.querySelectorAll(".dv-services__pics .ph")];
    const on = (i) => { items.forEach((x, k) => x.classList.toggle("is-on", k === i)); pics.forEach((p, k) => p.classList.toggle("is-on", k === i)); };
    items.forEach((it, i) => { it.addEventListener("pointerenter", () => on(i)); it.addEventListener("focus", () => on(i)); });
  }
})();
