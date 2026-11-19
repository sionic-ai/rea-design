// About: three hatch lines drawn → constellation (red panel lifts and color dots gather into a black constellation) → map zoom·red dot → cork board notes drop·drag → principle sentences light up with scroll
(() => {
  const { reduced } = WR;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const site = CustomEase.create("wrSite", "0.22, 1, 0.36, 1");

  // 14 star dots: scattered color dots (A) → constellation positions (B). Positions are in screen-ratio coordinates
  const A = [[.38, .1], [.79, .14], [.4, .26], [.05, .5], [.29, .55], [.62, .37], [.88, .3], [.15, .7], [.55, .72], [.7, .62], [.45, .44], [.92, .64], [.24, .3], [.66, .86]];
  const B = [[.12, .12], [.3, .1], [.62, .1], [.88, .12], [.2, .36], [.46, .3], [.76, .3], [.1, .56], [.34, .58], [.6, .52], [.88, .5], [.22, .78], [.5, .8], [.8, .76]];
  const COLORS = ["--kf-accent", "--site-star-blue", "--site-star-green", "--site-star-yellow", "--site-star-violet"];
  const dotsBox = $(".ab-stars__dots"), lineSvg = $(".ab-stars__lines");
  const dots = A.map(([x, y], i) => {
    const d = document.createElement("i");
    d.style.setProperty("--c", `var(${COLORS[i % COLORS.length]})`);
    d.style.left = `${x * 100}%`; d.style.top = `${y * 100}%`;
    dotsBox.append(d);
    return d;
  });
  const EDGES = [[0, 1], [1, 5], [5, 2], [2, 3], [5, 6], [4, 5], [4, 8], [8, 9], [9, 10], [7, 8], [8, 12], [12, 13], [9, 13], [11, 12]];
  lineSvg.innerHTML = EDGES.map(([a, b]) => `<line x1="${B[a][0] * 100}%" y1="${B[a][1] * 100}%" x2="${B[b][0] * 100}%" y2="${B[b][1] * 100}%" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/>`).join("");

  // Map pin: a red dot and a place-name tag inside the region to be zoomed
  const pins = $(".ab-map__pins");
  for (let i = 0; i < 26; i++) {
    const x = 692 + ((i * 37) % 30) - 4, y = 258 + ((i * 53) % 80);
    pins.insertAdjacentHTML("beforeend", `<circle cx="${x}" cy="${y}" r="${i % 5 ? .9 : 1.6}"/>`);
  }
  [["Place name one", 655, 240], ["Place name two", 735, 268], ["Place name three", 700, 345], ["Place name four", 760, 312]].forEach(([t, x, y]) => pins.insertAdjacentHTML("beforeend", `<text x="${x}" y="${y}">${t}</text>`));

  // Principle paragraph: three red digits like number 012 plus a bold uppercase sentence
  const rules = Array.from({ length: 14 }, (_, i) => `<b>${String(i + 1).padStart(3, "0")}</b> A rule you live by goes here in one sentence${i % 3 ? "" : ", a little longer and carrying on a bit more"}.`);
  $(".ab-rules__p").innerHTML = rules.map((r) => `<span>${r} </span>`).join("");

  gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
    // First section lines reveal over .6s each, opening like the original first section, and finish at 1.37s — the original staggers several words by .11s, here there are three lines so .33s apart (the hatch texture is kept with steps)
    gsap.to(".ab-big__line", { clipPath: "inset(0 0% 0 0)", duration: .6, stagger: .33, ease: "steps(14)", delay: .27 });

    gsap.timeline({ scrollTrigger: { trigger: ".ab-film", start: "top 50%" } })
      .to(".ab-film__words span", { opacity: 1, duration: .01, stagger: .28 });

    // Scrambled text: when visible, over 1.4s each character from the front resolves from a symbol into its own letter
    const scr = $(".ab-scramble__text"), full = scr.dataset.text, SYM = "!=*+/?<>%#&@0123456789";
    scr.textContent = full.replace(/\S/g, () => SYM[Math.floor(Math.random() * SYM.length)]);
    ScrollTrigger.create({ trigger: scr, start: "top 75%", once: true, onEnter: () => {
      const o = { p: 0 };
      gsap.to(o, { p: 1, duration: 1.4, ease: "none", onUpdate: () => {
        const n = Math.floor(o.p * full.length);
        scr.textContent = full.slice(0, n) + full.slice(n).replace(/\S/g, () => SYM[Math.floor(Math.random() * SYM.length)]);
      } });
    } });

    // In the original, constellation → mosaic → map is one plate (plate height × 14.2), switching to mosaic at plate 6 and to map at plate 9.8 — split into two plates using those same lengths
    const st = gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: ".ab-stars__pin", start: "top top", end: () => `+=${6 * $(".ab-stars__pin").offsetHeight}`, pin: true, scrub: true, anticipatePin: 1, invalidateOnRefresh: true } });
    st.to(".ab-stars__say", { autoAlpha: 0, y: -20, duration: .12 }, .12)
      .set(".ab-stars__red", { autoAlpha: 0 }, .24)
      .from(dots, { scale: 0, duration: .08, stagger: .01 }, .3);
    dots.forEach((d, i) => st.to(d, { left: `${B[i][0] * 100}%`, top: `${B[i][1] * 100}%`, "--to-ink": 1, duration: .3, ease: "power1.inOut" }, .45));
    st.to(".ab-stars__lines line", { strokeDashoffset: 0, duration: .2, stagger: .01 }, .78)
      .to(".ab-stars__hint", { autoAlpha: 0, duration: .05 }, .4);

    gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: ".ab-map__pin", start: "top top", end: () => `+=${8.2 * $(".ab-map__pin").offsetHeight}`, pin: true, scrub: true, anticipatePin: 1, invalidateOnRefresh: true } })
      .to(".ab-map__say", { autoAlpha: 0, y: -30, duration: .2 }, .25)
      .to(".ab-map__svg", { scale: 4.2, duration: .6, ease: "power2.inOut" }, .25)
      .from(".ab-map__pins circle", { scale: 0, transformOrigin: "center", duration: .05, stagger: .008 }, .7)
      .from(".ab-map__pins text", { autoAlpha: 0, duration: .1 }, .8);

    $$(".ab-cork__note").forEach((n, i) => gsap.from(n, { y: -60, scale: 1.25, autoAlpha: 0, rotation: (i % 2 ? 14 : -14), duration: .7, ease: CustomEase.create("wrPop" + i, "0.34, 1.45, 0.64, 1"), delay: i * .12, scrollTrigger: { trigger: ".ab-cork", start: "top 55%" } }));

    const spans = $$(".ab-rules__p span");
    ScrollTrigger.create({ trigger: ".ab-rules", start: "top 80%", end: "bottom 40%", scrub: true, onUpdate: (s) => spans.forEach((sp, i) => sp.classList.toggle("on", i / spans.length < s.progress)) });
  });
  if (reduced) { $(".ab-scramble__text").textContent = $(".ab-scramble__text").dataset.text; $$(".ab-film__words span").forEach((w) => (w.style.opacity = 1)); $$(".ab-big__line").forEach((l) => (l.style.clipPath = "none")); $$(".ab-rules__p span").forEach((s) => s.classList.add("on")); }

  // Film video: like the original, no silent preload — pressing the video or play button toggles play↔pause, the bar dot and time follow the video, and at the end it returns to the start
  const film = $(".ab-film__video"), vid = film?.querySelector("video");
  if (vid) {
    const knob = $(".ab-film__bar b"), time = $(".ab-film__bar span"), play = $(".ab-film__play");
    const mmss = (t) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}`;
    const sync = () => { const d = vid.duration || 32; knob.style.left = `${(vid.currentTime / d) * 100}%`; time.textContent = `${mmss(vid.currentTime)} / ${mmss(d)}`; };
    const toggle = () => { if (vid.paused) vid.play().catch(() => {}); else vid.pause(); };
    vid.addEventListener("click", toggle); play.addEventListener("click", toggle);
    vid.addEventListener("play", () => { film.classList.add("is-playing", "is-started"); play.setAttribute("aria-label", "Pause"); });
    vid.addEventListener("pause", () => { film.classList.remove("is-playing"); play.setAttribute("aria-label", "Play"); });
    vid.addEventListener("ended", () => { vid.currentTime = 0; film.classList.remove("is-started"); sync(); });
    vid.addEventListener("timeupdate", sync);
    vid.addEventListener("loadedmetadata", sync);
  }

  // Corkboard note drag: lifts slightly when grabbed (1.06x · shadow) and is pinned again when released
  $$(".ab-cork__note").forEach((n) => {
    let sx, sy, ox, oy;
    n.addEventListener("pointerdown", (e) => {
      sx = e.clientX; sy = e.clientY; ox = gsap.getProperty(n, "x"); oy = gsap.getProperty(n, "y");
      n.setPointerCapture(e.pointerId);
      n.dataset.cursor = "stick";
      gsap.to(n, { scale: 1.06, boxShadow: "0 20px 40px rgba(0,0,0,.35)", duration: .2, ease: "power2.out" });
      const move = (ev) => gsap.set(n, { x: ox + ev.clientX - sx, y: oy + ev.clientY - sy });
      const up = () => { n.removeEventListener("pointermove", move); n.dataset.cursor = "peel"; gsap.to(n, { scale: 1, boxShadow: "0 8px 20px rgba(0,0,0,.25)", duration: .3, ease: "back.out(2)" }); };
      n.addEventListener("pointermove", move);
      n.addEventListener("pointerup", up, { once: true });
    });
  });
})();
