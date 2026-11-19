// Per-section DOM motion — original values as they are (particle stage is in stage.js)
(() => {
  const TG = window.TG;
  const zt = (a, b, t) => { const n = Math.min(1, Math.max(0, (t - a) / (b - a))); return n * n * (3 - 2 * n); };
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const nav = $(".tg-nav"), hint = $(".tg-hero__hint");

  // Word splitting — words become inline-block chunks, with the spaces between kept as they are (so Korean line breaks never cut in the middle of a word)
  const words = (el) => {
    const walk = (node) => [...node.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((w) => { if (!w) return; if (/^\s+$/.test(w)) frag.append(w); else { const s = document.createElement("span"); s.className = "tg-word"; s.textContent = w; frag.append(s); } });
        n.replaceWith(frag);
      } else if (n.nodeType === 1) walk(n);
    });
    el.setAttribute("aria-label", el.textContent.replace(/\s+/g, " ").trim());
    walk(el);
    return $$(".tg-word", el);
  };
  // Split footer letters
  const word = $(".tg-footer__word");
  const chars = [...word.textContent].map((c) => { const s = document.createElement("span"); s.className = "tg-char"; s.setAttribute("aria-hidden", "true"); s.textContent = c; return s; });
  word.replaceChildren(...chars);

  const mm = gsap.matchMedia();
  mm.add({ motion: "(prefers-reduced-motion: no-preference)", still: "(prefers-reduced-motion: reduce)" }, ({ conditions }) => {
    if (conditions.still) {
      gsap.set([nav, ".tg-hero__copy", ".tg-lookbook__pin", ".tg-chapter__copy"], { opacity: 1 });
      gsap.set(".tg-nav__wordmark", { autoAlpha: 1 });
      gsap.set(".tg-footer", { opacity: 1 });
      return;
    }
    TG.onReveal.push(() => { gsap.set(nav, { opacity: 1 }); hint.style.opacity = "1"; });
    gsap.to(".tg-nav__wordmark", { autoAlpha: 1, duration: 0.25, scrollTrigger: { trigger: "#hero", start: "top -50%", toggleActions: "play none none reverse" } });

    // First section: the subtitle and guide leave and the ring copy rises at .78→.92
    const copy = $(".tg-hero__copy"), cap = $(".tg-hero__ring-caption");
    ScrollTrigger.create({ trigger: "#hero", start: "top top", end: "bottom bottom", onUpdate: ({ progress: m }) => {
      if (m > 0.005) copy.style.opacity = String(1 - zt(0.03, 0.24, m));
      hint.style.opacity = String(1 - zt(0, 0.08, m));
      cap.style.opacity = String(zt(0.78, 0.92, m));
    } });

    // Statement: each word clears from blur 10px · .06 · y12 (stagger .08, scrub)
    gsap.fromTo(words($(".tg-manifesto__text")), { opacity: 0.06, filter: "blur(10px)", y: 12 }, { opacity: 1, filter: "blur(0px)", y: 0, ease: "none", stagger: 0.08, scrollTrigger: { trigger: "#manifesto", start: "top 75%", end: "center 45%", scrub: true } });

    // Collection: pinned to the screen and pushed horizontally (scrub 1), while photos drift the opposite way inside the cell (85%→15% position).
    const track = $(".tg-stripes__track");
    const dist = () => Math.max(0, track.scrollWidth - innerWidth + 80);
    const slide = gsap.to(track, { x: () => -dist(), ease: "none", scrollTrigger: { trigger: "#stripes", start: "top top", end: () => `+=${dist()}`, pin: ".tg-stripes__pin", scrub: 1, invalidateOnRefresh: true, anticipatePin: 1 } });
    $$(".tg-piece__media").forEach((m) => gsap.fromTo(m.firstElementChild, { xPercent: 0 }, { xPercent: -23, ease: "none", scrollTrigger: { trigger: m, containerAnimation: slide, start: "left right", end: "right left", scrub: true } }));

    // Title, specs and cards float up from y 48
    $$(".tg-section-title, .tg-macro__line, .tg-macro__specs li, .tg-heritage__story, .tg-variants__note, .tg-card").forEach((el) => gsap.from(el, { autoAlpha: 0, y: 48, duration: 1.15, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 88%" } }));

    // Section where photos cover the screen: fills in from below with clip (.01→.22) and exits upward by 105% at the end (.72→1)
    const photo = (fig, r) => {
      const e = zt(0.01, 0.22, r), t = zt(0.72, 1, r);
      fig.style.visibility = r > 0 && r < 1 ? "visible" : "hidden";
      fig.style.clipPath = `inset(${(1 - e) * 100}% 0 0 0)`;
      fig.style.transform = `translate3d(0,${-t * 105}%,0)`;
      fig.style.opacity = String(1 - zt(0.87, 1, r));
      fig.firstElementChild.style.transform = `scale(${1.22 - e * 0.2 + t * 0.08})`;
      fig.querySelector("figcaption").style.opacity = String(e * (1 - zt(0.65, 0.85, r)));
    };
    const ringPhoto = $("#ring-photograph .tg-photo"), pr = { p: 0 };
    gsap.to(pr, { p: 1, ease: "none", onUpdate: () => photo(ringPhoto, (pr.p - 0.29) / 0.71), scrollTrigger: { trigger: "#ring-photograph", start: "top bottom", end: "bottom top", scrub: 0.65, onLeave: () => photo(ringPhoto, 1), onLeaveBack: () => photo(ringPhoto, 0) } });

    // Work section: text enters at .17→.26 and leaves at .59→.72, the progress line fills, and photos cover it from .65
    const ch = $("#cuff"), chCopy = $(".tg-chapter__copy", ch), chBar = $(".tg-chapter__progress span", ch), chPhoto = $(".tg-photo", ch), cp = { p: 0 };
    gsap.to(cp, { p: 1, ease: "none", scrollTrigger: { trigger: ch, start: "top top", end: "bottom bottom", scrub: 0.65 }, onUpdate: () => {
      const p = cp.p, k = Math.min(1, p / 0.68);
      chCopy.style.opacity = String(zt(0.17, 0.26, k) * (1 - zt(0.59, 0.72, k)));
      chCopy.style.transform = `translateY(${(1 - zt(0.21, 0.36, k)) * 25}px)`;
      chBar.style.transform = `scaleX(${k})`;
      photo(chPhoto, (p - 0.65) / 0.35);
    } });

    // Interlude: the progress line fills and the title fades at the start and end
    $$(".tg-interlude").forEach((sec) => ScrollTrigger.create({ trigger: sec, start: "top top", end: "bottom bottom", onUpdate: ({ progress: p }) => {
      $(".tg-interlude__track i", sec).style.transform = `scaleX(${p})`;
      const o = String(zt(0.02, 0.12, p) * (1 - zt(0.86, 0.98, p)));
      $(".tg-interlude__heading", sec).style.opacity = o; $(".tg-interlude__bottom", sec).style.opacity = o;
    } }));

    // Feature photo: the panel appears as 15% enters the screen and the photo shrinks from 1.1 to 1
    const lb = $("#lookbook"), lbPin = $(".tg-lookbook__pin", lb);
    const lbFade = () => { const a = Math.max(0, Math.min(1, -lb.getBoundingClientRect().top / (innerHeight * 0.15))); lbPin.style.opacity = String(a * a * (3 - 2 * a)); };
    ScrollTrigger.create({ trigger: lb, start: "top bottom", end: "bottom top", onUpdate: lbFade, onRefresh: lbFade });
    gsap.fromTo(".tg-lookbook__img", { scale: 1.1 }, { scale: 1, ease: "none", scrollTrigger: { trigger: lb, start: "top bottom", end: "bottom top", scrub: true } });

    // The photo gap between words widens from .9em to 4.2em, then a full-screen photo briefly covers it
    gsap.fromTo(".tg-heritage__image", { width: "0.9em" }, { width: "4.2em", ease: "none", scrollTrigger: { trigger: "#heritage", start: "top 70%", end: "center 40%", scrub: true } });
    gsap.timeline({ scrollTrigger: { trigger: "#heritage", start: "center 62%", end: "bottom top", scrub: true } })
      .to(".tg-heritage__full", { opacity: 1, duration: 0.35, ease: "none" }, 0.1)
      .to(".tg-heritage__full", { opacity: 0, duration: 0.3, ease: "none" }, 0.72);

    // Last section: as the face scatters, the heading drops out and the Footer stands up
    const foot = $(".tg-footer"), eb = $(".tg-closing__stage > .tg-eyebrow");
    ScrollTrigger.create({ trigger: "#closing-tiger", start: "top bottom", end: "bottom bottom", onUpdate: ({ progress: p }) => {
      const f = zt(0.82, 0.96, p);
      foot.style.opacity = String(f); foot.classList.toggle("is-on", f > 0.5);
      eb.style.opacity = String(zt(0.25, 0.35, p) * (1 - zt(0.75, 0.82, p)));
    } });
  });

  // Footer letters: the closer to the cursor (Gaussian 320×160) the more they swell upward, and they wobble back when it leaves
  const foot = $(".tg-footer");
  let raf = 0, cx = -9999, cy = -9999;
  foot.addEventListener("pointermove", (e) => {
    if (TG.reduce || e.pointerType === "touch") return;
    cx = e.clientX; cy = e.clientY;
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      chars.forEach((c) => {
        const r = c.getBoundingClientRect(), d = Math.hypot(r.left + r.width / 2 - cx, r.top + r.height / 2 - cy), p = Math.exp(-(d * d) / (320 * 160));
        gsap.to(c, { scaleY: 1 + p * 0.45, scaleX: 1 + p * 0.18, y: -p * 18, duration: 0.4, ease: "power2.out", overwrite: "auto" });
      });
    });
  });
  foot.addEventListener("pointerleave", () => chars.forEach((c) => gsap.to(c, { scaleX: 1, scaleY: 1, y: 0, duration: 0.7, ease: "elastic.out(1, 0.6)", overwrite: "auto" })));
})();
