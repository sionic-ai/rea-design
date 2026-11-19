(() => {
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const NS = "http://www.w3.org/2000/svg";
  // Scattered position per piece (before gathering): add [x, y, rotation] to the piece’s original position (viewBox units).
  const SCATTER = [[-21, 18, -130.6], [-2.6, -18, 0], [23.5, -47, 0], [12, 30, 40], [-30, -12, -25]];

  kfFx.register("piece-fill-gate", (el, { options, reduce }) => {
    const svg = el.querySelector('[data-fx-part="mark"]');
    const pieces = svg ? [...svg.querySelectorAll("[data-piece]")] : [];
    const choiceBox = el.querySelector('[data-fx-part="choices"]');
    const choices = choiceBox ? [...choiceBox.querySelectorAll("[data-choice]")] : [];
    if (!svg || !pieces.length || !window.gsap) return;
    const min = +(options.min ?? 1.4), toSel = options.to || "", fly = +(options.fly ?? 0.9), lag = +(options.lag ?? 0.7);
    // fill: spreads the fill evenly over this many seconds so it does not exceed the ready share (0 follows the ready share directly), hold: pause before the button rises after fully filled
    const fillDur = +(options.fill ?? 0), hold = +(options.hold ?? 0), show = +(options.show ?? 0);
    // gather: after it fills and rests, pieces gather for this many seconds before the button rises (0 means gather after choosing), stay: seconds the flown logo stays at the header line, out: seconds for the panel to vanish (0 hides immediately)
    const gather = +(options.gather ?? 0), stay = +(options.stay ?? 0), out = +(options.out ?? 0.3), flyEase = options["fly-ease"] || "0.65,0,0.25,1";
    const ease = kfFx.ease("0.65,0,0.25,1", "power2.inOut");
    const made = [];
    const parts = pieces.map((g, i) => {
      const box = g.getBBox();
      const id = `fx-pfg-${Math.random().toString(36).slice(2)}-${i}`;
      const clip = document.createElementNS(NS, "clipPath"); clip.id = id;
      const rect = document.createElementNS(NS, "rect");
      rect.setAttribute("x", box.x - 4); rect.setAttribute("width", box.width + 8);
      clip.appendChild(rect);
      let defs = svg.querySelector("defs"); if (!defs) { defs = document.createElementNS(NS, "defs"); svg.prepend(defs); made.push(defs); }
      defs.appendChild(clip); made.push(clip);
      const latent = g.cloneNode(true); latent.removeAttribute("data-piece"); latent.setAttribute("class", "fx-pfg-latent");
      g.parentNode.insertBefore(latent, g); made.push(latent);
      const solid = document.createElementNS(NS, "g"); solid.setAttribute("clip-path", `url(#${id})`);
      while (g.firstChild) solid.appendChild(g.firstChild);
      g.appendChild(solid);
      return { g, latent, solid, rect, box, scatter: SCATTER[i % SCATTER.length] };
    });

    const state = { p: 0, e: 0, settle: 0 };
    // Time is counted from the first painted frame — so the fill doesn’t slip by unseen when document ready arrives first while the font stylesheet is blocking paint
    let target = 0, t0 = null, raf = 0, ready = false, chosen = false, shown = false;
    const paint = (now) => {
      const t = (now - t0) / 1000;
      parts.forEach((pt, o) => {
        const s = clamp(state.p * pieces.length - o, 0, 1), l = 1 - s, k = 1 - state.e;
        const [sx, sy, sr] = pt.scatter;
        const cx = pt.box.x + pt.box.width / 2, cy = pt.box.y + pt.box.height / 2;
        const wob = reduce ? 0 : l * Math.sin(0.75 * t + 1.7 * o) * 1.2;
        const tr = `translate(${sx * k} ${sy * k + wob}) rotate(${sr * k} ${cx} ${cy})`;
        pt.g.setAttribute("transform", tr); pt.latent.setAttribute("transform", tr);
        pt.latent.setAttribute("opacity", String(0.055 * l * k));
        const h = (pt.box.height + 8) * s;
        pt.rect.setAttribute("height", h); pt.rect.setAttribute("y", cy - h / 2);
        pt.solid.setAttribute("transform", `translate(0 ${cy * (1 - (0.7 + 0.3 * s))}) scale(1 ${0.7 + 0.3 * s})`);
      });
    };
    const tick = (now) => {
      raf = requestAnimationFrame(tick);
      if (t0 == null) t0 = now;
      const since = (now - t0) / 1000 - (reduce ? 0 : show);
      if (!shown && since >= 0) { shown = true; el.classList.add("fx-pfg-on"); }
      const goal = since < 0 ? 0 : fillDur > 0 && !reduce ? Math.min(target, since / fillDur) : target;
      if (!chosen) state.p += (goal - state.p) * (reduce ? 1 : fillDur > 0 ? 0.25 : 0.06);
      if (!ready && state.p > 0.995) { ready = true; state.p = 1; holdTimer = setTimeout(showChoices, reduce ? 0 : hold * 1000); }
      paint(now);
    };
    // Loading shares — document ready · fonts · min seconds each fill one share
    const bump = (v) => { target = Math.max(target, v); };
    bump(0.08);
    if (document.readyState !== "loading") bump(0.4); else document.addEventListener("DOMContentLoaded", () => bump(0.4), { once: true });
    (document.fonts?.ready || Promise.resolve()).then(() => bump(0.66));
    const timer = setTimeout(() => bump(1), min * 1000);
    let holdTimer = 0;
    const showChoices = () => {
      if (gather > 0 && state.e < 1) { gsap.to(state, { e: 1, duration: reduce ? 0 : gather, ease, onComplete: showChoices }); return; }
      if (!choices.length) { choose(null); return; }
      choiceBox.style.visibility = "visible";
      gsap.fromTo(choices, { yPercent: 115 }, { yPercent: 0, duration: reduce ? 0 : 0.44, ease, stagger: 0.06 });
      el.dispatchEvent(new CustomEvent("fx:ready", { bubbles: true }));
    };
    const choose = (btn) => {
      if (chosen) return;
      chosen = true;
      const choice = btn?.dataset.choice || "";
      const to = toSel ? document.querySelector(toSel) : null;
      // If the header line is already hidden behind the door, leave it — as the door finishes, the page reveals the header line along with it
      const hideTo = !!to && getComputedStyle(to).visibility !== "hidden";
      el.dispatchEvent(new CustomEvent("fx:choose", { detail: { choice }, bubbles: true }));
      const tl = gsap.timeline({ onComplete: () => {
        el.dispatchEvent(new CustomEvent("fx:enter", { detail: { choice }, bubbles: true }));
        if (hideTo) to.style.visibility = "";
        const gone = () => el.dispatchEvent(new CustomEvent("fx:gone", { bubbles: true }));
        // When walking straight through, cut away and hide the panel and return the flying logo to its initial size (the end state after the original removes the entrance door) — leave position values alone, only size,
        // Moving it out with display loses the % placement values, and hiding with visibility turns every inner element to hidden
        if (reduce || out <= 0) { el.style.clipPath = "inset(50%)"; gsap.set(svg, { scale: 1 }); gone(); }
        else gsap.to(el, { autoAlpha: 0, duration: out, onComplete: gone });
      } });
      if (choices.length) tl.to(choices, { yPercent: 115, duration: reduce ? 0 : 0.36, ease, stagger: 0.04 }, 0);
      tl.to(state, { e: 1, duration: reduce ? 0 : 0.8, ease }, 0);
      if (to) {
        if (hideTo) to.style.visibility = "hidden";
        const a = svg.getBoundingClientRect(), b = to.getBoundingClientRect();
        // Size that fits inside the logo slot box — the smaller of the width and height ratios (the logo art stands in the box center at 2:1)
        const sc = Math.max(0.02, Math.min(b.width / a.width, b.height / a.height));
        const fe = kfFx.ease(flyEase, "power2.inOut");
        // Only shrink around a single point without moving so it lands in place — with the same curve as moving while shrinking, the path taken is the same too
        if (Math.abs(1 - sc) > 0.01) {
          const ox = (b.left + (b.width - a.width * sc) / 2 - a.left) / (1 - sc), oy = (b.top + (b.height - a.height * sc) / 2 - a.top) / (1 - sc);
          gsap.set(svg, { transformOrigin: `${ox}px ${oy}px` });
          tl.to(svg, { scale: sc, duration: reduce ? 0 : fly, ease: fe }, reduce ? 0 : lag);
        } else tl.to(svg, { x: b.left - a.left + (b.width - a.width) / 2, y: b.top - a.top + (b.height - a.height) / 2, duration: reduce ? 0 : fly, ease: fe }, reduce ? 0 : lag);
        if (stay > 0 && !reduce) tl.to({}, { duration: stay }, lag + fly);
      }
    };
    const onClick = (e) => choose(e.currentTarget);
    choices.forEach((b) => b.addEventListener("click", onClick));
    if (choiceBox) choiceBox.style.visibility = "hidden";
    paint(performance.now());
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf); clearTimeout(timer); clearTimeout(holdTimer);
      el.classList.remove("fx-pfg-on");
      choices.forEach((b) => b.removeEventListener("click", onClick));
      gsap.killTweensOf([state, svg, el, ...choices]);
      parts.forEach((pt) => { while (pt.solid.firstChild) pt.g.appendChild(pt.solid.firstChild); pt.solid.remove(); pt.g.removeAttribute("transform"); });
      made.forEach((n) => n.remove());
      gsap.set([svg, el, ...choices], { clearProps: "all" });
      if (choiceBox) choiceBox.style.visibility = "";
      el.style.clipPath = ""; el.style.visibility = "";
    };
  });
})();
