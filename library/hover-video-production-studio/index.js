// First page: hover play on video cells, poster zoom and small cell parallax scrub, phone address expand.
// Original values: on interaction, while loading, the vertical line blinks every .5s moving up and down (loading), and when ready it loops silently from the start —
// The video starts .25s late, a vertical line fills as it plays and the time text drops down with it. On release it stops at once and returns to the start (reloaded on the next hover).
// Large and medium cell posters scale 1→1.25 (1.5 under 1024) · small cell pairs yPercent 15→-30 · on phones, small cells stagger per pair at -10↔10 / 20↔-20.
MR.page("index", (box) => {
  const { reduced, touch } = window.MR;
  const fmt = (t) => { const s = Math.floor(t); return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`; };
  const live = [], stops = [];

  box.querySelectorAll(".mr-vb").forEach((vb) => {
    const video = vb.querySelector(".mr-vb__embed");
    const fill = vb.querySelector(".mr-vb__fill");
    const time = vb.querySelector(".mr-vb__time");
    const cur = time.querySelector("b");
    const max = time.querySelector("i");
    let want = false, ready = false, playing = false, raf = 0;

    const tick = () => {
      const f = video.duration || 0, h = video.currentTime;
      cur.textContent = fmt(h);
      if (f > 0) { fill.style.height = `${(h / f) * 100}%`; time.style.height = `${(1 - h / f) * 100}%`; }
      if (playing) raf = requestAnimationFrame(tick);
    };
    const destroy = () => {
      cancelAnimationFrame(raf);
      video.pause();
      video.removeAttribute("src");
      video.load();
      vb.classList.remove("is-ready", "is-loading", "is-playing");
      ready = playing = false;
      fill.style.height = "0%";
      time.style.removeProperty("height");
    };
    const play = () => {
      if (!ready || playing || !want) return;
      video.currentTime = 0;
      video.play().then(() => {
        vb.classList.add("is-playing");
        vb.classList.remove("is-loading");
        playing = true;
        tick();
        if (!want) destroy();
      }).catch(() => {});
    };
    // Original: load, play once and pause to read the length (ready), then play again from the start
    const load = () => {
      vb.classList.add("is-loading");
      video.src = video.dataset.src;
      video.play().then(() => {
        if (!want) return destroy();
        video.pause();
        vb.classList.add("is-ready");
        ready = true;
        max.textContent = fmt(video.duration || 0);
        play();
      }).catch(() => destroy());
    };
    const enter = () => {
      if (reduced) return;
      want = true;
      if (touch) {
        if (playing) return;
        live.splice(0).forEach((o) => o !== stop && o());
        live.push(stop);
      }
      video.getAttribute("src") ? play() : load();
    };
    // Original: if you release during loading, it stops and clears after loading finishes (meanwhile the vertical line flickers in ink color)
    const stop = () => { want = false; if (ready) destroy(); };
    if (touch) vb.addEventListener("touchstart", enter, { passive: true });
    else { vb.addEventListener("mouseenter", enter); vb.addEventListener("mouseleave", stop); }
    vb.addEventListener("click", () => { want = false; if (playing) { video.pause(); playing = false; cancelAnimationFrame(raf); } });
    stops.push(stop);
  });

  // While scrolling (until .5s after stopping) idle cells don’t accept interaction — so cells passing by during scroll don’t load one after another
  const vindex = box.querySelector(".mr-vindex");
  let idle = 0;
  const onScroll = () => { vindex.classList.add("is-scrolling"); clearTimeout(idle); idle = setTimeout(() => vindex.classList.remove("is-scrolling"), 500); };
  addEventListener("scroll", onScroll, { passive: true });

  const mm = gsap.matchMedia();
  mm.add({ wide: "(min-width: 1024px)", motion: "(prefers-reduced-motion: no-preference)" }, (ctx) => {
    if (!ctx.conditions.motion) return;
    const wide = ctx.conditions.wide;
    box.querySelectorAll(".mr-vb.is-large .mr-vb__media, .mr-vb.is-medium .mr-vb__media").forEach((m) => {
      gsap.fromTo(m.querySelector(".mr-vb__poster"), { scale: 1 }, { scale: wide ? 1.25 : 1.5, ease: "none", scrollTrigger: { trigger: m, start: "top bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true } });
    });
    box.querySelectorAll(".mr-vgroup").forEach((g, k) => {
      if (wide) return gsap.fromTo(g, { yPercent: 15 }, { yPercent: -30, ease: "none", scrollTrigger: { trigger: g, start: "top bottom", end: "bottom top", scrub: true } });
      const [a, b, c, d] = k % 2 ? [20, -20, -10, 10] : [-10, 10, 20, -20];
      g.querySelectorAll(":scope > .mr-vb").forEach((s, n) => gsap.fromTo(s, { yPercent: n ? c : a }, { yPercent: n ? d : b, ease: "none", scrollTrigger: { trigger: g, start: "top bottom", end: "bottom top", scrub: true } }));
    });
  });

  // Phone: the address expands with a round button
  const text = box.querySelector(".mr-ihead__text");
  const inner = text.querySelector(".mr-ihead__inner");
  text.querySelector(".mr-ihead__toggle").addEventListener("click", () => {
    const open = text.classList.toggle("is-open");
    inner.style.height = open ? `${inner.scrollHeight}px` : "0px";
  });

  return () => {
    removeEventListener("scroll", onScroll);
    clearTimeout(idle);
    stops.forEach((f) => f());
    box.querySelectorAll(".mr-vb__embed").forEach((v) => { v.pause(); v.removeAttribute("src"); });
    mm.revert();
  };
});
