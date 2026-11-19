// Feature motion — original values: slide .6s cubic-bezier(.25,1,.5,1) (the left window is a fade that changes every 5 seconds) · first reveal at 80% of the screen ·
// Achievement rate number 500+1500×(rate/100)ms cubic ease-out (bar same duration power2.out) · hand clap .5s·.2s power1.inOut back and forth · remaining days bounce 1.1s with 140ms stagger · model pose 4.2s→1s→2s then repeats every 2 seconds · planner text expands .42s power3.inOut ·
// Back to top: the model hides with .45s back.in(1.2), rises in 1.1s, then reappears with .7s back.out(1.4) · the toe strip moves with back.out + clouds with back.out(1.6).
(() => {
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Slider: three Splide 4.1.4 configurations same as the original — the left window (side) swaps overlapping and autoplays only on screen (Intersection extension), the lineup (peek) is center aligned,
  // Points (loop) are 16px apart one by one. Common: dot navigation · one cell at a time · even if flicked, only one way
  const base = { pagination: true, perMove: 1, flickMaxPages: 1, arrows: false };
  const kinds = {
    side: { ...base, type: "fade", rewind: true, autoplay: true, perPage: 1, speed: 600, intersection: { inView: { autoplay: true }, outView: { autoplay: false } } },
    peek: { ...base, type: "loop", autoWidth: true, focus: "center", trimSpace: false, padding: { left: "7.5%", right: "7.5%" }, speed: 600, perPage: 1 },
    loop: { ...base, type: "loop", autoWidth: false, perPage: 1, gap: "16px", speed: 600 },
  };
  document.querySelectorAll("[data-slider]").forEach((root) => {
    const kind = root.dataset.slider;
    const splide = new Splide(root, kinds[kind]);
    kind === "side" ? splide.mount(window.splide.Extensions) : splide.mount();
  });

  // Opening scene model poses: 1 for 4.2s → 3 for 1s → 1 for 2s, then 1·2·3·4 for 2s each, pausing when off screen
  const poses = [...document.querySelectorAll(".cf-mv__pose")];
  const showPose = (k) => poses.forEach((p, i) => p.classList.toggle("is-on", i === k));
  showPose(0);
  const loop = gsap.timeline({ repeat: -1, paused: true });
  [0, 1, 2, 3].forEach((k) => loop.call(() => showPose(k)).to({}, { duration: 2 }));
  const opening = gsap.timeline({ paused: true })
    .call(() => showPose(0)).to({}, { duration: 4.2 })
    .call(() => showPose(2)).to({}, { duration: 1 })
    .call(() => showPose(0)).to({}, { duration: 2 })
    .call(() => {
      ScrollTrigger.create({
        trigger: ".cf-mv", start: "top bottom", end: "bottom top",
        onToggle: (self) => (self.isActive ? loop.play() : loop.pause()),
      });
    });
  // Opening scene: the original attaches body.is-opening-start after downloading all hero images (max 5 seconds) and starts the pose sequence together — here it waits for the fonts
  const startOpening = () => requestAnimationFrame(() => { document.body.classList.add("is-opening-start"); if (!reduced) opening.play(); });
  reduced ? startOpening() : Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 5000))]).then(startOpening);

  // Once when first seen (80% of screen) · ring · hand clap · bar hatching · remaining-days bounce run only while spanning the screen (original data-trigger-loop)
  document.querySelectorAll("[data-once]").forEach((el) => {
    ScrollTrigger.create({ trigger: el, start: "top 80%", once: true, onEnter: () => el.classList.add("is-shown") });
  });
  document.querySelectorAll(".cf-p, [data-loop]").forEach((el) => {
    ScrollTrigger.create({ trigger: el, start: "top bottom", end: "bottom top", onToggle: (self) => el.classList.toggle("is-loop", self.isActive) });
  });

  // One set of digit glyphs (0–9) — shared by the rate digits and the days left. Widths differ per glyph (1 is narrow, 4 is wide) and the cell width matches the widest one
  const glyphW = { 1: 44, 4: 60 };
  const glyph = (d) => {
    const w = glyphW[d] || 58;
    return `<svg class="cf-glyph" viewBox="0 0 ${w} 60" style="width:${(w / 60).toFixed(4)}em" aria-hidden="true"><use href="#n-${d}"/></svg>`;
  };
  // So digits don’t jiggle as the digit count grows, blanks equal to the final digit count are placed in front
  const renderDigits = (box, n, len) => {
    const s = String(n);
    box.innerHTML = "<span></span>".repeat(Math.max(len - s.length, 0)) + [...s].map((d) => `<span>${glyph(d)}</span>`).join("");
    box.setAttribute("aria-label", s);
  };

  // Achievement rate: compute the rate as entry count ÷ target count, and the rate sets the hand pattern (under 40 two, under 80 five, above that eight), the number color (10 or less purple … over 90 deep pink) and
  // Sets the fill time (500+1500×rate/100ms). Numbers count up with a cubic ease-out, and once done each slot pops once, delayed by 300·500·700ms.
  const tier = (r) => (r <= 10 ? ["var(--site-purple)", "var(--site-purple-hi)"] : r <= 30 ? ["var(--site-blue)", "var(--site-blue-hi)"] : r <= 50 ? ["var(--site-green)", "var(--site-green-hi)"] : r <= 70 ? ["var(--site-yellow)", "var(--site-yellow-hi)"] : r <= 90 ? ["var(--site-orange)", "var(--site-orange-hi)"] : ["var(--kf-accent)", "var(--site-accent-hi)"]);
  const count = (el) => Number((el?.textContent || "").replace(/[^\d]/g, "")) || 0;
  document.querySelectorAll(".cf-prog").forEach((el) => {
    const entry = count(el.querySelector("[data-entry]"));
    const target = count(el.querySelector("[data-target]"));
    const rate = Math.max(0, target > 0 ? Math.round((entry / target) * 100) : Number(el.dataset.rate) || 0);
    const [c, light] = tier(rate);
    const dur = Math.round(500 + 1500 * (Math.min(rate, 100) / 100));
    el.dataset.rate = rate;
    el.dataset.pattern = rate < 40 ? "small" : rate < 80 ? "medium" : "large";
    el.style.setProperty("--num", c);
    el.style.setProperty("--num-light", light);
    el.style.setProperty("--rate", rate + "%");
    el.style.setProperty("--dur", dur + "ms");
    const box = el.querySelector(".cf-prog__digits");
    const len = String(rate).length;
    box.style.minWidth = `calc(${len}em + ${len - 1} * var(--r) * 0.7)`;
    renderDigits(box, 0, len);
    const run = () => {
      el.classList.add("is-shown");
      if (reduced || rate === 0) { renderDigits(box, rate, len); return; }
      const t0 = performance.now();
      let shown = -1;
      const tick = (now) => {
        const p = Math.min((now - t0) / dur, 1);
        const v = Math.round(rate * (1 - Math.pow(1 - p, 3)));
        if (v !== shown) { shown = v; renderDigits(box, v, len); }
        p < 1 ? requestAnimationFrame(tick) : el.classList.add("is-counted");
      };
      requestAnimationFrame(tick);
    };
    ScrollTrigger.create({ trigger: el, start: "top 80%", once: true, onEnter: run });
  });

  // Days left until the deadline: counted from data-deadline (YYYY-MM-DD) and today’s date. After 0:00 on the day after the deadline, it switches to the ended wording.
  // Day number color by days left (10 or fewer hot pink … over 90 purple), counted again after midnight
  const dayTier = (d) => (d <= 10 ? "var(--kf-accent)" : d <= 30 ? "var(--site-orange)" : d <= 50 ? "var(--site-yellow)" : d <= 70 ? "var(--site-green)" : d <= 90 ? "var(--site-blue)" : "var(--site-purple)");
  const parseDay = (s) => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || ""); return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null; };
  const counts = [...document.querySelectorAll(".cf-count[data-deadline]")];
  const paintCounts = () => counts.forEach((el) => {
    const end = parseDay(el.dataset.deadline);
    if (!end) return;
    const now = new Date();
    const speech = el.querySelector(".cf-count__speech");
    if (now >= new Date(end.getFullYear(), end.getMonth(), end.getDate() + 1)) {
      el.classList.add("is-ended");
      speech.textContent = speech.dataset.ended;
      return;
    }
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const days = Math.max(0, Math.ceil((end - today) / 864e5));
    const box = el.querySelector(".cf-count__days");
    box.innerHTML = [...String(days)].map((d, i) => `<span style="--d:${i * 140}ms">${glyph(d)}</span>`).join("");
    box.setAttribute("aria-label", String(days));
    el.style.setProperty("--num", dayTier(days));
  });
  const atMidnight = () => {
    const now = new Date();
    setTimeout(() => { paintCounts(); atMidnight(); }, new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 1) - now);
  };
  paintCounts();
  atMidnight();

  // Planner text expand
  document.querySelectorAll(".cf-reason").forEach((box) => {
    const btn = box.querySelector(".cf-reason__more");
    const inner = box.querySelector(".cf-reason__in");
    btn.addEventListener("click", () => {
      const open = box.dataset.open !== "true";
      const from = inner.getBoundingClientRect().height;
      box.dataset.open = String(open);
      btn.setAttribute("aria-expanded", String(open));
      btn.querySelector("span").textContent = open ? "Close" : "Continue reading";
      inner.style.height = open ? "auto" : "";
      const to = inner.getBoundingClientRect().height;
      if (reduced) { ScrollTrigger.refresh(); return; }
      gsap.fromTo(inner, { height: from }, { height: to, duration: 0.42, ease: "power3.inOut", overwrite: true, onComplete: () => { inner.style.height = open ? "auto" : ""; ScrollTrigger.refresh(); } });
    });
  });

  // Phone menu · join info window
  const menu = document.querySelector(".cf-menu");
  const setMenu = (on) => {
    menu.classList.toggle("is-active", on);
    menu.querySelector(".cf-menu__open").setAttribute("aria-expanded", String(on));
    menu.querySelector(".cf-menu__panel").setAttribute("aria-hidden", String(!on));
    document.body.style.overflow = on ? "hidden" : "";
  };
  menu.querySelector(".cf-menu__open").addEventListener("click", () => setMenu(true));
  menu.querySelectorAll(".cf-menu__close, .cf-menu__veil, .cf-menu__panel a").forEach((el) => el.addEventListener("click", () => setMenu(false)));
  const modal = document.querySelector(".cf-modal");
  document.querySelector("[data-modal-open]").addEventListener("click", () => (modal.dataset.open = "true"));
  modal.querySelectorAll("[data-modal-close]").forEach((el) => el.addEventListener("click", () => (modal.dataset.open = "false")));
  addEventListener("keydown", (e) => { if (e.key === "Escape") { modal.dataset.open = "false"; setMenu(false); } });

  // Background doodle parallax (scrub)
  if (!reduced) {
    gsap.to(".cf-bg__d, .cf-bg__c", { y: (i) => -40 - (i % 4) * 25, ease: "none", scrollTrigger: { trigger: ".cf", start: "top bottom", end: "bottom top", scrub: true } });
  }

  // The toe-tip product strip is run by the cloud-reveal-strip part — only the model at the top beside it is switched to follow: pose 4 when clouds cover, pose 3 when the photo is revealed,
  // After 1.6 seconds, back to default (all four visible with 01 on top). Left untouched while scrolling to the top
  const footPoses = [...document.querySelectorAll(".cf-foot__pose")];
  const strip = document.querySelector(".cf-foot__wrap");
  let pose = 0;
  const setPose = (n) => {
    if (document.body.classList.contains("is-page-top-animating")) { pose = -1; return; }
    if (pose === n || !footPoses.length) return;
    gsap.killTweensOf(footPoses);
    gsap.set(footPoses, { autoAlpha: (k) => (n === 0 || k === n - 1 ? 1 : 0) });
    pose = n;
  };
  strip?.addEventListener("fx:cover", () => setPose(4));
  strip?.addEventListener("fx:reveal", () => setPose(3));
  strip?.addEventListener("fx:rest", () => setPose(0));

  // Back to top: the model below hides → 1.1s cubic ease up to the top of the feature → the opening-scene model pops up from below
  const topBtn = document.querySelector(".cf-foot__model");
  const ease3 = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const scrollToY = (y) => new Promise((done) => {
    const y0 = scrollY, d = y - y0, t0 = performance.now();
    if (reduced || Math.abs(d) < 2) { scrollTo(0, y); return done(); }
    const f = (now) => {
      const p = Math.min((now - t0) / 1100, 1);
      scrollTo(0, y0 + d * ease3(p));
      p < 1 ? requestAnimationFrame(f) : done();
    };
    requestAnimationFrame(f);
  });
  topBtn.addEventListener("click", async () => {
    if (topBtn.dataset.busy) return;
    topBtn.dataset.busy = "1";
    document.body.classList.add("is-page-top-animating");
    loop.pause();
    const model = document.querySelector(".cf-mv__model");
    gsap.set(model, { transition: "none", autoAlpha: 0, yPercent: 110 });
    await gsap.to(topBtn, { autoAlpha: 0, yPercent: 110, duration: 0.45, ease: "back.in(1.2)" });
    await scrollToY(document.querySelector(".cf").getBoundingClientRect().top + scrollY);
    gsap.set(topBtn, { autoAlpha: 1, yPercent: 0 });
    showPose(0);
    await gsap.fromTo(model, { autoAlpha: 0, yPercent: 110 }, { autoAlpha: 1, yPercent: 0, duration: 0.7, ease: "back.out(1.4)" });
    gsap.set(model, { clearProps: "transition" });
    showPose(2);
    gsap.delayedCall(0.8, () => loop.play());
    delete topBtn.dataset.busy;
    document.body.classList.remove("is-page-top-animating");
  });
})();
