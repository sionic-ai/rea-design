(() => {
  // The original (evidence panel) lights the panel with a flashlight circle that follows the screen-ratio mouse position by .1 each frame — outside the circle is darkness .7.
  // Hovering the evidence narrows the circle from 7 → 5 (.75s power3.out, 1s power2.out on release), and every 10~20s the bulb flickers for .35/.9s.
  kfFx.register("flashlight-reveal", (el, { options, reduce, hover }) => {
    let veil = el.querySelector(':scope > [data-fx-part="veil"]');
    const made = !veil;
    if (made) { veil = document.createElement("div"); veil.setAttribute("data-fx-part", "veil"); el.prepend(veil); }
    const lerp = +(options.lerp ?? 0.1);
    const radius = +(options.radius ?? 0.3), soft = +(options.soft ?? 0.375);
    const shrink = +(options.shrink ?? 5 / 7);
    const dark = +(options.dark ?? 0.7);
    const rough = (n) => `rough({ template: none.in, strength: 2, points: ${n}, taper: none, randomize: true, clamp: true })`;
    const s = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5, k: 1, flash: 1 };
    const paint = () => {
      const r = el.getBoundingClientRect();
      const side = Math.min(r.width, r.height) || 1;
      veil.style.setProperty("--fx-x", `${(s.x * 100).toFixed(2)}%`);
      veil.style.setProperty("--fx-y", `${(s.y * 100).toFixed(2)}%`);
      veil.style.setProperty("--fx-r", `${radius * side}px`);
      veil.style.setProperty("--fx-soft", `${soft * side}px`);
      veil.style.setProperty("--fx-k", s.k.toFixed(4));
      veil.style.setProperty("--fx-hole", `color-mix(in srgb, currentColor ${((1 - s.flash) * 100).toFixed(1)}%, transparent)`);
      veil.style.setProperty("--fx-dark", dark);
    };
    if (reduce) { paint(); return () => { if (made) veil.remove(); }; }

    const move = (e) => {
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) return;
      s.tx = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
      s.ty = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
    };
    const tick = () => {
      s.x += (s.tx - s.x) * lerp;
      s.y += (s.ty - s.y) * lerp;
      paint();
    };
    // Hovering the evidence (spot) narrows the circle — same original curve
    const enter = (e) => { if (e.target.closest?.('[data-fx-part="spot"]') && !e.target.closest('[data-fx-part="spot"]').contains(e.relatedTarget)) gsap.to(s, { k: shrink, duration: 0.75, ease: "power3.out", overwrite: "auto" }); };
    const leave = (e) => { const spot = e.target.closest?.('[data-fx-part="spot"]'); if (spot && !spot.contains(e.relatedTarget)) gsap.to(s, { k: 1, duration: 1, ease: "power2.out", overwrite: "auto" }); };
    if (hover) {
      addEventListener("pointermove", move, { passive: true });
      el.addEventListener("pointerover", enter);
      el.addEventListener("pointerout", leave);
    }
    gsap.ticker.add(tick);

    let call, tw;
    const flickerOn = options.flicker !== "off";
    const next = () => { call = gsap.delayedCall(gsap.utils.random(+(options.min ?? 10), +(options.max ?? 20)), flicker); };
    const flicker = () => {
      tw?.kill();
      const long = Math.random() > 0.5;
      tw = gsap.fromTo(s, { flash: 0.25 }, { flash: 1, duration: long ? 0.9 : 0.35, ease: rough(10), onComplete: next });
    };
    // On turning on — an unlit flashlight comes in over .5s with rough (15 points)
    if (options.intro !== "off") tw = gsap.fromTo(s, { flash: 0 }, { flash: 1, duration: +(options.dur ?? 0.5), delay: +(options.delay ?? 0), ease: rough(15), onComplete: () => flickerOn && next() });
    else if (flickerOn) next();

    return () => {
      gsap.ticker.remove(tick);
      call?.kill(); tw?.kill(); gsap.killTweensOf(s);
      removeEventListener("pointermove", move);
      el.removeEventListener("pointerover", enter);
      el.removeEventListener("pointerout", leave);
      if (made) veil.remove();
      else ["--fx-x", "--fx-y", "--fx-r", "--fx-soft", "--fx-k", "--fx-hole", "--fx-dark"].forEach((p) => veil.style.removeProperty(p));
    };
  });
})();
