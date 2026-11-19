(() => {
  const { reduce } = window.CO;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const wide = matchMedia("(min-width: 1024px)");

  // Year record grid — 26×7 cells, placeholder intensity (0–4) shown as the darkness of the skin text color
  const commits = $(".ab-commits");
  for (let i = 0; i < 26 * 7; i++) {
    const c = document.createElement("i");
    c.style.opacity = String([0.08, 0.2, 0.4, 0.65, 1][Math.floor(Math.random() ** 1.6 * 5)]);
    commits.append(c);
  }

  // Record — a disc with home grooves spins at 33⅓ rpm (1.8s per turn)
  const vinyl = $(".ab-vinyl canvas");
  const g = vinyl.getContext("2d");
  const paintVinyl = () => {
    const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
    g.clearRect(0, 0, 360, 360);
    g.fillStyle = css("--kf-contrast-ink");
    g.beginPath(); g.arc(180, 180, 176, 0, Math.PI * 2); g.fill();
    g.strokeStyle = css("--kf-dim");
    g.globalAlpha = 0.35;
    for (let r = 70; r < 172; r += 3) { g.beginPath(); g.arc(180, 180, r, 0, Math.PI * 2); g.lineWidth = 0.6; g.stroke(); }
    g.globalAlpha = 1;
    g.fillStyle = css("--kf-ink-soft");
    g.beginPath(); g.arc(180, 180, 58, 0, Math.PI * 2); g.fill();
    g.fillStyle = css("--kf-contrast-bg");
    g.fillRect(150, 172, 60, 4);
    g.beginPath(); g.arc(180, 180, 5, 0, Math.PI * 2); g.fill();
  };
  paintVinyl();
  addEventListener("co:theme", paintVinyl);
  if (!reduce) gsap.to(vinyl, { rotation: 360, duration: 1.8, ease: "none", repeat: -1 });

  // Board — original values (board PARAMS): hovered card 1.012x, others .985x (.9s power3.out, others 1.2x longer, in a wave .1s apart),
  // Grabbing scales to 1.02x, pressing scales to min(1.3, 70% of the screen)x and comes to center in .8s expo.out, while the others shrink to .965x, get pushed away 220px and blur
  const P = { hover: 1.012, yield: 0.985, breathe: 0.9, ripple: 0.1, lift: 1.02, focus: 0.8, fill: 0.7, grow: 1.3, recede: 0.965, spread: 220 };
  const items = $$(".ab-item"), exit = $(".ab-exit");
  let active = null;
  const d = (v) => (reduce ? 0 : v);
  const focus = (it) => {
    active = it;
    items.forEach((x) => { x.classList.toggle("is-dim", !!it && x !== it); x.classList.toggle("is-active", x === it); });
    exit.hidden = !it;
    $(".ab").classList.toggle("is-focused", !!it);
    if (!it) { items.forEach((x) => gsap.to(x, { scale: 1, x: x._x || 0, y: x._y || 0, duration: d(P.focus), ease: "expo.out" })); return; }
    const r = it.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    items.forEach((x) => { x._x = gsap.getProperty(x, "x"); x._y = gsap.getProperty(x, "y"); });
    const grow = Math.min(P.grow, (innerWidth * P.fill) / r.width, (innerHeight * P.fill) / r.height);
    gsap.to(it, { x: `+=${innerWidth / 2 - cx}`, y: `+=${innerHeight / 2 - cy}`, scale: grow, rotation: 0, duration: d(P.focus), ease: "expo.out" });
    items.forEach((x) => {
      if (x === it) return;
      const q = x.getBoundingClientRect(), vx = q.left + q.width / 2 - cx, vy = q.top + q.height / 2 - cy, len = Math.hypot(vx, vy) || 1;
      gsap.to(x, { x: `+=${(vx / len) * P.spread}`, y: `+=${(vy / len) * P.spread}`, scale: P.recede, duration: d(P.focus), ease: "expo.out" });
    });
  };
  items.forEach((it, i) => {
    it.addEventListener("pointerenter", () => {
      if (active || !wide.matches) return;
      gsap.to(it, { scale: P.hover, duration: d(P.breathe), ease: "power3.out", overwrite: "auto" });
      items.filter((x) => x !== it).forEach((x, k) => gsap.to(x, { scale: P.yield, duration: d(P.breathe * 1.2), delay: d(k * P.ripple), ease: "power3.out", overwrite: "auto" }));
    });
    it.addEventListener("pointerleave", () => {
      if (active || !wide.matches) return;
      items.forEach((x) => gsap.to(x, { scale: 1, duration: d(P.breathe), ease: "power3.out", overwrite: "auto" }));
    });
  });
  let drags = [];
  const mount = () => {
    drags.forEach((dr) => dr.kill());
    drags = [];
    if (!wide.matches || !window.Draggable) return;
    drags = items.map((it) => Draggable.create(it, {
      type: "x,y", bounds: ".ab-board", zIndexBoost: true, minimumMovement: 4,
      onPress() { if (active) return; it.classList.add("is-held"); gsap.to(it, { scale: P.lift, duration: d(P.breathe), ease: "power3.out", overwrite: "auto" }); },
      onRelease() { it.classList.remove("is-held"); },
      onClick() { if (active !== it) focus(it); },
    })[0]);
  };
  gsap.registerPlugin(Draggable);
  mount();
  wide.addEventListener("change", mount);
  exit.addEventListener("click", () => focus(null));
  addEventListener("keydown", (e) => { if (e.key === "Escape" && active) focus(null); });

  // Stamp button — pressing it makes the record card pop out of the button’s spot at .3x and settle in .4s (press again to fold)
  const record = $(".ab-record");
  let openBtn = null;
  $$(".ab-imprint").forEach((b) => b.addEventListener("click", (e) => {
    e.stopPropagation();
    const on = openBtn !== b;
    $$(".ab-imprint").forEach((x) => x.setAttribute("aria-expanded", String(on && x === b)));
    openBtn = on ? b : null;
    if (on) gsap.fromTo(record, { autoAlpha: 0, scale: 0.3, x: 30, y: -30 }, { autoAlpha: 1, scale: 1, x: 0, y: 0, duration: reduce ? 0 : 0.4, ease: "expo.out" });
    else gsap.to(record, { autoAlpha: 0, scale: 0.3, x: 30, y: -30, duration: reduce ? 0 : 0.35, ease: "power3.in" });
  }));

  // Letter — pressing the postcard button opens a dialog
  const letter = $(".ab-letter");
  $("[data-letter]").addEventListener("click", (e) => { e.stopPropagation(); letter.showModal(); });
  letter.querySelector("[data-close]").addEventListener("click", () => letter.close());
})();
