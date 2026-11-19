// Services — the header shortcut button scrolls to that service section over 1s with ”cubic”, stopping 50px above
(() => {
  document.querySelectorAll(".d-jump").forEach((b) => b.addEventListener("click", () => {
    const t = document.getElementById(`service-type-${b.dataset.slug}`);
    if (!t) return;
    const y = t.getBoundingClientRect().top + scrollY - 50;
    if (window.D?.lenis) window.D.lenis.scrollTo(y, { duration: 1, easing: gsap.parseEase("cubic") });
    else if (window.ScrollToPlugin) gsap.to(window, { duration: 1, ease: "cubic", scrollTo: { y } });
    else scrollTo(0, y);
  }));
})();
