// Common to all pages: draws the left vertical menu, hamburger panel and footer box, and the original illustrations (clouds, pines, mountain, torii gate, feathered robe, goddess, votive plaque, map)
// Redrawn as SVG in the same spot and feel. Colors are all CSS variables, so the art changes along with the skin.
// Original values: when visible is-active (threshold .5) → text 2s · image 2.5s · descending image 4s · menu panel .5s, items .6s each delayed by .1s · header hides when scrolling down inside the scroller (.8s) ·
// The ‹View story› link slides down with a 500ms swing
(() => {
  const page = document.body.dataset.page || "home";
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const KB = (window.KB = { reduced });

  let uid = 0;
  const id = (p) => `${p}${uid++}`;
  const grad = (gid, stops, x2 = 0, y2 = 1) =>
    `<linearGradient id="${gid}" x1="0" y1="0" x2="${x2}" y2="${y2}">${stops.map(([o, c]) => `<stop offset="${o}" style="stop-color:${c}"/>`).join("")}</linearGradient>`;

  // ── Image ──
  const art = {
    // Layered clouds with flat bottoms — pink on top, cream below
    cloud(variant = 0) {
      const g = id("cg");
      const sets = [
        [[38, 62, 30], [78, 44, 38], [124, 50, 34], [162, 62, 28], [196, 70, 22]],
        [[30, 66, 24], [64, 50, 32], [104, 38, 40], [148, 52, 32], [184, 64, 24]],
        [[44, 58, 34], [96, 40, 42], [150, 56, 32]],
      ][variant % 3];
      const back = sets.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}"/>`).join("");
      const front = sets.map(([x, y, r]) => `<circle cx="${x * 0.7 + 40}" cy="${y + 26}" r="${r * 0.62}"/>`).join("");
      return `<svg class="kb-art kb-cloud" viewBox="0 0 220 110" preserveAspectRatio="xMidYMax meet" aria-hidden="true"><defs>${grad(g, [[0, "var(--kb-cloud-top)"], [0.62, "var(--kb-cloud-mid)"], [1, "var(--kb-cloud-low)"]])}${grad(g + "f", [[0, "var(--kb-cloud-mid)"], [1, "var(--kb-cloud-low)"]])}</defs><g style="fill:url(#${g})">${back}<rect x="10" y="62" width="200" height="48" rx="24"/></g><g style="fill:url(#${g}f)">${front}<rect x="40" y="80" width="140" height="30" rx="15"/></g></svg>`;
    },
    // Cushion of striped leaves on a curved stem
    pine(variant = 0) {
      const g = id("pg");
      const pads = [
        [[44, 56, 34, "var(--kb-pine-1)"], [110, 30, 40, "var(--kb-pine-2)"], [150, 84, 32, "var(--kb-pine-3)"], [60, 110, 30, "var(--kb-pine-4)"], [128, 128, 26, "var(--kb-pine-5)"]],
        [[70, 40, 38, "var(--kb-pine-2)"], [138, 70, 30, "var(--kb-pine-1)"], [40, 96, 28, "var(--kb-pine-5)"], [116, 120, 30, "var(--kb-pine-3)"]],
      ][variant % 2];
      // Leaf cushion is a wide, flat half-moon with two grain lines
      const pad = ([x, y, r, c]) => {
        const w = r * 1.35, h = r * 0.5;
        return `<g transform="translate(${x} ${y})"><path d="M${-w} 0 C${-w} ${-h * 1.2} ${-w * 0.4} ${-h * 1.3} 0 ${-h * 1.3} C${w * 0.4} ${-h * 1.3} ${w} ${-h * 1.2} ${w} 0 Q0 ${h * 0.35} ${-w} 0 Z" style="fill:${c}"/><path d="M${-w * 0.72} ${-h * 0.25} Q0 ${-h * 0.95} ${w * 0.72} ${-h * 0.25}" style="fill:none;stroke:var(--kb-pine-line);stroke-width:2"/><path d="M${-w * 0.42} ${-h * 0.62} Q0 ${-h * 1.05} ${w * 0.42} ${-h * 0.62}" style="fill:none;stroke:var(--kb-pine-line);stroke-width:2"/></g>`;
      };
      return `<svg class="kb-art kb-pine" viewBox="0 0 200 240" preserveAspectRatio="xMidYMax meet" aria-hidden="true"><defs>${grad(g, [[0, "var(--kb-trunk-top)"], [1, "var(--kb-trunk-low)"]])}</defs><path d="M96 240 C88 200 120 180 104 150 C92 128 70 124 64 104 M104 150 C120 130 140 110 150 84 M98 176 C70 160 48 140 44 56 M104 150 C108 110 112 70 110 30" style="fill:none;stroke:url(#${g});stroke-width:9;stroke-linecap:round"/>${pads.map(pad).join("")}</svg>`;
    },
    fuji() {
      const g = id("fg");
      return `<svg class="kb-art kb-fuji" viewBox="0 0 240 140" preserveAspectRatio="xMidYMax meet" aria-hidden="true"><defs>${grad(g, [[0, "var(--kb-navy)"], [1, "var(--kb-sky)"]])}</defs><path d="M0 140 L96 22 Q120 8 144 22 L240 140 Z" style="fill:url(#${g})"/><path d="M96 22 Q120 8 144 22 L166 48 L150 42 L138 56 L124 44 L110 58 L98 44 L80 50 Z" style="fill:var(--kb-cream)"/></svg>`;
    },
    torii() {
      return `<svg class="kb-art kb-torii" viewBox="0 0 160 130" preserveAspectRatio="xMidYMax meet" aria-hidden="true"><g style="fill:var(--kb-torii)"><path d="M4 14 Q80 4 156 14 L152 24 Q80 16 8 24 Z"/><rect x="18" y="36" width="124" height="8"/><rect x="34" y="20" width="10" height="110"/><rect x="116" y="20" width="10" height="110"/><rect x="74" y="24" width="12" height="14"/></g></svg>`;
    },
    // Wing-garment bands reaching to the sky (white bands like a waterfall)
    robe(tall = 1) {
      const g = id("rg");
      return `<svg class="kb-art kb-robe" viewBox="0 0 120 ${600 * tall}" preserveAspectRatio="none" aria-hidden="true"><defs>${grad(g, [[0, "var(--kb-robe-a)"], [0.5, "var(--kb-robe-b)"], [1, "var(--kb-robe-a)"]], 1, 0)}</defs><path d="M30 0 C10 ${200 * tall} 50 ${380 * tall} 20 ${600 * tall} L100 ${600 * tall} C80 ${380 * tall} 110 ${200 * tall} 90 0 Z" style="fill:url(#${g})"/><g class="kb-robe__flow" style="stroke:var(--kb-cream);stroke-width:2;opacity:.6;fill:none">${[0, 1, 2, 3].map((i) => `<path d="M${44 + i * 10} 0 C${36 + i * 10} ${200 * tall} ${50 + i * 8} ${400 * tall} ${40 + i * 12} ${600 * tall}"/>`).join("")}</g></svg>`;
    },
    // A goddess sitting on a cloud holding a lute
    goddess() {
      const g = id("bg");
      return `<svg class="kb-art kb-goddess" viewBox="0 0 220 300" preserveAspectRatio="xMidYMax meet" aria-hidden="true"><defs>${grad(g, [[0, "var(--kb-robe-red)"], [1, "var(--kb-cloud-top)"]])}</defs><circle cx="110" cy="70" r="52" style="fill:var(--kb-halo)"/><path d="M110 104 C60 130 40 220 30 262 L190 262 C180 220 160 130 110 104 Z" style="fill:url(#${g})"/><path d="M70 160 C90 150 130 150 150 160 L146 176 C126 168 94 168 74 176 Z" style="fill:var(--kb-gold)"/><circle cx="110" cy="76" r="24" style="fill:var(--kb-skin)"/><path d="M84 70 C86 44 134 44 136 70 C130 58 90 58 84 70 Z" style="fill:var(--kb-navy)"/><path d="M92 46 L100 26 L110 40 L120 26 L128 46 Z" style="fill:var(--kb-gold)"/><path d="M103 80 Q110 84 117 80" style="fill:none;stroke:var(--kb-robe-red);stroke-width:2"/><g transform="rotate(-28 150 190)"><ellipse cx="150" cy="200" rx="22" ry="34" style="fill:var(--kb-wood)"/><rect x="146" y="120" width="8" height="60" style="fill:var(--kb-wood)"/><path d="M150 124 V226" style="stroke:var(--kb-cream);stroke-width:1"/></g></svg>`;
    },
    // House-shaped wooden plaque — white box inside
    ema() {
      return `<svg class="kb-art kb-plaque" viewBox="0 0 330 290" aria-hidden="true"><path d="M8 92 L165 6 L322 92 L300 100 L165 30 L30 100 Z" style="fill:var(--kb-wood)"/><rect x="34" y="88" width="262" height="196" style="fill:var(--kb-wood)"/><rect x="34" y="276" width="262" height="10" style="fill:var(--kb-robe-red)"/></svg>`;
    },
    // Round seal logo slot
    logo() {
      return `<svg class="kb-art kb-logo" viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="56" r="40" style="fill:none;stroke:currentColor;stroke-width:3"/><path d="M38 52 C46 30 74 30 82 52 C76 44 66 70 60 52 C54 70 44 44 38 52 Z" style="fill:currentColor"/><text class="kb-logo__word" x="60" y="78" text-anchor="middle">LOGO</text><path d="M18 98 Q60 110 102 98 L98 108 Q60 118 22 108 Z" style="fill:none;stroke:currentColor;stroke-width:2"/></svg>`;
    },
    map() {
      return `<svg class="kb-art kb-map" viewBox="0 0 400 260" aria-hidden="true"><g style="fill:none;stroke:var(--kb-navy);stroke-width:26;stroke-linecap:round"><path d="M10 230 L390 60"/><path d="M150 10 L250 250"/><path d="M10 120 Q120 140 200 130"/></g><g style="fill:var(--kb-sky)">${[[30, 60], [270, 170], [60, 180], [300, 40]].map(([x, y]) => `<rect x="${x}" y="${y}" width="70" height="24" rx="12"/>`).join("")}</g><path d="M300 110 c0-14 22-14 22 0 c0 12-11 24-11 24 s-11-12-11-24z" style="fill:var(--kb-pink)"/><circle cx="311" cy="110" r="4" style="fill:var(--kb-cream)"/></svg>`;
    },
  };
  KB.art = art;
  // The markup’s <i data-art="cloud" data-v="1"></i> Fill the space with artwork
  KB.paint = (root = document) =>
    root.querySelectorAll("[data-art]:empty").forEach((el) => (el.innerHTML = art[el.dataset.art](Number(el.dataset.v || 0))));

  const icon = {
    x: '<svg viewBox="0 0 24 24" style="fill:currentColor"><path d="M4 3h4.5l4 5.6L17 3h3l-6 7.2L21 21h-4.5l-4.4-6.1L7 21H4l6.6-7.9z"/></svg>',
    ig: '<svg viewBox="0 0 24 24" style="fill:none;stroke:currentColor;stroke-width:1.8"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r=".6" style="fill:currentColor"/></svg>',
    tt: '<svg viewBox="0 0 24 24" style="fill:currentColor"><path d="M14 3h3c.2 2 1.6 3.6 3.6 3.8v3c-1.4 0-2.6-.4-3.6-1.1V15a6 6 0 1 1-6-6v3.1A2.9 2.9 0 1 0 14 15z"/></svg>',
    yt: '<svg viewBox="0 0 24 24" style="fill:currentColor"><path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8zM10 15V9l5.2 3z"/></svg>',
  };
  KB.icon = icon;

  const NAV = [
    ["contact", "contact.html", "Inquiry"],
    ["news", "news.html", "Latest news"],
    ["about", "about.html", "Shop Guide"],
    ["meet", "index.html#meet", "About the group"],
    ["event", "index.html#event", "Event details"],
    ["story", "index.html#story", "View story"],
  ];
  const sns = () => ["x", "ig", "tt", "yt"].map((k) => `<li class="kb-sns__item"><a href="#" aria-label="SNS">${icon[k]}</a></li>`).join("");

  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.className = "kb-head";
    head.innerHTML = `
      <a class="kb-head__logo" href="index.html" aria-label="Home">${art.logo()}</a>
      <div class="kb-head__menu">
        <nav class="kb-head__nav" aria-label="Main menu"><ul>${NAV.map(([k, h, t]) => `<li class="kb-head__item${k === page ? " is-on" : ""}"><a${k === "story" ? ' class="is-smooth"' : ""} href="${h}"${k === "story" ? " data-smooth" : ""}>${t}</a></li>`).join("")}</ul></nav>
        <ul class="kb-sns">${sns()}</ul>
        <div class="kb-shop"><a class="kb-shop__link" href="#">ONLINE SHOP</a></div>
      </div>
      <button class="kb-burger" type="button" aria-label="Open Menu"><i></i><i></i><i></i></button>`;
    head.insertAdjacentHTML("afterend", '<div class="kb-head__overlay"></div>');
    const burger = head.querySelector(".kb-burger");
    const overlay = document.querySelector(".kb-head__overlay");
    const toggle = (open) => {
      head.classList.toggle("is-open", open);
      overlay.classList.toggle("is-active", open);
      document.body.style.overflow = open ? "hidden" : "";
    };
    burger.addEventListener("click", () => toggle(!head.classList.contains("is-open")));
    overlay.addEventListener("click", () => toggle(false));
    head.querySelectorAll(".kb-head__item a").forEach((a) => a.addEventListener("click", () => toggle(false)));
  }

  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.className = "kb-foot";
    foot.innerHTML = `
      <div class="kb-foot__inner">
        <a class="kb-foot__logo" href="index.html" aria-label="Home">${art.logo()}</a>
        <div class="kb-foot__box">
          <div class="kb-foot__texts"><p class="kb-foot__large">Company Name Inc.</p><p>〒000-0000<br>Your one-line address here 00-00 Building, 0F</p></div>
          <div class="kb-foot__texts"><a href="#">Privacy policy</a><p class="kb-foot__small">Copyright © Company Name Co.,Ltd. All Rights Reserved.</p></div>
        </div>
        <div class="kb-foot__menu">
          <ul class="kb-foot__list">${NAV.slice().reverse().map(([k, h, t]) => `<li><a class="kb-foot__link${k === "story" ? " is-smooth" : ""}" href="${h}"${k === "story" ? " data-smooth" : ""}>${t}</a></li>`).join("")}<li class="is-large"><a class="kb-foot__link kb-foot__channel" href="#" aria-label="Channel"><span data-art="goddess"></span><b>CHANNEL</b></a></li></ul>
          <ul class="kb-foot__list is-sns">${["x", "ig", "tt", "yt"].map((k) => `<li><a class="kb-foot__link" href="#" aria-label="SNS">${icon[k]}</a></li>`).join("")}</ul>
        </div>
      </div>`;
  }

  KB.paint();

  // Original main.js smoothScroll — in-page #name links scroll down with a 500ms swing and clear the # from the address.
  // When arriving from another page with #name, keep it at the top, then scroll down the same way after .1s
  const swing = (p) => 0.5 - Math.cos(p * Math.PI) / 2;
  const glide = (el, done) => {
    const from = scrollY, to = el.getBoundingClientRect().top + scrollY, t0 = performance.now();
    if (reduced) { scrollTo(0, to); done?.(); return; }
    const step = (now) => {
      const p = Math.min(1, (now - t0) / 500);
      scrollTo(0, from + (to - from) * swing(p));
      if (p < 1) requestAnimationFrame(step);
      else done?.();
    };
    requestAnimationFrame(step);
  };
  const clearHash = () => history.replaceState(null, "", location.pathname);
  document.querySelectorAll("a[data-smooth]").forEach((a) =>
    a.addEventListener("click", (e) => {
      const url = new URL(a.href, location.href);
      const el = url.pathname === location.pathname && url.hash && document.querySelector(url.hash);
      if (!el) return;
      e.preventDefault();
      glide(el, clearHash);
    }),
  );
  const landed = location.hash && document.querySelector(location.hash);
  if (landed) {
    scrollTo(0, 0);
    setTimeout(() => { clearHash(); glide(landed); }, 100);
  }

  // When visible, is-active — same as the original IntersectionObserver (threshold .5), transition in CSS
  const inview = ".kb-text-in, .kb-item-in, .kb-item-down, .kb-item-noup";
  if (reduced) document.querySelectorAll(inview).forEach((el) => el.classList.add("is-active"));
  else {
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && e.target.classList.add("is-active")), { threshold: 0.5 });
    document.querySelectorAll(inview).forEach((el) => io.observe(el));
  }
})();
