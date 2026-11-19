// Things spanning several pages — loader walk (the first page is handled by index.js), phone menu curved panel, burger interaction
(() => {
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  CustomEase.create("cmInOut", "M0,0 C0.86,0 0.07,1 1,1");
  CustomEase.create("cmOut", "M0,0 C0.17,0.84 0.044,1 1,1");
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
  const loader = document.querySelector(".cm-loader");
  const isHome = document.body.classList.contains("is-home");

  // Other pages — once everything has loaded, the dark curtain thins out in .8s. The original curve name ”ExpoOut” is unknown to GSAP so it runs on the default curve (power1.out) (measured and confirmed)
  if (!isHome) addEventListener("load", () => {
    const done = () => { root.classList.remove("cm-loading"); loader?.remove(); };
    if (reduce || !loader) return done();
    gsap.to(loader, { opacity: 0, duration: 0.8, ease: "power1.out", onComplete: done });
  });

  // Phone menu — three original path variants (cover from right → bend to center → exit left). Length comes from screen width (1000/(3500−width))
  const menu = document.getElementById("cm-menu");
  const burger = document.querySelector(".cm-burger");
  const path = menu?.querySelector(".cm-menu__mask path");
  const scroller = menu?.querySelector(".cm-menu__scroller");
  let busy = false, open = false;
  const secs = (k) => Math.round((1000 / (k - innerWidth)) * 100) / 100;
  const toggle = () => {
    if (busy || !menu) return;
    busy = true;
    if (!open) menu.style.visibility = "visible";
    const before = open ? "visible" : "hidden", after = open ? "hidden" : "visible";
    root.classList.toggle("is-menu-open", !open);
    burger.setAttribute("aria-expanded", String(!open));
    const done = () => { busy = false; if (open) menu.style.visibility = "hidden"; open = !open; };
    if (reduce) { gsap.set(scroller, { visibility: after }); return done(); }
    // Original curve name ”Expo0ut” is unknown to GSAP so it runs on the default curve (power1.out) — keeping that same feel
    gsap.timeline({ onComplete: done })
      .set(scroller, { visibility: before })
      .set(path, { attr: { d: "M100,100 H100 V0 H100 Q100,50 100,100 Z" } })
      .to(path, { duration: secs(3500), ease: "power1.out", attr: { d: "M100,100 H0 V0 H100 Q100,50 100,100 Z" } })
      .set(scroller, { visibility: after })
      .to(path, { duration: secs(4333), ease: "none", attr: { d: "M50,100 H0 V0 H50 Q0,50 50,100 Z" } })
      .to(path, { duration: secs(3500), ease: "power1.out", attr: { d: "M0,100 H0 V0 H0 Q0,50 0,100 Z" } });
  };
  burger?.addEventListener("click", toggle);
  menu?.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => open && toggle()));
  matchMedia("(min-width: 1024px)").addEventListener("change", () => {
    if (!open) return;
    open = false; busy = false; root.classList.remove("is-menu-open"); menu.style.visibility = "hidden"; gsap.set(scroller, { visibility: "hidden" });
  });
  // Burger hover — on hover the bar fills fold and unfold in sequence over .5s (re-hovering within .5s triggers only once)
  let last = 0;
  burger?.addEventListener("pointerenter", (e) => {
    if (e.pointerType !== "mouse" || burger.classList.contains("is-hover") || performance.now() - last < 500) return;
    burger.classList.add("is-hover");
    setTimeout(() => { burger.classList.remove("is-hover"); last = performance.now(); }, 500);
  });
})();
