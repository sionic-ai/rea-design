// Home motion — values from the original behavior.js: hero Splide fade (5s interval · 2s overlap), work scene strip (30s per loop · ±80px parallax), hashtag strip duplication.
(() => {
  const { reduced } = window.AC;

  // Hero: same Splide 4.1.2 fade as the original (5s interval · 2s overlap · default curve cubic-bezier(.25,1,.5,1)). The number underline is drawn by CSS over 5s.
  const hero = document.querySelector(".hero__splide");
  if (hero && window.Splide) {
    new Splide(hero, {
      type: "fade", rewind: true, autoplay: true, arrows: false,
      pauseOnHover: false, pauseOnFocus: false, interval: 5000, speed: 2000,
    }).mount();
  }

  // Hashtag band: attach a second copy of the same chips and run it to -50% so the seam is invisible
  document.querySelectorAll(".tags__row").forEach((row) => {
    const track = document.createElement("div");
    track.className = "tags__track";
    const items = [...row.querySelectorAll(".ac-chip")];
    items.forEach((a) => track.append(a));
    items.forEach((a) => {
      const c = a.cloneNode(true);
      c.setAttribute("aria-hidden", "true");
      c.tabIndex = -1;
      track.append(c);
    });
    row.append(track);
  });

  // Work scene strip: stretched to three copies and rewinds after flowing one copy’s width. Photos are pushed staggered from the screen’s right edge +80 → left edge -80.
  const slider = document.querySelector(".concept__slider");
  if (slider) {
    const items = [...slider.querySelectorAll(":scope > .concept__item")];
    const track = document.createElement("div");
    track.className = "concept__track";
    items.forEach((it) => track.append(it));
    for (let k = 0; k < 2; k++) items.forEach((it) => track.append(it.cloneNode(true)));
    slider.append(track);

    const all = [...track.children];
    let trackW = 0;
    let offsets = [];
    let viewW = 0;
    const measure = () => {
      const gap = parseFloat(getComputedStyle(track).columnGap) || 30;
      trackW = items.reduce((w, it) => w + it.offsetWidth + gap, 0);
      offsets = all.map((it) => it.offsetLeft);
      viewW = slider.offsetWidth;
    };
    measure();
    addEventListener("resize", measure);

    const RANGE = 80;
    const DURATION = 30;
    let x = 0;
    let last = 0;
    const tick = (now) => {
      const dt = last ? (now - last) / 1000 : 0;
      last = now;
      x -= (trackW / DURATION) * dt;
      if (x <= -trackW) x += trackW;
      track.style.transform = `translate3d(${x}px,0,0)`;
      all.forEach((it, i) => {
        const w = it.offsetWidth;
        const p = Math.max(0, Math.min(1, (viewW - (x + offsets[i])) / (viewW + w)));
        it.firstElementChild.style.translate = `${RANGE - p * RANGE * 2}px 0`;
      });
      requestAnimationFrame(tick);
    };
    if (!reduced) requestAnimationFrame(tick);
  }

  if (!window.gsap) return;
  window.AC.mm.add("(prefers-reduced-motion: no-preference)", () => {
    document.querySelectorAll(".js-parallax-post > .wf-img").forEach((img) => {
      gsap.fromTo(img, { yPercent: -5, scale: 1.15 }, {
        yPercent: 5, scale: 1.05, ease: "none",
        scrollTrigger: { trigger: img.parentElement, start: "top top", end: "bottom top", scrub: 1 },
      });
    });
  });
})();
