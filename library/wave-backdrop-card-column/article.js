// News body only: a red bar left of the title grows from the top and letters light up one by one (original RevealTitle)
(() => {
  const { gsap, reduce, buildRolling, playRolling } = window.SDB;
  const date = document.querySelector(".art__date");
  if (date) { buildRolling(date); reduce ? date.querySelectorAll(".rolling-digit").forEach((s) => gsap.set(s.firstChild, { yPercent: -s.dataset.d * (100 / 11) })) : playRolling(date, "fast"); }
  const el = document.querySelector("[data-reveal-title]");
  if (!el) return;
  const t = el.textContent;
  el.setAttribute("aria-label", t);
  el.innerHTML = [...t].map((c) => `<span class="ch" aria-hidden="true">${c}</span>`).join("");
  if (reduce) return;
  // Original: 300ms after the document attaches the bar runs .3s expo, letters start .1s before the bar ends at .02s each with .009s stagger (expo)
  const tl = gsap.timeline({ delay: 0.3 });
  tl.fromTo(".art__bar", { scaleY: 0 }, { scaleY: 1, transformOrigin: "top center", duration: 0.3, ease: "expo.out" })
    .fromTo(el.querySelectorAll(".ch"), { opacity: 0 }, { opacity: 1, duration: 0.02, stagger: 0.009, ease: "expo.out" }, "-=0.1");
})();
