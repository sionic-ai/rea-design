/* First page — loader order, fixed first screen, blur of the video stage, backdrop curtain, carousel·news strip, vertical writing.
   Values read from the original inline script (100px·20px·0.7vh·0.9vh·0.4vh·0.6vh·0.2vh) */
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s) => document.querySelector(s);
  const body = document.body;
  const head = window.rtHead;
  const loader = $(".rt-loader");
  const fixed = $(".rt-fixed");
  const stage = $(".rt-stage");
  const bgfade = $(".rt-bgfade");
  const movieUi = $(".rt-movie-ui");
  const menuIn = $(".rt-menu-btn__in");
  const words = [...document.querySelectorAll(".rt-hero-title__w")];

  /* Loader → Hero sequence */
  if (reduce) {
    body.classList.add("is-loaded");
    words.forEach((w) => w.classList.add("is-show"));
    menuIn?.classList.add("is-show");
  } else {
    requestAnimationFrame(() => {
      loader.classList.add("is-on");
      body.classList.add("is-loaded");
    });
    setTimeout(() => loader.classList.add("is-back"), 4000);
    [2900, 2980, 3060].forEach((ms, i) => setTimeout(() => words[i]?.classList.add("is-show"), ms));
    setTimeout(() => menuIn?.classList.add("is-show"), 3600);
  }

  const top = (el) => el.getBoundingClientRect().top + scrollY;
  const black = $("[data-blur-start]");
  const stop = $("[data-blur-stop]");
  const gray = $("[data-gray-start]");
  const blue = $("[data-blue-start]");
  const movie = $("[data-movie]");
  const mobile = () => innerWidth <= 840;

  const update = () => {
    const y = scrollY;
    const vh = innerHeight;

    /* Hero: hidden past 100px, restored at 20px or less · plate transparent at 0.9vh (phone 0.65vh) · sent behind at 0.7vh */
    if (y > 100) fixed.classList.add("is-hide");
    else if (y <= 20) fixed.classList.remove("is-hide");
    fixed.classList.toggle("is-clear", y >= vh * (innerWidth <= 540 ? 0.65 : 0.9));
    const past = vh * 0.7;
    fixed.classList.toggle("is-past", y >= past);
    stage.classList.toggle("is-shown", y >= past);
    stage.classList.toggle("is-scaled", y >= past + vh * (mobile() ? 0.5 : 0.4));

    /* Blur: black section center ≤ y < Blur Hold Section · once laid down, the overlay stays */
    const blurAt = top(black) + black.offsetHeight / 2;
    stage.classList.toggle("is-blur", y >= blurAt && y < top(stop));
    stage.classList.toggle("is-veil", y >= blurAt);

    /* Play Movie: video section progress 0.2~0.6 */
    const r = movie.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, 1 - r.bottom / (r.height + vh)));
    movieUi.classList.toggle("is-show", r.bottom > 0 && r.top < vh && r.top < vh * 0.92 && r.bottom > vh * 0.18 && p >= 0.2 && p <= 0.6);

    /* Background veil: gray section — white at 0.6vh (phone 0.9vh), blue section — navy at the same value + 0.2vh (phone 0.5vh) */
    const off = vh * (mobile() ? 0.9 : 0.6);
    bgfade.classList.toggle("is-active", y >= top(gray) - off);
    const isBlue = y >= top(blue) - off + vh * (mobile() ? 0.5 : 0.2);
    bgfade.classList.toggle("is-blue", isBlue);
    body.classList.toggle("is-blue", isBlue);

    /* Header color: white when the screen center passes 10% of a blue section, ink when it passes 10% of a gray section, before those white after 100px */
    const center = y + vh / 2;
    if (center >= top(blue) + blue.offsetHeight * 0.1) head.classList.add("is-light");
    else if (center >= top(gray) + gray.offsetHeight * 0.1) head.classList.remove("is-light");
    else if (y > 100) head.classList.add("is-light");
    else if (y <= 20) head.classList.remove("is-light");
  };
  addEventListener("scroll", update, { passive: true });
  addEventListener("resize", update);
  update();

  /* Carousel: one slide every 6s over 1s, pauses on hover, prev/next buttons. One set is cloned front and back so it loops endlessly */
  const car = $(".rt-carousel");
  const track = car.querySelector(".rt-carousel__track");
  const cards = [...track.children];
  cards.forEach((c) => track.append(c.cloneNode(true)));
  cards.slice().reverse().forEach((c) => track.prepend(c.cloneNode(true)));
  const n = cards.length;
  let idx = n;
  let hover = false;
  const step = () => track.children[0].getBoundingClientRect().width;
  const place = (anim) => {
    track.style.transition = anim && !reduce ? "" : "none";
    track.style.transform = `translate3d(${-idx * step()}px,0,0)`;
  };
  const go = (d) => { idx += d; place(true); };
  track.addEventListener("transitionend", () => {
    if (idx >= 2 * n) { idx -= n; place(false); }
    if (idx < n) { idx += n; place(false); }
  });
  car.querySelector(".is-prev").addEventListener("click", () => go(-1));
  car.querySelector(".is-next").addEventListener("click", () => go(1));
  car.addEventListener("pointerenter", () => { hover = true; });
  car.addEventListener("pointerleave", () => { hover = false; });
  place(false);
  addEventListener("resize", () => place(false));
  if (!reduce) setInterval(() => { if (!hover && !document.hidden) go(1); }, 6000);

  /* News band: the original runs one chunk (1610px) in 45s — set to 35.8px per second */
  const run = $(".rt-ticker__run");
  const set = run.querySelector(".rt-ticker__set");
  const fill = () => {
    run.querySelectorAll(".rt-ticker__set + .rt-ticker__set").forEach((s) => s.remove());
    const w = set.getBoundingClientRect().width + 16;
    const copies = Math.ceil((innerWidth * 2) / w);
    for (let i = 0; i < copies; i++) run.append(set.cloneNode(true));
    run.style.setProperty("--rt-ticker-shift", `${-w}px`);
    run.style.animationDuration = `${w / 35.8}s`;
  };
  document.fonts.ready.then(fill);
  addEventListener("resize", fill);

  /* Three vertical-writing lines: when visible (threshold 0.05, bottom -10%) they reveal from the right mask after 0·120·240ms */
  const cols = [...document.querySelectorAll("[data-vert]")];
  if (reduce) cols.forEach((c) => c.classList.add("is-show"));
  else {
    const io = new IntersectionObserver((ents) => ents.forEach((en) => {
      if (!en.isIntersecting) return;
      const c = en.target.firstElementChild;
      setTimeout(() => c.classList.add("is-show"), +c.dataset.vert);
      io.unobserve(en.target);
    }), { threshold: 0.05, rootMargin: "0px 0px -10% 0px" });
    cols.forEach((c) => io.observe(c.parentElement));
  }

  /* Video Pane */
  const modal = $("[data-movie-modal]");
  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-open-movie]")) { e.preventDefault(); modal.classList.add("is-open"); }
    else if (e.target.closest("[data-close-movie]") || e.target === modal) modal.classList.remove("is-open");
  });
})();
