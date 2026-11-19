(() => {
  // Several video bands sit side by side horizontally and only the current band is widened. Videos (or images) in the band play in turn, and fade seconds before the end the next one is overlaid and switched on,
  // When a strip’s last item ends, the next strip unfolds. Tapping a folded strip unfolds it (the curve differs when opened by hand)
  kfFx.register("strip-grow-reel", (el, { options, reduce }) => {
    const panels = [...el.querySelectorAll('[data-fx-part="panel"]')];
    if (!panels.length) return;
    const sp = matchMedia("(max-width: 767px)").matches;
    const open = options.open || "92vw";
    const shut = (sp && options["shut-sp"]) || options.shut || "6vw";
    const dur = +(options.dur ?? 1.4);
    const fade = +(options.fade ?? 1);
    const intro = +(options.intro ?? 1.6);
    const autoEase = options.ease || "power2.inOut";
    const handEase = options["hand-ease"] || "power2.out";
    const clipsOf = (p) => [...p.querySelectorAll('[data-fx-part="clip"]')];
    const isVid = (c) => c && c.tagName === "VIDEO";
    const play = (c) => { if (isVid(c)) c.play().catch(() => {}); };
    const stop = (c, rewind) => { if (isVid(c)) { c.pause(); if (rewind) c.currentTime = 0; } };
    el.style.setProperty("--fx-open", open);

    let cur = options.random === "1" ? Math.floor(Math.random() * panels.length) : 0;
    let idx = 0, t0 = performance.now(), running = false, visible = true, before = null;
    panels.forEach((p, i) => {
      p.classList.toggle("is-current", i === cur);
      gsap.set(p, { width: i === cur ? open : shut });
      clipsOf(p).forEach((c, j) => { c.classList.toggle("is-current", i === cur && j === 0); gsap.set(c, { opacity: j === 0 ? 1 : 0 }); });
    });
    if (reduce) { gsap.set(el, { opacity: 1 }); return () => gsap.set([el, ...panels], { clearProps: "opacity,width" }); }
    gsap.to(el, { opacity: 1, duration: intro, ease: "power2.out" });

    const grow = (i, ease, done) => {
      panels.forEach((p, j) => {
        if (j === i) gsap.fromTo(p, { width: shut }, { width: open, duration: dur, ease, overwrite: true, onComplete: () => { p.classList.add("is-current"); done?.(); } });
        else { p.classList.remove("is-current"); gsap.to(p, { width: shut, duration: dur, ease, overwrite: true }); }
      });
    };
    const lengthOf = (c) => (isVid(c) ? c.duration : +(c.dataset.dur || 4));
    const timeOf = (c) => (isVid(c) ? c.currentTime : (performance.now() - t0) / 1000);
    const tick = () => {
      if (!running || !visible) return;
      const list = clipsOf(panels[cur]), c = list[idx];
      if (!c) return;
      const d = lengthOf(c);
      if (!d || d - timeOf(c) >= fade) return;
      c.classList.remove("is-current");
      c.classList.add("is-before");
      before = c;
      idx++;
      if (idx >= list.length) {
        idx = 0;
        stop(c, false);
        cur = (cur + 1) % panels.length;
        grow(cur, autoEase);
      }
      const n = clipsOf(panels[cur])[idx];
      if (!n) return;
      t0 = performance.now();
      gsap.fromTo(n, { opacity: 0 }, {
        opacity: 1, duration: fade, ease: "power4.out", overwrite: true,
        onStart: () => { n.classList.add("is-current"); if (isVid(n)) n.currentTime = 0; play(n); },
        onComplete: () => { if (before && before !== n) { before.classList.remove("is-before"); stop(before, true); } },
      });
    };
    const start = () => { running = true; t0 = performance.now(); play(clipsOf(panels[cur])[idx]); };
    start();
    gsap.ticker.add(tick);

    const byHand = (i) => {
      if (i === cur) return;
      running = false;
      clipsOf(panels[cur]).forEach((c) => stop(c, true));
      cur = i;
      idx = 0;
      panels.forEach((p, j) => {
        if (j === i) return;
        const list = clipsOf(p);
        list.forEach((c) => c.classList.remove("is-current", "is-before"));
        if (list[0]) gsap.to(list[0], { opacity: 1, duration: dur, ease: handEase });
      });
      grow(i, handEase, () => {
        const first = clipsOf(panels[i])[0];
        if (first) { first.classList.add("is-current"); gsap.set(first, { opacity: 1 }); }
        start();
      });
    };
    const clicks = panels.map((p, i) => { const f = () => byHand(i); p.addEventListener("click", f); return f; });
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      const c = clipsOf(panels[cur])[idx];
      if (visible && running) play(c); else stop(c, false);
    });
    io.observe(el);

    return () => {
      gsap.ticker.remove(tick);
      io.disconnect();
      panels.forEach((p, i) => { p.removeEventListener("click", clicks[i]); p.classList.remove("is-current"); clipsOf(p).forEach((c) => { stop(c, true); c.classList.remove("is-current", "is-before"); }); });
      gsap.killTweensOf([el, ...panels, ...panels.flatMap(clipsOf)]);
      gsap.set([el, ...panels, ...panels.flatMap(clipsOf)], { clearProps: "opacity,width" });
    };
  });
})();
