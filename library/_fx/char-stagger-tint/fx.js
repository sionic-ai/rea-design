// Split link text into letters inside word chunks. On hover the letters color in from the first at .03s intervals, and on leave they return to their own color at the same interval
// (GSAP default .5s power1.out). Exactly the original’s SplitType chars + gsap.to(color). The color reads --fx-tint (default --kf-accent) as a computed value
(() => {
  const split = (el) => {
    const words = el.textContent.trim().split(/\s+/);
    if (!words[0]) return [];
    el.setAttribute("aria-label", el.textContent.trim());
    el.innerHTML = words.map((w) => `<span class="fx-cst-w" aria-hidden="true">${[...w].map((c) => `<span class="fx-cst-c">${c}</span>`).join("")}</span>`).join(" ");
    return [...el.querySelectorAll(".fx-cst-c")];
  };
  kfFx.register("char-stagger-tint", (el, { options, reduce, hover }) => {
    if (!hover) return;
    const target = el.querySelector('[data-fx-part="text"]') || el;
    const original = target.innerHTML;
    const chars = split(target);
    if (!chars.length) return () => { target.innerHTML = original; };
    const each = reduce ? 0 : +(options.each ?? 0.03), dur = reduce ? 0 : +(options.dur ?? 0.5);
    const ease = kfFx.ease(options.ease || "power1.out", "power1.out");
    const tint = () => getComputedStyle(el).getPropertyValue("--fx-tint").trim() || getComputedStyle(document.documentElement).getPropertyValue("--kf-accent").trim();
    const on = () => gsap.to(chars, { color: tint(), duration: dur, ease, stagger: each, overwrite: true });
    const off = () => gsap.to(chars, { color: getComputedStyle(target).color, duration: dur, ease, stagger: each, overwrite: true, onComplete: () => gsap.set(chars, { clearProps: "color" }) });
    el.addEventListener("mouseenter", on);
    el.addEventListener("mouseleave", off);
    return () => { el.removeEventListener("mouseenter", on); el.removeEventListener("mouseleave", off); gsap.killTweensOf(chars); target.innerHTML = original; target.removeAttribute("aria-label"); };
  });
})();
