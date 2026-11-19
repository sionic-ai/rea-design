(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // Hero advance — the current cell in the bottom row widens in 400ms with the name entering 200ms late, and a thin bar fills up to the next (advance interval is a guess, 6 seconds)
  const slides = $$(".k-kv__slide"), items = $$(".k-kv__item");
  const HOLD = 6;
  let now = 0, timer = null;
  const go = (n) => {
    now = (n + slides.length) % slides.length;
    slides.forEach((s, i) => s.classList.toggle("is-on", i === now));
    items.forEach((it, i) => { it.classList.toggle("is-on", i === now); it.setAttribute("aria-selected", String(i === now)); });
    const bar = items[now].querySelector(".k-kv__timer");
    timer?.kill();
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    timer = gsap.fromTo(bar, { scaleX: 0 }, { scaleX: 1, duration: HOLD, ease: "none", onComplete: () => go(now + 1) });
  };
  items.forEach((it, i) => it.addEventListener("click", () => go(i)));
  go(0);

  // Rows drawn from server data — same shape as placeholders
  const pad = (i) => String(i).padStart(2, "0");
  $(".k-games__rail").innerHTML = Array.from({ length: 10 }, (_, i) => `<a class="k-game" href="product.html"><span class="wf-img" data-label="Game key art · 4:3"></span><i>Device name</i><b>Your software name goes here, in two lines ${pad(i + 1)}</b><small>Company name</small></a>`).join("");
  $(".k-news__list").innerHTML = Array.from({ length: 5 }, (_, i) => `<li><time>0000.00.${pad(12 - i)}</time><em>Category</em><a href="portal.html">”Your Page Name” page updated. Add a one-line description here.</a></li>`).join("");
  $(".k-topics__grid").innerHTML = Array.from({ length: 8 }, (_, i) => `<li><a href="portal.html"><span class="wf-img" data-label="Topic cover image · 4:3"></span><b>Your topic title here in about three lines. A summary of one news item ${pad(i + 1)}</b><time>0000.00.00</time></a></li>`).join("");
  $(".k-sched__rail").innerHTML = ["00.19", "00.26", "00.30"].map((d) => `<div class="k-sched__day"><p class="k-sched__date">${d}</p><div class="k-sched__cards">${Array.from({ length: 4 }, () => `<a class="k-game" href="product.html"><span class="wf-img" data-label="Game art · 4:3"></span><i>Device name</i><b>Your software name here</b></a>`).join("")}</div></div>`).join("");

  // Horizontal row paging — original moves one cell per arrow, bar follows the position
  const rail = $(".k-games__rail"), thumb = $(".k-games__track i");
  const step = () => (rail.firstElementChild?.offsetWidth || 240) + 24;
  const sync = () => { const max = rail.scrollWidth - rail.clientWidth; thumb.style.translate = `${max > 0 ? (rail.scrollLeft / max) * 400 : 0}%`; };
  $$(".k-games__bar button").forEach((b, i) => b.addEventListener("click", () => rail.scrollBy({ left: (i ? 1 : -1) * step(), behavior: "smooth" })));
  rail.addEventListener("scroll", sync, { passive: true });
})();
