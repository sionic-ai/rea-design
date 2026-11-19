// First page: original Swiper 8 settings as is. Hero fade (2s·4s), work·people panel (1.2s·4s, synced with the small photo row, pause button), diary cards (three at a time).
// The navy veil of the message section is laid by the pass-veil part, and when the video section enters, the hero vertical text blurs in .4s
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const pad = (n) => String(n).padStart(2, "0");

  const people = [
    ["Research position", "Your role here in about two large lines."], ["Research position", "Your two lines or so on your role here."], ["Clinical development role", "Your two lines or so on your role here."],
    ["Reliability Assurance Role", "Your role, in one line here."], ["Reliability Assurance Role", "Your two lines or so on your role here."], ["Pharmacist in charge", "Your role, in one line here."],
    ["Production engineering", "Your two lines or so on your role here."], ["Production engineering", "Your two lines or so on your role here."], ["Medical Lead", "Your assigned tasks here, about three lines — the longest line."],
    ["Product Marketing", "Your assigned tasks here, about three lines — the longest line."], ["Sales position", "Your role, in one line here."], ["Food R&D role", "Your role, in one line here."],
    ["Food sales role", "Your role, in one line here."], ["Business support role", "Your two lines or so on your role here."], ["Management support role (DX)", "Your two lines or so on your role here."],
  ];
  const main = document.querySelector(".js-swiper-main .swiper-wrapper"), thumbs = document.querySelector(".js-swiper-thum .swiper-wrapper");
  people.forEach(([job, line], i) => {
    main.insertAdjacentHTML("beforeend", `<div class="swiper-slide"><a class="ns-works__slide" href="detail.html"><div class="ns-works__photo ns-photo"><div class="wf-img" data-label="Staff ${pad(i + 1)} Working · Office or lab daylight · Waist up 4:3"></div></div><div class="ns-works__body"><span class="ns-works__job">${job}</span><p class="ns-works__line">${line}</p><p class="ns-works__name">A.B</p></div></a></div>`);
    thumbs.insertAdjacentHTML("beforeend", `<div class="swiper-slide ns-works__thumb"><div class="wf-img" data-label="${pad(i + 1)}"></div><span>${job}</span></div>`);
  });
  const notes = document.querySelector(".js-note .swiper-wrapper");
  ["Record title here — two lines saying a staff event was held", "Your record title here — Business Contest Story, two lines", "[Meet the Recruiter] About three lines from your hiring manager here", "Your record title here — the day we cheered together, two lines", "Your record title here — Two lines on education stories"].forEach((t, i) => {
    notes.insertAdjacentHTML("beforeend", `<a class="swiper-slide ns-note__card" href="#"><div class="ns-photo"><div class="wf-img" data-label="Record ${i + 1} Main photo · event/office · landscape 16:9"></div></div><p>${t}</p><i class="ns-chev is-right"></i></a>`);
  });

  if (window.Swiper) {
    new Swiper(".js-main-visual", { loop: true, effect: "fade", autoplay: reduce ? false : { delay: 4000, disableOnInteraction: false }, speed: 2000, allowTouchMove: false, threshold: 10 });
    const count = people.length;
    const thumb = new Swiper(".js-swiper-thum", { slidesPerView: "auto", spaceBetween: 4, loop: true, loopedSlides: count, watchSlidesProgress: true, slideToClickedSlide: false, breakpoints: { 0: { spaceBetween: 3 }, 751: { spaceBetween: 4 } } });
    const sw = new Swiper(".js-swiper-main", {
      slidesPerView: 1, speed: 1200, loop: true, loopedSlides: count, autoplay: reduce ? false : { delay: 4000, disableOnInteraction: false },
      navigation: { nextEl: ".js-swiper-main-next", prevEl: ".js-swiper-main-prev" }, threshold: 10,
    });
    const now = document.querySelector(".js-swiper-main-now");
    document.querySelector(".js-swiper-main-all").textContent = pad(count);
    const sync = () => { thumb.slideToLoop(sw.realIndex); now.textContent = pad(sw.realIndex + 1); };
    sync();
    sw.on("realIndexChange", sync);
    thumb.on("click", () => { const i = Number(thumb.clickedSlide?.getAttribute("data-swiper-slide-index")); if (!Number.isNaN(i)) sw.slideToLoop(i); });
    let paused = false;
    const stop = document.querySelector(".js-swiper-stop");
    stop.addEventListener("click", () => { paused ? sw.autoplay.start() : sw.autoplay.stop(); paused = !paused; stop.classList.toggle("is-paused", paused); });
    new Swiper(".js-note", { slidesPerView: "auto", spaceBetween: 30, navigation: { nextEl: ".js-note-next", prevEl: ".js-note-prev" }, breakpoints: { 0: { spaceBetween: 16 }, 751: { spaceBetween: 30 } } });
  }

  if (window.MicroModal) MicroModal.init({ openClass: "is-open", disableScroll: true, awaitOpenAnimation: true, awaitCloseAnimation: true });

  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.from(".ns-mv__slider", { opacity: 0, delay: 0.5, duration: 1 });
      gsap.to(".ns-mv__title", { opacity: 0, duration: 0.4, ease: "power1.out", scrollTrigger: { trigger: ".ns-movie", start: "top bottom", toggleActions: "play none none reverse" } });
    });
  }
})();
