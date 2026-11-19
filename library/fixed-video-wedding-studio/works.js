// Gallery tabs — the original keeps two panels as Swiper fade (speed 0), pressing a tab fades the whole panel out over .35s power1.inOut, then the swapped panel stands back up over .35s.
// Presses made during the spin are ignored.
(() => {
  const tabs = [...document.querySelectorAll("[data-tabs] [data-tab]")];
  const box = document.querySelector("[data-panes]");
  const panes = [...document.querySelectorAll("[data-pane]")];
  if (!tabs.length || !box) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let busy = false, now = 0;
  const swap = (i) => {
    tabs.forEach((t, k) => { t.classList.toggle("is-active", k === i); t.setAttribute("aria-selected", String(k === i)); });
    panes.forEach((p, k) => { p.hidden = k !== i; p.classList.toggle("is-active", k === i); });
    now = i;
    window.ScrollTrigger?.refresh();
  };
  tabs.forEach((t, i) => t.addEventListener("click", () => {
    if (busy || i === now) return;
    if (reduce) return swap(i);
    busy = true;
    gsap.to(box, { opacity: 0, duration: 0.35, ease: "power1.inOut", overwrite: true, onComplete: () => {
      swap(i);
      gsap.to(box, { opacity: 1, duration: 0.35, ease: "power1.inOut", overwrite: true, onComplete: () => { busy = false; } });
    } });
  }));
})();
