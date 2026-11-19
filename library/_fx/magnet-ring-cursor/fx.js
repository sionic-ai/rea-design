// A 9px dot cursor follows at .35s, and inside a target’s radius it turns into a translucent ring and the two pull toward each other (strength 1.5 · spring .25). Pressing and dragging a panel gives a small ring with left and right arrows
(() => {
  const ring = (R, r) => `M50,${50 - R}A${R},${R} 0 1,1 49.99,${50 - R}Z M50,${50 - r}A${r},${r} 0 1,0 50.01,${50 - r}Z`;
  const SHAPE = { dot: "M50,45.5A4.5,4.5 0 1,1 49.99,45.5Z M50,50A0.01,0.01 0 1,0 50.01,50Z", medium: ring(30, 26), large: ring(42, 38), drag: ring(18, 15.6) };
  const SCALE = { dot: 1, medium: 30 / 4.5, large: 42 / 4.5, drag: 18 / 4.5 };
  kfFx.register("magnet-ring-cursor", (el, { options, reduce, hover }) => {
    if (!hover || !window.gsap) return;
    const range = +(options.range ?? 100), strength = +(options.strength ?? 1.5) || 1.5, spring = +(options.spring ?? 0.25);
    const follow = +(options.follow ?? 0.35), pull = +(options.pull ?? 0.5), ease = kfFx.ease(options.ease || "0.19,1,0.22,1", "expo.out");
    const morph = !!(window.MorphSVGPlugin && gsap.plugins && gsap.plugins.morphSVG);
    const ns = "http://www.w3.org/2000/svg";
    const cur = document.createElement("div");
    cur.className = "fx-magnet-cursor";
    cur.setAttribute("aria-hidden", "true");
    cur.innerHTML = `<svg viewBox="0 0 100 100"><path class="fx-magnet-shape" d="${SHAPE.dot}"/><g class="fx-magnet-arrows"><polygon points="24,46.1 22.9,45 17.9,50 22.9,55 24,53.9 20.1,50"/><polygon points="76,53.9 77.1,55 82.1,50 77.1,45 76,46.1 79.9,50"/></g></svg>`;
    document.body.appendChild(cur);
    const shape = cur.querySelector(".fx-magnet-shape"), arrows = cur.querySelector(".fx-magnet-arrows");
    const [aL, aR] = arrows.querySelectorAll("polygon");
    gsap.set(cur, { x: -200, y: -200 });
    const to = (kind, fill, dur) => {
      if (morph) gsap.to(shape, { morphSVG: SHAPE[kind], fillOpacity: fill, duration: reduce ? 0 : dur, ease });
      else gsap.to(shape, { scale: SCALE[kind] * (kind === "dot" ? 1 : 0.999), transformOrigin: "50% 50%", fillOpacity: fill, duration: reduce ? 0 : dur, ease });
    };
    let grab = false, inside = null;
    const ac = new AbortController(), sig = { signal: ac.signal };
    const targets = () => el.querySelectorAll('[data-fx-part="target"]');
    const move = (e) => {
      const x = e.clientX, y = e.clientY;
      gsap.to(cur, { x, y, duration: reduce ? 0 : follow, ease, overwrite: "auto" });
      if (grab) return;
      let hit = null;
      for (const t of targets()) {
        const b = t.getBoundingClientRect();
        if (!b.width) continue;
        const r = +t.getAttribute("data-range") || range;
        const a = x - (b.left + b.width / 2), l = y - (b.top + b.height / 2), h = Math.hypot(a, l);
        if (h >= r) continue;
        const u = (h / r) * spring, c = ((a * h) / (r * strength)) * (1 - u), d = ((l * h) / (r * strength)) * (1 - u);
        gsap.to(cur, { x: x - c, y: y - d, duration: reduce ? 0 : follow, ease, overwrite: "auto" });
        gsap.to(t, { x: c, y: d, duration: reduce ? 0 : pull, ease, overwrite: "auto" });
        hit = t;
        if (inside !== t) to(t.getAttribute("data-shape") === "large" ? "large" : "medium", 0.1, follow / 2);
        break;
      }
      if (inside && inside !== hit) gsap.to(inside, { x: 0, y: 0, duration: reduce ? 0 : pull, ease, clearProps: "transform", overwrite: "auto" });
      if (!hit && inside) to("dot", 1, follow / 2);
      inside = hit;
    };
    const down = (e) => {
      if (e.button !== 0 || inside || options.drag !== "on") return;
      grab = true;
      el.classList.add("is-grabbing");
      gsap.fromTo(aL, { x: 10 }, { x: 0, duration: follow });
      gsap.fromTo(aR, { x: -10 }, { x: 0, duration: follow });
      to("drag", 1, follow);
      gsap.to(arrows, { autoAlpha: 1, duration: follow });
    };
    const up = () => {
      if (!grab) return;
      grab = false;
      el.classList.remove("is-grabbing");
      to("dot", 1, follow);
      gsap.to(arrows, { autoAlpha: 0, duration: follow / 2 });
    };
    const leave = () => { to("dot", 0, follow / 2); targets().forEach((t) => gsap.to(t, { x: 0, y: 0, duration: pull, ease, clearProps: "transform" })); inside = null; };
    const enter = () => gsap.to(shape, { fillOpacity: 1, duration: follow / 2 });
    el.addEventListener("pointermove", move, sig);
    el.addEventListener("pointerdown", down, sig);
    addEventListener("pointerup", up, sig);
    el.addEventListener("pointerleave", leave, sig);
    el.addEventListener("pointerenter", enter, sig);
    el.classList.add("fx-magnet-on");
    return () => {
      ac.abort();
      gsap.killTweensOf([cur, shape, arrows]);
      targets().forEach((t) => gsap.set(t, { clearProps: "transform" }));
      cur.remove();
      el.classList.remove("fx-magnet-on", "is-grabbing");
    };
  });
})();
