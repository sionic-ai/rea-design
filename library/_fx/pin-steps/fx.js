(() => {
  // The timeline is laid out as 0~100 and scroll progress is used directly as time — easy to slot different effects between steps using the same ruler
  kfFx.register("pin-steps", (el, { options, reduce, hover, scroller }) => {
    const ac = new AbortController(), signal = ac.signal;
    const fxCtx = gsap.context(() => {
      gsap.registerPlugin(ScrollTrigger, SplitText);
      if (options.length) el.style.setProperty("--fx-length", options.length + "vh");
      const io = kfFx.ease("0.65,0,0.15,1", "power3.inOut");
      const titles = [...el.querySelectorAll("[data-fx-part=title]")], bodies = [...el.querySelectorAll("[data-fx-part=body]")], gotos = [...el.querySelectorAll("[data-fx-part=goto]")], ind = el.querySelector("[data-fx-part=indicator]");
      const n = titles.length;
      if (n < 2) return;
      [titles, bodies].forEach((g) => g[0] && g[0].parentElement.classList.add("fx-stack"));
      const AT = options.at ? options.at.split(",").map(Number) : Array.from({ length: n - 1 }, (_, k) => ((k + 1) * 100) / n);
      const stepOf = (t) => AT.filter((a) => t >= a).length;
      const chars = titles.map((t) => SplitText.create(t, { type: "words,chars", mask: "chars" }).chars);
      gsap.set(titles, { visibility: "visible" });
      chars.forEach((c, i) => gsap.set(c, { yPercent: i === 0 ? 0 : 110 }));
      gsap.set(bodies, { autoAlpha: (i) => (i === 0 ? 1 : 0) });
      if (ind) gsap.set(ind, { width: `${100 / n}%` });
      const tl = gsap.timeline({ paused: true, defaults: { ease: "none" } });
      AT.forEach((at, a) => {
        const b = a + 1;
        tl.to(chars[a], { yPercent: -110, duration: 3, stagger: 0.18, ease: io }, at)
          .fromTo(chars[b], { yPercent: 110 }, { yPercent: 0, duration: 3, stagger: 0.18, ease: io }, at + 1.2);
        if (bodies[a]) tl.to(bodies[a], { autoAlpha: 0, y: -8, duration: 1.5, ease: io }, at);
        if (bodies[b]) tl.fromTo(bodies[b], { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 2, ease: io }, at + 1.5);
        if (ind) tl.to(ind, { xPercent: 100 * b, duration: 3, ease: io }, at);
      });
      tl.set({}, {}, 100);
      let shown = -1;
      const mark = () => { const s = stepOf(tl.time()); if (s === shown) return; shown = s; gotos.forEach((g, i) => (i === s ? g.setAttribute("aria-current", "step") : g.removeAttribute("aria-current"))); };
      const snapTo = (p) => { const s = stepOf(p * 100); return s === 0 ? 0 : AT[s - 1] + 3.2; };
      const st = ScrollTrigger.create({ scroller, trigger: el, start: "top top", end: "bottom bottom", onUpdate: (s) => { tl.time(reduce ? snapTo(s.progress) : s.progress * 100); mark(); } });
      tl.time(0); mark();
      const edges = [0, ...AT, 100];
      gotos.forEach((g) => g.addEventListener("click", () => {
        const k = +g.dataset.goto, y = st.start + ((edges[k] + edges[k + 1]) / 200) * (st.end - st.start);
        const box = scroller || window, now = scroller ? scroller.scrollTop : scrollY;
        if (reduce) return box.scrollTo(0, y);
        const p = { y: now };
        gsap.to(p, { y, duration: 1.4, ease: io, onUpdate: () => box.scrollTo(0, p.y) });
      }, { signal }));
    }, el);
    return () => { ac.abort(); fxCtx.revert(); };
  });
})();
