// Home page motion — loader-and-stairs loop Lottie (header, title, menu after 5.5s), card fan hover, yellow bar cover (ScrollTrigger scrub), fixed photo background.
(() => {
  const { art } = window.CREA;
  const body = document.body;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── Hero Lottie (loader and stair loop) — as in the original, lottie-web svg · loop · autoplay. Colors are filled in with skin values by fill name (nm) ── */
  const stairs = document.querySelector(".h-stairs");
  const paint = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const rgbOf = (name) => {
    const probe = document.createElement("i");
    probe.style.color = `var(--${name})`;
    document.body.append(probe);
    paint.clearRect(0, 0, 1, 1);
    paint.fillStyle = getComputedStyle(probe).color;
    probe.remove();
    paint.fillRect(0, 0, 1, 1);
    return [...paint.getImageData(0, 0, 1, 1).data].slice(0, 3);
  };
  const tones = new Map();
  const tone = (name) => tones.get(name) || tones.set(name, rgbOf(name)).get(name);
  const dress = (node) => {
    if (Array.isArray(node)) return node.forEach(dress);
    if (!node || typeof node !== "object") return;
    if (node.ty === "fl" && /^(kf|site)-/.test(node.nm)) node.c.k = [...tone(node.nm).map((v) => v / 255), 1];
    if (node.ty === 1 && node.nm === "kf-bg") node.sc = `#${tone("kf-bg").map((v) => v.toString(16).padStart(2, "0")).join("")}`;
    Object.values(node).forEach(dress);
  };
  const heroData = structuredClone(window.CREA_HERO_LOTTIE);
  dress(heroData);
  const hero = lottie.loadAnimation({ container: stairs, renderer: "svg", loop: true, autoplay: !reduce, animationData: heroData });

  /* ── 12 business cards · 8 org cells · 6 code-of-conduct cells · modal card ── */
  const fan = document.querySelector(".h-fan");
  const EN = ["Business Line One", "Business Line Two", "Business Line Three", "Business Line Four", "Business Line Five", "Business Line Six",
    "Business Line Seven", "Business Line Eight", "Business Line Nine", "Business Line Ten", "Business Line Eleven", "Business Line Twelve"];
  fan.innerHTML = EN.map((en, i) => `
    <div class="c-card" style="z-index:${12 - i}">
      <div class="c-card__tag is-number"></div>
      <div class="h-card__content">
        <div class="h-card__art">${art(i)}</div>
        <div class="h-card__text">
          <h4>Your business name here<br>Keep it to two lines</h4>
          <p>Your business description here<br>Keep it to two lines.</p>
          <div class="c-btn"><button type="button" class="h-card__btn s${i + 1}" data-modal-open="service${i + 1}">Business Details</button></div>
        </div>
      </div>
      <div class="h-card__en">${en}</div>
    </div>`).join("");

  document.querySelector(".h-structure__grid").innerHTML = Array.from({ length: 8 }, (_, i) => `
    <li><a class="h-structure__link part${i + 1}" href="#" data-modal-open="part${i + 1}">
      <h4>Your department $ here{i + 1}${i % 3 === 1 ? "<small>(Sub Name)</small>" : ""}</h4>
      <div class="h-structure__text"><p>Your department’s responsibilities here<br>Keep it to about three lines.<br>We keep it short.</p><span class="c-arrow"></span></div>
    </a></li>`).join("");

  const WORDS = [["M", "otion"], ["I", "nsight"], ["R", "espect"], ["A", "mbition"], ["I", "dea"], ["C", "o-Craft"]];
  document.querySelector(".h-mirai__grid").innerHTML = WORDS.map(([f, r], i) => `
    <li><a class="h-mirai__link mirai${i + 1}" href="#" data-modal-open="mirai${i + 1}">
      <span class="c-en"><span>${f}</span>${r}</span>
      <span class="h-mirai__ja"><span class="c-arrow"></span>Value ${i + 1}</span>
    </a></li>`).join("");

  const modalCards = [];
  EN.forEach((en, i) => modalCards.push(`
    <div class="c-card" data-card="service${i + 1}">
      <div class="c-card__tag" data-pre="Service">${String(i + 1).padStart(2, "0")}</div>
      <div class="m-card__content">
        <div class="m-card__sec m-lead">
          <div><h3>Your business name here<br>Keep it to two lines</h3>
            <p>Your business introduction goes here in about four lines. In order: which customers it helps and with what, how it differs from others, and its place within the company.</p>
            <ul class="m-tags"><li>Department in charge 1</li><li>Department in charge 2</li></ul></div>
          ${art(i)}
        </div>
        <div class="m-card__sec m-over">
          <div><h4>Examples of Our Work</h4><ul><li>Your example one here</li><li>Your example two here</li><li>Your example three here</li></ul></div>
          <div><h4>Key Clients</h4><ul><li>Your one customer type in one line here</li><li>Two client types in one line here</li><li>Your three customer types here</li></ul>
            <div class="c-btn is-gray"><a href="#">Customer review</a></div></div>
        </div>
        <div class="m-card__sec"><div class="c-btn is-center"><a href="#">To the business page</a></div></div>
      </div>
    </div>`));
  for (let i = 0; i < 8; i++) modalCards.push(`
    <div class="c-card" data-card="part${i + 1}">
      <div class="c-card__tag" data-pre="Part">${String(i + 1).padStart(2, "0")}</div>
      <div class="m-card__content">
        <div class="m-card__sec m-lead"><div><h3>Your department $ here{i + 1}</h3><p>Your department introduction goes here in about three lines. Say which teams it is made up of and what each team does.</p></div></div>
        <div class="m-card__sec"><div class="m-chart-box c-scroll"><div class="wf-img m-chart" data-label="Department org chart graphic · yellow boxes joined by lines · landscape 16:7"></div></div></div>
      </div>
    </div>`);
  WORDS.forEach(([f, r], i) => modalCards.push(`
    <div class="c-card" data-card="mirai${i + 1}" data-yellow>
      <div class="c-card__tag" data-pre="">${f}</div>
      <div class="m-card__content m-mirai">
        <div class="m-card__sec"><h3>${f}${r}<span>Value ${i + 1}</span></h3></div>
        <div class="m-card__sec m-points">
          ${[1, 2, 3].map((k) => `<div><div class="wf-img" data-label="Working scene ${k} · Office natural light · landscape 3:2"></div>
            <small>Point</small><h4>Your key point heading here<br>In two lines.</h4><p>Your key point here.</p>
            <p>Your expanded body copy here, about three lines. Explain why this attitude is needed and how it is put into practice.</p></div>`).join("")}
        </div>
      </div>
    </div>`));
  document.querySelector(".c-modal__inner").innerHTML = modalCards.join("");

  /* Philosophy background rays: 14 rounded bars radiating from the center (newly drawn instead of the original image) */
  const rays = Array.from({ length: 14 }, (_, i) => {
    const a = (i / 14) * 360 + (i % 2 ? 6 : 0);
    const len = [150, 110, 170, 120, 140, 100, 160][i % 7];
    return `<rect x="${540 - 22}" y="${540 - 120 - len * 2}" width="44" height="${len * 2}" rx="18" transform="rotate(${a} 540 540)"/>`;
  }).join("");
  document.documentElement.style.setProperty(
    "--h-rays",
    `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1080">${rays}</svg>`)}")`
  );

  /* 16 yellow bar covers (the 16th is hidden, phone shows only 9) */
  const overlay = document.querySelector(".h-overlay");
  overlay.innerHTML = Array.from({ length: 16 }, (_, i) => `<span class="o${i + 1}"${i === 15 ? ' style="display:none"' : ""}></span>`).join("");

  /* Card fan: hovering a card that isn’t frontmost folds the other cards into 3.75rem strips */
  if (matchMedia("(min-width: 769px)").matches) {
    const cards = [...fan.children];
    cards.forEach((card, i) => {
      card.addEventListener("mouseenter", () => {
        if (i === 0) return;
        cards.forEach((c) => c !== card && c.classList.add("is-folded"));
      });
      card.addEventListener("mouseleave", () => cards.forEach((c) => c.classList.remove("is-folded")));
    });
  }

  const reveal = () => {
    body.classList.remove("is-loading");
    body.classList.add("is-shown");
  };

  const mm = gsap.matchMedia();
  mm.add({ motion: "(prefers-reduced-motion: no-preference)", reduce: "(prefers-reduced-motion: reduce)" }, (ctx) => {
    if (ctx.conditions.reduce) {
      hero.addEventListener("DOMLoaded", () => hero.goToAndStop(300, true));
      reveal();
      gsap.set(".h-inst__bg", { opacity: 1 });
      return;
    }
    // Original: 5.5s after DOMContentLoaded, turns on the header line, title and menu and releases scroll (meanwhile Lottie draws the loader)
    const t = setTimeout(reveal, 5500);
    return () => clearTimeout(t);
  });

  /* ── Scroll: original ScrollTrigger values as they are ── */
  gsap.registerPlugin(ScrollTrigger);
  const bg = document.querySelector(".h-inst__bg");
  const shuffle = (a) => {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  mm.add({ pc: "(min-width: 768px) and (prefers-reduced-motion: no-preference)", sp: "(max-width: 767px) and (prefers-reduced-motion: no-preference)" }, (ctx) => {
    gsap.fromTo(bg, { opacity: 0 }, { opacity: 1, ease: "power2.out", scrollTrigger: { trigger: "#philosophy", start: "top 20%", end: "top 10%", scrub: true } });
    ScrollTrigger.create({
      trigger: "#institutions",
      start: "top top",
      onEnter: () => bg.classList.add("is-pinned-off"),
      onLeaveBack: () => bg.classList.remove("is-pinned-off")
    });

    const spans = gsap.utils.toArray(".h-overlay span");
    const o16 = spans[15], o15 = spans[14], o14 = spans[13];
    const rest = spans.filter((s) => s !== o16 && s !== o15 && s !== o14);
    const grow = [o16, o15, o14, ...shuffle([...rest])];
    const slide = [o16, o15, o14, ...shuffle([...rest])];
    gsap.set(spans, { y: "100vh", borderRadius: "0.5rem 0.5rem 0 0", transformOrigin: "bottom center" });
    gsap.to(grow, { y: 0, stagger: 0.01, ease: "power2.out", overwrite: "auto",
      scrollTrigger: { trigger: "#our", start: ctx.conditions.sp ? "bottom 70%" : "bottom 100%", end: "bottom 40%", scrub: 1 } });
    gsap.to(grow, { borderRadius: "0px", stagger: 0.03, ease: "power2.out",
      scrollTrigger: { trigger: "#our", start: "bottom 30%", end: "bottom 20%", scrub: 1 } });
    gsap.to(slide, { borderRadius: "0 0 0.5rem 0.5rem", stagger: 0.03, ease: "power2.out",
      scrollTrigger: { trigger: "#philosophy", start: "bottom 90%", end: "bottom 80%", scrub: 1 } });
    gsap.to(slide, { y: "-100vh", stagger: 0.03, ease: "power2.in", overwrite: "auto",
      scrollTrigger: { trigger: "#philosophy", start: "bottom 80%", end: "bottom top", scrub: 1 } });
    gsap.fromTo("#philosophy", { opacity: 0, y: 150, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, ease: "power2.out", scrollTrigger: { trigger: "#philosophy", start: "top 150%", end: "top 50%", scrub: 4 } });
  });
  // For users who turned motion off, shown as a yellow-background section with no cover
  mm.add("(prefers-reduced-motion: reduce)", () => {
    gsap.set(".h-overlay", { display: "none" });
    gsap.set("#philosophy", { backgroundColor: "var(--kf-accent)" });
  });
})();
