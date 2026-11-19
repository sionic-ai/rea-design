(() => {
  kfFx.register("rocket-pagetop", (el, { options, reduce, hover, scroller }) => {
    const ship = el.querySelector('[data-fx-part="ship"]');
    if (!ship) return;
    const stars = el.querySelector('[data-fx-part="stars"]');
    const fire = el.querySelector('[data-fx-part="fire"]');
    let frames = fire ? Array.from(fire.children) : [];
    const flame = frames[0];
    const shakeSel = options.shake || "main";
    const delay = +(options.delay ?? 0.5), dur = +(options.dur ?? 1.5), climb = +(options.climb ?? 1.4);
    const scrollEl = scroller || document.scrollingElement || document.documentElement;
    const after = (options.after && document.querySelector(options.after)) || el.closest("footer") || document.querySelector("footer");
    let flying = false;

    // On hover the first flame frame changes size and intensity every .02s, shaking as if starting an engine
    const flicker = (on = true) => {
      if (on) {
        el.classList.add("is-fx-idling");
        if (flame) gsap.set(flame, { scale: Math.random() * 0.3 + 0.7, opacity: Math.random() * 0.5 + 0.5 });
        gsap.delayedCall(0.02, flicker);
      } else {
        el.classList.remove("is-fx-idling");
        gsap.killTweensOf(flicker);
        if (flame) gsap.set(flame, { opacity: 0, scale: 1 });
      }
    };
    // When flying, flip the flame sheets every .03s so they look like they are burning
    const burn = (on = true) => {
      if (!frames.length) return;
      if (on) {
        frames.push(frames.shift());
        gsap.set(frames, { opacity: 0 });
        gsap.set(frames[0], { opacity: 1 });
        gsap.delayedCall(0.03, burn);
      } else gsap.killTweensOf(burn);
    };
    // The screen shakes — random ±10px every .01s (phone ±5px)
    const shake = (on = true) => {
      const t = document.querySelectorAll(shakeSel);
      if (!t.length) return;
      if (on) {
        const r = innerWidth < 768 ? 5 : 10;
        gsap.set(t, { x: (Math.random() - 0.5) * r, y: (Math.random() - 0.5) * r });
        gsap.delayedCall(0.01, shake);
      } else gsap.killTweensOf(shake);
    };

    const enter = () => { if (flying) return; flicker(); if (stars) gsap.to(stars, { opacity: 0, duration: 0.2 }); };
    const leave = () => { if (flying) return; flicker(false); if (stars) gsap.to(stars, { opacity: 1, duration: 0.2 }); };

    const launch = (e) => {
      e?.preventDefault?.();
      if (flying) return;
      if (reduce) { scrollEl.scrollTop = 0; return; }
      flying = true;
      shake(); burn(); flicker(false); el.classList.add("is-fx-idling");
      const t = document.querySelectorAll(shakeSel);
      gsap.timeline()
        .to(ship, { y: -innerHeight - 100, scale: innerWidth < 768 ? 2 : 2.5, duration: dur, delay, ease: "power4.in" })
        .set(ship, { opacity: 0 })
        .to(scrollEl, { scrollTop: 0, duration: climb, ease: "power4.inOut" }, "-=0.1")
        .to(stars || {}, { autoAlpha: 0, yPercent: 300, duration: 0.4, ease: "power4.in" }, "<")
        .call(() => { shake(false); burn(false); flicker(false); el.classList.remove("is-fx-idling"); flying = false; })
        .to(t.length ? t : {}, { x: 0, y: 0, duration: 0.4 })
        .set(frames, { opacity: 0 })
        .set([...t, ship, ...(stars ? [stars] : [])], { clearProps: "all" });
    };

    el.addEventListener("click", launch);
    if (hover) { el.addEventListener("mouseenter", enter); el.addEventListener("mouseleave", leave); }

    let st = null;
    if (after && window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
      // When the footer’s top edge reaches 80% of the screen, the rocket rises from 30px below and appears
      st = ScrollTrigger.create({
        trigger: after, scroller, start: options.start || "top 80%",
        onEnter: () => gsap.to(el, { y: 0, autoAlpha: 1, duration: reduce ? 0 : 0.4, ease: "power3.out" }),
        onLeaveBack: () => gsap.to(el, { y: 30, autoAlpha: 0, duration: reduce ? 0 : 0.2, ease: "power3.out" }),
      });
    } else gsap.set(el, { y: 0, autoAlpha: 1 });

    return () => {
      st?.kill();
      el.removeEventListener("click", launch);
      el.removeEventListener("mouseenter", enter);
      el.removeEventListener("mouseleave", leave);
      shake(false); burn(false); flicker(false);
      gsap.killTweensOf([el, ship, stars, ...frames].filter(Boolean));
      gsap.set([el, ship, ...frames, ...(stars ? [stars] : [])], { clearProps: "all" });
      frames = [];
    };
  });
})();
