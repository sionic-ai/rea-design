// Sub-page motion: narrow-view window · News tab filtering · consultation band parallax.
window.rgPages = window.rgPages || {};
window.rgPages.sub = (root) => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const offs = [];
  const d = reduce ? 0 : 1;

  document.querySelectorAll("[data-modal-open]").forEach((btn) => {
    const modal = document.querySelector(`[data-modal="${btn.dataset.modalOpen}"]`);
    const panel = modal.querySelector(".modal__panel");
    // Original Alpine x-transition: both curtain and panel enter in 300ms ease-out (the panel from 16px below and transparent) and leave in 200ms ease-in.
    const easeOut = "cubic-bezier(0,0,0.2,1)", easeIn = "cubic-bezier(0.4,0,1,1)";
    const open = () => {
      modal.hidden = false;
      if (window.rgLenis) window.rgLenis.stop();
      gsap.fromTo(modal, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 * d, ease: easeOut });
      gsap.fromTo(panel, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.3 * d, ease: easeOut });
    };
    const close = () => {
      if (window.rgLenis) window.rgLenis.start();
      gsap.to(panel, { opacity: 0, y: 16, duration: 0.2 * d, ease: easeIn });
      gsap.to(modal, { autoAlpha: 0, duration: 0.2 * d, ease: easeIn, onComplete: () => (modal.hidden = true) });
    };
    btn.addEventListener("click", open);
    modal.querySelectorAll("[data-modal-close]").forEach((c) => c.addEventListener("click", close));
    const esc = (e) => e.key === "Escape" && !modal.hidden && close();
    addEventListener("keydown", esc);
    offs.push(() => removeEventListener("keydown", esc));
  });

  const tabs = document.querySelector("[data-tabs]");
  if (tabs) {
    const items = document.querySelectorAll(".nl__grid > li");
    tabs.addEventListener("click", (e) => {
      const t = e.target.closest("[data-tab]");
      if (!t) return;
      tabs.querySelectorAll("[data-tab]").forEach((b) => {
        b.classList.toggle("is-on", b === t);
        b.setAttribute("aria-selected", String(b === t));
      });
      const shown = [];
      items.forEach((li) => {
        const on = t.dataset.tab === "all" || li.dataset.cat === t.dataset.tab;
        li.hidden = !on;
        if (on) shown.push(li.querySelector(".nc"));
      });
      gsap.fromTo(shown, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6 * d, stagger: 0.06, ease: "power2.out", overwrite: true });
      ScrollTrigger.refresh();
    });
  }

  // Consultation strip — original jobsCtaAnimation: from the strip entering from the bottom of the screen until it exits at the top (progress = (screen height − top edge) ÷ (band height + screen height))
  // Back glow image −56→56px · left photo −24→18 · right photo −16→12 move in a straight line
  const arc = document.querySelector("[data-cta-arc]");
  if (arc && !reduce) {
    const box = arc.parentElement;
    const layers = [[arc, -56, 56], [box.querySelector(".jl-cta__ph.is-l"), -24, 18], [box.querySelector(".jl-cta__ph.is-r"), -16, 12]].filter(([el]) => el);
    const put = (p) => layers.forEach(([el, a, b]) => gsap.set(el, { y: a + (b - a) * p, force3D: true }));
    put(0);
    ScrollTrigger.create({ trigger: box, start: "top bottom", end: "bottom top", onUpdate: (st) => put(st.progress), onRefresh: (st) => put(st.progress) });
  }

  return () => offs.forEach((fn) => fn());
};
// Job list · news · rules · job detail all use the same subpage motion
window.rgPages.recruit = window.rgPages.news = window.rgPages.terms = window.rgPages.sub;
