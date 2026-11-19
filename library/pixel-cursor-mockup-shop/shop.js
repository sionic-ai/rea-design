// Shop — pressing a filter tab makes the cards fade in .3s then rise from 40px below in .06s stagger (.5s power4.out)
(() => {
  const { reduce, $$, ready } = window.VS;
  const grid = document.querySelector("[data-grid]");
  const cards = $$(".vs-card", grid);
  const show = (list) => reduce ? gsap.set(list, { opacity: 1, y: 0 }) : gsap.fromTo(list, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.5, ease: "power4.out", stagger: 0.06 });
  gsap.set(cards, { opacity: 0, y: 40 });
  ready.then(() => show(cards.slice(0, 8)).then?.(() => {}));
  ScrollTrigger.batch(cards.slice(8), { start: "top 95%", once: true, onEnter: (b) => show(b) });
  $$("[data-tabs] .vs-tab").forEach((tab, i, all) => tab.addEventListener("click", () => {
    all.forEach((t) => t.classList.toggle("is-active", t === tab));
    gsap.to(cards, { opacity: 0, duration: reduce ? 0 : 0.3, ease: "power2.out", onComplete: () => {
      cards.forEach((c, k) => c.classList.toggle("hidden", i > 0 && (k + i) % 3 === 0));
      ScrollTrigger.refresh();
      show(cards.filter((c) => !c.classList.contains("hidden")));
    } });
  }));
})();
