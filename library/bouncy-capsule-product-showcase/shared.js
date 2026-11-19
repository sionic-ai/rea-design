// Shared by all pages: icon set, uncovering (body is-loading → is-loaded), phone menu, smooth # link scrolling (offset by the header height),
// About text lines pushed in from the left, bottom band (circular photo Swiper·stops off-screen), contact circle CONTACT ring Lottie, PAGE TOP appearing.
(() => {
  gsap.registerPlugin(ScrollTrigger, CustomEase);

  // The original used emoji images, our line icons go in the same spot
  const SPRITE = `<svg xmlns="http://www.w3.org/2000/svg" style="position:absolute;width:0;height:0;overflow:hidden" aria-hidden="true">
  <symbol id="i-handle" viewBox="0 0 36 36"><circle cx="18" cy="18" r="18" fill="currentColor" style="color:var(--kf-contrast-bg)"/><rect x="8" y="15" width="22" height="6.4" rx="3.2" transform="rotate(24 18 18)" style="fill:var(--kf-surface)"/></symbol>
  <symbol id="i-bird" viewBox="0 0 16 16"><path d="M14.4 4.6c-.5.2-1 .4-1.6.4.6-.3 1-.9 1.2-1.5-.5.3-1.1.6-1.7.7a2.7 2.7 0 0 0-4.6 2.5A7.7 7.7 0 0 1 2 3.9a2.7 2.7 0 0 0 .8 3.6c-.4 0-.9-.1-1.2-.3 0 1.3.9 2.4 2.2 2.7-.4.1-.8.1-1.2 0a2.7 2.7 0 0 0 2.5 1.9A5.5 5.5 0 0 1 1 12.9 7.7 7.7 0 0 0 12.9 6.4v-.4c.6-.4 1.1-.9 1.5-1.4z"/></symbol>
  <symbol id="i-mail" viewBox="0 0 16 16"><rect x="1.5" y="3.5" width="13" height="9" rx="1.2" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M2.2 4.4L8 8.8l5.8-4.4" fill="none" stroke="currentColor" stroke-width="1.6"/></symbol>
  <symbol id="i-letter" viewBox="0 0 32 32"><rect x="3" y="7" width="26" height="19" rx="2" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M4 9l12 9 12-9" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><path d="M16 13.5c-1.2-1.6-3.6-.8-3 1 .4 1.2 3 3 3 3s2.6-1.8 3-3c.6-1.8-1.8-2.6-3-1z" fill="currentColor"/></symbol>
  <symbol id="i-eyes" viewBox="0 0 40 24"><ellipse cx="11" cy="12" rx="8" ry="10" style="fill:var(--kf-surface)"/><ellipse cx="29" cy="12" rx="8" ry="10" style="fill:var(--kf-surface)"/><circle cx="13" cy="14" r="4.5" fill="currentColor"/><circle cx="31" cy="14" r="4.5" fill="currentColor"/></symbol>
  <symbol id="i-capsule" viewBox="0 0 32 32"><path d="M4 16a12 12 0 0 1 24 0z" style="fill:var(--kf-accent)"/><path d="M4 16h24a12 12 0 0 1-24 0z" style="fill:var(--kf-surface)" stroke="currentColor" stroke-width="1.6"/><path d="M4 16a12 12 0 0 1 24 0" fill="none" stroke="currentColor" stroke-width="1.6"/><rect x="2.5" y="14.6" width="27" height="2.8" rx="1.4" fill="currentColor"/></symbol>
  <symbol id="i-thumb" viewBox="0 0 32 32"><path d="M9 14h4l4-8c2 0 3 1.5 2.5 3.5L18.6 13H25a2 2 0 0 1 2 2.3l-1.4 8A3 3 0 0 1 22.6 26H9z" style="fill:var(--kf-surface)" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><rect x="4" y="14" width="5" height="12" rx="1" fill="currentColor"/></symbol>
  <symbol id="i-dino" viewBox="0 0 32 32"><path d="M6 26v-6c0-5 4-8 8-8h2V7a3 3 0 0 1 6 0v2h3v3h-3v6c0 3-2 5-4 5v3h-3v-3h-4v3z" style="fill:var(--kf-surface)" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><circle cx="20" cy="7" r="1.2" fill="currentColor"/></symbol>
  <symbol id="i-globe" viewBox="0 0 32 32"><circle cx="16" cy="16" r="12" style="fill:var(--kf-surface)" stroke="currentColor" stroke-width="1.6"/><path d="M4 16h24M16 4c4 4 4 20 0 24M16 4c-4 4-4 20 0 24" fill="none" stroke="currentColor" stroke-width="1.4"/></symbol>
  <symbol id="i-play" viewBox="0 0 24 17"><rect x="0" y="0" width="24" height="17" rx="4.5" fill="currentColor"/><path d="M9.6 4.8l6 3.7-6 3.7z" style="fill:var(--kf-surface)"/></symbol>
  <symbol id="i-pen" viewBox="0 0 32 32"><path d="M6 26l2-7L22 5l5 5-14 14z" style="fill:var(--kf-accent-soft)" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M19 8l5 5M6 26l7-2" fill="none" stroke="currentColor" stroke-width="1.8"/></symbol>
  <symbol id="i-out" viewBox="0 0 30 30"><circle cx="15" cy="15" r="14" fill="currentColor" style="color:var(--kf-contrast-bg)"/><path d="M12 9h9v9M21 9l-10 10" fill="none" style="stroke:var(--kf-surface)" stroke-width="2"/></symbol>
  <symbol id="i-horn" viewBox="0 0 32 32"><path d="M5 13h5l12-6v18l-12-6H5z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><path d="M10 19l2 7h3l-1.5-6" fill="none" stroke="currentColor" stroke-width="2.2"/></symbol>
  <symbol id="i-hand" viewBox="0 0 32 32"><path d="M13 16V5a2 2 0 0 1 4 0v9l7 1.5c1.6.4 2.6 2 2.2 3.6L24.6 26a4 4 0 0 1-3.9 3H15a5 5 0 0 1-4-2l-5-6.5a2 2 0 0 1 3-2.6z" style="fill:var(--kf-accent-soft)" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></symbol>
  <symbol id="illo-pay" viewBox="0 0 220 203"><circle cx="70" cy="80" r="22" fill="none" stroke="currentColor" stroke-width="5"/><path d="M48 80h44M70 58c9 9 9 35 0 44M70 58c-9 9-9 35 0 44" fill="none" stroke="currentColor" stroke-width="3"/><rect x="100" y="48" width="44" height="76" rx="6" style="fill:var(--kf-surface)" stroke="currentColor" stroke-width="5"/><rect x="109" y="70" width="26" height="14" style="fill:var(--kf-accent)"/><circle cx="160" cy="58" r="14" style="fill:var(--site-sky)"/><path d="M150 118h30l-6 16h-20zM154 140a3 3 0 1 0 0 .1M172 140a3 3 0 1 0 0 .1" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round"/><circle cx="76" cy="132" r="12" style="fill:var(--kf-accent)"/></symbol>
  <symbol id="illo-chat" viewBox="0 0 220 203"><rect x="70" y="44" width="70" height="116" rx="10" style="fill:var(--kf-surface)" stroke="currentColor" stroke-width="5"/><circle cx="105" cy="104" r="20" style="fill:var(--site-sky)"/><circle cx="105" cy="96" r="7" style="fill:var(--kf-surface)"/><path d="M92 116a13 10 0 0 1 26 0" style="fill:var(--kf-surface)"/><circle cx="150" cy="52" r="18" style="fill:var(--site-sky-deep)"/><path d="M141 52h18" style="stroke:var(--kf-surface)" stroke-width="4"/><rect x="40" y="136" width="140" height="10" rx="5" style="fill:var(--kf-surface)"/></symbol>
  <symbol id="illo-chart" viewBox="0 0 220 203"><rect x="58" y="62" width="40" height="56" rx="5" style="fill:var(--kf-surface)" stroke="currentColor" stroke-width="5"/><circle cx="72" cy="80" r="6" style="fill:var(--kf-accent)"/><circle cx="84" cy="96" r="6" style="fill:var(--site-sky)"/><path d="M48 160l50-30 22 12 52-46" fill="none" style="stroke:var(--kf-accent)" stroke-width="10" stroke-linejoin="round"/><path d="M160 90h22v22z" style="fill:var(--kf-accent)"/><path d="M150 50l8 8 12-14" fill="none" stroke="currentColor" stroke-width="5"/></symbol>
  <symbol id="illo-bag" viewBox="0 0 100 100"><path d="M28 36h44l4 44H24z" style="fill:var(--site-sky)" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/><path d="M40 36v-6a10 10 0 0 1 20 0v6" fill="none" stroke="currentColor" stroke-width="3"/><rect x="56" y="58" width="22" height="20" style="fill:var(--kf-accent)" stroke="currentColor" stroke-width="3"/><path d="M14 24l3 6 6 1-5 4 1 6-5-3-5 3 1-6-5-4 6-1z" fill="currentColor"/></symbol>
  <symbol id="illo-mark" viewBox="0 0 100 100"><circle cx="50" cy="50" r="34" fill="none" stroke="currentColor" stroke-width="9"/><path d="M50 16a34 34 0 0 1 34 34" fill="none" style="stroke:var(--kf-accent)" stroke-width="9"/><path d="M40 38h22l-16 24h18" fill="none" stroke="currentColor" stroke-width="7" stroke-linejoin="round"/></symbol>
  <symbol id="illo-doc" viewBox="0 0 100 100"><rect x="26" y="20" width="44" height="58" rx="3" transform="rotate(-10 48 49)" style="fill:var(--kf-accent)"/><rect x="34" y="26" width="44" height="58" rx="3" style="fill:var(--kf-surface)" stroke="currentColor" stroke-width="3"/><path d="M42 40h28M42 50h28M42 60h20" stroke="currentColor" stroke-width="3"/></symbol>
  <symbol id="bg-letters" viewBox="0 0 1672 97" preserveAspectRatio="xMinYMid meet"><text x="0" y="82" fill="currentColor" style="font:700 96px var(--kf-font-display);letter-spacing:.32em" data-label="Your brand’s English name here, one word rotating through a single line">here Brand – name.here Brand</text></symbol>
</svg>`;
  document.body.insertAdjacentHTML("afterbegin", SPRITE);

  const mm = gsap.matchMedia();
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const head = document.querySelector(".g-head");

  // Phone menu — is-open on body, and the handle icon rotates −114°
  const burger = document.querySelector(".g-burger");
  burger?.addEventListener("click", () => {
    const open = document.body.classList.toggle("is-open");
    burger.setAttribute("aria-expanded", String(open));
  });

  // Original turns # links into smooth window scrolling, travelling less by the fixed header height
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href").slice(1);
      const to = id ? document.getElementById(id) : null;
      if (!to) return;
      e.preventDefault();
      document.body.classList.remove("is-open");
      const y = to === document.body ? 0 : to.getBoundingClientRect().top + scrollY - head.clientHeight;
      scrollTo({ top: y, behavior: reduce ? "auto" : "smooth" });
    });
  });

  // Original leftIn — line fragments slide in from −200% left over .4s, .2s apart (batch per element, so .1s later)
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    document.querySelectorAll(".g-left-in").forEach((li) => {
      const kids = [...li.children].filter((c) => c.tagName !== "BR");
      gsap.set(kids, { xPercent: -200 });
      ScrollTrigger.create({
        trigger: li, start: () => "bottom bottom-=" + li.clientHeight, once: true,
        onEnter: () => gsap.to(kids, { xPercent: 0, duration: 0.4, delay: 0.1, stagger: { each: 0.2 }, onComplete: () => gsap.set(kids, { clearProps: "transform" }) }),
      });
    });
  });

  // Bottom strip — pause the text ring · bouncing label while offscreen (original .cta js-paused)
  const cta = document.querySelector(".g-cta");
  if (cta) {
    if (cta.getBoundingClientRect().top + scrollY > innerHeight) cta.classList.add("is-paused");
    ScrollTrigger.create({
      trigger: cta, start: "top bottom", end: "bottom+=50% top", invalidateOnRefresh: true,
      onToggle: (self) => cta.classList.toggle("is-paused", !self.isActive),
    });
  }

  // Circular photo slider — shuffles the order each time it opens, 2s advance, wheel reversed (Swiper 8.3.1 as is)
  const slider = document.querySelector(".g-cta-slider");
  if (slider && window.Swiper) {
    const wrap = slider.querySelector(".swiper-wrapper");
    for (let i = wrap.children.length; i >= 0; i--) wrap.appendChild(wrap.children[(Math.random() * i) | 0]);
    new Swiper(slider, {
      loop: true, allowTouchMove: true, slidesPerView: 2, centeredSlides: true, speed: 2000, observer: true, observeParents: true,
      mousewheel: { invert: true },
      breakpoints: { 540: { slidesPerView: 3, centeredSlides: true }, 1024: { slidesPerView: 4, spaceBetween: 18, centeredSlides: false } },
    });
  }

  // Ring of CONTACT around the contact circle — keeps playing the 40-second Lottie and stops when it gets close to the band below
  const ringHost = document.querySelector(".g-float__ani");
  const bottom = document.querySelector(".g-bottom");
  if (ringHost && window.lottie && window.gContactRing) {
    const ring = lottie.loadAnimation({ container: ringHost, renderer: "svg", loop: true, autoplay: !reduce, animationData: window.gContactRing });
    const float = document.querySelector(".g-float");
    if (bottom && float) {
      ScrollTrigger.create({
        trigger: bottom, start: () => "top bottom-=" + 2 * float.clientHeight,
        onEnter: () => ring.pause(), onEnterBack: () => ring.pause(), onLeaveBack: () => !reduce && ring.play(),
      });
    }
  }

  // PAGE TOP circle — on wide screens it rises once when the bottom band reaches the screen center, on phones it tilts up each time it touches the bottom of the screen
  const gotop = document.querySelector(".g-gotop__content");
  if (gotop && bottom) {
    mm.add({ sp: "(max-width: 899px)", pc: "(min-width: 900px)", still: "(prefers-reduced-motion: reduce)" }, (ctx) => {
      const { sp, still } = ctx.conditions;
      if (still) return;
      const show = gsap.fromTo(gotop, { autoAlpha: 0, y: 10, rotate: -15 }, { duration: 0.5, autoAlpha: 1, y: 0, rotate: 0 });
      ScrollTrigger.create({ animation: show, trigger: bottom, start: sp ? "top bottom" : "top center", once: !sp, toggleActions: "play reverse restart reverse" });
    });
  }

  // Lift the cover — the original changes the body’s loading to loaded on load
  const done = () => {
    document.body.classList.remove("is-loading");
    document.body.classList.add("is-loaded");
    ScrollTrigger.refresh();
  };
  if (document.readyState === "complete") done();
  else addEventListener("load", done, { once: true });
})();
