// First page motion. Original values:
// Wordmark folds · hero photo 1→.95 (phone .9) scrubbed over scroll 0→320px (PC true · phone .4) · scrolling down past 750px hides the logo and menu
// About pin 1 screen scrub 1: concentric circles .313→1 · opacity .8 · xPercent -50→-53.34, map 1→1.7 · fades out, labels from the .5 point (on phone based on bottom edge, 1→1.5)
// border photo 1.12→1 · concept (step+1)×100vh pinned, gap polygon(0 57%,100% 43%) → full 2s cubic-bezier(.16,1,.3,1)
// Detail hover letters .9s power2.out stagger .03 · body lines .7s expo.out stagger .09 · gallery y=.6×(photo-box) → 0 scrub 1 top bottom-=25%
(() => {
  const OR = window.OR;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  $$("[data-arrow]").forEach((el) => (el.innerHTML = OR.icons.arrow));

  // Map line art: instead of the original map image, redrawn in the same composition (land at top and left, bay at bottom center, peninsula at bottom right)
  const rng = (seed) => () => ((seed = (seed + 0x6d2b79f5) | 0), (((seed ^ (seed >>> 15)) * (1 | seed)) >>> 0) / 4294967296);
  const drawMap = (host) => {
    const W = 680, H = 489, r = rng(7);
    const coarse = [
      [-10, -10], [640, -10], [612, 90], [592, 168], [648, 226], [604, 262], [566, 302], [544, 380], [506, 448], [446, 499],
      [414, 470], [392, 402], [372, 348], [356, 300], [338, 286], [314, 318], [302, 370], [290, 430], [278, 474], [256, 444],
      [204, 422], [146, 432], [96, 452], [48, 499], [-10, 499],
    ];
    const pts = [];
    coarse.forEach((a, i) => {
      const b = coarse[(i + 1) % coarse.length];
      const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
      const n = Math.max(1, Math.round(len / 7));
      const nx = -(b[1] - a[1]) / (len || 1), ny = (b[0] - a[0]) / (len || 1);
      const edge = a[0] < 0 || a[1] < 0 || b[0] < 0 || b[1] < 0 || a[1] > H || b[1] > H;
      for (let k = 0; k < n; k++) {
        const t = k / n, d = edge ? 0 : (r() - 0.5) * 7 + Math.sin(t * 9 + i) * 2.5;
        pts.push([a[0] + (b[0] - a[0]) * t + nx * d, a[1] + (b[1] - a[1]) * t + ny * d]);
      }
    });
    const land = "M" + pts.map((p) => p.map((v) => v.toFixed(1)).join(" ")).join("L") + "Z";
    const wavy = (x0, y0, x1, y1, amp, seg) => {
      const out = [];
      for (let i = 0; i <= seg; i++) {
        const t = i / seg;
        const j = i === 0 || i === seg ? 0 : (r() - 0.5) * amp;
        out.push([x0 + (x1 - x0) * t + j, y0 + (y1 - y0) * t + (r() - 0.5) * amp]);
      }
      return out;
    };
    const path = (p) => "M" + p.map((q) => q.map((v) => v.toFixed(1)).join(" ")).join("L");
    let thin = "", thick = "";
    for (let i = 1; i < 14; i++) {
      const x = (W / 14) * i + (r() - 0.5) * 30;
      const line = wavy(x, -5, x + (r() - 0.5) * 80, H + 5, 26, 16);
      for (let s = 0; s < line.length - 1; s++) if (r() > 0.28) thin += path([line[s], line[s + 1]]);
    }
    for (let i = 1; i < 11; i++) {
      const y = (H / 11) * i + (r() - 0.5) * 24;
      const line = wavy(-5, y, W + 5, y + (r() - 0.5) * 60, 22, 20);
      for (let s = 0; s < line.length - 1; s++) if (r() > 0.32) thin += path([line[s], line[s + 1]]);
    }
    [[0, 120, 690, 60], [250, -5, 330, 290], [470, -5, 420, 330], [0, 300, 300, 280]].forEach(([a, b, c, d]) => (thick += path(wavy(a, b, c, d, 30, 14))));
    host.innerHTML = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs><clipPath id="or-land"><path d="${land}"/></clipPath></defs>
      <path d="${land}" style="fill: color-mix(in oklab, var(--kf-ink) 3.5%, transparent); stroke: color-mix(in oklab, var(--kf-ink) 26%, transparent)" stroke-width="1"/>
      <g clip-path="url(#or-land)" fill="none" stroke-linejoin="round">
        <path d="${thin}" style="stroke: color-mix(in oklab, var(--kf-ink) 12%, transparent)" stroke-width=".7"/>
        <path d="${thick}" style="stroke: color-mix(in oklab, var(--kf-ink) 22%, transparent)" stroke-width="1"/>
      </g></svg>`;
  };
  const drawRings = (svg) => {
    svg.innerHTML = `
      <defs>
        <radialGradient id="or-ring"><stop offset="0" style="stop-color: var(--site-ring-1)" stop-opacity=".22"/><stop offset=".7" style="stop-color: var(--site-ring-2)" stop-opacity=".1"/><stop offset="1" style="stop-color: var(--site-ring-3)" stop-opacity=".06"/></radialGradient>
        <filter id="or-grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" result="n"/><feColorMatrix in="n" type="saturate" values="0" result="g"/><feComposite in="g" in2="SourceGraphic" operator="in" result="m"/><feBlend in="SourceGraphic" in2="m" mode="soft-light"/></filter>
      </defs>
      ${[449, 275, 108].map((rad, i) => `<g opacity=".8" filter="url(#or-grain)"><circle cx="449" cy="449" r="${rad}" fill="url(#or-ring)" fill-opacity="${i ? 0.8 : 1}"/><circle cx="449" cy="449" r="${rad}" style="fill: var(--site-ring-core)" fill-opacity=".05"/><circle cx="449" cy="449" r="${rad - 0.5}" fill="none" style="stroke: var(--kf-ink)" stroke-opacity=".2"/></g>`).join("")}`;
  };
  const mapHost = $("[data-map]");
  if (mapHost) drawMap(mapHost);
  const rings = $("[data-rings]");
  if (rings) drawRings(rings);

  // Splits the concept title and number into letters and adds --char-index (used for CSS animation delay)
  const splitChars = (el) => {
    el.innerHTML = [...el.textContent].map((c, i) => (c === " " ? " " : `<span class="char" style="--char-index:${i}">${c}</span>`)).join("");
  };

  OR.onLoad.push(() => {
    const body = document.body;
    const logo = $("[data-logo]");
    const mvImg = $(".or-mv__bg > .wf-img");
    const mm = gsap.matchMedia();

    // ── Concept: scroll position picks the stage, and CSS transition·animation handle the stage change ──
    const COLLAPSED = "polygon(0 57%, 100% 43%, 100% 43%, 0 57%)";
    const concept = $(".or-concept");
    if (concept) {
      const slides = $$(".or-concept__slide", concept);
      const images = $$(".or-concept__image", concept);
      const bars = $$(".or-concept__pager li", concept);
      const now = $(".or-concept__now", concept);
      const n = slides.length;
      let cur = -1;
      slides.forEach((s) => splitChars($(".or-concept__name", s)));
      concept.style.height = `${100 * (n + 1)}vh`;
      images.forEach((im) => { im.classList.remove("is-active", "is-prev"); im.style.transition = "none"; im.style.clipPath = COLLAPSED; });
      const setActive = (t) => {
        if (t === cur) return;
        const prev = cur;
        cur = t;
        images.forEach((im, i) => {
          if (i === prev && prev >= 0) { im.classList.remove("is-active"); im.style.transition = ""; im.style.clipPath = ""; im.classList.add("is-prev"); }
          else if (i !== t) { im.classList.remove("is-active", "is-prev"); im.style.transition = "none"; im.style.clipPath = COLLAPSED; }
        });
        const im = images[t];
        if (im) {
          im.style.transition = "none";
          im.style.clipPath = COLLAPSED;
          im.classList.remove("is-prev");
          im.getBoundingClientRect();
          im.style.transition = "";
          im.style.clipPath = "";
          im.classList.add("is-active");
        }
        bars.forEach((b, i) => b.classList.toggle("is-active", i === t));
        slides.forEach((s, i) => i !== t && s.classList.remove("is-active"));
        const sl = slides[t];
        if (sl) { sl.classList.remove("is-active"); void sl.offsetWidth; sl.classList.add("is-active"); }
        if (now) { now.classList.remove("is-active"); now.textContent = String(t + 1).padStart(2, "0"); splitChars(now); void now.offsetWidth; now.classList.add("is-active"); }
      };
      const progress = ScrollTrigger.create({ trigger: concept, start: "top top", end: "bottom bottom", onUpdate: () => sync() });
      const sync = () => setActive(Math.min(Math.floor(progress.progress * n), n - 1));
      const reset = () => { concept.classList.remove("is-visible"); cur = -1; };
      ScrollTrigger.create({
        trigger: concept, start: "top bottom", end: "bottom top",
        onEnter: () => { concept.classList.add("is-visible"); if (cur < 0) setActive(0); },
        onEnterBack: () => { concept.classList.add("is-visible"); if (cur < 0) sync(); },
        onLeave: reset,
        onLeaveBack: reset,
      });
    }

    // ── Boundary photo: visible only while one empty screen passes, 1.12→1 ──
    const cbg = $(".or-cbg"), gap = $(".or-cbg__gap");
    if (cbg && gap && concept) {
      ScrollTrigger.create({ trigger: gap, start: "top bottom", endTrigger: concept, end: "top top", onToggle: (st) => cbg.classList.toggle("is-visible", st.isActive) });
    }

    // ── Detail: the hovered panel becomes the current panel and the title·body rise again ──
    const playDetail = (item) => {
      const heading = $(".or-details__heading", item), text = $(".or-details__text", item);
      if (item._tl) item._tl.kill();
      if (!item._built) {
        item._chars = $$(".or-details__line", heading).flatMap((line) => {
          const t = line.textContent;
          line.textContent = "";
          line.style.overflow = "hidden";
          return [...t].map((c) => { const s = document.createElement("span"); s.style.cssText = "display:inline-block;will-change:transform"; s.textContent = c === " " ? "\u00a0" : c; line.append(s); return s; });
        });
        const { chars } = OR.split(text);
        const rows = OR.clipLines(text, chars);
        text.innerHTML = "";
        item._lines = rows.map((row) => {
          const band = document.createElement("span"), inner = document.createElement("span");
          band.style.cssText = "display:block;overflow:hidden";
          inner.style.cssText = "display:block;will-change:transform";
          inner.textContent = row.map((c) => c.textContent).join("");
          band.append(inner);
          text.append(band);
          return inner;
        });
        item._built = true;
      }
      const tl = gsap.timeline();
      gsap.set(item._chars, { yPercent: 110, autoAlpha: 0 });
      tl.to(item._chars, { yPercent: 0, autoAlpha: 1, duration: 0.9, ease: "power2.out", stagger: 0.03 }, 0);
      gsap.set(item._lines, { yPercent: 110 });
      tl.to(item._lines, { yPercent: 0, duration: 0.7, ease: "expo.out", stagger: 0.09 }, 0.15);
      item._tl = tl;
    };

    mm.add(
      { pc: "(min-width: 769px)", sp: "(max-width: 768px)", motion: "(prefers-reduced-motion: no-preference)" },
      (ctx) => {
        const { pc, sp, motion } = ctx.conditions;

        // ── Wordmark fold ──
        if (logo) {
          logo.classList.add("is-flip");
          let flip = { dx: 0, dy: 0, scale: 1 };
          const measure = () => {
            const docked = logo.classList.contains("is-docked");
            gsap.set(logo, { x: 0, y: 0, scale: 1 });
            logo.classList.remove("is-docked");
            const a = logo.getBoundingClientRect();
            logo.classList.add("is-docked");
            const b = logo.getBoundingClientRect();
            logo.classList.toggle("is-docked", docked);
            flip = { dx: b.left + b.width / 2 - (a.left + a.width / 2), dy: b.top + b.height / 2 - (a.top + a.height / 2), scale: a.width ? b.width / a.width : 1 };
          };
          const toggleDocked = (p) => {
            const docked = p >= 0.999;
            body.classList.toggle("is-logo-docked", docked);
            logo.classList.toggle("is-docked", docked);
            if (docked) gsap.set(logo, { x: 0, y: 0, scale: 1 });
          };
          const scrub = sp ? 0.4 : true;
          if (mvImg && motion) gsap.fromTo(mvImg, { scale: 1 }, { scale: sp ? 0.9 : 0.95, ease: "none", force3D: true, scrollTrigger: { start: 0, end: 320, scrub, invalidateOnRefresh: true } });
          let tw = null;
          tw = gsap.fromTo(logo, { x: 0, y: 0, scale: 1 }, {
            x: () => flip.dx, y: () => flip.dy, scale: () => flip.scale, ease: "none", force3D: true,
            onUpdate: () => tw && toggleDocked(tw.progress()),
            scrollTrigger: { start: 0, end: 320, scrub: motion ? scrub : false, invalidateOnRefresh: true, onRefreshInit: measure, onRefresh: (st) => toggleDocked(st.progress) },
          });
          let last = scrollY, q = false;
          const onDir = () => {
            if (q) return;
            q = true;
            requestAnimationFrame(() => {
              const y = scrollY, d = y - last;
              if (y <= 750) body.classList.remove("is-logo-past");
              else if (Math.abs(d) > 4) body.classList.toggle("is-logo-past", d > 0);
              last = y;
              q = false;
            });
          };
          addEventListener("scroll", onDir, { passive: true });
          ctx.add(() => () => {
            removeEventListener("scroll", onDir);
            logo.classList.remove("is-flip", "is-docked");
            body.classList.remove("is-logo-docked", "is-logo-past");
          });
        }

        const about = $(".or-about");
        const circle = $(".or-map__circle"), land = $(".or-map__land"), texts = $$(".or-map__text");
        if (!motion) {
          if (circle) gsap.set(circle, { xPercent: pc ? -53.34075723830735 : -50, scale: 1, opacity: pc ? 0.8 : 1 });
          if (land) gsap.set(land, { opacity: 0 });
          return;
        }

        // ── About map pin ──
        if (about && circle) {
          gsap.set(circle, { xPercent: -50 });
          gsap.set(texts, { opacity: 0 });
          if (pc) {
            gsap.timeline({ scrollTrigger: { trigger: $(".or-about__body"), start: "top top", end: "+=100%", scrub: 1, pin: about, refreshPriority: 1, invalidateOnRefresh: true } })
              .to(circle, { scale: 1, opacity: 0.8, xPercent: -53.34075723830735, ease: "none" }, 0)
              .to(land, { scale: 1.7, opacity: 0, ease: "none" }, 0)
              .to(texts, { opacity: 1, stagger: 0.05, ease: "none" }, 0.5);
          } else {
            gsap.timeline({ scrollTrigger: { trigger: about, start: "bottom bottom", end: "+=100%", scrub: 1, pin: about, refreshPriority: 1, invalidateOnRefresh: true } })
              .to(circle, { scale: 1, ease: "none", duration: 0.6 }, 0)
              .to(land, { scale: 1.5, opacity: 0, ease: "none", duration: 0.6 }, 0)
              .to(texts, { opacity: 1, stagger: 0.1, ease: "none" }, 0.6);
          }
        }

        // ── Boundary photo zoom release ──
        const cbgImg = $(".or-cbg__img > .wf-img");
        if (cbgImg && gap && concept) {
          gsap.fromTo(cbgImg, { scale: 1.12 }, { scale: 1, ease: "none", scrollTrigger: { trigger: gap, start: "top bottom", endTrigger: concept, end: "top top", scrub: true, invalidateOnRefresh: true } });
        }

        // ── Detail hover ──
        if (pc && matchMedia("(hover: hover) and (pointer: fine)").matches) {
          const items = $$(".or-details__item");
          const enter = (item) => () => {
            const was = item.classList.contains("is-current");
            items.forEach((it) => it.classList.toggle("is-current", it === item));
            if (!was) playDetail(item);
          };
          const handlers = items.map((it) => { const h = enter(it); it.addEventListener("mouseenter", h); return h; });
          ctx.add(() => () => items.forEach((it, i) => it.removeEventListener("mouseenter", handlers[i])));
        }

        // ── Gallery: photos longer than their cell flow inside it (on phones scaled 1.12x, based below) ──
        $$(".or-gallery__item").forEach((item) => {
          const img = $(".wf-img", item);
          if (!img) return;
          const k = sp ? 1.12 : 1;
          const extra = sp ? { scale: 1.12, transformOrigin: "center bottom" } : {};
          gsap.fromTo(img, { ...extra, y: () => 0.6 * Math.max(0, img.offsetHeight * k - item.clientHeight - 2) }, {
            ...extra, y: 0, ease: "none",
            scrollTrigger: { trigger: item, start: "top bottom-=25%", end: "bottom top", scrub: 1, invalidateOnRefresh: true },
          });
        });

        // ── Phone: the next section pushes up over the lived-in feel photo ──
        const insImg = $(".or-insights__image"), prio = $(".or-priority");
        if (sp && insImg && prio) {
          gsap.fromTo(prio, { marginTop: 0 }, { marginTop: () => -insImg.offsetHeight, ease: "none", scrollTrigger: { trigger: insImg, start: "bottom bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true } });
        }
      }
    );
  });
})();
