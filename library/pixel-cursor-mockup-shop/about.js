// About — founder swipe (on a pinned board the photo row rises with scroll and the button lights up), cropped photo frame (side margins + 48px rounded corners grow with scroll)
(() => {
  const { reduce, fine, $$ } = window.VS;
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
  const mm = gsap.matchMedia();
  $$("[data-team]").forEach((sec) => {
    const btns = $$("[data-team-btn]", sec), list = sec.querySelector("[data-team-medias]"), n = $$("[data-team-media]", sec).length;
    let active = -1, st = null;
    const setActive = (k) => { if (k === active) return; active = k; btns.forEach((b, i) => b.classList.toggle("is-active", i === k)); };
    mm.add("(min-width: 1024px)", () => {
      const tw = gsap.fromTo(list, { y: 0 }, { y: () => -(list.scrollHeight - list.parentElement.clientHeight), ease: "none",
        scrollTrigger: { trigger: sec, start: "top top", end: "bottom bottom", scrub: 0.5, invalidateOnRefresh: true, onUpdate: (s) => setActive(Math.round(s.progress * (n - 1))) } });
      st = tw.scrollTrigger;
      setActive(0);
      return () => { st = null; active = -1; btns.forEach((b) => b.classList.remove("is-active")); };
    });
    // Pressing doesn’t select — it goes to that person’s scroll position in 1.2s expo.out — the on state is decided by scroll
    btns.forEach((b, i) => b.addEventListener("click", () => {
      if (!st) return;
      gsap.to(window, { scrollTo: { y: st.start + (st.end - st.start) * (n > 1 ? i / (n - 1) : 0), autoKill: true }, duration: reduce ? 0 : 1.2, ease: "expo.out" });
    }));
    if (!fine) return;
    btns.forEach((b, i) => {
      const src = sec.querySelector(`[data-emoji-src="${i}"]`);
      if (!src) return;
      const em = src.cloneNode(true);
      em.removeAttribute("data-emoji-src");
      document.body.append(em);
      let raf = 0, tx = 0, ty = 0, x = 0, y = 0;
      const follow = () => { x += (tx - x) * 0.12; y += (ty - y) * 0.12; em.style.translate = `${x}px ${y}px`; raf = requestAnimationFrame(follow); };
      b.addEventListener("mouseenter", (e) => { x = tx = e.clientX; y = ty = e.clientY; em.classList.add("is-visible"); raf = requestAnimationFrame(follow); });
      b.addEventListener("mousemove", (e) => { tx = e.clientX; ty = e.clientY; });
      b.addEventListener("mouseleave", () => { em.classList.remove("is-visible"); cancelAnimationFrame(raf); });
    });
  });
  // Stacked screen cells — each cell turns on when its top edge reaches the screen center and off when scrolled back up (motion by CSS transition)
  $$("[data-istack-item]").forEach((it) => ScrollTrigger.create({ trigger: it, start: "top center", onEnter: () => it.classList.add("is-visible"), onLeaveBack: () => it.classList.remove("is-visible") }));
  mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
    $$("[data-frame] .vs-ab-frame__inner").forEach((el) => {
      gsap.fromTo(el, { clipPath: "inset(0px 0px 0px 0px round 0px)" }, { clipPath: "inset(0px 120px 0px 120px round 48px)", ease: "none", scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true } });
    });
  });
})();
