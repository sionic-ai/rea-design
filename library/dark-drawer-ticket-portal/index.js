// First page: three slick sliders (hero · news · magazine), hero blur board crossfade · progress bar, news window, and a transition where pressing the hero makes the blur board cover the screen.
// Original slick 1.6.0 settings as is: hero centerMode, 7000ms autoplay, 800ms, pause on hover, the blurred back panel fades 1000ms with asNavFor ·
// 5/3(9%)/1(24%)/1(20%)/1(15%) slides · News 4/3/2/1 slides · Magazine 4/3/2/1.2 slides (16.5%) · progress bar (n+1)/total at .5s power3.inOut.
(() => {
  const { reduced, icons } = window.DG;
  const pad2 = (n) => String(n).padStart(2, "0");

  window.DG.page("home", (box) => {
    const $ = window.jQuery;
    const offs = [];
    const on = (t, ev, fn, o) => { t.addEventListener(ev, fn, o); offs.push(() => t.removeEventListener(ev, fn, o)); };
    box.querySelectorAll(".dg-quick [data-icon]").forEach((el) => el.querySelector("svg") || el.insertAdjacentHTML("afterbegin", icons[el.dataset.icon]));

    // Original naviSlide: progress bar as (n+1)/total, hide the bar if there are fewer than the visible count
    const navi = (bar, n, max, show) => {
      if (!bar) return;
      bar.parentElement.classList.toggle("is-disabled", max <= show);
      gsap.to(bar, { width: `${(100 / max) * (n + 1)}%`, duration: reduced ? 0 : 0.5, ease: "power3.inOut" });
    };

    // ── Hero ──
    const mv = box.querySelector(".dg-mv");
    const $track = $(mv.querySelector(".dg-mv__track"));
    const bg = mv.querySelector(".dg-mv__bg");
    // The back blur panel clones the slide photo slot as is and blurs it — a real photo put in will be the one blurred (original blur 4.5rem)
    bg.innerHTML = [...mv.querySelectorAll(".dg-mv__slide .wf-img")].map((ph) => `<div class="dg-mv__bgs">${ph.outerHTML}</div>`).join("");
    const $bg = $(bg);
    const bar = mv.querySelector(".dg-mv__navi i");
    const cur = mv.querySelector(".is-cur");
    const total = mv.querySelector(".is-total");
    const layout = (slick) => {
      // Original setPosition: photo height = Width × .8, bar and number 60px below the photo
      const W = mv.clientWidth, sw = slick.$slides.first().outerWidth() || 0, inner = slick.activeBreakpoint === 780 ? 13 : 20;
      const ih = (sw - inner * 2) * 0.8;
      const off = (W - sw) / 2;
      mv.style.setProperty("--ih", `${ih}px`);
      mv.style.setProperty("--nl", `${off + inner}px`);
      mv.style.setProperty("--nr", `${W - (off + sw - inner)}px`);
      mv.style.setProperty("--nt", `${parseFloat(getComputedStyle(mv).getPropertyValue("--pad-top")) + ih + 20}px`);
    };
    const heroNavi = (n, slick) => {
      navi(bar, n, slick.slideCount, slick.options.slidesToShow);
      cur.textContent = pad2(n + 1);
      total.textContent = pad2(slick.slideCount);
    };
    $track
      .on("init", (e, slick) => { mv.dataset.length = slick.activeBreakpoint || ""; heroNavi(0, slick); layout(slick); })
      .on("breakpoint", (e, slick) => { mv.dataset.length = slick.activeBreakpoint || ""; })
      .on("setPosition", (e, slick) => layout(slick))
      .on("beforeChange", (e, slick, c, n) => heroNavi(n, slick))
      .slick({
        infinite: true, arrows: true, centerMode: true, centerPadding: 0, adaptiveHeight: false, touchThreshold: 8, swipeToSlide: true,
        slidesToShow: 5, slidesToScroll: 1, asNavFor: bg, autoplay: !reduced, pauseOnHover: true, autoplaySpeed: 7000, speed: 800, useCSS: true, focusOnSelect: false,
        prevArrow: mv.querySelector(".dg-mv__arrow.is-prev"), nextArrow: mv.querySelector(".dg-mv__arrow.is-next"),
        responsive: [
          { breakpoint: 780, settings: { slidesToShow: 1, swipeToSlide: false, waitForAnimate: false, centerPadding: "15%", arrows: false, centerMode: true } },
          { breakpoint: 1024, settings: { slidesToShow: 1, centerPadding: "20%", centerMode: true } },
          { breakpoint: 1400, settings: { slidesToShow: 1, centerPadding: "24%", centerMode: true } },
          { breakpoint: 1920, settings: { slidesToShow: 3, centerPadding: "9%", centerMode: true } },
        ],
      });
    $bg.slick({ slidesToShow: 1, slidesToScroll: 1, arrows: false, adaptiveHeight: false, fade: true, asNavFor: $track[0], dots: false, centerMode: true, focusOnSelect: false, speed: reduced ? 0 : 1000, swipe: false, draggable: false, accessibility: false });

    // Play·pause button, pauses when the menu opens (original Slider.blurs), pauses 180s after leaving the window
    const play = mv.querySelector(".dg-mv__play");
    const playing = () => play.dataset.state === "play";
    on(play, "click", () => {
      $track.slick(playing() ? "slickPause" : "slickPlay");
      play.dataset.state = playing() ? "pause" : "play";
      play.setAttribute("aria-label", playing() ? "Pause" : "Play");
    });
    window.DG.pauseHero = (pause) => { if (pause) $track.slick("slickPause"); else if (playing() && !reduced) $track.slick("slickPlay"); };
    let away = null;
    on(window, "blur", () => { away = gsap.delayedCall(180, () => $track.slick("slickPause")); });
    on(window, "focus", () => { away?.kill(); if (playing() && !reduced) $track.slick("slickPlay"); });

    // Pressed slide: show the current blurred panel in the hero spot over .1s, expand it to full screen, then move on
    let clone = null;
    window.DG.special = (slide) => new Promise((resolve) => {
      $track.slick("slickPause");
      const r = mv.getBoundingClientRect();
      clone = document.createElement("div");
      clone.className = "dg-bgclone";
      const now = bg.querySelector(".slick-current .wf-img") || bg.querySelector(".wf-img");
      clone.innerHTML = now ? now.outerHTML : "";
      Object.assign(clone.style, { left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px`, borderRadius: getComputedStyle(mv).borderTopLeftRadius });
      document.body.append(clone);
      document.body.classList.add("is-leaving");
      if (reduced) return resolve();
      gsap.timeline({ onComplete: resolve })
        .from(clone, { opacity: 0, duration: 0.1 })
        .to(clone, { left: 0, top: 0, width: innerWidth, height: innerHeight, borderRadius: 0, duration: 0.6, ease: "power3.inOut" });
    });
    // In the original, the covering board continues into the next page’s (artist detail) header background. That page is missing here, so lift it when the new page turns on.
    window.DG.afterSpecial = () => {
      const c = document.querySelector(".dg-bgclone");
      if (c) gsap.to(c, { opacity: 0, duration: reduced ? 0 : 0.5, ease: "none", onComplete: () => c.remove() });
      window.DG.afterSpecial = null;
    };

    // ── News (the original also calls a progress bar slot but has no bar element) ──
    const info = box.querySelector(".dg-info");
    $(info.querySelector(".dg-info__track"))
      .slick({
        slidesToShow: 4, slidesToScroll: 1, infinite: true, centerPadding: 0, dots: false, centerMode: false, focusOnSelect: false, variableWidth: false, adaptiveHeight: false,
        arrows: true, touchThreshold: 5, autoplay: false, speed: 800, useCSS: true,
        prevArrow: info.querySelector(".is-prev"), nextArrow: info.querySelector(".is-next"),
        responsive: [{ breakpoint: 780, settings: { slidesToShow: 1, arrows: false } }, { breakpoint: 1024, settings: { slidesToShow: 2 } }, { breakpoint: 1400, settings: { slidesToShow: 3 } }],
      });

    // ── Magazine ──
    const mag = box.querySelector(".dg-mag");
    const magBar = mag.querySelector(".dg-mag__navi i");
    $(mag.querySelector(".dg-mag__track"))
      .on("init", (e, slick) => navi(magBar, slick.currentSlide, slick.slideCount, slick.options.slidesToShow))
      .on("beforeChange", (e, slick, c, n) => navi(magBar, n, slick.slideCount, slick.options.slidesToShow))
      .slick({
        slidesToShow: 4, slidesToScroll: 1, initialSlide: 0, infinite: true, dots: false, centerMode: false, focusOnSelect: false, variableWidth: false, adaptiveHeight: true,
        arrows: true, touchThreshold: 10, autoplay: false, speed: 800, useCSS: true,
        prevArrow: mag.querySelector(".is-prev"), nextArrow: mag.querySelector(".is-next"),
        responsive: [
          { breakpoint: 780, settings: { initialSlide: 0, slidesToShow: 1.2, centerPadding: "16.5%", centerMode: true, arrows: false } },
          { breakpoint: 1024, settings: { initialSlide: 0, slidesToShow: 2 } },
          { breakpoint: 1400, settings: { initialSlide: 0, slidesToShow: 3 } },
        ],
      });

    // ── News window: one notification opens in a window without moving the page ──
    const modal = box.querySelector(".dg-modal");
    const openModal = (e) => {
      e.preventDefault();
      window.DG.closeMenu();
      modal.scrollTop = 0;
      modal.classList.add("is-open");
      window.DG.lenis?.stop();
    };
    const closeModal = () => { if (!modal.classList.contains("is-open")) return; modal.classList.remove("is-open"); window.DG.lenis?.start(); };
    box.querySelectorAll("[data-modal]").forEach((a) => on(a, "click", openModal));
    on(modal.querySelector(".dg-modal__close"), "click", closeModal);
    on(modal.querySelector(".dg-modal__veil"), "click", closeModal);
    on(window, "keydown", (e) => e.key === "Escape" && closeModal());

    return () => {
      offs.forEach((f) => f());
      away?.kill();
      closeModal();
      [$track, $bg, $(info.querySelector(".dg-info__track")), $(mag.querySelector(".dg-mag__track"))].forEach(($s) => $s.hasClass("slick-initialized") && $s.slick("unslick"));
      window.DG.special = null;
      window.DG.pauseHero = null;
    };
  });
})();
