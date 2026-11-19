// Collaboration list: filter by category (?cat=) · clicking a card opens a detail modal (photo slide 4s auto · .8s, dots, arrows, prev·next card, dotted scrollbar)
(() => {
  const cards = [...document.querySelectorAll(".wk__grid .ky-card2")];
  const links = document.querySelectorAll("[data-filter]");
  const filter = (cat) => {
    cards.forEach((c) => c.classList.toggle("is-hidden", !!cat && c.dataset.cat !== cat));
    links.forEach((a) => a.classList.toggle("is-current", a.dataset.filter === (cat || "")));
  };
  links.forEach((a) => a.addEventListener("click", (e) => {
    e.preventDefault();
    filter(a.dataset.filter);
    history.replaceState(null, "", a.dataset.filter ? `?cat=${a.dataset.filter}` : location.pathname);
  }));
  const q = new URLSearchParams(location.search);
  filter(q.get("cat"));

  const modal = document.querySelector(".wk-modal");
  const gallery = modal.querySelector("[data-gallery]");
  // Photo slider — original p-article2__figure: 4s auto·centered·rewind·.8s, dots are clickable bullets, arrows navigation
  const s = kySwiper(gallery, {
    autoplay: { delay: 4000, disableOnInteraction: false }, centeredSlides: true, loop: true, speed: 800,
    pagination: { el: gallery.querySelector(".wk-dots"), type: "bullets", clickable: true, modifierClass: "", bulletClass: "-bullets", bulletActiveClass: "is-active", clickableClass: "-clickable",
      renderBullet: (i, cls) => `<li class="${cls}"><button type="button" aria-label="${i + 1}Photo No."></button></li>` },
    navigation: { prevEl: gallery.querySelector(".-prev"), nextEl: gallery.querySelector(".-next"), disabledClass: "is-disabled", hiddenClass: "is-hidden", lockClass: "is-look" },
  });

  const term = modal.querySelector(".wk-art__term");
  let cur = 0;
  const fillFrom = (k) => {
    cur = k;
    const c = cards[k];
    term.textContent = c.querySelector(".ky-card2__term").textContent;
  };
  const open = (on) => {
    modal.classList.toggle("is-visible", on);
    modal.setAttribute("aria-hidden", on ? "false" : "true");
    on ? window.lenis?.stop() : window.lenis?.start();
  };
  cards.forEach((c, k) => c.querySelector("a").addEventListener("click", (e) => { e.preventDefault(); fillFrom(k); open(true); }));
  modal.querySelectorAll("[data-close]").forEach((b) => b.addEventListener("click", () => open(false)));
  addEventListener("keydown", (e) => e.key === "Escape" && open(false));
  // Prev/next: only the content fades out in .4s, swaps, and comes back in
  modal.querySelectorAll("[data-step]").forEach((b) => b.addEventListener("click", () => {
    const vis = cards.filter((c) => !c.classList.contains("is-hidden"));
    const at = vis.indexOf(cards[cur]);
    const next = cards.indexOf(vis[(at + +b.dataset.step + vis.length) % vis.length]);
    modal.classList.add("is-change");
    setTimeout(() => { fillFrom(next); s?.slideToLoop(0, 0); modal.classList.remove("is-change"); }, 400);
  }));
  const m = q.get("modal");
  if (m && cards[m - 1]) { fillFrom(m - 1); open(true); }

  // Show the body scroll position with a salmon handle on the dotted line
  const body = modal.querySelector(".wk-art__body");
  const thumb = modal.querySelector(".wk-art__thumb");
  const sync = () => {
    const max = body.scrollHeight - body.clientHeight;
    const h = Math.max(30, (body.clientHeight / body.scrollHeight) * body.clientHeight);
    thumb.style.height = h + "px";
    thumb.style.transform = `translateY(${max > 0 ? (body.scrollTop / max) * (body.clientHeight - h) : 0}px)`;
    thumb.style.opacity = max > 0 ? 1 : 0;
  };
  body.addEventListener("scroll", sync, { passive: true });
  new ResizeObserver(sync).observe(body);
})();
