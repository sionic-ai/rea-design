// If a half of the band is shorter than the band, the end looks empty, so repeat the content until the half exceeds the band width, then append the half once more and run to -50%.
// Leave a gap at the end of each half so the two copies are evenly spaced at the seam too. Paused while offscreen.
(() => {
  kfFx.register("marquee", (el, { options, scroller }) => {
    const ac = new AbortController();
    const close = el.querySelector(':scope > [data-fx-part="close"]');
    const items = [...el.childNodes].filter((n) => n !== close && !(n.nodeType === 3 && !n.textContent.trim()));
    const box = document.createElement("div"), track = document.createElement("div"), half = document.createElement("div");
    box.className = "fx-mq"; track.className = "fx-mq__track"; half.className = "fx-mq__half";
    half.append(...items);
    track.append(half);
    box.append(track);
    el.prepend(box);
    if (options.speed) el.style.setProperty("--fx-speed", `${+options.speed}s`);
    if (options.gap) el.style.setProperty("--fx-gap", `${+options.gap}px`);
    // delay — pause before flowing (seconds). Meanwhile it stands at the first position (−50% if dir: right) (Brand cover strip .5)
    if (options.delay != null) el.style.setProperty("--fx-delay", `${+options.delay}s`);
    // slow — on hover it doesn’t stop but slows by this multiplier (exalt logo strip .25)
    const slow = options.slow == null ? null : +options.slow;
    // brake — when a hand is placed it glides to a stop over this ms time constant instead of halting dead, and on release regains its own speed with the same constant (Brand number strip 180)
    const brake = +(options.brake ?? 0);
    el.classList.toggle("fx-mq-nopause", options.pause === "none" || slow != null || brake > 0);
    const unit = [...half.childNodes].map((n) => n.cloneNode(true));
    // axis: y is a vertical column — repeats until half exceeds the band height (photo column in the About section of Brand)
    const vert = options.axis === "y";
    const short = () => (vert ? half.scrollHeight < el.clientHeight : half.scrollWidth < el.clientWidth);
    for (let i = 0; i < 20 && short(); i++) half.append(...unit.map((n) => n.cloneNode(true)));
    // jitter — offsets each cell vertically at random within this range (px). Applied before cloning so the two copies connect at the same height (recruit-pnp photo strip -30 120, phone -10 60)
    const jit = String(options.jitter ?? "").trim().split(/[\s,]+/).map(Number).filter((n) => !Number.isNaN(n));
    if (jit.length === 2) [...half.children].forEach((c) => c.style.setProperty("translate", `0 ${(jit[0] + Math.random() * (jit[1] - jit[0])).toFixed(1)}px`));
    const copy = half.cloneNode(true);
    copy.setAttribute("aria-hidden", "true");
    track.append(copy);
    // rate is px per second, not seconds per loop — if the text changes or a late font changes the width, the length is measured again
    const rate = +(options.rate ?? 0);
    // rate-narrow — px per second used at 979px and below (Brand notice and footer band 42 → 35). Re-measured when the width crosses the breakpoint
    const narrow = options["rate-narrow"] != null && +options["rate-narrow"] > 0 ? matchMedia("(max-width: 979px)") : null;
    const measure = () => el.style.setProperty("--fx-speed", `${(vert ? half.scrollHeight : half.scrollWidth) / (narrow?.matches ? +options["rate-narrow"] : rate)}s`);
    const ro = rate > 0 ? new ResizeObserver(measure) : null;
    ro?.observe(half);
    if (ro && narrow) narrow.addEventListener("change", measure, { signal: ac.signal });
    const io = new IntersectionObserver(([e]) => el.classList.toggle("fx-mq-off", !e.isIntersecting), { root: scroller || null });
    io.observe(el);
    // boost — scroll speed (px/s) ÷ boost (up to +max) speeds up in .2s, then returns to its own speed over 1.4s power2.out (Studio text band 350 · 6)
    const boost = +(options.boost ?? 0);
    let unboost = null;
    if (boost > 0 && window.gsap) {
      const rate = { v: 1 };
      const apply = () => track.getAnimations().forEach((a) => (a.playbackRate = rate.v));
      const at = () => (scroller ? scroller.scrollTop : scrollY);
      let last = at(), then = performance.now();
      (scroller || window).addEventListener("scroll", () => {
        const now = performance.now(), y = at(), v = (Math.abs(y - last) / Math.max(1, now - then)) * 1000;
        last = y; then = now;
        gsap.killTweensOf(rate);
        gsap.timeline().to(rate, { v: 1 + Math.min(v / boost, +(options.max ?? 6)), duration: 0.2, onUpdate: apply }).to(rate, { v: 1, duration: +(options.back ?? 1.4), ease: "power2.out", onUpdate: apply });
      }, { passive: true, signal: ac.signal });
      unboost = () => { gsap.killTweensOf(rate); rate.v = 1; apply(); };
    }
    if (slow != null) {
      const rate = (v) => () => track.getAnimations().forEach((a) => a.updatePlaybackRate(v));
      for (const [on, v] of [["pointerenter", slow], ["pointerleave", 1], ["focusin", slow], ["focusout", 1]]) box.addEventListener(on, rate(v), { signal: ac.signal });
    }
    let unbrake = null;
    if (brake > 0 && slow == null) {
      let want = 1, now = 1, raf = 0, prev = null;
      const step = (t) => {
        const a = track.getAnimations()[0];
        if (!a) { raf = 0; return; }
        const dt = prev == null ? 0 : t - prev;
        prev = t;
        now += (want - now) * (1 - Math.exp(-dt / brake));
        if (Math.abs(want - now) < 0.01) now = want;
        a.currentTime = Number(a.currentTime) + dt * now * (a.playbackRate || 1);
        if (now !== want) { raf = requestAnimationFrame(step); return; }
        raf = 0; prev = null;
        if (now === 1) a.play();
      };
      const go = (v) => () => {
        want = v;
        const a = track.getAnimations()[0];
        if (!a || raf) return;
        a.pause(); prev = null;
        raf = requestAnimationFrame(step);
      };
      for (const [on, v] of [["pointerenter", 0], ["pointerleave", 1], ["focusin", 0], ["focusout", 1]]) box.addEventListener(on, go(v), { signal: ac.signal });
      unbrake = () => { cancelAnimationFrame(raf); track.getAnimations()[0]?.play(); };
    }
    close?.addEventListener("click", () => { el.classList.add("is-off"); el.dispatchEvent(new CustomEvent("fx:close", { bubbles: true })); }, { signal: ac.signal });
    return () => {
      ac.abort(); io.disconnect(); ro?.disconnect(); unboost?.(); unbrake?.();
      el.prepend(...items); box.remove();
      if (jit.length === 2) items.forEach((n) => n.style?.removeProperty("translate"));
      el.classList.remove("is-off", "fx-mq-off", "fx-mq-nopause");
      el.style.removeProperty("--fx-speed"); el.style.removeProperty("--fx-gap"); el.style.removeProperty("--fx-delay");
    };
  });
})();
