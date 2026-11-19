// Services — seven steps light up in turn (original services: .4s power3.out, arc .45s, after 6 the upper arc goes back to 2 in .9s), recent work photo window (follows the cursor·tilt)
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();

  /* Process — 1024 and up: once when the section reaches 70% of the screen. Below: numbers past the 60% line of the screen light up and the current number is purple */
  document.querySelectorAll("[data-sv-process]").forEach((grid) => {
    if (reduce) return;
    const phases = [...grid.querySelectorAll(".sv-phase")];
    const loop = grid.dataset.loop?.split(",").map(Number);
    const back = grid.querySelector(".sv-process__loop");
    const parts = phases.map((p) => ({ num: p.querySelector(".sv-phase__num"), label: p.querySelectorAll(".sv-phase__name"), arc: p.querySelector(".sv-phase__arc") }));
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px)", () => {
      const idle = css("--kf-dim"), current = css("--kf-accent"), done = css("--kf-contrast-ink");
      const shut = { clipPath: "inset(-10% 100% -10% 0%)" }, open = { clipPath: "inset(-10% 0% -10% 0%)", ease: "power1.inOut" };
      gsap.set(parts.map((p) => p.num), { color: idle, opacity: 0.35, y: 24 });
      gsap.set(parts.flatMap((p) => [...p.label]), { opacity: 0.35 });
      gsap.set(parts.filter((p) => p.arc).map((p) => p.arc), shut);
      if (back) gsap.set(back, { clipPath: "inset(-10% 0% -10% 100%)" });
      const tl = gsap.timeline({ paused: true, defaults: { duration: 0.4, ease: "power3.out" }, scrollTrigger: { trigger: grid, start: "top 70%", once: true, onEnter: () => tl.play() } });
      parts.forEach((p, i) => {
        tl.to(p.num, { color: current, opacity: 1, y: 0 });
        tl.to(p.label, { opacity: 1 }, "<0.1");
        if (i > 0) tl.to(parts[i - 1].num, { color: done, duration: 0.3 }, "<");
        if (loop && back && i === loop[0] - 1) {
          const target = parts[loop[1] - 1];
          tl.to(back, { ...open, duration: 0.9 }, "+=0.15");
          tl.to(target.num, { color: current, scale: 1.15, duration: 0.2, ease: "power2.out" }, "-=0.1");
          tl.to(target.num, { color: done, scale: 1, duration: 0.45, ease: "back.out(3)" });
        }
        if (p.arc) tl.to(p.arc, { ...open, duration: 0.45 }, `-=${0.4 * 0.4}`);
      });
      tl.to(parts.at(-1).num, { color: done, duration: 0.4 }, "+=0.5");
      return () => gsap.set(parts.flatMap((p) => [p.num, ...p.label, ...(p.arc ? [p.arc] : [])]).concat(back ? [back] : []), { clearProps: "all" });
    });
    mm.add("(max-width: 1023.98px)", () => {
      const ys = () => parts.map((p, i) => phases[i].offsetTop + p.num.offsetTop + p.num.offsetHeight / 2);
      let y = ys();
      const update = () => {
        const line = innerHeight * 0.6 - grid.getBoundingClientRect().top;
        let cur = -1;
        phases.forEach((ph, i) => {
          if (y[i] <= line) cur = i;
          ph.classList.toggle("is-on", y[i] <= line);
          if (y[i + 1] !== undefined) ph.style.setProperty("--fill", gsap.utils.clamp(0, 1, (line - y[i]) / (y[i + 1] - y[i])).toFixed(3));
        });
        phases.forEach((ph, i) => ph.classList.toggle("is-current", i === cur));
      };
      grid.classList.add("is-live");
      update();
      const st = ScrollTrigger.create({ trigger: grid, start: "top bottom", end: "bottom top", onRefresh: () => { y = ys(); update(); }, onUpdate: update });
      return () => { st.kill(); grid.classList.remove("is-live"); phases.forEach((ph) => { ph.classList.remove("is-on", "is-current"); ph.style.removeProperty("--fill"); }); };
    });
  });

  /* Recent work — the photo window follows the cursor at .6s power3, and when the row changes the new photo slot rises from below (the inner image from above at 1.08x) meshing over .6s. 
     Pushing sideways tilts by movement × .4 (±8°) in .12s, and it straightens immediately when you stop. On first entering the list it scales .8 → 1 in .4s, and on leaving it vanishes in .3s scaling to .8 */
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const preview = document.querySelector(".sv-recent__preview");
  if (preview && fine) {
    const wrap = preview.parentElement, rows = wrap.querySelectorAll("[data-preview]"), masks = [...preview.querySelectorAll(".sv-recent__mask")];
    const list = wrap.querySelector(".sv-recent__list");
    const follow = reduce ? 0 : 0.6;
    const xTo = gsap.quickTo(preview, "x", { duration: follow, ease: "power3" }), yTo = gsap.quickTo(preview, "y", { duration: follow, ease: "power3" });
    const rTo = gsap.quickTo(preview, "rotation", { duration: 0.5, ease: "power3" });
    gsap.set(masks, { xPercent: -50, yPercent: -50 });
    let cur = -1, on = false, pt = { x: 0, y: 0 }, lastX = 0, z = 1, rest = 0;
    const place = (now = false) => { const r = wrap.getBoundingClientRect(), x = pt.x - r.left, y = pt.y - r.top; if (now) gsap.set(preview, { x, y }); else { xTo(x); yTo(y); } };
    const show = (i) => {
      if (i === cur || !masks[i]) return;
      cur = i;
      const m = masks[i];
      gsap.set(m, { zIndex: ++z, autoAlpha: 1 });
      if (!reduce) {
        const opt = { duration: 0.6, ease: "power3.out", overwrite: true };
        gsap.fromTo(m, { y: () => m.offsetHeight }, { y: 0, ...opt });
        gsap.fromTo(m.firstElementChild, { y: () => -m.offsetHeight, scale: 1.08 }, { y: 0, scale: 1, ...opt });
      }
      masks.forEach((o) => { if (o !== m) gsap.to(o, { autoAlpha: 0, duration: reduce ? 0 : 0.2, ease: "power1.out", overwrite: true }); });
      if (!on) { on = true; place(true); gsap.fromTo(preview, { autoAlpha: 0, scale: reduce ? 1 : 0.8 }, { autoAlpha: 1, scale: 1, duration: reduce ? 0 : 0.4, ease: "power3.out", overwrite: "auto" }); }
    };
    const hide = () => { if (!on) return; on = false; cur = -1; rTo(0); gsap.to(preview, { autoAlpha: 0, scale: reduce ? 1 : 0.8, duration: reduce ? 0 : 0.3, ease: "power2.in", overwrite: "auto" }); };
    rows.forEach((r) => r.addEventListener("pointerenter", (e) => { pt = { x: e.clientX, y: e.clientY }; lastX = e.clientX; show(Number(r.dataset.preview)); }));
    list.addEventListener("pointermove", (e) => {
      pt = { x: e.clientX, y: e.clientY };
      if (!on) return;
      place();
      if (!reduce) { rTo(gsap.utils.clamp(-8, 8, (e.clientX - lastX) * 0.4)); clearTimeout(rest); rest = setTimeout(() => rTo(0), 120); }
      lastX = e.clientX;
    });
    list.addEventListener("pointerleave", hide);
    addEventListener("scroll", () => { if (on) place(); }, { passive: true });
  }
})();
