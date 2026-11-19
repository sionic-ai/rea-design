(() => {
  const SLOTS = [{ left: "-4%", top: "19%", rotate: -10 }, { left: "22%", top: "34%", rotate: 5 }, { left: "40%", top: "20%", rotate: -10 }, { right: "10%", top: "35%", rotate: -6 }, { right: "-3%", top: "18%", rotate: 12 }];
  kfFx.register("pop-magnet-fall-cards", (el, { options, reduce, hover, scroller }) => {
    const cards = [...el.querySelectorAll('[data-fx-part="card"]')];
    if (!cards.length) return;
    cards.forEach((c, i) => { const s = SLOTS[i % SLOTS.length]; Object.assign(c.style, { left: s.left || "", right: s.right || "", top: s.top }); gsap.set(c, { rotation: s.rotate }); });
    if (reduce) return () => gsap.set(cards, { clearProps: "transform" });
    const pull = +(options.pull ?? 0.25), dur = +(options.dur ?? 0.9);
    const pop = () => gsap.to(cards, { yPercent: 0, autoAlpha: 1, duration: dur, ease: "back.out(1.6)", stagger: { amount: 0.4, from: "random" } });
    gsap.set(cards, { yPercent: 180, autoAlpha: 0 });
    const st = ScrollTrigger.create({ trigger: el, scroller, start: options.start || "top 80%", once: true, onEnter: pop });
    let fallen = 0, later = null;
    const offs = cards.map((c, i) => {
      const inner = c.querySelector('[data-fx-part="inner"]') || c.firstElementChild || c;
      const move = (e) => { const r = c.getBoundingClientRect(); gsap.to(inner, { x: (e.clientX - (r.left + r.width / 2)) * pull, y: (e.clientY - (r.top + r.height / 2)) * pull, duration: 0.4, ease: "power2.out" }); };
      const leave = () => gsap.to(inner, { x: 0, y: 0, duration: 0.8, ease: "elastic.out(1, 0.4)" });
      const click = () => {
        if (c.dataset.fxFallen) return;
        c.dataset.fxFallen = "1";
        const r = c.getBoundingClientRect();
        gsap.to(c, { y: `+=${innerHeight - r.top + r.height}`, rotation: `+=${(Math.random() - 0.5) * 90}`, duration: 0.8 + Math.random() * 0.3, ease: "power2.in", onComplete: () => {
          c.style.pointerEvents = "none";
          if (++fallen < cards.length) return;
          later = gsap.delayedCall(1, () => {
            fallen = 0;
            cards.forEach((o, k) => { delete o.dataset.fxFallen; o.style.pointerEvents = ""; gsap.set(o, { y: 0, rotation: SLOTS[k % SLOTS.length].rotate }); });
            gsap.set(cards, { yPercent: 180, autoAlpha: 0 });
            pop();
          });
        } });
      };
      if (hover) { c.addEventListener("mousemove", move); c.addEventListener("mouseleave", leave); }
      c.addEventListener("click", click);
      return () => { c.removeEventListener("mousemove", move); c.removeEventListener("mouseleave", leave); c.removeEventListener("click", click); gsap.killTweensOf([c, inner]); gsap.set(inner, { clearProps: "transform" }); };
    });
    return () => { st.kill(); later?.kill(); offs.forEach((f) => f()); gsap.set(cards, { clearProps: "transform,opacity,visibility" }); cards.forEach((c) => { c.style.pointerEvents = ""; delete c.dataset.fxFallen; }); };
  });
})();
