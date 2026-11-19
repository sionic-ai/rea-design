(() => {
  // Turn on the dot of the last section whose head has passed the at line — keep it on until the next section head crosses the same line, so it does not go off in the gaps between sections.
  // Pressing slides from the section top to just above the offset. The default curve sine.inOut is the same formula as jQuery animate’s swing (0.5 − cos(πp)/2)
  kfFx.register("dot-spy-nav", (el, { options, reduce, scroller }) => {
    if (!window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    const dots = [...el.querySelectorAll('[data-fx-part="dot"]')];
    const at = options.at || "bottom-=400";
    const dur = reduce ? 0 : +(options.dur ?? 2), offset = +(options.offset ?? 90);
    const ease = kfFx.ease(options.ease || "sine.inOut", "sine.inOut");
    const pairs = dots.map((dot) => {
      const id = decodeURIComponent((dot.getAttribute("href") || dot.dataset.target || "").replace(/^#/, ""));
      return { dot, target: id ? document.getElementById(id) : null };
    }).filter((p) => p.target);
    if (!pairs.length) return;
    let cur = -1;
    const set = (i) => {
      cur = i;
      pairs.forEach((p, k) => {
        p.dot.classList.toggle("is-active", k === i);
        k === i ? p.dot.setAttribute("aria-current", "true") : p.dot.removeAttribute("aria-current");
      });
    };
    const made = pairs.map((p, i) => ScrollTrigger.create({
      trigger: p.target,
      scroller,
      start: `top ${at}`,
      // The last section stays on down to the very bottom — the end value "max" When set that way, it leaves and switches off the moment it reaches the bottom
      ...(pairs[i + 1] ? { endTrigger: pairs[i + 1].target, end: `top ${at}` } : { end: () => ScrollTrigger.maxScroll(scroller || window) + 1 }),
      onToggle: (self) => (self.isActive ? set(i) : cur === i && set(-1)),
    }));
    const box = scroller || null;
    const pos = { y: 0 };
    let tween = null;
    const glide = (target) => {
      const now = box ? box.scrollTop : scrollY;
      const top = target.getBoundingClientRect().top - (box ? box.getBoundingClientRect().top : 0) + now;
      const y = Math.max(0, top - offset);
      tween?.kill();
      pos.y = now;
      const write = () => (box ? (box.scrollTop = pos.y) : scrollTo(0, pos.y));
      tween = dur ? gsap.to(pos, { y, duration: dur, ease, onUpdate: write }) : (pos.y = y, write(), null);
    };
    const offs = pairs.map((p, i) => {
      const click = (e) => { e.preventDefault(); set(i); glide(p.target); };
      p.dot.addEventListener("click", click);
      return () => p.dot.removeEventListener("click", click);
    });
    return () => {
      tween?.kill();
      made.forEach((st) => st.kill());
      offs.forEach((f) => f());
      pairs.forEach((p) => { p.dot.classList.remove("is-active"); p.dot.removeAttribute("aria-current"); });
    };
  });
})();
