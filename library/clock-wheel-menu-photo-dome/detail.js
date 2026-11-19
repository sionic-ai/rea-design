// Detail entrance (original PhotoDetail) — the title’s first line · second line · ”scroll down to view” text appear line by line, each .25s later, entering from 50% on the right (.5s, the .45s within a line split with power2),
// Numbers appear over .3s after .6s, and prev/next after 1s. When the center panel of the vertical strip changes, the number changes.
(() => {
  const root = document.querySelector(".mc-detail");
  if (!root) return;
  document.querySelector(".mc-dial")?.dispatchEvent(new CustomEvent("fx:dial", { detail: { to: "photo" } }));
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const pn = document.querySelectorAll(".mc-prev, .mc-next");
  if (reduce) gsap.set([...root.querySelectorAll(".char"), ...pn], { opacity: 1, xPercent: 0 });
  else {
    [".mc-clock-name__1 .char", ".mc-clock-name__2 .char", ".mc-detail__ind p:first-child .char"].forEach((sel, t) =>
      gsap.fromTo(root.querySelectorAll(sel), { opacity: 0, xPercent: 50 }, { delay: 0.25 * t, opacity: 1, xPercent: 0, stagger: { amount: 0.45, ease: "power2" } }));
    gsap.fromTo(root.querySelectorAll(".mc-count .char"), { opacity: 0, xPercent: 50 }, { delay: 0.6, opacity: 1, xPercent: 0, stagger: { amount: 0.3, ease: "power2" } });
    gsap.fromTo(pn, { opacity: 0 }, { delay: 1, opacity: 1 });
  }
  const now = root.querySelector("[data-now]");
  root.querySelector(".mc-vstrip")?.addEventListener("fx:bend-strip-gl", (e) => { if (now) now.textContent = String(e.detail.index + 1); });
})();
