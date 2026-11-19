// About — over the photo the description pill follows the cursor with a delay (desktop), and on phones the value cards are swiped horizontally instead of tilted
(() => {
  const frame = document.querySelector(".av-photo__frame");
  const tip = frame?.querySelector(".av-tip");
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (frame && tip && fine && !still) {
    const xTo = gsap.quickTo(tip, "x", { duration: 0.35, ease: "power3.out" });
    const yTo = gsap.quickTo(tip, "y", { duration: 0.35, ease: "power3.out" });
    frame.addEventListener("pointerenter", (e) => {
      const r = frame.getBoundingClientRect();
      gsap.set(tip, { x: e.clientX - r.left + 12, y: e.clientY - r.top + 16 });
      gsap.fromTo(tip, { scale: 0.98 }, { opacity: 1, scale: 1, duration: 0.13, ease: "power2.out", overwrite: "auto" });
    });
    frame.addEventListener("pointermove", (e) => {
      const r = frame.getBoundingClientRect();
      xTo(Math.min(e.clientX - r.left + 12, r.width - tip.offsetWidth));
      yTo(e.clientY - r.top + 16);
    });
    frame.addEventListener("pointerleave", () => gsap.to(tip, { opacity: 0, duration: 0.12, ease: "power2.out", overwrite: "auto" }));
  }
  // Below 768px the original turns the fan into horizontally swiped cards — detach the parts and erase the tilt
  const fan = document.querySelector(".av-values");
  const narrow = matchMedia("(max-width: 767px)");
  const sync = () => {
    if (!fan) return;
    if (narrow.matches) {
      fan.setAttribute("data-fx", "");
      fan.querySelectorAll(".av-value").forEach((v) => v.setAttribute("data-fx", ""));
    } else {
      fan.setAttribute("data-fx", "fan-focus-cards");
      fan.querySelectorAll(".av-value").forEach((v) => v.setAttribute("data-fx", "holo-tilt-card"));
    }
  };
  narrow.addEventListener("change", sync);
  sync();
})();
