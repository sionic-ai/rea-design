// Interaction shared across several pages: header shrink (once scroll passes 0), menu drawer open/close (curtain .2s in · .1s out, MENU text .4s), back to top (.8s swing).
// Original uses jQuery fadeIn · fadeOut · animate, so the curve is swing(= It is sine.inOut)
(() => {
  const header = document.querySelector(".ic-header");
  const hm = document.querySelector(".ic-hm");
  const drawer = document.querySelector(".ic-drawer");
  const veil = document.querySelector(".ic-veil");
  const hmTx = document.querySelector(".ic-hm__tx");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const dur = (s) => (reduce ? 0 : s);

  const onScroll = () => header?.classList.toggle("is-short", scrollY > 0);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (hm && drawer && veil) {
    let open = false;
    const set = (next) => {
      open = next;
      hm.classList.toggle("is-close", open);
      hm.setAttribute("aria-expanded", String(open));
      drawer.classList.toggle("is-open", open);
      drawer.toggleAttribute("inert", !open);
      gsap.killTweensOf([veil, hmTx]);
      if (open) {
        gsap.fromTo(veil, { display: "block", opacity: 0 }, { opacity: 0.6, duration: dur(0.2), ease: "sine.inOut" });
        // jQuery fadeOut(400) — once fully faded it becomes display:none, so the icon drops to the center of the button. The swing curve is the same as sine.inOut
        gsap.to(hmTx, { opacity: 0, duration: dur(0.4), ease: "sine.inOut", onComplete: () => gsap.set(hmTx, { display: "none" }) });
      } else {
        gsap.to(veil, { opacity: 0, duration: dur(0.1), ease: "sine.inOut", onComplete: () => gsap.set(veil, { display: "none" }) });
        gsap.fromTo(hmTx, { display: "", opacity: 0 }, { opacity: 1, duration: dur(0.4), ease: "sine.inOut" });
      }
      if (innerWidth <= 768) document.body.style.overflow = open ? "hidden" : "";
    };
    drawer.setAttribute("inert", "");
    hm.addEventListener("click", () => set(!open));
    document.querySelector(".ic-search")?.addEventListener("click", () => set(!open));
    veil.addEventListener("click", () => set(false));
    drawer.querySelectorAll(".ic-drawer__child").forEach((a) => a.addEventListener("click", () => set(false)));
    addEventListener("keydown", (e) => { if (e.key === "Escape" && open) set(false); });
  }

  document.querySelectorAll('a[href="#top"]').forEach((a) =>
    a.addEventListener("click", (e) => {
      e.preventDefault();
      const from = scrollY, t0 = performance.now(), d = dur(0.8) * 1000;
      if (!d) return scrollTo(0, 0);
      const step = (now) => {
        const p = Math.min(1, (now - t0) / d);
        scrollTo(0, from * (1 - (0.5 - Math.cos(p * Math.PI) / 2)));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }),
  );
})();
