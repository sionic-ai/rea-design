// First page — original main.js Ju (Hero) · ed (copy · interaction) · td (horizontal activities) · sd (tree growing) · nd (walking together) · [data-parallax-pc] · resetInview (Footer → top)
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const kv = document.querySelector(".bt-kv:not(.bt-kv--loop)");
  // Plays only on entering (scrolling down so it starts showing from the top), and resets to the start when it leaves below the screen — original down-enter / reset
  const onEnter = (el, play, reset) => new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting && e.boundingClientRect.top > 0) play();
    else if (!e.isIntersecting && e.boundingClientRect.top > 0) reset();
  }), { threshold: 0 }).observe(el);

  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    // When the hero ends, a green cover goes over the white curtain (original onLeave cover_green -show), removed on return
    ScrollTrigger.create({ trigger: kv, start: "top top", end: "bottom bottom", onLeave: () => kv.classList.add("is-left"), onEnterBack: () => kv.classList.remove("is-left") });

    // Two hands come together from above on both sides, the seed drops, then the sprout (original tl1, s = .9)
    const hand = document.querySelector(".bt-statement__hand");
    const q = (s) => hand.querySelector(s), s = 0.9;
    const tl = gsap.timeline({ paused: true });
    tl.fromTo(q(".hand-l"), { xPercent: -100, yPercent: -50 }, { xPercent: 0, yPercent: 0, ease: "sine.out", duration: s })
      .fromTo(q(".hand-r"), { xPercent: 100, yPercent: -50 }, { xPercent: 0, yPercent: 0, ease: "sine.out", duration: s }, "<")
      .fromTo(q(".seed"), { yPercent: -130, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, ease: "sine.out", duration: s * 1.2 }, "<")
      .fromTo(q(".plant"), { autoAlpha: 0, scale: 0.9, transformOrigin: "50% 100%" }, { autoAlpha: 1, scale: 1, duration: s * 0.5, ease: "power2.out" })
      .to(q(".plant1"), { delay: 0.1, autoAlpha: 0, ease: "power2.out" })
      .fromTo(q(".plant2"), { autoAlpha: 0 }, { autoAlpha: 1, ease: "power1.out" }, "<");
    gsap.set([q(".plant"), q(".seed")], { autoAlpha: 0 });
    onEnter(hand, () => tl.play(), () => tl.pause(0));

    // Activity — pin the section fixed at the screen center and run the card row from a → l, with odd and even cards waving ±5% (by half the progress)
    const act = document.querySelector(".bt-activity"), wrap = act.querySelector(".bt-activity__items"), items = [...wrap.children], inner2 = act.querySelector(".bt-activity__inner2"), h2 = act.querySelector(".bt-activity__h");
    const odd = items.filter((_, i) => i % 2 === 0), even = items.filter((_, i) => i % 2 === 1);
    const w1 = gsap.timeline({ paused: true }).to(odd, { duration: 1, ease: "none", yPercent: 5 }).to(odd, { duration: 1, ease: "none", yPercent: 0 });
    const w2 = gsap.timeline({ paused: true }).to(even, { duration: 1, ease: "none", yPercent: -5 }).to(even, { duration: 1, ease: "none", yPercent: 0 });
    const sp = matchMedia("(max-width: 768px)").matches;
    const span = () => {
      const f = items[0].getBoundingClientRect(), h = items[1].getBoundingClientRect(), d = items[items.length - 1].getBoundingClientRect();
      const iw = items[0].clientWidth, gap = h.left - (f.left + f.width), total = d.left + d.width - f.left, o = inner2.offsetWidth;
      const a = sp ? 0 : Math.max(innerWidth - iw * 3.5 - gap * 3 - (innerWidth - o) * 0.5, 210), l = sp ? (o - total + (37 / 390) * innerWidth) | 0 : (o - total) | 0;
      return { a, l, len: Math.abs(Math.abs(a - l) * 1.5) | 0 };
    };
    let m = span();
    const scrollTw = gsap.timeline({ scrollTrigger: { trigger: act, start: "center center", end: () => `+=${(m = span()).len}`, scrub: true, pin: true, pinType: "fixed", invalidateOnRefresh: true, onUpdate: (st) => { w1.progress(st.progress * 0.5); w2.progress(st.progress * 0.5); } } });
    scrollTw.fromTo(wrap, { x: () => m.a }, { x: () => m.l, duration: 1, ease: "none" }).fromTo(h2, { yPercent: 0 }, { yPercent: sp ? 0 : -22, duration: 1, ease: "sine.in" }, "<");

    // Four trees grow in turn, crossing at .6s sine.out (original sd tl1)
    const t = (n) => document.querySelector(`.bt-nature__t.t${n}`), i = 0.6;
    const grow = gsap.timeline({ paused: true });
    grow.to(t(1), { autoAlpha: 1, ease: "sine.out", duration: i }).to(t(1), { autoAlpha: 0, ease: "sine.out", duration: i })
      .fromTo(t(2), { autoAlpha: 0 }, { autoAlpha: 1, ease: "sine.out", duration: i }, "<").to(t(2), { autoAlpha: 0, ease: "sine.out", duration: i })
      .fromTo(t(3), { autoAlpha: 0 }, { autoAlpha: 1, ease: "sine.out", duration: i }, "<").fromTo(t(4), { autoAlpha: 0 }, { autoAlpha: 1, ease: "sine.out", duration: i });
    onEnter(document.querySelector(".bt-nature__trees"), () => grow.play(), () => grow.pause(0));

    // Walking Together — the family illustration goes from -18%·12% (phone -10%·8%) to -3%·3% with sine.out, then to 0 linear (scrub)
    const people = document.querySelector(".bt-past__people");
    gsap.timeline({ scrollTrigger: { trigger: people, start: "top bottom", end: "bottom 30%", scrub: true } })
      .fromTo(people.firstElementChild, { xPercent: sp ? -10 : -18, yPercent: sp ? 8 : 12 }, { xPercent: -3, yPercent: 3, duration: 1, ease: "sine.out" })
      .to(people.firstElementChild, { xPercent: 0, yPercent: 0, duration: 0.7, ease: "none" });
  });

  // Pickup — two cards cross-fade every 5 seconds in .8s, clicking a dot goes to that card
  const cards = [...document.querySelectorAll(".bt-pickup__card")], dots = [...document.querySelectorAll(".bt-pickup__dots button")];
  let now = 0, timer = null;
  const show = (n) => { now = n; cards.forEach((c, k) => c.classList.toggle("is-on", k === n)); dots.forEach((d, k) => d.classList.toggle("is-on", k === n)); };
  const run = () => { clearInterval(timer); if (!matchMedia("(prefers-reduced-motion: reduce)").matches) timer = setInterval(() => show((now + 1) % cards.length), 5000); };
  dots.forEach((d, k) => d.addEventListener("click", () => { show(k); run(); }));
  run();

  // Scrolling to the bottom jumps back to the top — the bottom shows the same picture as the first screen, so it looks seamless (original resetInview)
  const loopAt = () => document.documentElement.scrollHeight - innerHeight - 1;
  addEventListener("scroll", () => {
    if (scrollY < loopAt()) return;
    if (window.btLenis) window.btLenis.scrollTo(0, { immediate: true }); else scrollTo(0, 0);
    kv.classList.remove("is-left");
  }, { passive: true });
})();
