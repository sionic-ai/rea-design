// Stacking video cards + side text panel swap: each card cell sticks one by one at screen center (below the header), and while the next cell rises to cover it the previous card
// Recedes to .7x scale and .5 opacity (follows the scroll target with spring 728/25/1). Only the text panel of the cell inside the center 10% band stays up
// Panel children rise from 30px below in .9s at .06s intervals — Brand first page features section
(() => {
  kfFx.register("stack-shrink-swap", (el, { options, reduce, scroller }) => {
    const cards = [...el.querySelectorAll('[data-fx-part="card"]')];
    const texts = [...el.querySelectorAll('[data-fx-part="text"]')];
    if (!cards.length) return;
    const faceOf = (c) => c.querySelector('[data-fx-part="face"]') || c;
    const faces = cards.map(faceOf);
    const minScale = +(options.scale ?? 0.7), minAlpha = +(options.fade ?? 0.5);
    const k = +options.k || 728, c = +(options.c ?? 25), m = +options.m || 1;
    const inDur = +(options.dur ?? 0.9), outDur = +(options.out ?? 0.4), step = +(options.stagger ?? 0.06), cap = +(options.cap ?? 0.12), rise = +(options.rise ?? 30);
    const ease = kfFx.ease(options.ease || "0.12,0.23,0.12,0.99", "power3.out");
    const narrow = matchMedia(`(max-width: ${+options.narrow || 767}px)`);
    const headSel = options.head || "header";
    const vh = () => (scroller ? scroller.clientHeight : innerHeight);
    const rootTop = () => (scroller ? scroller.getBoundingClientRect().top : 0);
    const itemsOf = (t) => [...t.children];
    const hasGsap = typeof gsap !== "undefined";

    let top = 0;
    const place = () => {
      const head = document.querySelector(headSel);
      const hh = head && !el.contains(head) ? head.clientHeight : 0;
      const fh = faces[0].offsetHeight;
      top = Math.max(hh, (vh() - fh - hh) / 2 + hh);
      cards.forEach((cd) => {
        const f = faceOf(cd);
        const inner = f === cd ? 0 : f.offsetParent === cd ? f.offsetTop : f.getBoundingClientRect().top - cd.getBoundingClientRect().top;
        cd.style.top = narrow.matches ? "" : top - inner + "px";
      });
    };

    let active = -1;
    const show = (i, instant) => {
      if (i === active) return;
      const prev = active; active = i;
      texts.forEach((t, n) => { t.style.pointerEvents = n === i ? "auto" : "none"; t.setAttribute("aria-hidden", n === i ? "false" : "true"); });
      if (!hasGsap || instant || reduce) {
        texts.forEach((t, n) => itemsOf(t).forEach((it) => { it.style.opacity = n === i ? 1 : 0; it.style.transform = ""; }));
        return;
      }
      if (prev >= 0 && texts[prev]) itemsOf(texts[prev]).forEach((it) => { gsap.killTweensOf(it); gsap.to(it, { opacity: 0, y: 0, duration: outDur, ease }); });
      if (texts[i]) itemsOf(texts[i]).forEach((it, n) => { gsap.killTweensOf(it); gsap.fromTo(it, { opacity: 0, y: rise }, { opacity: 1, y: 0, duration: inDur, ease, delay: Math.min(n * step, cap) }); });
    };

    // The original uses IntersectionObserver (rootMargin −45%) — a pinned card stays inside the band and gives no signal on rewind, so each frame we decide by whether the cell’s top edge has crossed the 55% line
    const pick = (H, rt) => {
      let i = 0;
      cards.forEach((cd, n) => { if (cd.getBoundingClientRect().top - rt <= H * 0.55) i = n; });
      return i;
    };
    const wide = () => {
      place();
      if (narrow.matches) { texts.forEach((t) => itemsOf(t).forEach((it) => { if (hasGsap) gsap.killTweensOf(it); it.style.opacity = ""; it.style.transform = ""; })); active = -1; }
      else if (active < 0) show(0, true);
    };

    // Previous card’s target = Share raised until the next cell’s face attaches at the bottom of the screen — follows with a spring
    const st = faces.map(() => ({ x: 0, v: 0 }));
    let last = 0, raf = 0;
    const tick = (now) => {
      raf = requestAnimationFrame(tick);
      const dt = last ? Math.min(0.05, Math.max(0.001, (now - last) / 1000)) : 1 / 60;
      last = now;
      const H = vh(), rt = rootTop();
      if (!narrow.matches) show(pick(H, rt));
      faces.forEach((f, i) => {
        let goal = 0;
        if (!narrow.matches && i < faces.length - 1) {
          const nt = faces[i + 1].getBoundingClientRect().top - rt;
          goal = Math.min(1, Math.max(0, (H - nt) / Math.max(1, H - top)));
        }
        const s = st[i];
        const a = (-k * (s.x - goal) - c * s.v) / m;
        s.v += a * dt; s.x += s.v * dt;
        if (Math.abs(s.x - goal) < 1e-4 && Math.abs(s.v) < 1e-4) { s.x = goal; s.v = 0; }
        const p = Math.max(0, s.x);
        f.style.transform = p ? `scale(${1 - (1 - minScale) * p})` : "";
        f.style.opacity = p ? String(1 - (1 - minAlpha) * p) : "";
      });
    };

    const ro = new ResizeObserver(wide);
    ro.observe(faces[0]);
    narrow.addEventListener("change", wide);
    addEventListener("resize", wide);
    wide();
    const still = () => { if (!narrow.matches) show(pick(vh(), rootTop()), true); };
    if (!reduce) raf = requestAnimationFrame(tick);
    else (scroller || window).addEventListener("scroll", still, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      (scroller || window).removeEventListener("scroll", still);
      narrow.removeEventListener("change", wide);
      removeEventListener("resize", wide);
      cards.forEach((cd) => { cd.style.top = ""; });
      faces.forEach((f) => { f.style.transform = ""; f.style.opacity = ""; });
      texts.forEach((t) => { t.style.pointerEvents = ""; t.removeAttribute("aria-hidden"); itemsOf(t).forEach((it) => { if (hasGsap) gsap.killTweensOf(it); it.style.opacity = ""; it.style.transform = ""; }); });
    };
  });
})();
