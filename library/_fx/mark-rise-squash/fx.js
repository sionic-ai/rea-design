(() => {
  kfFx.register("mark-rise-squash", (el, { options, reduce, hover, scroller }) => {
    const chs = [...el.querySelectorAll('[data-fx-part="ch"]')], pop = el.querySelector('[data-fx-part="pop"]');
    const parts = pop ? [...chs, pop] : chs;
    if (!parts.length) return;
    if (reduce) { el.classList.add("fx-open"); return () => el.classList.remove("fx-open"); }
    const dur = +(options.dur ?? 1.2), each = +(options.each ?? 0.03), delay = +(options.delay ?? 0.2);
    if (chs.length) gsap.set(chs, { autoAlpha: 1, yPercent: 120 });
    if (pop) gsap.set(pop, { autoAlpha: 1, scale: 0 });
    const st = ScrollTrigger.create({ trigger: el, scroller, start: options.start || "top 95%", once: true, onEnter: () => {
      if (chs.length) gsap.fromTo(chs.slice().sort(() => Math.random() - 0.5), { yPercent: 120 }, { yPercent: 0, duration: dur, ease: "power4.inOut", stagger: each, delay, onComplete: () => el.classList.add("fx-open") });
      else el.classList.add("fx-open");
      if (pop) gsap.fromTo(pop, { scale: 0 }, { scale: 1, duration: 0.6, ease: "back.out(0.9)", delay: delay + 0.8 });
    } });
    const ac = new AbortController();
    if (hover) parts.forEach((p) => {
      let busy = false;
      p.addEventListener("mouseenter", () => {
        if (busy) return;
        busy = true;
        gsap.timeline({ onComplete: () => (busy = false) }).to(p, { scale: 0.05, duration: 0.6, ease: "power2.inOut" }).to(p, { scale: 1, duration: 1.8, ease: "elastic.out(1, 0.8)" });
      }, { signal: ac.signal });
    });
    return () => { ac.abort(); st.kill(); gsap.killTweensOf(parts); gsap.set(parts, { clearProps: "transform,opacity,visibility" }); el.classList.remove("fx-open"); };
  });
})();
