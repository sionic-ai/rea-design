// Home — yellow fill (aria-current) on the menu cell of the section being viewed, pressing a menu item or map pin scrolls there in (distance × .5)ms easeOutCubic
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s) => document.querySelector(s);
  const docTop = (el) => el.getBoundingClientRect().top + scrollY;
  const shiftY = (el) => (el ? new DOMMatrixReadOnly(getComputedStyle(el).transform).m42 : 0);
  const links = [...document.querySelectorAll(".mk-nav [data-sec]")];

  const mark = () => {
    const y = scrollY, sec = { about: docTop($("#about")), movie: docTop($("#movie")), contact: docTop($("#contact")), foot: docTop($("#footer")) };
    const now = y <= sec.about ? "" : y < sec.movie ? "about" : y < sec.contact ? "movie" : y < sec.foot ? "contact" : "";
    links.forEach((a) => (a.dataset.sec === now ? a.setAttribute("aria-current", "true") : a.removeAttribute("aria-current")));
  };
  addEventListener("scroll", mark, { passive: true });
  mark();

  // Original _goto — scrolls to the target spot (section anchor minus the Rellax offset) over half the target y in ms
  const go = (y) => {
    y = Math.max(0, Math.round(y));
    if (reduce) { scrollTo(0, y); return; }
    gsap.to(window, { scrollTo: y, duration: (y * 0.5) / 1000, ease: "power2.out", overwrite: true });
  };
  const target = {
    "about-title": () => docTop($("#about-title")),
    "movie-title": () => docTop($("#movie-title")) - shiftY($(".mk-movie__contents")),
    "contact-title": () => docTop($("#contact-title")) - shiftY($(".mk-contact__contents")),
  };
  document.querySelectorAll('.mk-nav a[href*="#"], .mk-btn[href^="#"]').forEach((a) => {
    const id = a.getAttribute("href").split("#")[1];
    if (!target[id]) return;
    a.addEventListener("click", (e) => { e.preventDefault(); $("#mk-header")?.classList.remove("is-open"); go(target[id]()); });
  });
  document.querySelectorAll(".mk-map2__pin").forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      const shop = $(a.getAttribute("href"));
      if (shop) go(docTop(shop) - shiftY($(".mk-shops")) - ($("#mk-header")?.offsetHeight || 0));
    });
  });
})();
