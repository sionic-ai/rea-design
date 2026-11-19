// Home page — original top.js Swiper (3 slides centered · loop · 1s · 5s autoplay) and the initial sequence (.5s guide circle · .8s slider · 1·1.4·1.8s circles · 2s autoplay start),
// On each flip, spin the dot ring, hide it, then restore it, and draw the image spots (dot frame, dot arch, night crowd, dot arc) as SVG
(() => {
  const NS = (n) => n.toFixed(1);
  // Dot ring around the circular photo (where the original mainslide_dot2.svg goes) — thirty-six dots that swell and shrink
  document.querySelectorAll(".ks-kv__dot").forEach((svg) => {
    svg.innerHTML = Array.from({ length: 36 }, (_, k) => {
      const a = (k / 36) * Math.PI * 2, r = 47;
      return `<circle class="ks-dot" cx="${NS(50 + Math.cos(a) * r)}" cy="${NS(50 + Math.sin(a) * r)}" r="${NS(0.7 + (k % 5) * 0.35)}"/>`;
    }).join("");
  });
  // Film strip over the date shield (spot for the original icon_film.svg)
  document.querySelectorAll(".ks-date__icon").forEach((svg) => {
    svg.innerHTML = '<g class="ks-film-icon"><path d="M14 30 26 6l14 6-12 24z"/><path d="M44 32 54 8l16 6-10 22z"/><rect x="4" y="34" width="82" height="3"/></g>';
  });
  // Card header dot arch (stands in for original event_head_bg.png) — five rows of dots curving upward
  const arch = document.querySelector(".ks-event__arch");
  if (arch) {
    let dots = "";
    for (let row = 0; row < 5; row++) for (let k = 0; k <= 46; k++) {
      const x = 8 + k * 12.7, t = (x - 300) / 300, y = 18 + row * 16 + t * t * 70;
      if (Math.abs(x - 300) < 90 && row > 0) continue;
      dots += `<circle class="ks-dot ks-dot--${(k + row) % 3}" cx="${NS(x)}" cy="${NS(y)}" r="${NS(2.2 + ((k * 7 + row) % 4) * 0.8)}"/>`;
    }
    arch.innerHTML = dots;
  }
  // Dotted line above info table
  const line = document.querySelector(".ks-event__dots");
  if (line) line.innerHTML = Array.from({ length: 3 }, (_, k) => `<circle class="ks-dot ks-dot--1" cx="${190 + k * 10}" cy="5" r="2"/>`).join("");
  // Event section background (where the original event_bg.png goes) — a night mountain ridge and below it the heads of the crowd gathered in front of the screen, yellow lanterns on both sides
  const bg = document.querySelector(".ks-event__bg");
  if (bg) {
    let s = 1;
    const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    let crowd = "";
    for (let k = 0; k < 1300; k++) {
      const x = rnd() * 1200, y = 560 + rnd() * 940;
      crowd += `<ellipse class="ks-crowd ks-crowd--${k % 5}" cx="${NS(x)}" cy="${NS(y)}" rx="${NS(9 + rnd() * 9)}" ry="${NS(10 + rnd() * 9)}"/>`;
    }
    bg.innerHTML = `<path class="ks-ridge" d="M0 470c160-60 260-140 420-110s240 120 380 80 260-130 400-90V1500H0Z"/>
      <rect class="ks-screen" x="40" y="520" width="280" height="170" rx="8"/>${crowd}
      <circle class="ks-lamp" cx="150" cy="210" r="34"/><circle class="ks-lamp" cx="1080" cy="420" r="30"/>`;
    bg.setAttribute("data-label", "Night outdoor screening illustration · white screen under a mountain ridge and the heads of the crowd · lanterns on both sides");
  }
  // Dot arc at the top right of the message (where the original concept_dot.png sat) — an arc drawn with dots that grow in size
  const arc = document.querySelector(".ks-concept__arc");
  if (arc) {
    let d = "";
    for (let k = 0; k < 64; k++) {
      const a = Math.PI * (0.55 + (k / 64) * 1.25), r = 230 + (k % 3) * 14;
      d += `<circle class="ks-dot ks-dot--${k % 3}" cx="${NS(270 + Math.cos(a) * r)}" cy="${NS(300 + Math.sin(a) * r)}" r="${NS(2 + (k % 4) * 1.6)}"/>`;
    }
    arc.innerHTML = d;
  }

  // Swiper — exactly as the original: loop · speed 1000 · 3 slides · centered · gap 0 · autoplay 5s (paused at first)
  const ring = document.querySelector(".ks-kv__bg");
  const kv = document.querySelector(".ks-kv");
  if (!window.Swiper || !kv) return;
  const swiper = new Swiper(".ks-kv .swiper-container", {
    loop: true, speed: 1000, slidesPerView: 3, centeredSlides: true, spaceBetween: 0, autoplay: { delay: 5000 },
    on: { slideChangeTransitionStart: () => ring?.dispatchEvent(new Event("fx:swap")) },
  });
  swiper.autoplay.stop();
  // The original too: the ‹Front› button goes to next and the ‹Back› button goes to previous (opposite of the names)
  kv.querySelector(".ks-kv__arrow--prev")?.addEventListener("click", () => swiper.slideNext());
  kv.querySelector(".ks-kv__arrow--next")?.addEventListener("click", () => swiper.slidePrev());
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const pick = (c) => kv.querySelector(`.ks-kv__slider .swiper-slide-${c}`);
  const main = kv.querySelector(".ks-kv__main"), slider = kv.querySelector(".ks-kv__slider");
  if (reduce) { main.classList.add("is-active"); slider.classList.add("is-active"); return; }
  ["active", "next", "prev"].forEach((c) => pick(c)?.classList.add("is-hidden"));
  setTimeout(() => main.classList.add("is-active"), 500);
  setTimeout(() => slider.classList.add("is-active"), 800);
  setTimeout(() => pick("active")?.classList.remove("is-hidden"), 1000);
  setTimeout(() => pick("prev")?.classList.remove("is-hidden"), 1400);
  setTimeout(() => pick("next")?.classList.remove("is-hidden"), 1800);
  setTimeout(() => swiper.autoplay.start(), 2000);
})();
