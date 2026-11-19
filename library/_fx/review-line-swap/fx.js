// Swapping reviews — stars shrink then grow, text lines slide up out of the mask, then new lines rise from below
(() => {
  kfFx.register("review-line-swap", (el, { options, reduce }) => {
    const items = [...el.querySelectorAll('[data-fx-part="item"]')];
    if (!items.length) return;
    const every = +(options.every ?? 5), outD = +(options.out ?? 0.6), inD = +(options.in ?? 0.7);
    const canSplit = !!window.SplitText && !reduce;
    const R = items.map((it) => ({ it, stars: it.querySelectorAll('[data-fx-part="star"]'), splits: [] }));
    let cur = Math.max(0, items.findIndex((n) => n.hasAttribute("data-on"))), busy = false, seen = true, timer = null;
    const show = (i, on) => { R[i].it.toggleAttribute("data-on", on); R[i].it.setAttribute("aria-hidden", String(!on)); };
    R.forEach((r, i) => show(i, i === cur));
    if (canSplit) R.forEach((r, i) => {
      r.splits = [...r.it.querySelectorAll('[data-fx-part="text"]')].filter((n) => n.textContent.trim()).map((n) => SplitText.create(n, {
        type: "lines", mask: "lines", linesClass: "fx-rls-line", autoSplit: true,
        onSplit: (s) => { s.masks?.forEach((m) => m.classList.add("fx-rls-mask")); gsap.set(s.lines, { yPercent: i === cur ? 0 : 110 }); },
      }));
      if (r.stars.length) gsap.set(r.stars, { scale: i === cur ? 1 : 0, autoAlpha: i === cur ? 1 : 0 });
    });
    const lines = (r) => r.splits.flatMap((s) => s.lines || []);
    const go = (n) => {
      if (busy || n === cur || items.length < 2) return;
      busy = true;
      const a = R[cur], b = R[n];
      const tl = gsap.timeline({ onComplete: () => { show(cur, false); show(n, true); gsap.set(a.it, { clearProps: "opacity,visibility" }); gsap.set(b.it, { clearProps: "opacity,visibility" }); cur = n; busy = false; } });
      if (!canSplit) { tl.to(a.it, { autoAlpha: 0, duration: 0.4, ease: "power2" }, 0).fromTo(b.it, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4, ease: "power2" }, 0); return; }
      gsap.set(b.it, { autoAlpha: 1 });
      const la = lines(a), lb = lines(b);
      if (lb.length) gsap.set(lb, { yPercent: 110 });
      if (a.stars.length) tl.to(a.stars, { scale: 0, autoAlpha: 0, duration: 0.5, stagger: 0.05, ease: "power4.inOut" }, 0);
      if (la.length) tl.to(la, { yPercent: -110, duration: outD, ease: "power4.inOut", stagger: { amount: 0.25 } }, 0);
      if (b.stars.length) tl.to(b.stars, { scale: 1, autoAlpha: 1, duration: 0.5, stagger: 0.05, ease: "power4.inOut" }, Math.max(0, tl.duration() - 0.3));
      if (lb.length) tl.to(lb, { yPercent: 0, duration: inD, ease: "power4.inOut", stagger: { amount: 0.4 } }, b.stars.length ? "<" : Math.max(0, tl.duration() - 0.3));
      tl.set(a.it, { autoAlpha: 0 }, ">");
    };
    const loop = () => { timer?.kill(); if (reduce || every <= 0 || items.length < 2) return; timer = gsap.delayedCall(every, () => { if (seen && !busy) go((cur + 1) % R.length); loop(); }); };
    const next = () => { loop(); go((cur + 1) % R.length); };
    const prev = () => { loop(); go((cur - 1 + R.length) % R.length); };
    const nb = el.querySelector('[data-fx-part="next"]'), pb = el.querySelector('[data-fx-part="prev"]');
    nb?.addEventListener("click", next);
    pb?.addEventListener("click", prev);
    const key = (e) => {
      const t = e.target;
      if (!seen || (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable))) return;
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    addEventListener("keydown", key);
    const io = new IntersectionObserver(([e]) => { seen = e.isIntersecting; });
    io.observe(el);
    loop();
    return () => {
      timer?.kill(); io.disconnect();
      removeEventListener("keydown", key);
      nb?.removeEventListener("click", next); pb?.removeEventListener("click", prev);
      R.forEach((r) => { r.splits.forEach((s) => s.revert()); gsap.set([r.it, ...r.stars], { clearProps: "all" }); r.it.removeAttribute("data-on"); r.it.removeAttribute("aria-hidden"); });
    };
  });
})();
