// Column: build the ranking and category sections in the same type, and attach the recommended slider (Swiper), tab filter and promo popup.
(() => {
  const tones = ["teal", "yellow", "red", "purple"];
  const photo = ["Water glass and bottle · bright window", "Salad plate · Top-down natural light", "Cheese and milk tabletop · soft indoor light", "White powder on a spoon · white background", "People in sportswear · indoor gym", "Hands cooking in the kitchen · warm light"];
  const card = (i, tone, tag) => `
    <a class="n-card" href="news.html" data-tag="${tag}">
      <span class="wf-img" data-label="${photo[i % photo.length]} · Landscape 16:11"></span>
      <b>Your article title here in two or three lines. Your title continues here${i % 2 ? "." : "!"}</b>
      <span class="n-tags"><i data-tone="${tone}">Category Name</i><i data-tone="line">#Tag${tag}</i></span>
      <i class="v-circle-arrow"><span class="v-rarrow"><i class="v-arrow is-in"></i><i class="v-arrow is-out"></i></span></i>
    </a>`;
  document.getElementById("n-rank").innerHTML = [0, 1, 2, 3].map((i) => `<li><a href="news.html"><span class="wf-img" data-label="${photo[i]} · Landscape 16:10"></span><b>Your ranking article title here in two lines.</b></a><span class="n-tags"><i data-tone="${tones[i]}">Category</i></span></li>`).join("");

  const cats = [
    { name: "Category 1", en: "Nutrients", tone: "teal", tabs: ["Everyone", "Tag 1", "Tag 2", "Tag 3", "Tag 4", "Tag 5"], n: 4 },
    { name: "Category 2", en: "Recipe", tone: "yellow", tabs: ["Everyone", "Tag 1", "Tag 2"], n: 4 },
    { name: "Category 3", en: "Topics", tone: "red", n: 4 },
    { name: "Category 4", en: "Exercise", tone: "teal", n: 4 },
    { name: "Category 5", en: "Health", tone: "red", n: 3 },
    { name: "Category 6", en: "Lifestyle", tone: "purple", n: 3 },
    { name: "Category 7", en: "How to Use", tone: "yellow", n: 2 },
  ];
  document.getElementById("n-cats").outerHTML = cats.map((c, k) => `
    <section class="n-cat" id="cat-${k}" data-slot="category-cards">
      <div class="v-wrap">
        <div class="v-title is-bare v-rise"><h2>${c.name}<small>${c.en}</small></h2><a class="v-pill" href="news.html">${c.name} All posts<span class="v-rarrow"><i class="v-arrow is-in"></i><i class="v-arrow is-out"></i></span></a></div>
        ${c.tabs ? `<div class="n-tabs" role="tablist">${c.tabs.map((t, i) => `<button type="button" role="tab" data-tab="${i}" class="${i ? "" : "is-on"}">${t}</button>`).join("")}</div>` : ""}
        <div class="n-slider"><div class="n-grid">${Array.from({ length: c.n }, (_, i) => card(i + k, c.tone, c.tabs ? (i % (c.tabs.length - 1)) + 1 : 1)).join("")}</div></div>
      </div>
    </section>`).join("");

  document.querySelectorAll(".n-tabs").forEach((tabs) => tabs.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    tabs.querySelectorAll("button").forEach((x) => x.classList.toggle("is-on", x === b));
    const t = b.dataset.tab;
    tabs.nextElementSibling.querySelectorAll(".n-card").forEach((c) => c.classList.toggle("is-out", t !== "0" && c.dataset.tag !== t));
    ScrollTrigger.refresh();
  }));

  // Recommended slides (original PageColumnRecommend — Swiper: loop · 1s · centered · width as the slide is · click dots to move · prev/next arrows)
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  new Swiper(".n-pick__swiper", {
    loop: true, speed: reduce ? 0 : 1000, centeredSlides: true, slidesPerView: "auto",
    pagination: { el: "#n-pick-dots", bulletClass: "n-pick__dot", bulletActiveClass: "is-on", clickable: true, bulletElement: "button" },
    navigation: { nextEl: ".n-pick__arrow.is-next", prevEl: ".n-pick__arrow.is-prev" },
  });
  // On phones, each category swipes its card row sideways (original PageColumnSection — Swiper: loop · 1s · width as the cell · 20px gap)
  if (innerWidth <= 820) document.querySelectorAll(".n-slider").forEach((el) => new Swiper(el, {
    loop: true, speed: reduce ? 0 : 1000, slidesPerView: "auto", wrapperClass: "n-grid", slideClass: "n-card", spaceBetween: 20,
  }));

  // Promo popup — in the original it does not show on the column first page, only on category sub-pages. <body data-popup="on"> When set, shows once on first reaching the first category, and won’t reappear once closed
  const pop = document.getElementById("n-pop");
  const show = () => { if (sessionStorage.getItem("n-pop") === "1") return; pop.classList.add("is-on"); pop.setAttribute("aria-hidden", "false"); };
  const hide = () => { pop.classList.remove("is-on"); pop.setAttribute("aria-hidden", "true"); sessionStorage.setItem("n-pop", "1"); };
  pop.addEventListener("click", (e) => { if (e.target.closest("[data-pop-close]")) hide(); });
  if (document.body.dataset.popup === "on") ScrollTrigger.create({ trigger: "#cat-0", start: "top 60%", once: true, onEnter: show });
})();
