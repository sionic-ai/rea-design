// Facility About — values from the original about.js. This page’s default curve is power3.out
(() => {
  gsap.defaults({ ease: "power3.out" });
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // One character intro panel — background 0.8→1, character rises from 30px below at 0.5 with back.out 0.9, decorations and shadow, name lines at 0.1s intervals
  const panel = (el) => {
    const bg = $(".content-bg", el), chara = $(".content-chara", el), shadow = $(".content-shadow", el), name = $$(".content-name > *", el);
    gsap.set(el, { display: "none", autoAlpha: 0 });
    return {
      el, id: el.dataset.name,
      show(delay = 0) {
        if (J.reduce) return gsap.set(el, { display: "block", autoAlpha: 1, scale: 1 });
        gsap.timeline().set(bg, { opacity: 0, scale: 0.8 }).set(shadow, { opacity: 0, scale: 0.8 }).set(name, { opacity: 0, y: 20 })
          .set(chara, { opacity: 0, y: 30, scale: 0.5 }).set(el, { display: "block", autoAlpha: 1, scale: 1 })
          .to(bg, { opacity: 1, scale: 1, duration: 0.4, delay })
          .to(chara, { opacity: 1, y: 0, scale: 0.9, duration: 0.4, ease: "back.out" })
          .to(shadow, { opacity: 1, duration: 0.4 }, "<")
          .to(name, { opacity: 1, y: 0, stagger: 0.1, duration: 0.4 });
      },
      hide() { gsap.to(el, { display: "none", autoAlpha: 0, scale: 0.95, duration: J.reduce ? 0 : 0.2 }); },
    };
  };
  const list = $$(".character-content").map(panel);

  // Character row — moves one slot at a time among 13 positions (left %). The character reaching the center (50%) hides and the big panel appears. Advancing has a 1.2s lock
  const SLOTS = [108, 108, 108, -11, -11, -11, 8.611, 24.305, 50, 71.18, 84.027, 97.222, 108];
  const line = $$(".character-line .c-character").map((chara, i) => ({ chara, pos: SLOTS[i] }));
  line.forEach((c) => gsap.set(c.chara, { left: `${c.pos}%` }));
  let lock = false;
  const move = (dir) => {
    if (lock) return;
    lock = true;
    gsap.delayedCall(1.2, () => (lock = false));
    if (dir > 0) { const out = list.shift(); list.push(out); out.hide(); list[0].show(0.3); line.push(line.shift()); }
    else { const out = list[0], inn = list.pop(); list.unshift(inn); out.hide(); inn.show(0.3); line.unshift(line.pop()); }
    line.forEach((c, i) => {
      const jump = dir > 0 ? c.pos < SLOTS[i] : c.pos > SLOTS[i];
      gsap.to(c.chara, {
        left: `${SLOTS[i]}%`, duration: jump || J.reduce ? 0 : 0.4,
        onStart: () => c.pos === 50 && gsap.to(c.chara, { scale: 1, y: 0, opacity: 1, duration: 0.4 }),
        onComplete: () => { c.pos = SLOTS[i]; if (c.pos === 50) gsap.to(c.chara, { scale: 0.95, y: 5, opacity: 0, duration: 0.1, delay: 0.2, ease: "power2.in" }); },
      });
    });
  };
  $(".character-navigation .-next").addEventListener("click", () => move(1));
  $(".character-navigation .-prev").addEventListener("click", () => move(-1));

  const mm = gsap.matchMedia();
  mm.add({ motion: "(prefers-reduced-motion: no-preference)", reduce: "(prefers-reduced-motion: reduce)" }, (ctx) => {
    const reduce = ctx.conditions.reduce, bg = $(".main-bg .bg");
    if (reduce) {
      gsap.set([bg, ".about-title", ".about-text", ".l-movie"], { opacity: 1, scale: 1, y: 0 });
      $$(".main-bg .c-character").forEach((c) => c.classList.add("-show"));
      list[0].show();
      gsap.set(line[8].chara, { opacity: 0 });
      return;
    }
    // Hero — background 0.9→1 over 0.5s, 0.3s later the character moves from the center into place (0.7s css), text·video rise 10px over 0.4s after 1.3s · 0.1s apart
    gsap.timeline().set(bg, { scale: 0.9 }).to(bg, { scale: 1, opacity: 1, duration: 0.5 });
    gsap.delayedCall(0.3, () => $$(".main-bg .c-character").forEach((c) => c.classList.add("-show")));
    gsap.timeline().set(".about-title, .about-text, .l-movie", { y: 10 }).to(".about-title, .about-text, .l-movie", { y: 0, opacity: 1, duration: 0.4, stagger: 0.1, delay: 1.3 });

    gsap.set(line[7].chara, { xPercent: 20 });
    gsap.set(line[9].chara, { xPercent: -30 });
    gsap.set(line[10].chara, { xPercent: -20 });
    ScrollTrigger.create({
      trigger: ".character-line", start: "top 70%", once: true,
      onEnter: () => {
        list[0].show();
        gsap.to(line[8].chara, { scale: 0.95, y: 5, opacity: 0, duration: 0.1, delay: 0.2, ease: "power2.in" });
        gsap.to([line[7].chara, line[9].chara, line[10].chara], { xPercent: 0, duration: 0.3 });
      },
    });
  });
})();
