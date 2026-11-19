// Home — opening (a revisit within 24 hours shows only the white veil), Lenis 1.3.17 (lerp .4), hero photo transitions (Swiper 3.2s · .8s · ±4 degrees) and the hand-drawn line (lottie),
// About paragraph lighting · clearing the first screen, scattered photos following late (GSAP default curve), opening the big photo, people slider (Swiper 4s), number panel donut, question accordion
(() => {
  const body = document.body;
  const still = document.documentElement.classList.contains("tg-still");

  // ---------- Opening ----------
  const KEY = "tg-visited";
  const last = +localStorage.getItem(KEY) || 0;
  const first = !last || Date.now() - last > 864e5;
  if (first) localStorage.setItem(KEY, Date.now());
  if (still) body.classList.add("is-done");
  else body.classList.add(first ? "is-opening" : "is-skipped");

  // ---------- Smooth scroll — original Lenis 1.3.17 { duration 1.2, lerp .4 }, runs on its own rAF ----------
  if (!still && window.Lenis) {
    const lenis = new Lenis({ duration: 1.2, lerp: 0.4, smooth: true });
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }

  // ---------- Hand-drawn lines (lottie) — the three in the hero play once from the start when their section becomes current, the four over photos loop for 5s once they touch the line at 20% from the screen bottom ----------
  const kvLines = [...document.querySelectorAll(".tg-kv__lottie")].map((el) => tgLines(el, el.dataset.lines, false));
  document.querySelectorAll(".tg-lines[data-lines-loop]").forEach((el) => {
    const anim = tgLines(el, el.dataset.lines, true);
    if (still) anim.still();
    else ScrollTrigger.create({ trigger: el.closest("[data-lines-trigger]") || el, start: "top bottom-=20%", once: true, onEnter: () => anim.play() });
  });

  // ---------- Hero photos — Swiper 8.4.7 creative (next slide 4deg, previous slide -4deg, .8s), rests 3.2s then advances. Advancing starts only after the opening finishes ----------
  const pad = (n) => String(n).padStart(3, "0");
  const indicate = (sw, cur, total) => {
    total.textContent = pad(sw.slides.filter((el) => !el.classList.contains("swiper-slide-duplicate")).length);
    cur.textContent = pad(sw.realIndex + 1);
  };
  const kvCur = document.querySelector("[data-kv-cur]"), kvTotal = document.querySelector("[data-kv-total]");
  const playKv = (sw) => {
    const anim = kvLines[sw.realIndex];
    if (!anim) return;
    if (still) return anim.still();
    anim.goToAndStop(0, true);
    anim.play();
  };
  const kv = new Swiper(".tg-kv__swiper", {
    effect: "creative", slidesPerView: 1, speed: still ? 0 : 800, loop: true, loopAdditionalSlides: 1, autoplay: { delay: 3200 },
    creativeEffect: { next: { rotate: [0, 0, 4] }, prev: { rotate: [0, 0, -4] } },
    on: {
      init: (sw) => sw.autoplay.stop(),
      afterInit: (sw) => { indicate(sw, kvCur, kvTotal); playKv(sw); },
      slideChange: (sw) => indicate(sw, kvCur, kvTotal),
      realIndexChange: (sw) => {
        playKv(sw);
        sw.slides.forEach((el) => el.classList.remove("is-kv-active", "is-kv-first"));
        sw.slides[sw.activeIndex].classList.add("is-kv-active");
      },
    },
  });
  const startKv = () => { kv.slides[kv.activeIndex].classList.add("is-kv-first"); kv.autoplay.start(); };
  if (!still) {
    if (first) document.querySelector(".tg-kv__slider").addEventListener("animationend", (e) => { if (e.animationName === "tg-in-move" && e.target.classList.contains("tg-kv__slider")) startKv(); });
    else body.addEventListener("animationend", (e) => { if (e.animationName === "tg-out" && e.target === body) startKv(); });
  }

  // ---------- Number panel donut ----------
  const donut = document.querySelector(".tg-data__donut");
  if (donut) {
    const vals = [18, 18, 14, 41, 9];
    const cols = [1, 2, 3, 4, 5].map((n) => `var(--site-tan-${n})`);
    const C = 2 * Math.PI * 44;
    let off = 0;
    donut.innerHTML = vals.map((v, i) => { const len = (v / 100) * C; const s = `<circle cx="80" cy="80" r="44" fill="none" style="stroke: ${cols[i]}" stroke-width="20" stroke-dasharray="${len} ${C - len}" stroke-dashoffset="${-off}" transform="rotate(-90 80 80)"/>`; off += len; return s; }).join("")
      + `<text x="22" y="40">Here 1</text><text class="big" x="16" y="56">0%</text><text x="118" y="36">Here 2</text><text class="big" x="124" y="52">00%</text><text x="122" y="104">Here 3</text><text class="big" x="124" y="120">00%</text><text x="14" y="124">Here 4</text><text class="big" x="14" y="142">00%</text><text x="84" y="150">Here 5</text><text class="big" x="78" y="164">00%</text>`;
  }

  // ---------- Question accordion — height and opacity 300ms ease (original WAAPI) ----------
  document.querySelectorAll(".tg-faq__item").forEach((d) => {
    const sum = d.querySelector("summary"), a = d.querySelector(".tg-faq__a");
    sum.addEventListener("click", (e) => {
      e.preventDefault();
      if (d.dataset.run) return;
      const opt = { duration: still ? 0 : 300, easing: "ease" };
      d.dataset.run = "1";
      if (d.open) a.animate([{ height: `${a.clientHeight}px`, opacity: 1 }, { height: 0, opacity: 0 }], opt).onfinish = () => { d.open = false; delete d.dataset.run; };
      else { d.open = true; a.animate([{ height: 0, opacity: 0 }, { height: `${a.scrollHeight}px`, opacity: 1 }], opt).onfinish = () => delete d.dataset.run; }
    });
  });

  // ---------- People slider — Swiper 8.4.7 creative. On phones the cards overlap in the same spot at ∓2deg, at 768 and up they shift aside by 104% · ∓16% to both sides at .8x ----------
  const metas = [...document.querySelectorAll(".tg-people__mi")];
  const pCur = document.querySelector("[data-people-cur]"), pTotal = document.querySelector("[data-people-total]");
  new Swiper(".tg-people__swiper", {
    slidesPerView: 1, loop: true, effect: "creative", speed: still ? 0 : 800,
    autoplay: still ? false : { delay: 4000, disableOnInteraction: false },
    creativeEffect: { limitProgress: 3, perspective: true, progressMultiplier: 1, next: { rotate: [0, 0, -2] }, prev: { rotate: [0, 0, 2] } },
    navigation: { nextEl: "[data-people-next]", prevEl: "[data-people-prev]" },
    on: {
      afterInit: (sw) => indicate(sw, pCur, pTotal),
      slideChange: (sw) => {
        indicate(sw, pCur, pTotal);
        metas.forEach((m, i) => m.classList.toggle("is-active", i === sw.realIndex));
      },
    },
    breakpoints: {
      768: {
        loopAdditionalSlides: 3,
        creativeEffect: { limitProgress: 3, perspective: true, progressMultiplier: 1, next: { translate: ["104%", "-16%", 0], rotate: [0, 0, -2], scale: 0.8 }, prev: { translate: ["-104%", "16%", 0], rotate: [0, 0, -2], scale: 0.8 } },
      },
    },
  });

  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    // When the About block reaches the line 10% from the screen bottom, clear the hero and lay a background on the header
    ScrollTrigger.create({
      trigger: "[data-intro]", start: "top bottom-=10%",
      onEnter: () => body.classList.add("is-intro", "is-fixed"),
      onLeaveBack: () => body.classList.remove("is-intro", "is-fixed"),
    });
    document.querySelectorAll("[data-intro-p]").forEach((el) => ScrollTrigger.create({ trigger: el, start: "top center", onEnter: () => el.classList.add("is-active") }));
    gsap.utils.toArray("[data-delay]").forEach((el) => gsap.fromTo(el, { translate: "0 50%" }, { translate: "0 0", duration: 0.6, scrollTrigger: { trigger: el, start: "top bottom-=10%", scrub: true } }));
    gsap.fromTo("[data-zoom]", { clipPath: "inset(10% 10% 10% 10% round 5%)" }, { clipPath: "inset(0% 0% 0% 0% round 0%)", scrollTrigger: { trigger: "[data-zoom]", start: "top bottom", end: "center center", scrub: 1 } });
  });
  mm.add("(prefers-reduced-motion: reduce)", () => {
    document.querySelectorAll("[data-intro-p]").forEach((el) => el.classList.add("is-active"));
  });
})();
