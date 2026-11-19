// Home page — carries over the order and values of the original Nuxt components (Loading, Opening, Index, Footer, Modal) as they are.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const stage = $(".kd-stage"), base = $(".kd-stage__base"), wrap = $(".kd-slides-wrap"), slides = $(".kd-slides");
  const yearEl = $(".kd-current .year"), loading = $(".kd-loading"), opening = $(".kd-opening"), hud = $(".kd-hud"), modal = $(".kd-modal");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let pageReady = false;
  const ARROW = '<svg viewBox="0 0 11 8"><path d="M10.35 4.35a.5.5 0 0 0 0-.7L7.17.46a.5.5 0 1 0-.7.71L9.29 4 6.46 6.83a.5.5 0 1 0 .71.7zM0 4.5h10v-1H0z"/></svg>';

  $$(".kd-build[data-art]").forEach(window.kdArt);
  $$(".kd-static").forEach(window.kdPerson);
  $$(".kd-pill__ico").forEach((el) => { el.innerHTML = ARROW; });
  $$(".kd-people").forEach((el) => { if (el.style.right) el.style.left = "auto"; });
  $$(".kd-kamis").forEach((k) => { for (let i = 0; i < 24; i++) k.append(document.createElement("i")); });

  // ───── Loader — progress shown in Chinese numerals (〇…九, 100 is 百) ─────
  const numEl = $(".kd-loading__num");
  const L = { loaded: 0, flg: true };
  const kanji = (e) => { const t = ["〇", "一", "二", "三", "四", "五", "六", "七", "八", "九"]; if (e >= 100) return "百"; if (e < 10) return t[e]; const a = Math.floor(e / 10), i = e % 10; return t[a] + (i === 0 ? "〇" : t[i]); };
  const loadingAc = () => { numEl.textContent = kanji(Math.ceil(L.loaded)); if (L.flg) requestAnimationFrame(loadingAc); };
  const changeLoaded = (d, add) => { if (L.flg) gsap.to(L, { duration: d, loaded: L.loaded + add, overwrite: true, ease: "cubic.out" }); };
  const rnd = () => Math.random() * 15 + 15;
  const chara = lottie.loadAnimation({ container: $(".kd-loading__chara .inner"), renderer: "svg", loop: true, autoplay: true, animationData: window.kdWalker({ c1: "--site-cloth2", cart: true }) });
  chara.setSpeed(3);
  requestAnimationFrame(loadingAc);
  gsap.delayedCall(.4, () => {
    gsap.to([numEl, $(".kd-loading__chara")], { duration: .6, alpha: 1, ease: "expo.out" });
    changeLoaded(10, rnd());
  });
  const removeLoading = () => {
    gsap.to(L, { duration: 2, loaded: 99, overwrite: true, ease: "cubic.out" });
    gsap.delayedCall(2, () => {
      L.flg = false;
      gsap.to(loading, { duration: .6, autoAlpha: 0, overwrite: true, ease: "expo.out" });
      gsap.delayedCall(.6, () => chara.stop());
    });
  };

  // ───── First popup ─────
  gsap.to(opening, { duration: .6, alpha: 1, delay: .3, ease: "expo.out" });
  const sound = $(".kd-hud__sound");
  $$(".kd-opening .bt").forEach((bt) => bt.addEventListener("click", () => {
    const mute = bt.classList.contains("bgm-off");
    bt.classList.add("current");
    sound.classList.toggle("mute", mute);
    gsap.to([$(".kd-opening__bg"), $(".kd-opening__box")], { duration: .6, alpha: 0, overwrite: true, ease: "expo.out" });
    gsap.to(opening, { duration: .6, autoAlpha: 0, delay: 2, overwrite: true, ease: "expo.out", onComplete: () => { opening.style.display = "none"; } });
    startAc();
  }, { once: true }));
  sound.addEventListener("click", () => sound.classList.toggle("mute"));

  // ───── Walking person — goes back and forth over a set distance (px) at a set speed (px/s), flipping left-right when turning ─────
  const people = $$(".kd-people");
  let ready = 0;
  const need = people.length + 4;
  const one = () => { if (++ready === need) checkLoaded(); };
  const whenReady = (anim, fn) => { let done = false; const go = () => { if (!done) { done = true; fn(); } }; if (anim.isLoaded) go(); else { anim.addEventListener("DOMLoaded", go); anim.addEventListener("data_ready", go); } };
  const walk = (inner, t, d, dir) => {
    let sx = 1, m = t;
    if (dir !== "right") { m = -t; sx = -1; }
    gsap.set(inner, { scaleX: sx });
    gsap.to(inner, { duration: t / d, x: m, ease: "linear", onComplete: () => back(inner, t, d, dir) });
  };
  const back = (inner, t, d, dir) => {
    gsap.set(inner, { scaleX: dir !== "right" ? 1 : -1 });
    gsap.to(inner, { duration: t / d, x: 0, ease: "linear", onComplete: () => walk(inner, t, d, dir) });
  };
  people.forEach((p) => {
    const look = Object.fromEntries((p.dataset.look || "").split(";").filter(Boolean).map((kv) => kv.split(":")));
    const [t, d, dir] = p.dataset.walk.split(",");
    const inner = $(".inner", p);
    const a = lottie.loadAnimation({ container: inner, renderer: "svg", loop: true, autoplay: false, animationData: window.kdWalker({ c1: look.c1, long: look.long === "1", hat: look.hat === "1", cart: look.cart === "1" }), rendererSettings: { progressiveLoad: true } });
    whenReady(a, () => {
      one();
      if (reduce) { a.goToAndStop(0, true); return; }
      walk(inner, +t, +d, dir);
      a.setSpeed(Math.random() * .5 + 1.2);
      a.setSubframe(false);
      a.goToAndPlay(Math.floor(Math.random() * a.totalFrames), true);
    });
  });

  // ───── Object Lottie — plays once when it arrives ─────
  const objData = [window.kdTuna, window.kdRainbow, window.kdKusudama, window.kdBalloons];
  const objs = objData.map((fn, i) => {
    const a = lottie.loadAnimation({ container: $(`.kd-obj${i + 1} .inner`), renderer: "svg", loop: false, autoplay: false, animationData: fn(), rendererSettings: { progressiveLoad: true } });
    whenReady(a, one);
    return a;
  });

  document.fonts.ready.then(() => { pageReady = true; changeLoaded(5, rnd()); changeLoaded(5, rnd()); checkLoaded(); });
  function checkLoaded() {
    if (!pageReady || ready < need || checkLoaded.done) return;
    checkLoaded.done = true;
    gsap.delayedCall(1, () => { removeLoading(); addAc(); });
  }
  function addAc() {
    gsap.set(wrap, { filter: "sepia(0.5) grayscale(70%)" });
    gsap.set(stage, { alpha: 0 });
    gsap.to([stage, hud], { duration: .6, alpha: 1, overwrite: true, ease: "expo.out" });
  }

  // ───── Start — sepia clears in 2s (4s delay) and horizontal scroll turns on ─────
  let running = false;
  const qx = gsap.quickTo(slides, "x", { duration: .6, ease: "cubic.out" });
  function startAc() {
    gsap.to(wrap, { duration: reduce ? 0 : 2, filter: "sepia(0) grayscale(0%)", delay: reduce ? 0 : 4, ease: "cubic.out" });
    initScroll();
    if (!reduce) cloudsLoop();
  }
  function initScroll() {
    running = true;
    base.style.height = slides.clientWidth / .6 + "px";
    yearsChange(0);
    const pills = $$(".kd-build .kd-pill, .kd-next .kd-pill");
    let tm = null;
    stage.addEventListener("wheel", () => {
      pills.forEach((b) => { b.style.pointerEvents = "none"; });
      clearTimeout(tm);
      tm = setTimeout(() => pills.forEach((b) => { b.style.pointerEvents = "auto"; }), 100);
    }, { passive: true });
    requestAnimationFrame(rendering);
  }
  addEventListener("resize", () => { if (running) base.style.height = slides.clientWidth / .6 + "px"; });

  const clouds = $(".kd-clouds svg");
  let cloudX = 0;
  function cloudsLoop() {
    cloudX = cloudX === 100 ? 0 : 100;
    gsap.to(clouds, { duration: 30, x: cloudX, overwrite: true, ease: "linear", onComplete: cloudsLoop });
  }

  const cur = { year: 1925 };
  let curIndex = -1;
  function yearsChange(i) {
    gsap.to(cur, { duration: reduce ? 0 : .6, year: [1925, 1950, 1975, 2000][i], overwrite: true, ease: "none", onUpdate: () => { yearEl.textContent = Math.floor(cur.year); } });
  }

  const layers = $$(".kd-build[data-par]").map((el) => [el, +el.dataset.par]);
  const walkers = $$(".kd-people, .kd-static");
  const line = $(".kd-hud__navi .line");
  const at = (sel) => $(sel);
  const obj = { tuna: at(".kd-obj1"), rainbow: at(".kd-obj2"), kusu: at(".kd-obj3"), next: at(".kd-obj4"), hospital: at(".kd-slide2 .kd-build[data-art=hospital]"), fest: at(".kd-build[data-art=festival]"), farm: at(".kd-build[data-art=farm]") };
  const done = {};
  function rendering() {
    if (!running) return;
    const iw = innerWidth, ih = innerHeight;
    const l = stage.scrollTop / Math.max(1, stage.scrollHeight - ih);
    const s = (slides.clientWidth - iw) * l;
    if (reduce) gsap.set(slides, { x: -s }); else qx(-s);
    for (const [el, k] of layers) el.style.transform = `translateX(${l * k}px)`;
    for (const el of walkers) el.style.transform = `translateX(${l * -1400}px)`;

    const kids = slides.children;
    let f = 0, A = 0, Q = 0, S = 0;
    for (let r = 0; r < kids.length; r++) { Q = f; f += kids[r].clientWidth; if (s < f) { A = r; S = kids[r].clientWidth; break; } }
    if (s >= f) { A = kids.length - 1; S = kids[A].clientWidth; Q = f - S; }
    const q = Math.floor(Math.min(Math.max((s - Q) / S * 100, 0), 100));

    const left = wrap.getBoundingClientRect().left;
    const x = (el) => el.getBoundingClientRect().left - left;
    if (!done.hospital && -iw / 2 + x(obj.hospital) < 0) { done.hospital = true; $$("i", $(".kd-kamis", obj.hospital)).forEach(kami); }
    if (!done.fest && -iw / 2 + x(obj.fest) < 0) { done.fest = true; $$("i", $(".kd-kamis", obj.fest)).forEach(kami); }
    if (!done.farm && -iw / 2 + x(obj.farm) < 0) { done.farm = true; gsap.fromTo($(".kd-orange"), { y: 0 }, { duration: 1, y: 40 * .125 + "vh", ease: "expo.inOut" }); }
    if (!done.tuna && -iw / 2 + x(obj.tuna) < 0) { done.tuna = true; objs[0].goToAndPlay(1, true); }
    if (!done.rainbow && -iw + x(obj.rainbow) < 0) { done.rainbow = true; objs[1].goToAndPlay(1, true); }
    if (!done.kusu && -iw + x(obj.kusu) < 0) {
      done.kusu = true;
      objs[2].playSegments([0, 10], true);
      $$(".kd-fusens .fusen").forEach((fu) => {
        gsap.set(fu, { y: Math.random() * 100 + 100 });
        gsap.to(fu, { duration: .6, alpha: 1, ease: "cubic.out" });
        gsap.to(fu, { duration: Math.random() * 1 + 2, y: 0, ease: "cubic.out" });
      });
    }
    if (!done.next && A === 3 && -iw + x(obj.next) < 0) {
      done.next = true;
      objs[3].playSegments([0, 30], true);
      gsap.to(".kd-next .txts", { duration: 1, alpha: 1, ease: "cubic.out" });
    }
    if (curIndex !== A) { curIndex = A; yearsChange(A); }
    if (A === 3) slides.style.setProperty("--num2", Math.min(q, 50) / 50 * .8);
    else slides.style.setProperty("--num2", 0);
    gsap.set(line, { x: l * 100 * 5.12 + "%" });
    requestAnimationFrame(rendering);
  }

  // Bottom timeline ticks — auto-scroll 2s to the start of that era
  $$(".kd-hud__navi .year").forEach((y) => y.addEventListener("click", () => {
    if (!running) return;
    const i = +y.dataset.i, w = slides.clientWidth - innerWidth, k = slides.children;
    const widths = [0, k[0].clientWidth, k[0].clientWidth + k[1].clientWidth, k[0].clientWidth + k[1].clientWidth + k[2].clientWidth];
    const t = i === 0 ? 0 : w / (widths[i] + 10);
    const d = t === 0 ? 0 : (stage.scrollHeight - innerHeight) / t;
    gsap.to(stage, { duration: reduce ? 0 : 2, scrollTop: d, ease: "cubic.inOut" });
  }));

  // Confetti — the same random ranges as the original kamiParticle. Color is one of six skin variables instead of a random hsl
  const KAMI = ["--site-red", "--site-yellow", "--kf-ink", "--site-tree", "--site-cloth4", "--kf-accent"];
  function kami(el) {
    if (reduce) return;
    const x0 = Math.random() * 400 - 200 + 60, y0 = Math.random() * 300 - 100, sc = Math.random() + .1;
    const sx = Math.random() * 20 - 10, sy = Math.random() * 10 - 5, dur = Math.random() * 3 + 5, y1 = y0 + Math.random() * 100 + 100, rot = Math.random() * 60 + 30;
    el.style.backgroundColor = `var(${KAMI[Math.floor(Math.random() * KAMI.length)]})`;
    gsap.set(el, { alpha: 0, x: x0, y: y0, skewX: sx, skewY: sy, scale: sc });
    gsap.to(el, { duration: dur, rotation: rot, y: y1, ease: "linear" });
    gsap.to(el, { duration: .6, alpha: 1, ease: "expo.out" });
    gsap.to(el, { duration: .6, alpha: 0, delay: dur - .6, ease: "expo.out", onComplete: () => kami(el) });
  }

  // ───── Modal — the white panel on the right floats up in .6s ─────
  const mTtl = $(".ttl", modal), mPic = $(".pics .wf-img", modal), mBox = $(".kd-modal__content", modal), mChara = $(".kd-quiz .chara", modal), mRes = $(".kd-quiz .result", modal);
  function modalOpen(btn) {
    mTtl.textContent = btn.querySelector(".kd-pill__txt").textContent;
    mPic.dataset.label = btn.dataset.photo || "Old photo";
    modal.classList.toggle("is-quiz", !!btn.dataset.quiz);
    mRes.textContent = "";
    modal.style.display = "block";
    gsap.to(modal, { duration: .6, autoAlpha: 1, overwrite: true, ease: "expo.out" });
    stage.style.overflowY = "hidden";
    mBox.scrollTop = 0;
  }
  function modalClose() {
    gsap.to(modal, { duration: .6, autoAlpha: 0, overwrite: true, ease: "expo.out", onComplete: () => { modal.style.display = "none"; } });
    stage.style.overflowY = "";
  }
  $$(".kd-build button.kd-pill").forEach((b) => b.addEventListener("click", () => modalOpen(b)));
  $(".kd-modal__close").addEventListener("click", modalClose);
  $(".kd-modal__bg").addEventListener("click", modalClose);
  $$(".kd-quiz [data-ans]").forEach((b) => b.addEventListener("click", () => {
    gsap.set(mChara, { rotateY: 90 });
    gsap.to(mChara, { duration: .6, rotateY: 0, ease: "expo.out" });
    mRes.textContent = b.dataset.ans === "o" ? "Correct! Add a one-line explanation here." : "Too bad! Put the answer and explanation here.";
  }));
})();
