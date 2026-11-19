(() => {
  // Original opening: progress target = easeInOut(min(elapsed time ÷ min seconds, loaded share)), actual progress approaches 10% of that gap each frame (lerp .1).
  // Image = easeInOut (progress): map 1 → zooms in by zoom times, shifts by (enlarged width × x, enlarged height × y), line is 1 − drawing, number is ceil(to × drawing), number group turns on until drawing .2.
  // After progress .7 the map fades out twice as fast and the island illustration turns on. On reaching .99 the text group drops 10px and fades out in .5s, and the panel lifts in out duration (3) sine.inOut — fx:end fires at its .3 point, fx:done when fully lifted
  const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
  kfFx.register("distance-zoom-loader", (el, { options, reduce }) => {
    const part = (n) => el.querySelector(`[data-fx-part="${n}"]`);
    const zoomG = part("zoom"), map = part("map"), island = part("island"), meter = part("meter"), num = part("num");
    const min = +(options.min ?? 4), to = +(options.to ?? 200), zoom = +(options.zoom ?? 14), ox = +(options.x ?? 0), oy = +(options.y ?? 0);
    const lerp = +(options.lerp ?? 0.1), out = +(options.out ?? 3), endAt = +(options["end-at"] ?? 0.3);
    const fire = (name) => el.dispatchEvent(new CustomEvent(name, { bubbles: true }));
    if (reduce) { el.classList.add("is-fx-done"); fire("fx:end"); fire("fx:done"); return () => el.classList.remove("is-fx-done"); }
    let loaded = document.readyState === "complete" ? 1 : 0.6, cur = 0, done = false, raf = 0, tl = null;
    const onLoad = () => (loaded = 1);
    addEventListener("load", onLoad, { once: true });
    // intro — initially the map fades in from transparent over this many (seconds) with sine.out (original 2), 0 means immediate
    const intro = +(options.intro ?? 2);
    if (map && intro) gsap.fromTo(map, { opacity: 0 }, { opacity: 1, duration: intro, ease: "sine.out" });
    const t0 = performance.now();
    const draw = (p) => {
      const e = ease(p);
      if (zoomG) {
        const box = (zoomG.ownerSVGElement || zoomG).viewBox?.baseVal;
        const w = box?.width || 100, h = box?.height || 100, s = 1 + (zoom - 1) * e;
        zoomG.setAttribute("transform", `translate(${((w * s - w) * ox).toFixed(2)} ${((h * s - h) * oy).toFixed(2)}) scale(${s.toFixed(4)})`);
      }
      if (p > 0.7) { const k = (p - 0.7) / 0.3; if (map) map.style.opacity = Math.max(0, 1 - 2 * k); if (island) island.style.opacity = k; }
      el.style.setProperty("--fx-scale", (1 - e).toFixed(4));
      if (meter) { meter.style.opacity = Math.min(e / 0.2, 1); meter.style.setProperty("--fx-move", (1 - e).toFixed(4)); }
      if (num) num.textContent = String(Math.ceil(to * e));
    };
    const finish = () => {
      done = true;
      draw(1);
      const kids = [...el.children].filter((c) => !c.matches('[data-fx-part="map"],[data-fx-part="island"]'));
      tl = gsap.timeline({ delay: 0.5 });
      tl.to(kids, { opacity: 0, y: 10, duration: 0.5, ease: "sine.in" });
      let sent = false;
      const fade = tl.to(el, { opacity: 0, duration: out, ease: "sine.inOut", onUpdate: () => { if (!sent && fade.progress() >= endAt) { sent = true; fire("fx:end"); } }, onComplete: () => { el.classList.add("is-fx-done"); fire("fx:done"); } });
    };
    const step = (now) => {
      const target = ease(Math.min((now - t0) / 1000 / min, loaded));
      cur += (target - cur) * lerp;
      draw(cur);
      if (cur >= 0.99 && !done) { finish(); return; }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => { cancelAnimationFrame(raf); tl?.kill(); if (map) gsap.killTweensOf(map); removeEventListener("load", onLoad); el.classList.remove("is-fx-done"); gsap.set(el, { clearProps: "opacity" }); };
  });
})();
