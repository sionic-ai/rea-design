// Home — three droplets pop out (wait .4s or more after the image is ready), phone droplet slider (centered · auto 4s · rewind .8s),
// Day/night look crossfades over 1s, message photo crossfades every 5s for 1s, News Swiper (drag·inertia)
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const sp = matchMedia("(max-width: 1024px)");
  const start = performance.now();
  const open = () => setTimeout(() => document.body.classList.add("is-nav-opening"), reduce ? 0 : Math.max(0, 400 - (performance.now() - start)));
  document.readyState === "complete" ? open() : addEventListener("load", open);

  let navSwiper = null;
  const navMode = () => {
    if (sp.matches && !navSwiper && window.Swiper) {
      navSwiper = new Swiper(".hm-nav__slider", { slidesPerView: "auto", centeredSlides: true, spaceBetween: 22, rewind: true, speed: 800, autoplay: reduce ? false : { delay: 4000, disableOnInteraction: false } });
    } else if (!sp.matches && navSwiper) { navSwiper.destroy(true, true); navSwiper = null; }
  };
  sp.addEventListener("change", navMode);
  navMode();

  // Scene change — original order: draw the new scene (is-rendered) → next frame remove is-active from the old one and add it to the new one for a 1s crossfade → remove the old scene after 1s
  const swap = (prev, next, after) => {
    if (!next || prev === next) return;
    next.classList.add("is-rendered");
    window.dispatchEvent(new Event("kb:parallax"));
    requestAnimationFrame(() => { prev?.classList.remove("is-active"); next.classList.add("is-active"); });
    setTimeout(() => { prev?.classList.remove("is-rendered"); after?.(); }, 1000);
  };

  // Day/night — starts from the current time (6 to 18h is day), clicking the dot crossfades over 1s
  const scenes = [...document.querySelectorAll(".hm-visual__scene")], dots = document.querySelectorAll(".hm-visual__dot"), label = document.querySelector(".hm-visual__label");
  const LABEL = { day: "Your daytime scenery caption here", night: "Your night view caption here" };
  let cur = scenes.find((x) => x.classList.contains("is-active"));
  const show = (k, now) => {
    const next = scenes.find((x) => x.dataset.scene === k);
    dots.forEach((d) => { d.classList.toggle("is-active", d.dataset.scene === k); d.setAttribute("aria-pressed", d.dataset.scene === k); });
    label.textContent = LABEL[k];
    if (now) { scenes.forEach((x) => { x.classList.toggle("is-rendered", x === next); x.classList.toggle("is-active", x === next); }); cur = next; return; }
    swap(cur, next);
    cur = next;
  };
  dots.forEach((d) => d.addEventListener("click", () => show(d.dataset.scene)));
  const h = new Date().getHours();
  show(h >= 6 && h < 18 ? "day" : "night", true);

  // Message photos — each cell advances to the next image every interval, the second cell lagging by offset
  if (!reduce) document.querySelectorAll("[data-fade]").forEach((box) => {
    const slides = box.querySelectorAll(".hm-message__slide");
    let i = 0;
    setTimeout(() => setInterval(() => {
      const prev = slides[i];
      i = (i + 1) % slides.length;
      swap(prev, slides[i]);
    }, +box.dataset.fade), +box.dataset.offset);
  });

  // News — original is a drag·inertia Swiper (24px between, 53px on wide screens)
  const rows = [["2026.09.01", "Your notification title line here", "Notice"], ["2026.08.28", "Your next month’s clinic schedule here", "Notice"], ["2026.01.08", "Your website disclosure notice here", "Notice"], ["2025.12.24", "Your hiring notice here", "Hiring"], ["2025.12.01", "Your long two-line notice title here to check the line break", "Notice"]];
  document.querySelector("[data-news]").innerHTML = rows.map(([d, t, c]) => `<article class="hm-news__card swiper-slide"><a href="news.html" class="hm-news__link kb-hov" aria-label="${t}"></a>
      <div class="hm-news__body"><div class="hm-news__thumb"><div class="wf-img" data-label="Thumbnail"></div></div><p class="hm-news__time"><time>${d}</time></p><h3 class="hm-news__title">${t}</h3></div>
      <p class="hm-news__cat"><a href="news.html"><span>#</span> ${c}</a></p>${kbTpl.icon()}</article>`).join("");
  document.querySelectorAll(".hm-news__card").forEach((c, i) => { c.classList.add("kb-stg"); c.style.setProperty("--stg-delay", `${i * 0.3}s`); });
  if (window.Swiper) new Swiper(".hm-news__slider", { slidesPerView: "auto", spaceBetween: 24, freeMode: { enabled: true, momentum: true }, grabCursor: true, breakpoints: { 769: { spaceBetween: 53 } } });
})();
