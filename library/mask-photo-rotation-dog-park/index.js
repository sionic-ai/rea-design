// First page motion — same anime.js 4.1.3 timeline as the original.
// Hero: next section every 7s. Per section, mask 0→100% outElastic(1,.9) 1s · two name letters enter with steps(6) 1s · photo 1→1.05 linear 6s ·
//          At 5s it goes 100→0% inElastic(1,.9) 1s · at 5.5s text exits with steps(4) .5s → 6–7s is blue background only.
// Video: from when the section top touches the screen top, scale .8→1 linear over 100svh (scroll sync), and once full, .is-video-full.
// News: Read More shows 3 more — svelte slide 400ms cubicOut, label becomes Close.
(() => {
  const { reduce } = window.RL || {};
  const A = window.anime;
  const sp = matchMedia("(max-width: 959px)");

  // Original per-section text positions (px on the 1200×700 · 402×678 layouts) and tilt — they differ per section because the mask shapes differ
  const POS = [
    { pc: { a: [[200, -100, -90], [72, 255, -19.1]], b: [[1300, 100, -80], [1099, 286, 13.27]] }, sp: { a: [[0, -100, -90], [54, 214, -19.1]], b: [[200, 700, -80], [347, 515, 13.27]] } },
    { pc: { a: [[800, 900, -90], [679, 581, 19.1]], b: [[1300, 100, -80], [1026, 279, 49.81]] }, sp: { a: [[260, -200, -90], [357, 174, 19.1]], b: [[260, 600, -80], [330, 475, 49.81]] } },
    { pc: { a: [[1300, -100, -90], [1085, 216, -33.07]], b: [[-100, 700, -80], [285, 496, 83.98]] }, sp: { a: [[200, -100, -90], [363, 72, -33.07]], b: [[0, 700, -80], [35, 454, 83.98]] } },
    { pc: { a: [[800, -100, -90], [781, 266, 24.83]], b: [[-100, 700, -80], [190, 515, 0]] }, sp: { a: [[370, -100, -90], [284, 264, 24.83]], b: [[0, 700, -80], [14, 538, 0]] } },
  ];
  const SIZE = { pc: [1200, 700], sp: [402, 678] };
  const DUR = 7000;

  const items = [...document.querySelectorAll(".fv__item")];
  const build = (item, i) => {
    const mode = sp.matches ? "sp" : "pc";
    const [W, H] = SIZE[mode];
    const bg = item.querySelector(".fv__bg"), img = item.querySelector(".fv__img");
    const ca = item.querySelector(".fv__char.is-a"), cb = item.querySelector(".fv__char.is-b");
    const p = POS[i][mode];
    const at = ([x, y, r]) => ({ left: `${(x / W) * 100}%`, top: `${(y / H) * 100}%`, rotate: `${r}deg` });
    const move = (from, to, ease, duration) => ({
      left: { from: at(from).left, to: at(to).left }, top: { from: at(from).top, to: at(to).top }, rotate: { from: at(from).rotate, to: at(to).rotate }, ease, duration,
    });
    const tl = A.createTimeline({ autoplay: false });
    tl.set(ca, { visibility: "visible" }).set(cb, { visibility: "visible" })
      .add(bg, { maskSize: { from: "0%", to: "100%", ease: "outElastic(1, 0.9)" } })
      .add(ca, move(p.a[0], p.a[1], "steps(6)", 1000), 0)
      .add(cb, move(p.b[0], p.b[1], "steps(6)", 1000), 0)
      .add(img, { scale: { from: 1, to: 1.05, duration: DUR - 1000, ease: "linear" } }, 0)
      .add(bg, { maskSize: { from: "100%", to: "0%", ease: "inElastic(1, 0.9)" } }, "-=1000")
      .add(ca, { left: { to: at(p.a[0]).left }, top: { to: at(p.a[0]).top }, rotate: { to: at(p.a[0]).rotate }, ease: "steps(4)", duration: 500 }, "<<+=500")
      .add(cb, { left: { to: at(p.b[0]).left }, top: { to: at(p.b[0]).top }, rotate: { to: at(p.b[0]).rotate }, ease: "steps(4)", duration: 500 }, "<<")
      .set(ca, { visibility: "hidden" }).set(cb, { visibility: "hidden" });
    return tl;
  };

  let tls = [], cur = 0, timer = null;
  const play = (i) => { cur = i; const tl = tls[i]; tl.seek(0); tl.play(); };
  const start = () => {
    stop();
    tls.forEach((t) => t.revert?.());
    tls = items.map(build);
    play(0);
    timer = setInterval(() => play((cur + 1) % items.length), DUR);
  };
  const stop = () => { clearInterval(timer); timer = null; tls.forEach((t) => t.pause()); };

  if (A && items.length) {
    if (reduce) {
      // With reduced motion, leave the first section fully open
      const bg = items[0].querySelector(".fv__bg");
      bg.style.maskSize = "100%";
    } else {
      let started = false;
      const go = () => { if (!started) { started = true; start(); } };
      addEventListener("rl:splash-end", go);
      if (!document.querySelector(".rl-splash")) go();
      document.addEventListener("visibilitychange", () => (document.visibilityState === "visible" ? start() : stop()));
      sp.addEventListener("change", () => started && start());
    }
  }

  // ───────── Concept video ─────────
  const movie = document.querySelector(".movie");
  const video = movie?.querySelector(".movie__video");
  if (movie && video && A) {
    if (reduce) {
      video.style.transform = "none";
      movie.classList.add("is-video-full");
    } else {
      let anim = null;
      anim = A.animate(video, {
        scale: { from: 0.8, to: 1 },
        ease: "linear",
        duration: 1000,
        autoplay: A.onScroll({
          target: movie, enter: "top top", leave: "top-=100svh top", sync: true,
          onUpdate: () => anim && movie.classList.toggle("is-video-full", anim.progress >= 1),
        }),
      });
    }
  }

})();
