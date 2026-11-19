// Villa brand pages — header bar and footer are separate per villa (the original also has separate villa sites), with the same motion frame
(() => {
  const { lenis, isSp, reduce, pill } = window.NH;
  const sea = document.body.classList.contains("-sea");
  const NAME = sea ? "SEASIDE" : "RIVERSIDE";
  const NAV = sea ? ["Concept", "Villa", "Spa", "Dining", "Experience", "FAQ", "Access", "News", "Contact"] : ["Concept", "Stay", "Retreat", "Dining", "Experience", "FAQ", "Access", "News", "Contact"];
  const half = Math.ceil(NAV.length / 2);

  const header = document.querySelector("[data-slot=villa-header]");
  if (header) {
    header.classList.add("v-header");
    header.innerHTML = `
      <a class="v-header__logo" href="${sea ? "seaside" : "riverside"}.html" data-label="Lodge logo (mark + wordmark SVG slot)"><b><span class="h-mark"></span>${NAME}</b><small>PROJECT NAME</small></a>
      <nav class="v-header__nav" aria-label="Villa Menu"><ul>${NAV.slice(0, half).map((n) => `<li><a class="v-line" href="#v-${n.toLowerCase()}">${n}</a></li>`).join("")}</ul><ul>${NAV.slice(half).map((n) => `<li><a class="v-line" href="#v-${n.toLowerCase()}">${n}</a></li>`).join("")}</ul></nav>
      <a class="v-header__resv" href="#">Reservation${pill}</a>`;
  }
  const footer = document.querySelector("[data-slot=villa-footer]");
  if (footer) {
    footer.classList.add("v-footer", "n-paper");
    footer.innerHTML = `
      <div class="v-footer__grid">
        <div class="v-footer__brand"><h2 data-label="Brand wordmark (SVG slot)">${NAME}</h2><p class="v-footer__addr">Postal code 000-0000<br>Your villa address here in one line 0-0<br><a class="v-mapLink" href="#"><span class="v-line-b">Google Map</span> ↗</a><br><br>Tel<br>000-000-0000</p></div>
        <nav class="v-footer__menu" aria-label="Footer Menu"><div><h3>Contents</h3><ul>${["Top"].concat(NAV.slice(0, 5)).map((n) => `<li><a class="v-line" href="#">${n}</a></li>`).join("")}</ul></div><div><h3>Information</h3><ul>${NAV.slice(5).concat("Privacy Policy").map((n) => `<li><a class="v-line" href="#">${n}</a></li>`).join("")}</ul></div></nav>
        <div class="v-footer__cta">${["Reservation", "Access", "Contact"].map((t) => `<a class="n-lineLink" href="#">${t}${pill}</a>`).join("")}</div>
      </div>
      <div class="v-footer__bottom"><a href="index.html" data-label="Project logo (SVG slot)"><span class="h-mark"></span>PROJECT NAME</a></div>`;
  }

  // Header line — ink text over light sections, hides when the footer shows (original invisibleHeaderInFooter)
  const vh = document.querySelector(".v-header");
  if (vh) {
    const lights = document.querySelectorAll("[data-light]");
    const tick = () => { const on = [...lights].some((el) => { const r = el.getBoundingClientRect(); return r.top <= 40 && r.bottom > 40; }); vh.classList.toggle("is-dark", on); };
    lenis ? lenis.on("scroll", tick) : addEventListener("scroll", tick, { passive: true });
    tick();
    if (footer) new IntersectionObserver(([e]) => vh.classList.toggle("is-hidden", e.isIntersecting)).observe(footer);
  }

  // Hero text — drawn from the left with clip (original displayFvAnimation power2.inOut)
  const fv = document.querySelector("[data-fv-title]");
  if (fv) reduce ? gsap.set(fv, { clipPath: "inset(0% 0% 0% 0%)" }) : gsap.fromTo(fv, { clipPath: "inset(0% 100% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", delay: 0.6, duration: 1.6, ease: "power2.inOut" });
  document.querySelector("[data-mv-video]")?.play().catch(() => {});

  if (!window.ScrollTrigger || reduce) return;
  gsap.registerPlugin(ScrollTrigger);
  const mm = gsap.matchMedia();
  mm.add("(min-width: 768px)", () => {
    // Center vertical strip (45% hidden on each side) expands to full screen — tied directly to scroll for 340vh from when the section touches the bottom of the screen
    document.querySelectorAll("[data-mask-wrap]").forEach((w) => {
      const img = w.querySelector("[data-mask-img]");
      const pad = () => (innerHeight * 0.18).toFixed(0);
      gsap.fromTo(img, { clipPath: () => `inset(${pad()}px 45% ${pad()}px 45%)` }, { clipPath: "inset(0px 0% 0px 0%)", ease: "none", scrollTrigger: { trigger: w, start: "top bottom", end: "+=340% bottom", scrub: 0, invalidateOnRefresh: true } });
    });
    // Three rooms — in each section the upper one peels up from the bottom edge (inset 0 → 0 0 100% 0) revealing the next. Over 9 screens
    document.querySelectorAll("[data-rooms]").forEach((sec) => {
      const rooms = [...sec.querySelectorAll("[data-room]")];
      const thumbs = [...sec.querySelectorAll("[data-room-thumb]")];
      const tl = gsap.timeline({ scrollTrigger: { trigger: sec, start: "top top", end: "bottom bottom", scrub: true,
        onUpdate: (st) => { const i = Math.min(rooms.length - 1, Math.floor(st.progress * rooms.length)); thumbs.forEach((t, k) => t.classList.toggle("is-on", k === i)); } } });
      rooms.forEach((r, i) => tl.fromTo(r, { clipPath: "inset(0 0 0 0)" }, { duration: 1, ease: "none", clipPath: i === rooms.length - 1 ? "inset(0 0 0 0)" : "inset(0 0 100% 0)" }));
      thumbs.forEach((t, i) => t.addEventListener("click", () => { const st = tl.scrollTrigger; const y = st.start + ((st.end - st.start) * (i + 0.02)) / rooms.length; lenis ? lenis.scrollTo(y) : scrollTo(0, y); }));
    });
    // Big photo — recedes from 1.2 to 1 while passing through the screen
    document.querySelectorAll("[data-scale]").forEach((img) => gsap.fromTo(img, { scale: 1.2 }, { scale: 1, ease: "none", scrollTrigger: { trigger: img, start: "top bottom", end: "bottom top", scrub: true } }));
    // Scattered photos — the original imageParallax (−20% → 10%, starting and ending late by .2·.5 of the photo height).
    document.querySelectorAll("[data-parallax]").forEach((el) => {
      const h = el.clientHeight;
      gsap.fromTo(el, { yPercent: -20 }, { yPercent: 10, ease: "none", scrollTrigger: { trigger: el, start: `top+=${0.2 * h} bottom`, end: `bottom+=${0.5 * h} top`, scrub: true } });
    });
  });

  // Last photo strip — a Splide that transitions with a fade
  const fin = document.querySelector("[data-final-slider]");
  if (fin && window.Splide) new Splide(fin, { type: "fade", rewind: true, autoplay: true, interval: 4000, speed: 1500, arrows: false, pagination: false, pauseOnHover: false, drag: false }).mount();

  // News row (riverside)
  const rows = document.querySelector("[data-villa-news]");
  if (rows) rows.innerHTML = [["2026.01.28", "Selected as one of the Top 10 single-house stays with a sauna by Magazine Name magazine"], ["2025.12.01", "We’ve started a winter-only lodging plan"], ["2025.02.05", "Reservations are now open"]]
    .map(([d, s]) => `<article><a class="n-newsRow n-lineLink" data-hold="0.7" href="article.html"><span class="n-newsRow__meta en-label-l"><span class="n-newsRow__date">${d}</span></span><span class="n-newsRow__title ja-body-s">${s}</span><span class="n-newsRow__go">${pill}</span><span class="n-lineLink__base"></span><span class="n-lineLink__run"></span></a></article>`).join("");
})();
