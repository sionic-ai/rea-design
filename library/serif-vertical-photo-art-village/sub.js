// Subpage: the cover title stays stuck at the bottom of the screen until the cover ends (wide screens), and opens and closes the video panel. On wide screens the left category · work filter sticks until the end of the list.
(() => {
  const mm = gsap.matchMedia();
  mm.add("(min-width: 767px) and (prefers-reduced-motion: no-preference)", () => {
    document.querySelectorAll(".s-cover").forEach((cover) => {
      const title = cover.querySelector(".s-cover__title");
      const inner = cover.querySelector(".s-cover__inner");
      ScrollTrigger.create({ trigger: title, start: () => `bottom+=${rpx(30)} bottom`, endTrigger: cover, end: "bottom bottom", onUpdate: (s) => { inner.style.transform = `translateY(${s.progress * (s.end - s.start)}px)`; } });
    });
    document.querySelectorAll("[data-stick]").forEach((el) => {
      const list = document.querySelector(el.dataset.stick);
      ScrollTrigger.create({ trigger: el, start: () => `top-=${rpx(30)} top`, end: () => `top+=${list.offsetHeight - el.offsetHeight - rpx(30)} top`, pin: true, pinSpacing: false });
    });
  });

  document.querySelectorAll(".i-movie").forEach((movie) => {
    const modal = movie.querySelector(".i-movie__modal");
    const set = (on) => { movie.classList.toggle("is-open", on); modal.setAttribute("aria-hidden", String(!on)); };
    movie.querySelector(".i-movie__btn").addEventListener("click", () => set(true));
    movie.querySelector(".i-movie__close").addEventListener("click", () => set(false));
    addEventListener("keydown", (e) => { if (e.key === "Escape") set(false); });
  });
})();
