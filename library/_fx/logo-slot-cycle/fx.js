(() => {
  // Several logo cells share one logo set and take turns changing — one per cell, never picking a logo currently showing in another cell
  // Each cell starts .2s later, rises from blur and from below (.55s), holds (the rest of the 3s cycle), then blurs upward and leaves before the next logo arrives
  kfFx.register("logo-slot-cycle", (el, { options, reduce }) => {
    const slots = [...el.querySelectorAll('[data-fx-part="slot"]')];
    const pool = [...el.querySelectorAll('[data-fx-part="logo"]')];
    if (!slots.length || !pool.length) return;
    const cycle = +options.cycle || 3, each = +(options.each ?? 0.2), fin = +(options.in ?? 0.55), fout = +(options.out ?? 0.4);
    const pause = +(options.pause ?? 0), ease = options.ease || "power1.out", blurIn = +(options.blur ?? 8);
    const hold = Math.max(0, cycle - fin - fout);
    const shown = slots.map(() => null);
    const free = pool.slice().sort(() => Math.random() - 0.5);
    const pick = (i) => {
      if (shown[i]) free.push(shown[i]);
      const k = Math.floor(Math.random() * Math.ceil(free.length / 3));
      shown[i] = free.splice(k, 1)[0] || shown[i];
      return shown[i];
    };
    const fill = (slot, logo) => { slot.replaceChildren(logo.cloneNode(true)); slot.firstElementChild?.removeAttribute("data-fx-part"); };
    if (reduce) { slots.forEach((s, i) => { fill(s, pick(i)); gsap.set(s, { opacity: 1 }); }); return () => slots.forEach((s) => s.replaceChildren()); }
    const calls = [];
    const show = (slot, i) => {
      if (!slot.isConnected) return;
      fill(slot, pick(i));
      gsap.fromTo(slot, { opacity: 0, y: 10, filter: `blur(${blurIn}px)` }, {
        opacity: 1, y: 0, filter: "blur(0px)", duration: fin, ease,
        onComplete: () => calls.push(gsap.delayedCall(hold + pause, () => gsap.to(slot, {
          opacity: 0, y: -10, filter: `blur(${blurIn * 0.75}px)`, duration: fout, ease, onComplete: () => show(slot, i),
        }))),
      });
    };
    let started = false;
    const io = new IntersectionObserver((en) => {
      if (started || !en.some((e) => e.isIntersecting)) return;
      started = true;
      io.disconnect();
      slots.forEach((s, i) => calls.push(gsap.delayedCall(i * each, () => show(s, i))));
    }, { rootMargin: "200px 0px" });
    io.observe(el);
    return () => {
      io.disconnect();
      calls.forEach((c) => c.kill());
      gsap.killTweensOf(slots);
      slots.forEach((s) => { s.replaceChildren(); gsap.set(s, { clearProps: "all" }); });
    };
  });
})();
