/* First page — original values: when the first two videos are ready (metadata · data · canplay six times) the logo blurs to .95x over 1.8s and .2s later the curtain lifts over 1.8s. 
   Hot spring panel uses a Swiper fade (every 5s · 1s), and the vertical bar of the current panel fills over 5.3s. Photo panel collage is BK.collage in shared.js. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const html = document.documentElement;
  const loading = $(".p-top-loading"), logo = $(".p-top-loading__logo");
  const videos = [$(".fvbg-video"), $(".around-video")].filter(Boolean);
  const ready = new Promise((resolve) => {
    let n = 0;
    const need = videos.length * 3;
    const hit = () => { if (++n === need) { videos.forEach((v) => v.play().catch(() => {})); resolve(); } };
    videos.forEach((v) => {
      v.muted = true; v.loop = true; v.playsInline = true;
      v.addEventListener("loadedmetadata", hit, { once: true });
      v.addEventListener("loadeddata", hit, { once: true });
      v.addEventListener("canplay", hit, { once: true });
      v.load();
    });
    if (!need) resolve();
    setTimeout(resolve, 6000);
  });
  html.classList.add("wf-loading");
  BK.lenis.stop();
  ready.then(() => {
    html.classList.remove("wf-loading");
    logo?.classList.add("is-hidden");
    setTimeout(() => { loading?.classList.add("is-hidden"); html.classList.add("is-loaded"); BK.lenis.start(); }, 200);
  });

  BK.collage(document);

  const el = $(".p-top-onsen__slide");
  if (el && window.Swiper) {
    new Swiper(el, {
      spaceBetween: 0, autoHeight: false, simulateTouch: true, effect: "fade", speed: 1000, loop: true,
      autoplay: BK.reduce ? false : { delay: 5000, disableOnInteraction: false },
    });
  }
})();
