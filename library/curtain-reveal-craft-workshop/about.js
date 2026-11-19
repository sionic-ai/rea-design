// About — the exact values of the original PageAbout.js and ImageTrail.js
(() => {
  const AM = (window.AM = window.AM || { pages: {} });
  const lerp = (a, b, t) => a + (b - a) * t;

  // Widening pinned photo — while moving from screen bottom to top, 30% on each side opens, and after it sticks it shrinks from 1.3x to 1x, and past .3 the words over the photo rise
  AM.widen = (wide, until) => {
    const sec = wide.closest("section");
    ScrollTrigger.create({ trigger: wide, start: "top bottom", end: "top top", onUpdate: (s) => wide.style.setProperty("--scroll-progress", s.progress) });
    const words = wide.querySelectorAll(".a-wide__text .split-word");
    let shown = false;
    ScrollTrigger.create({
      trigger: wide, start: "top -1", endTrigger: until, pin: true,
      onUpdate: (s) => {
        wide.style.setProperty("--scale-progress", s.progress);
        if (s.progress >= 0.3 && !shown) { shown = true; gsap.to(words, { duration: 0.8, y: "0%", ease: "power2.out", stagger: { each: 0.05 } }); }
      },
    });
    return sec;
  };

  AM.pages.about = (main, { mobile }) => {
    const off = [];
    const hero = main.querySelector(".a-hero");
    const heroImg = hero.querySelector(".a-hero__image");
    const rail = hero.querySelector(".a-hero__title");
    ScrollTrigger.create({
      trigger: hero, start: "top top", endTrigger: main.querySelector(".a-story"), end: "top top", pin: hero, pinSpacing: false,
      onUpdate: (s) => {
        gsap.set(rail, { opacity: 1 - s.progress * 1.5 });
        const p = s.progress * 2;
        gsap.set(heroImg, { clipPath: `polygon(0 0, 100% 0, 100% ${(1 - p) * 100}%, 0% ${(1 - p) * 100}%)` });
        gsap.set(heroImg.querySelector(".a-hero__img"), { scale: 1 + s.progress * 0.4 });
      },
    });
    const [w1, w2] = main.querySelectorAll("[data-wide]");
    AM.widen(w1, main.querySelector(".a-after"));
    AM.widen(w2, main.querySelector(".a-team"));

    // Parallax photo — the inner photo drops 10rem, and the panel rises by −25vh × speed (half on phone) (scrub 1)
    main.querySelectorAll(".a-par").forEach((p) => {
      const speed = (+p.dataset.speed || 0) / (mobile ? 2 : 1);
      gsap.timeline({ scrollTrigger: { trigger: p.querySelector(".am-ph"), start: "top bottom", end: "bottom top", scrub: 1 } }).to(p.querySelector(".a-par__tr"), { y: "10rem", ease: "none" });
      gsap.timeline({ scrollTrigger: { trigger: p, start: "top bottom", end: "bottom top", scrub: 1 } }).to(p, { y: `${-25 * speed}vh`, ease: "none" });
    });

    if (!mobile) off.push(trail(main));
    return () => off.forEach((f) => f());
  };

  // Person photo trail — inside the Team section, when the cursor moves over 10px, every 5 frames the next photo slides from the lagging dot (.1) to the cursor over .4s, then disappears .4s later over .4s
  function trail(main) {
    const box = main.querySelector("[data-trail]");
    const sec = box.closest("section");
    const avoid = sec.querySelector("[data-trail-off]");
    const imgs = [...box.querySelectorAll(".a-trail__img")];
    if (!imgs.length) return () => {};
    let mouse = { x: 0, y: 0 }, last = { x: 0, y: 0 }, cache = { x: 0, y: 0 };
    let n = 0, frame = 0, z = 1, active = 0, raf = 0;
    const move = (e) => { mouse = { x: e.clientX, y: e.clientY + scrollY }; };
    addEventListener("mousemove", move, { passive: true });
    const show = () => {
      ++z;
      n = n < imgs.length - 1 ? n + 1 : 0;
      const img = imgs[n];
      const r = img.getBoundingClientRect();
      const sr = sec.getBoundingClientRect();
      const coeff = (mouse.y - sr.top - scrollY - sr.height / 2) / (sr.height / 2);
      gsap.killTweensOf(img);
      gsap.timeline({ onStart: () => active++, onComplete: () => active-- })
        .fromTo(img, { opacity: 0.9, scale: 1, zIndex: z, x: cache.x - r.width / 2, y: cache.y - scrollY - r.height / 2 - (r.height / 2) * coeff },
          { opacity: 1, duration: 0.4, ease: "power1", x: mouse.x - r.width / 2, y: mouse.y - scrollY - r.height / 2 - (r.height / 2) * coeff }, 0)
        .to(img, { duration: 0.4, ease: "power3", opacity: 0 }, 0.4);
    };
    const loop = () => {
      frame++;
      const d = Math.hypot(mouse.x - last.x, mouse.y - last.y);
      cache.x = lerp(cache.x || mouse.x, mouse.x, 0.1);
      cache.y = lerp(cache.y || mouse.y, mouse.y, 0.1);
      const sr = sec.getBoundingClientRect();
      const vy = mouse.y - scrollY;
      if (vy > sr.top && vy < sr.top + sr.height) {
        const ar = avoid.getBoundingClientRect();
        if (vy < ar.top - 50 || vy > ar.top + ar.height + 50) {
          if (d > 10 && frame % 5 === 0) show();
        }
        last = { ...mouse };
      }
      if (!active && z !== 1) z = 1;
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => { cancelAnimationFrame(raf); removeEventListener("mousemove", move); imgs.forEach((i) => gsap.set(i, { clearProps: "all" })); };
  }
})();
