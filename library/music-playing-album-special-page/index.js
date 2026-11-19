// Single page — choosing a door opens the first screen in the original order (door text .2s → door .1s → picture .6s → Lottie plays → date .7s → title in three layers of letters at .008 spacing → bar .2s).
// The photo collection section stays pinned to the screen and advances Lottie frames by scroll over 4000px (phone 2000), and the first video becomes a small window at the bottom right once it has passed.
// This file runs before the part (fx-core) — the pin must be set first so that the text reveal positions that follow are offset by the pin length
(() => {
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const narrow = matchMedia("(max-width: 1023px)").matches;
  gsap.registerPlugin(ScrollTrigger);

  // Three title layers — split into letters (a space becomes a 12px gap)
  $$(".hx-kv__name").forEach((h) => { h.innerHTML = [...h.textContent].map((c) => (c === " " ? '<span class="is-gap"> </span>' : `<span>${c}</span>`)).join(""); });
  const kvLots = $$(".hx-kv__lot").map((el) => window.hxLot?.(el, "kv"));
  const art = $(".hx-kv__art"), title = $(".hx-kv__title"), bar = $(".hx-bar");
  const order = [5, 6, 3, 4, 1, 2].map((n) => `.hx-kv__name--${n} span`);

  if (reduce) {
    gsap.set([art, title, bar], { autoAlpha: 1 });
    kvLots.forEach((a) => a?.goToAndStop(a.totalFrames - 1, true));
  }
  document.addEventListener("hx:enter", () => {
    if (reduce) { $(".hx-gate").style.display = "none"; return; }
    const tl = gsap.timeline();
    tl.fromTo(".hx-gate__choose", { y: 0, autoAlpha: 1 }, { y: -20, autoAlpha: 0, duration: 0.2, ease: "power2.out" })
      .fromTo(".hx-gate", { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.1, ease: "power2.out" })
      .fromTo(art, { y: 20, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.6, ease: "power2.out" })
      .add(() => kvLots.forEach((a) => a?.play()))
      .fromTo(title, { y: 10, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.7, ease: "power2.out" }, "-=0.3");
    order.forEach((sel) => tl.fromTo(sel, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, stagger: 0.008, ease: "power2.out", duration: 0.5 }, "-=0.6"));
    tl.fromTo(bar, { top: -10, autoAlpha: 0 }, { top: 0, autoAlpha: 1, duration: 0.2, ease: "power2.out" }, "-=0.15");
  }, { once: true });

  // Photo collection — the section head pins when it touches 100px above the screen top, then flips frames with scrub 1 over 4000px (2000 on phones) (the original setSpeed .9 has no effect on frame picking)
  const group = window.hxLot?.($(".hx-artist__lot"), "artists");
  if (group) group.setSubframe(false);
  ScrollTrigger.create({
    trigger: ".hx-artist", start: "top top+=100", end: narrow ? "+=2000" : "+=4000", pin: true, scrub: 1,
    onUpdate: (s) => group?.goToAndStop(s.progress * (group.totalFrames - 1), true),
  });

  // First video — while its bottom edge passes center of screen +100~300 it fades (down 40px) and reappears, and from +200 to the end it becomes a small window at bottom right
  const player = $("#player");
  if (player && !reduce) {
    gsap.timeline({ scrollTrigger: { trigger: player, start: "bottom+=100 center", end: "bottom+=300 center", scrub: true } })
      .fromTo(player, { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: 40, duration: 1 })
      .to(player, { autoAlpha: 1, y: 0, duration: 1 });
    ScrollTrigger.create({ trigger: player, start: "bottom+=200 center", endTrigger: "#footer", end: "bottom bottom", toggleClass: { targets: player, className: "is-video" } });
  }

  // On entering the white section (contents to end), the bars and vertical text flip to a white background and pink
  ScrollTrigger.create({ trigger: "#content", endTrigger: "#footer", start: "top top", end: "bottom top", toggleClass: { targets: ".hx-bar, .hx-side", className: "is-white" } });

  // Big photo — rises −20vw while passing through the section (scrub 1)
  if (!reduce) gsap.to(".hx-photo__img", { y: "-20vw", ease: "none", scrollTrigger: { trigger: ".hx-photo", start: "top bottom", end: "bottom top", scrub: 1 } });
})();
