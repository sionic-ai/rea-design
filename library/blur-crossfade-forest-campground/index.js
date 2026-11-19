// First page — background video fade-out, growth-ring and sound-wave drawings, photo pile reordering, video row Swiper
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Tree rings — stands in for the original image (top_concept_wood). Eighteen slightly warped concentric rings and one crack
  const rings = document.querySelector("[data-fc-rings]");
  if (rings) {
    let s = 7;
    const r = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
    let d = "";
    for (let k = 1; k <= 18; k++) {
      const R = k * 10.5, pts = [];
      for (let a = 0; a < 48; a++) { const t = (a / 48) * Math.PI * 2, w = R * (1 + (r() - 0.5) * 0.04); pts.push(`${(200 + Math.cos(t) * w).toFixed(1)} ${(200 + Math.sin(t) * w).toFixed(1)}`); }
      d += `M${pts.join("L")}Z`;
    }
    rings.innerHTML = `<path d="${d}" stroke-width="1"/><path d="M200 200 330 120" stroke-width="2"/>`;
  }
  // Sound wave — dark bar strip at the head of the reservation section (original #p-top-reserve__form)
  const wf = document.querySelector("[data-fc-waveform]");
  if (wf) wf.innerHTML = Array.from({ length: 60 }, (_, i) => { const h = 8 + Math.abs(Math.sin(i * 0.55) * Math.cos(i * 0.21)) * 52; return `<rect x="${i * 8}" y="${(62 - h) / 2}" width="4" height="${h.toFixed(1)}" rx="2"/>`; }).join("");

  // Hero video behind — fades out from when the concept section touches the bottom of the screen until it leaves off the top (original .js-video autoAlpha 1 → 0, default curve)
  gsap.registerPlugin(ScrollTrigger);
  gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
    gsap.set(".hv__video", { autoAlpha: 1 });
    gsap.to(".hv__video", { autoAlpha: 0, scrollTrigger: { toggleActions: "play none none reverse", trigger: ".cn", start: "top bottom", end: "bottom top", scrub: true } });
  });

  // Photo stacks — every 3 seconds, one stack at a time in order (stay three · experience two) moves to its next photo (opacity 1s ease-in-out)
  const cycle = (ids) => {
    const groups = ids.map((id) => document.querySelector(`[data-fc-group="${id}"]`)).filter(Boolean);
    if (!groups.length) return;
    const at = groups.map(() => 0);
    groups.forEach((g) => { const li = g.querySelectorAll("li"); li.forEach((l, i) => { l.style.opacity = i ? 0 : 1; }); });
    let cur = 0;
    setInterval(() => {
      const li = groups[cur].querySelectorAll("li");
      if (li.length > 1) { const nx = (at[cur] + 1) % li.length; li[at[cur]].style.opacity = 0; li[nx].style.opacity = 1; at[cur] = nx; }
      cur = (cur + 1) % groups.length;
    }, 3000);
  };
  if (!reduce) { cycle(["1", "2", "3"]); cycle(["4", "5"]); }

  // Video row — original Swiper 11 settings as is (1.4 slides → 2.5 slides above 428px · 56px gap · centered · loop · .4s)
  new Swiper(".mv__slide", {
    slidesPerView: 1.4, centeredSlides: true, spaceBetween: 0, speed: 400, loop: true,
    navigation: { nextEl: ".mv__next", prevEl: ".mv__prev" },
    pagination: { el: ".mv__dots", clickable: true },
    breakpoints: { 428: { spaceBetween: 56, slidesPerView: 2.5 } },
  });
})();
