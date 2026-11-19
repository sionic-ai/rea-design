(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── Five sea pictures (1600×1000) — new scenes redrawn with the same composition and color areas instead of the original illustrations. fill is a skin variable ── */
  const blobs = (seed, n, color, op, sx = 1600, sy = 1000, size = 120) => {
    let s = seed, out = "";
    const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < n; i++) {
      const x = r() * sx, y = r() * sy, w = size * (0.5 + r()), h = size * (0.25 + r() * 0.45);
      out += `<path fill="${color}" opacity="${op}" d="M${x} ${y}c${w * 0.4} ${-h * 0.6} ${w} ${-h * 0.2} ${w} ${h * 0.25}s${-w * 0.3} ${h * 0.6} ${-w * 0.55} ${h * 0.45}S${x - w * 0.15} ${y + h * 0.4} ${x} ${y}Z"/>`;
    }
    return out;
  };
  const fish = (seed, n, color, op, area = [0, 0, 1600, 1000], size = 22) => {
    let s = seed, out = "";
    const r = () => ((s = (s * 48271) % 2147483647) / 2147483647);
    for (let i = 0; i < n; i++) {
      const x = area[0] + r() * area[2], y = area[1] + r() * area[3], k = size * (0.6 + r() * 0.8), f = r() > 0.5 ? 1 : -1;
      out += `<path fill="${color}" opacity="${op}" transform="translate(${x} ${y}) scale(${f * k / 20} ${k / 20})" d="M-10 0c4-5 12-5 18 0-6 5-14 5-18 0Zm18 0 6-4v8Z"/>`;
    }
    return out;
  };
  const swimmer = (x, y, s, rot) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})"><ellipse cx="0" cy="0" rx="34" ry="11" fill="var(--site-swim)"/><circle cx="-46" cy="-2" r="11" fill="var(--kf-contrast-bg)"/><path d="M-30 -6-70-30M-30 6-72 20M30-4 70-14M30 4 74 12" stroke="var(--site-sand)" stroke-width="7" stroke-linecap="round"/></g>`;
  const SCENES = {
    seaside: () => `<svg viewBox="0 0 1600 1000" xmlns="http://www.w3.org/2000/svg">
      <rect width="1600" height="560" fill="var(--site-sky)"/>
      <g fill="var(--kf-contrast-ink)"><ellipse cx="420" cy="150" rx="120" ry="34"/><ellipse cx="500" cy="130" rx="70" ry="40"/><ellipse cx="1180" cy="210" rx="140" ry="30"/><ellipse cx="1240" cy="190" rx="60" ry="34"/><ellipse cx="820" cy="90" rx="60" ry="16"/></g>
      <path d="M0 470c120-50 260-60 380-30 90-40 200-30 300 10l0 30H0Z" fill="var(--site-hill)"/>
      <rect y="480" width="1600" height="120" fill="var(--site-sea)"/>
      <g fill="var(--kf-contrast-ink)"><rect x="1330" y="330" width="34" height="150" rx="4"/><rect x="1322" y="318" width="50" height="16" rx="3"/><path d="M1334 318l13-22 13 22Z"/></g>
      <rect y="600" width="1600" height="130" fill="var(--site-brick)"/>
      <g stroke="var(--kf-contrast-ink)" stroke-width="7"><path d="M0 560H1600M0 588H1600"/>${Array.from({ length: 33 }, (_, i) => `<path d="M${i * 50} 560v44"/>`).join("")}</g>
      <rect y="730" width="1600" height="270" fill="var(--site-sand)"/>
      <path d="M0 730H1600" stroke="var(--kf-contrast-ink)" stroke-width="4"/>
      <g transform="translate(980 470)"><path d="M0 0c-14 30-20 80-16 140h44c4-60-2-110-16-140Z" fill="var(--kf-contrast-ink)"/><circle cx="6" cy="-14" r="16" fill="var(--kf-contrast-bg)"/><path d="M-4 -26c20-10 40 10 60 30" stroke="var(--kf-contrast-bg)" stroke-width="7" fill="none"/><path d="M-10 140l-6 50M20 140l8 50" stroke="var(--site-sand)" stroke-width="7"/><ellipse cx="0" cy="250" rx="80" ry="14" fill="var(--site-brick)" opacity=".5"/></g>
      <g transform="translate(250 820)" fill="none" stroke="var(--site-yellow)" stroke-width="7"><circle cx="0" cy="40" r="44"/><circle cx="150" cy="40" r="44"/><path d="M0 40 50-20h70l30 60M50-20 80 40l40-60M40-40h30M120-34l10-14"/></g>
    </svg>`,
    surface: () => `<svg viewBox="0 0 1600 1000" xmlns="http://www.w3.org/2000/svg">
      <rect width="1600" height="1000" fill="var(--site-sea)"/>
      ${blobs(11, 46, "var(--site-sky)", 0.85, 1600, 1000, 170)}${blobs(23, 24, "var(--site-foam)", 0.5, 1600, 700, 90)}
      ${swimmer(760, 170, 1.4, -14)}
      ${fish(5, 10, "var(--site-foam)", 0.7, [200, 600, 1200, 380], 18)}
    </svg>`,
    deep: () => `<svg viewBox="0 0 1600 1000" xmlns="http://www.w3.org/2000/svg">
      <rect width="1600" height="1000" fill="var(--site-sea)"/>
      ${blobs(31, 30, "var(--site-sky)", 0.45, 1600, 520, 160)}
      <g fill="var(--site-foam)" opacity=".16"><path d="M400 0h90L300 1000h-60Z"/><path d="M760 0h60L700 1000h-40Z"/><path d="M1100 0h110L980 1000h-70Z"/></g>
      ${swimmer(820, 120, 0.8, -8)}
      ${fish(9, 26, "var(--site-sky)", 0.85, [100, 420, 1400, 520], 20)}
    </svg>`,
    school: () => `<svg viewBox="0 0 1600 1000" xmlns="http://www.w3.org/2000/svg">
      <rect width="1600" height="1000" fill="var(--site-deep)"/>
      <rect width="1600" height="420" fill="var(--site-sea)" opacity=".55"/>
      ${blobs(41, 14, "var(--site-sky)", 0.25, 1600, 320, 140)}
      ${fish(13, 46, "var(--site-sky)", 0.75, [0, 260, 1600, 680], 18)}${fish(17, 14, "var(--site-foam)", 0.5, [900, 120, 600, 400], 14)}
    </svg>`,
    beach: () => `<svg viewBox="0 0 1600 1000" xmlns="http://www.w3.org/2000/svg">
      <rect width="1600" height="1000" fill="var(--site-sea)"/>
      <path d="M0 520c160-60 220 40 380 0s180-180 360-220 260 60 420 20 300-160 440-140V1000H0Z" fill="var(--site-sand)"/>
      <path d="M0 520c160-60 220 40 380 0s180-180 360-220 260 60 420 20 300-160 440-140" fill="none" stroke="var(--kf-contrast-ink)" stroke-width="26" stroke-linecap="round" opacity=".9"/>
      <path d="M0 470c160-60 220 40 380 0s180-180 360-220 260 60 420 20 300-160 440-140" fill="none" stroke="var(--site-foam)" stroke-width="14" opacity=".7"/>
      <g fill="var(--site-brick)"><path d="M180 760c60-40 140-20 160 30s-60 90-130 70-80-60-30-100Z"/><path d="M1180 860c40-30 120-30 140 10s-40 70-100 60-70-40-40-70Z"/></g>
      <g fill="var(--site-swim)" opacity=".75"><circle cx="760" cy="880" r="40"/><circle cx="1420" cy="560" r="30"/></g>
    </svg>`,
  };
  window.umScene = (name) => (SCENES[name] || SCENES.surface)();
  document.querySelectorAll("[data-scene]").forEach((n) => {
    n.innerHTML = window.umScene(n.dataset.scene);
    if (n.classList.contains("um-lhead__bg")) n.firstElementChild.setAttribute("preserveAspectRatio", "xMidYMid slice");
  });

  /* Arrow link icon + two-line text */
  document.querySelectorAll(".um-arrow").forEach((a) => {
    const t = a.textContent.trim();
    a.innerHTML = `<span class="um-arrow__txt"><span></span><span aria-hidden="true"></span></span><svg viewBox="0 0 67 6" aria-hidden="true"><rect class="is-line" x="0" y="2.5" width="62" height="1"/><path class="is-head" d="M58 0 67 3 58 6Z"/><circle class="is-dot" cx="44" cy="3" r="1.5"/><circle class="is-dot" cx="52" cy="3" r="1.5"/><circle class="is-dot" cx="60" cy="3" r="1.5"/></svg>`;
    a.querySelectorAll(".um-arrow__txt > span").forEach((s) => { s.textContent = t; });
  });

  /* ── Smooth scroll: original Lenis(1.3.x) default lerp .1 · GSAP ticker ── */
  if (window.gsap && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
  if (window.Lenis && !reduce) {
    const lenis = new Lenis({ lerp: 0.1 });
    window.umLenis = lenis;
    lenis.on("scroll", () => window.ScrollTrigger?.update());
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  /* ── Subsection header: image 1.12x and blurred → sharp over 1.8s power2.inOut, title blur → sharp over 1.1s, on scroll image 12% · title −260% ── */
  const lhead = document.querySelector(".um-lhead");
  if (lhead && window.gsap) {
    const bg = lhead.querySelector(".um-lhead__bg"), title = lhead.querySelector(".um-lhead__title");
    if (reduce) gsap.set([bg, title], { clearProps: "all" });
    else {
      gsap.to(bg, { scale: 1, filter: "blur(0px)", duration: 1.8, ease: "power2.inOut", onComplete: () => gsap.set(bg, { willChange: "auto" }) });
      gsap.to(title, { opacity: 1, filter: "blur(0px)", letterSpacing: "0.02em", duration: 1.1, ease: "power2.out" });
      gsap.to([bg, title], { yPercent: (i) => [12, -260][i], ease: "none", scrollTrigger: { trigger: lhead, start: "top top", end: "bottom top", scrub: 1.2, invalidateOnRefresh: true } });
    }
  }

  /* Body block: when it reaches 92% of the screen it floats up from 20px below in .8s (once) */
  if (window.gsap && !reduce) document.querySelectorAll("[data-reveal]").forEach((n) => {
    gsap.set(n, { opacity: 0, y: 20 });
    gsap.to(n, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out", scrollTrigger: { trigger: n, start: "top 92%", once: true } });
  });

  /* ── Footer: when within 85% of the footer height from the document end, each line rises inside its mask over .9s power3.out (.06s apart, .12s between groups), and reverses when out of range ── */
  const foot = document.querySelector(".um-footer__in");
  if (foot && window.gsap && !reduce) {
    const groups = [...foot.querySelectorAll("[data-foot]")].reduce((m, n) => { (m[n.dataset.foot] ||= []).push(n); return m; }, {});
    const wrap = (n) => { const s = document.createElement("span"); s.append(...n.childNodes); n.replaceChildren(s); n.classList.add("um-mask"); return s; };
    const lists = Object.keys(groups).sort().map((k) => groups[k].map(wrap));
    const all = lists.flat();
    gsap.set(all, { yPercent: 100, opacity: 0 });
    const tl = gsap.timeline({ paused: true });
    let at = 0;
    lists.forEach((g) => { tl.to(g, { yPercent: 0, opacity: 1, duration: 0.9, ease: "power3.out", stagger: 0.06 }, at); at += 0.12 + 0.06 * (g.length - 1); });
    let shown = false;
    const near = () => document.documentElement.scrollHeight - innerHeight - scrollY <= foot.offsetHeight * 0.85;
    const check = () => { const n = near(); if (n && !shown) tl.play(); else if (!n && shown) tl.progress(0).pause(); shown = n; };
    addEventListener("scroll", check, { passive: true });
    check();
  }
})();
