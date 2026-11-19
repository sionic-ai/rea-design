(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Intro curtain: only on the first open of a session, it lifts after .4s over .35s, and wheel·touch scrolling is blocked meanwhile (original 750ms)
  const splash = document.querySelector(".yd-splash");
  if (splash) {
    let first = false;
    try { first = !sessionStorage.getItem("yd-splashed"); sessionStorage.setItem("yd-splashed", "1"); } catch (e) { first = false; }
    if (first && !reduce) {
      const stop = (e) => e.preventDefault();
      scrollTo(0, 0);
      addEventListener("wheel", stop, { passive: false });
      addEventListener("touchmove", stop, { passive: false });
      splash.classList.add("is-on");
      setTimeout(() => {
        removeEventListener("wheel", stop);
        removeEventListener("touchmove", stop);
        splash.classList.add("is-end");
      }, 750);
    } else {
      splash.classList.add("is-end");
    }
  }

  // Magazine card row: the same card set joined twice and flowed to -50% has no seam
  const tpl = document.getElementById("yd-journal-cards");
  if (tpl) {
    const cards = [...tpl.content.children];
    const rows = document.querySelectorAll(".yd-journal__track");
    rows.forEach((track, r) => {
      const set = r === 0 ? cards.slice(0, 3) : cards.slice(3, 6);
      for (let k = 0; k < 2; k++) set.forEach((c) => track.appendChild(c.cloneNode(true)));
    });
    const wrap = document.querySelector(".yd-journal-swiper .swiper-wrapper");
    cards.forEach((c) => {
      const s = document.createElement("div");
      s.className = "swiper-slide";
      s.appendChild(c.cloneNode(true));
      wrap?.appendChild(s);
    });
  }

  // Report tab panel: six cards per tab
  const rtpl = document.getElementById("yd-report-cards");
  const posts = document.querySelector(".yd-report__posts");
  if (rtpl && posts) {
    const cards = [...rtpl.content.children];
    const order = [[0, 1, 2, 3, 4, 5], [0, 2, 4, 1, 3, 5], [5, 3, 1, 4, 2, 0], [1, 2, 3, 4, 5, 0]];
    order.forEach((o, i) => {
      const page = document.createElement("div");
      page.className = "yd-report__page" + (i === 0 ? " is-on" : "");
      page.setAttribute("role", "tabpanel");
      o.forEach((n) => page.appendChild(cards[n].cloneNode(true)));
      posts.appendChild(page);
    });
    const tabs = document.querySelectorAll(".yd-report__tab");
    const pages = posts.querySelectorAll(".yd-report__page");
    tabs.forEach((t, i) => t.addEventListener("click", () => {
      tabs.forEach((x) => x.classList.remove("is-on"));
      pages.forEach((x) => x.classList.remove("is-on"));
      t.classList.add("is-on");
      pages[i].classList.add("is-on");
    }));
  }

  // Hero news line: doesn’t flow if it is shorter than the box. Pauses on hover
  const newsA = document.querySelector(".yd-mv__newsscroll a");
  if (newsA) {
    const txts = newsA.querySelector(".yd-mv__txts");
    const track = newsA.querySelector(".yd-mv__track");
    const first = track.firstElementChild;
    if (txts.getBoundingClientRect().width >= first.getBoundingClientRect().width) txts.classList.add("is-still");
    newsA.addEventListener("mouseenter", () => { track.style.animationPlayState = "paused"; });
    newsA.addEventListener("mouseleave", () => { track.style.animationPlayState = "running"; });
  }

  if (typeof Swiper === "undefined") return;

  // Hero panel: crossFade 1s, every 5 seconds. The bar fills straight over 5s and slides out to the right at .67s on change.
  // After the change, the previous section’s text waits at -15px, the next section’s text waits at +15px after a .5s delay
  const bar = document.querySelector(".yd-mv__bar span");
  const crnt = document.querySelector(".yd-mv__crnt");
  let barOn = true;
  const play = (el, anim) => { el.style.animation = "none"; el.offsetHeight; el.style.animation = anim; };
  const mark = (s) => {
    const prev = s.slides[s.previousIndex];
    prev?.classList.add("real-prev");
    const next = s.slides[s.activeIndex === s.slides.length - 1 ? 0 : s.activeIndex + 1];
    if (next) setTimeout(() => next.classList.add("real-next"), 500);
  };
  new Swiper(".yd-top-swiper", {
    speed: reduce ? 0 : 1000,
    autoplay: reduce ? false : { delay: 5000, waitForTransition: true, disableOnInteraction: true },
    effect: "fade",
    allowTouchMove: false,
    fadeEffect: { crossFade: true },
    on: {
      init(s) { if (barOn && bar && !reduce) play(bar, `yd-bar ${s.params.autoplay.delay}ms linear 0s normal both`); mark(s); },
      slideChangeTransitionStart(s) { if (barOn && bar) play(bar, `yd-bar-re ${s.params.speed / 1.5}ms ease-in-out 0s both`); },
      slideChange(s) {
        if (crnt) crnt.textContent = s.realIndex + 1;
        s.el.querySelectorAll(".real-prev").forEach((e) => e.classList.remove("real-prev"));
        s.el.querySelectorAll(".real-next").forEach((e) => e.classList.remove("real-next"));
      },
      slideChangeTransitionEnd(s) { if (barOn && bar) play(bar, `yd-bar ${s.params.autoplay.delay}ms linear 0s normal both`); mark(s); },
      autoplayStop() { if (bar) { bar.style.animation = "none"; } barOn = false; },
    },
  });

  // Magazine (phone): centered Swiper with an 8px gap between cells. Broken apart on wide screens
  const jEl = document.querySelector(".yd-journal-swiper");
  if (jEl) {
    let js = null;
    const mq = matchMedia("(max-width: 1024px)");
    const sync = () => {
      if (mq.matches) { if (!js) js = new Swiper(jEl, { slidesPerView: "auto", centeredSlides: true, spaceBetween: 8 }); }
      else if (js) { js.destroy(true, true); js = null; }
    };
    sync();
    mq.addEventListener("change", sync);
  }
})();
