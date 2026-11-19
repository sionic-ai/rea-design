/* Home page — loader (4.1s on first visit · lifts after .5s when returning in the same window) · vertical service band · director row · polaroid parallax · testimonial drag slider */
(() => {
  const { reduce, css } = window.PG;

  // ── Loader logos ×15: marks of varied widths like the original are swapped in turn (our own shapes) ──
  const WIDTHS = [39.27, 37.99, 16.91, 31.94, 20.83, 23.96, 37.5, 35, 28.47, 20.42, 20.83, 40.42, 22.5, 14.58, 23.61];
  const STAR = "M12 0c.6 6.4 5.6 11.4 12 12-6.4.6-11.4 5.6-12 12-.6-6.4-5.6-11.4-12-12C6.4 11.4 11.4 6.4 12 0Z";
  const mark = (i) => {
    const k = i % 5;
    if (k === 0) return `<svg viewBox="0 0 400 120"><rect x="4" y="4" width="392" height="112" rx="56" fill="none" stroke="currentColor" stroke-width="8"/><text x="200" y="84" text-anchor="middle" fill="currentColor" style="font: 400 84px var(--kf-font-hand, var(--kf-font-display))">Brand</text></svg>`;
    if (k === 1) return `<svg viewBox="0 0 400 110"><text x="200" y="92" text-anchor="middle" textLength="390" lengthAdjust="spacingAndGlyphs" fill="currentColor" style="font: 700 112px var(--kf-font-display)">WORDMARK</text></svg>`;
    if (k === 2) return `<svg viewBox="0 0 24 24"><path d="${STAR}" fill="currentColor"/></svg>`;
    if (k === 3) return `<svg viewBox="0 0 300 140"><ellipse cx="150" cy="70" rx="144" ry="64" fill="none" stroke="currentColor" stroke-width="8"/><text x="150" y="88" text-anchor="middle" fill="currentColor" style="font: 700 52px var(--site-label)">LOGO ${i + 1}</text></svg>`;
    return `<svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="94" fill="none" stroke="currentColor" stroke-width="8"/><path d="${STAR}" transform="translate(64 64) scale(3)" fill="currentColor"/></svg>`;
  };
  const loaderIn = document.querySelector(".pg-loader__in");
  if (loaderIn) loaderIn.innerHTML = WIDTHS.map((w, i) => `<div class="pg-loader__item${i ? "" : " is-active"}" style="width:${w * 0.933}%">${mark(i)}</div>`).join("");

  // ── 18 Polaroids ──
  const CAPS = ["Your quick word here", "One shot from the site", "Our Team", "Gear Organizing", "Break Time", "First shoot", "Final check", "Seen at work", "Applause!", "Wet site", "Ready", "Slate", "Greeting", "Night shoot", "One more shot", "Laughter", "All together", "The end!"];
  const SHOTS = ["Group shot of three laughing colleagues on set", "Staff member holding a cable bundle · outdoors by day", "Staff member holding a teddy bear · indoors by the window", "Camera director and assistant · indoors", "Staff carrying smoke equipment · field", "Person holding a goat · barn", "Two people in front of a tripod · Golf course", "Roadside film crew · city daytime", "Meeting in the kitchen · indoor daylight"];
  const gal = document.querySelector("[data-gal-list]");
  if (gal) gal.innerHTML = CAPS.map((c, i) => `<li class="gal__item"><div class="gal__card"><div class="wf-img pg-ph" data-label="${SHOTS[i % 9]} · Film tones · square"></div><span class="gal__cap">${c}</span></div></li>`).join("");

  // ── Service bands: only the clicked band expands, clicking inside an open band collapses it, clicking outside collapses all (992px and up) ──
  const items = [...document.querySelectorAll(".svc__item")];
  if (innerWidth > 991) {
    document.querySelectorAll(".svc__toggle").forEach((t) => t.addEventListener("click", (e) => {
      const item = t.closest(".svc__item");
      if (item.classList.contains("is-active")) item.classList.remove("is-active");
      else { items.forEach((x) => x.classList.toggle("is-active", x === item)); }
      e.stopPropagation();
    }));
    items.forEach((item) => item.addEventListener("click", (e) => {
      if (!e.target.closest(".svc__toggle")) item.classList.remove("is-active");
      e.stopPropagation();
    }));
    document.addEventListener("click", (e) => { if (!e.target.closest(".svc__item")) items.forEach((x) => x.classList.remove("is-active")); });
  }

  // ── Testimonial slider: Draggable + inertia, snaps in .4s at each slot end, and when visible goes to the second slot at 1s ──
  const slider = () => {
    const root = document.querySelector("[data-slider]");
    if (!root || !window.Draggable) return;
    const collection = root.querySelector("[data-slider-collection]");
    const track = root.querySelector("[data-slider-list]");
    const slides = [...root.querySelectorAll("[data-slider-item]")];
    const spv = Math.max(1, Math.min(parseFloat(getComputedStyle(root).getPropertyValue("--slider-spv")) || 1, slides.length));
    if (spv >= slides.length) return;
    const slideW = slides[0].getBoundingClientRect().width;
    const maxScroll = Math.max(track.scrollWidth - collection.clientWidth, 0);
    const maxIndex = maxScroll / slideW;
    const snaps = [];
    for (let i = 0; i <= Math.floor(maxIndex); i++) snaps.push(-i * slideW);
    if (Math.floor(maxIndex) < maxIndex) snaps.push(-maxIndex * slideW);
    const setX = gsap.quickSetter(track, "x", "px");
    track.onmouseenter = () => track.setAttribute("data-slider-list-status", "grab");
    track.onmouseleave = () => track.removeAttribute("data-slider-list-status");
    Draggable.create(track, {
      type: "x",
      inertia: true,
      bounds: { minX: -maxScroll, maxX: 0 },
      throwResistance: 2000,
      dragResistance: 0.05,
      maxDuration: 0.6,
      minDuration: 0.2,
      edgeResistance: 0.75,
      snap: { x: snaps, duration: 0.4 },
      onPress() { track.setAttribute("data-slider-list-status", "grabbing"); },
      onDrag() { setX(this.x); },
      onThrowUpdate() { setX(this.x); },
      onRelease() { track.setAttribute("data-slider-list-status", "grab"); },
    });
    setX(0);
    if (reduce) return;
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      if (snaps.length > 1) gsap.to(track, { duration: 1, x: snaps[1], ease: "power2.out" });
    }), { threshold: 0 });
    io.observe(root);
  };

  // ── Loader → Hero reveal ──
  const load = () => {
    const wrap = document.querySelector(".pg-loader");
    const panel = document.querySelector(".pg-loader__panel");
    const inner = document.querySelector(".pg-loader__in");
    const logos = [...document.querySelectorAll(".pg-loader__item")];
    const light = css("--kf-bg"), dark = css("--kf-ink");
    if (reduce) {
      gsap.set(wrap, { autoAlpha: 0, display: "none" });
      gsap.set("[data-load-banner]", { opacity: 1 });
      return;
    }
    const tl = gsap.timeline();
    const again = sessionStorage.getItem("pgHasLoaded");
    let collapse = 1.2;
    if (again) {
      collapse = 1.2 * 0.7;
      gsap.set(panel, { backgroundColor: light });
      gsap.set(inner, { opacity: 1 });
      gsap.set(logos, { color: dark });
      tl.addLabel("collapseStart", 0.5);
      tl.to(logos, { opacity: 0, yPercent: -20, duration: 0.5, ease: "power2.in" }, "collapseStart");
      tl.to(panel, { opacity: 0, duration: collapse, ease: "power2.out" }, "collapseStart");
    } else {
      tl.to(inner, { opacity: 1, duration: 0.8, ease: "power1.out" });
      tl.addLabel("logoStart");
      const step = 1.4 / logos.length;
      logos.forEach((el, i) => {
        tl.call(() => el.classList.add("is-active"), null, `logoStart+=${i * step}`);
        if (i > 0) tl.call(() => logos[i - 1].classList.remove("is-active"), null, `logoStart+=${i * step}`);
      });
      tl.addLabel("loopEnd", "logoStart+=1.4");
      tl.to(panel, { backgroundColor: light, duration: 0.6, ease: "power2.in" }, "loopEnd");
      tl.to(logos, { color: dark, duration: 0.6, ease: "power2.in" }, "loopEnd");
      tl.addLabel("collapseStart", "loopEnd+=0.5");
      tl.to(logos, { opacity: 0, yPercent: -20, duration: 1, ease: "power2.in" }, "collapseStart");
      tl.to(panel, { height: "0%", duration: collapse, ease: "power2.out" }, "<10%");
    }
    sessionStorage.setItem("pgHasLoaded", "true");
    tl.addLabel("loadingDone", `collapseStart+=${collapse}`);
    tl.set(wrap, { autoAlpha: 0, display: "none" }, "loadingDone");
    tl.from("[data-load-nav]", { opacity: 0, y: "-4em", duration: 1, ease: "power2.out" }, "loadingDone");
    tl.from("[data-load-bg]", { opacity: 0, scale: 1.2, duration: 2.4, ease: "power2.out" }, "<10%");
    tl.to("[data-load-banner]", { opacity: 1, duration: 1.2, ease: "power3.out" }, "<10%");
    tl.from("[data-load-title]", { opacity: 0, y: "2em", duration: 0.8, ease: "power2.out" }, "<10%");
    tl.from("[data-load-action]", { y: "2.5em", opacity: 0, duration: 1, ease: "power2.out" }, "<20%");
    tl.from("[data-load-logo]", { y: "2.5em", opacity: 0, duration: 1, stagger: 0.1, ease: "power2.out" }, "<20%");
  };

  document.addEventListener("DOMContentLoaded", () => {
    load();
    window.PG.bindCursor();
    slider();
    if (reduce) return;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      ScrollTrigger.create({ trigger: ".svc__cards", start: "top 60%", once: true, onEnter: () => innerWidth > 991 && items[0]?.classList.add("is-active") });
      // Polaroid: cards 3n+1, 3n+2, 3n+3 move -30, -50, -70% with scrub 1, 2, 1.5
      [[1, "-30%", 1], [2, "-50%", 2], [3, "-70%", 1.5]].forEach(([n, y, s]) => {
        document.querySelectorAll(`.gal__item:nth-child(3n+${n})`).forEach((el) => {
          gsap.timeline({ scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: s } }).to(el, { y, duration: 1 });
        });
      });
    });
    // Director row passes upward, going 1 → .3 (992px and up)
    mm.add("(min-width: 992px) and (prefers-reduced-motion: no-preference)", () => {
      document.querySelectorAll(".dir__item").forEach((el) => {
        gsap.fromTo(el, { opacity: 1 }, { opacity: 0.3, ease: "power1.out", scrollTrigger: { trigger: el, start: "top 20%", end: "top top", scrub: true } });
      });
    });
  });
})();
