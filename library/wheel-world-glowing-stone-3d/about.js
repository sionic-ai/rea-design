// About: stone on the right, text lines rise from below one by one (0.05s gap). Mail copy only changes the text to ”Copied”.
(() => {
  const world = GC.world({ canvas: document.querySelector(".gc-gl"), layout: "about", project: 0 });
  const lines = document.querySelectorAll(".gc-panel .gc-line, .gc-panel .gc-row");
  // The original draws the intro text in WebGL so the screen fluid blurs and lights even the letters — the copy’s text lines are DOM, so it reads the same paint density at seven points along the line
  // Apply per-line blur (density × .02 × screen height × .3 px) and brightening (×1 + w/(w+1) × .6).
  const frost = () => {
    for (const el of lines) {
      const r = el.getBoundingClientRect();
      let z = 0;
      for (let i = 0; i <= 6; i++) z = Math.max(z, world.frostAt(r.left + (r.width * i) / 6, r.top + r.height / 2));
      const w = Math.min(z, 2.5);
      const v = z < .02 ? "" : `blur(${(Math.min(z, 1) * .02 * innerHeight * .3).toFixed(1)}px) brightness(${(1 + (w / (w + 1)) * .6).toFixed(3)})`;
      if (el.style.filter !== v) el.style.filter = v;
    }
  };
  gsap.ticker.add((t) => {
    world.tick(t);
    world.render(world.loaderWindows ? world.loaderWindows() : null);
    frost();
  });

  const show = () => {
    if (GC.reduced) return;
    gsap.fromTo(lines, { yPercent: 105 }, { yPercent: 0, duration: 1, ease: "power3.out", stagger: .05, delay: .15 });
  };
  gsap.set(lines, { yPercent: GC.reduced ? 0 : 105 });

  document.querySelectorAll("[data-copy]").forEach((b) => b.addEventListener("click", () => {
    navigator.clipboard?.writeText(b.dataset.copy).catch(() => {});
    const row = b.querySelector(".gc-row");
    const was = row.textContent;
    b.classList.add("is-copied");
    row.textContent = "Copied";
    setTimeout(() => { b.classList.remove("is-copied"); row.textContent = was; }, 1600);
  }));

  if (GC.firstVisit) {
    GC.intro(world, { windows: document.querySelector(".gc-windows"), outline: document.querySelector(".gc-outline"), onWheel: show });
  } else if (sessionStorage.getItem("gc:glide")) {
    // The first page has moved the camera more than halfway toward About before handing over — from there the rest is covered in 1s with deceleration (power1.out), and text lines rise without a curtain
    const f = parseFloat(sessionStorage.getItem("gc:glide")) || 1;
    sessionStorage.removeItem("gc:glide");
    document.querySelector(".gc-outline").remove();
    document.body.classList.add("is-ui");
    GC.pixels.reveal(.01);
    world.place(world.between("home", "about", f));
    world.travel("about", 1, "power1.out");
    show();
  } else {
    document.querySelector(".gc-outline").remove();
    document.body.classList.add("is-ui");
    GC.pixels.reveal(.8).then(show);
  }
})();
