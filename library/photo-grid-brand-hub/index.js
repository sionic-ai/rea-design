// Home page — the photo grid uses clip-rise-swap, the photo strip uses the marquee part. Here: illustration cards (our SVG figures) · medicine tabs · Load more · detail window · booking strip · reading list slider.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  gsap.registerPlugin(ScrollTrigger);

  // The hero grid turns on after loading with a 1s expo, like the original
  const kv = document.querySelector(".op-kv__inner");
  const show = () => kv?.classList.add("is-ready");
  document.readyState === "complete" ? show() : addEventListener("load", show);

  // All medical specialties — the original hand-drawn figures are replaced with our figures of the same size · flat colors · bold ink lines (each card has a different head and prop)
  const ALL = ["Male Hair Loss", "Contraceptive pill", "ED care", "Mental counseling", "Female hair loss", "Diet", "Sleep", "Allergy", "Acne", "Pain", "Sweat", "Eyelashes"];
  const BG = ["var(--op-heart-soft)", "var(--kf-accent)", "var(--op-womb)", "color-mix(in oklab, var(--op-blue) 30%, var(--kf-bg))", "var(--op-hair-soft)", "var(--kf-accent)"];
  const SHIRT = ["var(--op-hair)", "var(--kf-surface)", "var(--op-heart)", "var(--op-blue)", "var(--kf-accent)", "var(--op-womb)"];
  const HAIR = [
    "M95 130c0-45 30-70 60-70s58 22 58 68c-10-18-30-30-58-30s-48 12-60 32Z",
    "M92 150c-4-58 26-92 64-92s64 30 60 92c-6-30-20-52-60-56c-40 4-58 26-64 56Z",
    "M98 120l8-30 14 18 10-34 14 28 16-30 10 32 18-20 6 34c-24-12-60-14-96 2Z",
    "M150 52a26 26 0 1 1 0 52a26 26 0 1 1 0-52ZM96 136c0-36 24-56 54-56s56 20 56 56c-14-14-32-22-56-22s-42 8-54 22Z",
    "M88 170c-10-70 20-112 64-112s72 40 62 112c-8-40-16-64-60-70c-44 6-56 30-66 70Z",
    "M100 112a20 20 0 1 1 18-26a22 22 0 0 1 32-12a22 22 0 0 1 34 8a20 20 0 1 1 14 34c-30-10-66-12-98-4Z",
  ];
  const PROP = [
    '<rect x="196" y="196" width="40" height="70" rx="8" style="fill: var(--kf-ink)"/><rect x="202" y="204" width="28" height="48" rx="4" style="fill: var(--kf-surface)"/>',
    '<rect x="70" y="210" width="62" height="30" rx="15" style="fill: var(--kf-surface); stroke: var(--kf-ink); stroke-width: 4"/><path d="M101 210v30" style="stroke: var(--kf-ink); stroke-width: 4"/>',
    '<path d="M214 70l10 18 20 2-15 14 4 20-19-10-18 10 4-20-15-14 20-2Z" style="fill: var(--kf-surface); stroke: var(--kf-ink); stroke-width: 4; stroke-linejoin: round"/>',
    '<circle cx="232" cy="96" r="26" style="fill: var(--kf-surface); stroke: var(--kf-ink); stroke-width: 4"/><path d="M220 96h24M232 84v24" style="stroke: var(--kf-ink); stroke-width: 4"/>',
  ];
  const person = (i) => `
    <svg viewBox="0 0 300 300" role="img" aria-label="${ALL[i]} Illustration — flat upper-body portrait" data-label="${ALL[i]} Medical illustration · flat-color figure upper body · square">
      <rect width="300" height="300" style="fill: ${BG[i % BG.length]}"/>
      <path d="M52 300c8-62 44-92 98-92s90 30 98 92Z" style="fill: ${SHIRT[i % SHIRT.length]}; stroke: var(--kf-ink); stroke-width: 5"/>
      <path d="M134 176v40h32v-40" style="fill: var(--kf-surface); stroke: var(--kf-ink); stroke-width: 5"/>
      <ellipse cx="150" cy="140" rx="54" ry="60" style="fill: var(--kf-surface); stroke: var(--kf-ink); stroke-width: 5"/>
      <path d="${HAIR[i % HAIR.length]}" style="fill: var(--kf-ink)"/>
      <circle cx="130" cy="146" r="5" style="fill: var(--kf-ink)"/><circle cx="170" cy="146" r="5" style="fill: var(--kf-ink)"/>
      <path d="${i % 3 === 0 ? "M134 172q16 12 32 0" : i % 3 === 1 ? "M136 174h28" : "M136 176q14-10 28 0"}" style="fill: none; stroke: var(--kf-ink); stroke-width: 5; stroke-linecap: round"/>
      ${PROP[i % PROP.length]}
    </svg>`;
  const grid = document.querySelector("[data-illust-grid]");
  // Original cards go to subject brand pages — the copy also links to a set of three brand samples in rotation
  const TO = ["service.html", "article.html", "news.html"];
  if (grid) grid.innerHTML = ALL.map((t, i) => `<li><a class="op-all__card" href="${TO[i % 3]}">${person(i)}<span class="op-all__text">${t}</span></a></li>`).join("");

  // Medicine — four tabs (30 total · 4 remaining). Like the original medicine, cards start with the first 12 (6 on phone), and each ”Load more” turns on that many more
  // The wrapping frame matches the list height immediately, and the panel follows the chosen tab’s height in .8s
  const TABS = ["Entire", "Head", "Women", "A Dilemma for Two"];
  const tabs = document.querySelector("[data-med-tabs]"), items = document.querySelector("[data-med-items]");
  if (tabs && items) {
    const step = () => (innerWidth > 768 ? 12 : 6);
    tabs.innerHTML = TABS.map((t, i) => `<button class="op-medicine__tab${i ? "" : " is-active"}" type="button" role="tab" aria-selected="${!i}">${t}</button>`).join("");
    const card = (k, n) => `<button class="op-medicine__card" type="button" data-med="${k}-${n}"><span class="op-ph is-light op-medicine__img" data-label="Medicine boxes and bottles · product shot on a colored background · landscape 3:2"></span><span class="op-medicine__meta"><span class="op-medicine__brand">Brand ${["HAIR", "WOMB", "LOVE"][n % 3]}</span><span class="op-medicine__name">Your medicine name $ here{String(n + 1).padStart(2, "0")}</span><span class="op-medicine__price">0,000 won~ / 1 month</span></span><span class="op-medicine__icon"></span></button>`;
    items.innerHTML = TABS.map((t, k) => {
      const n = k ? 4 : 30;
      return `<div class="op-medicine__item${k ? "" : " is-active"}" role="tabpanel"><div class="op-medicine__wrap"><div class="op-medicine__list" data-show="${Math.min(step(), n)}">${Array.from({ length: n }, (_, i) => card(k, i)).join("")}</div></div><button class="op-medicine__more" type="button" data-med-more${n <= step() ? " hidden" : ""}>See more</button></div>`;
    }).join("");
    const panes = [...items.children];
    let cur = 0;
    const fit = (item) => {
      item.querySelector(".op-medicine__wrap").style.height = item.querySelector(".op-medicine__list").scrollHeight + "px";
      items.style.height = item.scrollHeight + "px";
    };
    fit(panes[0]);
    // Only after the panel height has fully changed does the scroll position of the reservation strip below line up
    items.addEventListener("transitionend", (e) => { if (e.target === items) ScrollTrigger.refresh(); });
    let rt;
    addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => fit(panes[cur]), 100); });
    tabs.addEventListener("click", (e) => {
      const b = e.target.closest(".op-medicine__tab");
      if (!b) return;
      cur = [...tabs.children].indexOf(b);
      [...tabs.children].forEach((x, j) => { x.classList.toggle("is-active", j === cur); x.setAttribute("aria-selected", String(j === cur)); });
      panes.forEach((x, j) => x.classList.toggle("is-active", j === cur));
      fit(panes[cur]);
    });
    items.addEventListener("click", (e) => {
      const more = e.target.closest("[data-med-more]");
      if (more) {
        const item = more.parentNode, list = item.querySelector(".op-medicine__list"), cards = list.children;
        const from = Number(list.dataset.show), to = Math.min(from + step(), cards.length);
        if (to >= cards.length) more.hidden = true;
        for (let i = from; i < to; i++) cards[i].classList.add("is-show");
        list.dataset.show = String(to);
        fit(item);
        return;
      }
      const c = e.target.closest(".op-medicine__card");
      if (c) openModal(c.querySelector(".op-medicine__name").textContent);
    });
  }
  const modal = document.createElement("div");
  modal.className = "op-modal";
  modal.setAttribute("aria-hidden", "true");
  modal.innerHTML = '<div class="op-modal__bg"></div><button class="op-modal__close" type="button" aria-label="Close"></button><div class="op-modal__contents"><div class="op-modal__box" role="dialog" aria-modal="true"><div><p class="op-medicine__brand">Brand HAIR</p><p class="op-modal__name"></p><p class="op-modal__desc">Your medicine description here in about four lines. Write what it is used for, how to take it, and precautions, at a length similar to the original.</p><p class="op-medicine__price">0,000 won~ / 1 month</p></div><span class="op-ph is-light" data-label="Large medicine box product shot · Square"></span></div></div>';
  document.body.append(modal);
  function openModal(name) { modal.querySelector(".op-modal__name").textContent = name; modal.classList.add("is-open"); modal.setAttribute("aria-hidden", "false"); document.body.style.overflow = "hidden"; }
  const closeModal = () => { modal.classList.remove("is-open"); modal.setAttribute("aria-hidden", "true"); document.body.style.overflow = ""; };
  modal.addEventListener("click", (e) => { if (e.target.closest(".op-modal__close, .op-modal__bg")) closeModal(); });

  // Booking strip — three backgrounds swap every 3 seconds, and while passing the strip the background shifts down 14% (scrub .5)
  const cvItems = document.querySelectorAll(".op-cv__item");
  if (cvItems.length > 1 && !reduce) {
    let cur = 0;
    setInterval(() => { cur = (cur + 1) % cvItems.length; cvItems.forEach((it, i) => it.classList.toggle("is-current", i === cur)); }, 3000);
  }
  gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
    document.querySelectorAll(".op-cv").forEach((cv) => {
      gsap.to(cv.querySelector(".op-cv__bg"), { yPercent: 14, ease: "none", scrollTrigger: { trigger: cv, scrub: 0.5, start: "top bottom", end: "bottom top" } });
    });
  });

  // Reading list, original Swiper (prev/next arrows, fades at the end)
  const mag = document.querySelector("[data-mag]");
  if (mag && window.Swiper) new Swiper(mag, { slidesPerView: "auto", spaceBetween: 32, speed: reduce ? 0 : 600, navigation: { nextEl: ".op-mag__next", prevEl: ".op-mag__prev", disabledClass: "is-disabled" }, breakpoints: { 0: { spaceBetween: 20 }, 768: { spaceBetween: 32 } } });
})();
