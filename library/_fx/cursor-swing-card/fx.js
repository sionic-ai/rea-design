// The photo card follows the cursor late and tilts by horizontal speed, switching to the next photo at every set distance
(() => {
  kfFx.register("cursor-swing-card", (el, { options, reduce, scroller }) => {
    const card = el.querySelector('[data-fx-part="card"]');
    const media = card?.querySelector('[data-fx-part="media"]');
    if (reduce || !card || !media || !matchMedia("(hover: hover) and (min-width: 1024px)").matches) return;
    const imgs = [...media.querySelectorAll('[data-fx-part="img"]')];
    const every = +(options.every || 300), tilt = +(options.tilt || 4), shift = +(options.shift ?? 8), settle = +(options.settle ?? 66);
    gsap.set(card, { translate: "none", xPercent: -50, yPercent: -50 });
    gsap.set(media, { scale: 1.2 });
    const qx = gsap.quickTo(card, "x", { duration: 1, ease: "power4" });
    const qy = gsap.quickTo(card, "y", { duration: 1, ease: "power4" });
    const qr = gsap.quickTo(card, "rotation", { duration: 1, ease: "power4" });
    const mx = gsap.quickTo(media, "xPercent", { duration: 0.6, ease: "power2" });
    const my = gsap.quickTo(media, "yPercent", { duration: 0.7, ease: "power2" });
    let last = { x: 0, y: 0 }, travel = 0, n = 1, timer = 0;
    const show = (i) => imgs.forEach((im, k) => { im.style.visibility = k === i ? "visible" : "hidden"; });
    if (imgs.length) show(0);
    const move = (e) => {
      const x = e.clientX, y = e.clientY, dx = (x - last.x) / 2, dy = (y - last.y) / 2;
      qr((x - last.x) / tilt); qx(x - innerWidth / 2); qy(y - innerHeight / 2);
      mx(-gsap.utils.clamp(-shift, shift, dx)); my(-gsap.utils.clamp(-shift, shift, dy));
      last = { x, y };
      travel += Math.abs(dx) + Math.abs(dy);
      if (travel > every && imgs.length) { travel = 0; show(n % imgs.length); n++; }
      clearTimeout(timer);
      timer = setTimeout(() => { qr(0); mx(0); my(0); }, settle);
    };
    // Listens only while the section is on screen — so hidden cards don’t join in another section’s interaction
    let on = false;
    const listen = (yes) => { if (yes === on) return; on = yes; if (yes) addEventListener("mousemove", move); else removeEventListener("mousemove", move); };
    const st = ScrollTrigger.create({ trigger: el, scroller, start: "top bottom", end: "bottom top",
      onToggle: (s) => listen(s.isActive),
      onUpdate: (s) => gsap.set(card, { opacity: gsap.utils.clamp(0, 1, (s.progress - 0.05) / 0.25) }) });
    listen(st.isActive);
    return () => {
      listen(false);
      clearTimeout(timer);
      st.kill();
      gsap.set([card, media], { clearProps: "all" });
      imgs.forEach((im) => { im.style.visibility = ""; });
    };
  });
})();
