// Shared by the whole site — placing hand-drawn illustrations, phone menu drawer, slick slider, phone mask of the service band, wow reveal
(() => {
  const petals = (n, r, rx, ry, cls) => Array.from({ length: n }, (_, i) => `<ellipse class="${cls}" cx="50" cy="${50 - r}" rx="${rx}" ry="${ry}" transform="rotate(${(360 / n) * i} 50 50)"/>`).join("");
  const face = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><ellipse class="a-w" cx="-7" cy="0" rx="5.5" ry="7"/><ellipse class="a-w" cx="7" cy="0" rx="5.5" ry="7"/><circle class="a-k" cx="-6" cy="1.5" r="2.6"/><circle class="a-k" cx="8" cy="1.5" r="2.6"/><path class="st st-k" stroke-width="2.4" d="M-8 12 q8 7 16 0"/></g>`;
  const ART = {
    flower: `<svg viewBox="0 0 100 100">${petals(8, 26, 12, 19, "a-o")}<circle class="a-y" cx="50" cy="50" r="15"/><circle class="a-r" cx="50" cy="50" r="5"/></svg>`,
    "flower-y": `<svg viewBox="0 0 100 100">${petals(8, 26, 12, 19, "a-y")}<circle class="a-t" cx="50" cy="50" r="14"/></svg>`,
    "flower-p": `<svg viewBox="0 0 100 100">${petals(6, 24, 14, 20, "a-rose")}<circle class="a-p" cx="50" cy="50" r="12"/></svg>`,
    heart: `<svg viewBox="0 0 100 100"><path class="a-r" d="M50 90C22 68 6 50 10 30 14 12 36 8 50 26 64 8 86 12 90 30 94 50 78 68 50 90Z"/>${face(50, 44, 0.9)}</svg>`,
    "heart-p": `<svg viewBox="0 0 100 100"><path class="a-rose" d="M50 86C24 66 10 50 14 32 18 16 38 12 50 28 62 12 82 16 86 32 90 50 76 66 50 86Z"/><path class="st st-k" stroke-width="2.4" d="M38 44 q4-4 8 0M54 44 q4-4 8 0M42 56 q8 7 16 0"/></svg>`,
    megaphone: `<svg viewBox="0 0 140 100"><path class="a-o" d="M40 40 110 6 120 86 46 64Z"/><rect class="a-y" x="22" y="38" width="24" height="28" rx="6"/><path class="a-k" d="M30 64 42 64 50 92 38 94Z"/><path class="st st-y" stroke-width="6" d="M124 30 136 24M126 50h12M124 70l12 6"/></svg>`,
    "word-sou": `<svg viewBox="0 0 160 90"><g transform="rotate(18 80 45)"><rect class="a-grey" x="10" y="20" width="30" height="46" rx="6"/><rect class="a-grey" x="48" y="20" width="30" height="46" rx="14"/><rect class="a-grey" x="86" y="20" width="30" height="46" rx="6"/><path class="a-o" d="M118 26 156 6 156 84 118 62Z"/></g></svg>`,
    burst: `<svg viewBox="0 0 100 100"><path class="a-k" d="M50 2 58 34 86 14 68 42 98 50 68 58 86 86 58 66 50 98 42 66 14 86 32 58 2 50 32 42 14 14 42 34Z"/></svg>`,
    asterisk: `<svg viewBox="0 0 100 100"><path class="st st-p" stroke-width="7" d="M50 8v84M14 29l72 42M14 71l72-42"/></svg>`,
    "asterisk-y": `<svg viewBox="0 0 100 100"><path class="st st-y" stroke-width="7" d="M50 8v84M14 29l72 42M14 71l72-42M8 50h84"/></svg>`,
    squiggle: `<svg viewBox="0 0 200 80"><path class="st st-b" stroke-width="12" d="M8 60C30 10 52 10 64 40S96 72 112 40 150 6 192 30"/></svg>`,
    "squiggle-t": `<svg viewBox="0 0 200 80"><path class="st st-t" stroke-width="12" d="M8 40C26 14 44 14 58 40S88 66 104 40 136 14 150 40 178 64 192 44"/></svg>`,
    "squiggle-y": `<svg viewBox="0 0 200 80"><path class="st st-y" stroke-width="14" d="M8 70C40 12 90 6 120 30S170 70 192 18"/></svg>`,
    curl: `<svg viewBox="0 0 120 80"><path class="st st-o" stroke-width="7" d="M6 60C30 60 34 20 58 22S74 56 58 58 46 34 70 26 108 34 114 50"/><path class="a-rose" d="M0 40 22 52 6 66Z"/></svg>`,
    diamond: `<svg viewBox="0 0 40 40"><rect class="a-w" x="6" y="6" width="28" height="28" rx="3" transform="rotate(45 20 20)"/><rect class="a-r" x="13" y="13" width="14" height="14" transform="rotate(45 20 20)"/></svg>`,
    dot: `<svg viewBox="0 0 40 40"><circle class="a-b" cx="20" cy="20" r="14"/></svg>`,
    stairs: `<svg viewBox="0 0 100 100"><path class="a-b" d="M10 80h26V56h26V32h26v48z"/><path class="a-y" d="M18 72h26V48h26V24h20v8H76v24H50v24H18z"/></svg>`,
    ring: `<svg viewBox="0 0 120 80"><rect class="st st-y" stroke-width="14" x="12" y="14" width="96" height="52" rx="26"/></svg>`,
    triangle: `<svg viewBox="0 0 120 110"><path class="st st-y" stroke-width="12" d="M14 96 60 14 106 96Z"/></svg>`,
    arch: `<svg viewBox="0 0 200 100"><path class="st st-g" stroke-width="14" d="M10 96C30 20 170 20 190 96"/></svg>`,
    cloud: `<svg viewBox="0 0 900 340" preserveAspectRatio="none"><path class="a-w" d="M80 220C10 220 0 130 70 112 60 50 140 20 200 54 230 6 330 0 370 40 420 -4 540 4 570 54 640 16 760 30 770 100 860 96 900 170 850 214 890 270 820 330 740 306 690 346 560 340 520 300 460 340 340 340 300 300 230 336 120 330 120 276 40 286 30 236 80 220Z"/></svg>`,
    "blob-y": `<svg viewBox="0 0 200 160" preserveAspectRatio="none"><path class="a-cream" d="M20 90C0 40 50 0 100 18S200 20 190 80 140 160 90 150 34 130 20 90Z"/></svg>`,
    "blob-m": `<svg viewBox="0 0 200 160" preserveAspectRatio="none"><path class="a-mint" d="M14 80C10 30 70 4 120 20S196 60 184 110 110 160 60 140 18 120 14 80Z"/></svg>`,
    "blob-p": `<svg viewBox="0 0 200 160" preserveAspectRatio="none"><path class="a-rose" d="M26 70C30 20 90 6 140 24S200 90 170 124 90 160 50 136 22 110 26 70Z"/></svg>`,
    "blob-yel": `<svg viewBox="0 0 200 180" preserveAspectRatio="none"><path class="a-y" d="M100 4 124 30 160 20 166 56 198 74 176 104 190 140 152 146 136 178 104 160 70 176 58 142 20 136 32 100 4 74 38 58 40 22 76 30Z"/></svg>`,
    plant: `<svg viewBox="0 0 160 140"><path class="a-y" d="M44 96h72l-10 40H54Z"/><path class="st st-t" stroke-width="5" d="M80 96V40M80 70 52 44M80 64l30-28"/>${["30 52 32", "80 34 56", "112 30 34"].map((s) => { const [x, y] = s.split(" "); return `<g transform="translate(${x - 50} ${y - 50}) scale(.42) translate(50 50)">${petals(6, 24, 14, 20, "a-p")}<circle class="a-o" cx="50" cy="50" r="12"/></g>`; }).join("")}</svg>`,
    "plant-b": `<svg viewBox="0 0 160 140"><path class="a-b" d="M52 92h56l-6 44H58Z"/><path class="st st-g" stroke-width="5" d="M80 92V30M80 60 54 40M80 52l26-22"/><g transform="translate(-6 -18) scale(.5) translate(110 50)">${petals(8, 26, 12, 19, "a-r")}<circle class="a-y" cx="50" cy="50" r="14"/></g></svg>`,
    "char-o": `<svg viewBox="0 0 120 160"><path class="a-o" d="M60 6C96 6 112 40 110 84S100 154 60 154 8 130 10 84 24 6 60 6Z"/>${face(60, 52, 1.4)}<path class="st st-o" stroke-width="9" d="M14 96 2 120M106 96l12 22"/><path class="a-t" d="M40 116h40v38H40Z"/></svg>`,
    "char-p": `<svg viewBox="0 0 140 150"><path class="a-rose" d="M70 10C110 10 128 44 124 80S100 140 64 138 14 116 16 78 30 10 70 10Z"/><path class="a-t" d="M30 30C40 2 100 0 112 24 90 18 54 18 30 30Z"/>${face(70, 66, 1.3)}<path class="st st-o" stroke-width="10" d="M40 132 20 148M98 128l22 18"/><text class="a-r" x="46" y="112" font-size="26" font-weight="900" font-family="inherit" transform="rotate(-12 70 104)">ON</text></svg>`,
    "char-t": `<svg viewBox="0 0 120 170"><path class="a-t" d="M60 30C84 30 90 70 96 110S112 164 60 164 6 150 22 110 36 30 60 30Z"/><path class="a-g" d="M60 30 48 6 60 16 72 2 70 30Z"/>${face(60, 76, 1.2)}<path class="st st-b" stroke-width="8" d="M30 108 4 94M92 104l24-12"/></svg>`,
    "char-y": `<svg viewBox="0 0 130 170"><path class="a-y" d="M30 40 40 6 56 34 74 4 84 36 104 14 100 52C116 80 116 130 96 160H36C14 130 14 80 30 40Z"/>${face(66, 78, 1.3)}<path class="st st-b" stroke-width="8" d="M20 110 4 88M110 108l16-22"/></svg>`,
    "char-r": `<svg viewBox="0 0 110 150"><path class="a-r" d="M55 20C82 20 96 50 96 90S84 146 55 146 14 130 14 90 28 20 55 20Z"/><circle class="a-b" cx="55" cy="14" r="10"/>${face(55, 70, 1.15)}</svg>`,
    "book-char": `<svg viewBox="0 0 120 130"><path class="a-t" d="M20 10h44v110H20Z"/><path class="a-k" d="M20 10h10v110H20Z"/><circle class="a-y" cx="76" cy="74" r="34"/>${face(78, 68, 1.1)}<path class="st st-b" stroke-width="7" d="M60 104 44 126M92 104l14 22"/></svg>`,
    mail: `<svg viewBox="0 0 18 12"><rect class="st st-k" stroke-width="1.6" x="1" y="1" width="16" height="10" rx="1"/><path class="st st-k" stroke-width="1.6" d="M1 1l8 6 8-6"/></svg>`,
    chat: `<svg viewBox="0 0 18 18"><rect class="a-g" x="0" y="0" width="18" height="18" rx="4"/><path class="a-w" d="M9 4C5 4 3 6.2 3 8.6 3 10.8 5 12.6 7.6 13l-.4 1.8L10 13C13 12.6 15 10.8 15 8.6 15 6.2 13 4 9 4Z"/></svg>`,
    "arrow-curl": `<svg viewBox="0 0 120 110"><path class="st st-w" stroke-width="7" d="M10 20C60 0 100 20 84 50S30 60 46 82 92 96 108 82"/><path class="st st-w" stroke-width="7" d="M94 70l16 12-18 10"/></svg>`,
    peek: `<svg viewBox="0 0 40 36"><path class="a-y" d="M4 36C4 18 12 8 20 8S36 18 36 36Z"/><path class="a-y" d="M8 14 6 2 14 10M32 14l2-12-8 8"/><circle class="a-k" cx="15" cy="22" r="2.4"/><circle class="a-k" cx="25" cy="22" r="2.4"/></svg>`
  };
  const fill = (root) => root.querySelectorAll("[data-art]").forEach((el) => { if (!el.firstElementChild && ART[el.dataset.art]) el.innerHTML = ART[el.dataset.art]; });
  fill(document);

  // Phone menu drawer — as in the original: the button’s active class goes on both the menu and body, and body is fixed
  const toggle = document.querySelector(".s-toggle");
  const nav = document.querySelector(".s-nav");
  if (toggle && nav) {
    const set = (on) => {
      toggle.classList.toggle("is-active", on);
      nav.classList.toggle("is-active", on);
      document.body.classList.toggle("is-fixed", on);
      toggle.setAttribute("aria-expanded", String(on));
    };
    toggle.addEventListener("click", () => set(!toggle.classList.contains("is-active")));
    nav.querySelectorAll('a[href^="#"]').forEach((a) => a.addEventListener("click", () => set(false)));
  }

  const $ = window.jQuery;
  if ($ && $.fn.slick) {
    // Original values as-is — Blog·News: 3 cards in the center column, one step per 1.5s every 3s, at 640 and below unrolled vertically
    $(".s-slick-3").slick({ centerMode: true, centerPadding: "10%", slidesToShow: 3, slidesToScroll: 1, autoplay: true, autoplaySpeed: 3000, speed: 1500, responsive: [{ breakpoint: 640, settings: "unslick" }] });
    // Photo and office slider: 2 slides in the center slot
    $(".s-slick-2").slick({ centerMode: true, centerPadding: "10%", slidesToShow: 2, slidesToScroll: 1, autoplay: true, autoplaySpeed: 3000, speed: 1500, responsive: [{ breakpoint: 640, settings: { centerMode: false, centerPadding: "10%", slidesToShow: 1 } }] });
    // Opening-page photo set — 2-slide slider only at 640 and below
    const creative = $(".s-slick-sp");
    const sp = () => {
      if (innerWidth <= 640 && !creative.hasClass("slick-initialized")) creative.slick({ centerMode: false, slidesToShow: 2, autoplay: true, autoplaySpeed: 3000, speed: 1500 });
      else if (innerWidth > 640 && creative.hasClass("slick-initialized")) creative.slick("unslick");
    };
    if (creative.length) { sp(); addEventListener("resize", sp); }
  }

  // On phone, the service band text panel appears with a dark scrim when it comes within 200px of the screen bottom
  const ops = document.querySelectorAll(".s-banner__op");
  if (ops.length && "IntersectionObserver" in window) {
    const io = new IntersectionObserver((es) => es.forEach((e) => e.target.classList.toggle("is-bg", e.isIntersecting)), { rootMargin: "0px 0px -200px 0px", threshold: 0 });
    ops.forEach((o) => io.observe(o));
  }

  // Select — original scripts.js: click slides the list down, click again or outside slides it up
  if ($) {
    $(".s-select__btn").on("click", (e) => {
      e.stopPropagation();
      const btn = $(e.currentTarget), nest = btn.closest(".s-select").find(".s-select__nest").first();
      const open = !nest.hasClass("is-active");
      btn.toggleClass("is-active", open).attr("aria-expanded", String(open));
      nest.toggleClass("is-active", open).stop(true, true)[open ? "slideDown" : "slideUp"]();
    });
    $(document).on("click", (e) => {
      if (!$(e.target).closest(".s-select__btn, .s-select__nest").length) {
        $(".s-select__btn").removeClass("is-active").attr("aria-expanded", "false");
        $(".s-select__nest.is-active").removeClass("is-active").slideUp();
      }
    });
  }

  if (window.WOW) new WOW().init();
})();
