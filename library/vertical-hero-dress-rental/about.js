// Six value cards — centered, loop, 1000ms, 6s autoplay, advancing automatically only while 30% is on screen (original settings as is)
(() => {
  const VALUES = [["Many designs to help you find the one outfit that truly suits you", "Bride choosing a dress with staff · store · portrait 4:5"], ["Find the one piece that fits me in a wide size range", "Hand taking measurements · close-up · portrait 4:5"], ["A dedicated designer shaped by the guest’s ”voice”", "Designer’s hand sketching · workbench · portrait 4:5"], ["Good quality at an affordable price", "Lace fabric close-up · Natural light · Portrait 4:5"], ["The same outfits and service anywhere in the country", "Bright store shelves · wide · portrait 4:5"], ["00k pairs a year, with the experience of standing by each person", "Smiling bride and staff · In front of a mirror · Portrait 4:5"]];
  const list = document.querySelector("[data-values]");
  list.innerHTML = VALUES.map(([t, l], i) => `<li class="p-about-value__list__item swiper-slide"><div class="p-about-value__list__item__wrap"><div class="image wf-img" data-label="${l}"></div><div class="txt-wrap"><div class="point lv-label"><span class="label">POINT</span><span class="num">${i + 1}</span></div><dl class="summary"><dt>$ here{t}</dt><dd>Your text unpacking this value goes here, about four lines. Say in order what we have insisted on, and what the customer gains as a result.</dd></dl></div></div></li>`).join("");
  addEventListener("load", () => {
    const el = document.querySelector(".centered-swiper");
    const sw = new Swiper(el, { slidesPerView: "auto", centeredSlides: true, loop: true, speed: 1000, autoplay: { delay: 6000, disableOnInteraction: false }, navigation: { nextEl: el.querySelector(".swiper-button-next"), prevEl: el.querySelector(".swiper-button-prev") }, pagination: { el: el.querySelector(".swiper-pagination"), type: "progressbar" }, threshold: 10, loopAdditionalSlides: 1 });
    new IntersectionObserver((es) => es.forEach((e) => (e.isIntersecting ? sw.autoplay.start() : sw.autoplay.stop())), { threshold: 0.3 }).observe(el);
  });
})();
