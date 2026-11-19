(() => {
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Original inview: on load and on scroll ‹scroll > Turn on when ‹element top − window + window/5› is reached — when the element’s top edge (60px below its position before rising) crosses the 80% line of the screen. Ones already passed are turned on too
  const risers = [...document.querySelectorAll("[data-rise]")];
  risers.forEach((el) => el.dataset.rise && el.style.setProperty("--rise-delay", `${+el.dataset.rise / 1000}s`));
  const rise = () => {
    const line = innerHeight * 0.8;
    for (let i = risers.length - 1; i >= 0; i--) {
      if (risers[i].getBoundingClientRect().top < line) { risers[i].classList.add("is-in"); risers.splice(i, 1); }
    }
    if (!risers.length) removeEventListener("scroll", rise);
  };
  if (reduce) risers.forEach((el) => el.classList.add("is-in"));
  else {
    addEventListener("scroll", rise, { passive: true });
    addEventListener("load", rise);
  }

  // Phone menu drawer (original jquery-drawer): opens and closes with the button and links in the menu, and locks document scroll while open
  const burger = document.querySelector(".sh-burger");
  const setMenu = (open) => {
    root.classList.toggle("is-menu-open", open);
    document.body.classList.toggle("is-locked", open);
    burger?.setAttribute("aria-expanded", String(open));
  };
  burger?.addEventListener("click", () => setMenu(!root.classList.contains("is-menu-open")));
  document.querySelectorAll(".sh-nav a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  addEventListener("keydown", (e) => e.key === "Escape" && setMenu(false));

  // Back-to-top button: floats up in .4s after scrolling past 1000px
  const toTop = document.querySelector(".sh-totop");
  const showTop = () => toTop?.classList.toggle("is-show", scrollY > 1000);
  addEventListener("scroll", showTop, { passive: true });
  showTop();
})();
