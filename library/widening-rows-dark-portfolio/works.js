// Branch button — non-matching cards blur out in .4s shrinking to .96× and leave, matching cards enter from 30px below, delayed .35s, in .05s sequence over .9s
(() => {
  const bar = document.querySelector("[data-filters]");
  if (!bar) return;
  const cards = [...document.querySelectorAll("[data-tags]")];
  const buttons = [...bar.querySelectorAll("button[data-filter]")];
  buttons.forEach((b) => b.addEventListener("click", () => {
    const f = b.dataset.filter;
    buttons.forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    const show = cards.filter((c) => f === "all" || c.dataset.tags.split("|").includes(f)), hide = cards.filter((c) => !show.includes(c));
    gsap.to(hide, { opacity: 0, scale: 0.96, duration: 0.4, ease: "power3.out", onComplete: () => hide.forEach((c) => { c.hidden = true; }) });
    show.forEach((c) => { c.hidden = false; });
    gsap.fromTo(show, { opacity: 0, y: 30 }, { opacity: 1, y: 0, scale: 1, duration: 0.9, ease: "expo.out", stagger: 0.05, delay: 0.35, onComplete: () => ScrollTrigger.refresh() });
  }));
})();
