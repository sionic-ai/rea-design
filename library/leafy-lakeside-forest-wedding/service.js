// Service — three pricing cards stamped from a template, hero timeline (original layerImageKv), intro photo fade carousel (splide fade · every 3s for 1s · only while visible),
// The contents button glides with lenis to that section. This page uses the GSAP default curve (power1.out) just like the original
(() => {
  const { reduced, lenis } = window.TW;

  const PLANS = [
    { num: "plan A", scale: "(Based on 48 people)", name: "Lakeside wedding pricing", lead: "One pair a day only! Add one line here on who this rate is right for", cost: "0,000,000", icons: [["ic-venue", "Place"], ["ic-dress", "Costume (ceremony props)"], ["ic-meal", "Meals\nDrinks\nCake"], ["ic-tent", "Outdoor equipment"], ["ic-flower", "Decorative Flower"], ["ic-bus", "Shuttle (nearby)"], ["ic-camera", "Filming"]] },
    { num: "plan B", scale: "(Based on 30 people)", name: "Garden Party Pricing", lead: "Your one line on who this plan suits here.", cost: "0,000,000", icons: [["ic-venue", "Place"], ["ic-meal", "Meals and Drinks"], ["ic-flower", "Decorative Flower"], ["ic-camera", "Filming"]] },
    { num: "plan C", scale: "(Based on 20 people)", name: "Camping wedding pricing", lead: "Your one line on who this plan suits here.", cost: "000,000", icons: [["ic-tent", "Outdoor equipment"], ["ic-meal", "Meals and Drinks"], ["ic-flower", "Decorative Flower"], ["ic-bus", "Shuttle"], ["ic-camera", "Filming"]] },
  ];
  const ROWS = [["Venue rental fee", "◯", "1", "000,000"], ["Production · Planning", "◯", "1", "000,000"], ["Meal (per person)", "◯", "48", "0,000,000"], ["Drink (1 person)", "", "48", "000,000"], ["Decoration · Flower", "", "1", "000,000"], ["※ Shoot", "", "1", "000,000"]];
  const tpl = document.getElementById("tw-plan");
  const main = document.querySelector(".tw-price__main");
  const nl = (s) => s.replace(/\n/g, "<br>");
  PLANS.forEach((p) => {
    const n = tpl.content.firstElementChild.cloneNode(true);
    n.querySelector(".tw-plan__num").textContent = p.num;
    n.querySelector(".tw-plan__scale").textContent = p.scale;
    n.querySelector(".tw-plan__name").textContent = p.name;
    n.querySelector(".tw-plan__lead").textContent = p.lead;
    n.querySelector(".tw-plan__cost-num").textContent = p.cost;
    n.querySelector(".tw-plan__icons-main").innerHTML = p.icons
      .map(([ic, t]) => `<div class="tw-plan__icon"><div class="tw-plan__box"><svg><use href="#${ic}"/></svg></div><p class="tw-plan__icon-txt tw-sp-text">${nl(t)}</p></div>`)
      .join("");
    n.querySelector(".tw-ptable__rows").innerHTML = ROWS.map(
      (r) => `<dl class="tw-ptable__dl${r[0].startsWith("※") ? " tw-ptable__dl--note" : ""}">${r.map((c, i) => `<${i ? "dd" : "dt"} class="tw-ptable__${i ? "dd" : "dt"}"><div class="tw-ptable__cell"><p class="tw-ptable__txt">${c.replace("※ ", "")}</p></div></${i ? "dd" : "dt"}>`).join("")}</dl>`,
    ).join("");
    main.append(n);
  });

  // ── Hero — the sand-colored overlay below (2s · 1s late) is a css transition, the rest is the original timeline ──
  const base = document.querySelector(".tw-skv__base");
  const ja = document.querySelector(".tw-skv__ja");
  const t1 = document.querySelector(".tw-skv__treat--1");
  const t2 = document.querySelector(".tw-skv__treat--2");
  // Attach after the first paint so the css transition runs
  requestAnimationFrame(() => requestAnimationFrame(() => base.classList.add("is-active")));
  if (!reduced) {
    gsap.timeline()
      .set(ja, { filter: "blur(30px)" })
      .set(t2, { alpha: 0, x: "10%" })
      .set(t1, { alpha: 0, x: "-10%", rotate: -2 })
      .to(ja, { duration: 1, filter: "blur(0px)" }, 0)
      .to(t2, { ease: "expo.out", alpha: 1, duration: 2, x: "0%" }, 2.1)
      .to(t1, { ease: "expo.out", alpha: 1, x: "0%", duration: 2 }, "<");
  }

  // ── About photos — splide fade (rewind · every 3s · 1s transition · no drag), autoplays only while on screen ──
  const Intersection = window.splide?.Extensions?.Intersection;
  new Splide(".tw-about__carousel", {
    rewind: true,
    type: "fade",
    interval: 3000,
    speed: 1000,
    autoplay: reduced ? false : "pause",
    intersection: { inView: { autoplay: true } },
    perPage: 1,
    arrows: false,
    drag: false,
    pauseOnFocus: true,
  }).mount(Intersection ? { Intersection } : {});

  // Table of contents — buttons slide in order to #section1~5 (original lenis.scrollTo(offsetTop))
  document.querySelectorAll(".tw-snav__item").forEach((b) =>
    b.addEventListener("click", (e) => {
      e.preventDefault();
      const t = document.querySelector(b.dataset.to);
      if (!t) return;
      lenis ? lenis.scrollTo(t.offsetTop) : scrollTo({ top: t.offsetTop });
    }),
  );
})();
