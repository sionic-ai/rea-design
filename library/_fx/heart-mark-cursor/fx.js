(() => {
  // Instead of the system cursor, a 16px heart outline — follows the mouse with exponential easing at 14 per second, links, buttons, [data-fx-part=Over pet]
  // Grows to 1.25x over .16s and fills with the accent color. .85x while pressed. When stepping onto the pet or pressing it, starts from 18px above that spot
  // Small hearts (up to five) bloom from .4 to .85~1.15x over .18s, float up 30~40px (±9px sideways) over 1.05s, and fade out over .55s starting at .5s
  const PATH = "M12 20.4 4.9 13.6A4.9 4.9 0 0 1 3.2 9.9 4.7 4.7 0 0 1 7.9 5.2c1.7 0 3.1.8 4.1 2.1 1-1.3 2.4-2.1 4.1-2.1a4.7 4.7 0 0 1 4.7 4.7c0 1.4-.6 2.8-1.7 3.7Z";
  const svg = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${PATH}"/></svg>`;
  kfFx.register("heart-mark-cursor", (el, { options, reduce, hover }) => {
    if (reduce || !hover || !window.gsap) return;
    const press = kfFx.ease("0.2,0.8,0.2,1", "power3.out"), settle = kfFx.ease("0.16,1,0.3,1", "expo.out");
    const lag = +(options.lag ?? 14), hotScale = +(options.hot ?? 1.25), downScale = +(options.down ?? 0.85), max = Math.max(1, +options.drops || 5);
    const layer = document.createElement("div");
    layer.className = "fx-heart-mark-cursor__layer";
    layer.setAttribute("aria-hidden", "true");
    layer.innerHTML = `<div class="fx-heart-mark-cursor__mark">${svg}</div>` + Array.from({ length: max }, () => `<div class="fx-heart-mark-cursor__drop">${svg}</div>`).join("");
    document.body.append(layer);
    document.documentElement.classList.add("fx-heart-mark-cursor-on");
    const mark = layer.querySelector(".fx-heart-mark-cursor__mark");
    const drops = [...layer.querySelectorAll(".fx-heart-mark-cursor__drop")], busy = drops.map(() => false);
    let tx = -100, ty = -100, x = -100, y = -100, hot = false, down = false, onPet = null, last = performance.now(), raf = 0;
    const isHot = (t) => !!t?.closest?.("a, button, [role=button], [data-fx-part=pet]");
    const drop = (px, py) => {
      const i = busy.indexOf(false);
      if (i < 0) return;
      busy[i] = true;
      const d = drops[i], rise = 30 + 10 * Math.random(), side = (Math.random() - 0.5) * 18, sc = 0.85 + 0.3 * Math.random();
      gsap.killTweensOf(d);
      gsap.set(d, { x: px, y: py, xPercent: -50, yPercent: -50, opacity: 0, scale: 0.4 });
      gsap.timeline({ onComplete: () => { busy[i] = false; } })
        .to(d, { opacity: 1, scale: sc, duration: 0.18, ease: press }, 0)
        .to(d, { y: py - rise, x: px + side, duration: 1.05, ease: settle }, 0)
        .to(d, { opacity: 0, duration: 0.55, ease: "power1.in" }, 0.5);
    };
    const over = (e) => {
      hot = isHot(e.target);
      const pet = e.target.closest?.("[data-fx-part=pet]");
      if (pet && el.contains(pet) && pet !== onPet) drop(e.clientX, e.clientY - 18);
      onPet = pet && el.contains(pet) ? pet : null;
    };
    const move = (e) => { tx = e.clientX; ty = e.clientY; };
    const press_ = (e) => { move(e); down = true; const pet = e.target.closest?.("[data-fx-part=pet]"); if (pet && el.contains(pet)) drop(e.clientX, e.clientY - 18); };
    const up = () => { down = false; };
    addEventListener("pointerover", over, { passive: true });
    addEventListener("pointermove", move, { passive: true });
    addEventListener("pointerdown", press_, { passive: true });
    addEventListener("pointerup", up, { passive: true });
    let wasHot = null;
    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000)); last = now;
      const f = 1 - Math.exp(-lag * dt);
      x += (tx - x) * f; y += (ty - y) * f;
      if (hot !== wasHot) { wasHot = hot; mark.classList.toggle("is-hot", hot); }
      mark.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(${(hot ? hotScale : 1) * (down ? downScale : 1)})`;
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("pointerover", over); removeEventListener("pointermove", move); removeEventListener("pointerdown", press_); removeEventListener("pointerup", up);
      drops.forEach((d) => gsap.killTweensOf(d));
      layer.remove();
      if (!document.querySelector(".fx-heart-mark-cursor__layer")) document.documentElement.classList.remove("fx-heart-mark-cursor-on");
    };
  });
})();
