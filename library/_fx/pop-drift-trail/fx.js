// A pop-in card trail that trickles down: over the panel, each time the cursor moves more than 28px after 45ms, one card is placed at the cursor spot at .45x, transparent, tilted ±6.5°
// Pops to 1x and .95 opacity with .22s back.out(1.4), then after .1s drops 25~45px down over .6s power2.in, shrinking to .8x and vanishing. Card images are picked at random from the set, different from the previous one — original site
(() => {
  kfFx.register("pop-drift-trail", (host, { options, reduce, hover }) => {
    const cards = [...host.querySelectorAll('[data-fx-part="item"]')];
    if (!cards.length || reduce || !hover) return;
    const every = +(options.every ?? 45), gap = +(options.gap ?? 28), tilt = +(options.tilt ?? 26);
    const pop = +(options.pop ?? 0.22), drop = +(options.drop ?? 0.6), wait = +(options.wait ?? 0.1);
    const fall = (options.fall || "25,45").split(",").map(Number);
    const box = host.querySelector('[data-fx-part="layer"]') || host;
    let last = 0, lx = 0, ly = 0, prev = -1;
    const live = new Set();
    const spawn = (x, y) => {
      let k;
      do { k = Math.floor(Math.random() * cards.length); } while (k === prev && cards.length > 1);
      prev = k;
      const el = cards[k].cloneNode(true);
      el.removeAttribute("data-fx-part");
      el.classList.add("fx-pdt-card");
      el.setAttribute("aria-hidden", "true");
      box.append(el);
      live.add(el);
      const rot = (Math.random() - 0.5) * tilt, down = fall[0] + Math.random() * (fall[1] - fall[0]);
      gsap.fromTo(el, { left: x, top: y, xPercent: -50, yPercent: -50, scale: 0.45, opacity: 0, rotation: rot * 0.5 },
        { scale: 1, opacity: 0.95, duration: pop, ease: "back.out(1.4)",
          onComplete: () => gsap.to(el, { y: `+=${down}`, opacity: 0, scale: 0.8, duration: drop, ease: "power2.in", delay: wait, onComplete: () => { el.remove(); live.delete(el); } }) });
    };
    const move = (e) => {
      const now = performance.now(), r = host.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      if (now - last > every && Math.hypot(x - lx, y - ly) > gap) { last = now; lx = x; ly = y; spawn(x, y); }
    };
    host.addEventListener("mousemove", move);
    return () => { host.removeEventListener("mousemove", move); live.forEach((el) => { gsap.killTweensOf(el); el.remove(); }); live.clear(); };
  });
})();
