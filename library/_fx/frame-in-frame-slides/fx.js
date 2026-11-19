(() => {
  kfFx.register("frame-in-frame-slides", (el, { options, reduce }) => {
    const slides = [...el.querySelectorAll(':scope > [data-fx-part="slide"]')];
    const inset = el.querySelector(':scope > [data-fx-part="inset"]');
    if (slides.length < 2) return;
    const every = Math.max(0.2, +options.every || 3.65), dur = +(options.dur ?? 1.35);
    const ease = kfFx.ease(options.ease || "power2.inOut", "power2.inOut");
    const zoom = () => +(options.zoom ?? (innerWidth <= 768 ? 1.1 : 1.14));
    let active = 0, timer = null, visible = true, live = true;
    const pane = (i) => {
      const p = document.createElement("div");
      p.className = "fx-fif__pane";
      p.setAttribute("aria-hidden", "true");
      const c = slides[i].firstElementChild?.cloneNode(true);
      if (c) p.append(c);
      inset.append(p);
      return p;
    };
    const prune = () => [...inset.querySelectorAll(":scope > .fx-fif__pane")].slice(0, -1).forEach((n) => n.remove());
    if (inset) { pane(1 % slides.length); }
    if (reduce) return () => inset?.querySelectorAll(".fx-fif__pane").forEach((n) => n.remove());
    const fx = gsap.context(() => {});
    const next = () => {
      if (!live || !visible) return (timer = null);
      const t = (active + 1) % slides.length, s = slides[t];
      el.insertBefore(s, inset || null);
      fx.add(() => {
        const img = s.firstElementChild;
        if (img) gsap.fromTo(img, { scale: zoom(), yPercent: innerWidth <= 768 ? 1 : 1.8 }, { scale: 1, yPercent: 0, duration: dur + every, ease: "power1.out" });
        gsap.fromTo(s, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: dur, ease, onComplete: () => {
          slides.forEach((o) => o !== s && gsap.set(o, { clipPath: "inset(100% 0% 0% 0%)" }));
          active = t;
          schedule();
        } });
        if (inset) {
          const p = pane((t + 1) % slides.length);
          gsap.timeline({ onComplete: prune })
            .fromTo(p, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: dur, ease }, 0)
            .fromTo(p.firstElementChild, { scale: 1.12 }, { scale: 1, duration: dur + every, ease: "power1.out" }, 0);
        }
      });
    };
    const schedule = () => { clearTimeout(timer); timer = visible && live ? setTimeout(next, every * 1000) : null; };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !timer) schedule();
      if (!visible) { clearTimeout(timer); timer = null; }
    }, { threshold: 0.05 });
    io.observe(el);
    gsap.set(slides[0], { clipPath: "inset(0% 0% 0% 0%)" });
    schedule();
    return () => {
      live = false;
      clearTimeout(timer);
      io.disconnect();
      fx.revert();
      gsap.set(slides, { clearProps: "clipPath" });
      inset?.querySelectorAll(".fx-fif__pane").forEach((n) => n.remove());
    };
  });
})();
