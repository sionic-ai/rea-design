// Shared by all pages: draws in the header, phone menu drawer, fixed contact tab, two-link row, contact band, footer and next-page band, and
// Draws the liquid ribbon art and handwritten doodles in SVG, and hooks up hiding header, entrances, highlighter titles, contact strip white curtain scrub and footer ribbon mouse follow.
// Original values: header hides or shows on 5px+ movement after scrolling down past 100px · entrance is 50px below the screen bottom · contact strip top center+=100 → top center-=200 scrub 1
//           · footer ribbon mouse distance × 0.03, 1.5s power2.out · anchor move .8s easeOutExpo · doodle at top 80% 1s power2.out.
(() => {
  gsap.registerPlugin(ScrollTrigger, CustomEase);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const page = document.body.dataset.page || "home";
  const PC = (window.PC = { reduced });

  const arrowR = '<svg class="pc-ic" viewBox="0 0 13 12"><path d="M7.2 0 6 1.2 10 5.15H0v1.7h10L6 10.8 7.2 12 13 6z"/></svg>';
  const arrowUR = '<svg class="pc-ic" viewBox="0 0 12 12"><path d="M2.3 0v1.6h6.9L0 10.8 1.2 12l9.2-9.2v6.9H12V0z"/></svg>';
  const arrowL = '<svg class="pc-ic" viewBox="0 0 13 12"><path d="M5.8 0 7 1.2 3 5.15h10v1.7H3l4 3.95L5.8 12 0 6z"/></svg>';
  // Placeholder mark drawn in place of the original logo — a tilted window frame and a small circle in a single line
  const mark = '<svg viewBox="0 0 98 40" fill="none" stroke="currentColor" stroke-width="2.6" aria-hidden="true"><path d="M3 37V5.5Q3 3 5.6 3.2L74 6.6Q77 6.8 77 9.8V24.5"/><path d="M3 21.5 70 25.4"/><circle cx="84" cy="31" r="4.6"/></svg>';
  const logo = (cls = "") => `<a class="pc-logo ${cls}" href="index.html" aria-label="Home">${mark}<span class="pc-logo__word">Wordmark</span></a>`;
  const sns = `
    <a href="#" aria-label="Photo SNS"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2.5" y="2.5" width="15" height="15" rx="4.5"/><circle cx="10" cy="10" r="3.4"/><circle cx="14.6" cy="5.4" r=".6" fill="currentColor"/></svg></a>
    <a href="#" aria-label="Short-text SNS"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M4 3.5 16 16.5M16 3.5 4 16.5"/></svg></a>
    <a href="#" aria-label="Blog"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M5 16V5.5h6.5q3.5 0 3.5 3.5V16"/></svg></a>
    <a href="#" aria-label="Video SNS"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 3v9.5a3 3 0 1 1-3-3M11 3q.5 3.5 4.5 4"/></svg></a>`;
  PC.icons = { arrowR, arrowUR, arrowL, mark };

  // ── Liquid ribbon: a five-petal ring seen obliquely from above. Bands are layered from the outer edge to the hole so it looks like a glossy tube ──
  let uid = 0;
  PC.liquid = (o = {}) => {
    const id = `pcl${++uid}`;
    const W = 1000, H = 800, cx = 500, cy = o.cy || 360;
    const n = o.lobes || 5, R = o.r || 410, amp = o.amp ?? 0.16, sq = o.squash || 0.6, ph = o.phase ?? -Math.PI / 2;
    const persp = o.persp ?? 0.16, hx = o.holeX || 165, hy = o.holeY || 92;
    const N = 200;
    // To make the top look far away, the smaller y is, the narrower the width
    const tilt = (x, y) => [cx + (x - cx) * (1 + persp * (y - cy) / (R * sq)), y];
    const outer = [], hole = [];
    for (let i = 0; i < N; i++) {
      const t = (i / N) * Math.PI * 2;
      const r = R * (1 + amp * Math.cos(n * (t - ph)) - 0.045 * Math.cos(2 * n * (t - ph)));
      outer.push(tilt(cx + r * Math.cos(t), cy + r * Math.sin(t) * sq));
      hole.push(tilt(cx + hx * Math.cos(t), cy + 8 + hy * Math.sin(t)));
    }
    const pathOf = (pts, dy = 0) => "M" + pts.map((p) => `${p[0].toFixed(1)},${(p[1] + dy).toFixed(1)}`).join("L") + "Z";
    const lerp = (k) => outer.map((p, i) => [p[0] + (hole[i][0] - p[0]) * k, p[1] + (hole[i][1] - p[1]) * k]);
    const ring = (dy) => pathOf(outer, dy) + pathOf(hole, dy);
    const deep = o.deep || "var(--site-rib-deep)", mid = o.mid || "var(--site-rib-mid)", pale = o.pale || "var(--site-rib-pale)", rim = o.rim || "var(--site-rib-rim)";
    const bands = [[0, rim], [0.035, deep], [0.09, mid], [0.2, pale], [0.36, mid], [0.5, pale], [0.66, mid], [0.8, deep], [0.9, mid], [0.95, pale], [0.985, rim]];
    // Thickness: rings stacked several layers downward become the white and blue striped side
    const stack = [];
    const layers = o.layers ?? 5, step = o.step || 8;
    for (let k = layers; k >= 1; k--) stack.push(`<path d="${ring(k * step)}" fill-rule="evenodd" style="fill: ${k % 2 ? deep : rim}"/>`);
    return `<svg class="pc-liquid" viewBox="0 0 ${W} ${H}" aria-hidden="true">
      <defs>
        <clipPath id="${id}c"><path d="${ring(0)}" clip-rule="evenodd"/></clipPath>
        <filter id="${id}b" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="${o.blur || 5}"/></filter>
        <filter id="${id}s" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="1.2"/></filter>
        <radialGradient id="${id}g" cx=".3" cy=".22" r=".75"><stop offset="0" style="stop-color: var(--site-white)" stop-opacity=".5"/><stop offset=".55" style="stop-color: var(--site-white)" stop-opacity="0"/></radialGradient>
      </defs>
      <g filter="url(#${id}s)">${stack.join("")}</g>
      <g clip-path="url(#${id}c)">
        <g filter="url(#${id}b)">${bands.map(([k, c]) => `<path d="${pathOf(lerp(k))}" style="fill: ${c}"/>`).join("")}</g>
        <rect width="${W}" height="${H}" fill="url(#${id}g)"/>
        <path d="${pathOf(lerp(0.012))}" fill="none" style="stroke: var(--site-white)" stroke-width="3" opacity=".85" filter="url(#${id}s)"/>
        <path d="${pathOf(lerp(0.975))}" fill="none" style="stroke: var(--site-white)" stroke-width="2.5" opacity=".8" filter="url(#${id}s)"/>
      </g>
    </svg>`;
  };
  document.querySelectorAll("[data-liquid]").forEach((el) => {
    let o = {};
    try { o = JSON.parse(el.dataset.liquid || "{}"); } catch (e) { o = {}; }
    el.insertAdjacentHTML("beforeend", PC.liquid(o));
  });

  // ── Handwriting doodle: one line of English handwriting and a lime ellipse drawn around it by pen for more than one full turn ──
  PC.doodle = (text, o = {}) => {
    const id = `pcd${++uid}`;
    const w = o.w || 480, h = o.h || 170, size = o.size || 40, rot = o.rot ?? -8;
    const cx = w / 2, cy = h / 2, rx = w * 0.46, ry = h * 0.32;
    let d = "";
    for (let i = 0; i <= 64; i++) {
      const a = Math.PI * 0.95 + (i / 64) * Math.PI * 2.2;
      const wob = 1 + 0.03 * Math.sin(i * 1.7);
      d += `${i ? "L" : "M"}${(cx + rx * wob * Math.cos(a)).toFixed(1)},${(cy + ry * wob * Math.sin(a) + i * 0.25).toFixed(1)}`;
    }
    return `<svg class="pc-doodle ${o.cls || ""}" viewBox="0 0 ${w} ${h}" aria-hidden="true" data-doodle>
      <defs><clipPath id="${id}"><rect class="pc-doodle__clip" x="0" y="0" width="0" height="${h}"/></clipPath></defs>
      <g transform="rotate(${rot} ${cx} ${cy})">
        <text x="${cx}" y="${cy + size * 0.32}" text-anchor="middle" font-size="${size}" clip-path="url(#${id})">${text}</text>
        ${o.ring === false ? "" : `<path class="pc-doodle__ring" d="${d}"/>`}
        ${o.ring === false ? "" : `<path class="pc-doodle__tick" d="M${(cx + rx * 1.02).toFixed(1)},${(cy - ry * 1.05).toFixed(1)}l${(w * 0.035).toFixed(1)},${(-h * 0.12).toFixed(1)}"/><path class="pc-doodle__tick" d="M${(cx + rx * 1.08).toFixed(1)},${(cy - ry * 0.55).toFixed(1)}l${(w * 0.05).toFixed(1)},${(-h * 0.04).toFixed(1)}"/>`}
      </g>
    </svg>`;
  };
  document.querySelectorAll("[data-doodle-text]").forEach((el) => {
    el.insertAdjacentHTML("beforeend", PC.doodle(el.dataset.doodleText, {
      size: +el.dataset.doodleSize || 40, rot: el.dataset.doodleRot ? +el.dataset.doodleRot : -8, cls: el.dataset.doodleCls || "",
      ring: el.dataset.doodleRing !== "0",
    }));
    // A spot the original made as an image (one svg) — it doesn’t move and stands fully drawn (case list FEATURED)
    if (el.hasAttribute("data-doodle-static")) el.querySelector("text").removeAttribute("clip-path");
  });
  // A timetable made by dividing the frame ranges of the original Lottie (30fps) by playback speed — letters rise one by one for [text]f from below (letter size × rise) transparent→opaque (ramp up selector),
  // Pen strokes are drawn on [ring]f and small strokes on [ticks]f. Value doodles, next page and greeting share the same structure with different speed and range
  const LOTTIE = {
    value: { speed: 0.6, text: [0, 14], rise: 41 / 36, ring: [4, 16], ease: "0.333,0,0.833,0.833", ticks: [[22, 26], [33, 37]] },
    next: { speed: 0.5, text: [0, 14], rise: 41 / 36, ring: [4, 16], ease: "0.333,0,0.833,0.833", ticks: [[22, 26], [33, 37]] },
    hello: { speed: 0.6, text: [0, 18], rise: -110 / 120, fade: false, ring: [13, 20], ease: "0.333,0,0.667,1", ticks: [[17, 24]] },
  };
  const NS = "http://www.w3.org/2000/svg";
  const kfEase = (b) => CustomEase.create("lt" + b.replace(/\W/g, ""), b);
  // Each letter as its own tspan — positions stay where the letters were before splitting (drop text-anchor and pin x)
  const charsOf = (t) => {
    if (t.dataset.split) return [...t.querySelectorAll("tspan")];
    const s = t.textContent, y = +t.getAttribute("y");
    let xs;
    // In a hidden panel (display: none) letter positions can’t be measured — shown whole without splitting
    try { xs = [...s].map((_, i) => t.getStartPositionOfChar(i).x); } catch (e) { t.removeAttribute("clip-path"); return []; }
    t.textContent = "";
    ["text-anchor", "clip-path", "textLength", "lengthAdjust"].forEach((a) => t.removeAttribute(a));
    t.dataset.split = "1";
    return [...s].map((c, i) => {
      const sp = document.createElementNS(NS, "tspan");
      sp.setAttribute("x", xs[i].toFixed(1));
      sp.setAttribute("y", y);
      sp.dataset.y = y;
      sp.textContent = c;
      t.append(sp);
      return sp;
    });
  };
  PC.drawDoodle = (svg, kind = svg.dataset.lottie || "value") => {
    const T = LOTTIE[kind], f = (n) => n / 30 / T.speed;
    const text = svg.querySelector("text");
    const ring = svg.querySelector(".pc-doodle__ring");
    const ticks = [...svg.querySelectorAll(".pc-doodle__tick")];
    const strokes = [ring, ...ticks].filter(Boolean);
    const chars = text ? charsOf(text) : [];
    const size = text ? parseFloat(getComputedStyle(text).fontSize) || 40 : 40;
    gsap.killTweensOf([...chars, ...strokes]);
    if (reduced) {
      chars.forEach((c) => gsap.set(c, { attr: { y: c.dataset.y }, opacity: 1 }));
      strokes.forEach((p) => gsap.set(p, { strokeDasharray: "none", strokeDashoffset: 0 }));
      return;
    }
    // A ramp up selector sweeps across the text line — each character gets half the range length, each starting later than the one before
    const span = f(T.text[1] - T.text[0]) / 2;
    chars.forEach((c, i) => gsap.fromTo(c, { attr: { y: +c.dataset.y + size * T.rise }, opacity: T.fade === false ? 1 : 0 }, { attr: { y: c.dataset.y }, opacity: 1, duration: span, ease: "none", delay: f(T.text[0]) + (i / chars.length) * span }));
    strokes.forEach((p, k) => {
      const [a, b] = k === 0 ? T.ring : T.ticks[k - 1] || T.ticks[T.ticks.length - 1];
      const L = p.getTotalLength();
      gsap.fromTo(p, { strokeDasharray: L, strokeDashoffset: L }, { strokeDashoffset: 0, duration: f(b - a), delay: f(a), ease: k === 0 ? kfEase(T.ease) : "none" });
    });
  };

  // ── Photo slider: same Swiper 8.4.7 creative settings as the original (next slide +20%,+20% ×.8 opacity .5 · previous slide -120% z -500 · 1.2s · every 3s · press for next) ──
  PC.creativeSlider = (box) => new Swiper(box, {
    loop: true,
    speed: 1200,
    autoplay: reduced ? false : { delay: 3000, disableOnInteraction: false },
    loopAdditionalSlides: 3,
    watchSlidesProgress: true,
    effect: "creative",
    creativeEffect: { limitProgress: 5, prev: { translate: ["-120%", 0, -500], opacity: 0 }, next: { translate: ["20%", "20%", 0], opacity: 0.5, scale: 0.8 } },
    on: { click() { this.slideNext(); } },
  });

  // ── Header · drawer · sticky tab ──
  const items = [["about", "ABOUT", "about.html"], ["service", "SERVICE", "service.html"], ["works", "CASE STUDY", "works.html"], ["news", "MAGAZINE", "news.html"], ["contact", "CONTACT", "#contact"]];
  const cur = (k) => (k === page || (k === "works" && page === "detail") ? " is-current" : "");
  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.classList.add("pc-head");
    head.innerHTML = `<div class="pc-head__in">
      ${logo()}
      <button class="pc-burger" type="button" aria-label="Open Menu"><i></i><i></i></button>
      <nav class="pc-gnav" aria-label="Main menu"><ul>${items.map(([k, t, h]) => `<li><a class="${cur(k)}" href="${h}">${t}</a></li>`).join("")}</ul></nav>
    </div>`;
    head.insertAdjacentHTML("afterend", `
      <div class="pc-drawer" data-slot="menu-drawer">
        <div class="pc-drawer__box pc-blue-tex">
          <div class="pc-drawer__art">${PC.liquid({ rim: "var(--site-white)" })}</div>
          <div class="pc-drawer__in">
            <ul class="pc-drawer__list">${items.map(([k, t, h]) => `<li><a href="${h}">${t}</a></li>`).join("")}</ul>
            <p class="pc-sns__title">Follow Us!!</p>
            <div class="pc-sns">${sns}</div>
          </div>
        </div>
      </div>
      <div class="pc-fixed" data-slot="fixed-contact"><a href="#contact">${arrowR}<span>Contact</span></a></div>`);

    const burger = head.querySelector(".pc-burger");
    const drawer = document.querySelector(".pc-drawer");
    const setMenu = (open) => {
      drawer.classList.toggle("is-open", open);
      burger.classList.toggle("is-open", open);
      burger.setAttribute("aria-label", open ? "Close Menu" : "Open Menu");
      document.body.classList.toggle("is-locked", open);
      head.classList.toggle("is-menu", open);
    };
    burger.addEventListener("click", () => setMenu(!drawer.classList.contains("is-open")));
    drawer.addEventListener("click", (e) => { if (e.target === drawer || e.target.closest("a")) setMenu(false); });

    let lastY = scrollY, ticking = false;
    addEventListener("scroll", () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = scrollY, diff = y - lastY;
        if (y > 100 && Math.abs(diff) > 5) head.classList.toggle("is-hide", diff > 0);
        if (y <= 0) head.classList.remove("is-hide");
        lastY = y;
        ticking = false;
      });
    }, { passive: true });
  }

  // ── Two-column links ──
  const link = document.querySelector('[data-slot="linkbox"]');
  if (link) {
    link.classList.add("pc-linkbox");
    link.innerHTML = `
      <a class="pc-linkbox__a" href="#"><div class="pc-linkbox__in">
        <h2 class="pc-title">Join us</h2><p class="pc-ja">Your one-line question here</p>
        <p class="pc-linkbox__tx">Your sentence saying you’re looking for people to work with.<br>A line leading to detailed information.</p>
        <span class="pc-linkbox__ic">${arrowUR}</span></div></a>
      <a class="pc-linkbox__a" href="#"><div class="pc-linkbox__in">
        <h2 class="pc-title">Download</h2><p class="pc-ja">Your material name here</p>
        <p class="pc-linkbox__tx">Your company, results, and way of working here<br>Two lines about sharing through materials.</p>
        <span class="pc-linkbox__ic">${arrowR}</span></div></a>`;
  }

  // ── Next page band ──
  const next = document.querySelector('[data-slot="next-page"]');
  if (next) {
    const loopList = `<div class="pc-loop__list">${'<p class="pc-loop__tx">Next page</p>'.repeat(4)}</div>`;
    next.classList.add("pc-next");
    next.innerHTML = `<a class="pc-next__a" href="${next.dataset.href || "#"}">
      <div class="pc-loop" aria-hidden="true">${loopList}${loopList}</div>
      <div class="pc-next__img">
        <div class="pc-next__imgin"><div class="wf-img" data-label="${next.dataset.photo || "Next page featured photo · bright office · portrait 3:4"}"></div></div>
        ${PC.doodle(next.dataset.word || "next story", { size: 44, rot: -10, cls: "is-next" })}
      </div>
      <div class="pc-next__btn"><span class="pc-more"><span class="pc-more__tx">${next.dataset.label || "Your next page name here"}</span><span class="pc-more__ic">${arrowR}</span></span></div>
    </a>`;
  }

  // ── Contact band + footer (on one blue textured panel) ──
  const contact = document.querySelector('[data-slot="contact"]');
  const foot = document.querySelector('[data-slot="footer"]');
  if (contact && foot) {
    const wrap = document.createElement("div");
    wrap.className = "pc-fixbg pc-blue-tex";
    contact.before(wrap);
    wrap.innerHTML = `<div class="pc-fixbg__art"><div>${PC.liquid({ deep: "var(--site-rib2-deep)", mid: "var(--site-rib2-mid)", pale: "var(--site-rib2-pale)", rim: "var(--site-white)", blur: 10 })}</div></div>`;
    wrap.append(contact, foot);
    contact.classList.add("pc-contact");
    contact.id = "contact";
    const loopList = `<div class="pc-loop__list">${'<p class="pc-loop__tx">Get in touch</p>'.repeat(3)}</div>`;
    contact.innerHTML = `
      <div class="pc-loop" aria-hidden="true">${loopList}${loopList}</div>
      <p class="pc-contact__tx">Your line saying inquiries and consultations are welcome here.<br>Closing greeting line here.</p>
      <a class="pc-btn-hand" href="#">${arrowR}Contact</a>`;
    foot.classList.add("pc-foot");
    foot.innerHTML = `<div class="pc-wrap">
      <div class="pc-foot__row1">
        <div class="pc-foot__l">
          <p class="pc-foot__we">We are the</p>
          <p class="pc-foot__title"><span>Tagline</span><span>Goes</span><span>Here</span></p>
          <p class="pc-sns__title">Follow Us!!</p>
          <div class="pc-sns">${sns}</div>
        </div>
        <div class="pc-foot__r">
          <ul class="pc-foot__nav">
            <li><a href="about.html">ABOUT</a></li><li><a href="#">JOIN US</a></li>
            <li><a href="service.html">SERVICE</a></li><li><a href="#">DOWNLOAD</a></li>
            <li><a href="works.html">CASE STUDY</a></li><li><a href="news.html">NEWSLETTER</a></li>
            <li><a href="#">ARTICLES</a></li><li><a href="#contact">CONTACT</a></li>
            <li><a href="#">NEWS</a></li>
          </ul>
          <p class="pc-foot__pjt">Project</p>
          <ul class="pc-foot__pj"><li><a href="#">Project 1</a></li><li><a href="#">Project 2</a></li><li><a href="#">Project 3</a></li></ul>
        </div>
      </div>
      <div class="pc-foot__row2">
        <a class="pc-foot__logo" href="index.html" aria-label="Home">${mark}</a>
        <p class="pc-foot__cp">Copyright © Wordmark Inc.</p>
        <a class="pc-foot__pp" href="#">PRIVACY POLICY</a>
      </div>
    </div>`;

    if (!reduced) {
      // As the white curtain lifts, the blue texture behind is revealed
      gsap.set(contact, { "--pc-veil": 1 });
      gsap.to(contact, { "--pc-veil": 0, ease: "none", scrollTrigger: { trigger: contact, start: "top center+=100", end: "top center-=200", scrub: 1 } });
      const art = wrap.querySelector(".pc-fixbg__art > div");
      const move = (x, y) => gsap.to(art, { x: x * 0.03, y: y * 0.03, duration: 1.5, ease: "power2.out", overwrite: true });
      addEventListener("mousemove", (e) => move(e.clientX - innerWidth / 2, e.clientY - innerHeight / 2));
      addEventListener("deviceorientation", (e) => { if (e.gamma !== null) move(e.gamma * 10, (e.beta - 45) * 10); });
    } else {
      gsap.set(contact, { backgroundColor: "transparent" });
    }
  }

  // Apply reveal, doodle and parallax after the page script has drawn the cards and lists
  const wire = () => {
    // ── Entrance: on when it reaches +50px below the screen, off again when it goes back below (replays each time, like the original) ──
    const revealSel = ".fadeIn, .scaleIn, .smooth, .fadeBlur, .pc-mark.is-scroll";
    if (reduced) {
      document.querySelectorAll(revealSel).forEach((el) => el.classList.add("on"));
    } else {
      document.querySelectorAll(revealSel).forEach((el) => {
        ScrollTrigger.create({ trigger: el, start: "top+=50 bottom", onToggle: (s) => el.classList.toggle("on", s.isActive), end: "max" });
      });
    }

    // Parallax photo: same defaults as the original jarallax 2.1.4 (scroll · speed .5)
    const paras = document.querySelectorAll(".pc-para.jarallax");
    if (!reduced && paras.length) jarallax(paras);

    // The doodle rises from top 80% over 1s power2.out and is drawn again (original value: doodle lottie seek(0)·play)
    document.querySelectorAll("[data-doodle]").forEach((svg) => {
      if (svg.closest("[data-doodle-manual], [data-doodle-static], [data-doodle-auto]") || svg.classList.contains("is-next")) return;
      if (reduced) { PC.drawDoodle(svg); return; }
      gsap.fromTo(svg, { opacity: 0, y: 30 }, {
        opacity: 1, y: 0, duration: 1, ease: "power2.out",
        scrollTrigger: { trigger: svg, start: "top 80%", toggleActions: "play none none reverse", onEnter: () => PC.drawDoodle(svg), onEnterBack: () => PC.drawDoodle(svg) },
      });
    });

    // The whole next-page link floats up at top 85% with 1s power3.out, and each time the doodle (lottie speed .5) is rewritten from the start.
    const nextA = document.querySelector(".pc-next__a");
    if (nextA) {
      const sv = nextA.querySelector(".pc-doodle.is-next");
      const draw = () => sv && PC.drawDoodle(sv, "next");
      if (reduced) { gsap.set(nextA, { opacity: 1, y: 0 }); draw(); }
      else gsap.fromTo(nextA, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1, ease: "power3.out", scrollTrigger: { trigger: nextA, start: "top 85%", toggleActions: "play none none reverse", onEnter: draw, onEnterBack: draw } });
    }
    // The About header doodle is the original lottie autoplay — written once on open, regardless of scroll
    document.querySelectorAll("[data-doodle-auto] [data-doodle]").forEach((svg) => PC.drawDoodle(svg));
  };
  document.addEventListener("DOMContentLoaded", wire);

  // Anchors glide with .8s easeOutExpo
  const expoOut = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    e.preventDefault();
    const href = a.getAttribute("href");
    const target = href.length > 1 ? document.querySelector(href) : document.documentElement;
    if (!target) return;
    const from = scrollY, to = target.getBoundingClientRect().top + scrollY;
    if (reduced) { scrollTo(0, to); return; }
    const o = { t: 0 };
    gsap.to(o, { t: 1, duration: 0.8, ease: "none", onUpdate: () => scrollTo(0, from + (to - from) * expoOut(o.t)) });
  });

  // On entry, the white curtain lifts
  PC.enter = () => document.body.classList.add("is-in");
  if (!document.body.hasAttribute("data-hold-enter")) requestAnimationFrame(() => requestAnimationFrame(PC.enter));
  addEventListener("load", () => ScrollTrigger.refresh());
})();
