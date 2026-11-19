// First page: swapping the fixed back layer per section, header decoration in black and white, room photo fade slide
(() => {
  const { layer, blackWhile, anims, reduce } = GL;
  const logo = document.querySelector(".gl-nav__logo");
  const hint = document.querySelector(".gl-scroll p");
  const pane = (n) => document.querySelector(`[data-pane=${n}]`);

  // Original values: PC and phone differ only in the start line of the photo cell (img5 · Footer) and the end of the black range
  gsap.matchMedia().add({ pc: "(min-width: 801px)", sp: "(max-width: 800px)" }, ({ conditions: { pc } }) => {
    blackWhile(".rooms", pc ? "top 70%" : "top center", pc ? "bottom 70%" : "bottom center");
    blackWhile(".dark-ui.is-last", "top 70%", "bottom 30%");
    blackWhile(pane("img2"), "top 70%", "bottom 40%");
    ScrollTrigger.create({
      trigger: pane("img2"), start: "top 70%", end: "bottom -50%",
      onEnter: () => { logo.classList.add("is-on"); hint.classList.remove("is-on"); },
      onLeaveBack: () => { logo.classList.remove("is-on"); hint.classList.add("is-on"); },
    });
    layer("img2", pane("img2"), "top 70%");
    ScrollTrigger.create({ trigger: pane("img3"), start: "top 50%", end: "bottom -50%", onEnter: () => hint.classList.add("is-on"), onLeaveBack: () => hint.classList.remove("is-on") });
    layer("img3", pane("img3"), "top 50%");
    layer("img4", pane("img4"), "top 70%");
    ScrollTrigger.create({ trigger: ".rooms", start: "top bottom", end: "bottom top", onEnter: () => hint.classList.remove("is-on"), onLeaveBack: () => hint.classList.add("is-on") });
    layer("room", ".rooms", "top 70%");
    layer("img5", ".img5", pc ? "top 30%" : "top 150px");
    layer("food", ".food", "top 70%");
    layer("facilities", ".facilities", "top 50%");
    layer("access", ".access", "top 50%");
    layer("img6", ".gl-footer", pc ? "top 30%" : "top 150px");
  });
  anims();

  // Room text: 1s fade + center divider runs top to bottom (left to right on phone)
  document.querySelectorAll(".rooms__text").forEach((t) =>
    ScrollTrigger.create({ trigger: t, start: "top 90%", end: "bottom top", onEnter: () => t.classList.add("is-anim") }));

  // Room photos: same Swiper fade as the original (crossFade · speed 1000 · autoplay 3000) — autoplay only while on screen
  document.querySelectorAll("[data-slider]").forEach((el) => {
    const sw = new Swiper(el, {
      effect: "fade", fadeEffect: { crossFade: true }, speed: reduce ? 0 : 1000, autoplay: { delay: 3000 },
      navigation: { nextEl: el.querySelector(".swiper-button-next"), prevEl: el.querySelector(".swiper-button-prev") },
      a11y: { prevSlideMessage: "Previous photo", nextSlideMessage: "Next photo" },
    });
    sw.autoplay.stop();
    if (reduce) return;
    ScrollTrigger.create({ trigger: el, start: "top bottom", end: "bottom top", onEnter: () => sw.autoplay.start(), onLeave: () => sw.autoplay.stop(), onEnterBack: () => sw.autoplay.start(), onLeaveBack: () => sw.autoplay.stop() });
  });

  // Facility icons and transport icons — redrawn at the same size in place of the original line icons
  const ICON = {
    toilet: '<circle cx="15" cy="10" r="3"/><circle cx="29" cy="10" r="3"/><path d="M11 16h8l-1 10h-6zM25 16h8l2 10h-12zM13 26v10M17 26v10M27 26v10M31 26v10"/>',
    shower: '<path d="M10 12a12 12 0 0 1 24 0zM22 4v4"/><path d="M14 18v4M19 18v6M24 18v5M29 18v4M17 26v3M26 26v4"/>',
    laundry: '<rect x="9" y="5" width="26" height="34" rx="3"/><path d="M9 13h26"/><circle cx="22" cy="26" r="8"/><circle cx="14" cy="9" r="1"/>',
    car: '<path d="M6 26v-6l4-8h24l4 8v6zM6 26v4h5v-4M33 26v4h5v-4"/><circle cx="13" cy="21" r="2"/><circle cx="31" cy="21" r="2"/>',
    train: '<rect x="11" y="4" width="22" height="26" rx="5"/><path d="M11 18h22M16 34l-3 6M28 34l3 6"/><circle cx="17" cy="24" r="1.5"/><circle cx="27" cy="24" r="1.5"/>',
  };
  document.querySelectorAll("[data-icon]").forEach((el) => (el.innerHTML = `<svg viewBox="0 0 44 44">${ICON[el.dataset.icon]}</svg>`));
})();
