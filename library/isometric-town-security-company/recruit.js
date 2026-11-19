/* Careers first page — FAQ fold (height 0 ↔ own height .4s) */
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  // FAQ: answers open like the original at .3s(swing = sine.inOut) pushes it up, and hides it once fully folded. Other rows are closed
  const heads = [...document.querySelectorAll(".rc-faq__list button")];
  const slide = (b, open) => {
    const a = b.nextElementSibling;
    b.setAttribute("aria-expanded", String(open));
    gsap.killTweensOf(a);
    if (reduce) { a.hidden = !open; return; }
    if (open) { a.hidden = false; gsap.fromTo(a, { height: 0 }, { height: "auto", duration: 0.3, ease: "sine.inOut", onComplete: () => { gsap.set(a, { clearProps: "height" }); ScrollTrigger.refresh(); } }); }
    else gsap.to(a, { height: 0, duration: 0.3, ease: "sine.inOut", onComplete: () => { a.hidden = true; gsap.set(a, { clearProps: "height" }); ScrollTrigger.refresh(); } });
  };
  heads.forEach((b) => b.addEventListener("click", () => {
    const open = b.getAttribute("aria-expanded") !== "true";
    heads.forEach((o) => { if (o !== b && o.getAttribute("aria-expanded") === "true") slide(o, false); });
    slide(b, open);
  }));
  // Benefits and daily banner: set the hovered side’s ratio to .68
  const split = document.querySelector(".rc-banners");
  if (split && !reduce && !matchMedia("(max-width: 767px)").matches) {
    const set = (k) => { split.dataset.active = k; split.style.setProperty("--ratio-left", k === "benefits" ? "0.68" : k === "oneday" ? "0.32" : "0.5"); };
    split.querySelectorAll(".rc-banner").forEach((p) => { p.addEventListener("mouseenter", () => set(p.dataset.panel)); p.addEventListener("mouseleave", () => set("")); });
  }
})();
