// Step form: on advance the old step leaves at blur 5px and up 16px, and the new step settles from 16px below and blur 5px — original motion spring .5s (no bounce).
// The left vertical dots also tint to the current step with .2s ease-out. Nothing is actually sent.
(() => {
  const steps = [...document.querySelectorAll(".jn-step")];
  const dots = [...document.querySelectorAll(".jn-steps li")];
  const form = document.querySelector(".jn-form");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (window.CustomEase) gsap.registerPlugin(CustomEase);
  // Critically damped spring 1-(1+u)e^(-u) plotted as points and drawn as a curve
  const pts = Array.from({ length: 41 }, (_, i) => { const t = i / 40, u = t * 7.2; return `${t.toFixed(3)},${(1 - (1 + u) * Math.exp(-u)).toFixed(4)}`; });
  const spring = window.CustomEase ? CustomEase.create("if-spring-5", `M0,0 L${pts.join(" L")} L1,1`) : "power3.out";
  let cur = 0, busy = false;
  const go = (to) => {
    if (busy || to === cur || !steps[to]) return;
    busy = true;
    const from = steps[cur], next = steps[to], dir = to > cur ? 1 : -1;
    dots.forEach((d, i) => { d.classList.toggle("is-on", i === to); d.classList.toggle("is-done", i < to); });
    const done = () => { from.hidden = true; from.classList.remove("is-on"); next.classList.add("is-on"); cur = to; busy = false; next.querySelector("input, button")?.focus({ preventScroll: true }); };
    next.hidden = false;
    if (reduce) { done(); return; }
    gsap.to(from, { opacity: 0, filter: "blur(5px)", y: -16 * dir, duration: 0.5, ease: spring, onComplete: () => { gsap.set(from, { clearProps: "all" }); done(); } });
    gsap.fromTo(next, { opacity: 0, filter: "blur(5px)", y: 16 * dir }, { opacity: 1, filter: "blur(0px)", y: 0, duration: 0.5, ease: spring, clearProps: "filter,transform" });
  };
  // On first open too, the first step stands at the same type (16px below·5px blur) — original AnimatePresence initial
  if (!reduce) gsap.fromTo(steps[0], { opacity: 0, filter: "blur(5px)", y: 16 }, { opacity: 1, filter: "blur(0px)", y: 0, duration: 0.5, ease: spring, clearProps: "filter,transform" });
  form.addEventListener("submit", (e) => { e.preventDefault(); go(cur + 1); });
  form.addEventListener("click", (e) => { if (e.target.closest(".jn-prev")) go(cur - 1); });
})();
