// Scatters product-like items at random spots in the board without overlapping (item width + gap box, re-roll up to 100 times), and clicking an empty spot scatters them again (shop site).
// Positions are 40px inside the board edge. At first they appear after 1s at .05s intervals over 1s power2.out, and when scattering again css moves left·top over .7s ease-out.
// The label text beside the cursor follows with left .5s · top .4s power3.out, vanishes over an item in .3s power2.out, and when it comes back it returns in .7s power2.in.
(() => {
  kfFx.register("scatter-shuffle", (el, { options, reduce, hover }) => {
    const items = [...el.querySelectorAll('[data-fx-part="item"]')];
    if (!items.length) return;
    const label = el.querySelector('[data-fx-part="label"]');
    const min = +(options.min ?? 768), edge = +(options.edge ?? 40), tries = Math.max(1, +(options.tries ?? 100) || 100);
    const delay = reduce ? 0 : +(options.delay ?? 1), each = reduce ? 0 : +(options.each ?? 0.05), dur = reduce ? 0 : +(options.dur ?? 1);
    const ac = new AbortController(), sig = { signal: ac.signal };
    let on = false, shown = false, tw = [], waiting = options.wait === "ready";

    const place = () => {
      const W = el.clientWidth, H = el.clientHeight;
      const size = items[0].offsetWidth || 150;
      const gap = +(options.gap ?? Math.max(1, 0.00556 * W));
      const box = size + gap;
      const taken = [];
      const hit = (p) => taken.some((q) => p.x < q.x + box && p.x + box > q.x && p.y < q.y + box && p.y + box > q.y);
      items.forEach((it) => {
        let p, k = 0;
        do { p = { x: edge + Math.random() * Math.max(0, W - size - 2 * edge), y: edge + Math.random() * Math.max(0, H - size - 2 * edge) }; k++; } while (hit(p) && k < tries);
        taken.push(p);
        it.style.left = `${p.x}px`;
        it.style.top = `${p.y}px`;
      });
    };
    const show = () => {
      if (shown) return;
      shown = true;
      tw = items.map((it, i) => gsap.to(it, { opacity: 1, delay: delay + each * i, duration: dur, ease: "power2.out" }));
    };
    const setup = () => {
      const want = el.clientWidth >= min;
      if (want === on) { if (on) place(); return; }
      on = want;
      el.classList.toggle("is-fx-scatter", on);
      tw.forEach((t) => t.kill());
      shown = false;
      if (!on) { gsap.set(items, { clearProps: "opacity,left,top" }); items.forEach((it) => { it.style.left = it.style.top = ""; }); return; }
      place();
      if (!waiting) show();
    };
    // If something like a loader must finish first, set wait: ready and fire fx:ready on the panel when done
    el.addEventListener("fx:ready", () => { waiting = false; if (on) show(); }, sig);
    el.addEventListener("click", (e) => { if (on && !e.target.closest('[data-fx-part="item"],a,button')) place(); }, sig);

    let ro, t = 0;
    ro = new ResizeObserver(() => { clearTimeout(t); t = setTimeout(setup, 100); });
    setup();
    ro.observe(el);

    if (label && hover) {
      const qx = gsap.quickTo(label, "left", { duration: reduce ? 0 : 0.5, ease: "power3.out" });
      const qy = gsap.quickTo(label, "top", { duration: reduce ? 0 : 0.4, ease: "power3.out" });
      let first = true, over = false;
      const fade = () => { gsap.killTweensOf(label, "opacity"); gsap.to(label, { opacity: over ? 0 : 1, duration: over ? 0.3 : 0.7, ease: over ? "power2.out" : "power2.in" }); };
      // The original appears in .7s right after attaching (position set to the cursor on first move) and disappears when an item is hovered
      if (on) fade();
      addEventListener("pointermove", (e) => {
        if (!on) return;
        if (first) { first = false; gsap.set(label, { left: e.clientX, top: e.clientY }); }
        qx(e.clientX); qy(e.clientY);
      }, sig);
      items.forEach((it) => {
        it.addEventListener("pointerenter", () => { over = true; fade(); }, sig);
        it.addEventListener("pointerleave", () => { over = false; fade(); }, sig);
      });
    }

    return () => {
      ac.abort(); ro.disconnect(); clearTimeout(t);
      tw.forEach((x) => x.kill());
      el.classList.remove("is-fx-scatter");
      gsap.set(items, { clearProps: "opacity" });
      items.forEach((it) => { it.style.left = it.style.top = ""; });
      if (label) { gsap.killTweensOf(label); gsap.set(label, { clearProps: "all" }); }
    };
  });
})();
