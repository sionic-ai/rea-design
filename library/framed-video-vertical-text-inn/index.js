// Hero — same formula as the original. e = Scroll ÷ viewport height (not clamped), a = Frame width (screen width − side margins×2).
// Outer frame (--fv-wrapper-video-scale): 1 → a/screen width, sine.inOut over e 0~.6. Inner video (--fv-video-scale): to the same scale with sine.out over e .1~1.5 (rounded up to .01).
// both quickTo 1s expo.out. The frame stays fixed and moves down from its first spot to the 380px (phone 180px) spot by sine.inOut(e/.7), and that movement follows in (1 − e)s expo.out.
// If e ≥ 1 it sticks at the document position of screen height + 380px. Month names at e ≥ .725, vertical line at e ≥ .825.
(() => {
  const TW = window.TW;
  const frame = document.querySelector(".tw-fv__frame");
  const clip = document.querySelector(".tw-fv__clip");
  const texts = document.querySelector(".tw-fv__texts");
  const hint = document.querySelector(".tw-fv__hint");
  const space = document.querySelector(".tw-fv-space");
  const body = document.body;
  if (!frame || !clip || !texts) return;
  const sineOut = gsap.parseEase("sine.out"), sineInOut = gsap.parseEase("sine.inOut");
  let m = {};

  function measure() {
    const sp = TW.isSP();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const pad = sp ? vw * 0.1 : Math.max(vw / 2 - 660, 90);
    const a = vw - 2 * pad;
    const target = sp ? 180 : 380;
    m = { vw, vh, a, top0: sp ? 0.1623036649 * vh : vh / 2 - 0.2084 * vw, target };
    body.style.setProperty("--fv-scroll-area-height", vh + "px");
    space.style.height = vh + target + (sp ? vw : (vw * 800) / 1920) * (a / vw) + "px";
  }

  // Scroll guide line: e < .1 turns on to .5 over .1s after 1s, and e > .2 or when the screen is shielded, it switches off with 1s power3.out
  let hintOn = false, hintTw;
  function hintShow(on) {
    if (!hint || on === hintOn) return;
    hintOn = on;
    hintTw?.kill();
    hintTw = on
      ? gsap.to(hint, { opacity: 0.5, duration: 0.1, ease: "power3.out", delay: 1, onComplete: () => hint.classList.add("is-active") })
      : gsap.to(hint, { opacity: 0, duration: 1, ease: "power3.out", onComplete: () => hint.classList.remove("is-active") });
  }
  gsap.set(hint, { opacity: 0 });

  const mm = gsap.matchMedia();
  mm.add({ ok: "(prefers-reduced-motion: no-preference)", reduce: "(prefers-reduced-motion: reduce)" }, (ctx) => {
    const { reduce } = ctx.conditions;
    const quick = (prop) => (reduce ? (v) => gsap.set(clip, { [prop]: v }) : gsap.quickTo(clip, prop, { duration: 1, ease: "expo.out" }));
    const videoTo = quick("--fv-video-scale");
    const wrapTo = quick("--fv-wrapper-video-scale");
    let fixed = null, yTl;

    function setFixed(on) {
      if (fixed === on) return;
      fixed = on;
      frame.classList.toggle("is-fixed", on);
      texts.classList.toggle("is-fixed", on);
    }

    function update() {
      const e = window.scrollY / m.vh;
      const u = e > 0.1 ? Math.min(1, (Math.min(e, 1.5) - 0.1) / 1.4) : 0;
      const d = Math.ceil(100 * (1 - ((m.vw - m.a) / m.vw) * sineOut(u))) / 100;
      videoTo(reduce ? m.a / m.vw : d);
      if (!body.classList.contains("is-idle")) {
        if (e < 0.1 && TW.started) hintShow(true);
        else if (e > 0.2) hintShow(false);
      }
      if (e >= 1 || reduce) {
        wrapTo(m.a / m.vw);
        setFixed(true);
        texts.classList.add("is-text", "is-line");
        return;
      }
      setFixed(false);
      texts.classList.toggle("is-text", e >= 0.725);
      texts.classList.toggle("is-line", e >= 0.825);
      const p = sineInOut(e < 0.6 ? Math.max(e, 0) / 0.6 : 1);
      const y = sineInOut(e < 0.7 ? Math.max(e, 0) / 0.7 : 1);
      wrapTo(1 - (1 - m.a / m.vw) * p);
      yTl?.kill();
      const w = (m.target - m.top0) * y;
      yTl = gsap.timeline().to([frame, texts], { y: w, duration: Math.max(0, 1 - e), ease: "expo.out" }, 0);
    }

    const onResize = () => {
      measure();
      update();
      ScrollTrigger.refresh();
    };
    const idle = new MutationObserver(() => body.classList.contains("is-idle") ? hintShow(false) : window.scrollY / m.vh < 0.1 && hintShow(true));
    idle.observe(body, { attributes: true, attributeFilter: ["class"] });
    measure();
    update();
    TW.ready.push(update);
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      idle.disconnect();
      yTl?.kill();
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", onResize);
    };
  });
})();
