// Motion shared by all pages: original inline script values:
// Handwritten copy vivus (oneByOne · 150 frames · EASE_OUT), wave band x −600 (phone −300) scrub (section top bottom → top top),
// .scroll_active becomes active once when it reaches top 65%, the header line shrinks when scrolling down past 1280px (header-sm) and turns white (bg-wh) after passing the header height,
// Yellow blob slider slick (5s · 1s · arrows · dots), confetti and wave graphics are our own SVG·CSS.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const root = document.documentElement;
  if (!("ontouchstart" in window) && !navigator.maxTouchPoints) root.classList.add("notouch");
  const rnd = (seed) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

  // Handwriting line — joins loops and flicks per letter to make a brush-written line (stands in for the original handwriting illustration, no text content)
  const handPath = (chars, x0, y0, size, seed) => {
    const r = rnd(seed); let paths = [];
    for (let i = 0; i < chars; i++) {
      const x = x0 + i * size * 1.05, y = y0 + (r() - 0.5) * size * 0.15, s = size * (0.85 + r() * 0.25);
      const k = Math.floor(r() * 4);
      if (k === 0) paths.push(`M${x} ${y + s * 0.2} q${s * 0.5} ${-s * 0.25} ${s * 0.8} 0 M${x + s * 0.4} ${y - s * 0.2} q${-s * 0.1} ${s * 0.6} ${s * 0.05} ${s * 0.9} q${s * 0.2} ${-s * 0.1} ${s * 0.35} ${-s * 0.35}`);
      else if (k === 1) paths.push(`M${x + s * 0.1} ${y} c${s * 0.3} ${-s * 0.3} ${s * 0.7} ${-s * 0.1} ${s * 0.5} ${s * 0.3} s${-s * 0.6} ${s * 0.5} ${-s * 0.3} ${s * 0.6} M${x + s * 0.7} ${y - s * 0.25} l${s * 0.1} ${s * 0.2}`);
      else if (k === 2) paths.push(`M${x} ${y + s * 0.5} q${s * 0.2} ${-s * 0.8} ${s * 0.45} ${-s * 0.6} t${s * 0.4} ${s * 0.7} M${x + s * 0.15} ${y + s * 0.1} h${s * 0.6}`);
      else paths.push(`M${x + s * 0.5} ${y - s * 0.25} q${-s * 0.5} ${s * 0.3} ${-s * 0.25} ${s * 0.7} q${s * 0.4} ${s * 0.2} ${s * 0.6} ${-s * 0.15} q${-s * 0.15} ${-s * 0.3} ${-s * 0.45} ${-s * 0.05}`);
    }
    return paths;
  };
  // data-hand="7,6" → Two lines (7 chars · 6 chars) handwriting stroke + closing period
  const paintHand = (el) => {
    const lines = (el.dataset.hand || "6").split(",").map(Number);
    const size = 60, w = Math.max(...lines) * size * 1.05 + 40, h = lines.length * size * 1.5 + 20;
    let d = []; lines.forEach((n, i) => { d = d.concat(handPath(n, 20 + i * size * 0.9, 50 + i * size * 1.45, size, 7 + i * 13)); });
    d.push(`M${20 + lines[lines.length - 1] * size * 1.05 + size} ${h - 30} a6 6 0 1 0 0.1 0`);
    el.innerHTML = `<svg class="ac-hand" viewBox="0 0 ${w + size} ${h}" aria-hidden="true">${d.map((p) => `<path d="${p}"/>`).join("")}</svg>`;
    return el.firstChild;
  };
  window.acVivus = (el, start = "manual") => {
    const svg = el.querySelector("svg") || paintHand(el);
    if (reduce || !window.Vivus) return { play() {} };
    return new Vivus(svg, { type: "oneByOne", duration: 150, animTimingFunction: Vivus.EASE_OUT, start });
  };

  // Confetti — data-confetti="Count" Scatters yellow, blue, orange, green and pink pieces across the panel
  const paintConfetti = (el) => {
    const n = +el.dataset.confetti || 14, r = rnd(n * 31 + el.className.length);
    const kinds = ["cf-r", "cf-c", "cf-a", "cf-t"];
    let html = "";
    for (let i = 0; i < n; i++) html += `<i class="cf ${kinds[Math.floor(r() * 4)]} c${1 + Math.floor(r() * 5)}" style="left:${(r() * 96).toFixed(1)}%;top:${(r() * 92).toFixed(1)}%;rotate:${Math.round(r() * 360)}deg"></i>`;
    el.insertAdjacentHTML("beforeend", html);
  };
  // Wave band — lays a wave in the section’s background color along the section’s top edge
  const WAVE = '<svg viewBox="0 0 2400 24" preserveAspectRatio="none" aria-hidden="true"><path d="' +
    Array.from({ length: 41 }, (_, i) => (i === 0 ? "M0 24 L0 12" : "") + ` Q${i * 60 + 30} ${i % 2 ? 0 : 24} ${i * 60 + 60} 12`).join("") + ' L2460 24 Z"/></svg>';

  const SNS = {
    facebook: "M13.5 20v-8h2.7l.4-3.2h-3.1V6.9c0-.9.3-1.5 1.6-1.5h1.7V2.6c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.4-4 4.1v2.3H7.6V12h2.8v8z",
    instagram: "M10 2a8 8 0 1 0 .01 0zM10 5.5a4.5 4.5 0 1 1-.01 0zm0 2a2.5 2.5 0 1 0 .01 0zM15 3.5a1 1 0 1 0 .01 0z",
    x: "M3 3h4l3.5 5 4-5h2l-5.1 6.3L18 17h-4l-3.8-5.4L5.8 17H3.8l5.5-6.6z",
    youtube: "M19.6 6.2a2.5 2.5 0 0 0-1.8-1.8C16.2 4 10 4 10 4s-6.2 0-7.8.4A2.5 2.5 0 0 0 .4 6.2C0 7.8 0 10 0 10s0 2.2.4 3.8a2.5 2.5 0 0 0 1.8 1.8C3.8 16 10 16 10 16s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8c.4-1.6.4-3.8.4-3.8s0-2.2-.4-3.8zM8 12.5v-5l5.2 2.5z",
  };

  let resolveReady; window.acReady = new Promise((r) => (resolveReady = r));

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-confetti]").forEach(paintConfetti);
    document.querySelectorAll(".wave_wrapper").forEach((w) => (w.innerHTML = WAVE));
    document.querySelectorAll("[data-sns]").forEach((el) => {
      el.innerHTML = Object.keys(SNS).map((k) => `<a href="#" aria-label="${k}"></a>`).join("");
      el.querySelectorAll("a").forEach((a) => a.style.setProperty("--icon", `url("data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'><path d='${SNS[a.getAttribute("aria-label")]}'/></svg>`)}")`));
    });
    document.querySelectorAll("[data-hand]").forEach(paintHand);

    // Header bar — only above 1280px: shrinks while scrolling down, white background once past the header height
    const head = document.querySelector(".ac-head");
    if (head && innerWidth > 1280) {
      const hh = head.offsetHeight; let prev = scrollY;
      addEventListener("scroll", () => {
        const cur = scrollY;
        head.classList.toggle("bg-wh", prev > hh);
        head.classList.toggle("is-sm", cur > prev);
        prev = cur;
      }, { passive: true });
    }
    const burger = document.querySelector(".ac-burger");
    burger?.addEventListener("click", () => burger.setAttribute("aria-expanded", root.classList.toggle("is-drawer")));

    // Yellow blotch slider — slick 5s · 1s · arrows · dots
    if (window.jQuery && jQuery.fn.slick) {
      jQuery(".sec_tax--slider").slick({
        autoplay: !reduce, autoplaySpeed: 5000, adaptiveHeight: true, speed: 1000, arrows: true, dots: true,
        prevArrow: '<button class="slick-prev" type="button" aria-label="Previous"></button>', nextArrow: '<button class="slick-next" type="button" aria-label="Next"></button>',
        pauseOnFocus: false, pauseOnHover: false,
      });
    }

    // Handwritten copy photo strip — when the text box becomes active, white handwriting is drawn
    document.querySelectorAll(".sec_img--txtarea").forEach((box) => {
      const v = window.acVivus(box.querySelector("[data-hand]"));
      new MutationObserver(() => box.classList.contains("active") && v.play()).observe(box, { attributes: true, attributeFilter: ["class"] });
    });

    // The page’s pinned scenes (pin) must be set first for the start positions of the sections below to be right — hooked one frame later
    if (window.gsap && window.ScrollTrigger) requestAnimationFrame(() => {
      gsap.registerPlugin(ScrollTrigger);
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.utils.toArray(".scroll_active").forEach((el) => ScrollTrigger.create({ trigger: el, start: "top 65%", toggleClass: { targets: el, className: "active" }, once: true }));
        gsap.utils.toArray(".wave_wrapper").forEach((w) => {
          const parent = w.closest(".lps_sec-wave");
          gsap.timeline({ scrollTrigger: { trigger: parent, start: "top bottom", end: "top top", scrub: true } }).to(w, { x: innerWidth > 767 ? -600 : -300, ease: "none" });
        });
      });
      mm.add("(prefers-reduced-motion: reduce)", () => document.querySelectorAll(".scroll_active").forEach((el) => el.classList.add("active")));
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
    });
    resolveReady();
  });
})();
