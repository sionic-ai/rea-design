// About page: cover art (blue panel), old-building fragment slider — same Swiper 11 as the original (transition 800ms · draggable bar 120px, phone 51px · width per css).
(() => {
  /* Blue panel: scatters arch·semicircle·bar pieces in rows, large panels get a center cover on top */
  const piece = (k, x, y, w) => ({
    dome: `<path d="M${x} ${y + w}A${w / 2} ${w / 2} 0 0 1 ${x + w} ${y + w}Z"/>`,
    cup: `<path d="M${x} ${y}H${x + w}A${w / 2} ${w / 2} 0 0 1 ${x} ${y}Z"/>`,
    bar: `<rect x="${x + w * .3}" y="${y}" width="${w * .4}" height="${w}"/>`,
    d: `<path d="M${x} ${y}A${w / 2} ${w / 2} 0 0 1 ${x} ${y + w}Z"/>`,
  })[k];
  const kinds = ["dome", "bar", "cup", "d", "dome", "dome", "bar", "cup"];
  const vi = (type) => {
    let out = "";
    if (type !== "wide")
      for (let r = 0; r < 6; r++)
        for (let c = 0; c < 9; c++) out += piece(kinds[(r * 3 + c * 5) % kinds.length], 60 + c * 130, 60 + r * 140, 70);
    const label = type === "wide"
      ? `<g transform="translate(520 130) scale(3)">${M.logo().replace(/^\s*<svg[^>]*>|<\/svg>\s*$/g, "")}</g>`
      : type === "poster-word" ? `<text x="1200" y="930" text-anchor="end" style="font-family: var(--kf-font-display)" font-weight="800" font-size="120">LOGO</text>` : "";
    return `<svg viewBox="0 0 1260 ${type === "wide" ? 700 : 1000}" preserveAspectRatio="xMidYMid slice" aria-label="Cover image slot">${out}${label}</svg>`;
  };

  const labels = [
    "Old factory iron door close-up · rusted texture · side light", "Machine part close-up · Grease stains · Dark interior", "Sky beyond the window frame · Backlit", "Floor tile pattern · top-down composition",
    "Old signboard lettering · worn paint · front view", "Staircase handrail curve · soft light", "Ceiling piping · Looking-up angle", "Workbench tools · natural light",
    "Wall switch plate · Close-up", "Steel frame joint · side light", "Glass block wall · transmitted light", "Door handle · close-up",
  ];

  M.page("about", (main) => {
    main.querySelectorAll("[data-vi]").forEach((el) => (el.innerHTML = vi(el.dataset.vi)));
    const el = main.querySelector(".a-swiper");
    el.querySelector(".a-swiper__track").innerHTML = labels.map((l) => `<div class="swiper-slide a-swiper__slide"><div class="wf-img" data-label="${l} · Landscape 5:3"></div></div>`).join("");
    const swiper = new Swiper(el, {
      a11y: { enabled: false },
      speed: 800,
      navigation: { nextEl: el.querySelector(".swiper-button-next"), prevEl: el.querySelector(".swiper-button-prev") },
      scrollbar: { el: el.querySelector(".swiper-scrollbar"), draggable: true, dragSize: innerWidth > 1024 ? 120 : 51 },
      slidesPerView: "auto",
    });
    return () => swiper.destroy();
  });
})();
