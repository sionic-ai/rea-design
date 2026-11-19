// FEATURE — fixed-background hero (original featureKv.js) · accordion (productAttentions.js) · circle card flip (feature01.js .js-reverse-button) · video modal (modal.js autoAlpha .3s)
(() => {
  const { reduce, btn } = window.MR;
  const arrows = `<div class="splide__arrows mr-pager__arrows"><div class="mr-pager__arrowsIn">
      <button class="splide__arrow splide__arrow--prev" type="button" aria-label="Previous"><svg class="mr-arr" viewBox="0 0 7 12"><path d="M1 1l5 5-5 5"/></svg></button>
      <button class="splide__arrow splide__arrow--next" type="button" aria-label="Next"><svg class="mr-arr" viewBox="0 0 7 12"><path d="M1 1l5 5-5 5"/></svg></button></div></div>`;

  // ── Three accordions: only the first row stays open ──
  const groups = [
    { title: "Your topic 1 here", shot: "Hand choosing cat litter · from above · landscape 4:3", pt: "Topic 1 things to check" },
    { title: "Your topic 2 here", shot: "Cat in profile in front of a water bowl · landscape 4:3", pt: "Topic 2 things to check" },
    { title: "Your topic 3 here", shot: "Cat on a scale · landscape 4:3", pt: "Topic 3 things to check" },
  ];
  const qs = [["Your question here<br>Place two lines..."], ["Your question here<br>Place two lines..."], ["Your question line here..."]];
  document.querySelector(".mr-acc__list").innerHTML = groups
    .map(
      (g, gi) => `
    <li class="mr-acc__item">
      <button class="mr-acc__btn" type="button" aria-expanded="${gi === 0}"><span class="mr-acc__title">${g.title}</span><span class="mr-acc__icon"><i class="${gi === 0 ? "is-active" : ""}"></i><i></i></span></button>
      <div class="mr-acc__body${gi === 0 ? " is-active" : ""}"><div class="mr-acc__outer"><div class="mr-acc__inner">
        <div class="mr-f1__imgText">
          <div class="mr-f1__accImg"><span class="wf-img wf-r-4x3" data-label="${g.shot}"></span></div>
          <p class="mr-f1__accText">Put about four lines of topic description here. Write that body changes often show up in this record first, so noticing anything unusual early matters. Measuring at the same spot every day reveals even small differences.</p>
        </div>
        <div class="mr-f1__points">
          <p class="mr-f1__ptTitle">${g.pt}</p>
          <div class="mr-f1__slideWrap">
            <div class="splide mr-f1__splide" aria-label="${g.pt}">
              <div class="splide__track"><ul class="splide__list mr-f1__list">${qs
                .map(
                  ([q], i) => `<li class="splide__slide"><button class="mr-flip" type="button">
                    <span class="mr-flip__bg"></span>
                    <span class="mr-flip__q"><span class="mr-flip__qt">POINT ${i + 1}</span><span class="mr-flip__qx">${q}</span></span>
                    <span class="mr-flip__a"><span>Your answer here, about three lines. Say that if these changes appear, it is best to contact the hospital right away.</span></span>
                    <span class="mr-flip__more"><span class="mr-flip__moreBg"></span><span class="mr-flip__moreTx">more</span></span>
                  </button></li>`,
                )
                .join("")}</ul></div>
              <div class="mr-pager mr-pager--f1"><div class="mr-pager__track"><div class="mr-pager__bar"></div></div>${arrows}</div>
            </div>
          </div>
        </div>
        <div class="mr-f1__rec">
          <p class="mr-f1__recTitle">Your recommendation line here, <span class="mr-ib">Start your log</span></p>
          <div class="mr-rec">
            <div class="mr-rec__img"><span class="wf-img wf-r-4x3" data-label="Recommended product cut-out · white background · landscape 4:3"></span></div>
            <div>
              <p class="mr-rec__name">Your recommended product name here</p>
              <p class="mr-rec__desc">Your one-line introduction here</p>
              <div class="mr-rec__link">${btn("BUY", "accent", "product.html")}</div>
            </div>
          </div>
        </div>
      </div></div></div>
    </li>`,
    )
    .join("");

  document.querySelectorAll(".mr-acc__btn").forEach((b) =>
    b.addEventListener("click", () => {
      const li = b.closest(".mr-acc__item");
      li.querySelectorAll(".mr-acc__icon i:first-child, .mr-acc__body").forEach((e) => e.classList.toggle("is-active"));
      b.setAttribute("aria-expanded", String(li.querySelector(".mr-acc__body").classList.contains("is-active")));
      setTimeout(() => ScrollTrigger.refresh(), 300);
    }),
  );
  document.querySelectorAll(".mr-flip").forEach((b) => b.addEventListener("click", () => b.classList.toggle("is-active")));

  // ── Feature 2: four ──
  const rows = [
    ["Your product intro title here<br>Place two lines", "Cat coming out of an automatic litter box · bright interior · landscape 4:3", 2],
    ["Your product intro title here<br>Place two lines", "Cat sitting beside a water dispenser · landscape 4:3", 2],
    ["Your product intro title here<br>Place two lines", "Cat eating food from a bowl · from above · landscape 4:3", 2],
    ["Your product intro title here<br>Place two lines", "Cat wearing a necklace lying down · landscape 4:3", 1],
  ];
  document.querySelector(".mr-f2__list").innerHTML = rows
    .map(
      ([t, l, n]) => `<li class="mr-f2__item">
        <div class="mr-f2__img"><span class="wf-img wf-r-4x3" data-label="${l}"></span></div>
        <div><p class="mr-f2__title">${t}</p><p class="mr-f2__text">Your product description goes here in about three lines. It connects to an app to signal care times, and you can check its status even while away from home.</p>
          <div class="mr-f2__links">${n === 2 ? `<div>${btn("VIEW DETAIL", "ink", "product.html")}</div><div>${btn("BUY", "accent", "product.html")}</div>` : `<div>${btn("BUY", "accent", "product.html")}</div>`}</div></div>
      </li>`,
    )
    .join("");

  // ── Circle card slider: centered on phones, three columns at 1024 and up (destroy) ──
  if (window.Splide)
    document.querySelectorAll(".mr-f1__splide").forEach((el) => {
      const s = new Splide(el, {
        type: "slide", speed: 300, arrows: true, pagination: false, focus: "center", trimSpace: false, flickMaxPages: 1, flickPower: 200,
        fixedWidth: "min(308px, calc(240 / 375 * 100vw))", gap: "min(64px, calc(32 / 375 * 100vw))", mediaQuery: "min",
        breakpoints: { 1024: { destroy: true, arrows: false, pagination: false, flickPower: 600 } },
      });
      const bar = el.querySelector(".mr-pager__bar");
      s.on("mounted", () => (bar.style.width = `${100 / s.length}%`));
      s.on("move", () => (bar.style.left = `${(100 / s.length) * s.index}%`));
      s.mount();
    });

  // ── Video modal: curtain · box autoAlpha 0 → 1 (.3s), closes via Esc · curtain · close button ──
  const modal = document.querySelector(".mr-movie");
  const box = modal.querySelector(".mr-movie__box");
  const veil = modal.querySelector(".mr-movie__veil");
  gsap.set([box, veil], { autoAlpha: 0 });
  const open = () => {
    modal.setAttribute("aria-hidden", "false");
    modal.classList.add("is-open");
    gsap.killTweensOf([box, veil]);
    gsap.to([box, veil], { autoAlpha: 1, duration: reduce ? 0 : 0.3 });
  };
  const close = () => {
    modal.setAttribute("aria-hidden", "true");
    gsap.killTweensOf([box, veil]);
    gsap.to([box, veil], { autoAlpha: 0, duration: reduce ? 0 : 0.3, onComplete: () => modal.classList.remove("is-open") });
  };
  document.querySelector("[data-open-modal]").addEventListener("click", open);
  modal.querySelectorAll("[data-close-modal]").forEach((e) => e.addEventListener("click", close));
  document.addEventListener("keydown", (e) => e.key === "Escape" && modal.classList.contains("is-open") && close());

  // ── Hero: the photo panel sticks to the screen (no pinSpacing) and the dark overlay goes 0 → 1 over the top 25%, white text goes 0 → 1 from screen 70→30%, the dot Lottie plays once at 60% ──
  const kv = document.querySelector(".mr-fkv");
  const bg = kv.querySelector(".mr-fkv__bg");
  const veilBg = kv.querySelector(".mr-fkv__veil");
  const msg = kv.querySelector(".mr-fkv__msg");
  const pointWrap = kv.querySelector(".mr-fkv__pointWrap");
  const point = window.lottie && window.MR_ART ? lottie.loadAnimation({ container: document.getElementById("mr-point"), renderer: "svg", loop: false, autoplay: false, animationData: MR_ART.featurePoint() }) : null;
  const mm = gsap.matchMedia();
  mm.add({ go: "(prefers-reduced-motion: no-preference)", reduce: "(prefers-reduced-motion: reduce)" }, (ctx) => {
    if (ctx.conditions.reduce) {
      gsap.set([veilBg, msg], { opacity: 1 });
      point?.goToAndStop(point.totalFrames - 1, true);
      return;
    }
    ScrollTrigger.create({ trigger: kv, start: "top top", end: "bottom bottom", pin: bg, pinSpacing: false });
    gsap.fromTo(veilBg, { opacity: 0 }, { opacity: 1, scrollTrigger: { trigger: kv, start: "top top", end: "25% top", scrub: true } });
    gsap.fromTo(msg, { opacity: 0 }, { opacity: 1, scrollTrigger: { trigger: msg, start: "top 70%", end: "top 30%", scrub: true } });
    let played = false;
    ScrollTrigger.create({ trigger: pointWrap, start: "top 60%", onEnter: () => { if (!played && point) { point.goToAndPlay(0, true); played = true; } } });
  });
  addEventListener("load", () => ScrollTrigger.refresh());
})();
