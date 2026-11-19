/* About — entrance · photo trail (8 photos at .2s spacing, vanishing .3s after .8s) · pledge lines brighten · horizontal ten columns (scrub 1, screen width x5) */
(() => {
  const { reduce, css } = window.PG;
  window.PG.enter((tl) => {
    if (!tl) return;
    tl.from("[data-load-title]", { opacity: 0, y: "0.5em", duration: 0.8, ease: "power2.out" }, "<10%");
    tl.from("[data-load-subtitle]", { opacity: 0, y: "0.75em", duration: 0.8, ease: "power2.out" }, "<10%");
    tl.from("[data-load-content]", { opacity: 0, duration: 0.8, stagger: 0.1, ease: "power2.out" }, "<10%");
  });

  // ── Photo Trail ──
  const trail = () => {
    const wrap = document.querySelector(".ah");
    const els = [...document.querySelectorAll(".ah__ti")];
    if (!wrap || !els.length || innerWidth < 992 || reduce) return;
    const LEN = 8, EVERY = 200, STOP = 800;
    const st = { timer: 0, clean: 0, i: 0, x: 0, y: 0, on: false, moved: false, stamps: new Map() };
    const hide = (el) => {
      gsap.killTweensOf(el);
      gsap.to(el, { opacity: 0, duration: 0.3, onComplete: () => { gsap.set(el, { display: "none", visibility: "hidden" }); st.stamps.delete(el); } });
    };
    const show = (el) => {
      gsap.killTweensOf(el);
      const r = el.getBoundingClientRect();
      Object.assign(el.style, { left: `${st.x - (r.width || 164) / 2}px`, top: `${st.y - (r.height || 220) / 2}px`, zIndex: st.i, display: "block", opacity: 1, visibility: "visible" });
      st.stamps.set(el, Date.now());
    };
    const next = () => {
      if (!st.moved) return;
      const lead = els[st.i % els.length];
      const tail = els[(((st.i - LEN) % els.length) + els.length) % els.length];
      show(lead);
      if (st.i >= LEN && tail && tail !== lead) hide(tail);
      st.i++;
    };
    const move = (e) => { const r = wrap.getBoundingClientRect(); st.x = e.clientX - r.left; st.y = e.clientY - r.top; st.moved = true; };
    const sweep = () => { const now = Date.now(); for (const [el, t] of st.stamps) if (now - t > STOP) hide(el); };
    const start = () => { if (st.on) return; st.on = true; wrap.addEventListener("mousemove", move); st.timer = setInterval(next, EVERY); st.clean = setInterval(sweep, 100); };
    const stop = () => {
      if (!st.on) return;
      st.on = false; st.moved = false;
      wrap.removeEventListener("mousemove", move);
      clearInterval(st.timer); clearInterval(st.clean);
      st.stamps.forEach((_, el) => hide(el));
      st.stamps.clear();
    };
    wrap.addEventListener("mouseenter", start);
    wrap.addEventListener("mouseleave", stop);
    ScrollTrigger.create({ trigger: wrap, start: "top bottom", end: "bottom top", onLeave: stop, onLeaveBack: stop });
  };

  // ── Pledge lines: each line goes from .4 to 1, 80% → center ──
  const highlight = () => document.querySelectorAll("[data-highlight-text]").forEach((h) => {
    if (reduce || !window.SplitText) return;
    SplitText.create(h, {
      type: "lines, words",
      autoSplit: true,
      onSplit(self) {
        return gsap.timeline({ scrollTrigger: { scrub: true, trigger: h, start: "top 80%", end: "center center" } })
          .from(self.lines, { autoAlpha: 0.4, stagger: 1, ease: "linear" });
      },
    });
  });

  const q = (s) => document.querySelector(s);
  const progress = q("[data-cr-num]");
  const setProg = (p) => { if (progress) { const n = Math.round(p * 100); progress.textContent = n < 10 ? "0" + n : n; } };

  const panels = () => {
    const wrap = q(".cr");
    const list = gsap.utils.toArray(".cr__panel");
    if (!wrap || !list.length) return;
    const lit = css("--kf-contrast-ink");
    const mm = gsap.matchMedia();
    mm.add("(min-width: 992px) and (prefers-reduced-motion: no-preference)", () => {
      const h = gsap.to(list, {
        x: () => -list[list.length - 1].offsetLeft,
        ease: "none",
        scrollTrigger: { trigger: wrap, pin: true, scrub: 1, invalidateOnRefresh: true, end: () => "+=" + wrap.offsetWidth * 5, onUpdate: (s) => setProg(s.progress) },
      });
      const ST = (trigger, start, end) => ({ trigger, containerAnimation: h, start, end, scrub: true });
      const [p1, p2, p3, p4, p5, p6, p7, p8, p9, p10] = list;
      gsap.timeline({ scrollTrigger: { trigger: wrap, start: "top center", end: "top top", scrub: 0.5 } })
        .to(q("[data-p1-title]"), { opacity: 1 }, 0)
        .from(q("[data-p1-sub]"), { opacity: 0, yPercent: 2 }, 0.2)
        .from(q("[data-p1-logo]"), { opacity: 0, yPercent: -10 }, 0.1)
        .from(q("[data-p1-image]"), { opacity: 0, yPercent: 6 }, 0);
      gsap.to("[data-p2-i1]", { xPercent: -60, ease: "none", scrollTrigger: ST(p2, "left right", "right left") });
      gsap.to("[data-p2-i2]", { xPercent: -10, ease: "none", scrollTrigger: ST(p2, "left right", "right left") });
      gsap.to("[data-p2-i3]", { xPercent: -160, ease: "none", scrollTrigger: ST(p2, "left right", "right left") });
      gsap.to("[data-p2-title]", { color: lit, scrollTrigger: ST(p2, "left 80%", "left left") });
      gsap.to("[data-p3-title]", { color: lit, ease: "power2.out", scrollTrigger: ST(p3, "left 80%", "left left") });
      gsap.to("[data-p3-image]", { x: -80, yPercent: -6, ease: "none", scrollTrigger: ST(p3, "left right", "right left") });
      gsap.from("[data-p4-image]", { x: -100, ease: "power2.out", scrollTrigger: ST(p4, "left 90%", "left 50%") });
      gsap.to("[data-p4-visual]", { scale: 0.8, ease: "power2.inOut", scrollTrigger: ST(p4, "right 60%", "right left") });
      gsap.to("[data-p5-title]", { color: lit, ease: "power2.out", scrollTrigger: ST(p5, "left 40%", "left left") });
      gsap.to("[data-p5-i1]", { x: -120, yPercent: -8, ease: "none", scrollTrigger: ST(p5, "left right", "right left") });
      gsap.to("[data-p5-i2]", { x: -160, yPercent: -6, ease: "none", scrollTrigger: ST(p5, "left right", "right left") });
      gsap.to("[data-p6-title]", { color: lit, ease: "power2.out", scrollTrigger: ST(p6, "left 40%", "left left") });
      gsap.to("[data-p6-i1]", { x: -120, yPercent: 8, ease: "none", scrollTrigger: ST(p6, "left right", "right left") });
      gsap.to("[data-p6-i2]", { x: -80, yPercent: -100, ease: "none", scrollTrigger: ST(p6, "right 80%", "right -40%") });
      gsap.to("[data-p7-title]", { color: lit, ease: "power2.out", scrollTrigger: ST(p7, "left 40%", "left left") });
      gsap.to("[data-p7-i1]", { x: -160, ease: "none", scrollTrigger: ST(p7, "left right", "right left") });
      gsap.to("[data-p7-i2]", { x: -200, yPercent: -4, ease: "none", scrollTrigger: ST(p7, "left right", "right left") });
      gsap.fromTo("[data-p8-title]", { opacity: 0 }, { opacity: 1, ease: "power2.out", scrollTrigger: ST(p8, "left 60%", "left 20%") });
      gsap.to("[data-p8-video]", { scale: 0.8, ease: "power2.inOut", scrollTrigger: ST(p8, "right 60%", "right left") });
      gsap.to("[data-p9-i1]", { x: -40, yPercent: -16, ease: "none", scrollTrigger: ST(p9, "left right", "right left") });
      gsap.from("[data-p9-i2]", { x: -10, yPercent: -9, ease: "none", scrollTrigger: ST(p9, "left right", "right left") });
      gsap.to("[data-p9-i3]", { xPercent: -20, yPercent: -24, ease: "none", scrollTrigger: ST(p9, "left right", "right left") });
      gsap.timeline({ scrollTrigger: ST(p9, "left 80%", "left 40%") }).to("[data-p9-title]", { color: lit });
      gsap.timeline({ scrollTrigger: ST(p10, "left 80%", "left 40%") })
        .to("[data-p10-title]", { opacity: 1, ease: "power2.out" })
        .from("[data-p10-links]", { opacity: 0, ease: "power2.out" }, "<0.2");
      gsap.to(p10, { opacity: 0, ease: "none", scrollTrigger: ST(p10, "right 60%", "right left") });
      const reset = () => gsap.set(list, { x: 0 });
      ScrollTrigger.addEventListener("refreshInit", reset);
      return () => ScrollTrigger.removeEventListener("refreshInit", reset);
    });
    mm.add("(max-width: 991px) and (prefers-reduced-motion: no-preference)", () => {
      ScrollTrigger.create({ trigger: wrap, start: "top top", end: "bottom bottom", onUpdate: (s) => setProg(s.progress) });
      const sc = (trigger, start, end) => ({ trigger, start, end, scrub: true });
      gsap.timeline({ scrollTrigger: sc(list[0], "top 90%", "top center") }).fromTo("[data-p1-title]", { opacity: 0 }, { opacity: 1 }, 0).from("[data-p1-sub]", { opacity: 0 }, 0);
      ["[data-p2-title]", "[data-p3-title]", "[data-p5-title]", "[data-p6-title]", "[data-p7-title]", "[data-p9-title]"].forEach((s) => gsap.to(s, { color: lit, ease: "power2.out", scrollTrigger: sc(s, "top 90%", "top center") }));
      [["[data-p2-i1]", -30], ["[data-p2-i2]", 5], ["[data-p2-i3]", -60]].forEach(([s, y]) => gsap.to(s, { yPercent: y, ease: "none", scrollTrigger: sc(s, "top bottom", "bottom top") }));
      gsap.fromTo("[data-p4-visual]", { scale: 1 }, { scale: 0.8, ease: "none", scrollTrigger: sc(list[3], "top top", "bottom top") });
      gsap.fromTo("[data-p8-title]", { opacity: 0 }, { opacity: 1, ease: "power2.out", scrollTrigger: sc(list[7], "top 90%", "top 50%") });
      gsap.timeline({ scrollTrigger: sc(list[9], "top 40%", "bottom bottom") }).fromTo("[data-p10-title]", { opacity: 0 }, { opacity: 1 }, 0).from("[data-p10-links]", { opacity: 0 }, 0);
    });
  };

  document.addEventListener("DOMContentLoaded", () => { trail(); highlight(); panels(); });
})();
