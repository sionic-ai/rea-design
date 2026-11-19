(() => {
  // A 1366×100 plate with only integer harmonics added to the wave — left and right ends match in height and slope, so two tiles joined together flow without a seam. The middle is large and the ends are calm
  const path = (rotate, amp) => {
    const W = 1366, H = 100, N = 60, TAU = Math.PI * 2, ys = [];
    for (let i = 0; i < N; i++) {
      const t = i / N;
      const env = 0.3 + 0.7 * (0.5 - 0.5 * Math.cos(TAU * t));
      const big = (20 * Math.sin(TAU * 5 * t + (rotate ? 2.1 : 0.4)) + 8 * Math.sin(TAU * 8 * t + (rotate ? 0.3 : 1.7))) * amp;
      const small = 3 * amp * Math.sin(TAU * 11 * t + 0.9);
      ys.push(rotate ? 52 + env * big + small : 40 - env * big - small);
    }
    const y = (i) => ys[(i % N + N) % N], s = W / N, f = (n) => n.toFixed(2);
    let d = rotate ? `M0,0L0,${f(y(0))}` : `M0,${H}L0,${f(y(0))}`;
    for (let i = 0; i < N; i++) d += `C${f(i * s + s / 3)},${f(y(i) + (y(i + 1) - y(i - 1)) / 6)},${f((i + 1) * s - s / 3)},${f(y(i + 1) - (y(i + 2) - y(i)) / 6)},${f((i + 1) * s)},${f(y(i + 1))}`;
    return d + (rotate ? `L${W},0Z` : `L${W},${H}Z`);
  };

  kfFx.register("wave-band-flow", (el, { options, reduce, scroller }) => {
    const rotate = options.look === "rotate";
    const amp = +(options.amp ?? 1);
    const d = path(rotate, amp);
    const track = document.createElement("div");
    track.className = "fx-wbf-track";
    track.setAttribute("aria-hidden", "true");
    const svg = `<svg viewBox="0 0 1366 100" preserveAspectRatio="none"><path d="${d}"/></svg>`;
    track.innerHTML = svg + svg;
    el.append(track);
    if (rotate) el.classList.add("is-fx-rotate");

    // Length of one loop — auto gives window width × .008 + 30 seconds like the original (41s at 1440, 33s at 390)
    const setTime = () => {
      const t = options.time && options.time !== "auto" ? +options.time : Math.floor(0.008 * innerWidth) + 30;
      el.style.setProperty("--fx-time", `${t}s`);
    };
    setTime();
    if (reduce) { el.classList.add("is-fx-paused"); return () => { track.remove(); el.classList.remove("is-fx-rotate", "is-fx-paused"); el.style.removeProperty("--fx-time"); }; }

    // Pauses when off-screen — continuously drawing two 683%-wide SVGs is heavy when there are several bands
    el.classList.add("is-fx-paused");
    const io = new IntersectionObserver(([e]) => el.classList.toggle("is-fx-paused", !e.isIntersecting), { root: scroller && scroller !== window ? scroller : null });
    io.observe(el);
    let rt = 0;
    const onResize = () => { clearTimeout(rt); rt = setTimeout(setTime, 500); };
    addEventListener("resize", onResize);
    return () => {
      io.disconnect(); clearTimeout(rt); removeEventListener("resize", onResize);
      track.remove(); el.classList.remove("is-fx-rotate", "is-fx-paused"); el.style.removeProperty("--fx-time");
    };
  });
})();
