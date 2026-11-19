// Home page: original HomeLoader (≈5s), HeroParallax, BleedSlider, Work (name list), SmoothSlider (smooothy), Locations
(() => {
  // smooothy drag paging — original settings as-is, shared by the first-page news and the related news on the article side
  BP.smooth = (el) => {
    if (!window.Smooothy || !el) return () => {};
    const s = new Smooothy(el, { infinite: true, snap: true, dragSensitivity: 0.005, lerpFactor: 0.3, snapStrength: 0.1, speedDecay: 0.85, scrollInput: false });
    const tick = () => s.update();
    gsap.ticker.add(tick);
    return () => { gsap.ticker.remove(tick); s.destroy(); };
  };

  BP.page("home", {
    intro(box, first) {
      const hero = box.querySelector(".bp-hero");
      const tl = gsap.timeline();
      const reveal = hero.querySelectorAll("[data-reveal]");
      const navs = document.querySelectorAll(".bp-logo, .bp-nav__list");
      if (!first) {
        tl.set(box.querySelector(".bp-load"), { autoAlpha: 0 });
        tl.to(reveal, { x: 0, duration: 1.3, ease: "reveal" }, 0.1).to(hero.querySelector(".bp-hero__grad"), { scaleY: 1, duration: 1, ease: "reveal" }, "<");
        return tl;
      }
      BP.lock();
      const boxEl = hero.querySelector(".bp-load__box");
      const stack = hero.querySelector(".bp-load__stack");
      const flashes = [...hero.querySelectorAll("[data-flash]")];
      const a = hero.querySelector(".bp-load__logo.--a");
      const b = hero.querySelector(".bp-load__logo.--b");
      const video = hero.querySelector(".bp-hero__video");
      const h = 0.7, y = 0.55;
      const W = [28, 30.8, 51.1, 58.8], H = [20.3, 30.8, 39.2, 53.2];
      // Video outside the box is visible only at box size, then opens to full screen in 4.24s
      const inset = () => `inset(${(100 - H[3]) / 2}vh ${(100 - W[3] * innerHeight / innerWidth) / 2}vw)`;
      gsap.set(navs, { yPercent: -150 });
      gsap.set(video, { clipPath: inset() });
      gsap.set(flashes[0], { opacity: 1 });
      tl.from(stack, { y: "25vh", delay: y, duration: 1.2, ease: "main" }, 0);
      tl.to(a, { yPercent: -100, duration: h - 0.1, delay: y + 0.2, ease: "main" }, 0);
      tl.to(b, { yPercent: 100, duration: h - 0.1, delay: y + 0.2, ease: "main" }, 0);
      W.forEach((w, i) => tl.to(boxEl, { width: `${w}vh`, height: `${H[i]}vh`, delay: y + 0.2, duration: h, ease: "main" }, i * h));
      [1.55, 1.8, 2.15, 2.325, 2.5, 2.675, 2.85, 2.99, 3.13, 3.27, 3.41, 3.55, 3.66, 3.782, 3.9, 4.01, 4.14].forEach((t, i) => tl.set(flashes[i + 1], { opacity: 1 }, t));
      tl.set(boxEl, { opacity: 0 }, 4.24);
      tl.to(video, { clipPath: "inset(0vh 0vw)", duration: 1.3, ease: "reveal" }, 4.24);
      tl.to(reveal, { x: 0, duration: 1.3, ease: "reveal" }, "<0.1");
      tl.to(navs, { yPercent: 0, duration: 1, ease: "reveal" }, "<");
      tl.to(hero.querySelector(".bp-hero__grad"), { scaleY: 1, duration: 1, ease: "reveal" }, "<");
      tl.to(a, { xPercent: 400, yPercent: 400, duration: 1.3, ease: "reveal" }, "<");
      tl.to(b, { xPercent: -400, yPercent: -400, duration: 1.3, ease: "reveal" }, "<");
      tl.set(box.querySelector(".bp-load"), { autoAlpha: 0 }, 4.8);
      tl.call(() => BP.unlock());
      return tl;
    },

    ready(box) {
      const offs = [];
      const mm = gsap.matchMedia();
      mm.add({ motion: "(prefers-reduced-motion: no-preference)", mobile: "(max-width: 767px)" }, (ctx) => {
        const { mobile } = ctx.conditions;
        // Original HeroParallax: from hero top → about top, each word is pushed sideways at its own rate
        const hero = box.querySelector(".bp-hero");
        const w = (k) => hero.querySelector(`.bp-hero__w.--${k}`);
        gsap.timeline({ defaults: { ease: "linear" }, scrollTrigger: { trigger: hero, start: "top top", endTrigger: box.querySelector(".bp-intro"), end: "top top", scrub: true } })
          .to(hero.querySelector(".bp-hero__words"), { y: "40vh" })
          .to(w("l2"), { x: "15vw" }, 0).to(w("l3"), { x: "4vw" }, 0).to(w("l4"), { x: "-8vw" }, 0).to(w("l5"), { x: mobile ? "-25vw" : "25vw" }, 0);
        // Original Intro: when it reaches 45% of the screen, the video box opens from the center with 1s slow-out (text lines use the shared data-reveal-line)
        const img = box.querySelector(".bp-intro__img");
        ScrollTrigger.create({ trigger: box.querySelector(".bp-intro"), start: "top 45%", onEnter: () => gsap.to(img, { clipPath: "inset(0%)", duration: 1, ease: "slow-out", overwrite: true }) });
        ScrollTrigger.create({ trigger: box.querySelector(".bp-intro"), start: "top 80%", onLeaveBack: () => gsap.set(img, { clipPath: "inset(50%)", overwrite: true }) });
        // Original BScroll: when the end of About reaches 90% of the screen the B outline is drawn (outer 1s, inner .25 later), and when it reaches 40% the page slides to the Work section over 1.2s
        // A 35vw×47vw window in the center opens to full screen over .9s (the original morphs a B shape to a rectangle with MorphSVG, here it is an inset window). Reverses on scroll back
        const intro = box.querySelector(".bp-intro"), bleed = box.querySelector(".bp-bleed");
        const outer = box.querySelector(".bp-bmark__outer"), inner = box.querySelector(".bp-bmark__inner");
        if (!mobile && outer) {
          const win = () => `inset(${(100 - 47 * innerWidth / innerHeight) / 2}vh 32.5vw round 1vw)`;
          gsap.set(bleed, { clipPath: win() });
          gsap.set(bleed.querySelector(".bp-bleed__info"), { autoAlpha: 0, yPercent: 50 });
          gsap.fromTo(box.querySelector(".bp-bmark svg"), { yPercent: -30 }, { yPercent: 0, ease: "linear", scrollTrigger: { trigger: intro, start: "bottom 90%", end: "bottom 40%", scrub: true } });
          ScrollTrigger.create({
            trigger: intro, start: "bottom 90%",
            onEnter: () => { gsap.to(outer, { strokeDashoffset: 0, duration: 1, ease: "power2.inOut" }); gsap.to(inner, { strokeDashoffset: 0, duration: 1, delay: 0.25, ease: "power2.inOut" }); },
            onLeaveBack: () => { gsap.to(outer, { strokeDashoffset: -2750, duration: 1, ease: "power2.inOut" }); gsap.to(inner, { strokeDashoffset: -1950, duration: 1, delay: 0.25, ease: "power2.inOut" }); },
          });
          const open = gsap.timeline({ paused: true, defaults: { duration: 1.4, ease: "reveal" } })
            .to(outer, { opacity: 0, duration: 0.1 }).to(inner, { opacity: 0, duration: 0.1 }, 0)
            .to(bleed, { clipPath: "inset(0vh 0vw round 0vw)", duration: 0.9 }, 0.05)
            .to(bleed.querySelector(".bp-bleed__info"), { autoAlpha: 1, yPercent: 0, duration: 1 }, 0.75);
          ScrollTrigger.create({
            trigger: intro, start: "bottom 40%",
            onEnter: () => { open.play(); BP.scrollTo(bleed, { duration: 1.2 }); },
            onLeaveBack: () => open.reverse(),
          });
        }
        // Original Work: while a name row passes 48% of the screen, only that row is bold and the poster changes, each row shifts slightly left and right
        const items = [...box.querySelectorAll("[data-witem]")];
        const posters = [...box.querySelectorAll("[data-wposter]")];
        items.forEach((it, i) => {
          ScrollTrigger.create({ trigger: it, start: "top 48%", end: () => `+=${it.offsetHeight + 1}`, onToggle: (st) => {
            if (!st.isActive) return;
            items.forEach((x) => x.classList.toggle("is-faded", x !== it));
            posters.forEach((p, k) => p.classList.toggle("is-open", k === i));
          } });
          gsap.fromTo(it, { xPercent: 0 }, { xPercent: i % 2 ? 6 : -6, ease: "none", scrollTrigger: { trigger: it, start: "top bottom", end: "bottom top", scrub: true } });
        });
        // Original Locations: as you scroll through the section, the person pane drifts from -30vw to 30vw
        const loc = box.querySelector(".bp-loc");
        gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: loc, start: "top bottom", end: "bottom top", scrub: true } }).fromTo(loc.querySelector(".bp-loc__portrait"), { y: "-30vw" }, { y: "30vw" }, 0);
      });

      // Original BleedSlider: every 5s or on dot press, the next Work clears in from the right with 1.2s slow-out, and the outgoing section’s text scatters ±21vw
      const slides = [...box.querySelectorAll(".bp-bleed__slide")];
      const crumbs = [...box.querySelectorAll(".bp-bleed__crumb")];
      const cur = box.querySelector("[data-cur]");
      const titles = box.querySelector(".bp-bleed__titles");
      let at = 0, busy = false, z = 2;
      const go = (n) => {
        if (busy || n === at) return;
        busy = true;
        const out = slides[at], inn = slides[n];
        const outChars = out.querySelectorAll(".bp-letters__row > span");
        const inChars = inn.querySelectorAll(".bp-letters__row > span");
        outChars.forEach((c, k) => c.style.setProperty("--x", k % 2 ? "21vw" : "-21vw"));
        gsap.to(out.querySelector(".bp-bleed__img"), { xPercent: -25, duration: 1.2, ease: "slow-out" });
        inChars.forEach((c, k) => c.style.setProperty("--x", k % 2 ? "-21vw" : "21vw"));
        z += 1;
        gsap.set(inn, { display: "block", zIndex: z });
        const tl = gsap.timeline({ onComplete: () => { out.classList.remove("is-active"); gsap.set(out, { clearProps: "display" }); gsap.set(out.querySelector(".bp-bleed__img"), { xPercent: 0 }); inn.classList.add("is-active"); busy = false; } });
        tl.fromTo(inn, { clipPath: "inset(0% 0% 0% 100%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: BP.reduced ? 0 : 1.2, ease: "slow-out" });
        tl.fromTo(inn.querySelector(".bp-bleed__img"), { xPercent: 20 }, { xPercent: 0, duration: BP.reduced ? 0 : 1.2, ease: "slow-out" }, "<");
        tl.call(() => inChars.forEach((c) => c.style.setProperty("--x", "0vw")), null, "<+=0.45");
        tl.fromTo(inn.querySelectorAll(".bp-stamp > *"), { yPercent: 25, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, stagger: { each: 0.1, from: "end" } }, "<+=0.2");
        gsap.to(titles, { yPercent: -n * 100 / slides.length, duration: 1, ease: "slow-out" });
        crumbs.forEach((c, k) => c.classList.toggle("is-active", k === n));
        cur.textContent = String(n + 1).padStart(2, "0");
        at = n;
      };
      crumbs.forEach((c, k) => { const h = () => go(k); c.addEventListener("click", h); offs.push(() => c.removeEventListener("click", h)); });
      const auto = BP.reduced ? 0 : setInterval(() => go((at + 1) % slides.length), 5000);
      offs.push(() => clearInterval(auto));

      // News drag
      box.querySelectorAll("[data-smooth-slider]").forEach((el) => offs.push(BP.smooth(el)));

      // Original Locations press: other rows move out 200vh up and down, text before and after in the same row is pushed ∓180vw, and the chosen city name flies 1s into the center detail title spot (Flip)
      const loc = box.querySelector(".bp-loc");
      const rows = [...loc.querySelectorAll(".bp-loc__row")];
      let open = null;
      const close = () => {
        if (!open) return;
        const { btn, home, detail } = open;
        loc.classList.remove("is-open");
        const st = Flip.getState(btn);
        home.parentNode.insertBefore(btn, home);
        home.remove();
        Flip.from(st, { duration: 1, ease: "slow-out", absolute: true });
        gsap.to(rows, { y: 0, opacity: 1, duration: 1, ease: "slow-out" });
        gsap.to(loc.querySelectorAll(".bp-loc__city"), { x: 0, opacity: 1, duration: 1, ease: "slow-out" });
        gsap.to(detail.querySelectorAll("p > span"), { yPercent: 110, duration: 0.8, ease: "slow-out", stagger: 0.05, onComplete: () => gsap.set(detail, { autoAlpha: 0 }) });
        open = null;
      };
      loc.querySelectorAll(".bp-loc__detail p").forEach((p) => { p.innerHTML = `<span style="display:inline-block">${p.innerHTML}</span>`; gsap.set(p.firstChild, { yPercent: 110 }); });
      loc.querySelectorAll(".bp-loc__city").forEach((btn) => {
        const h = () => {
          if (open) return close();
          const row = btn.parentElement;
          const sib = [...row.children];
          const idx = sib.indexOf(btn);
          const ri = rows.indexOf(row);
          const detail = loc.querySelector(`[data-detail="${btn.dataset.city}"]`);
          loc.classList.add("is-open");
          gsap.to(sib.slice(0, idx), { x: "-180vw", duration: 1.2, ease: "slow-out" });
          gsap.to(sib.slice(idx + 1), { x: "180vw", duration: 1.2, ease: "slow-out" });
          gsap.to(rows.slice(0, ri), { y: "-200vh", opacity: 0, duration: 0.8, stagger: 0.02, ease: "power3.inOut" });
          gsap.to(rows.slice(ri + 1), { y: "200vh", opacity: 0, duration: 0.8, stagger: { each: 0.02, from: "end" }, ease: "power3.inOut" });
          const home = document.createElement("span");
          home.style.cssText = `display:inline-block;width:${btn.offsetWidth}px;height:${btn.offsetHeight}px;margin-right:7vw`;
          btn.parentNode.insertBefore(home, btn);
          const st = Flip.getState(btn);
          detail.querySelector(".bp-loc__dtitle").append(btn);
          gsap.set(detail, { autoAlpha: 1 });
          Flip.from(st, { duration: 1, delay: 0.4, ease: "slow-out", absolute: true, zIndex: 2 });
          gsap.fromTo(detail.querySelectorAll("p > span"), { yPercent: 110 }, { yPercent: 0, duration: 1, delay: 0.5, ease: "slow-out", stagger: 0.05 });
          open = { btn, home, detail };
        };
        btn.addEventListener("click", h);
        offs.push(() => btn.removeEventListener("click", h));
      });
      const closeBtn = loc.querySelector(".bp-loc__close");
      closeBtn.addEventListener("click", close);
      const esc = (e) => e.key === "Escape" && close();
      addEventListener("keydown", esc);
      offs.push(() => { removeEventListener("keydown", esc); closeBtn.removeEventListener("click", close); });

      return () => { mm.revert(); offs.forEach((f) => f()); };
    },
  });
})();
