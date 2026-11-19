(() => {
  // Ring — ten photos stand upright every 36° around the circumference and drift at 4° per second. When dragged it spins at the speed of the hand, then slowly stops with a weight of 8 and drifts again.
  // The painting order is fixed only once at the start — so cards don’t jump back and forth when looping (as in the original)
  const { reduce } = window.CO;
  const root = document.querySelector(".rg"), stage = document.querySelector(".rg-stage"), ring = document.querySelector(".rg-ring"), grid = document.querySelector(".rg-grid");
  const items = [...ring.querySelectorAll(".rg-item")];
  const num = document.querySelector(".rg-num"), name = document.querySelector(".rg-name");
  const N = items.length, step = 360 / N, drift = 4, weight = 8;
  let angle = 0, vel = 0, drag = null, last = 0, cur = -1;
  items.forEach((it, i) => (it.style.zIndex = String(100 + i * 50)));
  const radius = () => 180 * Math.min(1.2, Math.max(0.55, Math.min(stage.clientWidth / 1440, stage.clientHeight / 900) * 1.0));
  const place = () => {
    if (root.dataset.view !== "ring") return;
    const r = radius(), w = items[0].offsetWidth, h = items[0].offsetHeight;
    items.forEach((it, i) => {
      const a = ((i * step + angle - 90) * Math.PI) / 180;
      const z = Math.sin(a) * r * 0.9;
      it.style.transform = `translate3d(${Math.cos(a) * r - w / 2}px, ${Math.sin(a) * r - h / 2}px, ${z}px) rotate(${Math.cos(a) * 9}deg)`;
    });
    // The section closest to the top (12 o’clock) is the current section
    const k = ((Math.round(-angle / step) % N) + N) % N;
    if (k !== cur) {
      cur = k;
      if (num) num.textContent = String(k + 1).padStart(2, "0");
      if (name) name.textContent = items[k].dataset.name;
    }
  };
  const tick = (t) => {
    const dt = Math.min(0.05, Math.max(0.001, (t - (last || t)) / 1000));
    last = t;
    if (!drag) {
      vel += (drift - vel) * Math.min(1, dt * (8 / weight) * 2);
      angle += vel * dt;
    }
    place();
    requestAnimationFrame(tick);
  };
  stage.addEventListener("pointerdown", (e) => {
    if (root.dataset.view !== "ring") return;
    drag = { x: e.clientX, a: angle, t: performance.now(), lx: e.clientX };
    stage.setPointerCapture(e.pointerId);
    stage.classList.add("is-dragging");
  });
  stage.addEventListener("pointermove", (e) => {
    if (!drag) return;
    const now = performance.now();
    angle = drag.a + (e.clientX - drag.x) * 0.25;
    vel = ((e.clientX - drag.lx) * 0.25) / Math.max(0.008, (now - drag.t) / 1000);
    drag.t = now; drag.lx = e.clientX;
  });
  const up = () => { drag = null; stage.classList.remove("is-dragging"); };
  stage.addEventListener("pointerup", up);
  stage.addEventListener("pointercancel", up);

  // View switch — the same cards hop from ring positions to grid cells (or the reverse) over 1.3s back.inOut(2.2), .02s apart
  const buttons = [...document.querySelectorAll(".rg-views button")];
  const setView = (v) => {
    if (root.dataset.view === v) return;
    buttons.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.view === v)));
    const state = window.Flip ? Flip.getState(items) : null;
    root.dataset.view = v;
    if (v === "grid") { items.forEach((it) => { it.style.transform = ""; grid.append(it); }); grid.setAttribute("aria-hidden", "false"); }
    else { items.forEach((it) => ring.append(it)); grid.setAttribute("aria-hidden", "true"); place(); }
    if (state && !reduce) Flip.from(state, { duration: 1.3, ease: "back.inOut(2.2)", stagger: 0.02, absolute: true });
  };
  buttons.forEach((b) => b.addEventListener("click", () => setView(b.dataset.view)));
  if (window.Flip) gsap.registerPlugin(Flip);
  // Open and close info panel
  const toggle = document.querySelector(".labd__toggle");
  toggle.addEventListener("click", () => {
    const on = !root.classList.contains("is-docs");
    root.classList.toggle("is-docs", on);
    toggle.setAttribute("aria-expanded", String(on));
  });
  addEventListener("resize", place);
  place();
  if (!reduce) requestAnimationFrame(tick);
})();
