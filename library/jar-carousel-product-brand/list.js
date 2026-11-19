// Product warehouse page: draws the table, then hooks up photo panel spread, parallax, cover sentence, front cutout parallax and bottom category pills.
// Original values: panel --cover-inset 1→0 (top top → +=100, scrub) · photo yPercent −10→10 (top top → bottom top). The product cell strip is in slides.js.
(() => {
  const AG = window.AG;
  const P = AG.PRODUCTS;

  const table = document.querySelector(".mono__table");
  for (let i = 1; i <= 10; i++) {
    table.insertAdjacentHTML("beforeend", `<div class="mono__row" role="row"><span>Your product name ${String(i).padStart(2, "0")}</span><span>${i < 8 ? "00 months" : "0 months"}</span><span class="mono__w">00g</span></div>`);
  }

  // Front cutout: product bottle + branch and tomato (drawn in the same composition as the original photo cutout spot)
  const front = document.querySelector("[data-front]");
  const veg = (k, cls) => AG.fruitSVG(AG.FRUITS[k]).replace("<svg ", `<svg class="${cls}" `);
  front.innerHTML = veg(2, "veg-l") + AG.jarSVG(P[1]) + veg(4, "veg-r");

  // Dark section title: if the text width exceeds .88 of the section width, shrink it by that excess (original section component) — the Korean placeholder also fits inside the section
  const sBox = document.querySelector(".savoury__box"), sTitle = sBox?.querySelector(".savoury__title");
  const fitTitle = () => {
    if (!sBox || !sTitle) return;
    sTitle.style.fontSize = "";
    const max = sBox.clientWidth * 0.88, range = document.createRange();
    range.selectNodeContents(sTitle);
    const w = range.getBoundingClientRect().width;
    if (w > max) sTitle.style.fontSize = `${((parseFloat(getComputedStyle(sTitle).fontSize) * max) / w).toFixed(2)}px`;
  };
  (document.fonts?.ready ?? Promise.resolve()).then(fitTitle);
  if (sBox) new ResizeObserver(() => requestAnimationFrame(fitTitle)).observe(sBox);

  const mm = gsap.matchMedia();
  mm.add({ motion: "(prefers-reduced-motion: no-preference)", phone: "(max-width: 480px)" }, (ctx) => {
    const { motion, phone } = ctx.conditions;
    const hero = document.querySelector(".pg-hero");
    const heroCover = hero.querySelector("[data-cover]");
    const coverTitle = hero.querySelector(".pg-hero__cover-title");
    if (!motion) {
      document.querySelectorAll("[data-cover]").forEach((c) => { c.style.setProperty("--cover-inset", 0); c.classList.add("is-revealed"); });
      coverTitle.classList.add("is-split");
      return;
    }
    AG.onIntro(() => requestAnimationFrame(() => requestAnimationFrame(() => heroCover.classList.add("is-revealed"))));
    gsap.fromTo(heroCover, { "--cover-inset": 1 }, { "--cover-inset": 0, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "+=100", scrub: true } });
    gsap.fromTo(heroCover.querySelector("[data-cover-media]"), { yPercent: -10 }, { yPercent: 10, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true } });

    // The cover sentence rises when the board touches the top of the screen, and reverses on scroll back up (on phones, once on entry)
    const titleTl = AG.splitReveal(coverTitle);
    if (phone) AG.onIntro(() => titleTl.play());
    else ScrollTrigger.create({ trigger: heroCover, start: "top top", onEnter: () => titleTl.play(), onLeaveBack: () => titleTl.reverse() });

    const outro = document.querySelector(".outro__cover");
    gsap.fromTo(outro, { "--cover-inset": 1 }, { "--cover-inset": 0, ease: "none", scrollTrigger: { trigger: outro, start: "top bottom", end: "center center", scrub: true } });
    ScrollTrigger.create({ trigger: outro, start: "top 85%", once: true, onEnter: () => outro.classList.add("is-revealed") });
    gsap.fromTo(outro.querySelector("[data-cover-media]"), { yPercent: -10 }, { yPercent: 10, ease: "none", scrollTrigger: { trigger: outro, start: "top bottom", end: "bottom top", scrub: true } });

    document.querySelectorAll(".pd__cover [data-parallax], .mono__cover [data-parallax]").forEach((m) =>
      gsap.fromTo(m, { yPercent: -10 }, { yPercent: 10, ease: "none", scrollTrigger: { trigger: m.parentElement, start: "top bottom", end: "bottom top", scrub: true } }));

    // Original parallax helper value — 3 → −14%, clamped up and down so it doesn’t leave the plate (offsetParent)
    const clampY = (v) => {
      const box = front.offsetParent instanceof HTMLElement ? front.offsetParent : front.parentElement, h = front.offsetHeight;
      if (!h) return v;
      const lo = (-Math.max(front.offsetTop + h - box.clientHeight - 1, 0) / h) * 100, hi = (Math.max(-front.offsetTop - 1, 0) / h) * 100;
      return Math.min(Math.max(v, lo), hi);
    };
    gsap.fromTo(front, { yPercent: () => clampY(3) }, { yPercent: () => clampY(-14), ease: "none", scrollTrigger: { trigger: ".savoury__box", start: "top bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true } });
  });

  // Lower category pills
  const nav = document.querySelector(".pnav");
  const links = [...nav.querySelectorAll(".pnav__link")];
  const pill = nav.querySelector(".pnav__pill");
  const current = nav.querySelector(".pnav__current-text");
  const cats = links.map((l) => document.querySelector(l.dataset.to));
  let active = -1;
  const setActive = (i) => {
    if (i === active) return;
    active = i;
    links.forEach((l, k) => l.classList.toggle("is-active", k === i));
    const l = links[i];
    pill.style.width = `${l.offsetWidth}px`;
    pill.style.height = `${l.offsetHeight}px`;
    pill.style.transform = `translate(${l.offsetLeft}px, ${l.offsetTop}px)`;
    current.textContent = l.textContent;
  };
  setActive(0);
  ScrollTrigger.create({
    trigger: "#cat-1", start: "top 80%", endTrigger: ".outro", end: "bottom 60%",
    onToggle: (self) => nav.classList.toggle("is-visible", self.isActive),
  });
  cats.forEach((c, i) => ScrollTrigger.create({ trigger: c, start: "top 50%", end: "bottom 50%", onToggle: (s) => s.isActive && setActive(i) }));
  links.forEach((l, i) => l.addEventListener("click", () => {
    nav.classList.remove("is-open");
    if (AG.lenis) AG.lenis.scrollTo(cats[i], { offset: 0, duration: 1.2 }); else cats[i].scrollIntoView({ behavior: "smooth" });
  }));
  nav.querySelector(".pnav__current").addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    nav.querySelector(".pnav__current").setAttribute("aria-expanded", String(open));
  });
  addEventListener("resize", () => { const i = active; active = -1; setActive(i); });

  ScrollTrigger.refresh();
})();
