// First page: fills calendar, event cards, gallery and news, and hooks up four Swipers (hero overlap, event, ways to enjoy, zoom window) and per-section motion.
// Original values: hero Swiper fade 1200ms · every 2400ms (starts after .5s) · how-to-enjoy fade 1000ms, every 2500ms (phone 1500), bar 2.5s linear
// · Cotton-candy blob: appears in .3s when it reaches 60% of the screen and goes 1.03↔1 twice for .1s each (power4.out) · concept letters pop 1rem with a .08s stagger
// · Map image 1.05x · 10px blur → 1x in .9s · card button from 30px below in .8s, .125s stagger.
(() => {
  const { arrow, frog } = window.KC;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Calendar — frog footprints mark days with events
  const ev = new Set([3, 4, 10, 11, 17, 18, 24, 25, 31]);
  let cal = '<p class="kh-cal__ym">2026.00</p><div class="kh-cal__grid">' + ["Day", "Month", "Fire", "Number", "Neck", "Gold", "Earth"].map((d) => `<span class="wd">${d}</span>`).join("");
  for (let i = 0; i < 4; i++) cal += "<span></span>";
  for (let d = 1; d <= 31; d++) cal += `<span${ev.has(d) ? ' class="ev"' : ""}>${d}</span>`;
  document.querySelector("[data-cal]").innerHTML = cal + "</div>";

  const events = [["2026.00.00", "Your two lines or so here announcing the event calendar is open.", "Desk calendar and frog doll on desk · landscape 4:3"], ["2026.00.00", "Your frog festival news goes here", "Festival sign and lanterns · evening · landscape 4:3"], ["2026.00.00", "Your forest experience event goes here", "Family walking a forest path · daytime · landscape 4:3"], ["2026.00.00", "Your sauna event goes here", "Wooden sauna cabin · daytime · landscape 4:3"]];
  document.querySelector("[data-events]").innerHTML = events.map(([d, t, ph]) => `<div class="swiper-slide"><a class="kh-event__card" href="article.html"><div class="kc-ph"><div class="wf-img" data-label="${ph}"></div></div><p class="kh-event__date">${d}</p><p>${t}</p></a></div>`).join("");

  const shots = ["Lawn tent · day", "Birch forest · Summer", "Reception sign · Daytime", "Campfire · Night", "Trailer house exterior · Daytime", "Walking the puppy · Day", "Sink · Day", "Kids’ playground · daytime", "Sauna hut · evening", "Tent under the stars · night", "Autumn foliage forest · daytime", "Snowy Campground · Winter", "Hands grilling barbecue · evening", "Forest hammock · Day", "Frog pond · Daytime", "Morning coffee · Morning"];
  document.querySelector("[data-gallery]").innerHTML = shots.map((s) => `<li><button type="button"><div class="kc-ph"><div class="wf-img" data-label="${s} · Square"></div></div></button></li>`).join("");
  document.querySelector("[data-popup]").innerHTML = shots.map((s) => `<div class="swiper-slide"><div class="kc-ph"><div class="wf-img" data-label="${s} · Large · landscape 4:3"></div></div></div>`).join("");

  const news = [["2026.00.00", "Event", "Your event calendar now open news headline here."], ["2026.00.00", "Recruitment", "Your headline for staff recruitment news goes here"], ["2026.00.00", "Event", "Your festival news title goes here"], ["2026.00.00", "Notice", "Your new facility news title here"]];
  document.querySelector("[data-news]").innerHTML = news.map(([d, c, t]) => `<li><a href="article.html"><p class="kh-news__meta"><span class="kc-en">${d}</span><span class="kh-news__cat">${c}</span></p><p>${t}</p></a></li>`).join("");

  // Hero photo — starts after .5s
  setTimeout(() => new Swiper(".kh-mv__main", { loop: true, loopAdditionalSlides: 1, slidesPerView: 1, effect: "fade", fadeEffect: { crossFade: true }, allowTouchMove: false, speed: 1200, autoplay: reduce ? false : { delay: 2400 } }), 500);
  new Swiper(".kh-event__contents", { loop: true, loopAdditionalSlides: 1, slidesPerView: "auto", navigation: { prevEl: ".kh-event__arrow.is-prev", nextEl: ".kh-event__arrow.is-next" } });

  // How to enjoy
  const enjoy = document.querySelector("[data-enjoy]");
  const fill = enjoy.querySelector(".kh-enjoy__fill"), counter = enjoy.querySelector(".kh-enjoy__counter");
  const total = enjoy.querySelectorAll(".swiper-slide").length;
  const startEnjoy = () => new Swiper(enjoy, {
    loop: true, loopAdditionalSlides: 1, slidesPerView: 1, effect: "fade", speed: 1000, allowTouchMove: false, fadeEffect: { crossFade: true },
    autoplay: reduce ? false : { delay: 1500 }, breakpoints: { 769: { autoplay: reduce ? false : { delay: 2500 } } },
    on: {
      init() { counter.textContent = `${this.realIndex + 1}/${total}`; fill.classList.add("is-active"); },
      slideChange() {
        counter.textContent = `${this.realIndex + 1}/${total}`;
        const name = this.slides[this.activeIndex]?.dataset.slideName || "enjoy";
        enjoy.classList.remove("is-enjoy", "is-rain", "is-pets"); enjoy.classList.add(`is-${name}`);
        fill.classList.remove("is-active"); setTimeout(() => fill.classList.add("is-active"), 500);
      },
    },
  });

  // Gallery see more, enlarged window
  const box = document.querySelector(".kh-gallery__box"), more = box.querySelector(".kh-gallery__more");
  more.addEventListener("click", () => {
    const open = box.classList.toggle("is-open");
    more.querySelector(".label").textContent = open ? "Close" : "See more";
    if (!open) scrollTo({ top: box.getBoundingClientRect().top + scrollY - 70, behavior: reduce ? "auto" : "smooth" });
    ScrollTrigger.refresh();
  });
  const popup = document.querySelector(".kh-popup");
  let pop;
  box.querySelectorAll(".kh-gallery__list button").forEach((b, i) => b.addEventListener("click", () => {
    pop?.destroy();
    pop = new Swiper(".kh-popup__slide", { loop: true, loopAdditionalSlides: 1, slidesPerView: 1, allowTouchMove: false, navigation: { prevEl: ".kh-popup__arrow.is-prev", nextEl: ".kh-popup__arrow.is-next" } });
    pop.slideToLoop(i, 0);
    setTimeout(() => popup.classList.add("is-open"), 250);
  }));
  popup.querySelectorAll(".kh-popup__close, .kh-popup__overlay").forEach((el) => el.addEventListener("click", () => popup.classList.remove("is-open")));

  if (reduce) { startEnjoy(); return; }
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    gsap.utils.toArray(".kh-fluffy__item").forEach((el) => {
      gsap.timeline({ scrollTrigger: { trigger: el, start: "top 60%" } })
        .fromTo(el, { autoAlpha: 0 }, { duration: 0.3, autoAlpha: 1 })
        .to(el, { ease: "power4.out", duration: 0.1, scale: 1.03 }, "<0.1")
        .to(el, { scale: 1, duration: 0.1, ease: "power4.out" }, "<0.1")
        .to(el, { scale: 1.03, duration: 0.1, ease: "power4.out" }, "<0.1")
        .to(el, { scale: 1, duration: 0.1, ease: "power4.out" }, "<0.1");
    });
    gsap.utils.toArray(".kh-anime").forEach((el) => gsap.timeline({ scrollTrigger: { trigger: el, start: "top 60%" } })
      .fromTo(el.querySelectorAll(".kh-banner__item"), { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.125 }));
    // Concept — heading letters appear in .08s sequence with a 1rem bounce, then text, button and photo follow
    const concept = document.querySelector(".kh-concept"), lead = concept.querySelector("[data-hop]");
    lead.innerHTML = [...lead.textContent].map((c) => (c === " " ? " " : `<span class="label">${c}</span>`)).join("");
    const letters = lead.querySelectorAll(".label");
    gsap.timeline({ scrollTrigger: { trigger: concept, start: "top 60%" } })
      .fromTo(letters, { autoAlpha: 0 }, { autoAlpha: 1, stagger: 0.08, duration: 0.125 })
      .to(letters, { y: "-1rem", duration: 0.125, stagger: 0.08, ease: "power4.out" }, "<")
      .to(letters, { y: 0, duration: 0.125, stagger: 0.08, ease: "power4.out" }, "<0.125")
      .fromTo(".kh-concept__text", { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.9 }, "<0.8")
      .fromTo(".kh-concept__btn", { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.9 }, "<")
      .fromTo(".kh-concept__img", { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.8, ease: "power4.out" }, "<0.3");
    const brand = concept.querySelector(".brand");
    gsap.timeline({ scrollTrigger: { trigger: concept, start: "bottom 80%" } })
      .fromTo(brand, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.125 })
      .to(brand, { y: -10, duration: 0.125, ease: "power4.out" }, "<")
      .to(brand, { y: 0, duration: 0.125, ease: "power4.out" }, "<0.125")
      .to(brand, { y: -10, duration: 0.125, ease: "power4.out" }, "<0.125")
      .to(brand, { y: 0, duration: 0.125, ease: "power4.out" }, "<0.125");
    // For the map, events, how to enjoy, news and directions, the body enters .3s after the title (letter-hop-title part).
    // Title line: letters 0 · settle .125 · subtitle .125+.45 · body starts after that at .3 → .875
    const after = (sec) => gsap.timeline({ scrollTrigger: { trigger: sec, start: "top 60%" } }).set({}, {}, 0.875);
    after(".kh-map").fromTo(".kh-map__image", { autoAlpha: 0, scale: 1.05, "--blur": "10px" }, { autoAlpha: 1, scale: 1, "--blur": "0px", duration: 0.9 })
      .fromTo(".kh-map__links", { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.9 }, "<0.5");
    after(".kh-event").fromTo(".kh-event__row", { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.8 }).fromTo(".kh-event__cal-btn", { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.8 }, "<");
    after(".kh-enjoy").fromTo(enjoy, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.8, ease: "power4.out", onStart: startEnjoy });
    after(".kh-gallery").fromTo(".kh-gallery__list", { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0 }).fromTo(".kh-gallery__more", { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0 }, "<");
    after(".kh-news").fromTo(".kh-news__body", { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.8 });
    after(".kh-access").fromTo([".kh-access__name", ".kh-access__address", ".kh-access__tel", ".kh-access__reserve"], { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.8 })
      .fromTo(".kh-access__map", { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.8 }, "<0.4")
      .fromTo(".kh-access__brand", { autoAlpha: 0, x: "50%" }, { autoAlpha: 1, x: 0, duration: 0.8 }, "<0.5");
  });
})();
