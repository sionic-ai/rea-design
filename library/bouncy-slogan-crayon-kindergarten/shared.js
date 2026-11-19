// Common to all pages: draws the header, phone drawer and footer in one place, and attaches crayon doodles and line art, dropdown, drawer, accordion, anchor scroll and title letter bounce.
// Original values: dropdown autoAlpha .4s power1.out · drawer .4s (lines ±45°, ±1em) · accordion .4s (arrow 90°→-90°) ·
// Header title letters opacity .5s + y 1rem→0 1.8s elastic.out(1, 0.3) stagger .06 · h2 letters at top 90% opacity .4s + y 20%→0 1.8s same elastic stagger .08.
(() => {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
  const M = (window.MK = {});
  const mm = gsap.matchMedia();
  M.mm = mm;
  const isPC = () => matchMedia("(min-width: 769px)").matches;
  M.isPC = isPC;

  // ── Seed random: so the same spot always gets the same doodle ──
  const rng = (seed) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  // Crayon colors use the --site-* rainbow in shared.css (spun from the accent color) — change the skin and the doodle colors turn with it
  const COLORS = { pink: "pink", peach: "peach", lime: "lime", mint: "mint", sky: "azure", violet: "violet", yellow: "yellow", red: "red", brown: "brown", green: "green", orange: "orange" };
  const PALETTE = Object.keys(COLORS);

  // Smooth curve through the dots (Catmull-Rom → cubic Bézier)
  const smooth = (pts, closed) => {
    const p = closed ? [pts[pts.length - 1], ...pts, pts[0], pts[1]] : [pts[0], ...pts, pts[pts.length - 1]];
    let d = `M${p[1][0].toFixed(1)},${p[1][1].toFixed(1)}`;
    for (let i = 1; i < p.length - 2; i++) {
      const [a, b, c, e] = [p[i - 1], p[i], p[i + 1], p[i + 2]];
      d += `C${(b[0] + (c[0] - a[0]) / 6).toFixed(1)},${(b[1] + (c[1] - a[1]) / 6).toFixed(1)} ${(c[0] - (e[0] - b[0]) / 6).toFixed(1)},${(c[1] - (e[1] - b[1]) / 6).toFixed(1)} ${c[0].toFixed(1)},${c[1].toFixed(1)}`;
    }
    return d;
  };

  // One crayon dot: redraws, at the same size and feel, the hand doodles (tangled yarn, leaves, seeds, paper plane) scattered over the original hero and strip
  const crayon = (type, color, seed) => {
    const r = rng(seed * 997 + 13);
    const j = (v) => v + (r() - 0.5) * 7;
    let d = "";
    if (type === "ball") {
      const pts = [];
      const turns = 2.2 + r();
      const n = Math.round(turns * 9);
      for (let i = 0; i <= n; i++) {
        const t = (i / 9) * Math.PI * 2 + r() * 0.3;
        const rad = 30 + r() * 12;
        pts.push([50 + Math.cos(t) * rad * (1 + 0.15 * Math.sin(i)), 50 + Math.sin(t) * rad * 0.82]);
      }
      d = smooth(pts, false);
    } else if (type === "leaf") {
      const one = () => smooth([[j(18), j(80)], [j(30), j(40)], [j(62), j(16)], [j(86), j(14)], [j(78), j(48)], [j(50), j(76)], [j(18), j(82)]], false);
      d = one() + one() + `M${j(22)},${j(78)}Q${j(50)},${j(52)} ${j(78)},${j(22)}`;
    } else if (type === "seed") {
      const one = () => smooth([[j(50), j(12)], [j(74), j(46)], [j(70), j(80)], [j(48), j(90)], [j(28), j(76)], [j(28), j(44)], [j(50), j(12)]], false);
      d = one() + one();
    } else if (type === "heart") {
      const one = () => smooth([[j(50), j(88)], [j(18), j(54)], [j(20), j(26)], [j(44), j(24)], [j(52), j(40)], [j(62), j(20)], [j(84), j(26)], [j(82), j(56)], [j(50), j(88)]], false);
      d = one() + one();
    } else {
      const one = () => smooth([[j(14), j(56)], [j(40), j(24)], [j(80), j(16)], [j(70), j(52)], [j(44), j(84)], [j(22), j(76)], [j(14), j(56)]], false);
      d = one() + one();
    }
    return `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="${d}" fill="none" style="stroke: var(--site-${COLORS[color] || color})" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round" filter="url(#mk-crayon)" opacity=".92"/></svg>`;
  };
  M.crayon = crayon;

  // Line art: redraws, in the same composition, the spots for the original black-and-white pen illustrations (school building, tree, swing, play tower, paper plane, garland, seesaw)
  const ART = {
    school: `<svg viewBox="0 0 160 90" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"><path d="M8 86h144M14 86V52h56v34M70 86V40h28v46M98 86V52h48v34"/><path d="M84 40V18M84 4v14M78 10h12M74 40l10-22 10 22"/><path d="M20 60h8v8h-8zM34 60h8v8h-8zM48 60h8v8h-8zM104 60h8v8h-8zM118 60h8v8h-8zM132 60h8v8h-8zM80 70h8v16h-8z"/><path d="M14 52l28-12 28 12M98 52l24-10 24 10"/></svg>`,
    tree: `<svg viewBox="0 0 60 100" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"><path d="M30 98V60M30 4 12 34h10L6 58h14L4 78h52L40 58h14L38 34h10z"/><path d="M30 70l-8-8M30 78l9-9"/></svg>`,
    swing: `<svg viewBox="0 0 100 90" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"><path d="M6 88 22 6h56l16 82M22 6 36 88M78 6 64 88M10 6h80"/><path d="M40 6v52M56 6v52M38 58h20"/></svg>`,
    tower: `<svg viewBox="0 0 120 110" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"><path d="M30 108V44h44v64M24 46l28-30 28 30M52 16V4M52 4l14 5-14 5"/><path d="M30 64h44M30 84h44M40 64v20M64 64v20"/><path d="M74 66c18 4 32 20 40 42M74 76c14 4 26 16 32 32"/><path d="M14 108V74h16M14 82h16M14 90h16M14 98h16"/></svg>`,
    planes: `<svg viewBox="0 0 90 60" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"><path d="M4 26 44 8 30 40l-6-10zM24 30 44 8"/><path d="M46 46l36-12-14 22-4-7zM64 49l18-15"/><path d="M8 40c6 4 10 4 16 0M48 22c4-4 8-4 12 0" stroke-dasharray="2 4"/></svg>`,
    garland: `<svg viewBox="0 0 140 50" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"><path d="M2 8c40 26 96 26 136 0"/><path d="M14 15l6 20 8-16M36 22l4 20 10-18M62 25l2 20 10-19M88 24l-1 20 12-18M112 18l-4 20 12-15"/></svg>`,
    seesaw: `<svg viewBox="0 0 220 70" fill="none" stroke-width="3" stroke-linecap="round"><path d="M8 18 212 4" style="stroke: var(--site-blue)"/><path d="M20 22v44M200 10v56" style="stroke: var(--site-red)"/><path d="M14 18h12M194 6h12" style="stroke: var(--site-yellow)" stroke-width="5"/></svg>`,
    flag: `<svg viewBox="0 0 70 40" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M2 6c22 10 44 10 66 0M8 9l5 14 6-12M24 13l4 14 7-13M42 13l3 14 7-14"/></svg>`,
    note: `<svg viewBox="0 0 20 24" fill="currentColor"><path d="M8 18a4 3 0 1 1-2-2.6V2h2l8 3v3l-8-3z"/></svg>`,
    talk: `<svg viewBox="0 0 60 36" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"><path d="M4 4h30v16H16l-6 6v-6H4z"/><path d="M10 10h18M10 15h12"/><circle cx="44" cy="16" r="5"/><path d="M34 34c1-6 5-9 10-9s9 3 10 9"/></svg>`,
    papers: `<svg viewBox="0 0 60 36" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"><path d="M6 30h42l6-6H12zM6 30v4h42v-4M8 22h40l6-6H14zM8 22v-4M16 12h30l4-6H20z"/></svg>`,
    qa: `<svg viewBox="0 0 60 36" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"><ellipse cx="20" cy="15" rx="15" ry="11"/><path d="M12 24l-4 8 10-5"/><ellipse cx="42" cy="21" rx="13" ry="10"/><path d="M17 13a3 3 0 1 1 3 3v2M38 26l4-11 4 11M39.5 22h5"/></svg>`,
    sparkle: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4z"/></svg>`,
  };
  M.art = ART;

  const icon = {
    pin: '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M6 11s3.6-3.4 3.6-6A3.6 3.6 0 0 0 2.4 5c0 2.6 3.6 6 3.6 6z"/><circle cx="6" cy="5" r="1.3"/></svg>',
    tel: '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"><path d="M2.5 1.5h2l1 2.6-1.3.9a6 6 0 0 0 2.8 2.8l.9-1.3 2.6 1v2a1 1 0 0 1-1 1A8.5 8.5 0 0 1 1.5 2.5a1 1 0 0 1 1-1z"/></svg>',
    book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"><path d="M3 5c3-1 6-1 9 1 3-2 6-2 9-1v14c-3-1-6-1-9 1-3-2-6-2-9-1z"/><path d="M12 6v14"/></svg>',
    people: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="8" cy="8" r="3"/><circle cx="17" cy="9" r="2.4"/><path d="M2.5 20c.5-4 3-6 5.5-6s5 2 5.5 6M13.5 15.5c1-1.2 2.2-1.8 3.5-1.8 2.2 0 4 1.8 4.5 5"/></svg>',
    home: '<svg viewBox="0 0 14 14" fill="currentColor"><path d="M7 1.5 1 6.6h1.8V12.5h3.4V9h1.6v3.5h3.4V6.6H13z"/></svg>',
  };
  M.icon = icon;
  // Newly drawn placeholder symbol instead of the original logo: a seedling with two cotyledons
  const mark = '<svg viewBox="0 0 36 40" aria-hidden="true"><ellipse cx="18" cy="31" rx="10" ry="7.5" fill="currentColor"/><path d="M18 24V13" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/><path d="M18 15C14 6 6 6 3 9c2 5 9 8 15 6zM18 13c3-8 11-10 15-7-1 6-8 9-15 7z" fill="currentColor"/></svg>';
  const logo = (cls = "") => `<a class="logo ${cls}" href="index.html" aria-label="Home">${mark}<span><b>Your institute name here</b><small>KINDERGARTEN NAME</small></span></a>`;
  M.logo = logo;

  const sub = (href, text) => `<li><a class="cal cal--border" href="${href}"><span class="text t-med">${text}</span><span class="circlearrow"><span class="arrow"></span></span></a></li>`;
  const MENU = [
    ["Home", "index.html", null],
    ["Education", "service.html", [["Education Highlights", "service.html"], ["Clinic education", "service.html#program"]]],
    ["About the center", "about.html", [["Educational Philosophy", "about.html"], ["Center overview", "about.html"], ["About the Facility", "service.html#facility"], ["Peace of mind and safety", "about.html#bus"]]],
    ["Center life", "#", [["Flow of the day", "#"], ["Annual events", "#"], ["After-school activities", "#"], ["Care and childcare", "#"]]],
    ["Admissions Guide", "index.html#admission", [["Info session · Tour", "index.html#event"], ["Admissions guidelines · tuition", "#"], ["Pre-Enrollment Class", "#"], ["Frequently asked questions", "#"]]],
    ["Latest news", "news.html", [["Notice", "news.html"], ["Clinic newsletter", "index.html#letter"]]],
    ["To the guardian", "#", [["Parents’ association", "#"], ["Health office news", "#"], ["Disaster Response", "#"], ["Document List", "#"], ["Contact app", "#"]]],
    ["Directions", "#"],
    ["Inquiry", "index.html#contact"],
  ];

  // Crayon texture filter only once
  document.body.insertAdjacentHTML(
    "afterbegin",
    `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><filter id="mk-crayon" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="4" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="3.2" result="d"/><feComponentTransfer in="n" result="g"><feFuncA type="table" tableValues="0 0 1 1"/></feComponentTransfer><feComposite in="d" in2="g" operator="in"/></filter></svg>`
  );

  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.classList.add("hd");
    const pickup = `<div class="hd__pickup"><a href="index.html#admission">${icon.book}<span>Admissions Guide</span></a><a href="index.html#event">${icon.people}<span>Info session</span></a></div>`;
    head.innerHTML = `
      <div class="in in--l">
        <div class="hd__main">
          ${logo()}
          <div class="hd__info">
            <p>${icon.pin}<span>Your one-line address here</span></p>
            <p>${icon.tel}<a class="t-num" href="tel:00-000-0000">00-000-0000</a></p>
          </div>
          ${pickup}
          <nav class="hd__menu" aria-label="Main menu"><ul>
            ${MENU.map(([t, h, s]) =>
              s
                ? `<li><details class="mi"><summary class="mi__btn">${t}</summary><div class="mi__body"><div class="mi__inner"><a href="${h}">${t}</a><ul>${s.map(([a, b]) => sub(b, a)).join("")}</ul><span class="art" data-art="tower" style="opacity:.25"></span></div></div></details></li>`
                : `<li><div class="mi"><a class="mi__btn" href="${h}">${t}</a></div></li>`
            ).join("")}
          </ul></nav>
        </div>
      </div>
      <button class="hd__burger" type="button" aria-label="Open Menu" aria-expanded="false"><span></span><span></span><span></span></button>`;
    head.insertAdjacentHTML(
      "afterend",
      `<div class="ham" data-slot="mobile-menu" inert>
        <div class="ham__inner"><div class="ham__scroll">
          <div class="in in--spl"><div class="ham__above">${logo()}${pickup}</div></div>
          <nav class="ham__main in in--m"><ul>
            ${MENU.map(([t, h, s]) => `<li><a href="${h}"><span class="ball"></span><span>${t}</span></a>${s ? `<ul>${s.map(([a, b]) => `<li><a href="${b}">${a}</a></li>`).join("")}</ul>` : ""}</li>`).join("")}
          </ul></nav>
          <div class="ham__sub"><div class="in in--m">
            <div class="ham__quick"><a href="tel:00-000-0000">${icon.tel}<span class="t-num">00-000-0000</span></a><a href="#">${icon.pin}<span>Your one-line address here</span></a></div>
            <div class="ham__links"><a href="recruit.html">Hiring Info</a><a href="news.html">Self-assessment</a><a href="#">Faculty research report</a><a href="#">School Support</a><a href="#">About this site</a><a href="#">Privacy policy</a></div>
          </div></div>
        </div></div>
      </div>`
    );
  }

  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.classList.add("ft");
    foot.innerHTML = `
      <div class="ft__totop"><a class="ft__totop-link" href="#top" data-totop><span class="arrow arrow--up"></span><span>PAGE<br>TOP</span></a></div>
      <div class="ft__copy">
        <div class="crayons" data-crayons="9 71" data-avoid></div>
        <p class="slogan slogan--wrap" aria-label="Your big slogan in one line here."><b>Your big tagline here!</b><small>Object marker</small><b>In one line.</b></p>
      </div>
      <div class="in in--m ft__main"><ul>
        ${MENU.map(([t, h, s]) => `<li><a href="${h}">${t}</a>${s ? `<ul>${s.map(([a, b]) => `<li><a href="${b}">${a}</a></li>`).join("")}</ul>` : ""}</li>`).join("").replace(/<li><a href="#">Directions<\/a><\/li><li><a href="index.html#contact">Inquiry<\/a><\/li>/, '<li><a href="#">Directions</a><a href="index.html#contact">Inquiry</a></li>')}
      </ul></div>
      <div class="in in--m ft__sub">
        <div class="ft__profile">
          ${logo()}
          <p>${icon.pin.replace("<svg", '<svg width="11" height="11" style="display:inline;vertical-align:-1px"')} Postal code and address here, one line</p>
          <p>${icon.tel.replace("<svg", '<svg width="11" height="11" style="display:inline;vertical-align:-1px"')} <span class="t-num">00-000-0000</span></p>
          <div class="ft__sns"><a class="ft__sns-ig" href="#" aria-label="Social feed slot"><i></i></a><a class="ft__sns-yt" href="#" aria-label="Video slot"><i></i></a></div>
        </div>
        <div class="ft__right">
          <div class="ft__links">
            <a href="recruit.html">Hiring Info</a><a href="#" target="_blank">About this site</a><a href="#" target="_blank">Foundation homepage</a>
            <a href="news.html">Self-evaluation and stakeholder evaluation</a><a href="#" target="_blank">Privacy policy</a><a href="#" target="_blank">Foundation University</a>
            <a href="#">Faculty research activity report</a><span></span><a href="#" target="_blank">Foundation Middle and High School</a>
            <a href="#" target="_blank">School support (donations)</a><span></span><a href="#" target="_blank">Foundation Elementary School</a>
          </div>
          <small class="t-num">Copyright © Kindergarten Name</small>
        </div>
      </div>
      <p class="ft__word" aria-hidden="true">YOUR KINDERGARTEN</p>`;
  }

  // Doodle · line art fill
  document.querySelectorAll("[data-crayon]").forEach((el, i) => {
    const [type = "ball", color = PALETTE[i % PALETTE.length], seed = i + 1] = el.dataset.crayon.split(" ");
    el.classList.add("crayon");
    el.innerHTML = crayon(type, color, Number(seed));
  });
  document.querySelectorAll("[data-crayons]").forEach((box) => {
    const [n, seed] = box.dataset.crayons.split(" ").map(Number);
    const r = rng(seed);
    const types = ["ball", "leaf", "seed", "heart", "plane"];
    let html = "";
    for (let i = 0; i < n; i++) {
      const w = 4 + r() * 3.5;
      // Leave the center band (text area) empty and scatter to the sides and top/bottom
      let x = r() * 96, y = r() * 90;
      if (box.hasAttribute("data-avoid") && x > 14 && x < 82) x = x < 48 ? 2 + ((x - 14) / 34) * 16 : 82 + ((x - 48) / 34) * 14;
      html += `<span class="crayon" style="left:${x.toFixed(1)}%;top:${y.toFixed(1)}%;width:${w.toFixed(1)}rem;rotate:${Math.round(r() * 360)}deg">${crayon(types[Math.floor(r() * types.length)], PALETTE[Math.floor(r() * PALETTE.length)], seed + i)}</span>`;
    }
    box.innerHTML = html;
  });
  document.querySelectorAll("[data-art]").forEach((el) => {
    el.classList.add("art");
    el.innerHTML = ART[el.dataset.art] || "";
  });

  // ── Dropdown (hover only on hover devices, otherwise on press) ──
  const hoverable = matchMedia("(hover: hover) and (pointer: fine)");
  document.querySelectorAll(".hd__menu details.mi").forEach((d, _, all) => {
    const body = d.querySelector(".mi__body");
    let closing = false;
    const open = () => {
      closing = false;
      d.setAttribute("open", "");
      gsap.to(body, { autoAlpha: 1, duration: 0.4, ease: "power1.out", overwrite: true });
    };
    const close = () => {
      closing = true;
      gsap.to(body, { autoAlpha: 0, duration: 0.4, ease: "power1.out", overwrite: true, onComplete: () => closing && d.removeAttribute("open") });
    };
    d.addEventListener("mouseenter", () => hoverable.matches && open());
    d.addEventListener("mouseleave", () => hoverable.matches && close());
    d.querySelector("summary").addEventListener("click", (e) => {
      e.preventDefault();
      if (hoverable.matches) return;
      if (d.open && !closing) close();
      else {
        open();
        all.forEach((o) => o !== d && o.open && gsap.to(o.querySelector(".mi__body"), { autoAlpha: 0, duration: 0.4, ease: "power1.out", onComplete: () => o.removeAttribute("open") }));
      }
    });
  });

  // ── Phone drawer ──
  const ham = document.querySelector(".ham");
  const burger = document.querySelector(".hd__burger");
  if (ham && burger) {
    const lines = burger.querySelectorAll("span");
    let opened = false;
    const set = (on) => {
      gsap.killTweensOf([ham, ...lines]);
      const tl = gsap.timeline();
      tl.to(ham, { autoAlpha: on ? 1 : 0, duration: 0.4, ease: "power1.out" }, 0)
        .fromTo(lines[0], { y: on ? 0 : "1em", rotate: on ? 0 : -45 }, { y: on ? "1em" : 0, rotate: on ? -45 : 0, duration: 0.4, ease: "power1.out" }, 0)
        .fromTo(lines[1], { opacity: on ? 1 : 0 }, { opacity: on ? 0 : 1, duration: 0.4, ease: "power1.out" }, 0)
        .fromTo(lines[2], { y: on ? 0 : "-1em", rotate: on ? 0 : 45 }, { y: on ? "-1em" : 0, rotate: on ? 45 : 0, duration: 0.4, ease: "power1.out" }, 0);
      ham.inert = !on;
      burger.setAttribute("aria-expanded", String(on));
      burger.setAttribute("aria-label", on ? "Close Menu" : "Open Menu");
      opened = on;
    };
    burger.addEventListener("click", () => set(!opened));
    ham.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => set(false)));
  }

  // ── Accordion (height auto .4s · arrow 90°→-90°) ──
  document.querySelectorAll("details.acc").forEach((d) => {
    const btn = d.querySelector("summary");
    const body = d.querySelector(".acc__body");
    const arrow = btn.querySelector(".arrow");
    gsap.set(arrow, { rotate: 90 });
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      if (d.open) {
        gsap.timeline({ onComplete: () => { d.removeAttribute("open"); ScrollTrigger.refresh(); } })
          .to(arrow, { rotate: 90, duration: 0.4, ease: "power1.out" }, 0)
          .to(body, { height: 0, duration: 0.4, ease: "power1.out" }, 0);
      } else {
        d.setAttribute("open", "");
        gsap.timeline({ onComplete: () => ScrollTrigger.refresh() })
          .to(arrow, { rotate: -90, duration: 0.4, ease: "power1.out" }, 0)
          .fromTo(body, { height: 0 }, { height: "auto", duration: 0.4, ease: "power1.out" }, 0);
      }
    });
  });

  // ── Same-page anchors are offset by the header height and scrolled with 1s power2.out ──
  const scrollToHash = (hash) => {
    const target = hash === "#top" ? 0 : document.querySelector(hash);
    if (target === null) return;
    const off = document.querySelector(".hd")?.getBoundingClientRect().height || 0;
    gsap.to(window, { scrollTo: { y: target, offsetY: target === 0 ? 0 : off }, duration: 1, ease: "power2.out" });
  };
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a) return;
    const url = new URL(a.href, location.href);
    if (url.pathname !== location.pathname || !url.hash || url.hash === "#") return;
    e.preventDefault();
    scrollToHash(url.hash);
  });
  addEventListener("load", () => location.hash && location.hash.length > 1 && scrollToHash(location.hash));

  // ── Text splitting ──
  const split = (el) => {
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          for (const ch of n.textContent) {
            if (/\s/.test(ch)) frag.append(ch);
            else {
              const s = document.createElement("span");
              s.className = "char";
              s.textContent = ch;
              frag.append(s);
            }
          }
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.tagName !== "BR") walk(n);
      });
    };
    walk(el);
    return el.querySelectorAll(".char");
  };
  M.split = split;

  mm.add({ motion: "(prefers-reduced-motion: no-preference)", reduce: "(prefers-reduced-motion: reduce)" }, (ctx) => {
    const { reduce } = ctx.conditions;
    const h1 = document.querySelector(".mv__text h1");
    if (h1) {
      const chars = h1.querySelectorAll(".char").length ? h1.querySelectorAll(".char") : split(h1);
      if (reduce) gsap.set([h1, chars], { opacity: 1, y: 0 });
      else
        gsap.timeline({ delay: 0.05 })
          .set(h1, { opacity: 1 })
          .to(chars, { opacity: 1, duration: isPC() ? 0.5 : 0.4, stagger: 0.06, ease: "power1.out" }, 0)
          .to(chars, { y: "0%", duration: 1.8, stagger: 0.06, ease: "elastic.out(1, 0.3)" }, 0);
    }
    document.querySelectorAll(".h2").forEach((box) => {
      const h = box.querySelector("h2");
      const chars = h.querySelectorAll(".char").length ? h.querySelectorAll(".char") : split(h);
      if (reduce) return;
      const tate = box.classList.contains("h2--tate") && isPC();
      gsap.set(chars, { opacity: 0 });
      ScrollTrigger.create({
        trigger: box,
        start: "top 90%",
        once: true,
        onEnter: () =>
          gsap.timeline()
            .fromTo(chars, { opacity: 0 }, { opacity: 1, duration: 0.4, stagger: 0.08, ease: "power2.out" }, 0)
            .fromTo(chars, { y: tate ? "0%" : "20%", x: tate ? "-15%" : "0%" }, { y: "0%", x: "0%", duration: 1.8, stagger: 0.08, ease: "elastic.out(1, 0.3)" }, 0),
      });
    });
  });
})();
