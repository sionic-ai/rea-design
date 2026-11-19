/* Home: library and values exactly as in the original pagepiling.js · scripts.js: 
   pagePiling 1.5.6 (six sections, dot list on the right, section 6 scrolls inside) · section 1 four-cell Swiper 10 (loop · autoplay 1s · speed 3s)
   · section 5 band infiniteslide v2 (50·75px per second) · section 6 Splide 4.1.3 (loop · 3s · 1s ease-in-out · sides 30% · 40px) · section 6 questions jQuery slideToggle */
// infiniteslidev2 attaches to $.fn inside jQuery ready, so hook them in order after that
jQuery(() => {
  const $ = window.jQuery;
  const bear = window.bbBear;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // 5-sheet bear group — original slide_home01·03·05·07·09: per row cell widths 5·10·15·20·25%, bear poses mixed, some swell, nod or spin
  const POSES = [
    ["bb-full", "bb--pink", ""], ["bb-box", "bb--orange", "wave"], ["bb-full", "bb--green", "purun"], ["bb-full", "bb--navy", ""],
    ["bb-box", "bb--pink", ""], ["bb-full", "bb--orange", "spin"], ["bb-full", "bb--green", ""], ["bb-box", "bb--navy", "purun"],
    ["bb-full", "bb--orange", ""], ["bb-full", "bb--pink", "wave"], ["bb-box", "bb--green", ""], ["bb-full", "bb--navy", ""],
  ];
  document.querySelectorAll(".sc5-list").forEach((ul, r) => {
    ul.innerHTML = POSES.map((p, i) => {
      const [sym, mod, look] = POSES[(i + r * 5) % POSES.length];
      const fx = look === "spin" ? ' class="sc5-spin"' : look ? ` data-fx="sticker-wiggle" data-fx-sticker-wiggle="look: ${look}"${look === "wave" ? ' style="--fx-dur:1.9s;--fx-origin:center bottom"' : ""}` : "";
      return `<li><span${fx}>${bear(sym, mod)}</span></li>`;
    }).join("");
  });
  // Section 6 closing walking bear strip — original slide_home010·011·012
  document.querySelectorAll(".sc6-walk").forEach((el) => {
    el.outerHTML = window.bbStrip("sc6-strip", el.dataset.strip.split(" "), 8);
  });

  // Section 1 four cells — original scripts.js swiper1 (delay 1000 · speed 3000 · one at a time)
  document.querySelectorAll(".hero-col .swiper").forEach((el) => {
    new Swiper(el, { loop: true, autoplay: reduce ? false : { delay: 1000, disableOnInteraction: false }, speed: 3000, slidesPerView: 1, spaceBetween: 0, grabCursor: false, allowTouchMove: false });
  });

  // Section 6 first-timers — values straight from the original Splide
  if (document.getElementById("voice-splide")) {
    new Splide("#voice-splide", { type: "loop", autoplay: !reduce, interval: 3000, perPage: 1, perMove: 1, speed: 1000, easing: "ease-in-out", padding: "30%", gap: 40, pauseOnHover: true, pauseOnFocus: true, pagination: false,
      breakpoints: { 991: { padding: "8%", gap: 16 } } }).mount();
  }

  // Section 6 questions — original: clicking the title slideToggles the answer right below (400ms swing), opening adds closed to the title. The first question slideDown(500) after load
  $(".qa-title").on("click", function () {
    $(this).next(".qa-box").stop(true).slideToggle(reduce ? 0 : 400);
    $(this).toggleClass("closed");
  });
  const firstOpen = () => {
    const first = $(".qa-list li:first-of-type .qa-title");
    first.addClass("closed");
    first.next(".qa-box").slideDown(reduce ? 0 : 500);
  };
  if (document.readyState === "complete") firstOpen(); else addEventListener("load", firstOpen);

  // Group of 5 — infiniteslide at the original speed per row
  $(".sc5-list").each(function () { $(this).infiniteslide({ speed: Number(this.dataset.speed), responsive: true, pauseonhover: false }); });

  // Section snapping — original pagepiling options as is (section names page1…6, dots on the right). The transition curve is the library css .pp-easing (1000ms cubic-bezier(.55,.085,0,.99))
  const syncScrollable = () => {
    const s1 = document.getElementById("section1");
    s1.classList.toggle("pp-scrollable", innerWidth <= 990);
  };
  syncScrollable();
  const kf = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  $("#pagepiling").pagepiling({
    anchors: ["page1", "page2", "page3", "page4", "page5", "page6"],
    navigation: { textColor: kf("--kf-surface"), bulletsColor: kf("--kf-ink"), position: "right", tooltips: [] },
  });
  addEventListener("resize", syncScrollable);

  // The Contact and Meeting rings in header and Footer — after moving to section 6, lowered to that spot inside section 6
  const s6 = document.getElementById("section6");
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href="#bh-contact"], a[href="#bh-fee"]');
    if (!a) return;
    e.preventDefault();
    const target = document.querySelector(a.getAttribute("href"));
    $.fn.pagepiling.moveTo(6);
    setTimeout(() => s6.scrollTo({ top: target.offsetTop - 10, behavior: reduce ? "auto" : "smooth" }), 750);
  });

  // Original backToTopInSection6 — shows after scrolling more than 200px inside section 6, and pressing it goes to the top of section 6
  const top = document.querySelector(".bh-totop");
  s6.addEventListener("scroll", () => top.classList.toggle("is-on", s6.scrollTop > 200), { passive: true });
  top.addEventListener("click", () => s6.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }));
});
