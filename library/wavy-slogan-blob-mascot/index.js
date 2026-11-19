// Home page motion. Original values: hero Swiper 1.6s·every 4s · slogan 5s power3.inOut (stops 180 before path end, phone 40) · Japanese line 5s +.3 delay, fades .8s at 3s
// Tree dotted line 2.2s power2.inOut → arrowhead .35 → drop .5 → stays 6s → vanishes in .45 · bowl drops .09s apart power2.in · rolling drop 7~9.5s
(() => {
  gsap.registerPlugin(MotionPathPlugin);
  const { reduced, isSp, mm } = window.VS;

  // ── Hero photo slider: same Swiper as the original (centered, peeking sides, infinite) ──
  const kvSwiper = new Swiper(".kv__slide", {
    slidesPerView: "auto", spaceBetween: 0, speed: 1600, loop: true, centeredSlides: true,
    autoplay: reduced ? false : { delay: 4000, disableOnInteraction: false },
  });
  addEventListener("load", () => { kvSwiper.update(); gsap.to(".kv__track", { opacity: 1, duration: 1 }); });

  // ── Slogan: stands letters one by one on a U-shaped wave and slides them from 200 beyond the right edge to 180 (phone 40) short of the left edge ──
  // Length unit is path coordinates. Beyond the path, it continues straight along the end tangent
  const copy = document.querySelector(".kv__copy");
  const word = copy.dataset.word;
  // The original spacing (6 between letters, 20 for spaces) is based on a 1500 width, so on the phone track (400 wide) it shrinks by that ratio
  const GAP = 6, SPACE = 20;
  const sets = [...copy.querySelectorAll(".kv__motion")].map((svg) => {
    const path = svg.querySelector("path");
    const letters = [...word].map((ch) => {
      if (ch === " ") return null;
      const el = document.createElementNS("http://www.w3.org/2000/svg", "text");
      el.setAttribute("class", "kv__letter");
      el.textContent = ch;
      svg.appendChild(el);
      return el;
    });
    return { svg, path, letters, len: 0, widths: [], k: svg.viewBox.baseVal.width / 1500 };
  });
  const pointAt = (s, d) => {
    const { path, len } = s;
    if (d >= 0 && d <= len) return path.getPointAtLength(d);
    const [e, f] = d < 0 ? [0, 1] : [len, len - 1];
    const p = path.getPointAtLength(e), q = path.getPointAtLength(f), k = d < 0 ? -d : d - len;
    return { x: p.x + (p.x - q.x) * k, y: p.y + (p.y - q.y) * k };
  };
  // head is where the bottom left of the first letter sits (length measured from the left end of the path). Later letters continue to the right
  const place = (s, head) => {
    let d = head;
    s.letters.forEach((el, i) => {
      if (!el) { d += SPACE * s.k; return; }
      const w = s.widths[i], p = pointAt(s, d), c = pointAt(s, d + w / 2), n = pointAt(s, d + w / 2 + 1);
      const deg = (Math.atan2(n.y - c.y, n.x - c.x) * 180) / Math.PI;
      el.setAttribute("transform", `translate(${p.x} ${p.y}) rotate(${deg})`);
      d += w + GAP * s.k;
    });
  };
  const copyState = { head: 0 };
  const active = () => sets[isSp() ? 1 : 0];
  const stopAt = () => (isSp() ? 40 : 180);
  const measure = () => sets.forEach((s) => { s.len = s.path.getTotalLength(); s.widths = s.letters.map((el) => (el ? el.getComputedTextLength() : 0)); });
  let copyTween;
  const playCopy = () => {
    measure();
    const s = active();
    const jaSvg = copy.querySelector(isSp() ? ".kv__ja.is-sp" : ".kv__ja.is-pc");
    const jaText = jaSvg.querySelector("text"), jaTp = jaSvg.querySelector("textPath");
    const jaEnd = isSp() ? "52%" : "75%";
    gsap.set(copy.querySelectorAll(".kv__letter"), { visibility: "visible" });
    if (reduced) {
      place(s, stopAt());
      gsap.set(jaTp, { attr: { startOffset: jaEnd } });
      gsap.set(jaText, { autoAlpha: 1 });
      return;
    }
    copyState.head = s.len + 200;
    place(s, copyState.head);
    copyTween = gsap.to(copyState, { head: stopAt(), duration: 5, ease: "power3.inOut", onUpdate: () => place(active(), copyState.head) });
    gsap.set(jaTp, { attr: { startOffset: "-20%" } });
    gsap.set(jaText, { autoAlpha: isSp() ? 1 : 0 });
    const tl = gsap.timeline({ delay: 0.3 });
    tl.to(jaTp, { attr: { startOffset: jaEnd }, duration: 5, ease: "power3.inOut" });
    if (!isSp()) tl.to(jaText, { autoAlpha: 1, duration: 0.8, ease: "power1.out" }, 3);
  };
  addEventListener("resize", () => {
    measure();
    if (!copyTween || !copyTween.isActive()) copyState.head = stopAt();
    sets.forEach((s) => place(s, copyState.head));
    copy.querySelectorAll(".kv__ja").forEach((svg) => {
      if (!copyTween) return;
      gsap.set(svg.querySelector("textPath"), { attr: { startOffset: svg.classList.contains("is-sp") ? "52%" : "75%" } });
      gsap.set(svg.querySelector("text"), { autoAlpha: 1 });
    });
  });
  const kvIo = new IntersectionObserver((es) => {
    if (es.some((e) => e.isIntersecting)) { kvIo.disconnect(); document.fonts.ready.then(playCopy); }
  }, { threshold: 0.25 });
  kvIo.observe(copy);

  // ── Rolling bubble: it drops, squashes and stretches back, then rolls along a wavy path ──
  const stage = document.querySelector(".choice__stage");
  if (stage) {
    const C = [
      { start: [0.58, 0.9], dur: 7, drop: [-300, -200], dd: 0.75, rot: 945 },
      { start: [0.52, 0.6], dur: 9, drop: [-270, -170], dd: 0.7, rot: 1215 },
      { start: [0.46, 0.43], dur: 7.5, drop: [-240, -140], dd: 0.6, rot: 1012.5 },
      { start: [0.4, 0.24], dur: 9.5, drop: [-230, -130], dd: 0.7, rot: 1282.5 },
      { start: [0.34, 0.02], dur: 8.5, drop: [-260, -160], dd: 0.75, rot: 1147.5 },
    ];
    const els = [...stage.querySelectorAll(".choice__chara")];
    const mp = (start, end) => ({ path: "#choice-path", align: "#choice-path", alignOrigin: [0.5, 0.5], start, end });
    const run = () => els.forEach((el, i) => {
      const c = C[i], sp = isSp() ? 1 : 0, slow = isSp() ? 2.5 : 1, s = c.start[sp];
      gsap.set(el, { motionPath: mp(s, s) });
      if (reduced) return gsap.set(el, { opacity: 1 });
      const loop = () => gsap.timeline({ repeat: -1 })
        .set(el, { rotation: 0, opacity: 0, motionPath: mp(0, 0) })
        .to(el, { duration: c.dur / slow, ease: "none", rotation: `-=${c.rot / slow}`, motionPath: mp(0, 1) })
        .to(el, { opacity: 1, duration: 0.3 }, "<")
        .to(el, { opacity: 0, duration: 0.3 }, "-=0.3");
      gsap.timeline({ onComplete: () => gsap.timeline({ onComplete: loop })
          .to(el, { duration: ((c.dur - 3) / slow) * (1 - s), ease: "none", rotation: `-=${(c.rot / slow) * (1 - s)}`, motionPath: mp(s, 1) })
          .to(el, { opacity: 0, duration: 0.3 }, "-=0.3") })
        .from(el, { y: `+=${c.drop[sp]}`, duration: c.dd, ease: "power2.in" })
        .fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.2 }, 0)
        .to(el, { scaleX: 1.08, scaleY: 0.92, duration: 0.08, transformOrigin: "50% 100%" })
        .to(el, { scaleX: 1, scaleY: 1, duration: 0.15, ease: "back.out(2)", transformOrigin: "50% 100%" });
    });
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { io.disconnect(); run(); } }, { rootMargin: "-20% 0px", threshold: 0.4 });
    io.observe(document.querySelector(".choice__visual"));
  }

  // ── News slider: same Swiper freeMode and horizontal wheel as the original, dragging the bottom handle calls setProgress ──
  const prog = document.querySelector(".journal__progress");
  const bar = document.querySelector(".journal__bar");
  if (prog && bar) {
    const sync = (sw) => { bar.style.transform = `translateX(${sw.progress * (prog.clientWidth - bar.offsetWidth)}px)`; };
    const journal = new Swiper(".journal__slides", {
      slidesPerView: "auto", spaceBetween: 0, freeMode: true, mousewheel: { forceToAxis: true },
      on: { init: sync, progress: sync },
    });
    let grabbing = false;
    bar.addEventListener("pointerdown", () => { grabbing = true; bar.style.cursor = "grabbing"; });
    addEventListener("pointerup", () => { grabbing = false; bar.style.cursor = "grab"; });
    addEventListener("pointermove", (e) => {
      if (!grabbing) return;
      const r = prog.getBoundingClientRect(), room = prog.clientWidth - bar.offsetWidth;
      journal.setProgress(gsap.utils.clamp(0, room, e.clientX - r.left - bar.offsetWidth / 2) / room);
    });
  }
})();
