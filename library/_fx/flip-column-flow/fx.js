// For each column, cards are stacked one slot at a time starting outside the board (even columns below, odd columns above), pushed one slot at a time and wrapped by the column height, looping endlessly
(() => {
  kfFx.register("flip-column-flow", (el, { options, reduce, hover }) => {
    const cards = [...el.querySelectorAll('[data-fx-part="flow-card"]')];
    if (!cards.length) return;
    const cols = Math.max(1, Math.round(+options.cols || 3));
    const DUR = +(options.dur ?? 1.4), GAP = +(options.rest ?? 2), EASE = kfFx.ease(options.ease || "power2.out", "power2.out");
    const press = +(options.press ?? 0.96), flipDur = reduce ? 0 : +(options.flip ?? 1);
    const narrow = matchMedia(`(max-width: ${+options["row-below"] || 768}px)`);
    el.style.setProperty("--fx-cols", cols);
    const per = Math.ceil(cards.length / cols);
    const groups = Array.from({ length: cols }, (_, g) => cards.slice(g * per, g * per + per)).filter((g) => g.length);
    let anims = [], paused = options.hold === "on", held = paused, seen = true, at = 0, t;

    const kill = () => {
      at = anims[0]?.progress() ?? at;
      anims.forEach((a) => a.kill());
      anims = [];
      gsap.set(cards, { clearProps: "x,y,top,bottom,right,left" });
    };
    const columns = () => {
      const { width: w, height: h } = cards[0].getBoundingClientRect();
      anims = groups.map((g, a) => {
        const up = a % 2 === 0, off = a === groups.length - 1 && groups.length > 1 ? h / 2 : 0, span = h * g.length;
        gsap.set(g, { x: w * a, y: (p) => (up ? -1 : 1) * h * p + off, [up ? "bottom" : "top"]: -h });
        const tl = gsap.timeline({ paused: true, repeat: -1, repeatDelay: GAP });
        g.forEach((_, p) => tl.add(gsap.to(g, { y: `${up ? "-" : "+"}=${h}`, duration: DUR, ease: EASE, modifiers: { y: gsap.utils.unitize((v) => parseFloat(v) % span) } }), p ? `+=${GAP}` : 0));
        return tl.progress(at);
      });
    };
    const row = () => {
      const w = cards[0].getBoundingClientRect().width, span = w * cards.length, r = el.clientWidth / 2 - w;
      gsap.set(cards, { x: (l) => -w * l - r, right: -w, left: "auto" });
      const tl = gsap.timeline({ paused: true, repeat: -1, repeatDelay: GAP });
      cards.forEach((_, c) => tl.add(gsap.to(cards, { x: `-=${w}`, duration: DUR, ease: EASE, modifiers: { x: gsap.utils.unitize((v) => parseFloat(v) % span) } }), c ? `+=${GAP}` : 0));
      anims = [tl.progress(at)];
    };
    const sync = () => anims.forEach((a) => (paused || !seen || reduce ? a.pause() : a.play()));
    const build = () => { kill(); narrow.matches ? row() : columns(); sync(); };
    build();
    const ro = new ResizeObserver(() => { clearTimeout(t); t = setTimeout(build, 200); });
    ro.observe(el);
    const io = new IntersectionObserver(([e]) => { seen = e.isIntersecting; sync(); });
    io.observe(el);
    const play = () => { held = false; paused = false; sync(); };
    el.addEventListener("fx:play", play);

    const offs = cards.map((c) => {
      if (!c.hasAttribute("tabindex")) c.tabIndex = 0;
      c.setAttribute("role", "button");
      const flip = () => {
        const on = !c.classList.contains("is-flipped");
        c.classList.toggle("is-flipped", on);
        gsap.to(c, { rotateY: on ? 180 : 0, transformOrigin: "50% 50%", duration: flipDur, ease: "power3.out" });
      };
      const key = (e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), flip());
      const enter = () => {
        if (!narrow.matches) { paused = true; sync(); }
        c.classList.add("is-pressed");
        gsap.to(c, { scale: press, duration: reduce ? 0 : 0.25, ease: "none" });
      };
      const leave = () => {
        if (!held) { paused = false; sync(); }
        c.classList.remove("is-pressed");
        gsap.to(c, { scale: 1, duration: reduce ? 0 : 0.25, ease: "none" });
      };
      c.addEventListener("click", flip);
      c.addEventListener("keydown", key);
      if (hover) { c.addEventListener("pointerenter", enter); c.addEventListener("pointerleave", leave); }
      return () => {
        c.removeEventListener("click", flip);
        c.removeEventListener("keydown", key);
        c.removeEventListener("pointerenter", enter);
        c.removeEventListener("pointerleave", leave);
        c.classList.remove("is-flipped", "is-pressed");
      };
    });

    return () => {
      clearTimeout(t);
      ro.disconnect();
      io.disconnect();
      el.removeEventListener("fx:play", play);
      offs.forEach((f) => f());
      anims.forEach((a) => a.kill());
      gsap.killTweensOf(cards);
      gsap.set(cards, { clearProps: "x,y,scale,rotationY,transformOrigin,top,bottom,right,left" });
      el.style.removeProperty("--fx-cols");
    };
  });
})();
