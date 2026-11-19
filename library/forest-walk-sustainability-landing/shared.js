// All pages share the same header row, menu panel and forest footer, and the forest illustration props (bushes, trees, leaves, people) are drawn by name — pages <i data-art="Name"> Just leave it.
// The original forest image is a paper-grain watercolor, so redraw it with overlapping circles (bushes) and flat planes in the same places and silhouettes.
(() => {
  const page = document.body.dataset.page || "home";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Fixed-seed random so the same picture doesn’t change on every open
  const rng = (seed) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const crown = (r, cx, cy, s, cls) => {
    let out = "";
    for (let i = 0; i < 9; i++) {
      const a = r() * Math.PI * 2, d = r() * s * 0.55;
      out += `<circle class="${cls}" cx="${(cx + Math.cos(a) * d).toFixed(1)}" cy="${(cy + Math.sin(a) * d * 0.8).toFixed(1)}" r="${(s * (0.35 + r() * 0.3)).toFixed(1)}"/>`;
    }
    return out;
  };
  const LEAF = ["bt-l1", "bt-l2", "bt-l3", "bt-l4"];
  // Bush strip — layers large and small bushes over a panel w wide and h tall to fill the bottom edge (n of them, occasionally a white birch trunk)
  const forest = (w, h, n, seed, { birch = 0.15, tall = 0.6 } = {}) => {
    const r = rng(seed);
    let back = "", front = "";
    for (let i = 0; i < n; i++) {
      const x = (i + 0.5) * (w / n) + (r() - 0.5) * (w / n), s = h * (0.25 + r() * 0.25), y = h - s * (0.4 + r() * tall);
      if (r() < birch) back += `<rect class="bt-trunk" x="${(x - 6).toFixed(0)}" y="${(y - s * 0.6).toFixed(0)}" width="12" height="${(h - y + s).toFixed(0)}"/>`;
      const g = crown(r, x, y, s, LEAF[Math.floor(r() * 4)]);
      if (i % 2) back += g; else front += g;
    }
    return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMax slice" aria-hidden="true">${back}${front}<rect class="bt-deep" x="0" y="${h - 4}" width="${w}" height="4"/></svg>`;
  };
  const tree = (seed, cls = "bt-l2", trunk = "bt-bark") => {
    const r = rng(seed);
    return `<svg viewBox="0 0 200 300" aria-hidden="true"><path class="${trunk}" d="M92 300 96 150h8l4 150z"/>${crown(r, 100, 110, 80, cls)}${crown(r, 70, 150, 50, LEAF[(seed + 1) % 4])}${crown(r, 130, 140, 55, LEAF[(seed + 2) % 4])}</svg>`;
  };
  const ART = {
    sky: '<svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="bt-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--site-sky2)"/><stop offset=".7" style="stop-color:var(--site-sky)"/></linearGradient></defs><rect width="1440" height="900" fill="url(#bt-sky)"/><g class="bt-white" opacity=".85"><ellipse cx="420" cy="230" rx="220" ry="40"/><ellipse cx="560" cy="200" rx="160" ry="44"/><ellipse cx="1040" cy="300" rx="260" ry="46"/><ellipse cx="900" cy="270" rx="140" ry="40"/><ellipse cx="300" cy="420" rx="200" ry="30"/></g><path style="fill:var(--site-mount)" d="M0 560c120-60 220-90 330-70 120 22 180-60 300-50 120 10 170 70 290 60 140-12 200-90 330-70 90 14 140 50 190 70v300H0z"/><path style="fill:var(--site-lake)" d="M300 600c200-20 500-10 820 20 120 12 200 30 320 40v80H200z"/></svg>',
    ground3: '<svg viewBox="0 0 1440 400" preserveAspectRatio="none" aria-hidden="true"><path class="bt-l4" d="M0 120c160-70 340-90 520-40 120 34 200 10 300-20 180-54 420-30 620 40v300H0z"/></svg>',
    ground2: '<svg viewBox="0 0 1440 400" preserveAspectRatio="none" aria-hidden="true"><path class="bt-l2" d="M0 170c200-90 380-120 560-60 100 34 160 60 240 50 260-30 420-130 640-60v300H0z"/></svg>',
    ground1: '<svg viewBox="0 0 1440 400" preserveAspectRatio="none" aria-hidden="true"><path class="bt-l3" d="M0 220c260-60 420-120 620-90 180 26 240 80 400 70 160-10 260-80 420-60v260H0z"/><path class="bt-deep" d="M0 330c300-30 620-40 900-10 220 24 380 10 540-10v90H0z"/></svg>',
    bird: '<svg viewBox="0 0 200 60" aria-hidden="true"><path class="bt-ink" d="M20 30q12-14 24 0 12-14 24 0-12-6-24 4-12-10-24-4zM140 14q8-9 16 0 8-9 16 0-8-4-16 3-8-7-16-3z"/></svg>',
    girl: '<svg viewBox="0 0 40 90" aria-hidden="true"><circle class="bt-hair" cx="20" cy="10" r="8"/><path class="bt-white" d="M14 18h12l10 50H4z"/><path class="bt-skin" d="M14 68h4v18h-4zm8 0h4v18h-4z"/></svg>',
    leaves: '<svg viewBox="0 0 320 300" aria-hidden="true"><path class="bt-l2" d="M10 290C80 220 160 120 300 20l4 6C170 126 92 226 18 296z"/>' + [[60, 230, -40], [100, 190, -30], [140, 150, -45], [180, 112, -20], [220, 80, -50], [260, 50, -25], [90, 250, 40], [130, 210, 30], [170, 172, 45], [210, 136, 35], [250, 100, 40]].map(([x, y, a]) => `<ellipse class="bt-l1" cx="${x}" cy="${y}" rx="38" ry="12" transform="rotate(${a} ${x} ${y})"/>`).join("") + '</svg>',
    fern: '<svg viewBox="0 0 260 340" aria-hidden="true"><path class="bt-l3" d="M130 340C130 220 120 120 90 10l6-2c32 110 42 210 42 332z"/>' + Array.from({ length: 12 }, (_, i) => { const y = 40 + i * 24, w = 30 + i * 6; return `<path class="bt-l3" d="M${102 + i * 2} ${y}q-${w} -6 -${w + 20} 18q${w} 0 ${w + 20} -12zM${108 + i * 2} ${y + 10}q${w} -6 ${w + 20} 18q-${w} 0 -${w + 20} -12z"/>`; }).join("") + '</svg>',
    hands: '<svg viewBox="0 0 520 260" aria-hidden="true"><g class="hand-l"><path class="bt-skin" d="M0 170c60-10 120-20 170 0 30 12 60 40 70 70H90c-40 0-70-30-90-50z"/></g><g class="hand-r"><path class="bt-skin" d="M520 170c-60-10-120-20-170 0-30 12-60 40-70 70h150c40 0 70-30 90-50z"/></g><g class="seed"><ellipse class="bt-bark" cx="260" cy="200" rx="12" ry="8"/></g><g class="plant"><g class="plant1"><path class="bt-l2" d="M258 200v-30h4v30z"/><ellipse class="bt-l1" cx="248" cy="168" rx="14" ry="6" transform="rotate(-25 248 168)"/><ellipse class="bt-l1" cx="272" cy="168" rx="14" ry="6" transform="rotate(25 272 168)"/></g><g class="plant2"><path class="bt-l2" d="M257 200v-80h6v80z"/><ellipse class="bt-l1" cx="236" cy="150" rx="26" ry="10" transform="rotate(-25 236 150)"/><ellipse class="bt-l1" cx="284" cy="140" rx="26" ry="10" transform="rotate(25 284 140)"/><ellipse class="bt-l2" cx="246" cy="118" rx="20" ry="8" transform="rotate(-35 246 118)"/><ellipse class="bt-l2" cx="276" cy="112" rx="20" ry="8" transform="rotate(35 276 112)"/></g></g></svg>',
    family: '<svg viewBox="0 0 600 420" aria-hidden="true"><path class="bt-l1" d="M0 360c120-40 260-70 420-50 80 10 140 30 180 50v60H0z"/>' + [[80, 250, 0.8, "bt-c2"], [200, 150, 1.25, "bt-c1"], [330, 170, 1.1, "bt-c2"], [450, 230, 0.75, "bt-c1"]].map(([x, y, s, c]) => `<g transform="translate(${x} ${y}) scale(${s})"><circle class="bt-hair" cx="0" cy="0" r="16"/><circle class="bt-skin" cx="0" cy="4" r="12"/><path class="${c}" d="M-18 18h36l14 90h-64z"/><path class="bt-skin" d="M-12 108h8v40h-8zm12 0h8v40H0z"/><path class="bt-skin" d="M18 30l40 20-4 6-38-16z"/></g>`).join("") + '</svg>',
    hill: '<svg viewBox="0 0 1440 300" preserveAspectRatio="none" aria-hidden="true"><path class="bt-deep" d="M0 140c240-100 520-140 760-90 260 54 460 30 680-30v280H0z"/></svg>',
    yhill: '<svg viewBox="0 0 1440 300" preserveAspectRatio="none" aria-hidden="true"><path class="bt-ytree" opacity=".35" d="M0 160c240-90 520-120 760-70 260 54 460 30 680-30v240H0z"/></svg>',
    globe: '<svg viewBox="0 0 160 160" aria-hidden="true"><circle style="fill:var(--site-sky2)" cx="80" cy="90" r="60"/><path class="bt-l2" d="M40 70c20-10 40 0 50 20s-10 30-30 40c-20-10-30-40-20-60zm60-10c20 0 40 20 30 40-10 10-20 0-30-10s-10-30 0-30z"/><path class="bt-bark" d="M78 30h4v20h-4z"/>' + crown(rng(9), 80, 26, 18, "bt-l1") + '</svg>',
    loop: '<svg viewBox="0 0 160 120" aria-hidden="true"><path style="fill:none;stroke:var(--site-yellow-tree);stroke-width:18;stroke-linecap:round" d="M40 60c0-22 30-22 40 0s40 22 40 0-30-22-40 0-40 22-40 0z"/><path class="bt-l2" d="M96 18c10-10 24-8 30 0-10 8-20 8-30 0z"/></svg>',
    sns: { tw: '<svg viewBox="0 0 24 24" aria-hidden="true"><path style="fill:currentColor" d="M22 5.8a8.2 8.2 0 0 1-2.4.6A4.1 4.1 0 0 0 21.4 4a8.3 8.3 0 0 1-2.6 1 4.1 4.1 0 0 0-7 3.7A11.6 11.6 0 0 1 3.4 4.5a4.1 4.1 0 0 0 1.3 5.5 4 4 0 0 1-1.9-.5 4.1 4.1 0 0 0 3.3 4 4.1 4.1 0 0 1-1.8.1 4.1 4.1 0 0 0 3.8 2.8A8.2 8.2 0 0 1 2 18.1 11.6 11.6 0 0 0 8.3 20c7.5 0 11.7-6.3 11.7-11.7v-.5A8.4 8.4 0 0 0 22 5.8z"/></svg>', line: '<svg viewBox="0 0 24 24" aria-hidden="true"><path style="fill:currentColor" d="M12 3C6.5 3 2 6.6 2 11c0 4 3.5 7.3 8.3 7.9.3.1.8.2.9.5.1.3.1.7 0 1l-.1.9c0 .3-.2 1 .9.5s6-3.5 8.2-6c1.5-1.6 2.2-3.3 2.2-4.8C22 6.6 17.5 3 12 3z"/></svg>' },
  };
  const make = (name, el) => {
    if (ART[name] && typeof ART[name] === "string") return ART[name];
    const m = name.match(/^(forest|tree)-?(\d+)?/);
    if (!m) return "";
    const seed = +(m[2] || 7);
    if (m[1] === "tree") return tree(seed, el.dataset.leaf || LEAF[seed % 4]);
    return forest(+(el.dataset.w || 1440), +(el.dataset.h || 400), +(el.dataset.n || 18), seed, { birch: +(el.dataset.birch ?? 0.15) });
  };
  const fill = (root = document) => root.querySelectorAll("i[data-art]").forEach((i) => {
    const span = document.createElement("span");
    span.className = i.className;
    for (const a of i.attributes) if ((a.name.startsWith("data-") && a.name !== "data-art") || a.name === "style") span.setAttribute(a.name, a.value);
    span.setAttribute("data-art", i.dataset.art);
    span.innerHTML = make(i.dataset.art, i);
    i.replaceWith(span);
  });

  const NAV = [["index.html", "Top", "First Page", "home"], ["sdgs.html", "SDGs", "SDGs Declaration", "sdgs"], ["protection.html", "Protection", "Environmental protection", "protection"], ["campaign.html", "Action", "Activities so far", "campaign"]];
  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.className = "bt-head";
    head.innerHTML = `<a class="bt-head__logo" href="index.html" data-label="Brand logo + campaign name"><b>BRAND</b><span>FOR A SUSTAINABLE FUTURE</span></a>
      <nav class="bt-head__nav" aria-label="Main menu">${NAV.map(([h, e, k, p]) => `<a href="${h}"${p === page ? ' aria-current="page"' : ""}><b>${e}</b><small>${k}</small></a>`).join("")}</nav>
      <button class="bt-head__toggle" type="button" aria-label="Open Menu"><span class="bg"></span><i></i><i></i><i></i></button>`;
    const nav = document.createElement("nav");
    nav.className = "bt-nav";
    nav.setAttribute("data-slot", "menu");
    nav.innerHTML = `<ul>${NAV.map(([h, e, k]) => `<li><a href="${h}"><b>${e}</b><small>${k}</small></a></li>`).join("")}</ul>`;
    head.after(nav);
    head.querySelector(".bt-head__toggle").addEventListener("click", () => document.documentElement.classList.toggle("is-menu"));
    nav.addEventListener("click", (e) => { if (e.target.closest("a")) document.documentElement.classList.remove("is-menu"); });
  }
  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.classList.add("bt-foot");
    foot.innerHTML = `<i class="bt-foot__forest" data-art="forest-21" data-w="1440" data-h="560" data-n="26" data-birch=".2"></i>
      <div class="bt-foot__inner">${foot.dataset.lead ? `<p class="bt-foot__lead">${foot.dataset.lead}</p>` : ""}<p class="bt-foot__share">Share</p>
      <div class="bt-foot__sns"><a href="#top" aria-label="Social">${ART.sns.tw}</a><a href="#top" aria-label="Line">${ART.sns.line}</a></div>
      ${page !== "home" ? `<p class="bt-foot__crumb"><a href="index.html">TOP</a> ＞ ${foot.dataset.crumb || ""}</p>` : ""}<p class="bt-foot__copy">© 2023 BRAND</p></div>`;
  }
  fill();

  // Pill button — the original [data-js-hover] adds .-mouse-enter on entering and .-mouse-out on leaving to play keyframes
  document.querySelectorAll(".bt-btn").forEach((b) => {
    if (!b.querySelector(".circle")) b.insertAdjacentHTML("beforeend", '<span class="circle"><div></div></span>');
    b.addEventListener("mouseenter", () => { b.classList.remove("is-out"); b.classList.add("is-enter"); });
    b.addEventListener("mouseleave", () => { b.classList.remove("is-enter"); b.classList.add("is-out"); });
  });

  // Smooth scroll — original Lenis 1.0.19 { duration: 1, wheelMultiplier: .4 }, ScrollTrigger.update every frame
  let lenis = null;
  if (!reduce && window.Lenis && matchMedia("(min-width: 769px)").matches) {
    lenis = new Lenis({ duration: 1, wheelMultiplier: 0.4 });
    const raf = (t) => { lenis.raf(t); window.ScrollTrigger?.update(); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }
  window.btLenis = lenis;

  // [data-parallax="a,b"] — original [data-parallax-pc]: from the cell entering at the bottom of the screen until it exits at the top, the inner image goes a% → b% (linear scrub)
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
      document.querySelectorAll("[data-parallax]").forEach((el) => {
        const [a, b] = el.dataset.parallax.split(",").map(Number);
        gsap.fromTo(el.firstElementChild, { yPercent: a }, { yPercent: b, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } });
      });
    });
  }

  // Header row — when the logo cell overlaps the green panel ([data-nav-white-area]) the text turns white, and the logo turns on once [data-logo-from] touches the top of the screen
  if (head) {
    const logo = head.querySelector(".bt-head__logo"), from = document.querySelector("[data-logo-from]");
    const hit = (a, b) => { const r = a.getBoundingClientRect(), s = b.getBoundingClientRect(); return !(r.top > s.bottom || r.bottom < s.top); };
    // While the hero has ended and the green cover is laid (.is-left), still count it as the green panel
    const check = () => {
      head.dataset.colorWhite = [...document.querySelectorAll("[data-nav-white-area], .is-left")].some((w) => hit(logo, w));
      head.dataset.showLogo = from ? from.getBoundingClientRect().top < 90 : true;
    };
    addEventListener("scroll", check, { passive: true });
    check();
  }
})();
