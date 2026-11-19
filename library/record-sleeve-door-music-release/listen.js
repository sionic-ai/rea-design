// Listen — a white disc spins at 33⅓rpm (one turn per 1.8s), follows the drag as if scratched by hand, and returns to its own speed on release.
// Switching side A · B flips the panel on the Y axis in .72s. Picking a track changes the on indicator (lime green) · description, and the play line has a time line flowing over the waveform.
(() => {
  const A = (window.PG ||= {});
  const disc = A.q("[data-disc]"), spin = A.q("[data-spin]");
  if (!disc) return;
  const TURN = 1.8, DPS = 360 / TURN;
  let angle = 0, speed = 0, target = 0, drag = null, side = "A", track = 0, pos = 0;
  const LEN = [181, 190, 199, 165];
  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  const bars = A.qa("[data-wave] span"), head = A.q("[data-head]"), clock = A.q("[data-clock]"), seek = A.q("[data-seek]");
  const playBtn = A.q("[data-play]");
  const setPlaying = (on) => { target = on ? DPS : 0; playBtn?.setAttribute("aria-pressed", String(on)); };
  const draw = () => {
    const p = pos / LEN[track];
    head.style.left = `${(p * 100).toFixed(2)}%`;
    const k = Math.floor(p * bars.length);
    bars.forEach((b, i) => b.classList.toggle("is-past", i < k));
    clock.textContent = `${fmt(pos)}/${fmt(LEN[track])}`;
  };
  gsap.ticker.add((t, dt) => {
    const s = dt / 1000;
    if (!drag) { speed += (target - speed) * Math.min(1, s * 3); angle += speed * s; }
    if (A.reduce) angle = 0;
    spin.style.transform = `rotate(${angle.toFixed(2)}deg)`;
    if (target > 0) { pos = (pos + s) % LEN[track]; draw(); }
  });
  const pick = (i) => {
    track = i; pos = 0;
    A.qa("[data-track]").forEach((b, n) => b.classList.toggle("is-on", n === i));
    A.q("[data-now-name]").textContent = `Artist Name - Track Name ${A.qa("[data-track]")[i].querySelector("sup").textContent}`;
    const d = A.q("[data-desc]");
    gsap.fromTo(d, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: "expo.out" });
    const s = A.qa("[data-track]")[i].dataset.side;
    if (s !== side) flip(s);
    draw();
  };
  const flip = (s) => {
    side = s;
    A.qa("[data-side-btn]").forEach((b) => b.classList.toggle("is-on", b.dataset.sideBtn === s));
    gsap.to(disc, { rotateY: s === "A" ? 0 : 180, duration: A.reduce ? 0 : 0.72, ease: "expo.inOut" });
  };
  A.qa("[data-track]").forEach((b, i) => b.addEventListener("click", () => { pick(i); setPlaying(true); }));
  A.qa("[data-side-btn]").forEach((b) => b.addEventListener("click", () => flip(b.dataset.sideBtn)));
  playBtn?.addEventListener("click", () => setPlaying(target === 0));
  A.q("[data-prev]")?.addEventListener("click", () => pick((track + 3) % 4));
  A.q("[data-next]")?.addEventListener("click", () => pick((track + 1) % 4));
  seek?.addEventListener("click", (e) => { const r = seek.getBoundingClientRect(); pos = ((e.clientX - r.left) / r.width) * LEN[track]; draw(); });
  // Drag scratch — rotates around the board center by the cursor angle
  const ang = (e) => { const r = disc.getBoundingClientRect(); return (Math.atan2(e.clientY - r.top - r.height / 2, e.clientX - r.left - r.width / 2) * 180) / Math.PI; };
  disc.addEventListener("pointerdown", (e) => { drag = { a: ang(e), base: angle, t: performance.now() }; disc.setPointerCapture(e.pointerId); disc.style.cursor = "grabbing"; });
  disc.addEventListener("pointermove", (e) => { if (!drag) return; const a = ang(e), now = performance.now(); let d = a - drag.a; if (d > 180) d -= 360; if (d < -180) d += 360; angle += d; speed = (d / Math.max(1, now - drag.t)) * 1000; drag.a = a; drag.t = now; });
  const up = () => { drag = null; disc.style.cursor = ""; };
  disc.addEventListener("pointerup", up); disc.addEventListener("pointercancel", up);
  A.qa("[data-track]")[0].classList.add("is-on");
  draw();
  // The panel spins only when sound was turned on at the door — in the original too, sound turns on when the door is pressed, and a listening panel reached without turning it on stays still
  const start = () => sessionStorage.getItem("p-playing") === "1" && setPlaying(true);
  A.onEnter = start;
  if (document.documentElement.classList.contains("p-entered")) start();
})();
