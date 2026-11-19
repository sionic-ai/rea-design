// One pill per area. On desktop it is attached to body and follows by screen coordinates, on touch it stands inside the area
(() => {
  kfFx.register("cursor-ticker", (el, { options, reduce, hover, scroller }) => {
    const ac = new AbortController(), signal = ac.signal;
    const fxCtx = gsap.context(() => {
      const text = options.text || "Drag to explore";
      const pill = document.createElement("div");
      pill.className = "fx-ticker" + (hover ? "" : " is-touch");
      pill.setAttribute("aria-hidden", "true");
      // loop: 0 — the text stands in a single copy at the center and only cursor-follow and press remain — for screens where flowing text gets in the way
      // look: disc is a blurred ringed disc with one set of text and an arrow standing on it (campaign DRAG circle on Brand) — no flowing band
      const disc = options.look === "disc";
      const loop = disc ? 0 : +(options.loop ?? 4), still = !(loop > 0);
      const lag = +(options.lag ?? 0.35), press = +(options.press ?? 0.85), leave = +(options.leave ?? 0.6);
      // lerp — instead of a curve, each frame closes this fraction of the remaining distance (Brand A .1). fade — on/off duration (Brand A .1)
      const lerp = +(options.lerp ?? 0), fade = reduce ? 0 : +(options.fade ?? 0.3);
      const tag = options.look === "tag";
      const run = document.createElement("span");
      for (let i = 0; i < (still ? 1 : 6); i++) { const b = document.createElement("b"); b.textContent = text; run.append(b); }
      pill.append(run);
      if (disc) {
        pill.classList.add("is-disc");
        const arrow = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        arrow.setAttribute("viewBox", "0 0 36 8");
        arrow.innerHTML = '<path d="M0 4h34M28 0l6 4-6 4" fill="none" stroke="currentColor" stroke-width="1"/>';
        run.append(arrow);
      }
      if (tag) {
        // look: tag — ink-black rectangular strip (max 180px) with an arrow cell on the left, uppercase text flows (frost)
        pill.classList.add("is-tag");
        const icon = document.createElement("i");
        icon.innerHTML = '<svg viewBox="0 0 10 10"><path d="M2 1h7v7H7.6V3.4L2 9 1 8l5.6-5.6H2z" fill="currentColor"/></svg>';
        pill.prepend(icon);
      }
      (hover ? document.body : el).append(pill);
      signal.addEventListener("abort", () => pill.remove());
      if (still) { pill.classList.add("is-still"); if (!disc) gsap.set(pill, { xPercent: -50, yPercent: -50 }); }
      else if (!reduce) gsap.to(run, { xPercent: -33.333, duration: loop, repeat: -1, ease: "none" });
      // label: swaps in and shows the name tag of the child under the cursor (that selector) — data-label if present, else its text. Each list card shows its own name
      const bits = [...run.children];
      let shown = text;
      const say = (t) => { if (t && t !== shown) { shown = t; bits.forEach((b) => (b.textContent = t)); } };
      const labelOf = (t) => { const n = options.label && t.closest?.(options.label); return n && el.contains(n) ? (n.getAttribute("data-label") || n.getAttribute("data-tag") || n.textContent).trim() : text; };
      if (!hover) return;
      // lag: 0 means it sticks right to the pointer with no curve (Brand uses gsap.set on every pointermove)
      let qx = lag > 0 ? gsap.quickTo(pill, "x", { duration: lag, ease: "power3.out" }) : (v) => gsap.set(pill, { x: v });
      let qy = lag > 0 ? gsap.quickTo(pill, "y", { duration: lag, ease: "power3.out" }) : (v) => gsap.set(pill, { y: v });
      if (lerp > 0) {
        const want = { x: 0, y: 0 }, at = { x: 0, y: 0 };
        qx = (v) => (want.x = v);
        qy = (v) => (want.y = v);
        const tick = () => { at.x += (want.x - at.x) * lerp; at.y += (want.y - at.y) * lerp; gsap.set(pill, { x: at.x, y: at.y }); };
        gsap.ticker.add(tick);
        signal.addEventListener("abort", () => gsap.ticker.remove(tick));
        el.addEventListener("mouseenter", (e) => { at.x = want.x = e.clientX; at.y = want.y = e.clientY; }, { signal });
      }
      el.addEventListener("mousemove", (e) => { qx(e.clientX); qy(e.clientY); if (options.label) say(labelOf(e.target)); }, { signal });
      el.addEventListener("mouseenter", (e) => { if (options.label) say(labelOf(e.target)); gsap.set(pill, { x: e.clientX, y: e.clientY }); gsap.to(pill, { opacity: 1, scale: 1, duration: fade }); }, { signal });
      el.addEventListener("mouseleave", () => gsap.to(pill, { opacity: 0, scale: leave, duration: fade }), { signal });
      el.addEventListener("pointerdown", () => gsap.to(pill, { scale: press, duration: 0.2 }), { signal });
      el.addEventListener("pointerup", () => gsap.to(pill, { scale: 1, duration: 0.2 }), { signal });
    }, el);
    return () => { ac.abort(); fxCtx.revert(); };
  });
})();
