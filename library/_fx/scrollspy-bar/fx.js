(() => {
  // Current range = The last section after the head passes the ‹line› height. For an inner scroll panel, measured by that panel’s height
  kfFx.register("scrollspy-bar", (el, { options, reduce, scroller }) => {
    const links = [...el.querySelectorAll("a[href^='#']")];
    if (!links.length) return;
    const secs = links.map((a) => document.getElementById(decodeURIComponent(a.getAttribute("href").slice(1))));
    const axis = options.axis || (links[1] && links[1].offsetTop > links[0].offsetTop + 2 ? "y" : "x");
    el.classList.add(`fx-axis-${axis}`);
    const beat = 60 / (+options.bpm || 142), line = (options.line ? +options.line : axis === "y" ? 45 : 50) / 100;
    const ease = kfFx.ease(options.ease || (axis === "y" ? "0.16,1,0.3,1" : "0.55,0,0.1,1"), axis === "y" ? "expo.out" : "power3.inOut");
    const marker = el.querySelector('[data-fx-part="marker"]'), labels = el.querySelector('[data-fx-part="labels"]'), prog = el.querySelector('[data-fx-part="progress"]');
    // look: pill — the marker becomes a pill panel behind the link. Before the first segment there is no current cell, so the pill shrinks to a dot and vanishes.
    // When moving, position .6s (0.215,0.61,0.355,1) · width .6s (0.645,0.045,0.355,1) · height .2s, when disappearing it switches to width .2s · height .6s (a site header bar)
    const pill = /\bpill\b/.test(options.look || "");
    const pillMove = kfFx.ease(options["move-ease"] || "0.215,0.61,0.355,1", "power2.out"), pillWide = kfFx.ease(options["wide-ease"] || "0.645,0.045,0.355,1", "power2.inOut");
    const pillDur = +(options.dur ?? 0.6);
    // Centering is GSAP’s job — a CSS translate gets folded into transform when GSAP writes x, and disappears
    if (pill && marker) gsap.set(marker, { xPercent: -50, yPercent: -50 });
    let cur = -2;
    const goPill = (i, now) => {
      const d = now || reduce ? 0 : pillDur;
      if (!marker) return;
      if (i < 0) {
        gsap.to(marker, { width: marker.offsetHeight, duration: d / 3, ease: pillMove, overwrite: "auto" });
        gsap.to(marker, { height: 0, duration: d, ease: pillWide, overwrite: "auto" });
        gsap.to(marker, { opacity: 0, duration: (d * 2) / 3, ease: "sine.out", overwrite: "auto" });
        return;
      }
      const a = links[i];
      const show = gsap.getProperty(marker, "opacity") < 0.5;
      if (show) gsap.set(marker, { x: a.offsetLeft + a.offsetWidth / 2, width: 0 });
      gsap.to(marker, { x: a.offsetLeft + a.offsetWidth / 2, duration: d, ease: pillMove, overwrite: "auto" });
      gsap.to(marker, { width: a.offsetWidth, duration: d, ease: pillWide, overwrite: "auto" });
      gsap.to(marker, { height: a.offsetHeight, duration: d / 3, ease: pillMove, overwrite: "auto" });
      gsap.to(marker, { opacity: 1, duration: (d * 2) / 3, ease: "sine.out", overwrite: "auto" });
    };
    const go = (i, now) => {
      if (i === cur) return;
      cur = i;
      links.forEach((a, k) => a.setAttribute("aria-current", String(k === i)));
      if (pill) return goPill(i, now);
      const d = now || reduce ? 0 : beat;
      if (marker) gsap.to(marker, axis === "y" ? { y: links[i].offsetTop, duration: d, ease, overwrite: true } : { x: links[i].offsetLeft, scaleX: links[i].offsetWidth / 100, duration: d, ease, overwrite: true });
      if (labels) gsap.to(labels, { "--i": i, duration: d, ease, overwrite: true });
    };
    const pick = (st) => {
      const top = scroller ? scroller.getBoundingClientRect().top : 0, h = scroller ? scroller.clientHeight : innerHeight;
      let i = pill ? -1 : 0;
      secs.forEach((s, k) => s && s.getBoundingClientRect().top - top <= h * line && (i = k));
      go(i, cur === -2);
      if (prog && st) prog.style.setProperty("--read", st.progress.toFixed(4));
    };
    const fx = gsap.context(() => { ScrollTrigger.create({ scroller, start: 0, end: "max", onUpdate: pick, onRefresh: pick }); });
    pick();
    return () => { fx.revert(); if (marker) gsap.killTweensOf(marker); links.forEach((a) => a.removeAttribute("aria-current")); el.classList.remove(`fx-axis-${axis}`); };
  });
})();
