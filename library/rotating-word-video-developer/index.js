// Hero rotating word (2.75s tempo) and value slideshow (10s bar) — original initRotatingText · initSlideshow numbers as is
(() => {
  // Bar fill: the current cell goes 0→100% over the tempo via rAF, earlier cells are full, later cells empty. When skipping forward the current cell is filled in 200ms.
  const progress = (bars, fillSel, ms, onEnd) => {
    let raf = 0, t0 = 0, cur = 0, done = 0;
    const width = (i, v) => { const f = bars[i]?.querySelector(fillSel); if (f) f.style.width = v + "%"; };
    const mark = (i) => bars.forEach((b, j) => { b.classList.remove("active", "completed"); if (j < i) b.classList.add("completed"); if (j === i) b.classList.add("active"); });
    const finish = (i, from, ms2) => { const s = performance.now(); const step = (now) => { const k = Math.min((now - s) / ms2, 1); width(i, 100 * (from + (1 - from) * k)); if (k < 1) requestAnimationFrame(step); }; requestAnimationFrame(step); };
    const run = () => { cancelAnimationFrame(raf); t0 = performance.now(); const step = (now) => { done = Math.min((now - t0) / ms, 1); width(cur, 100 * done); done < 1 ? (raf = requestAnimationFrame(step)) : onEnd(); }; raf = requestAnimationFrame(step); };
    return {
      go(i) { cancelAnimationFrame(raf); if (i > cur) finish(cur, done, 200); bars.forEach((b, j) => { if (j < i) width(j, 100); if (j > i) width(j, 0); }); cur = i; done = 0; mark(i); run(); },
      get cur() { return cur; },
      stop() { cancelAnimationFrame(raf); },
    };
  };

  window.RH && RH.page("home", {
    kind: "home",
    init(root) {
      const offs = [];
      // Rotating word: old word -160% and -8° (.7s power2.in), new word 150% and 12° → 0 (1.1s premium, after .58s), cell width 1.2s premium
      root.querySelectorAll("[data-rotating-title]").forEach((title) => {
        const wrap = title.closest("[data-rotating-wrap]"), slot = wrap.querySelector("[data-rotating-words]");
        const words = [...wrap.querySelectorAll("[data-rotating-word]")].map((w) => w.getAttribute("data-rotating-word")).filter(Boolean);
        if (!slot || !words.length) return;
        const step = parseFloat(title.getAttribute("data-step-duration") || "2.75");
        const bars = [...wrap.querySelectorAll("[data-rotating-progress]")];
        const inner = document.createElement("span");
        inner.className = "rotating-text__inner";
        const els = words.map((w) => { const e = document.createElement("span"); e.className = "rotating-text__word"; e.textContent = w; inner.appendChild(e); return e; });
        const sizer = document.createElement("span"); sizer.className = "rotating-text__sizer"; sizer.textContent = "A"; sizer.setAttribute("aria-hidden", "true"); inner.appendChild(sizer);
        slot.textContent = ""; slot.appendChild(inner);
        const outD = 0.7, inD = 1.1, overlap = 0.12, rotIn = 12, rotOut = -8;
        let widths = els.map((e) => e.getBoundingClientRect().width);
        gsap.set(els, { yPercent: 150, rotation: rotIn, autoAlpha: 0, transformOrigin: "0% 100%" });
        gsap.set(els[0], { yPercent: 0, rotation: 0, autoAlpha: 1 });
        inner.style.width = widths[0] + "px";
        let shown = 0;
        const swap = (to) => {
          const a = els[shown], b = els[to];
          gsap.killTweensOf([inner, a, b]);
          gsap.to(inner, { width: widths[to], duration: 1.2, ease: "premium" });
          if (a && a !== b) gsap.to(a, { yPercent: -160, rotation: rotOut, autoAlpha: 0, duration: outD, ease: "power2.in" });
          gsap.fromTo(b, { yPercent: 150, rotation: rotIn, autoAlpha: 0 }, { yPercent: 0, rotation: 0, autoAlpha: 1, duration: inD, ease: "premium", delay: outD - overlap });
          shown = to;
        };
        const bar = progress(bars, "[data-rotating-fill]", step * 1000, () => go((bar.cur + 1) % els.length));
        const go = (i) => { if (i !== shown) swap(i); bar.go(i); };
        bars.forEach((b, i) => b.addEventListener("click", () => i !== bar.cur && go(i)));
        if (RH.reduced) { bar.stop(); return; }
        bar.go(0);
        const ro = new ResizeObserver(() => { widths = els.map((e) => e.getBoundingClientRect().width); inner.style.width = widths[shown] + "px"; });
        ro.observe(title);
        offs.push(() => { bar.stop(); ro.disconnect(); gsap.killTweensOf([inner, ...els]); });
      });

      // Value slides: start when in view, and when the 10s bar fills the next panel comes in. Panel title and description lines rise from 110% over 1.1s (.11 stagger, description .15s later)
      root.querySelectorAll("[data-slideshow-wrap]").forEach((wrap) => {
        const slides = [...wrap.querySelectorAll("[data-slideshow-slide]")], bars = [...wrap.querySelectorAll("[data-slideshow-progress]")];
        if (!slides.length || !bars.length) return;
        const ms = parseFloat(wrap.getAttribute("data-slideshow-slide-duration")) || 8000;
        const cache = new Map();
        const parts = (s) => {
          if (cache.has(s)) return cache.get(s);
          const split = (el) => { if (!el) return null; gsap.set(el, { visibility: "visible" }); const sp = SplitText.create(el, { type: "lines", mask: "lines", linesClass: "line" }); gsap.set(sp.lines, { yPercent: 110, autoAlpha: 0 }); return sp; };
          const v = [split(s.querySelector("[data-slideshow-heading]")), split(s.querySelector("[data-slideshow-description]"))].filter(Boolean);
          cache.set(s, v); return v;
        };
        const show = (s, on) => {
          const ps = on ? parts(s) : cache.get(s);
          if (!ps) return;
          ps.forEach((sp, i) => { gsap.killTweensOf(sp.lines); if (!on) gsap.set(sp.lines, { yPercent: 110, autoAlpha: 0 }); else if (RH.reduced) gsap.set(sp.lines, { yPercent: 0, autoAlpha: 1 }); else gsap.to(sp.lines, { yPercent: 0, autoAlpha: 1, duration: 1.1, stagger: 0.11, ease: "premium", delay: 0.15 * i }); });
        };
        const pick = (i) => slides.forEach((s, j) => { s.classList.toggle("active", j === i); show(s, j === i); });
        const bar = progress(bars, "[data-slideshow-fill]", ms, () => go((bar.cur + 1) % slides.length));
        const go = (i) => { pick(i); bar.go(i); };
        bars.forEach((b, i) => b.addEventListener("click", () => i !== bar.cur && go(i)));
        wrap.querySelector('[data-slideshow-btn="prev"]')?.addEventListener("click", () => go((bar.cur - 1 + slides.length) % slides.length));
        wrap.querySelector('[data-slideshow-btn="next"]')?.addEventListener("click", () => go((bar.cur + 1) % slides.length));
        slides[0].classList.add("active");
        ScrollTrigger.create({ trigger: wrap, start: "top bottom", once: true, onEnter: () => go(0) });
        offs.push(() => bar.stop());
      });
      return () => offs.forEach((f) => f());
    },
  });
})();
