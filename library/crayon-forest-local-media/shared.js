// Motion spanning several pages — Lenis (lerp .12), header-band passed indicator, phone menu panel (slides out in .5s · items .08s apart), tab label pop-up (back.inOut(4) 1.3s)
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  gsap.registerPlugin(ScrollTrigger);
  const html = document.documentElement;

  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ duration: 1.1, lerp: 0.12 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  window.ymLenis = lenis;

  const header = document.getElementById("l-header");
  ScrollTrigger.create({ trigger: header, start: "bottom top", end: "max", onEnter: () => document.body.classList.add("is-headerpassed"), onLeaveBack: () => document.body.classList.remove("is-headerpassed") });

  // Phone menu — on open the panel comes from the left in .5s, items from 10px left .2s later at .08s spacing. On close it goes back to the left in .3s
  const nav = document.querySelector(".ym-nav");
  const burger = document.querySelector(".ym-burger");
  const items = nav ? [...nav.querySelectorAll(".ym-nav__item")] : [];
  const d = (s) => (reduce ? 0 : s);
  const toggle = () => {
    const open = html.classList.contains("is-menuopen");
    burger.setAttribute("aria-expanded", String(!open));
    if (open) {
      html.classList.remove("is-menuopen");
      lenis?.start();
      gsap.timeline({ onComplete: () => { gsap.set(nav, { autoAlpha: 0, overwrite: true }); gsap.set(items, { alpha: 0, overwrite: true }); } })
        .fromTo(nav, { x: "0%" }, { duration: d(0.3), ease: "power1.out", x: "-100%" });
    } else {
      html.classList.add("is-menuopen");
      lenis?.stop();
      gsap.timeline().set(nav, { autoAlpha: 1 })
        .fromTo(nav, { x: "-100%" }, { duration: d(0.5), ease: "power1.out", x: "0%" })
        .fromTo(items, { x: -10, alpha: 0 }, { duration: d(0.5), ease: "power1.out", x: 0, alpha: 1, stagger: d(0.08) }, "<+.2");
    }
  };
  burger?.addEventListener("click", toggle);

  // Move within the same section — closes the menu if open, then Lenis for 1.5s after .6s
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href*='#']");
    if (!a) return;
    const url = new URL(a.href);
    if (url.pathname !== location.pathname || !url.hash) return;
    const target = document.querySelector(url.hash);
    if (!target) return;
    e.preventDefault();
    const wasOpen = html.classList.contains("is-menuopen");
    if (wasOpen) toggle();
    setTimeout(() => (lenis ? lenis.scrollTo(target, { duration: 1.5 }) : target.scrollIntoView()), wasOpen ? 600 : 0);
  });

  // Tab label — when its top edge touches the bottom of the screen it pops up from .85x and 10px below (once)
  const titles = document.querySelectorAll(".js-animatetitle");
  if (reduce) gsap.set(titles, { alpha: 1 });
  else gsap.matchMedia().add("all", () => {
    ScrollTrigger.batch(titles, {
      start: "0% 100%",
      once: true,
      onEnter: (els) => gsap.fromTo(els, { scale: 0.85, y: 10 }, { ease: "back.inOut(4)", duration: 1.3, y: 0, scale: 1, alpha: 1 }),
    });
  });
})();
