// Person photo swap: the panel opens up and down from the center horizontal line (.6s expo.out, after .4s) and tagline chunks reveal from the left (.6s power3.out, .1s apart)
// A voice line is drawn over the white band (.4s power3.inOut, .06s apart, text .1s later). Every 5 seconds the voice line lifts away upward (.4s),
// The current section tilts its bottom edge diagonally (-10%) and rolls up to reveal the next section below (.8s expo.inOut). Order is shuffled, and reshuffled after a full cycle.
(() => {
  const shuffle = (n, avoid) => {
    const a = [...Array(n).keys()];
    for (let i = n - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    if (avoid != null && n > 1 && a[0] === avoid) [a[0], a[1]] = [a[1], a[0]];
    return a;
  };
  kfFx.register("slant-roll-switch", (el, { options, reduce }) => {
    const slides = [...el.querySelectorAll('[data-fx-part="slide"]')];
    if (!slides.length) return;
    const frame = el.querySelector('[data-fx-part="frame"]');
    const catches = [...el.querySelectorAll('[data-fx-part="catch"]')];
    const q = (s, n) => [...s.querySelectorAll(`[data-fx-part="${n}"]`)];
    // Some sections have no optional children (voice lines, photos, slogans) — empty targets are not passed to GSAP
    const set = (t, v) => { if (t.length) gsap.set(t, v); };
    const to = (t, v) => (t.length ? gsap.to(t, v) : null);
    const bp = +(options.bp || 961);
    const wide = () => innerWidth >= bp;
    const slope = () => (wide() ? +(options.slope ?? 10) : +(options["slope-narrow"] ?? 5));
    const every = +(options.every ?? 5), dur = +(options.dur ?? 0.8);
    const expoInOut = kfFx.ease(options.ease || "expo.inOut", "expo.inOut");
    const shuf = options.shuffle !== "off";
    const st = { n: slides.length, index: 0, order: shuf ? shuffle(slides.length) : [...slides.keys()] };
    st.current = st.order[0]; st.next = st.order[1 % st.n];
    const below = () => `polygon(0% 0%, 100% 0%, 100% 100%, 0% ${100 + slope()}%)`;
    const hide = (s) => set([...q(s, "bg"), ...q(s, "text")], { clipPath: "inset(0 100% 0 0)" });
    const reveal = (s) => {
      to(q(s, "bg"), { clipPath: "inset(0 0% 0 0)", ease: "power3.inOut", duration: 0.4, stagger: 0.06 });
      to(q(s, "text"), { clipPath: "inset(0 0% 0 0)", ease: "power3.inOut", duration: 0.4, stagger: 0.06, delay: 0.1 });
    };
    if (reduce) {
      slides.forEach((s, i) => gsap.set(s, { autoAlpha: i === st.current ? 1 : 0, zIndex: i === st.current ? 2 : "" }));
      return () => gsap.set(slides, { clearProps: "all" });
    }
    hide(slides[st.current]);
    gsap.set(el, { autoAlpha: 1 });
    if (frame) gsap.set(frame, { clipPath: "polygon(0 50%, 100% 50%, 100% 50%, 0 50%)" });
    if (catches.length) gsap.set(catches, { clipPath: "inset(0 100% 0 0)" });
    gsap.set(slides, { autoAlpha: 0, clipPath: below() });
    gsap.set(slides[st.current], { zIndex: 2, autoAlpha: 1 });
    gsap.set(slides[st.next], { zIndex: 1 });

    const intro = gsap.timeline();
    if (frame) intro.to(frame, { clipPath: "polygon(0 0%, 100% 0%, 100% 100%, 0 100%)", ease: "expo.out", duration: 0.6 }, 0.4);
    if (catches.length) intro.to(catches, { clipPath: "inset(0 0% 0 0)", ease: "power3.out", duration: 0.6, stagger: 0.1 }, 0.8);
    if (q(slides[st.current], "bg").length) intro.to(q(slides[st.current], "bg"), { clipPath: "inset(0 0% 0 0)", ease: "power3.inOut", duration: 0.4, stagger: 0.06 }, 1.5);
    if (q(slides[st.current], "text").length) intro.to(q(slides[st.current], "text"), { clipPath: "inset(0 0% 0 0)", ease: "power3.inOut", duration: 0.4, stagger: 0.06, delay: 0.1 }, 1.5);
    if (!intro.duration()) intro.to({}, { duration: 1.5 });

    const timers = new Set();
    const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); };
    let visual = st.current;
    const roll = () => {
      const cur = slides[st.current], nxt = slides[st.next];
      hide(nxt);
      gsap.set(nxt, { autoAlpha: 1 });
      gsap.to(cur, {
        clipPath: `polygon(0% 0%, 100% 0%, 100% ${-slope()}%, 0% 0%)`, ease: expoInOut, duration: dur,
        onComplete: () => {
          set(q(cur, "voice"), { clipPath: "inset(0% 0 0 0)" });
          st.index++;
          if (st.index === st.n - 1 && shuf) { st.order = shuffle(st.n, st.order[st.n - 1]); st.index = 0; }
          else if (st.index >= st.n) st.index = 0;
          st.current = st.order[st.index]; st.next = st.order[(st.index + 1) % st.n];
          slides.forEach((s, i) => { if (i !== st.current && i !== st.next) gsap.set(s, { zIndex: "" }); });
          gsap.set(slides[st.current], { zIndex: 2 });
          gsap.set(slides[st.next], { zIndex: 1, clipPath: below() });
          reveal(slides[st.current]);
        },
      });
    };
    const loop = gsap.to({}, {
      duration: every, delay: intro.duration(),
      onStart: () => { if (!wide()) { const p = q(slides[visual], "photo"); if (p.length) gsap.to(p, { scale: 1.08, duration: 7, ease: "none" }); } },
      onComplete: () => {
        const was = visual;
        visual = st.next;
        const voices = q(slides[st.current], "voice");
        const after = () => {
            roll();
            later(() => loop.restart(), 300);
            later(() => { const p = q(slides[was], "photo"); if (p.length) { gsap.killTweensOf(p); gsap.set(p, { scale: 1 }); } }, 1000);
        };
        if (voices.length) gsap.to(voices, { clipPath: "inset(100% 0 0 0)", ease: "power3.inOut", duration: 0.4, onComplete: after });
        else after();
      },
    });
    const io = new IntersectionObserver((es) => es.forEach((e) => (e.isIntersecting ? loop.play() : loop.pause())));
    io.observe(el);
    return () => {
      io.disconnect(); intro.kill(); loop.kill(); timers.forEach(clearTimeout);
      gsap.killTweensOf([el, frame, ...catches, ...slides].filter(Boolean));
      slides.forEach((s) => gsap.set([s, ...q(s, "bg"), ...q(s, "text"), ...q(s, "voice"), ...q(s, "photo")], { clearProps: "all" }));
      if (frame) gsap.set(frame, { clearProps: "clipPath" });
      if (catches.length) gsap.set(catches, { clearProps: "clipPath" });
      gsap.set(el, { clearProps: "opacity,visibility" });
    };
  });
})();
