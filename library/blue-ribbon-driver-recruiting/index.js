(() => {
  const ARROW = '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M4 10h11M11 5.5 15.5 10 11 14.5"/></svg>';
  document.querySelectorAll("[data-ribbon]").forEach((el) => { el.innerHTML = window.zmRibbon(`zm-rb-${el.dataset.ribbon}`); });
  document.querySelectorAll(".zm-btn__icon, .zm-arrow, .zm-slnav__btn").forEach((el) => { el.innerHTML = ARROW; });

  const COLUMNS = [
    ["Your column title, a two-line story of two people", "Interview", "Two suited drivers standing in front of a car, upper body · daytime · landscape 395:222"],
    ["Here, a slightly long column title, about three lines on the work worries and answers the articles discuss.", "Interview", "Cover mixed with an illustration of a driver smiling and gesturing · bright colors · landscape 395:222"],
    ["Your column title here, two lines: when work changes, life changes", "Interview", "Three suited drivers lined up in front of a black car · outside a hotel · landscape 395:222"],
    ["Your column title goes here, the fourth story in two lines", "Column", "Car driving along a seaside road · landscape 395:222"],
  ];
  const cols = document.querySelector("[data-columns]");
  if (cols) cols.innerHTML = COLUMNS.map(([t, tag, label]) => `
    <div class="swiper-slide"><a class="zm-column__card" href="#column"><div class="zm-column__img zm-ph"><div class="wf-img" data-label="${label}"></div></div><p class="zm-column__text">${t}</p><div class="zm-column__meta"><span class="zm-column__date">0000.00.00</span><span class="zm-column__tag">${tag}</span></div></a></div>`).join("");

  const PEOPLE = [
    ["Your first interview quote line here.<br>Your second line here, written a little longer.", "Your name (age 00s) here", "Upper body of a man in a suit, engineer · wood · portrait 339:460"],
    ["Your interview quote here.<br>Your next two lines here. A bit longer.", "Your name (age 00s) here", "Driver with glasses, upper body · beside a car · vertical 339:460"],
    ["Your first interview quote line here.<br>Your second and third lines here. A story of resolve.", "Your name (age 00s) here", "Smiling driver upper body · sky · vertical 339:460"],
    ["Your interview quote here.<br>Two more lines go here.", "Your name (PR) here", "Suited woman, upper body · city · portrait 339:460"],
    ["Your first interview quote line here.<br>Add your second line here.", "Your name (age 00s) here", "Driver upper body · indoor · vertical 339:460"],
  ];
  const ivs = document.querySelector("[data-interviews]");
  if (ivs) ivs.innerHTML = PEOPLE.map(([t, n, label]) => `
    <div class="swiper-slide"><a class="zm-interview__card" href="#interview"><div class="zm-interview__thumb zm-ph"><div class="wf-img" data-label="${label}"></div><span class="zm-interview__play"><svg viewBox="0 0 10 12" fill="currentColor" aria-hidden="true"><path d="M0 0l10 6-10 6z"/></svg></span></div><p class="zm-interview__text">${t}</p><p class="zm-interview__name">${n}</p></a></div>`).join("");

  // Swiper: same Swiper 8.4.3 as the original · same options
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (window.Swiper) {
    let pro;
    const md = matchMedia("(min-width: 768px)");
    const proToggle = () => {
      if (md.matches && !pro && document.querySelector(".js-pro-swiper")) {
        pro = new Swiper(".js-pro-swiper", { slidesPerView: "auto", centeredSlides: false, spaceBetween: 10, loop: true, speed: 5000, allowTouchMove: false, autoplay: reduce ? false : { delay: 0, disableOnInteraction: false, pauseOnMouseEnter: false } });
      } else if (!md.matches && pro) { pro.destroy(true, true); pro = undefined; }
    };
    proToggle();
    md.addEventListener("change", proToggle);
    new Swiper(".js-top-column-swiper", {
      slidesPerView: 1.3, centeredSlides: false, loop: false, spaceBetween: 20,
      breakpoints: { 768: { slidesPerView: 3.2, centeredSlides: false, spaceBetween: 48 } },
      navigation: { nextEl: ".zm-column__next", prevEl: ".zm-column__prev" },
    });
    new Swiper(".js-top-interview-swiper", {
      slidesPerView: 1.3, centeredSlides: false, loop: true, autoplay: reduce ? false : { delay: 3000, disableOnInteraction: false }, spaceBetween: 20,
      breakpoints: { 768: { slidesPerView: 3.2, centeredSlides: false, spaceBetween: 48 } },
      navigation: { nextEl: ".zm-interview__next", prevEl: ".zm-interview__prev" },
    });
  }

  // Booking banner — turns on once past the hero’s bottom edge, and once × is pressed it never returns
  const mv = document.getElementById("mv");
  const banner = document.querySelector(".zm-banner");
  if (mv && banner) {
    const update = () => {
      if (banner.classList.contains("is-dismissed")) return;
      banner.classList.toggle("is-visible", scrollY >= mv.offsetTop + mv.offsetHeight);
    };
    addEventListener("scroll", update, { passive: true });
    addEventListener("resize", update);
    update();
    banner.querySelector(".zm-banner__close").addEventListener("click", (e) => {
      e.preventDefault(); e.stopPropagation();
      banner.classList.remove("is-visible");
      banner.classList.add("is-dismissed");
    });
  }

  gsap.registerPlugin(ScrollTrigger);
  const loader = document.querySelector(".zm-loading");
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: reduce)", () => { if (loader) loader.classList.add("is-skip"); });
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    // Opening sequence — the original gsap.js timeline as is. The loading cover shows only once after the tab is opened (sessionStorage)
    const tl = gsap.timeline();
    if (!loader || sessionStorage.getItem("zm-access")) {
      if (loader) tl.set(loader, { display: "none" });
    } else {
      sessionStorage.setItem("zm-access", "0");
      tl.fromTo(loader, { opacity: 0, zIndex: 0 }, { opacity: 1, zIndex: 99999, duration: 1, ease: "power2.inOut" })
        .fromTo(".zm-loading__img", { opacity: 0, filter: "blur(10px)" }, { opacity: 1, filter: "blur(0px)", duration: 1, ease: "power2.inOut" })
        .fromTo(".zm-loading__text", { opacity: 0, clipPath: "inset(100% 0 0 0)" }, { opacity: 1, clipPath: "inset(0% 0 0 0)", duration: 1.2, ease: "power2.inOut" })
        .to(".zm-loading__text", { scale: 15, opacity: 0, delay: 1 })
        .to(".zm-loading__img", { opacity: 0, duration: 1, delay: 0.5, ease: "power2.inOut" })
        .to(loader, { opacity: 0, duration: 1, ease: "power2.inOut", zIndex: 0 })
        .to(loader, { display: "none" });
    }
    tl.fromTo(".js-mv-img", { opacity: 0, clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", opacity: 1, stagger: 0.2, ease: "power2.inOut", duration: 1.5 }, "-=1")
      .fromTo(".zm-mv__ribbon", { opacity: 0, clipPath: "inset(0 100% 0 0)" }, { opacity: 1, clipPath: "inset(0 0% 0 0)", duration: 1.5, ease: "power2.inOut" }, "-=1")
      .fromTo(".js-en-title", { opacity: 0, clipPath: "inset(100% 0 0 0)" }, { clipPath: "inset(0% 0 0 0)", opacity: 1, stagger: 0.2, ease: "power2.inOut", duration: 1 })
      .fromTo(".js-ja-title", { opacity: 0, clipPath: "inset(100% 0 0 0)" }, { clipPath: "inset(0% 0 0 0)", opacity: 1, ease: "power2.inOut", duration: 1, "--width": "101%" }, "-=0.5")
      .fromTo(".js-top-header", { opacity: 0, y: -100 }, { y: 0, opacity: 1, ease: "power2.inOut", duration: 1 });

    // Big mark graphic — from a blurred .3x up to full size
    gsap.fromTo(".js-pro-img", { opacity: 0, scale: 0.3, filter: "blur(200px)" }, { opacity: 1, scale: 1, filter: "blur(0px)", duration: 1.5, ease: "power3.out", scrollTrigger: { trigger: ".js-pro-img", start: "top 90%" } });
  });

  window.zmMotion();
})();
