// First page: text cover (first visit only) → arched photo descends and lights up, news slider advancing every 6 seconds (typing 1.5s), flowing band, map.
// The slider is Swiper 11 like the original — loop, fade (crossFade), 600ms, no dragging, auto every 6 seconds (waitForTransition off).
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* Band: five identical sets joined end to end, rotating -20% (one set) at a time */
  const block = `<div class="h-mq__block">
    <p class="m-en">LOGO</p><span class="h-mq__d"></span><p class="is-ko">Your name here</p>
    <p class="m-en">Your English Tagline Here</p><span class="h-mq__dome"></span>
    <p class="m-en">LOGO</p><p class="is-ko">Your name here</p><p class="is-ko">Your one-line sentence goes here.</p></div>`;

  /* Text cover: like the original, a scene where the name is typed with an IME (grows one character at a time, composing, then confirmed) → flashes while switching typefaces → finally the cover.
     Cards are stamped from the left of a 630×120 grid. [text, font slot, weight, type] — the 8th and 15th (indexes 7 and 14) linger longer */
  const faces = [
    ["l", "display", 700], ["rieul", "sans", 700], ["Toward", "sans", 700], ["Rok", "sans", 700],
    ["Logo", "sans", 700], ["Logo ㄹ", "sans", 700], ["Brand Logo", "sans", 700], ["Logo Lab", "sans", 700],
    ["LOGO LAB", "display", 800], ["Logo Lab", "sans", 700, "wide"], ["LOGO LAB", "display", 800, "outline"], ["Logo Lab", "sans", 500],
    ["LOGO LAB", "mono", 700], ["Logo Lab", "serif", 400, "wide"], ["LOGO LAB", "display", 800, "big"],
  ];
  const card = ([txt, f, w, look]) => {
    const size = look === "big" ? 112 : 100, ls = look === "wide" ? 0.25 : 0.02;
    const paint = look === "outline" ? 'fill="none" stroke="currentColor" stroke-width="2"' : 'fill="currentColor"';
    return `<svg viewBox="0 0 630 120"><text x="6" y="96" ${paint} style="font-family: var(--kf-font-${f}, var(--kf-font-display))" font-weight="${w}" font-size="${size}" letter-spacing="${ls * size}">${txt}</text></svg>`;
  };

  M.page("home", (main) => {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    $("[data-map]", main).innerHTML = M.map();
    $$(".h-marquee__scroll", main).forEach((el) => (el.innerHTML = block.repeat(5)));

    /* News slider: on each slide change, date and title are typed one character at a time over 1.5s. The previous slide’s typing rewinds to the start */
    $$(".h-slide", main).forEach((s) => [$(".h-news__time", s), $(".h-news h2", s)].forEach(M.split));
    let typing = [];
    const typeNews = (sw) => {
      typing.forEach((t) => { t.pause(); t.seek(0); t.kill(); });
      const s = $(".swiper-slide-active", sw.el);
      const parts = [$(".h-news__time", s), $(".h-news h2", s)];
      if (reduce) return parts.forEach((p) => p.classList.add("is-done"));
      typing = parts.map((p) => M.type(p, 1.5));
    };
    const el = $(".h-fvSwiper", main);
    const swiper = new Swiper(el, {
      a11y: { enabled: false },
      loop: true,
      effect: "fade",
      fadeEffect: { crossFade: true },
      allowTouchMove: false,
      speed: 600,
      navigation: { nextEl: $(".swiper-button-next", el), prevEl: $(".swiper-button-prev", el) },
      pagination: { el: $(".swiper-pagination", el), clickable: true },
      autoplay: reduce ? false : { delay: 6000, waitForTransition: false },
      on: { afterInit: typeNews, slideChangeTransitionEnd: typeNews },
    });
    // The original also calls pause right after creating it — waitForTransition is off, so it runs again immediately (the 6-second clock ticks even during the splash)
    swiper.autoplay?.pause();

    const off = [() => { typing.forEach((t) => t.kill()); swiper.destroy(); }];
    const splash = $(".h-splash", main);
    const root = document.documentElement;
    if (reduce || sessionStorage.getItem("m-splashed") || !document.body.classList.contains("is-home")) { root.classList.remove("m-splash-wait"); return () => off.forEach((f) => f()); }
    sessionStorage.setItem("m-splashed", 1);

    const txts = $(".h-splash__txts", splash);
    txts.innerHTML = faces.map(card).join("") + M.logo().replace('viewBox="0 0 73 91"', 'viewBox="-80 0 233 91"');

    const hold = { 7: 0.4, 14: 0.8 };
    const frames = $$("svg", txts);
    const fv = $(".h-fv", main);
    const imgs = $$(".h-slide__imgs", main);
    const figs = $$(".h-slide__imgs figure", main);
    const ui = [$(".m-logo"), $(".m-hright"), $(".m-bar"), ...$$(".h-news", main), $(".h-fv__ctrl", main), $(".h-fv__our", main), $(".h-fv__sd", main)];
    // Measures the original formula (panel height + distance from Hero top to the panel) with layout values — inactive slide panels have translate -100% applied, so measuring by screen box drops the height
    const p = imgs[0].offsetHeight + imgs[0].offsetTop;
    scrollTo(0, 0);
    splash.classList.add("is-on");
    fv.classList.add("is-splash");
    gsap.set(ui, { opacity: 0 });
    gsap.set(imgs, { y: -p });
    gsap.set(figs, { filter: "brightness(0)" });
    root.classList.remove("m-splash-wait");
    const tl = gsap.timeline({
      onComplete: () => {
        splash.classList.remove("is-on");
        fv.classList.remove("is-splash");
      },
    });
    let t = 0;
    frames.forEach((f, i) => {
      tl.set(f, { opacity: 1 }, t);
      t += hold[i] || 0.1;
      if (i !== frames.length - 1) tl.set(f, { opacity: 0 }, t);
    });
    tl.to(imgs, { ease: M.ease, duration: 0.3, y: 0 }, 4);
    tl.to(figs, { ease: M.ease, duration: 0.3, filter: "brightness(1)" }, 4.7);
    tl.to(ui, { ease: M.ease, duration: 0.3, opacity: 1 }, 4.7);
    off.push(() => { gsap.set([...ui.filter(Boolean)], { clearProps: "opacity" }); splash.classList.remove("is-on"); });
    return () => off.forEach((f) => f());
  });
})();
