// Common to all pages: hand-drawn SVG (original illustrations redrawn at the same position, size and feel), heading, curtain menu, contact band, footer,
// Page transition (barba 2.10.3 fade .5s), swiper 11.2.10 attached per plate (photo strip · case · detail photos · chosen service) · scroll motion · hand-drawn wiggle, hand-drawn pop-out above buttons.
// Noise grain lives in _fx/noise-tint-bg, hand-drawn flip in _fx/squash-flip-loop.
// Original values: Lenis 1.2s expo · fade 0/y30/.95 scrub (actually true) · photo scale 1.2→1 scrub 1 · fade 3s power2.out ·
// Button hand drawing back.out(1.8) .45s / close power2.in .3s yPercent 28 · menu background .5s · items at random .004s intervals.
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const page = document.body.dataset.page || "home";
  const SL = (window.SL = { reduced, lenis: null, page });

  // ── Hand drawing: black lines + light green fills. People are made with a few strokes: head, body, limbs ──
  const K = 'stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"';
  const G = 'class="sl-g"';
  const head = (x, y, r = 9) => `<circle cx="${x}" cy="${y}" r="${r}" class="sl-w" ${K}/><path d="M${x - r} ${y - 2}q${r} -${r * 1.4} ${r * 2} 0" fill="currentColor"/>`;
  const ILL = {
    roller: `<svg class="sl-art" viewBox="0 0 120 170">${head(70, 40)}<path ${K} d="M70 49l-4 46M66 95l-14 44M66 95l16 42M52 139h-10M82 137h10"/><path d="M58 58h22l-3 34H60z" class="sl-w" ${K}/><path ${K} d="M62 62l-22 10M78 62l8 18"/><path ${K} d="M40 72L12 8"/><rect x="2" y="0" width="22" height="9" rx="3" transform="rotate(-24 13 4)" ${G} stroke="currentColor" stroke-width="2"/></svg>`,
    bulb: `<svg class="sl-art" viewBox="0 0 140 200">${head(52, 70)}<path d="M40 82h26l4 46H38z" fill="currentColor"/><path ${K} d="M44 128l-10 52M64 128l14 50M34 180h-12M78 178h12M66 92l26-24M42 92l-14 18"/><circle cx="100" cy="40" r="24" class="sl-w" ${K}/><path ${K} d="M92 64h16v10H92zM96 32q4 10 8 0"/><path ${K} d="M118 20l8-6M124 40h9M76 18l-6-6"/></svg>`,
    clock: `<svg class="sl-art" viewBox="0 0 60 60"><circle cx="30" cy="30" r="26" class="sl-w" ${K}/><path ${K} d="M30 14v16l10 6"/><circle cx="30" cy="30" r="2" fill="currentColor"/></svg>`,
    book: `<svg class="sl-art" viewBox="0 0 80 50"><path ${K} d="M4 10q18-8 36 4q18-12 36-4v34q-18-8-36 4q-18-12-36-4z" class="sl-w"/><path ${K} d="M40 14v34"/><path d="M8 12q14-5 28 3v28q-14-7-28-2z" ${G} opacity=".6"/></svg>`,
    group: `<svg class="sl-art" viewBox="0 0 160 150"><path ${K} d="M70 0v20"/><path d="M58 20h24l-4 14H62z" class="sl-g" stroke="currentColor" stroke-width="2"/>${head(40, 60)}<path d="M28 72h24l2 34H26z" fill="currentColor"/><path ${K} d="M30 106l-6 30M50 106l14 28M28 82l-14 18M52 80l18-20"/><path ${K} d="M10 100h40v8"/>${head(112, 66)}<path d="M100 78h24l6 30H96z" class="sl-w" ${K}/><path ${K} d="M104 108l-8 28M124 108l8 26M100 88l-20 -8M124 88l10 14"/>${head(132, 100, 8)}<path d="M124 110h18l4 24h-26z" ${G} stroke="currentColor" stroke-width="2"/></svg>`,
    house: `<svg class="sl-art" viewBox="0 0 140 120"><path ${K} d="M20 50L66 12l46 38v58H20z" class="sl-w"/><path ${K} d="M58 108V78h18v30"/><rect x="34" y="60" width="14" height="14" ${G} stroke="currentColor" stroke-width="2"/>${head(116, 58, 7)}<path d="M108 66h16l2 22h-20z" fill="currentColor"/><path ${K} d="M110 88l-4 20M122 88l4 20M108 72l-10 8"/>${head(30, 82, 6)}<path ${K} d="M30 88v14M30 102l-6 12M30 102l6 12M30 92l-8 6"/></svg>`,
    puzzle: `<svg class="sl-art" viewBox="0 0 150 130">${head(44, 54)}<path d="M32 66h24l4 38H30z" class="sl-w" ${K}/><path ${K} d="M36 104l-6 22M54 104l8 22M56 74l26-14M34 74l-10 20"/><path d="M84 30h20q0-10 8-10t8 10h20v20q10 0 10 8t-10 8v20h-56z" class="sl-g" stroke="currentColor" stroke-width="2"/><path d="M96 4h16v16h-16z" class="sl-w" ${K}/></svg>`,
    papers: `<svg class="sl-art" viewBox="0 0 150 130">${head(50, 50)}<path d="M38 62h26l2 36H36z" fill="currentColor"/><path ${K} d="M42 98l-6 26M60 98l8 24M62 70l24-12M38 70l-14 16"/><path d="M84 20l34-8 6 30-34 8z" class="sl-w" ${K}/><path d="M104 54l32-2 2 30-32 2z" ${G} stroke="currentColor" stroke-width="2"/><path d="M14 10l20 4-4 20-20-4z" class="sl-w" ${K}/></svg>`,
    hand: `<svg class="sl-art" viewBox="0 0 70 90"><path ${K} class="sl-w" d="M22 86V46q0-8 6-8t6 8V8q0-6 6-6t6 6v34q0-6 6-6t6 6v8q0-6 6-6t4 6v20q0 16-14 22z"/><path ${K} d="M24 66l20 18M34 62l18 16M44 60l12 10" stroke-width="1.4"/></svg>`,
    door: `<svg class="sl-art" viewBox="0 0 120 150"><path d="M20 10h44v128H20z" class="sl-w" ${K}/><path d="M24 14l34 8v120l-34-8z" class="sl-g" stroke="currentColor" stroke-width="2"/><circle cx="52" cy="80" r="2.4" fill="currentColor"/>${head(86, 48)}<path d="M74 60h24l4 40H70z" class="sl-w" ${K}/><path ${K} d="M78 100l-6 36M96 100l10 34M74 70l-16 10M98 70l8 18"/></svg>`,
    blocks: `<svg class="sl-art" viewBox="0 0 180 170"><rect x="70" y="10" width="40" height="40" ${G} stroke="currentColor" stroke-width="2"/><rect x="60" y="50" width="56" height="44" class="sl-w" ${K}/><rect x="60" y="94" width="56" height="56" fill="currentColor"/>${head(30, 96)}<path d="M18 108h24l4 34H16z" class="sl-w" ${K}/><path ${K} d="M22 142l-6 22M38 142l6 22M42 116l20-18M18 118l-8 16"/>${head(150, 120, 8)}<path d="M140 130h20l2 22h-24z" fill="currentColor"/><path ${K} d="M140 136l-24 -6M160 140l10 14M142 152l-8 14M156 152l6 14"/>${head(128, 30, 7)}<path ${K} d="M128 37v20M128 57l-6 10M128 57l6 10M128 44l-16 -8M128 44l12 -10"/></svg>`,
    plan: `<svg viewBox="0 0 520 360" class="sl-art sl-plan" fill="none" stroke-width="2"><path d="M10 10h500v340H10z"/><path d="M10 140h180v210M190 10v90M190 140h120v90h200M310 230v120M380 10v130h130M100 250h90M250 300h60"/><path d="M190 100a40 40 0 0 1 40 40M310 300a40 40 0 0 0 -40 -40" stroke-dasharray="4 5"/><rect x="40" y="40" width="80" height="50"/><rect x="420" y="260" width="60" height="60"/></svg>`,
    map: `<svg viewBox="0 0 900 400" class="sl-art sl-map" stroke-width="2"><path d="M40 260q60-120 180-110t150-90q120-40 200 30t170 20q130 10 120 120t-160 120q-160 20-280-10t-200 30q-140 10-180-110z"/><path d="M320 120q40 60 0 140M520 80q-30 90 20 200M700 120q-40 80 10 170" fill="none"/></svg>`,
  };
  SL.ill = (k) => ILL[k] || "";
  document.querySelectorAll("[data-ill]").forEach((el) => { el.classList.add("sl-ill"); el.innerHTML = ILL[el.dataset.ill] || ""; });

  const ico = '<span class="sl-ico" aria-hidden="true"><span class="sl-ico__wrap"><i></i><i></i></span></span>';
  const logo = (h = 30) => `<svg viewBox="0 0 92 30" aria-label="Brand Logo"><text x="0" y="13" style="font-family:var(--kf-font-display)" font-weight="700" font-size="15" letter-spacing="1.2" fill="currentColor">BRAND</text><path d="M60 3v10h18" stroke="currentColor" stroke-width="1.6" fill="none"/><text x="0" y="27" style="font-family:var(--kf-font-sans)" font-size="6.5" fill="currentColor">Your one-line tagline here.</text></svg>`;
  SL.ico = ico;

  // ── Header · menu ──
  const nav = [["Company About", "about.html", "about"], ["Library Renovation", "service.html", "service"], ["Full Renovation", "#", ""], ["Partial reno", "#", ""], ["Installation Cases", "works.html", "works"], ["Showroom", "index.html#showroom", ""]];
  const head_ = document.querySelector('[data-slot="header"]');
  if (head_) {
    head_.classList.add("sl-head");
    head_.innerHTML = `
      <a class="sl-logo" href="index.html">${logo()}</a>
      <div class="sl-head__nav">
        <nav class="sl-head__list" aria-label="Main menu">${nav.map(([t, h, p]) => `<a href="${h}" class="${p && (p === page || (p === "works" && page === "detail")) ? "is-active" : ""}">${t}</a>`).join("")}</nav>
        <div class="sl-head__btns">
          <div class="sl-pill is-moss" data-pop="papers"><span class="sl-pill__ill" data-ill="papers"></span><a href="#"><span>Material Request</span></a></div>
          <div class="sl-pill" data-pop="door"><span class="sl-pill__ill" data-ill="door"></span><a href="#"><span>Contact Us</span></a></div>
        </div>
        <button class="sl-burger" type="button" aria-label="Menu" aria-expanded="false"><i></i><i></i></button>
      </div>`;
    head_.insertAdjacentHTML("afterend", `
      <div class="sl-menu" data-slot="menu-drawer" data-lenis-prevent>
        <div class="sl-menu__bg"></div>
        <div class="sl-menu__in">
          <nav class="sl-menu__list" aria-label="Phone menu">${nav.map(([t, h]) => `<a href="${h}" data-menu-part>${t}</a>`).join("")}<a href="news.html" data-menu-part>Latest news</a></nav>
          <div class="sl-menu__btns"><div class="sl-pill is-moss" data-menu-part style="display:block"><a href="#" style="background:var(--site-moss)"><span>Material Request</span></a></div><div class="sl-pill" data-menu-part><a href="#"><span>Contact Us</span></a></div></div>
          <div class="sl-menu__fig" data-ill="blocks" data-menu-fig></div>
          <svg class="sl-menu__type" viewBox="0 0 340 40" aria-hidden="true">${[..."Your one-line phrase, big, here."].map((c, i) => `<text data-menu-typo x="${i * 24.5}" y="32" font-size="26" font-weight="700" fill="currentColor" style="font-family:var(--kf-font-sans)">${c}</text>`).join("")}</svg>
        </div>
      </div>`);
    document.querySelectorAll(".sl-menu [data-ill]").forEach((el) => { el.classList.add("sl-ill"); el.innerHTML = ILL[el.dataset.ill]; });
    head_.querySelectorAll("[data-ill]").forEach((el) => { el.innerHTML = ILL[el.dataset.ill]; });
  }

  // ── Contact band · footer: inside the barba page, so filled in each time the page changes ──
  const fillChrome = (root) => {
  const cta = root.querySelector('[data-slot="cta"]');
  if (cta && !cta.classList.contains("sl-cta")) {
    cta.classList.add("sl-cta");
    cta.innerHTML = `
      <div class="sl-cta__bg" data-par="wrap"><div class="wf-img sl-ph-dark" data-par-content data-label="Office-cum-showroom interior · long wooden table, bookshelves and tiled wall · dim evening indoor light · full-width landscape"></div></div>
      <div class="sl-cta__in">
        <h2 class="sl-hd"><span class="sl-hd__ja">Inquiry</span><span class="sl-hd__en sl-en">Contact</span></h2>
        <div class="sl-cta__ill" data-ill="door" data-wiggle></div>
        <p class="sl-cta__ttl">One line here inviting contact.</p>
        <p class="sl-cta__area">Main areas | Write four area names here</p>
        <p class="sl-cta__note">Feel free to ask about other areas too.</p>
        <div class="sl-cta__btn"><a href="#">Contact Us</a></div>
      </div>`;
    cta.querySelectorAll("[data-ill]").forEach((el) => { el.classList.add("sl-ill"); el.innerHTML = ILL[el.dataset.ill]; });
  }
  const foot = root.querySelector('[data-slot="footer"]');
  if (foot && !foot.classList.contains("sl-foot")) {
    foot.classList.add("sl-foot");
    const fnav = [["Company About", "about.html"], ["Library Renovation", "service.html"], ["Installation Cases", "works.html"], ["Showroom Guide", "index.html#showroom"], ["Full Renovation", "#"], ["Inquiry", "#"], ["Staff Introduction", "about.html#staff"], ["Partial reno", "#"], ["Latest news", "news.html"]];
    foot.innerHTML = `
      <div class="sl-foot__in">
        <div class="sl-foot__logo">${logo()}</div>
        <nav class="sl-foot__nav" aria-label="Footer Menu">${fnav.map(([t, h]) => `<a href="${h}">${t}</a>`).join("")}</nav>
        <div class="sl-foot__info"><p>Your company name here</p><p>Postal code 000-0000<br>Your one-line address here<br>Your building name 0F here<br>Business hours / Mon–Sat 0:00~00:00<br>TEL 00-0000-0000</p><a class="sl-foot__insta" href="#" aria-label="Social Media"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor"><rect x=".5" y=".5" width="15" height="15" rx="4"/><circle cx="8" cy="8" r="3.4"/></svg></a></div>
        <div class="sl-foot__ill" data-ill="blocks" data-fx="squash-flip-loop"></div>
        <div class="sl-foot__bottom"><a href="#">Privacy policy</a><span class="sl-en">© BRAND</span></div>
      </div>
      <svg class="sl-foot__type" viewBox="0 0 1440 112" aria-label="Your one-line phrase, big, here"><text x="0" y="104" font-size="118" textLength="1440" lengthAdjust="spacingAndGlyphs">Your one-line phrase, big, here.</text></svg>`;
    foot.querySelectorAll("[data-ill]").forEach((el) => { el.classList.add("sl-ill"); el.innerHTML = ILL[el.dataset.ill]; });
  }
  };

  // Full-screen noise texture comes from _fx/noise-tint-bg (attached to body, original NoisesScene values as is)

  // ── Smooth scroll ──
  if (!reduced && window.Lenis) {
    const lenis = new Lenis({ duration: 1.2, easing: (e) => Math.min(1, 1.001 - Math.pow(2, -10 * e)), smoothWheel: true, syncTouch: true, autoResize: true, anchors: true });
    SL.lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // ── Phone curtain menu: button folds .4s · background comes down in .5s · items random .004s · handwriting strokes .024s apart (+.8s) ──
  const menu = document.querySelector(".sl-menu");
  if (menu) {
    const bg = menu.querySelector(".sl-menu__bg"), parts = menu.querySelectorAll("[data-menu-part]"), typo = menu.querySelectorAll("[data-menu-typo]"), fig = menu.querySelector("[data-menu-fig]");
    const burger = document.querySelector(".sl-burger");
    let tl = null;
    const open = () => {
      tl && tl.kill();
      document.body.classList.add("is-menu");
      burger.setAttribute("aria-expanded", "true");
      tl = gsap.timeline()
        .set(menu, { autoAlpha: 1 })
        .fromTo(bg, { height: 0 }, { height: "100%", duration: 0.5, ease: "power3.inOut" }, 0)
        .fromTo(fig, { autoAlpha: 0, clipPath: "inset(0% 0% 100% 0%)" }, { autoAlpha: 1, clipPath: "inset(0% 0% 0% 0%)", duration: 0.5 }, 0)
        .fromTo(parts, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, stagger: { each: 0.004 * 20, from: "random" } }, 0)
        .fromTo(typo, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.9, stagger: { each: 0.024, from: "random" } }, 0.8);
      SL.lenis && SL.lenis.stop();
    };
    const close = () => {
      tl && tl.kill();
      document.body.classList.remove("is-menu");
      burger.setAttribute("aria-expanded", "false");
      tl = gsap.timeline()
        .to([parts, typo], { autoAlpha: 0, duration: 0.25, stagger: { each: 0.003, from: "random" } }, 0)
        .to(fig, { autoAlpha: 0, clipPath: "inset(0% 0% 100% 0%)", duration: 0.3 }, 0)
        .to(bg, { height: 0, duration: 0.5, ease: "power3.inOut" }, 0)
        .set(menu, { autoAlpha: 0 });
      SL.lenis && SL.lenis.start();
    };
    burger.addEventListener("click", () => (document.body.classList.contains("is-menu") ? close() : open()));
    // Like the original, clicking a link in the menu closes it and navigates (the header and menu stay while barba swaps the panel, so we close it directly)
    menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => { if (document.body.classList.contains("is-menu")) close(); }));
  }

  // ── Hand drawing above the header button: on enter it pops out with back.out(1.8) .45s and wiggles, on leave it drops down with power2.in .3s ──
  const fine = matchMedia("(min-width: 769px)");
  document.querySelectorAll("[data-pop]").forEach((btn) => {
    const ill = btn.querySelector(".sl-pill__ill");
    if (!ill) return;
    gsap.set(ill, { autoAlpha: 0, yPercent: 28, scale: 0.85, xPercent: -50, left: "50%", transformOrigin: "50% 100%" });
    let wig = null;
    btn.addEventListener("mouseenter", () => {
      if (!fine.matches || reduced) return;
      wig && wig.kill();
      gsap.to(ill, { autoAlpha: 1, yPercent: 0, scale: 1, duration: 0.45, ease: "back.out(1.8)", overwrite: true,
        // The original goes to the changed pose and back in .9s sine.inOut after everything has popped out, then rests .25s, repeating (MorphSVG) — with only one pose, it tilts at the same Tempo
        onComplete: () => { wig = gsap.timeline({ repeat: -1, repeatDelay: 0.25 }).to(ill.querySelector("svg"), { rotate: 6, duration: 0.9, ease: "sine.inOut", yoyo: true, repeat: 1, transformOrigin: "50% 100%" }); } });
    });
    btn.addEventListener("mouseleave", () => {
      wig && wig.kill();
      gsap.to(ill, { autoAlpha: 0, yPercent: 28, scale: 0.85, duration: 0.3, ease: "power2.in", overwrite: true });
    });
  });

  // ── Motion set per panel (barba container) — when the panel changes, everything is cleared at once with gsap.context ──
  const swipers = [];
  const initSwipers = (root) => {
    if (!window.Swiper) return;
    // Photo strip: original initTickerSwiper — each cell runs straight for (cell width ÷ px per second) seconds, endlessly without dragging
    root.querySelectorAll("[data-ticker]").forEach((el) => {
      const pxs = +el.dataset.ticker || 50;
      const slides = [...el.querySelectorAll(".swiper-slide")];
      const secs = slides.map((s) => s.offsetWidth / pxs);
      swipers.push(new Swiper(el, {
        slidesPerView: "auto", slidesPerGroup: 1, initialSlide: 0, centeredSlides: false, loop: true, loopAdditionalSlides: 3, allowTouchMove: false,
        grabCursor: false, watchSlidesProgress: false, preventClicks: true, preventClicksPropagation: true,
        autoplay: reduced ? false : { delay: 0, pauseOnMouseEnter: false, disableOnInteraction: false },
        speed: 1000 * secs[0],
        on: { slideChangeTransitionStart() { this.params.speed = 1000 * secs[this.realIndex]; this.update(); } },
      }));
    });
    // Work card: original initCardSwiper(".swiper-case", { freeMode: false, speed: 1200 }, no bar, arrow)
    root.querySelectorAll("[data-case-swiper]").forEach((el) => {
      if (el.querySelectorAll(".swiper-slide").length < 2) return;
      const arrows = el.parentElement.querySelector(".h-case__arrows, .sv-case__arrows");
      swipers.push(new Swiper(el, {
        slidesPerView: "auto", slidesPerGroup: 1, speed: reduced ? 0 : 1200, initialSlide: 0, centeredSlides: true, loop: true, loopAdditionalSlides: 1,
        grabCursor: true, watchSlidesProgress: false, preventClicks: true, preventClicksPropagation: true, freeMode: false,
        navigation: arrows ? { nextEl: arrows.querySelector("[data-next]"), prevEl: arrows.querySelector("[data-prev]") } : false,
      }));
    });
    // Selected service photos: original initImageSwiper(".service-image-swiper") — one section at a time in 1.2s, loops endlessly with three or more, click the dots
    root.querySelectorAll("[data-image-swiper]").forEach((el) => {
      const n = el.querySelectorAll(".swiper-slide").length;
      if (n < 2) return;
      swipers.push(new Swiper(el, {
        slidesPerView: 1, slidesPerGroup: 1, speed: reduced ? 0 : 1200, initialSlide: 0, centeredSlides: true, loop: n > 2, loopAdditionalSlides: 1, grabCursor: true,
        watchSlidesProgress: false, preventClicks: true, preventClicksPropagation: true, pagination: { el: el.querySelector(".swiper-pagination"), clickable: true },
      }));
    });
    // Work photos: original initImageSwiperThumb — thumbnails line up at their own width, and the large photo slides over 1.2s and loops endlessly (when there are four or more slides)
    root.querySelectorAll("[data-gallery]").forEach((el) => {
      const main = el.querySelector(".dt__main"), thumb = el.querySelector(".dt__thumbs");
      if (!main || !thumb) return;
      const th = thumb.querySelectorAll(".swiper-slide").length > 1 ? new Swiper(thumb, { slidesPerView: "auto", slidesPerGroup: 1, speed: 1200, loop: false, grabCursor: false, watchSlidesProgress: false, preventClicks: true, preventClicksPropagation: true }) : null;
      if (th) swipers.push(th);
      if (main.querySelectorAll(".swiper-slide").length > 3) {
        swipers.push(new Swiper(main, {
          slidesPerView: 1, slidesPerGroup: 1, speed: reduced ? 0 : 1200, initialSlide: 0, centeredSlides: false, loop: true, loopAdditionalSlides: 1, grabCursor: true,
          watchSlidesProgress: false, preventClicks: true, preventClicksPropagation: true,
          navigation: { nextEl: el.querySelector("[data-next]"), prevEl: el.querySelector("[data-prev]") }, thumbs: { swiper: th },
        }));
      }
    });
  };
  const pages = {};
  SL.page = (name, fn) => { pages[name] = fn; };
  let ctx = null;
  // Separates filling the panel with text and pictures (contact strip, footer, hand drawing) from attaching motion — the original attaches swiper and scroll motion after the new panel has fully appeared (afterEnter)
  const prepContainer = (root) => {
    fillChrome(root);
    root.querySelectorAll("[data-ill]").forEach((el) => { if (!el.innerHTML.trim()) { el.classList.add("sl-ill"); el.innerHTML = ILL[el.dataset.ill] || ""; } });
  };
  const initContainer = (root) => {
    initSwipers(root);
    ctx = gsap.context(() => {
    // ── Hand-drawn loop: wriggle (the original MorphSVG pose change, 1.5s sine.inOut back and forth, done as a tilt) ──
    if (!reduced) {
      // The flip uses _fx/squash-flip-loop (original flip-whole — .3s up to .02 · .5s hold · 3s rest)
      root.querySelectorAll("[data-wiggle]").forEach((el, i) => {
        const svg = el.querySelector("svg");
        gsap.to(svg, { rotate: i % 2 ? -4 : 4, skewX: i % 2 ? 2 : -2, duration: 1.5, ease: "sine.inOut", yoyo: true, repeat: -1, transformOrigin: "50% 100%", delay: i * 0.3 });
      });
    }

    // ── Scroll motion ──
    gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
      root.querySelectorAll('[data-anim="fade"]').forEach((el) => {
        gsap.fromTo(el, { opacity: 0, y: 30, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, ease: "none",
          // The original passes scrub as a string "0.5" Passed as a string so GSAP does not read it as a number — in practice it runs with no follow delay (scrub: true)
          scrollTrigger: { trigger: el, start: el.dataset.start || "top bottom", end: el.dataset.end || "bottom center", scrub: true } });
      });
      // Photo inside the frame: the overflow amount moves from bottom → in place (original image-wrapper / image-content direction-bottom)
      root.querySelectorAll('[data-par="wrap"]').forEach((wrap) => {
        const content = wrap.querySelector("[data-par-content]");
        const scale = wrap.querySelector("[data-par-scale]");
        const start = wrap.dataset.parStart || "top bottom", end = wrap.dataset.parEnd || "bottom top";
        if (content) {
          gsap.from(content, { y: () => -(content.offsetHeight - wrap.offsetHeight), ease: "none",
            scrollTrigger: { trigger: wrap, start, end, scrub: 1, invalidateOnRefresh: true } });
        }
        const fade = wrap.hasAttribute("data-par-fade");
        if (scale) {
          gsap.fromTo(scale, { scale: 1.2, transformOrigin: "center center" }, { scale: 1, ease: "none", scrollTrigger: { trigger: wrap, start, end, scrub: fade ? true : 1 } });
        }
        if (fade) gsap.fromTo(scale || wrap, { opacity: 0 }, { opacity: 1, duration: 3, ease: "power2.out" });
      });
    });
      const ns = root.dataset.barbaNamespace || page;
      pages[ns]?.(root);
    }, root);
  };
  const killContainer = () => {
    ctx?.revert();
    ctx = null;
    swipers.splice(0).forEach((s) => s.destroy(true, true));
  };

  // Re-attach the header’s current-page marker as the panel label
  const markNav = (ns) => {
    document.body.dataset.page = ns;
    document.querySelectorAll(".sl-head__list a").forEach((a, i) => {
      const p = nav[i]?.[2];
      a.classList.toggle("is-active", !!p && (p === ns || (p === "works" && ns === "detail")));
    });
  };

  // ── Page transition: original barba 2.10.3 fade — leaving panel fades out .5s power2.out → to top → new panel appears .5s power2.out ──
  const start = () => {
    const first = document.querySelector('[data-barba="container"]') || document.body;
    prepContainer(first);
    initContainer(first);
    if (!window.barba || reduced) return;
    barba.init({
      preventRunning: true,
      // Links to the same page (# jumps, placeholder #) are not intercepted by barba — # jumps glide with Lenis
      prevent: ({ href }) => new URL(href, location.href).pathname === location.pathname,
      requestError: (trigger, action, url) => { location.href = url; return false; },
      transitions: [{
        name: "fade",
        async leave({ current }) {
          SL.lenis?.stop();
          gsap.set(current.container, { zIndex: 2, opacity: 1 });
          await gsap.to(current.container, { duration: 0.5, ease: "power2.out", opacity: 0 });
        },
        async beforeEnter({ current, next }) {
          killContainer();
          gsap.set(next.container, { zIndex: 1, opacity: 0 });
          if (current.container?.isConnected) gsap.set(current.container, { position: "absolute" });
          scrollTo(0, 0);
          SL.lenis?.scrollTo(0, { immediate: true, force: true });
          SL.lenis?.start();
          markNav(next.namespace);
          prepContainer(next.container);
        },
        async enter({ next }) {
          await gsap.to(next.container, { duration: 0.5, ease: "power2.out", opacity: 1, clearProps: "opacity,zIndex" });
        },
        after({ next }) {
          initContainer(next.container);
          ScrollTrigger.refresh();
          const h = location.hash && next.container.querySelector(location.hash);
          if (h) SL.lenis ? SL.lenis.scrollTo(h, { offset: -80 }) : h.scrollIntoView();
        },
      }],
    });
  };
  // The first board is hooked up after the page js (index.js, works.js, detail.js) registers its name on SL.page
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else setTimeout(start);

  // In-page # link: slide down with Lenis
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href*='#']");
    if (!a) return;
    const u = new URL(a.href, location.href);
    if (u.pathname !== location.pathname || !u.hash) return;
    const tgt = document.getElementById(u.hash.slice(1));
    if (!tgt) return;
    e.preventDefault();
    SL.lenis ? SL.lenis.scrollTo(tgt, { offset: -80 }) : tgt.scrollIntoView({ behavior: "smooth" });
  });
})();
