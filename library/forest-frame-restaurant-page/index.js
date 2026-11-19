// Home: scroll where a rounded frame expands to fill the screen, growth ring pattern, booking calendar, circle-bordered history slider.
// Original values: clip inset → 0 (default length .5) + blurred layer alpha 0→1 (.25, same start) / start "<Space above the frame> 0" · Footer PC "20% 0%" · Phone "15% 0%" + body y -160→0 /
// History fade .8s · after the circle border’s 10s progress, next slide (auto only at 781px and above)
(() => {
  const { reduced } = window.FJ;
  const root = document.documentElement;
  const mm = gsap.matchMedia();

  // ── Tree rings: redraw the original’s tree cross-section pattern as swaying concentric rings ──
  document.querySelectorAll("[data-rings]").forEach((el, k) => {
    const n = +el.dataset.rings;
    let s = 11 + k * 5;
    const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
    const cx = 500, cy = 360, paths = [];
    for (let i = 1; i <= n * 3; i++) {
      const base = i * (330 / (n * 3)) + rnd() * 6;
      const pts = [];
      for (let a = 0; a <= 36; a++) {
        const t = (a / 36) * Math.PI * 2;
        const wob = 1 + Math.sin(t * 3 + i * 0.7) * 0.035 + Math.sin(t * 7 + i) * 0.015;
        pts.push(`${(cx + Math.cos(t) * base * 1.32 * wob).toFixed(1)},${(cy + Math.sin(t) * base * wob).toFixed(1)}`);
      }
      paths.push(`<polyline points="${pts.join(" ")}"/>`);
    }
    el.innerHTML = `<svg viewBox="0 0 1000 720" fill="none" stroke="currentColor" stroke-width="1" opacity=".09">${paths.join("")}</svg>`;
  });

  // ── First photo: reads the margin of the dummy card and expands from there to inset 0 ──
  const bg = document.querySelector(".js-first-bg");
  const bgBody = document.querySelector(".js-first-bg-body");
  const blur = document.querySelector(".js-first-bg-blur");
  const dummy = document.querySelector(".js-first-dummy");
  let topGap = 0, m = {};
  const read = () => {
    const d = getComputedStyle(dummy);
    topGap = parseFloat(getComputedStyle(bg).marginTop);
    m = { t: d.marginTop, r: d.marginRight, b: d.marginBottom, l: d.marginLeft, round: d.borderTopLeftRadius };
  };
  read();
  if (reduced) {
    gsap.set(blur, { alpha: 1 });
    ["top", "right", "bottom", "left", "round"].forEach((k) => root.style.setProperty(`--firstimg-clip-inset-${k}`, "0px"));
  } else {
    const tl = gsap.timeline({ paused: true });
    tl.fromTo(root, {
      "--firstimg-clip-inset-top": () => m.t,
      "--firstimg-clip-inset-right": () => m.r,
      "--firstimg-clip-inset-bottom": () => m.b,
      "--firstimg-clip-inset-left": () => m.l,
      "--firstimg-clip-inset-round": () => m.round,
    }, {
      "--firstimg-clip-inset-top": "0px",
      "--firstimg-clip-inset-right": "0px",
      "--firstimg-clip-inset-bottom": "0px",
      "--firstimg-clip-inset-left": "0px",
      "--firstimg-clip-inset-round": "0px",
      ease: "none",
    });
    tl.fromTo(blur, { alpha: 0 }, { alpha: 1, duration: 0.25, ease: "none" }, 0);
    let end = "20% 0%";
    mm.add("(max-width: 780px)", () => {
      end = "15% 0%";
      tl.fromTo([bgBody, blur], { y: -160 }, { y: 0, ease: "none" }, 0);
      return () => gsap.set([bgBody, blur], { y: 0 });
    });
    mm.add("(min-width: 781px)", () => { end = "20% 0%"; });
    ScrollTrigger.create({
      trigger: ".js-first-body",
      start: () => `${topGap} 0`,
      end: () => end,
      scrub: true,
      animation: tl,
      invalidateOnRefresh: true,
      onRefreshInit: read,
    });
  }

  // ── Booking calendar — like the original, FullCalendar (dayGrid) shows only three months from today, with the month name, prev, next and today in the header ──
  // The original fetches events from a calendar embed (google-calendar) — here the same place gets closed-day placeholders (Sundays · first Monday of each month) as events
  const cal = document.getElementById("fj-cal");
  if (cal && window.FullCalendar) {
    const t = new Date();
    const n = new Date(t);
    n.setMonth(t.getMonth() + 3);
    const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const closedDays = (info, ok) => {
      const out = [];
      for (const d = new Date(info.start); d < info.end; d.setDate(d.getDate() + 1))
        if (d.getDay() === 0 || (d.getDay() === 1 && d.getDate() <= 7)) out.push({ title: "Day off", start: ymd(d), allDay: true, classNames: ["gallery-calender"] });
      ok(out);
    };
    new FullCalendar.Calendar(cal, {
      headerToolbar: { left: "title", center: "", right: "prev,next,today" },
      validRange: { start: t.toISOString().split("T")[0], end: n.toISOString().split("T")[0] },
      events: closedDays,
      dayCellContent: (e) => e.date.getDate(),
      dayMaxEvents: true,
      eventDisplay: "block",
      contentHeight: "auto",
      locale: "ko",
      displayEventTime: false,
      buttonText: { prev: "<", next: ">", prevYear: "<<", nextYear: ">>", today: "Today", month: "Month", week: "Week", day: "Day", list: "List" },
      eventClick: (e) => e.jsEvent.preventDefault(),
    }).render();
  }

  // ── Timeline — like the original, Splide fade (.8s, loops from end to start). At 781px and up, once the circle outline finishes drawing over 10 seconds it moves to the next slide, and the pause button resumes it ──
  const hs = document.querySelector(".js-history");
  if (hs && window.Splide) {
    const slider = new Splide(hs, { type: "fade", rewind: true, perPage: 1, autoplay: false, interval: 10000, pauseOnHover: false, speed: 800, pagination: true });
    const ring = hs.querySelector(".js-history-progress");
    const pp = hs.querySelector(".js-history-pp");
    let len = 0;
    let tween = null;
    let auto = false;
    let at = 0;
    const reset = () => {
      tween?.kill();
      at = 0;
      gsap.set(ring, { strokeDashoffset: len });
    };
    // Kept as in the original: the point to resume from when reopening is the previous tween’s progress (of the remaining range, not a percent of the whole).
    const run = (from = 0) => {
      tween?.kill();
      at = from;
      tween = gsap.fromTo(ring, { strokeDashoffset: len * (1 - from) }, {
        strokeDashoffset: 0,
        ease: "none",
        duration: 10 * (1 - from),
        onUpdate() { at = this.progress(); },
        onComplete: () => auto && slider.go(">"),
      });
    };
    slider.on("mounted", () => {
      len = 2 * Math.PI * parseFloat(ring.getAttribute("r"));
      ring.style.strokeDasharray = len;
      mm.add("(min-width: 781px)", () => {
        if (reduced) return;
        auto = true;
        run(0);
      });
      mm.add("(max-width: 780px)", () => {
        auto = false;
        reset();
      });
    });
    slider.on("moved", () => {
      if (innerWidth >= 781) auto ? run(0) : reset();
      else if (FJ.lenis && hs.querySelector(".splide__slide.is-active")) FJ.lenis.scrollTo(hs.getBoundingClientRect().top - 50 + FJ.lenis.scroll, { duration: 0.8 });
    });
    pp.addEventListener("click", () => {
      if (innerWidth < 781) return;
      if (auto) {
        auto = false;
        pp.classList.add("is-paused");
        pp.setAttribute("aria-label", "Play");
        if (tween) { tween.pause(); at = tween.progress(); }
      } else {
        auto = true;
        pp.classList.remove("is-paused");
        pp.setAttribute("aria-label", "Pause");
        run(at);
      }
    });
    slider.mount();
  }

  // ── Contact: the send button comes alive only once consent is checked ──
  const accept = document.querySelector(".js-accept");
  const submit = document.querySelector(".js-submit");
  if (accept && submit) accept.addEventListener("change", () => { submit.disabled = !accept.checked; });
})();
