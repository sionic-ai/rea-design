(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const header = document.querySelector(".id-header");
  const top = document.querySelector(".id-top");
  const follow = document.querySelector(".id-follow");

  // Sticky header bar — on the first page it turns on once the big header (.id-top) leaves the screen, on subpages it turns on at the very top (within 10px) and when scrolling up, and hides when scrolling down (.4s)
  if (header && top) {
    new IntersectionObserver(([en]) => header.classList.toggle("is-view", !en.isIntersecting)).observe(top);
  } else if (header) {
    header.classList.add("is-view");
    let last = scrollY;
    addEventListener("scroll", () => {
      const y = scrollY;
      if (y <= 10 || y < last) header.classList.add("is-view");
      else if (y > last) header.classList.remove("is-view");
      last = y;
    }, { passive: true });
  }

  // Following Contact — on only when scrolling up. On the first page it is on while the About section (.id-follow-zone) is 20% visible, and on the about page it is always on
  if (follow) {
    let always = document.body.classList.contains("id-page-about");
    if (always) follow.classList.add("is-visible");
    const zone = document.querySelector(".id-follow-zone");
    if (zone) new IntersectionObserver(([en]) => { always = en.isIntersecting; if (always) follow.classList.add("is-visible"); }, { threshold: 0.2 }).observe(zone);
    let last = scrollY;
    addEventListener("scroll", () => {
      if (always) return;
      const y = scrollY;
      follow.classList.toggle("is-visible", y < last);
      last = y;
    }, { passive: true });
  }

  // Full menu: the header line stroke flows out via dashoffset (.77s), the board turns on, and the close X is drawn.
  const menu = document.querySelector(".id-menu");
  document.querySelectorAll("[data-menu-toggle]").forEach((btn) => btn.addEventListener("click", () => {
    const open = !menu.classList.contains("is-open");
    menu.classList.toggle("is-open", open);
    menu.setAttribute("aria-hidden", String(!open));
    header && header.classList.toggle("is-open", open);
    document.querySelectorAll("[data-menu-toggle]").forEach((b) => { b.classList.toggle("is-open", open); b.setAttribute("aria-expanded", String(open)); });
    document.documentElement.style.overflow = open ? "hidden" : "";
  }));
  addEventListener("keydown", (e) => { if (e.key === "Escape" && menu && menu.classList.contains("is-open")) document.querySelector(".id-menu__close").click(); });

  // Things that turn on when visible — adds is-on once, using the same ScrollMagic scene as the original (triggerHook .8)
  const shows = document.querySelectorAll(".id-show");
  if (reduce || !window.ScrollMagic) shows.forEach((el) => el.classList.add("is-on"));
  else {
    const ctrl = new ScrollMagic.Controller();
    shows.forEach((el) => new ScrollMagic.Scene({ triggerElement: el, triggerHook: 0.8 }).on("enter", () => el.classList.add("is-on")).addTo(ctrl));
  }
})();
