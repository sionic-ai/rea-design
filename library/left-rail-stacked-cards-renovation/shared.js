// Shared across pages — smooth scroll (Lenis default lerp .1), menu panel open/close (wide panels turn on at once and off), subpage [ Name ] label rising in
(() => {
  const body = document.body;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  gsap.registerPlugin(ScrollTrigger);

  // lenis@1.0.19 UMD exports the global as lowercase lenis
  const LenisClass = window.Lenis || window.lenis;
  const lenis = reduce || !LenisClass ? null : new LenisClass({ smooth: true });
  if (lenis) {
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  window.rlLenis = lenis;
  addEventListener("resize", () => { if (innerWidth > 860) ScrollTrigger.refresh(); });

  const rail = document.querySelector(".rl-rail"), menu = document.querySelector(".rl-menu");
  const btn = document.querySelector(".rl-menu-btn"), btnText = btn?.querySelector("span");
  const msg = document.querySelector(".rl-msg"), bg = document.querySelector(".rl-menu-bg");
  const set = (open) => {
    body.classList.toggle("is-fixed", open);
    if (open) lenis?.stop(); else lenis?.start();
    bg?.classList.toggle("is-show", open);
    rail?.classList.toggle("is-open", open);
    menu?.classList.toggle("is-open", open);
    btn?.classList.toggle("is-open", open);
    msg?.classList.toggle("is-open", open);
    btn?.setAttribute("aria-expanded", String(open));
    if (btnText) btnText.textContent = open ? "Close Menu" : "View Menu";
  };
  btn?.addEventListener("click", () => set(!btn.classList.contains("is-open")));
  bg?.addEventListener("click", () => set(false));
  bg?.querySelector(".rl-close")?.addEventListener("click", () => set(false));
  addEventListener("keydown", (e) => { if (e.key === "Escape" && btn?.classList.contains("is-open")) set(false); });

  // The original raises the head label from 2rem below with GSAP defaults (.5s power1.out)
  const label = document.querySelector(".rl-page__label .en");
  if (label && !reduce) gsap.to(label, { y: 0 });
})();
