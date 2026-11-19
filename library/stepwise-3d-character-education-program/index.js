// Home — hero steps (one step per 150px), a veil that blurs below the second section’s text on phone, three-card phone swipe (swiper creative), news tabs
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const sp = matchMedia("(max-width: 767px)");

  addEventListener("loaded", () => new HtStepKV({ kv: ".hm-kv", page: ".hm-kv__page", mode: "fixed", fixed: 150 }));
  if (reduce) document.body.dataset.areaIndex = "0";

  // Phone: attach a mask to the screen so the second section’s text fades out below 30vh from the top
  const p2 = document.querySelector(".hm-kv__p2");
  let on = false, queued = false;
  const pin = () => { queued = false; p2.style.setProperty("--mask-offset-y", `${-p2.getBoundingClientRect().top}px`); };
  const onScroll = () => { if (on && !queued) { queued = true; requestAnimationFrame(pin); } };
  const mq = () => {
    on = sp.matches;
    if (on) pin(); else p2.style.removeProperty("--mask-offset-y");
  };
  addEventListener("scroll", onScroll, { passive: true });
  sp.addEventListener("change", mq);
  mq();

  // Three cards: on phones they tilt as they slide with swiper creative (±22rem · ±6°, 700ms), and only the center card flips when pressed
  const cards = () => document.querySelectorAll(".hm-card");
  let swiper = null;
  const lock = () => cards().forEach((c) => { c.classList.remove("is-flipped"); c.setAttribute("aria-disabled", String(!c.classList.contains("swiper-slide-active"))); });
  const cardMode = () => {
    if (sp.matches && !swiper && window.Swiper) {
      swiper = new Swiper(".hm-edu__cards", {
        loop: true, speed: 700, slidesPerView: "auto", centeredSlides: true, effect: "creative", watchSlidesProgress: true,
        creativeEffect: { limitProgress: 2, prev: { translate: ["-22.0rem", "2.6rem", 0], rotate: [0, 0, -6] }, next: { translate: ["22.0rem", "2.6rem", 0], rotate: [0, 0, 6] } },
        on: { slideChangeTransitionStart: () => cards().forEach((c) => c.classList.remove("is-flipped")), slideChangeTransitionEnd: lock, init: () => requestAnimationFrame(lock) },
      });
    } else if (!sp.matches && swiper) {
      swiper.destroy(true, true);
      swiper = null;
      cards().forEach((c) => c.removeAttribute("aria-disabled"));
    }
  };
  sp.addEventListener("change", cardMode);
  cardMode();

  // News — All shows the top four, pressing a tab shows only that category
  const TERMS = { news: "Notice", research: "About research", result: "Analysis Results" };
  const rows = [
    ["news", "Your notice title in one line here", "2026.10.01"],
    ["result", "Your analysis result title goes here, long enough to run nearly two lines so you can see how it wraps", "2026.09.12"],
    ["research", "A one-line research intro title here", "2026.08.30"],
    ["news", "Your notice title in one line here", "2026.08.02"],
    ["result", "One-line analysis results title", "2026.07.21"],
    ["research", "A one-line research intro title here", "2026.06.10"],
  ];
  const list = document.querySelector("[data-news]");
  list.innerHTML = rows.map(([t, title, d]) => `<article class="hm-news" data-term="${t}"><a href="#">
      <h3 class="hm-news__title">${title}</h3><p class="hm-news__txt">Show only the first line of the body as a preview and cut the rest with an ellipsis.</p>
      <div class="hm-news__meta"><span class="hm-news__term">${TERMS[t]}</span><time class="hm-news__time">${d}</time></div><i class="ht-arrow2">${htTpl.ARROW}</i></a></article>`).join("");
  const tabs = [...document.querySelectorAll(".hm-info__nav button")];
  const show = (term) => list.querySelectorAll(".hm-news").forEach((a, i) => a.classList.toggle("is-visible", term === "all" ? i < 4 : a.dataset.term === term));
  tabs.forEach((b) => b.addEventListener("click", () => { tabs.forEach((x) => x.classList.toggle("is-current", x === b)); show(b.dataset.term); }));
  show("all");
})();
