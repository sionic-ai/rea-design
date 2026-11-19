// Subpages — facility slider (Swiper), location cards and map pins, ring chart, news list
(() => {
  const $ = (s) => document.querySelector(s);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const fs = $("[data-fs]");
  if (fs && window.Swiper) {
    const LINES = [["01", "The food and experiences you taste only there,<br>Bringing new energy to the city."], ["02", "The memory and culture of that land<br>Carried on to the present and the next generation."], ["03", "Seeing the original value anew,<br>Bringing it to new life."], ["04", "Your fourth facility’s info here<br>Add a two-line sentence."]];
    fs.innerHTML = LINES.map(([n, t], i) => `<div class="swiper-slide"><a class="fs__card" href="#"><div class="wf-img" data-label="Facility ${i + 1} Interior and exterior · evening lighting · landscape 16:10"></div>
      <p class="fs__num pd-en">Impact<b>${n}</b></p><div class="fs__meta"><p>${t}</p><span class="pd-uline">Learn more __ARR__</span></div></a></div>`).join("");
    window.pdFillArrows();
    const bar = $("[data-fs-bar]");
    const sw = new Swiper(".fs__swiper", { slidesPerView: "auto", spaceBetween: 20, speed: reduce ? 0 : 800, grabCursor: true,
      navigation: { prevEl: "[data-fs-prev]", nextEl: "[data-fs-next]" } });
    const upd = () => (bar.style.transform = `scaleX(${(sw.activeIndex + 1) / LINES.length})`);
    sw.on("slideChange", upd); upd();
  }

  const lc = $("[data-lc]");
  if (lc) {
    const N = 6;
    lc.innerHTML = Array.from({ length: N }, (_, i) => `<article class="lc__item${i === 0 ? " is-on" : ""}"><div class="wf-img" data-label="Facility ${i + 1} Building exterior · Clear day · Landscape 4:3"></div><h3>Facility Name ${String(i + 1).padStart(2, "0")}</h3><p>Your one-line address here<br>Your transport info line here</p><a class="pd-uline" style="color:var(--kf-accent);border-color:var(--kf-line)" href="#">View map __ARR__</a></article>`).join("");
    const PINS = [[78, 18, "Region 1"], [70, 30, "Region 2"], [66, 40, "Region 3"], [58, 50, "Region 4"], [46, 60, "Region 5"], [30, 72, "Region 6"]];
    $("[data-pins]").innerHTML = PINS.map(([x, y, n], i) => `<i class="lc__pin${i === 0 ? " is-on" : ""}" style="left:${x}%;top:${y}%"><span>${n}</span></i>`).join("");
    window.pdFillArrows();
    let k = 0;
    const show = (n) => {
      k = (n + N) % N;
      document.querySelectorAll(".lc__item").forEach((el, i) => el.classList.toggle("is-on", i === k));
      document.querySelectorAll(".lc__pin").forEach((el, i) => el.classList.toggle("is-on", i === k));
      $("[data-lc-num]").textContent = `${k + 1} / 38`;
    };
    $("[data-lc-prev]").addEventListener("click", () => show(k - 1));
    $("[data-lc-next]").addEventListener("click", () => show(k + 1));
    document.querySelectorAll("[data-cats] li").forEach((li) => li.addEventListener("click", () => document.querySelectorAll("[data-cats] li").forEach((x) => x.classList.toggle("is-on", x === li))));
  }

  const ct6 = $("[data-ct6]");
  if (ct6) {
    const C = [["HOTEL", "Hotel"], ["RESTAURANT", "Restaurant"], ["WEDDING", "Wedding"], ["BANQUET", "Banquet"], ["FLOWER", "Flower"], ["CONSULTING", "Consulting"]];
    ct6.innerHTML = C.map(([en, ko], i) => `<li class="${i === 3 ? "is-on" : ""}"><div class="wf-img" data-label="${ko} Key scene · dark indoor lighting · tall vertical strip"></div>
      <p class="ct6__txt">$ here{ko} Add about three lines introducing the business. Describe how the space is run.</p><p class="ct6__lbl pd-en"><small>0${i + 1}</small>${en}</p></li>`).join("");
    ct6.querySelectorAll("li").forEach((li) => li.addEventListener("pointerenter", () => ct6.querySelectorAll("li").forEach((x) => x.classList.toggle("is-on", x === li))));
  }

  const ring = $("[data-ring]");
  if (ring) {
    if (reduce) ring.classList.add("is-in");
    else new IntersectionObserver(([e], o) => { if (e.isIntersecting) { ring.classList.add("is-in"); o.disconnect(); } }, { rootMargin: "0px 0px -20% 0px" }).observe(ring);
  }

  const all = $("[data-news-all]");
  if (all && window.pdNewsItem) {
    all.innerHTML = Array.from({ length: 15 }, (_, i) => window.pdNewsItem(i)).join("");
    all.querySelectorAll(".pd-fade").forEach((el) => el.classList.add("is-in"));
  }
})();
