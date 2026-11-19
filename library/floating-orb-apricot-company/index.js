// Home-only motion — original main.js fy (title) · dy (culture circle) · py (product circle) · my (company · careers ball) · _y (community panel) · hy (ball on/off) · xy (ball cropped into the first box) · My (News background color)
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const S = window.anSpheres;
  const $ = (s) => document.querySelector(s);

  // First box photo: stacked, and every 4s they swap with a 2s crossfade (original STUDIO slide — the mid-scene where the two overlap is visible)
  const slides = [...document.querySelectorAll(".an-mv__slide")];
  if (!reduce && slides.length > 1) {
    let i = 0;
    setInterval(() => { slides[i].classList.remove("is-on"); i = (i + 1) % slides.length; slides[i].classList.add("is-on"); }, 4000);
  }

  // Title: two span layers per line — the inner one rises from 100% below over 1.5s power3.out (.2s apart), and from .9s before the end it sweeps gray→ink over .7s
  const h1 = $(".an-mv__title");
  const lines = h1.innerHTML.split(/<br\s*\/?>/);
  h1.innerHTML = "";
  lines.forEach((t) => { const o = document.createElement("span"), i = document.createElement("span"); i.textContent = t; o.append(i); h1.append(o); });
  const inner = h1.querySelectorAll(":scope > span > span");
  if (reduce) gsap.set(h1, { opacity: 1 });
  else {
    gsap.set(inner, { translate: "0 100%" });
    gsap.timeline({ delay: 0.2 })
      .set(h1, { opacity: 1 })
      .fromTo(inner, { translate: "0 100%" }, { translate: "0 0%", stagger: 0.2, ease: "power3.out", duration: 1.5 })
      .fromTo(inner, { backgroundPosition: "100% 50%" }, { backgroundPosition: "0% 50%", stagger: 0.2, ease: "power1.out", duration: 0.7 }, "-=0.9");
  }

  // Ball: while the first box is visible it is clipped to the box shape (rounded 24px) and flows with the document, on leaving, it returns to screen-fixed and hides
  const box = $("#mv-box");
  const canvas = $(".an-webgl");
  if (S && canvas) {
    const measure = () => {
      const r = box.getBoundingClientRect();
      canvas.style.setProperty("--clip", `rect(${r.top + scrollY}px ${r.left + r.width}px ${r.top + r.height + scrollY}px ${r.left}px round 24px)`);
    };
    new ResizeObserver(measure).observe(box);
    measure();
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { S.clip("var(--clip)"); S.activate(); S.show({ duration: 0 }); }
      else { S.clip(null); S.deactivate(); S.hide({ duration: 0 }); }
    }).observe(box);
  }

  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    if (S) {
      ScrollTrigger.create({ trigger: "#home-product-qast", start: "top 150%", onEnter: () => S.show(), onLeaveBack: () => S.hide() });
      ScrollTrigger.create({ trigger: "#home-product-images", start: "bottom 150%", onEnter: () => S.hide(), onLeaveBack: () => S.show() });
      ScrollTrigger.create({ trigger: "#home-company-recruit", start: "top 50%", onEnter: () => S.show(), onLeaveBack: () => S.hide() });
      ScrollTrigger.create({ trigger: "#home-media", start: "top 50%", onEnter: () => S.hide(), onLeaveBack: () => S.show() });
    }
    // Culture: pins while the product section comes in, and once the circle passes half the screen it spreads 0 → 71% across two screens
    const culture = $("#home-culture"), product = $("#home-product");
    ScrollTrigger.create({ trigger: product, pin: culture, start: "top bottom", end: "bottom top", pinSpacing: false });
    gsap.fromTo(culture, { "--progress": 0 }, { "--progress": 1, ease: "none", scrollTrigger: { trigger: product, start: "top bottom-=50%", end: "+=200%", scrub: true } });
    // Product panel: sticks while the photo group passes, and a background-color circle spreads across one screen
    const qast = $("#home-product-qast"), shots = $("#home-product-images");
    ScrollTrigger.create({ trigger: shots, pin: qast, start: "top bottom", end: "bottom top", pinSpacing: false });
    gsap.fromTo(qast, { "--progress": 0 }, { "--progress": 1, ease: "none", scrollTrigger: { trigger: shots, start: "top bottom-=50%", end: "+=100%", scrub: true } });
    // Company·Careers: with the ball plate pinned to the screen, 0 → 1 until the end of the Careers section, the company plate stays pinned at center until the Careers section touches the screen bottom
    const cr = $("#home-company-recruit"), bg = $(".an-cr__bg"), company = $("#home-company"), recruit = $("#home-recruit");
    gsap.fromTo(bg, { "--progress": 0 }, { "--progress": 1, ease: "none", scrollTrigger: { trigger: bg, pin: bg, scrub: true, start: "top top", endTrigger: recruit, end: "bottom bottom", pinSpacing: false } });
    ScrollTrigger.create({ trigger: company, pin: company, start: "center center", endTrigger: recruit, end: "top bottom", pinSpacing: false });
    // Community panel: moves from -100px to its place while travelling from the screen bottom to the top
    gsap.fromTo("#home-media", { "--progress": 0 }, { "--progress": 1, ease: "none", scrollTrigger: { trigger: "#home-media", start: "top bottom", end: "top top", scrub: true } });
    // Product photo group: original STUDIO flow — drifts slowly sideways, looping endlessly
    const row = $(".an-shots__row");
    row.append(...[...row.children].map((n) => n.cloneNode(true)));
    const loop = gsap.to(row, { xPercent: -50, duration: 42, ease: "none", repeat: -1 });
    return () => loop.kill();
  });

  // When a news section head reaches 50% of the screen, the body background becomes that section’s color — the company·recruit panels also show that color through
  const news = $("#home-news");
  const newsColor = getComputedStyle(news).backgroundColor;
  gsap.set([news, $("#home-company-recruit")], { background: "transparent" });
  ScrollTrigger.create({
    trigger: news,
    start: "top 50%",
    onEnter: () => gsap.set("body", { background: newsColor, "--active-bg-color": newsColor }),
    onLeaveBack: () => { document.body.style.background = ""; document.body.style.removeProperty("--active-bg-color"); },
  });
})();
