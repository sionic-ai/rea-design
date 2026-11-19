// About page — Earth sentence words on, timeline (original about-journey: fixed 1800px, switches to the year rounded from progress × (year count − 1) — lines shift 376px, small years ×.11, text .45s later)
(() => {
  const { reduce } = G;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const start = () => {
    const h = $(".a-globe__ttl"), words = G.splitWords(h);
    const slides = $$(".a-journey__slide"), track = $(".a-journey__track"), n = slides.length;
    // Original looping carousel: clone slots at both ends, turning back at the end, it slides one slot onto the clone, then jumps instantly to the real slot
    const head = slides[n - 1].cloneNode(true), tail = slides[0].cloneNode(true);
    [head, tail].forEach((c) => { c.classList.remove("is-active"); c.setAttribute("aria-hidden", "true"); });
    track.prepend(head); track.append(tail);
    const pos = (i) => -(i + 1) * slides[0].offsetWidth;
    let cur = 0;
    gsap.set(track, { x: pos(0) });
    // Text in the new year lights up word by word over .467s, starting .45 late so the whole change finishes in sequence within 1.1s (measured from the original)
    const textWords = slides.map((sl) => G.splitWords(sl.querySelector(".a-journey__text")));
    const mark = () => {
      slides.forEach((sl, k) => sl.classList.toggle("is-active", k === cur));
      const w = textWords[cur];
      if (reduce || !w.length) return;
      gsap.killTweensOf(w);
      gsap.fromTo(w, { opacity: 0 }, { opacity: 1, duration: 0.467, delay: 0.45, stagger: w.length > 1 ? 0.65 / (w.length - 1) : 0, ease: "none" });
    };
    // Turn: the row slides by one cell (slide width) in .4s (.48s when going back) with cubic-bezier(.4,.4,.3,.8) (.045 late), and sun size · color · dots use css transitions
    const TRACK_EASE = CustomEase.create("g-track", "M0,0 C0.4,0.4 0.3,0.8 1,1");
    const slide = (to, then, dur = 0.4) => gsap.to(track, { x: pos(to), duration: reduce ? 0 : dur, delay: reduce ? 0 : 0.045, ease: TRACK_EASE, overwrite: true, onComplete: then });
    const show = (i) => { cur = Math.max(0, Math.min(n - 1, i)); mark(); slide(cur); };
    const step = (k) => {
      const to = cur + k;
      if (to < 0) { cur = n - 1; mark(); slide(-1, () => gsap.set(track, { x: pos(cur) }), 0.48); return; }
      if (to >= n) { cur = 0; mark(); slide(n, () => gsap.set(track, { x: pos(cur) }), 0.48); return; }
      show(to);
    };
    $(".a-journey__prev").addEventListener("click", () => step(-1));
    $(".a-journey__next").addEventListener("click", () => step(1));
    if (reduce) return;
    gsap.set(words, { opacity: 0.2 });
    gsap.to(words, { opacity: 1, duration: 0.18, ease: "none", stagger: { each: 0.16 }, scrollTrigger: { trigger: h, start: "top center+=20%", end: "bottom-=25% center", scrub: 1.2, invalidateOnRefresh: true } });
    ScrollTrigger.create({ trigger: ".a-journey__pin", start: "top top", end: "+=1800", pin: true, anticipatePin: 1, invalidateOnRefresh: true, onUpdate: (s) => { const i = Math.round(s.progress * (slides.length - 1)); if (i !== cur) show(i); } });
  };
  G.boot(start);
})();
