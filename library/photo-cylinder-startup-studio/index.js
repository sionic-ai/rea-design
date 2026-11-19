// Home stage — the photo cylinder is rotated by the part (photo-cylinder-world), here the open value and time that the part reports every frame drive the stage
// Center intro (rises from 14px below during open .45→.85) · ‹Book a call› button (turns on .5s after 1.2s, moves from screen center to below the intro as it opens) ·
// Sets up the work logo cylinder band (radius 1600, 45px per second, .1x on hover, drag inertia) · guide pill · nav state · the button that drops into the bottom pill.
(() => {
  const root = document.querySelector("[data-world]");
  if (!root) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hero = root.querySelector(".bk-hero");
  const stage = root.querySelector(".bk-stage");
  const center = root.querySelector(".bk-center");
  const book = root.querySelector(".bk-book");
  const casesBox = root.querySelector(".bk-cases");
  const cases = [...casesBox.querySelectorAll(".bk-case")];
  const hint = root.querySelector(".bk-hint");
  const nav = document.querySelector(".bk-nav");
  const float = document.querySelector(".bk-float");
  const pauseBtn = document.querySelector(".bk-pause");
  let paused = false;
  const still = () => reduce || paused;

  pauseBtn?.addEventListener("click", () => {
    paused = !paused;
    pauseBtn.dataset.paused = paused ? "1" : "";
    pauseBtn.querySelector(".bk-pause-t").textContent = paused ? "Play motion" : "Pause motion";
    stage.dispatchEvent(new Event(paused ? "fx:pause" : "fx:play"));
  });

  let caseX = 0, caseV = 0, caseHover = 1, overCases = false, caseDrag = false, caseDist = 0, caseLast = 0, caseInit = false, focusCase = false;
  casesBox.addEventListener("pointerenter", () => (overCases = true));
  casesBox.addEventListener("pointerleave", () => { overCases = false; caseDrag = false; });
  casesBox.addEventListener("pointerdown", (e) => { caseDrag = true; caseDist = 0; caseLast = e.clientX; });
  casesBox.addEventListener("pointermove", (e) => {
    if (!caseDrag) return;
    const d = e.clientX - caseLast;
    caseLast = e.clientX;
    caseDist += Math.abs(d);
    if (caseDist > 6 && !casesBox.hasPointerCapture(e.pointerId)) try { casesBox.setPointerCapture(e.pointerId); } catch {}
    caseX += d;
    caseV = d * 60;
  });
  const caseUp = () => (caseDrag = false);
  casesBox.addEventListener("pointerup", caseUp);
  casesBox.addEventListener("pointercancel", caseUp);
  casesBox.addEventListener("focusin", (e) => {
    focusCase = true;
    caseV = 0;
    const i = cases.indexOf(e.target.closest(".bk-case"));
    if (i < 0) return;
    const w = cases[0]?.offsetWidth || 219, rad = innerWidth < 760 ? 900 : 1600, step = (w + 8) / rad;
    caseX = rad * ((cases.length * step) / 2 - i * step);
  });
  casesBox.addEventListener("focusout", (e) => { if (!casesBox.contains(e.relatedTarget)) focusCase = false; });
  cases.forEach((c) => c.addEventListener("click", (e) => { if (caseDist > 6) e.preventDefault(); }));

  let centerH = 0, bookH = 56, bookW = 168, stageH = innerHeight;
  const measure = () => {
    centerH = center.offsetHeight;
    bookH = book.offsetHeight || 56;
    bookW = book.offsetWidth || 168;
    stageH = stage.offsetHeight || innerHeight;
    if (float) { float.style.width = `${bookW}px`; float.style.height = `${bookH}px`; }
  };
  measure();
  document.fonts?.ready.then(measure).catch(() => {});
  addEventListener("resize", () => { caseInit = false; measure(); });

  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const smooth = (v) => v * v * (3 - 2 * v);

  // Button ↔ bottom pill: after passing the whole stage the button drops into the pill spot, squashes and bounces (.72s), and returns in .32s when scrolled back up
  let floated = false, flight = null;
  function fly(on) {
    if (!float) return;
    flight?.cancel();
    flight = null;
    const from = book.getBoundingClientRect();
    if (on) {
      book.style.visibility = "hidden";
      float.classList.add("on");
      if (reduce) return;
      const to = float.getBoundingClientRect();
      flight = float.animate([
        { transform: `translate(${from.left - to.left}px, ${from.top - to.top}px)`, easing: "cubic-bezier(.55,0,.9,.45)" },
        { transform: "translate(0, 0) scale(.94, 1.1)", offset: 0.62, easing: "cubic-bezier(.2,.8,.2,1)" },
        { transform: "translate(0, 3px) scale(1.16, .8)", offset: 0.74, easing: "cubic-bezier(.3,0,.3,1)" },
        { transform: "translate(0, -4px) scale(.95, 1.06)", offset: 0.87, easing: "cubic-bezier(.3,0,.3,1)" },
        { transform: "none" },
      ], { duration: 720 });
    } else {
      const to = float.getBoundingClientRect();
      const done = () => { float.classList.remove("on"); book.style.visibility = ""; flight = null; };
      if (reduce) return done();
      flight = float.animate([{ transform: "none" }, { transform: `translate(${from.left - to.left}px, ${from.top - to.top}px)` }], { duration: 320, easing: "cubic-bezier(.4,0,.2,1)" });
      flight.onfinish = done;
    }
  }

  let last = performance.now(), navState = "";
  stage.addEventListener("fx:world", (e) => {
    const { open: G, time: t } = e.detail;
    const now = performance.now(), dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
    last = now;
    const vw = innerWidth, vh = innerHeight;
    const hr = hero.getBoundingClientRect();
    if (hr.top > -hero.offsetHeight) {
      const rise = 1 - (1 - clamp((G - 0.45) / 0.4)) ** 3;
      center.style.opacity = rise.toFixed(3);
      center.style.transform = `translate(-50%, calc(-50% + ${((1 - rise) * 14).toFixed(1)}px))`;
      const yA = stageH / 2 - bookH / 2, yB = stageH / 2 - 90 + centerH / 2 + 36;
      book.style.opacity = clamp((t - 1.2) / 0.5).toFixed(3);
      book.style.transform = `translate(-50%, ${(yA + (yB - yA) * smooth(G)).toFixed(1)}px)`;
      casesBox.style.opacity = rise.toFixed(3);
      casesBox.style.transform = `translateY(${((1 - rise) * 16).toFixed(1)}px)`;
      casesBox.style.pointerEvents = rise > 0.5 ? "auto" : "none";
      if ((rise > 0.5) === casesBox.inert) casesBox.inert = rise <= 0.5;
      hint.style.opacity = t > 1.8 && G < 0.04 ? "1" : "0";
      if (rise > 0) {
        caseHover += ((overCases ? 0.1 : 1) - caseHover) * (1 - 0.001 ** dt);
        if (!caseDrag) { caseV *= 0.03 ** dt; caseX += ((still() || focusCase ? 0 : -45) * caseHover + caseV) * dt; }
        const w = cases[0]?.offsetWidth || 219, rad = vw < 760 ? 900 : 1600, step = (w + 8) / rad, total = cases.length * step;
        if (!caseInit) { caseInit = true; caseX = rad * (total / 2 - Math.asin(Math.min(0.99, (vw / 2 - w / 2 - 16) / rad))); }
        for (let i = 0; i < cases.length; i++) {
          const a = (((i * step + caseX / rad) % total) + total) % total - total / 2;
          const vis = Math.abs(rad * Math.sin(a)) < vw / 2 + w && Math.abs(a) < 1.2;
          cases[i].style.visibility = vis ? "visible" : "hidden";
          if (vis) cases[i].style.transform = `translate3d(${(vw / 2 - w / 2 + rad * Math.sin(a)).toFixed(1)}px,0,${(rad * (1 - Math.cos(a))).toFixed(1)}px) rotateY(${((-a * 180) / Math.PI).toFixed(2)}deg)`;
        }
      }
    }
    const state = hr.bottom < vh * 0.5 ? "stuck" : scrollY < 8 ? "top" : "away";
    if (state !== navState && nav) nav.dataset.state = navState = state;
    if (float && t > 1.7) {
      const on = floated ? hr.bottom < vh + 8 : hr.bottom < vh - 8;
      if (on !== floated) { floated = on; fly(on); pauseBtn?.classList.toggle("gone", on); }
    }
  });
})();
