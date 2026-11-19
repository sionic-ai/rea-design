(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  // The original uses Velocity 1.3 Penner curves (Bezier approximations) — by the same numbers, not by name
  const E = {
    expoOut: kfFx.ease("0.19,1,0.22,1", "expo.out"),
    expoIn: kfFx.ease("0.95,0.05,0.795,0.035", "expo.in"),
    quintOut: kfFx.ease("0.23,1,0.32,1", "power4.out"),
    quintInOut: kfFx.ease("0.86,0,0.07,1", "power4.inOut"),
    quartOut: kfFx.ease("0.165,0.84,0.44,1", "power3.out"),
    cubicOut: kfFx.ease("0.215,0.61,0.355,1", "power2.out"),
    quadOut: kfFx.ease("0.25,0.46,0.45,0.94", "power1.out"),
    sineInOut: kfFx.ease("0.445,0.05,0.55,0.95", "sine.inOut"),
    sineOut: kfFx.ease("0.39,0.575,0.565,1", "sine.out"),
    sineIn: kfFx.ease("0.47,0,0.745,0.715", "sine.in"),
    back: kfFx.ease("0.175,0.885,0.32,1.275", "back.out(1.7)"),
    hop: kfFx.ease("0.06,0.88,0.14,1.41", "back.out(2)"),
  };
  const body = document.body;
  const phone = matchMedia("(max-width: 767px)").matches;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const show = (el) => el && el.dispatchEvent(new Event("fx:show"));
  const after = (s, fn) => gsap.delayedCall(s, fn);

  const loader = $(".y-loader"), gate = $(".y-gate"), movie = $(".y-movie");
  const plate = $(".y-gate__plate"), gateChara = $(".y-gate__chara");
  const movieInner = $(".y-movie__inner"), movieSky = $(".y-movie__sky");

  // ---------- Things to hide at first (original init values) ----------
  const storyLines = $$(".y-story__txt p");
  const hidden = () => {
    gsap.set([".y-top__info", ".y-top__movie"], { y: 220 });
    gsap.set($$(".y-felt"), { scale: 0, opacity: 0 });
    gsap.set(".y-act--jump .y-act__img", { opacity: 0, x: -30, y: 100 });
    gsap.set([".y-act--jump .y-act__title", ".y-act--jump .y-act__desc"], { opacity: 0, y: 80 });
    gsap.set([".y-act--throw .y-act__title", ".y-act--throw .y-act__desc"], { opacity: 0, x: -200, skewX: 90 });
    gsap.set(".y-act--throw .y-act__img", { opacity: 0, x: -200 });
    gsap.set([".y-act--eat .y-act__img", ".y-act--eat .y-act__title", ".y-act--eat .y-act__desc", ".y-act__catch", ".y-act__tongue"], { opacity: 0, scale: 0 });
    gsap.set(".y-crew__c--1", { opacity: 0, x: -300, y: 160 });
    gsap.set(".y-crew__c--2", { opacity: 0, x: -220, y: 200, rotation: 50 });
    gsap.set(".y-crew__c--3", { opacity: 0, x: -260, y: 250, rotation: -50 });
    gsap.set(".y-crew__c--4", { opacity: 0, x: -450, y: 120, rotation: -50 });
    gsap.set(".y-dog__fly", { opacity: 0, x: -300, y: 400 });
    gsap.set($$(".y-dog--run .y-ch"), { opacity: 0, x: -150, y: 30, skewX: 30 });
    gsap.set(".y-dog__yarn", { opacity: 0, y: -100 });
    gsap.set($$(".y-dog--edit .y-ch"), { opacity: 0 });
    gsap.set(".y-parade span", { opacity: 0, y: -40 });
    gsap.set([".y-dog--theater .y-dog__head", ".y-dog--theater .y-dog__desc"], { opacity: 0, y: 100 });
    gsap.set(".y-sign", { opacity: 0, y: -100 });
    gsap.set(".y-sign__tulip--red", { scale: 0, rotation: 90 });
    gsap.set([".y-sign__tulip--orange", ".y-sign__smile"], { scale: 0, rotation: -90 });
    gsap.set($$(".y-am .y-tag, .y-grid4 .y-tag"), { opacity: 0, y: 100 });
    gsap.set(".y-grid4__col:first-child", { x: 151 });
    gsap.set(".y-grid4__col:last-child", { x: -151 });
    gsap.set(".y-grid4__txt", { opacity: 0, y: 50 });
  };

  // Letter splitting — the original has image pieces per letter (14·25 cells) so it enters letter by letter. Spaces between words stay as they are
  $$(".y-dog--run .y-dog__kicker, .y-dog--run .y-dog__head, .y-dog--edit .y-dog__kicker, .y-dog--edit .y-dog__head").forEach((p) => {
    const text = p.textContent;
    p.setAttribute("aria-label", text);
    p.innerHTML = text.split(" ").map((w) => `<span class="y-word" aria-hidden="true">${[...w].map((c) => `<span class="y-ch">${c}</span>`).join("")}</span>`).join(" ");
  });

  // ---------- Loader → sound gate → (if first visit) video → main ----------
  const hideLoader = () => gsap.to(loader, { opacity: 0, duration: 0.6, ease: E.sineOut, onComplete: () => loader.remove() });

  const showGate = () => {
    gsap.set(plate, { scale: 0.7, opacity: 0 });
    gsap.to(plate, { scale: 1, opacity: 1, duration: 0.5, ease: E.back, delay: 0.5 });
    gsap.set(gateChara, { y: 60, opacity: 0 });
    gsap.to(gateChara, { y: 0, opacity: 1, duration: 0.5, ease: E.back, delay: 0.8 });
  };
  $$(".y-gate__btn").forEach((b) => {
    b.addEventListener("mouseover", () => { b.classList.add("is-over"); gsap.to(b, { scale: 1.07, duration: 0.1, ease: E.expoOut, overwrite: true }); });
    b.addEventListener("mouseout", (e) => { if (b.contains(e.relatedTarget)) return; b.classList.remove("is-over"); gsap.to(b, { scale: 1, duration: 0.1, ease: E.expoOut, overwrite: true }); });
    b.addEventListener("click", () => soundSelected(b.dataset.sound === "on"));
    b.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); soundSelected(b.dataset.sound === "on"); } });
  });
  // Original Event.enableTimer — a transparent shield that blocks input during the transition
  const enable = $(".y-enable");
  let enableT = 0;
  const enableTimer = (s) => { enable.classList.add("is-on"); clearTimeout(enableT); enableT = setTimeout(() => enable.classList.remove("is-on"), s * 1000); };
  // Original Util.dispose — empties the panel once everything has cleared
  const disposeGate = () => { gate.innerHTML = ""; gate.style.pointerEvents = "none"; };
  const soundSelected = (on) => {
    ySound.set(on);
    const visited = localStorage.getItem("kf-yarn-date") != null;
    localStorage.setItem("kf-yarn-date", String(Date.now()));
    sessionStorage.setItem("kf-yarn-visited", "true");
    syncSoundBtn();
    if (visited) {
      gsap.to(gate, { opacity: 0, duration: 1, ease: E.sineInOut, onComplete: disposeGate });
      showTop(1.5);
    } else {
      gsap.to(gate, { opacity: 0, duration: 0.5, ease: E.sineInOut, onComplete: disposeGate });
      showMovie();
    }
    enableTimer(0.5);
    setTimeout(() => ySound.warm(), 2200);
  };

  let movieTimer = null;
  const dropY = () => -(innerHeight * 0.5) - 630 * 0.5;
  const showMovie = () => {
    movie.classList.add("is-on");
    gsap.set(movieInner, { y: dropY() });
    gsap.to(movieInner, { y: 0, duration: 0.8, ease: E.quintOut, delay: 0.8 });
    // The original cuts video playback at 67 seconds and moves on to the main content
    movieTimer = after(0.8 + 0.8 + 67, movieEnd);
  };
  const movieEnd = () => {
    movieTimer?.kill();
    gsap.to(movieInner, { y: dropY(), duration: 0.5, ease: E.sineInOut, overwrite: true });
    gsap.to(movieSky, { opacity: 0, duration: 1, delay: 0.4, ease: E.sineInOut, onComplete: () => movie.remove() });
    showTop(1.5);
  };
  $(".y-pill--skip").addEventListener("click", (e) => { e.preventDefault(); movieEnd(); });

  // ---------- Hero ----------
  let scrollReady = false;
  const showTop = (wait) => {
    body.classList.remove("is-intro");
    ScrollTrigger.refresh();
    gsap.to([".y-top__info", ".y-top__movie"], { y: 0, duration: 0.5, ease: E.quartOut, delay: wait, onComplete: once(() => after(0.8, () => show($(".y-ribbon--story")))) });
    flowerLoop();
    after(wait, () => { scrollReady = true; armScroll(); });
  };
  function once(fn) { let done = false; return () => { if (!done) { done = true; fn(); } }; }

  const flower = $(".y-top__flower");
  let flowerTl = null;
  const flowerLoop = () => {
    flowerTl?.kill();
    flowerTl = gsap.timeline({ repeat: -1 })
      .to(flower, { rotation: 25, duration: 1.3, ease: E.sineInOut })
      .to(flower, { rotation: 0, duration: 1.3, ease: E.sineInOut }, "+=0.6")
      .to({}, { duration: 0.6 });
  };
  const card = $(".y-top__movie");
  const lift = $$(".y-top__device, .y-top__screen, .y-top__word, .y-top__arrow");
  card.addEventListener("pointerenter", () => {
    flowerTl?.kill();
    gsap.to(lift, { y: -12, duration: 0.2, ease: E.quintOut, overwrite: true });
    gsap.to(".y-top__monitor", { y: -12, opacity: 0, duration: 0.2, ease: E.quintOut, overwrite: true });
    gsap.timeline()
      .to(flower, { rotation: 13, scaleX: 1.2, scaleY: 0.8, duration: 0.02, ease: E.quartOut, overwrite: true })
      .to(flower, { scaleX: 1.08, scaleY: 1.08, duration: 0.2, ease: E.back });
  });
  card.addEventListener("pointerleave", () => {
    gsap.to(lift, { y: 0, duration: 0.2, ease: E.quintOut, overwrite: true });
    gsap.to(".y-top__monitor", { y: 0, opacity: 1, duration: 0.2, ease: E.quintOut, overwrite: true });
    gsap.to(flower, { rotation: 0, scaleX: 1, scaleY: 1, duration: 0.4, ease: E.cubicOut, overwrite: true, onComplete: flowerLoop });
  });
  card.addEventListener("click", (e) => { e.preventDefault(); ySound.blip(520); });

  const soundBtn = $(".y-soundbtn");
  const syncSoundBtn = () => soundBtn.setAttribute("aria-pressed", String(ySound.on));
  soundBtn.addEventListener("click", () => { ySound.set(!ySound.on); syncSoundBtn(); ySound.blip(700); });

  // ---------- Once when each section becomes visible — the original runs when it passes ”section top − screen height + offset” ----------
  const at = (sel, plus, fn) => ScrollTrigger.create({ trigger: sel, start: `top bottom-=${plus}`, once: true, onEnter: fn });
  let armed = false;
  function armScroll() {
    if (armed) return;
    armed = true;
    at(".y-story", 600, () => {
      storyLines.forEach((p, i) => gsap.to(p, { y: 0, opacity: 1, duration: 1, delay: i * 0.1, ease: E.quadOut }));
      gsap.to(".y-story__shade", { opacity: 1, duration: 1, ease: E.sineInOut });
    });
    at(".y-action", 450, actionShow1);
    at(".y-action", 1150, actionShow2);
    at(".y-dogrun", 400, dogrunShow);
    at(".y-dogrun", 700, editShow);
    at(".y-dogrun", 1400, theaterShow);
    at(".y-amiibo", 300, () => show($(".y-ribbon--amiibo")));
    at(".y-amiibo", 600, () => amSecShow($(".y-am--1")));
    at(".y-amiibo", 1000, () => show($(".y-set .y-pill")));
    at(".y-amiibo", 1300, () => amSecShow($(".y-am--3")));
    at(".y-amiibo", 1800, gridShow);
  }

  function actionShow1() {
    const t = gsap.timeline();
    t.to(".y-act--jump .y-act__img", { opacity: 1, x: 0, y: 0, duration: 1, ease: E.sineInOut }, 0)
      .to(".y-act--jump .y-act__title", { opacity: 1, y: 0, duration: 1.2, ease: E.sineInOut }, 0.2)
      .to(".y-act--jump .y-act__desc", { opacity: 1, y: 0, duration: 1.2, ease: E.sineInOut }, 0.4)
      .to(".y-act--throw .y-act__title", { opacity: 1, x: 0, duration: 0.5, ease: E.expoOut }, 0.8)
      .to(".y-act--throw .y-act__title", { skewX: 0, duration: 0.5, ease: E.sineOut }, 0.8)
      .to(".y-act--throw .y-act__desc", { opacity: 1, x: 0, duration: 0.5, ease: E.expoOut }, 0.9)
      .to(".y-act--throw .y-act__desc", { skewX: 0, duration: 0.5, ease: E.sineOut }, 0.9)
      .to(".y-act--throw .y-act__img", { opacity: 1, x: 0, duration: 0.5, ease: E.expoOut }, 1.0)
      .to([".y-act--eat .y-act__img", ".y-act__catch", ".y-act__tongue"], { opacity: 1, duration: 0.5, ease: E.expoOut }, 1.3)
      .to([".y-act--eat .y-act__img", ".y-act__catch", ".y-act__tongue"], { scale: 1, duration: 0.5, ease: E.back }, 1.3)
      .to(".y-act--eat .y-act__title", { opacity: 1, scale: 1, duration: 0.5, ease: E.back }, 1.4)
      .to(".y-act--eat .y-act__desc", { opacity: 1, scale: 1, duration: 0.5, ease: E.back }, 1.5)
      .add(() => { $$(".y-act__area").forEach((a) => a.classList.add("is-on")); badge($(".y-felt--1")); }, 2.0);
  }
  function actionShow2() {
    badge($(".y-felt--2"));
    [[".y-crew__c--3", 1], [".y-crew__c--4", 1.08], [".y-crew__c--2", 1.16], [".y-crew__c--1", 1.24]].forEach(([s, d]) => {
      gsap.to(s, { opacity: 1, x: 0, y: 0, duration: 0.7, delay: d, ease: E.expoOut });
      gsap.to(s, { rotation: 0, duration: 0.7, delay: d, ease: E.quartOut });
    });
  }
  // Original showBtnSetA — the whole badge fades 0→1 (.4s quart.out) while the inner button pops in at the same time
  function badge(el) {
    gsap.to(el, { opacity: 1, scale: 1, duration: 0.4, ease: E.quartOut });
    show(el.querySelector(".y-pill"));
  }

  // Verb character hand reactions: flying repeats up and down, throwing pops then drops, eating shrinks then springs
  const jump = $(".y-act--jump .y-act__img");
  let jumpTl = null;
  $(".y-act__area--jump").addEventListener("pointerenter", () => {
    ySound.blip(760);
    gsap.killTweensOf(jump, "y");
    jumpTl = gsap.timeline({ repeat: -1 }).to(jump, { y: -30, duration: 0.5, ease: E.sineInOut }).to(jump, { y: -10, duration: 0.5, ease: E.sineInOut });
  });
  $(".y-act__area--jump").addEventListener("pointerleave", () => { jumpTl?.kill(); gsap.to(jump, { y: 0, duration: 0.6, ease: E.sineOut }); });
  const throwImg = $(".y-act--throw .y-act__img");
  $(".y-act__area--throw").addEventListener("pointerenter", () => {
    ySound.blip(600);
    gsap.timeline().to(throwImg, { y: -24, duration: 0.16, ease: E.quartOut, overwrite: true }).to(throwImg, { y: 0, duration: 0.14, delay: 0.03, ease: kfFx.ease("0.895,0.03,0.685,0.22", "power3.in") });
  });
  const eatImg = $(".y-act--eat .y-act__img");
  $(".y-act__area--eat").addEventListener("pointerenter", () => {
    ySound.blip(440);
    gsap.timeline().to(eatImg, { scale: 0.8, duration: 0.01, ease: E.expoOut, overwrite: true }).to(eatImg, { scale: 1, duration: 0.2, ease: E.back });
  });

  // ---------- Dog run ----------
  function dogrunShow() {
    gsap.to(".y-dog__fly", { opacity: 1, duration: 0.5, ease: E.expoOut });
    gsap.to(".y-dog__fly", { x: 0, duration: 0.5, ease: E.quadOut });
    gsap.to(".y-dog__fly", { y: 0, duration: 0.5, ease: E.hop });
    $$(".y-dog--run p").forEach((p) => $$(".y-ch", p).forEach((c, i) => {
      gsap.to(c, { opacity: 1, x: 0, y: 0, duration: 0.6, delay: 0.1 + i * 0.1, ease: E.expoOut });
      gsap.to(c, { skewX: 0, duration: 0.6, delay: 0.1 + i * 0.1, ease: E.sineOut });
    }));
    after(0.6, () => show($(".y-dog--run .y-pill")));
  }
  // A yarn skein drops, flattens, then unfolds, and letters stamp in like a seal, from 1.3x and tilted to .8→1
  function editShow() {
    const yarn = $(".y-dog__yarn");
    gsap.timeline()
      .to(yarn, { opacity: 1, duration: 0.3, ease: E.expoOut }, 0)
      .to(yarn, { y: 0, duration: 0.3, ease: E.expoIn }, 0)
      .to(yarn, { scaleX: 1.2, scaleY: 0.7, duration: 0.05, ease: E.expoOut })
      .to(yarn, { scaleX: 1, scaleY: 1, duration: 0.2, ease: E.expoOut });
    const stamp = (c, d) => {
      const r = (15 + Math.random() * 10) * (Math.random() > 0.5 ? -1 : 1);
      gsap.timeline({ delay: d })
        .set(c, { opacity: 1, scale: 1.3, rotation: r })
        .set(c, { scale: 0.8 }, 0.04)
        .to(c, { scale: 1, rotation: 0, duration: 0.07, ease: E.sineIn }, 0.08);
    };
    const [kick, head] = $$(".y-dog--edit p");
    $$(".y-ch", kick).forEach((c, i) => stamp(c, 0.2 + i * 0.05));
    $$(".y-ch", head).forEach((c, i) => stamp(c, 0.8 + i * 0.05));
    after(1.1, () => show($(".y-dog--edit .y-pill")));
    gsap.to(".y-parade span", { opacity: 1, y: 0, duration: 0.4, ease: E.back, stagger: 0.08, delay: 0.3 });
  }
  function theaterShow() {
    gsap.to([".y-dog--theater .y-dog__head", ".y-dog--theater .y-dog__desc"], { opacity: 1, y: 0, duration: 0.6, ease: E.expoOut, stagger: 0.1 });
    gsap.to(".y-sign", { opacity: 1, y: 0, duration: 0.6, delay: 0.2, ease: E.expoOut });
    gsap.to(".y-sign__flowers svg", { scale: 1, rotation: 0, duration: 0.5, delay: 0.5, stagger: 0.1, ease: E.back });
  }
  // Film strip — the original shifts the background by (now − start) × −.06px every frame only while the dog-run section is on screen (60px per second). It rewinds every 300px slot
  const track = $(".y-film__track");
  let t0 = 0;
  const filmTick = () => { track.style.transform = `translateX(${-(((performance.now() - t0) * 0.06) % 300)}px)`; };
  // Puppy on film — wags its tail every 2.4s, then hops
  const pal = $(".y-dog__filmpal");
  const palTl = gsap.timeline({ repeat: -1, repeatDelay: 1.6, paused: true })
    .to(pal, { x: 5, duration: 0.1, ease: "none", yoyo: true, repeat: 3 })
    .to(pal, { y: -35, rotation: -60, duration: 0.2, ease: E.cubicOut })
    .to(pal, { y: 0, rotation: 0, duration: 0.2, ease: E.cubicOut });
  const filmOn = (on) => {
    gsap.ticker.remove(filmTick);
    if (on) { t0 = performance.now(); gsap.ticker.add(filmTick); palTl.play(); } else palTl.pause();
  };
  if (!reduce) ScrollTrigger.create({ trigger: ".y-dogrun", start: "top bottom", end: "bottom top", onToggle: (st) => filmOn(st.isActive) });

  // ---------- Figure section ----------
  function amSecShow(sec) {
    gsap.to(sec.querySelector(".y-tag"), { opacity: 1, y: 0, duration: 0.7, ease: E.expoOut });
    after(0.8, () => show(sec.querySelector(".y-pill")));
  }
  function gridShow() {
    gsap.to(".y-grid4__col", { x: 0, duration: 0.7, ease: E.expoOut });
    gsap.to(".y-grid4 .y-tag", { opacity: 1, y: 0, duration: 0.8, delay: 0.5, ease: E.expoOut });
    gsap.to(".y-grid4__txt", { opacity: 1, y: 0, duration: 0.8, delay: 0.8, ease: E.expoOut });
    after(1.1, () => show($(".y-pill--list")));
  }

  // Back to top — on hover the character bobs 20px and the arrow squashes vertically then springs back, on click it rises with 1.3s quint.inOut
  const top = $(".y-pagetop"), topChara = $(".y-pagetop__chara"), topArrow = $(".y-pagetop__arrow");
  let topTl = null;
  top.addEventListener("pointerenter", () => {
    topTl?.kill();
    topTl = gsap.timeline({ repeat: -1 }).to(topChara, { y: -20, duration: 0.6, ease: E.sineInOut }).to(topChara, { y: 0, duration: 0.6, ease: E.sineInOut });
    gsap.timeline().to(topArrow, { scaleY: 0.7, duration: 0.05, ease: E.quintOut, overwrite: true }).to(topArrow, { scaleY: 1, duration: 0.2, ease: E.back });
  });
  top.addEventListener("pointerleave", () => { topTl?.kill(); gsap.to(topChara, { y: 0, duration: 0.6, ease: E.sineOut }); });
  top.addEventListener("click", (e) => {
    e.preventDefault();
    const o = { y: scrollY };
    gsap.to(o, { y: 0, duration: reduce ? 0 : 1.3, ease: E.quintInOut, onUpdate: () => scrollTo(0, o.y) });
  });

  // ---------- Knitted menu board — rises in .3s after scrolling 300px, drops in .4s when scrolling up, and sticks on top of the tail strip when it touches it ----------
  const dock = $(".y-dock"), band = $(".y-foot__band");
  let dockShown = false;
  const dockScroll = () => {
    if (phone || body.classList.contains("is-intro")) return;
    const landed = scrollY + innerHeight > band.getBoundingClientRect().top + scrollY;
    dock.classList.toggle("is-landed", landed);
    const want = scrollY >= 300;
    if (want === dockShown) return;
    dockShown = want;
    gsap.to(dock, { y: want ? 0 : 185, duration: want ? 0.3 : 0.4, ease: E.quintOut, overwrite: true });
  };
  addEventListener("scroll", dockScroll, { passive: true });

  // ---------- Start ----------
  if (phone || reduce) {
    // Phone (original sp version) · reduced motion go straight to the main part without the entrance gate·video, with nothing hidden
    gate.remove(); movie.remove();
    body.classList.remove("is-intro");
    if (reduce) { loader.remove(); return; }
    addEventListener("load", hideLoader, { once: true });
    $$(".y-pill[data-fx~='pill-sprout'], .y-ribbon").forEach((p) => ScrollTrigger.create({ trigger: p, start: "top 92%", once: true, onEnter: () => show(p) }));
    gsap.set($$(".y-felt"), { clearProps: "all" });
    return;
  }
  hidden();
  gsap.set(storyLines, { y: 120, opacity: 0 });
  syncSoundBtn();
  const start = () => {
    hideLoader();
    if (sessionStorage.getItem("kf-yarn-visited") === "true") {
      gate.remove(); movie.remove();
      showTop(0.7);
    } else {
      showGate();
    }
  };
  if (document.readyState === "complete") start();
  else addEventListener("load", start, { once: true });
})();
