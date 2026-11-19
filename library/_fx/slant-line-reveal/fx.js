// For each line visible on screen (actually wrapped lines, not line-break tags) the same text is layered twice — while the faint layer floats up, the dark layer peels off at a slant over it
(() => {
  const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
  const poly = (p, k) => {
    const e = clamp(p * (100 + k * 2) - k, -k, 100 + k), a = clamp(e + k, 0, 100), b = clamp(e - k, 0, 100);
    return a <= 0 ? "polygon(0 0, 0 0, 0 100%, 0 100%)" : b >= 100 ? "polygon(0 0, 100% 0, 100% 100%, 0 100%)" : `polygon(0 0, ${a}% 0, ${b}% 100%, 0 100%)`;
  };
  // Groups the text range’s rectangles into lines by matching top edges
  const linesOf = (el) => {
    const r = document.createRange();
    r.selectNodeContents(el);
    const box = el.getBoundingClientRect();
    const rects = [...r.getClientRects()].filter((q) => q.width > 0 && q.height > 0).map((q) => ({ top: q.top - box.top, right: q.right - box.left, bottom: q.bottom - box.top, left: q.left - box.left }));
    r.detach();
    return { box, lines: rects.reduce((acc, q) => { const l = acc[acc.length - 1]; if (l && Math.abs(l.top - q.top) < 2) { l.top = Math.min(l.top, q.top); l.right = Math.max(l.right, q.right); l.bottom = Math.max(l.bottom, q.bottom); l.left = Math.min(l.left, q.left); } else acc.push({ ...q }); return acc; }, []) };
  };
  kfFx.register("slant-line-reveal", (el, { options, reduce }) => {
    const html = el.innerHTML.trim();
    if (!html || !el.textContent.trim()) return;
    const slant = +(options.slant ?? 8), each = +(options.each ?? 0.1), fade = +(options.fade ?? 0.8), dur = +(options.dur ?? 2.6), x = +(options.x ?? -20);
    const fadeEase = kfFx.ease(options["fade-ease"] || "sine.out", "sine.out"), ease = kfFx.ease(options.ease || "power4.inOut", "power4.inOut");
    const { box, lines } = linesOf(el);
    if (!lines.length) return;
    const line = (cls, l) => `<span class="fx-slr-line ${cls}" style="clip-path: inset(${l.top}px ${box.width - l.right}px ${box.height - l.bottom}px ${l.left}px)"><span class="fx-slr-in">${html}</span></span>`;
    el.innerHTML = `<span class="fx-slr-ph" aria-hidden="true">${html}</span><span class="fx-slr-layer is-from" aria-hidden="true">${lines.map((l) => line("", l)).join("")}</span><span class="fx-slr-layer is-to" aria-hidden="true">${lines.map((l) => line("", l)).join("")}</span><span class="fx-sr">${el.textContent}</span>`;
    const froms = [...el.querySelectorAll(".is-from > .fx-slr-line")], tos = [...el.querySelectorAll(".is-to > .fx-slr-line")], covers = tos.map((t) => t.firstElementChild);
    if (reduce) { covers.forEach((c) => (c.style.clipPath = poly(1, slant))); return () => (el.innerHTML = html); }
    gsap.set([...froms, ...tos], { opacity: 0, x });
    covers.forEach((c) => (c.style.clipPath = poly(0, slant)));
    const tl = gsap.timeline({ paused: true });
    covers.forEach((c, i) => {
      const o = { p: 0 };
      tl.to([froms[i], tos[i]], { opacity: 1, x: 0, duration: fade, ease: fadeEase }, i * each)
        .to(o, { p: 1, duration: dur, ease, onUpdate: () => (c.style.clipPath = poly(o.p, slant)) }, i * each);
    });
    // The original uses IntersectionObserver — fires once when 15% enters the area excluding the bottom 25% of the screen
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { tl.play(0); io.disconnect(); } }), { rootMargin: options.margin || "0px 0px -25% 0px", threshold: +(options.threshold ?? 0.15) });
    io.observe(el);
    return () => { io.disconnect(); tl.kill(); el.innerHTML = html; };
  });
})();
