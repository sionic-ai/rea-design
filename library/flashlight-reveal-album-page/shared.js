// Spans several screens — Lenis 1.0.28 (duration 1.2), menu panel, lamp button (turns the whole light panel on·off), loader (4s → blur → first frame → top band → lights out)
(() => {
  const body = document.body;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  gsap.registerPlugin(ScrollTrigger);

  // The original doesn’t connect Lenis to ScrollTrigger and leaves it to the window scroll event — use the same path
  const lenis = new Lenis({ duration: 1.2, orientation: "vertical", gestureOrientation: "vertical", smoothWheel: true, smoothTouch: false, touchMultiplier: 2 });
  window.lenis = lenis;
  const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
  requestAnimationFrame(raf);
  lenis.stop();

  // Menu panel — pressing a row closes it and jumps to that section
  const burger = document.querySelector(".sh-burger");
  const setMenu = (open) => {
    body.classList.toggle("is-menu", open);
    burger?.classList.toggle("is-open", open);
    burger?.setAttribute("aria-expanded", String(open));
    burger?.setAttribute("aria-label", open ? "Close Menu" : "Open Menu");
  };
  burger?.addEventListener("click", () => setMenu(!body.classList.contains("is-menu")));
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      const target = id === "#top" || id === "#" ? 0 : document.querySelector(id);
      if (target == null) return;
      e.preventDefault();
      if (body.classList.contains("is-menu")) setMenu(false);
      lenis.scrollTo(target);
    });
  });

  // Lamp — turns the whole bright board mask background on (.8s) and off. When off, the bright board title shadow shows
  const rect = document.getElementById("sh-m-rect");
  const sw = document.querySelector(".sh-switch");
  const toggleLight = () => {
    const full = rect.classList.toggle("is-full");
    sw?.classList.toggle("is-on", full);
    sw?.setAttribute("aria-pressed", String(full));
    body.classList.toggle("is-dark", !full);
    document.querySelector(".sh-cover2")?.classList.toggle("is-off", full);
  };
  window.shToggleLight = toggleLight;
  sw?.addEventListener("click", toggleLight);

  // Loader — 0→100% over 4 seconds, the logo drawing changes across six frames, rests 1.5s, then fades out and lifts away
  const pct = document.querySelector(".sh-start__pct");
  const imgs = [...document.querySelectorAll(".sh-start__img")];
  const show = () => {
    gsap.to(".sh-start", { autoAlpha: 0, duration: 0.3 });
    gsap.to(".sh-kv", { filter: "blur(0px)", autoAlpha: 1, duration: 0.6 });
    setTimeout(() => {
      gsap.to([".sh-above", ".sh-share"], { filter: "blur(0px)", autoAlpha: 1, duration: 0.4 });
    }, 500);
    setTimeout(() => { toggleLight(); lenis.start(); }, 2000);
  };
  const run = () => {
    if (reduce) {
      gsap.set(".sh-start", { autoAlpha: 0 });
      // Reduced motion — the flashlight doesn’t move, so leave the light on so all the text is visible
      gsap.set([".sh-kv", ".sh-above", ".sh-share"], { filter: "blur(0px)", autoAlpha: 1 });
      lenis.start();
      return;
    }
    gsap.timeline({
      onUpdate() {
        const p = Math.round(100 * this.progress());
        if (pct) pct.textContent = `${p}%`;
        const i = Math.min(Math.floor(p / (100 / imgs.length)), imgs.length - 1);
        imgs.forEach((im, k) => im.classList.toggle("is-active", k === i));
      },
      onComplete() {
        setTimeout(() => {
          gsap.to(".sh-start", { filter: "blur(50px)", duration: 1 });
          setTimeout(show, 500);
        }, 1500);
      },
    }).to({}, { duration: 4 });
  };
  if (document.readyState === "complete") run();
  else addEventListener("load", run, { once: true });
})();
