// Work — at first only five are shown, and pressing Load more makes the rest float up from 40px below over 1.5s power3.out in .15 steps. Only one filter is on at a time.
(() => {
  const items = [...document.querySelectorAll(".w-grid__item")];
  const rest = items.slice(5);
  rest.forEach((i) => i.classList.add("is-hidden"));
  const more = document.querySelector("[data-w-more]");
  more?.addEventListener("click", () => {
    rest.forEach((i) => i.classList.remove("is-hidden"));
    more.parentElement.remove();
    window.ScrollTrigger?.refresh();
    if (!window.gsap || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.fromTo(rest, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 1.5, ease: "power3.out", stagger: 0.15, overwrite: true });
  });
  document.querySelectorAll(".q-filters").forEach((g) => g.addEventListener("click", (e) => {
    const b = e.target.closest(".q-filter"); if (!b) return;
    g.querySelectorAll(".q-filter").forEach((x) => x.classList.toggle("is-on", x === b));
  }));
})();

// Filter button — pressing it unfolds the filter chip row
(() => {
  const b = document.querySelector("[data-w-filters]"), box = document.querySelector(".w-grid__filters");
  b?.addEventListener("click", () => {
    const open = box.hidden;
    box.hidden = !open;
    b.setAttribute("aria-expanded", String(open));
    b.querySelector("span").textContent = open ? "−" : "+";
    window.ScrollTrigger?.refresh();
  });
})();
