// Concept page — exactly the original concept.bundle: scroll snapping to scenes (scrollify, easeInOutQuad 0.9s), current-scene marker on the time scale,
// When the scene is visible, the clock fills by one minute at a time from 30 minutes ago (interval 60 − remaining minutes in ms, last 3 minutes +90ms).
(() => {
  const $ = window.jQuery;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const sp = () => matchMedia("screen and (max-width: 768px)").matches;
  if ($ && $.scrollify && !reduce && !sp()) {
    $.scrollify({ section: ".js-section", easing: "easeInOutQuad", scrollSpeed: 900, scrollbars: true, updateHash: false, before() {} });
  }

  const units = [...document.querySelectorAll(".bh-scene__unit")];
  const links = [...document.querySelectorAll(".bh-scene-nav a")];
  links.forEach((a) => a.addEventListener("click", (e) => {
    e.preventDefault();
    const id = a.getAttribute("href");
    if ($ && $.scrollify && !reduce && !sp()) $.scrollify.move(id);
    else document.querySelector(id)?.scrollIntoView();
  }));
  const ADJ = 10;
  const onScroll = () => {
    if (!units.length) return;
    const y = scrollY, h = innerHeight;
    const top = (el) => el.getBoundingClientRect().top + y;
    const first = top(units[0]), last = top(units[units.length - 1]);
    // Ticks only appear from half a screen before the first scene to half a screen after the last
    document.body.classList.toggle("is-navs", y >= first - 0.5 * h && y < last + 0.5 * h);
    let cur = -1;
    units.forEach((u, i) => { if (y >= top(u) - ADJ) cur = i; });
    links.forEach((a, i) => a.classList.toggle("is-current", i === cur));
  };
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("load", onScroll);

  // Time fill-up
  const fmt = (d) => `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;
  units.forEach((u) => {
    const el = u.querySelector(".bh-scene__time");
    if (!el) return;
    const [hh, mm] = el.textContent.trim().split(":").map(Number);
    const at = new Date(); at.setHours(hh, mm, 0, 0);
    let between = 30, done = false;
    el.textContent = fmt(new Date(at - between * 60000));
    if (reduce) { el.textContent = fmt(at); return; }
    const step = () => {
      el.textContent = fmt(new Date(at - between * 60000));
      between--;
      if (between < 0) return;
      setTimeout(step, between <= 3 ? 60 - between + 90 : 60 - between);
    };
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting && !done) { done = true; io.disconnect(); setTimeout(step, 300); } });
    io.observe(el);
  });
})();
