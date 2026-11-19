// First page: loader → big title letters rise, big title pushed up from the gap, career expand, word gallery’s following photo, map drawing, calendar.
// Original numbers: loader logo opacity .7s (.22,.61,.36,1) → rests .4s, then opacity 0·y -2rem 1s (.79,.14,.15,.86), curtain clip-path inset(0 0 100% 0) 1.3s (.86,0,.07,1)
// Big title letters yPercent 100 → 0, 1.2s power4.out, stagger amount .5 · gallery box quickTo .6s power3, open clip-path inset(0%) .8s power4.out, photo swaps every .5s
(() => {
  const { reduced, icons, isMd } = window.DB;

  // ---------- Loader ----------
  const loader = document.querySelector(".db-loader");
  loader.innerHTML = icons.logo("lg-l");
  const copyChars = document.querySelectorAll(".hm-hero__copy span:not(.sp)");
  const heroIn = () => {
    if (reduced) return;
    gsap.from(copyChars, { yPercent: 100, delay: isMd() ? 0.2 : 0.4, duration: 1.2, ease: "power4.out", stagger: { amount: 0.5 } });
  };
  const heroVideo = document.querySelector(".hm-hero__v");
  const heroColor = () => gsap.fromTo(heroVideo, { "--hero-gs": 1 }, { "--hero-gs": 0, ease: "none", duration: 6 });
  if (reduced) {
    loader.remove();
    heroVideo.style.setProperty("--hero-gs", 0);
  } else {
    gsap.set(copyChars, { yPercent: 100 });
    document.body.style.cursor = "progress";
    const logo = loader.querySelector("svg");
    gsap.timeline()
      .to(logo, { opacity: 1, delay: 0.2, duration: 0.7, ease: CustomEase.create("ld-in", "0.22, 0.61, 0.36, 1") })
      .to(logo, { opacity: 0, y: "-2rem", delay: 0.4, duration: 1, ease: CustomEase.create("ld-out", "0.79, 0.14, 0.15, 0.86") })
      .call(() => { gsap.set(copyChars, { clearProps: "transform" }); heroIn(); }, [], "<")
      .to(loader, { clipPath: "inset(0 0 100% 0)", duration: 1.3, ease: CustomEase.create("ld-curtain", "0.86, 0, 0.07, 1") }, "<")
      .call(() => { document.body.style.cursor = ""; loader.style.display = "none"; heroColor(); });
  }

  // ---------- Big title: rises -10rem while passing through the gap (200px) range ----------
  const mm = gsap.matchMedia();
  mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
    // Original gives no curve, so gsap’s default power1.out applies to scrub as well
    gsap.fromTo(".hm-hero__copy", { "--copy-y": "0rem" }, { "--copy-y": "-10rem", ease: "power1.out", scrollTrigger: { trigger: ".hm-peek", scrub: true } });
  });

  // ---------- Expanding career history ----------
  // The original uses gsap defaults (.5s power1.out) as is — on open from height 0, text comes in after .2s from 1rem below and transparent, and the + vertical line lies down 90° → 180° to become −.
  // Original does not re-measure ScrollTrigger after expanding (the grayscale release spot of the photo below arrives later by the expanded amount) — left as is
  document.querySelectorAll(".hm-person__btn").forEach((btn) => {
    const box = btn.previousElementSibling;
    const bar = btn.querySelector(".hm-plus i");
    const d = reduced ? 0 : 0.5;
    btn.addEventListener("click", () => {
      const open = btn.getAttribute("aria-expanded") !== "true";
      btn.setAttribute("aria-expanded", String(open));
      if (open) {
        box.hidden = false;
        gsap.from(box, { height: 0, duration: d });
        gsap.to(bar, { rotate: 180, duration: d });
        gsap.from(box, { opacity: 0, y: "1rem", delay: reduced ? 0 : 0.2, duration: d });
      } else {
        gsap.to(bar, { rotate: 90, duration: d });
        gsap.to(box, { height: 0, opacity: 0, duration: d, onComplete: () => { box.hidden = true; box.removeAttribute("style"); } });
      }
    });
  });

  // ---------- Word gallery ----------
  const follow = document.querySelector(".hm-follow");
  const wordNames = [...document.querySelectorAll(".hm-words a")].map((a) => a.textContent);
  follow.innerHTML = [0, 1, 2, 3, 4].map((g) => `<div class="hm-follow__g"${g ? " hidden" : ""}>${[0, 1, 2, 3, 4].map((s) => `<div class="wf-img hm-tone-${((g + s) % 5) + 1}" data-label="${wordNames[g] || ""} Head shape ${s + 1} · Profile view · white background · square"></div>`).join("")}</div>`).join("");
  follow.querySelectorAll(".hm-follow__g").forEach((g) => {
    const imgs = g.querySelectorAll(".wf-img");
    const tl = gsap.timeline({ repeat: -1 });
    imgs.forEach((_, r) => {
      const n = (r + 1) % imgs.length;
      tl.set(imgs[n], { opacity: 0, zIndex: 2 }).to(imgs[n], { opacity: 1, duration: 0, ease: "none", delay: 0.5 });
      if (n !== 0) tl.set(imgs, { zIndex: 0 });
    });
  });
  const words = document.querySelectorAll(".hm-words a");
  const groups = follow.querySelectorAll(".hm-follow__g");
  const canHover = matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (canHover) {
    let state = "LEAVE", openTw, closeTw;
    gsap.set(follow, { xPercent: -50, yPercent: -50 });
    const qx = gsap.quickTo(follow, "x", { duration: 0.6, ease: "power3" });
    const qy = gsap.quickTo(follow, "y", { duration: 0.6, ease: "power3" });
    addEventListener("mousemove", (e) => {
      qx(e.clientX); qy(e.clientY);
      try { localStorage.setItem("kfFxLastMouse", JSON.stringify({ x: e.clientX, y: e.clientY })); } catch (_) {}
    });
    // Original: on the first scroll before the mouse moves, move the box to the mouse position remembered from the previous page
    let placed = false;
    addEventListener("scroll", () => {
      if (placed) return;
      placed = true;
      try { const p = JSON.parse(localStorage.getItem("kfFxLastMouse") || "null"); if (p) { qx(p.x); qy(p.y); } } catch (_) {}
    }, { passive: true });
    words.forEach((w, i) => {
      w.addEventListener("mouseenter", () => {
        state = "ENTER";
        groups.forEach((g, j) => (g.hidden = i !== j));
        gsap.to(words, { opacity: 0.2 });
        gsap.to(w, { opacity: 1 });
        openTw = gsap.to(follow, { clipPath: "inset(0%)", duration: 0.8, opacity: 1, ease: "power4.out", onComplete: () => closeTw && closeTw.kill() });
      });
      w.addEventListener("mouseleave", () => {
        state = "LEAVE";
        gsap.to(words, { opacity: 1 });
        if (openTw) openTw.kill();
        setTimeout(() => { if (state !== "ENTER") closeTw = gsap.to(follow, { clipPath: "inset(50%)", opacity: 0, duration: 0.2 }); }, 200);
      });
    });
  }

  // ---------- Map drawing (original is an embedded map) ----------
  const G = { land: "#e8eaed", water: "#aadaff", park: "#c8e6c9", road: "#fff", rail: "#9aa6c8", pin: "#ea4335", pinDot: "#a50e0e", label: "#c5221f", card: "#fff", cardInk: "#202124", btn: "#1a73e8" }; // Not skin: the colors of the embedded map — painted by the map service, so they stay the same even when the site skin changes
  const map = document.querySelector(".hm-map");
  map.querySelector("svg").innerHTML = `
    <rect width="756" height="530" fill="${G.land}"/>
    <path d="M0 410 C120 380 200 420 300 395 S520 330 756 360 L756 385 C520 355 330 425 300 420 S120 405 0 435Z" fill="${G.water}"/>
    <rect x="40" y="440" width="120" height="70" rx="6" fill="${G.park}"/><rect x="560" y="60" width="90" height="70" rx="6" fill="${G.park}"/>
    <g stroke="${G.road}" stroke-linecap="round" fill="none">
      <path d="M-10 120 L766 160" stroke-width="16"/><path d="M380 -10 L330 540" stroke-width="18"/>
      <path d="M-10 290 L766 250" stroke-width="10"/><path d="M150 -10 L190 540" stroke-width="10"/><path d="M600 -10 L560 540" stroke-width="10"/>
      <path d="M-10 40 L766 70 M-10 210 L766 205 M-10 350 L766 320 M70 -10 L95 540 M260 -10 L270 540 M480 -10 L460 540 M690 -10 L670 540" stroke-width="5"/>
    </g>
    <path d="M330 -10 L300 540" stroke="${G.rail}" stroke-width="4" stroke-dasharray="14 8"/>
    <g transform="translate(372 232)"><path d="M0 0 C-14 -18 -16 -28 -16 -34 A16 16 0 1 1 16 -34 C16 -28 14 -18 0 0Z" fill="${G.pin}"/><circle cy="-34" r="6" fill="${G.pinDot}"/></g>
    <text x="394" y="214" font-size="13" fill="${G.label}">Store name</text>
    <rect x="12" y="12" width="150" height="58" rx="2" fill="${G.card}"/><text x="22" y="34" font-size="12" fill="${G.cardInk}">Store name</text><rect x="22" y="44" width="80" height="18" rx="9" fill="${G.btn}"/><text x="32" y="57" font-size="9" fill="${G.card}">Open in map</text>`;
  map.querySelector(".hm-map__lock").addEventListener("click", () => map.classList.add("is-live"));

  // ---------- Calendar: Mondays and the first to third Tuesdays are painted as days off ----------
  // The original is a MUI calendar. Every time the month changes (also on first open) it loads the closed-days list for 350ms, showing ”...” in the date grid spot, and the month name in the header fades over .225s.
  // Pressing the header fades to the year view (3 columns, 1900~2099) in .225s, and the arrow flips in .3s. Date cells can’t be pressed (pointer-events none)
  const cal = document.querySelector("[data-cal]");
  const chev = (d) => `<svg viewBox="0 0 24 24" fill="currentColor"><path d="${d}"/></svg>`;
  const today = new Date();
  let view = new Date(today.getFullYear(), today.getMonth(), 1);
  let mode = "day", loadTimer = 0;
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const days = () => {
    const y = view.getFullYear(), m = view.getMonth();
    const first = new Date(y, m, 1).getDay(), n = new Date(y, m + 1, 0).getDate();
    let cells = "";
    for (let i = 0; i < first; i++) cells += "<span></span>";
    for (let d = 1; d <= n; d++) {
      const wd = new Date(y, m, d).getDay();
      const off = wd === 1 || (wd === 2 && Math.ceil(d / 7) <= 3);
      const isToday = d === today.getDate() && m === today.getMonth() && y === today.getFullYear();
      cells += `<span class="hm-cal__d${off ? " is-off" : ""}${isToday ? " is-today" : ""}"><b>${d}</b></span>`;
    }
    return `<div class="hm-cal__days">${cells}</div>`;
  };
  const years = () => {
    let b = "";
    for (let y = 1900; y <= 2099; y++) b += `<button type="button" class="hm-cal__y${y === view.getFullYear() ? " is-sel" : ""}" data-y="${y}">${y}</button>`;
    return `<div class="hm-cal__years">${b}</div>`;
  };
  const fadeIn = (el) => { if (el && !reduced) el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 225, easing: "cubic-bezier(0.4, 0, 0.2, 1)" }); };
  const load = () => {
    const slide = cal.querySelector(".hm-cal__slide");
    if (!slide) return;
    clearTimeout(loadTimer);
    slide.innerHTML = `<div class="hm-cal__loading"><span>...</span></div>`;
    loadTimer = setTimeout(() => { if (mode === "day") cal.querySelector(".hm-cal__slide").innerHTML = days(); }, 350);
  };
  function draw() {
    cal.classList.toggle("is-year", mode === "year");
    cal.innerHTML = `<div class="hm-cal__in"><div class="hm-cal__head"><button type="button" class="hm-cal__ttl" aria-label="${mode === "day" ? "View by year" : "To calendar view"}"><span>${months[view.getMonth()]} ${view.getFullYear()}</span><i>${chev("M7 10l5 5 5-5z")}</i></button>
      <div class="hm-cal__nav"${mode === "year" ? " hidden" : ""}><button type="button" aria-label="Previous month" data-d="-1">${chev("M15.41 16.59 10.83 12l4.58-4.59L14 6l-6 6 6 6z")}</button><button type="button" aria-label="Next month" data-d="1">${chev("M8.59 16.59 13.17 12 8.59 7.41 10 6l6 6-6 6z")}</button></div></div>
      <div class="hm-cal__body">${mode === "day" ? `<div class="hm-cal__wds">${["S", "M", "T", "W", "T", "F", "S"].map((w) => `<span class="hm-cal__wd">${w}</span>`).join("")}</div><div class="hm-cal__slide">${days()}</div>` : years()}</div></div>`;
  }
  new ResizeObserver(() => cal.style.setProperty("--zoom", cal.clientWidth / 320)).observe(cal);
  cal.addEventListener("click", (e) => {
    const nav = e.target.closest("button[data-d]");
    if (nav) {
      view = new Date(view.getFullYear(), view.getMonth() + Number(nav.dataset.d), 1);
      const label = cal.querySelector(".hm-cal__ttl span");
      label.textContent = `${months[view.getMonth()]} ${view.getFullYear()}`;
      fadeIn(label);
      load();
      return;
    }
    if (e.target.closest(".hm-cal__ttl")) {
      mode = mode === "day" ? "year" : "day";
      draw();
      fadeIn(cal.querySelector(".hm-cal__body"));
      const sel = cal.querySelector(".hm-cal__y.is-sel");
      if (sel) sel.parentElement.scrollTop = sel.offsetTop - sel.parentElement.clientHeight / 2 + sel.offsetHeight / 2;
      return;
    }
    const yb = e.target.closest("button[data-y]");
    if (yb) {
      const changed = Number(yb.dataset.y) !== view.getFullYear();
      view = new Date(Number(yb.dataset.y), view.getMonth(), 1);
      mode = "day";
      draw();
      fadeIn(cal.querySelector(".hm-cal__body"));
      if (changed) load();
    }
  });
  draw();
  load();
})();
