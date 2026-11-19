/* Learning-center question tabs — only the list of the pressed category shows, and the new list floats up from below over 0.4s */
(() => {
  const { reduce } = window.CFS;
  const tabs = [...document.querySelectorAll(".qa__tab")];
  const lists = [...document.querySelectorAll(".qa__list")];
  tabs.forEach((tab) => tab.addEventListener("click", () => {
    const g = tab.dataset.tab;
    tabs.forEach((t) => t.classList.toggle("is-on", t === tab));
    lists.forEach((l) => { l.hidden = l.dataset.group !== g; });
    const shown = lists.find((l) => !l.hidden);
    if (shown && !reduce) gsap.fromTo(shown.children, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: "power2.out" });
  }));
})();
