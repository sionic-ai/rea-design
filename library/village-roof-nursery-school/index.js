// First page: first-visit veil (town art approaches over 4s · 3.5s slogan · fades out over 2.5s at 6.5s, cookie 3 hours), hero Swiper fade (3s·5s) and 8s pullback,
// About·feature photo Swiper, voices ”Read all”, phone admission table collapse
(() => {
  const $ = window.jQuery;
  const { reduce } = OM;

  // ---------- Village art (spot of the original fv_mv illustration) — a winding road between forest slopes, red tile roofs along the road, a row of blue-hat children, clouds in the corner ----------
  const mv = document.querySelector(".om-fv__mv");
  if (mv) {
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const road = (t) => [720 + Math.sin(t * 3.2) * 170 - t * 60, -40 + t * 980];
    const houses = [];
    for (let i = 0; i < 46; i++) {
      const t = i / 46, [rx, ry] = road(t), side = i % 2 ? 1 : -1;
      const x = rx + side * (70 + rnd() * 90), y = ry + (rnd() - 0.5) * 30, w = 70 + rnd() * 50, h = 40 + rnd() * 18;
      houses.push(`<g transform="translate(${x.toFixed(0)} ${y.toFixed(0)}) rotate(${(-12 + rnd() * 10).toFixed(1)})"><rect class="k-wall" x="${(-w / 2).toFixed(0)}" y="0" width="${w.toFixed(0)}" height="${(h * 0.5).toFixed(0)}"/><path class="${rnd() > 0.3 ? "k-roof" : "k-roof-dark"}" d="M${(-w / 2 - 8).toFixed(0)} 2L${(-w / 4).toFixed(0)} ${(-h * 0.7).toFixed(0)}H${(w / 4).toFixed(0)}L${(w / 2 + 8).toFixed(0)} 2Z"/></g>`);
    }
    const trees = Array.from({ length: 60 }, () => {
      const x = rnd() * 1440, y = rnd() * 900, r = 30 + rnd() * 50;
      return `<circle class="${rnd() > 0.5 ? "k-leaf" : "k-forest"}" cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${r.toFixed(0)}"/>`;
    });
    const kids = Array.from({ length: 14 }, (_, i) => { const [x, y] = road(0.55 + i * 0.012); return `<circle class="k-kid" cx="${(x + 12).toFixed(0)}" cy="${y.toFixed(0)}" r="5"/>`; });
    const pts = Array.from({ length: 21 }, (_, i) => road(i / 20).map((n) => n.toFixed(0)).join(" ")).join(" L");
    const cloud = (x, y, s) => `<g class="k-cloud" transform="translate(${x} ${y}) scale(${s})"><circle cx="0" cy="0" r="60"/><circle cx="70" cy="-20" r="75"/><circle cx="150" cy="5" r="58"/><circle cx="80" cy="35" r="60"/></g>`;
    mv.innerHTML = `<svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect class="k-forest-deep" width="1440" height="900"/>${trees.join("")}
      <path class="k-road" d="M${pts}" stroke-width="70"/>${houses.join("")}${kids.join("")}
      ${cloud(-40, 40, 1.1)}${cloud(1240, 20, 1)}${cloud(-80, 820, 1.2)}${cloud(1260, 840, 1.1)}</svg>`;
  }

  // ---------- Hand-drawn village around the intro text — doodles scattered at both sides + six line houses below ----------
  const town = document.querySelector(".om-intro__town");
  if (town) {
    let s2 = 11;
    const r2 = () => ((s2 = (s2 * 16807) % 2147483647) / 2147483647);
    const keys = ["bird", "star", "leaf", "flower", "swirl", "sun", "cup", "ball"];
    const bits = [];
    for (let i = 0; i < 18; i++) {
      const left = i % 2 === 0, x = left ? 40 + r2() * 260 : 1066 + r2() * 260, y = 200 + r2() * 300, w = 26 + r2() * 30;
      bits.push(`<i style="left:${x.toFixed(0)}px;top:${y.toFixed(0)}px;width:${w.toFixed(0)}px;transform:rotate(${(r2() * 40 - 20).toFixed(0)}deg)">${OM.doodle(keys[i % keys.length])}</i>`);
    }
    const house = (x, w, h) => `<path d="M${x} 520V${520 - h}l${w / 2} -${h * 0.45} ${w / 2} ${h * 0.45}V520M${x + w * 0.2} ${520 - h * 0.6}h${w * 0.18}v${h * 0.25}h-${w * 0.18}zM${x + w * 0.6} ${520 - h * 0.6}h${w * 0.18}v${h * 0.25}h-${w * 0.18}zM${x - 8} ${520 - h}h${w + 16}"/>`;
    bits.push(`<i style="left:0;top:0;width:1366px"><svg viewBox="0 0 1366 902">${[[140, 150, 70], [400, 110, 60], [560, 150, 80], [800, 230, 70], [1090, 160, 60], [1260, 90, 55]].map((a) => house(...a)).join("")}</svg></i>`);
    town.innerHTML = bits.join("");
  }

  // ---------- First-visit curtain ----------
  const body = document.body;
  const step = () => { body.classList.add("in"); if ($ && !reduce) $(".om-fv").fadeOut(2500); else $(".om-fv").hide(); };
  const stepCookie = () => { body.classList.add("in"); $(".om-fv").hide(); };
  const heroSwiper = () => new Swiper(".om-hero", { effect: "fade", loop: true, speed: 3000, autoplay: { delay: 5000, disableOnInteraction: false } });
  const in12 = () => body.classList.add("in1", "in2");
  // Like the original, hang the clock after the DOM is ready ($(function))
  $(() => {
  if (reduce) {
    stepCookie(); in12(); body.classList.remove("fv");
  } else if ($.cookie("access") == undefined) {
    const date = new Date();
    date.setTime(date.getTime() + 3 * 60 * 60 * 1000);
    $.cookie("access", "3hour", { expires: date });
    setTimeout(step, 6500);
    setTimeout(heroSwiper, 6500);
    setTimeout(in12, 8500);
  } else {
    setTimeout(stepCookie, 0);
    setTimeout(heroSwiper, 0);
    setTimeout(in12, 2500);
  }
  });

  // ---------- Photo Swiper — attach the original after load ----------
  addEventListener("load", () => {
    new Swiper(".swiper1", { effect: "fade", loop: true, speed: 3000, spaceBetween: 0, autoplay: reduce ? false : { delay: 4000 } });
    document.querySelectorAll(".om-feature-swiper").forEach((el) => new Swiper(el, {
      effect: "fade", loop: true, speed: 3000, spaceBetween: 0, autoplay: reduce ? false : { delay: 2000 },
      pagination: { el: el.querySelector(".swiper-pagination"), type: "bullets", clickable: true },
    }));
  });

  // Hide the down arrow after scrolling past 200px
  addEventListener("scroll", () => { if (scrollY > 200) $(".om-next").fadeOut(); }, { passive: true });

  // ---------- Voices ”Read All” — body height 50 → 500px .6s ----------
  document.querySelectorAll(".om-voice-item__open").forEach((b) => b.addEventListener("click", () => {
    const on = b.classList.toggle("act");
    b.textContent = on ? "Fold" : "Read all";
    b.previousElementSibling.classList.toggle("act", on);
  }));

  // ---------- Phone admission table — pressing an item name folds and unfolds its content ----------
  $(".om-info-box dt").on("click", function () {
    if (innerWidth > 1000) return;
    $(this).toggleClass("act").next().slideToggle();
  });
})();
