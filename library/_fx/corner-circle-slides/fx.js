// Swap stacked sections in turn — the next section covers the previous one with a circle from one corner, and the name text turns off, then switches on when the circle is half spread
(() => {
  kfFx.register("corner-circle-slides", (el, { options, reduce, hover, scroller }) => {
    const slides = [...el.querySelectorAll('[data-fx-part="slide"]')];
    if (slides.length < 2) return;
    const title = el.querySelector('[data-fx-part="title"]'), link = el.querySelector('[data-fx-part="link"]');
    const at = options.at || "100% 0%", every = +(options.every ?? 2.6), dur = +(options.dur ?? 1.1), ease = kfFx.ease(options.ease || "expo.inOut", "expo.inOut");
    const swap = +(options.swap ?? 0.6), from = options.from || "0%", zoom = +(options.zoom ?? 1);
    // Dot buttons: click to jump straight to that section, and the current section’s dot gets is-active
    const dots = [...el.querySelectorAll('[data-fx-part="dot"]')];
    let i = 0, held = false, seen = true, timer, busy = false;
    const mark = (n) => dots.forEach((d, k) => d.classList.toggle("is-active", k === n));
    mark(0);
    slides.forEach((s, n) => gsap.set(s, { zIndex: n ? 0 : 2, visibility: n ? "hidden" : "visible" }));
    const next = () => { timer?.kill(); if (!reduce && !held && seen) timer = gsap.delayedCall(every, () => go(i + 1)); };
    const go = (n) => {
      const to = n % slides.length, from = slides[i], el2 = slides[to];
      i = to;
      gsap.set(from, { zIndex: 1 });
      gsap.set(el2, { zIndex: 2, visibility: "visible" });
      busy = true;
      mark(to);
      gsap.fromTo(el2, { clipPath: `circle(${from} at ${at})`, scale: zoom }, { clipPath: `circle(${+(options.size ?? 142)}% at ${at})`, scale: 1, duration: reduce ? 0 : dur, ease, onComplete: () => { busy = false; slides.forEach((s) => s !== el2 && gsap.set(s, { visibility: "hidden", zIndex: 0 })); } });
      if (title) gsap.timeline().to(title, { opacity: 0, duration: 0.3, ease: "power1.out" }, 0)
        .add(() => { if (el2.dataset.title) title.textContent = el2.dataset.title; if (el2.dataset.href) { if (title.href !== undefined) title.href = el2.dataset.href; if (link) link.href = el2.dataset.href; } }, swap)
        .to(title, { opacity: 1, duration: 0.4, ease: "power2.out" }, swap);
      el.dispatchEvent(new CustomEvent("fx:slide", { detail: { index: to } }));
      next();
    };
    const ac = new AbortController(), on = { signal: ac.signal };
    const hold = (v) => () => { held = v; next(); };
    if (hover && options.pause !== "none") { el.addEventListener("pointerenter", hold(true), on); el.addEventListener("pointerleave", hold(false), on); }
    dots.forEach((d, k) => d.addEventListener("click", (e) => { e.preventDefault(); if (!busy && k !== i && k < slides.length) go(k); }, on));
    el.addEventListener("focusin", hold(true), on);
    el.addEventListener("focusout", hold(false), on);
    const io = new IntersectionObserver(([e]) => { seen = e.isIntersecting; next(); }, { root: scroller || null });
    io.observe(el);
    return () => { ac.abort(); io.disconnect(); timer?.kill(); gsap.killTweensOf([...slides, title].filter(Boolean)); gsap.set(slides, { clearProps: "zIndex,visibility,clipPath,scale" }); dots.forEach((d) => d.classList.remove("is-active")); };
  });
})();
