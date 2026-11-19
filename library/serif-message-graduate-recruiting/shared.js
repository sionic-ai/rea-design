// Draws the header (two-row menu · expanded), phone menu, application strip and footer here so every page uses the same ones. Also hooks up lenis, reveal and background dimming.
(() => {
  const page = document.body.dataset.page || "home";
  const chev = '<i class="ns-chev" aria-hidden="true"></i>';
  const icon = (kind = "") => `<span class="is-icon${kind ? " is-" + kind : ""}" aria-hidden="true"></span>`;
  window.nsIcon = icon;
  const nav = [
    ["recruit.html", "Hiring message"], ["about.html", "Know the Company"], ["about.html#data", "Seen through numbers"], ["works.html", "Know the Work"],
  ];
  const drops = [
    ["The Real Company", ["Story", "New business", "Young Staff Roundtable", "Voices of patients and families"]],
    ["Work style · environment", ["Education · Ways of working", "HR system and training", "Benefits and programs"]],
  ];

  const header = `
<div class="ns-head">
  <a class="ns-logo" href="index.html" aria-label="Your company name, home page here"><span class="ns-logo__mark"></span><span class="ns-logo__name">Your company here<small>NEW GRADUATE RECRUIT</small></span></a>
  <nav class="ns-nav" aria-label="Main menu">
    <div class="ns-nav__top"><a class="ns-pill" href="#">Experienced hiring</a><a class="ns-pill" href="#">Hiring people with disabilities</a></div>
    <ul class="ns-nav__list">
      ${nav.map(([h, t]) => `<li><a class="ns-nav__link" href="${h}">${t}</a></li>`).join("")}
      ${drops.map(([t, items]) => `<li class="ns-nav__drop"><a class="ns-nav__link" href="#" role="button" aria-expanded="false">${t}${chev}</a>
        <div class="ns-sub"><div class="ns-sub__box">${items.map((x) => `<a href="#">${x}</a>`).join("")}</div></div></li>`).join("")}
    </ul>
  </nav>
  <div class="ns-head__btns">
    <a class="ns-head__btn" href="#">Application guidelines</a>
    <div class="ns-head__entry ns-nav__drop" tabindex="0"><span>Entry / My Page</span>${chev}
      <div class="ns-sub ns-sub--entry"><div class="ns-sub__box">
        <p>Class of 2027</p><a href="#">Entry</a><a href="#">My Page</a>
        <p>Class of 2028</p><a href="#">Entry</a><a href="#">My Page</a>
      </div></div>
    </div>
  </div>
  <button class="ns-burger" type="button" aria-label="Open Menu" aria-expanded="false"><span></span></button>
</div>`;

  const spMenu = `
<div class="ns-sp" aria-hidden="true">
  <div class="ns-sp__box">
    <ul>${nav.map(([h, t]) => `<li><a href="${h}">${t}</a></li>`).join("")}
      ${drops.map(([t, items]) => `<li><details><summary>${t}</summary>${items.map((x) => `<a href="#">${x}</a>`).join("")}</details></li>`).join("")}</ul>
    <a class="ns-sp__btn" href="#">Application guidelines</a>
    <details class="ns-sp__entry"><summary>Entry / My Page</summary><div><p>Class of 2027<a href="#">Entry</a><a href="#">My Page</a></p><p>Class of 2028<a href="#">Entry</a><a href="#">My Page</a></p></div></details>
    <div class="ns-sp__sub"><a href="#">Experienced hiring</a><a href="#">Hiring people with disabilities</a></div>
  </div>
</div>`;

  const offer = `
<div class="ns-offer__in">
  <h2 class="ns-offer__title">Your big text here,<br>One-line pledge.</h2>
  <div class="ns-offer__body"><p class="ns-offer__text">Your one line here encouraging people to apply.<br>One line on who you’re looking for goes here.</p>
  <a class="ns-cta" href="#">Recruitment guidelines${icon()}</a></div>
  <div class="ns-offer__more"><a class="c-button" href="#">Experienced hires${icon("out")}</a><a class="c-button" href="#">Hiring people with disabilities${icon("out")}</a></div>
</div>`;

  const footer = `
<div class="ns-foot__panel">
  <div class="ns-foot__menu">
    <ul class="ns-foot__col is-main">${nav.map(([h, t]) => `<li><a href="${h}">${t}</a></li>`).join("")}</ul>
    ${drops.map(([t, items]) => `<div class="ns-foot__col"><p>${t}</p>${items.map((x) => `<a href="#">${x}</a>`).join("")}</div>`).join("")}
    <div class="ns-foot__col"><p>Application guidelines</p></div>
    <div class="ns-foot__col"><p>Class of 2027</p><a href="#">Entry</a><a href="#">My Page</a><p class="is-gap">Class of 2028</p><a href="#">Entry</a><a href="#">My Page</a></div>
  </div>
  <a class="ns-foot__note" href="#"><div class="wf-img" data-label="Two people standing by a meeting room window · daylight · portrait 3:2"></div><p class="ns-foot__note-logo">SAMPLE<small>Your record sheet name here</small></p><p>Your intro goes here, about three lines, presenting a newsletter that shares the work and challenges of team members.</p>${icon("out")}</a>
  <div class="ns-foot__links"><a href="#">Experienced hiring</a><a href="#">Hiring people with disabilities</a><a href="#">Company site ↗</a></div>
  <div class="ns-foot__bottom"><a href="#">Your fair hiring policy here</a><small>© SAMPLE CO., LTD.</small></div>
</div>`;

  const fill = (slot, html) => { const n = document.querySelector(`[data-slot="${slot}"]`); if (n) n.innerHTML = html; };
  fill("header", header);
  fill("offer", offer);
  fill("footer", footer);
  document.body.insertAdjacentHTML("beforeend", spMenu);

  // The unfolding panel appears right away (original 0ms), and after the pointer leaves it waits .08s before folding — the button color returns then too (original hover-out is 159ms late)
  document.querySelectorAll(".ns-nav__drop").forEach((li) => {
    const btn = li.querySelector(".ns-nav__link");
    let t = 0;
    const set = (v) => { li.classList.toggle("is-open", v); btn?.setAttribute("aria-expanded", String(v)); };
    li.addEventListener("pointerenter", () => { clearTimeout(t); set(true); });
    li.addEventListener("pointerleave", () => { clearTimeout(t); t = setTimeout(() => set(false), 80); });
    btn?.addEventListener("click", (e) => { e.preventDefault(); set(!li.classList.contains("is-open")); });
  });

  // Phone menu — drops down as a whole board from above (-100vh → 0), opacity 0→1, .5s ease
  const burger = document.querySelector(".ns-burger"), sp = document.querySelector(".ns-sp");
  burger?.addEventListener("click", () => {
    const open = !document.body.classList.contains("is-menu-open");
    document.body.classList.toggle("is-menu-open", open);
    burger.setAttribute("aria-expanded", String(open));
    sp.setAttribute("aria-hidden", String(!open));
  });

  // Header white background — like the original js-fixedheader, laid down as soon as you scroll even slightly
  const hdrSlot = document.querySelector('[data-slot="header"]');
  const onScroll = () => hdrSlot?.classList.toggle("is-scrolled", scrollY > 0);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Current page
  document.querySelectorAll(".ns-nav__link[href]").forEach((a) => { if (a.getAttribute("href") === `${page}.html`) a.setAttribute("aria-current", "page"); });

  // Smooth scroll: original Lenis 1.3.1, lerp .1
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (window.Lenis && !reduce) {
    const lenis = new Lenis({ lerp: 0.1 });
    window.nsLenis = lenis;
    if (window.ScrollTrigger) lenis.on("scroll", ScrollTrigger.update);
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }

  // Reveal — original .js-animation: once the top edge of the section crosses the 20% line from the screen bottom, children rise from 14px below at .4s intervals over 1.6s, fading in over 1.8s
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add("is-animated");
    io.unobserve(e.target);
  }), { rootMargin: "0px 0px -20% 0px" });
  document.querySelectorAll(".js-animation").forEach((n) => (reduce ? n.classList.add("is-animated") : io.observe(n)));

  // Section heading text — original jsanimationhead: letters rise each .05s later, the breadcrumbs and header photo come .3s before all are up, and the header line comes once all are up
  const head = document.querySelector(".ns-pagehead");
  const hdr = document.querySelector('[data-slot="header"]');
  if (head) {
    let max = 0;
    head.querySelectorAll("[data-chars]").forEach((el) => {
      let n = 0;
      const text = el.textContent;
      el.textContent = "";
      // Blanks are left as they are without wrapping them in a letter chunk (a blank inside a chunk has width 0) — the sequence number takes one cell as in the original
      for (const ch of text) {
        if (ch === " ") { el.append(" "); n++; continue; }
        const s = document.createElement("span");
        s.textContent = ch;
        s.style.setProperty("--i", n++);
        el.append(s);
      }
      max = Math.max(max, n - 1);
    });
    hdr?.classList.add("is-enter-hidden");
    const total = Math.round(950 * (max * 0.05 + 0.1));
    requestAnimationFrame(() => head.classList.add("is-active"));
    setTimeout(() => head.classList.add("is-after"), Math.max(0, total - 300));
    setTimeout(() => hdr?.classList.remove("is-enter-hidden"), total);
  }
})();
