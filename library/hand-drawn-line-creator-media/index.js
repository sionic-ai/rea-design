(() => {
  const body = document.body;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const data = window.idLottie || {};
  const play = (el, key, loop) => (window.lottie && el && data[key] ? lottie.loadAnimation({ container: el, renderer: "svg", loop, autoplay: true, animationData: data[key] }) : null);
  const done = () => body.classList.add("is-content-ready", "is-loaded");

  // The veil shows on first visit only (original sessionStorage hasSeenOpening). Once fonts are ready or 1.5 seconds pass, the loader lifts and the wordmark is drawn
  let seen = false;
  try { seen = sessionStorage.getItem("id-seen-opening") === "1"; sessionStorage.setItem("id-seen-opening", "1"); } catch (e) { seen = false; }
  if (seen || reduce || !window.lottie) {
    body.classList.add("is-opening-skip");
    done();
  } else {
    const loader = play(document.querySelector(".id-loading__anim"), "loading", true);
    let started = false;
    const run = () => {
      if (started) return;
      started = true;
      body.classList.add("is-content-ready");
      const logoBox = document.querySelector(".id-opening__logo .id-lottie");
      const logo = play(logoBox, "logo", false);
      const after = () => {
        logoBox.classList.add("is-done");
        play(document.querySelector(".id-opening__wipe"), "opening-bg", false);
        play(document.querySelector(".id-opening__arrow .id-lottie"), "opening-arrow", false);
        setTimeout(() => body.classList.add("is-loaded"), 1000);
        setTimeout(() => loader && loader.destroy(), 400);
      };
      if (logo) logo.addEventListener("complete", after); else after();
    };
    // Original goes with webfontloader active or 1.5s, whichever comes first — the original font (Typekit) is late, so when measured the 1.5s side always comes first
    setTimeout(run, 1500);
  }

  // On phone the About collage is a two-row Swiper of image panels and photo panels, advancing every 4 seconds over 1 second (no manual swipe, original aboutSlide)
  const collage = document.querySelector(".id-collage");
  if (collage && window.Swiper && matchMedia("(max-width: 767px)").matches) {
    const tiles = [...collage.children];
    const build = (list, cls) => {
      const box = document.createElement("div");
      box.className = `swiper id-collage__swiper ${cls}`;
      const wrap = document.createElement("div");
      wrap.className = "swiper-wrapper";
      list.forEach((t) => { const s = document.createElement("div"); s.className = "swiper-slide"; s.append(t); wrap.append(s); });
      box.append(wrap);
      return box;
    };
    const big = build(tiles.filter((t) => t.querySelector("svg") && !t.querySelector(".id-ph")), "is-big");
    const small = build(tiles.filter((t) => t.querySelector(".id-ph")), "is-small");
    collage.classList.add("is-swiper");
    collage.append(big, small);
    const opt = { loop: true, autoplay: { delay: 4000, disableOnInteraction: false }, allowTouchMove: false, slidesPerView: 1, spaceBetween: 0, speed: 1000 };
    new Swiper(big, opt);
    new Swiper(small, opt);
  }
})();
