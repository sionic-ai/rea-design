// A disc cursor whose shape changes by spot: a 100px disc follows the cursor spot (center) with .2s easeOut, data-fx-part="zone" When you go to bed
// Turns on in .2s with the data-cursor type at that spot (view text, scroll down arrow, rotate circular arrow, or other text) and the data-cursor-bg/-ink fills.
// Pressing the rotate spot turns the disc half a turn in .2s, and leaving that spot’s parent returns it to 0° — g-mouse of Brand
(() => {
  const ICON = {
    scroll: '<svg viewBox="0 0 80 80" fill="none" aria-hidden="true"><circle cx="40" cy="40" r="40" class="fx-zdc__fill"/><path d="M40.86 24v32m0 0 16-16m-16 16-16-16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    rotate: '<svg viewBox="0 0 80 80" fill="none" aria-hidden="true"><circle cx="40" cy="40" r="40" class="fx-zdc__fill"/><path d="M28.3 56.2h8.8m0 0v-8.7m0 8.7-6.4-6.7a13.6 13.6 0 0 1 5.1-22.4m16.1-3.7h-8.8m0 0v8.7m0-8.7 6.4 6.7a13.6 13.6 0 0 1-5.1 22.4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  };
  kfFx.register("zone-disc-cursor", (el, { options, reduce, hover }) => {
    const below = +(options.below ?? 1025);
    if (!hover || innerWidth <= below) return;
    const size = +(options.size || 100), dur = +(options.dur ?? 0.2), lag = +(options.lag ?? 15);
    const ease = kfFx.ease("0,0,0.58,1", "power1.out");
    const turnEase = kfFx.ease("0.42,0,0.58,1", "power1.inOut");
    const wrap = document.createElement("div");
    wrap.className = "fx-zdc";
    wrap.setAttribute("aria-hidden", "true");
    wrap.style.setProperty("--fx-size", `${size}px`);
    wrap.innerHTML = '<div class="fx-zdc__disc"></div>';
    const disc = wrap.firstChild;
    document.body.appendChild(wrap);
    const toX = gsap.quickTo(wrap, "x", { duration: reduce ? 0 : dur, ease });
    const toY = gsap.quickTo(wrap, "y", { duration: reduce ? 0 : dur, ease });
    let kind = "", deg = 0, zone = null, seen = false;

    const face = (k) => {
      if (k === kind) return;
      kind = k;
      disc.dataset.kind = ICON[k] ? k : "label";
      disc.innerHTML = ICON[k] || `<span class="fx-zdc__label">${(k || "").replace(/[<>&]/g, "")}</span>`;
    };
    const paint = (z) => {
      const bg = z.closest("[data-cursor-bg]")?.getAttribute("data-cursor-bg");
      const ink = z.closest("[data-cursor-ink]")?.getAttribute("data-cursor-ink");
      wrap.style.setProperty("--fx-bg", bg || "var(--kf-contrast-bg)");
      wrap.style.setProperty("--fx-ink", ink || "var(--kf-contrast-ink)");
    };
    const turn = (to) => { deg = to; gsap.to(disc, { rotation: deg, duration: reduce ? 0 : dur, ease: turnEase, overwrite: "auto" }); };

    // The original passes the cursor position as React state, and framer starts from it on the next render, so movement begins late by the lag — hand over the past position delayed by that much
    const timers = new Set();
    const send = (x, y) => {
      const t = setTimeout(() => { timers.delete(t); toX(x); toY(y); }, lag);
      timers.add(t);
    };
    const move = (e) => {
      const x = e.clientX - size / 2, y = e.clientY - size / 2;
      if (!seen) { seen = true; gsap.set(wrap, { x, y }); }
      if (reduce || lag <= 0) { toX(x); toY(y); }
      else send(x, y);
      const hit = e.target instanceof Element ? e.target.closest('[data-fx-part="zone"]') : null;
      const z = hit && el.contains(hit) ? hit : null;
      if (z !== zone) {
        if (zone && zone.getAttribute("data-cursor") === "rotate" && (!z || !zone.parentNode?.contains(z))) turn(0);
        zone = z;
        if (z) paint(z);
      }
      const off = e.target instanceof Element && e.target.closest('[data-cursor="none"]');
      if (z && !off) { face(z.getAttribute("data-cursor") || "view"); wrap.classList.add("is-on"); }
      else wrap.classList.remove("is-on");
    };
    const leaveDoc = () => { wrap.classList.remove("is-on"); zone = null; };
    const click = (e) => {
      const z = e.target instanceof Element ? e.target.closest('[data-fx-part="zone"][data-cursor="rotate"]') : null;
      if (z && el.contains(z)) turn(deg + 180);
    };
    addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leaveDoc);
    el.addEventListener("click", click);
    return () => {
      removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leaveDoc);
      el.removeEventListener("click", click);
      timers.forEach(clearTimeout);
      gsap.killTweensOf([wrap, disc]);
      wrap.remove();
    };
  });
})();
