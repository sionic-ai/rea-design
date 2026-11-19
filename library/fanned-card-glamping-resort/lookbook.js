// Gallery — tabs (previous panel hides instantly, new panel fades in .6s, lower tabs swing-scroll to the gallery head in .6s) · clicking a cell fades in the overlay and its category slide .6s · Swiper (loop·1.5s·no drag)
(() => {
  const fade = (el, show, ms = 600) => {
    if (!el) return;
    gsap.killTweensOf(el);
    if (show) { el.style.display = "block"; gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: ms / 1000, ease: "sine.inOut" }); }
    else gsap.to(el, { opacity: 0, duration: ms / 1000, ease: "sine.inOut", onComplete: () => { el.style.display = "none"; } });
  };
  const main = document.querySelector(".ge-gmain");
  const wraps = [...document.querySelectorAll(".ge-gmain__wrap")];
  const tabs = [...document.querySelectorAll(".ge-tabs__tab")];
  const fit = (wrap) => { if (main && wrap) main.style.height = `${wrap.offsetHeight}px`; };
  wraps.forEach((w, i) => { if (i) w.style.display = "none"; });
  fit(wraps[0]);
  addEventListener("resize", () => fit(wraps.find((w) => w.style.display !== "none")));

  tabs.forEach((tab) => {
    tab.addEventListener("click", (e) => {
      e.preventDefault();
      const id = tab.getAttribute("href");
      const target = document.querySelector(id);
      const cur = wraps.find((w) => w.style.display !== "none");
      if (!target || target === cur) return;
      const k = [...tab.parentElement.children].indexOf(tab);
      document.querySelectorAll(".ge-tabs").forEach((bar) => [...bar.children].forEach((t, j) => t.classList.toggle("is-active", j === k)));
      if (cur) { gsap.killTweensOf(cur); cur.style.display = "none"; }
      fade(target, true);
      fit(target);
      if (tab.classList.contains("is-under")) {
        const head = document.getElementById("ge-header");
        gsap.to(window, { duration: 0.6, ease: "sine.inOut", scrollTo: { y: main.getBoundingClientRect().top + scrollY - (head?.offsetHeight || 0), autoKill: false } });
      }
    });
  });

  const slide = document.getElementById("ge-gslide");
  const sliders = {};
  let st = 0;
  addEventListener("load", () => {
    if (window.Swiper) {
      document.querySelectorAll(".ge-gslide__wrap").forEach((w) => {
        sliders[w.dataset.cate] = new Swiper(w, {
          loop: true, loopAdditionalSlides: 1, slidesPerView: 1, speed: 1500, autoplay: false, followFinger: false, freeMode: false,
          observer: true, observeParents: true, watchSlidesProgress: true,
          navigation: { nextEl: w.querySelector(".ge-gslide__arrow.is-next"), prevEl: w.querySelector(".ge-gslide__arrow.is-prev") },
        });
      });
    }
  });
  const close = () => {
    fade(slide, false);
    slide.querySelectorAll(".ge-gslide__wrap").forEach((w) => fade(w, false));
    document.body.classList.remove("oh-open");
    document.body.style.top = "0";
    scrollTo(0, st);
  };
  document.querySelectorAll(".ge-gmain__btn").forEach((b) => {
    b.addEventListener("click", () => {
      const cate = b.dataset.cate;
      const i = [...b.closest(".ge-gmain__list").children].indexOf(b.parentElement);
      fade(slide, true);
      fade(slide.querySelector(`.ge-gslide__wrap[data-cate="${cate}"]`), true);
      // Jumps straight to the clicked cell and turns off the photo slide transition only meanwhile
      const imgs = slide.querySelectorAll(".ge-gslide__img");
      imgs.forEach((m) => { m.style.transitionDuration = "0s"; });
      sliders[cate]?.slideToLoop(i, 1);
      setTimeout(() => imgs.forEach((m) => { m.style.transitionDuration = ""; }), 10);
      st = scrollY;
      document.body.style.top = `${-st}px`;
      document.body.classList.add("oh-open");
    });
  });
  slide?.querySelector(".ge-gslide__close")?.addEventListener("click", close);
  slide?.addEventListener("click", (e) => { if (e.target === slide) close(); });
})();
