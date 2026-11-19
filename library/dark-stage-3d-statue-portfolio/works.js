// Work collection motion: the work inside the frame turns from sketch → dot grid → finished screen on scroll, one screen height per work.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin, Draggable, InertiaPlugin);

  const works = [
    ["Project Name 01", "Indoor location tracking service hero · cross-section 3D room model · dark purple · landscape 16:10"],
    ["Project Name 02", "Cosmetics shop hero · person with a pink cream jar · white background · 16:10 landscape"],
    ["Project Name 03", "Qigong retreat Hero · white tiger sculpture · ink black · 16:10 landscape"],
    ["Project Name 04", "Regulatory analytics dashboard · blue curve graph · dark UI · landscape 16:10"],
    ["Project Name 05", "Secret calculator app intro · Single phone screen · Ink black · Landscape 16:10"],
    ["Project Name 06", "Regional economic organization Hero · white city blocks 3D · daytime · 16:10 landscape"],
    ["Project Name 07", "Beverage brand hero · bold handwritten logo over a space background · primary colors · landscape 16:10"],
    ["Project Name 08", "Work screen · what is shown · light · 16:10 landscape"],
  ];
  const frame = $(".wk-frame");
  const shot = $(".wk-shot");
  const dots = $(".wk-dots");
  const sketch = $(".wk-sketch");
  const paths = $$("path", sketch);
  const title = $(".wk-info__title");
  const desc = $(".wk-info__desc");
  const pager = $(".wk-pager");
  pager.innerHTML = works.map((_, i) => `<li${i ? "" : ' class="is-on"'}></li>`).join("");
  const pages = $$("li", pager);

  let cur = -1;
  const setWork = (i, animate) => {
    if (i === cur) return;
    cur = i;
    shot.dataset.label = works[i][1];
    const v = shot.querySelector("video");
    if (v) { v.src = `media/work-${i + 1}.mp4`; if (!v.dataset.held && v.getBoundingClientRect().bottom > 0) v.play().catch(() => {}); }
    pages.forEach((li, k) => li.classList.toggle("is-on", k === i));
    title.textContent = works[i][0];
    if (animate) gsap.fromTo([".wk-info__name", ".wk-info__desc", ".wk-info__link"], { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: "power2.out", overwrite: true });
  };
  setWork(0, false);
  const clamp = (v) => Math.min(1, Math.max(0, v));
  const seg = (v, a, b) => clamp((v - a) / (b - a));

  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    ScrollTrigger.create({
      trigger: ".wk-gallery", start: "top top", end: "bottom bottom", scrub: 0.4,
      onUpdate: (st) => {
        const f = Math.min(st.progress * works.length, works.length - 0.0001);
        const i = Math.floor(f), t = f - i;
        setWork(i, true);
        gsap.set(paths, { drawSVG: `0% ${seg(t, 0, 0.22) * 100}%` });
        sketch.style.opacity = 1 - seg(t, 0.36, 0.48);
        dots.style.opacity = seg(t, 0.18, 0.28) * (1 - seg(t, 0.4, 0.5));
        shot.style.opacity = seg(t, 0.32, 0.48);
      },
    });
    gsap.set(paths, { drawSVG: "0%" });

    // The frame tilts slightly to follow the mouse
    const rx = gsap.quickTo(frame, "rotationX", { duration: 0.8, ease: "power2.out" });
    const ry = gsap.quickTo(frame, "rotationY", { duration: 0.8, ease: "power2.out" });
    gsap.set(frame, { rotationY: 10, rotationX: 2 });
    addEventListener("pointermove", (e) => { ry(10 + (e.clientX / innerWidth - 0.5) * 8); rx(2 - (e.clientY / innerHeight - 0.5) * 5); }, { passive: true });

    // One word at a time, then the latter part of the big sentence goes from gray to white
    gsap.from(".wk-words__big span", { opacity: 0, y: 60, stagger: 0.3, ease: "power2.out", scrollTrigger: { trigger: ".wk-words__big", start: "top 85%", end: "top 35%", scrub: true } });
    gsap.from(".wk-words__text .pt", { opacity: 0, y: 30, stagger: 0.15, duration: 0.8, ease: "power2.out", scrollTrigger: { trigger: ".wk-words__text", start: "top 80%" } });
    gsap.to(".wk-words__text .fd", { color: bsRgb("var(--kf-contrast-ink)"), stagger: 0.4, ease: "none", scrollTrigger: { trigger: ".wk-words__text", start: "top 55%", end: "bottom 45%", scrub: true } });

    // Solution → Service: while pinned, the list switches once past halfway
    const lists = $$(".wk-solve__list"), tabs = $$(".wk-solve__tabs p");
    const swap = gsap.timeline({ paused: true })
      .to($$(".wk-sc", lists[0]), { y: -30, opacity: 0, duration: 0.35, stagger: 0.05, ease: "power2.in" })
      .set(lists[0], { visibility: "hidden" }).set(lists[1], { visibility: "visible" })
      .from($$(".wk-sc", lists[1]), { y: 30, opacity: 0, duration: 0.45, stagger: 0.06, ease: "power2.out" });
    ScrollTrigger.create({
      trigger: ".wk-solve", start: "50% center",
      onEnter: () => { swap.play(); tabs[0].classList.remove("is-on"); tabs[1].classList.add("is-on"); },
      onLeaveBack: () => { swap.reverse(); tabs[1].classList.remove("is-on"); tabs[0].classList.add("is-on"); },
    });
  });
  mm.add("(prefers-reduced-motion: reduce)", () => {
    shot.style.opacity = 1; sketch.style.opacity = 0;
    ScrollTrigger.create({ trigger: ".wk-gallery", start: "top top", end: "bottom bottom", onUpdate: (st) => setWork(Math.min(Math.floor(st.progress * works.length), works.length - 1), false) });
    $$(".wk-words__text .fd").forEach((s) => (s.style.color = "var(--kf-contrast-ink)"));
  });

  // Drag gallery: glides with inertia, the bar below follows the position
  const track = $(".wk-track");
  const bar = $(".wk-more__bar i");
  const bounds = () => ({ minX: Math.min(0, innerWidth - track.scrollWidth), maxX: 0 });
  const paint = function () { const b = bounds(); bar.style.left = `${(b.minX ? this.x / b.minX : 0) * 70}%`; };
  const [drag] = Draggable.create(track, { type: "x", inertia: true, bounds: bounds(), edgeResistance: 0.85, onDrag: paint, onThrowUpdate: paint, onPress() { track.style.cursor = "grabbing"; }, onRelease() { track.style.cursor = ""; } });
  addEventListener("resize", () => drag.applyBounds(bounds()));
})();
