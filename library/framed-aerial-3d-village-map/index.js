// Map — 3D board on, drag, wheel, pins (projected onto the screen), pin hover preview, pressing a pin flies to the story panel, prev/next story, copy address, video panel, day/night and old-time switch
(() => {
  const Z = window.CZTown, CZ = window.CZ;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const canvas = $(".cz-webgl canvas");
  if (!Z || !canvas) return;
  const town = Z.build(canvas);
  const U = town.uniforms;

  // Gate photo slot: one aerial shot of our town (original aerial photo slot)
  const aerial = $(".cz-loader__aerial");
  if (aerial) { try { town.aerial(aerial, Math.min(1600, innerWidth), Math.min(1000, innerHeight)); } catch {} }

  // ── Board on: the original turns drawing on at Discover 2.3s and the neighborhood reveals from center outward (2.5s power3.out)
  const show = () => { town.start(); gsap.fromTo(U.uAppear, { value: 0 }, { value: 1, duration: reduce ? 0 : 2.5, ease: "power3.out" }); };
  CZ.addEventListener("cz:tick", show);
  CZ.addEventListener("cz:ui", () => {
    $(".cz-foot")?.classList.remove("is-hidden");
    // Pins come in order after the neighborhood is revealed (drawing 2.3s + reveal)
    gsap.delayedCall(reduce ? 0 : 2.4, () => { $(".cz-pins").classList.remove("is-hidden"); $$(".cz-pin").forEach((p, i) => setTimeout(() => p.classList.add("is-in"), reduce ? 0 : 30 * i)); });
  });

  // ── Drag, wheel, mouse parallax
  let drag = null;
  canvas.addEventListener("pointerdown", (e) => { drag = { x: e.clientX, y: e.clientY, id: e.pointerId }; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener("pointermove", (e) => {
    town.ctl.mouse((e.clientX / innerWidth) * 2 - 1, -((e.clientY / innerHeight) * 2 - 1));
    if (!drag || openPin) return;
    town.ctl.drag(e.clientX - drag.x, e.clientY - drag.y);
    drag.x = e.clientX; drag.y = e.clientY;
  });
  const up = () => (drag = null);
  canvas.addEventListener("pointerup", up); canvas.addEventListener("pointercancel", up);
  canvas.addEventListener("wheel", (e) => { e.preventDefault(); if (!openPin) town.ctl.wheel(e.deltaY); }, { passive: false });
  CZ.addEventListener("cz:compass", () => town.ctl.reset(2));

  // ── Pins: ones with a story (gold, click to open) 14 + name-only ones (purple) 13
  const NAMES = ["Story Name 01", "Story Name 02", "A Longer Story Name", "Story Name 04", "Story 05", "Story Name 06", "Story Name 07", "Story Name 08", "Story 09", "Story Name 10", "Story Name 11", "Story 12", "Story Name 13", "Story Name 14"];
  const box = $(".cz-pins"), preview = $(".cz-preview");
  const pins = town.pins.map((p, i) => {
    const el = document.createElement("button");
    el.type = "button";
    el.className = "cz-pin" + (p.click ? "" : " is-mute");
    el.dataset.fx = "pin-label-pill";
    const name = p.click ? NAMES[(p.id - 1) % NAMES.length] : `Place Name ${i - 13}`;
    el.setAttribute("aria-label", name);
    el.innerHTML = `<span data-fx-part="body"><svg data-fx-part="dot" viewBox="0 0 36 36"><circle class="cz-pin__core" cx="18" cy="18" r="3"/><circle data-fx-part="ring" cx="18" cy="18" r="11"/></svg><span data-fx-part="label">${name}</span></span>`;
    if (p.click) {
      el.addEventListener("pointerenter", () => !openPin && preview.classList.add("is-on"));
      el.addEventListener("pointerleave", () => preview.classList.remove("is-on"));
      el.addEventListener("click", () => openStory(p));
    } else el.tabIndex = -1;
    box.append(el);
    p.el = el; p.name = name;
    return p;
  });
  Z.onFrame = () => {
    pins.forEach((p) => { const s = town.project(p.at); if (!s) { p.el.style.visibility = "hidden"; return; } p.el.style.visibility = ""; p.el.style.transform = `translate3d(${(s.x - 18).toFixed(1)}px, ${(s.y - 18).toFixed(1)}px, 0)`; });
  };

  // ── Story plate: the camera flies in front of the mural in 4s, and the plate tilts in from the right in 1.5s after 2s
  const panel = $(".cz-detail");
  const story = pins.filter((p) => p.click);
  let openPin = null, leaveT = 0;
  const fill = (p) => { $(".cz-detail__title", panel).textContent = p.name; panel.querySelector(".cz-detail__content").scrollTop = 0; };
  const openStory = (p, from = null) => {
    clearTimeout(leaveT);
    openPin = p;
    preview.classList.remove("is-on");
    box.classList.add("is-hidden");
    town.ctl.goTo(p.camPos, p.look, reduce ? 0 : 4);
    fill(p);
    panel.hidden = false;
    panel.classList.remove("is-open", "is-leave");
    panel.style.setProperty("--cz-wait", from ? ".6s" : "2s");
    void panel.offsetWidth;
    requestAnimationFrame(() => panel.classList.add("is-open"));
    history.replaceState(null, "", `#${encodeURIComponent(p.name)}`);
  };
  const closeStory = () => {
    if (!openPin) return;
    openPin = null;
    panel.classList.remove("is-open");
    panel.classList.add("is-leave");
    leaveT = setTimeout(() => { panel.hidden = true; panel.classList.remove("is-leave"); }, reduce ? 0 : 500);
    box.classList.remove("is-hidden");
    town.ctl.release();
    history.replaceState(null, "", location.pathname);
  };
  const step = (d) => {
    if (!openPin) return;
    const i = story.indexOf(openPin), next = story[(i + d + story.length) % story.length];
    panel.classList.remove("is-open"); panel.classList.add("is-leave");
    setTimeout(() => { panel.classList.remove("is-leave"); openStory(next, openPin); }, reduce ? 0 : 500);
  };
  $(".cz-detail__close", panel).addEventListener("click", closeStory);
  $(".cz-detail__prev", panel).addEventListener("click", () => step(-1));
  $(".cz-detail__next", panel).addEventListener("click", () => step(1));
  $(".cz-detail__route", panel).addEventListener("click", () => step(1));
  addEventListener("keydown", (e) => { if (e.key === "Escape") { closeStory(); if ($(".cz-series").classList.contains("is-open")) $(".cz-nav__series").click(); } });
  const copied = $(".cz-detail__copied", panel);
  $(".cz-detail__share", panel).addEventListener("click", () => {
    navigator.clipboard?.writeText(location.href).catch(() => {});
    gsap.fromTo(copied, { autoAlpha: 0 }, { autoAlpha: 1, duration: .4, delay: .2 });
    gsap.to(copied, { autoAlpha: 0, duration: .4, delay: 2 });
  });
  // Flip photos
  let slide = 0;
  const slides = $$(".cz-slides__item", panel), num = $(".cz-slides__num", panel);
  const go = (d) => { slide = (slide + d + slides.length) % slides.length; slides.forEach((s) => (s.style.transform = `translateX(calc(${-slide * 100}% - ${slide * 10}px))`)); num.textContent = `${String(slide + 1).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}`; };
  $(".cz-slides__prev", panel).addEventListener("click", () => go(-1));
  $(".cz-slides__next", panel).addEventListener("click", () => go(1));
  // Scrolling inside a panel is smooth like the original (Lenis)
  if (window.Lenis && !reduce) {
    const inner = $(".cz-detail__content", panel);
    const lenis = new Lenis({ wrapper: inner, content: inner, lerp: .1, smoothWheel: true });
    gsap.ticker.add((t) => lenis.raf(t * 1000));
  }

  // ── Video board: the board darkens and covers in .6s, and pressing an episode widens that episode
  const series = $(".cz-series");
  CZ.addEventListener("cz:series", (e) => {
    if (e.detail) { closeStory(); series.hidden = false; requestAnimationFrame(() => series.classList.add("is-open")); town.stop(); }
    else { series.classList.remove("is-open"); setTimeout(() => { series.hidden = true; town.start(); }, reduce ? 0 : 600); }
  });
  $$(".cz-ep").forEach((ep) => ep.addEventListener("click", () => $$(".cz-ep").forEach((o) => o.classList.toggle("is-on", o === ep))));

  // ── Day · night · olden days: carries over the original shader values uNightMode·uModBeforeAfterProgress
  CZ.addEventListener("cz:mode", (e) => {
    gsap.to(U.uNight, { value: e.detail.night ? 1 : 0, duration: reduce ? 0 : 1.5, ease: "power2.inOut" });
    gsap.to(U.uPast, { value: e.detail.past ? 1 : 0, duration: reduce ? 0 : 1.5, ease: "power2.inOut" });
  });
  // Pick a path and jump to that path’s first story
  CZ.addEventListener("cz:route", (e) => openStory(story[(e.detail * 4) % story.length]));
})();
