// Common to all pages: draws in the header, footer, cookie notice and award badges, and hooks up Lenis, Framer reveal (spring), interaction response, FAQ and doctor carousel.
// Original values (read from the Framer page module): appear spring stiffness 400, damping 30, mass 1, first state opacity 0 · y 10px, threshold .5 (some 0)
// Interaction scale 1.02 · y −3/−6/−10 use the same spring. Lenis duration is .3 on the first page, .2 on About, and there is no smooth scroll on the Careers side.
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const root = document.documentElement;
  const page = document.body.dataset.page || "home";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const LV = (window.LV = { reduce, page, lenis: null });
  if (!reduce) root.classList.add("lv-js");
  // lv:ready — once after fonts have arrived and parts are attached. The original preloads fonts and shows the body afterward, so reveals that receive this signal hide the font swap
  const domReady = new Promise((r) => (document.readyState === "loading" ? addEventListener("DOMContentLoaded", r, { once: true }) : r()));
  Promise.all([document.fonts ? document.fonts.ready : null, domReady]).then(() => setTimeout(() => document.dispatchEvent(new Event("lv:ready")), 0));

  // A GSAP curve that stretches a damped spring x(t) (0→1) to the length it takes to settle — the same closed-form solution as Motion One
  LV.spring = (k = 400, c = 30, m = 1) => {
    const w0 = Math.sqrt(k / m), z = c / (2 * Math.sqrt(k * m));
    let x;
    if (z < 1) {
      const wd = w0 * Math.sqrt(1 - z * z);
      x = (t) => 1 - Math.exp(-z * w0 * t) * (Math.cos(wd * t) + ((z * w0) / wd) * Math.sin(wd * t));
    } else if (z === 1) x = (t) => 1 - Math.exp(-w0 * t) * (1 + w0 * t);
    else {
      const r1 = -w0 * (z - Math.sqrt(z * z - 1)), r2 = -w0 * (z + Math.sqrt(z * z - 1));
      x = (t) => 1 - (r2 * Math.exp(r1 * t) - r1 * Math.exp(r2 * t)) / (r2 - r1);
    }
    let T = 0.02;
    for (let t = 0.02; t < 4; t += 0.01) { if (Math.abs(1 - x(t)) > 0.002) T = t + 0.01; }
    const end = x(T);
    return { duration: T, ease: (p) => (p >= 1 ? 1 : x(p * T) / end) };
  };
  const SPRING = LV.spring(400, 30, 1);

  const ico = {
    play: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 2.5v15l13-7.5z" fill="currentColor"/></svg>',
    box: '<svg viewBox="0 0 20 20" aria-hidden="true"><rect x="3" y="2.5" width="14" height="15" rx="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="10" cy="7" r="1.6" fill="currentColor"/></svg>',
    arrowUp: '<svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 15V3M4 8l5-5 5 5"/></svg>',
    arrowDown: '<svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 3v12M4 10l5 5 5-5"/></svg>',
    chev: '<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="m5 2 5 5-5 5"/></svg>',
    blog: '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="5" cy="8" r="3.2" fill="currentColor"/><ellipse cx="11" cy="8" rx="1.6" ry="3" fill="currentColor"/><ellipse cx="14" cy="8" rx=".6" ry="2.6" fill="currentColor"/></svg>',
    cam: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="2" y="2" width="12" height="12" rx="3.5"/><circle cx="8" cy="8" r="2.7"/></svg>',
    in: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 6h2v7H3zM4 2.5a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4zM7 6h2v1c.5-.8 1.3-1.2 2.3-1.2 1.8 0 2.7 1.1 2.7 3.2v4h-2V9.3c0-1-.4-1.6-1.3-1.6-.9 0-1.7.6-1.7 1.8V13H7z" fill="currentColor"/></svg>',
    note: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 2h2.2c.2 1.4 1 2.2 2.3 2.4v2.2c-.9 0-1.7-.3-2.4-.7v4.6a3.6 3.6 0 1 1-3.6-3.6v2.2a1.4 1.4 0 1 0 1.5 1.4z" fill="currentColor"/></svg>',
  };
  LV.ico = ico;
  // Placeholder wordmark drawn fresh instead of the original logo — one ring and a dot, three short strokes
  const logo = '<svg viewBox="0 0 77 40" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"><path d="M4 31c4 6 15 6 18-2 3-8-6-12-10-6-4 6 3 13 12 10 6-2 9-9 9-16"/><circle cx="35" cy="5" r="2.6" fill="currentColor" stroke="none"/><circle cx="40" cy="25" r="7.5"/><path d="M53 18l5 14 5-14M71 18v14"/></svg>';
  LV.logo = logo;
  const stores = (cls = "") => `
    <div class="lv-stores ${cls}">
      <a class="lv-store" href="#" aria-label="Pick up at Store 1" data-label="Your App Store English name here">${ico.play}<span><small>Get it here</small><b>Store 1</b></span></a>
      <a class="lv-store" href="#" aria-label="Pick up at Store 2" data-label="Your App Store English name here">${ico.box}<span><small>Get it here</small><b>Store 2</b></span></a>
    </div>`;
  LV.stores = stores;

  // Header — first page and About show the store button, the job list shows “View openings”, and the job detail switches to “Apply” when scrolling down
  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.classList.add("lv-head");
    const right = page === "recruit"
      ? '<a class="lv-pill-dark" href="#roles">View Open Seats</a>'
      : page === "detail"
        ? `<div class="lv-head__swap">${stores("is-a")}<a class="lv-pill-dark is-b" href="#apply">Apply for this position</a></div>`
        : stores();
    head.innerHTML = `<a class="lv-logo" href="index.html" aria-label="Home">${logo}</a>${right}`;
    head.insertAdjacentHTML("beforebegin", '<div class="lv-blur" aria-hidden="true"></div>');
  }

  // Footer: photo card (first page and About only) + social text + store + one line below
  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    const pic = foot.dataset.pic;
    foot.classList.add("lv-foot");
    foot.innerHTML = `
      ${pic ? `<div class="lv-card lv-foot__pic lv-col" data-fx="spring-appear"><div class="wf-img" data-label="${pic}"></div><strong class="lv-d" data-label="Closing English sentence here, three lines">${foot.dataset.say || "A closing line set over three lines"}</strong></div>` : ""}
      <div class="lv-col lv-foot__body">
        <p class="lv-foot__say lv-d" data-label="One English sentence linking your articles and channels here">Find our notes on <a href="#">Blog<i>${ico.blog}</i></a>, and follow us on <a href="#">Social 1<i>${ico.cam}</i></a>, <a href="#">Social 2<i>${ico.in}</i></a> and <a href="#">Social 3<i>${ico.note}</i></a></p>
        ${stores()}
        <div class="lv-foot__bar">
          <nav><span>2026 © Company Name</span><a href="recruit.html">Hiring</a><a href="#">Privacy policy</a><a href="#">Refund policy</a><a href="#">Terms of service</a></nav>
          <span>Here <span class="is-blue">Where it’s made</span> One line</span>
        </div>
      </div>`;
  }

  // Cookie notice · award badge — fixed on all pages
  document.body.insertAdjacentHTML("beforeend", `
    <div class="lv-cookie" data-slot="cookie-bar" role="dialog" aria-label="Cookie Notice"><span>From here <u>Cookie</u>Use it</span><button type="button">Confirm</button></div>
    <a class="lv-award" href="#" data-slot="award-badge" aria-label="Award badge">
      <svg viewBox="0 0 84 84" aria-hidden="true"><defs><path id="lv-ring" d="M42 42m-30 0a30 30 0 1 1 60 0a30 30 0 1 1-60 0"/></defs>
        <g class="ring"><text font-size="9.5" font-weight="600" letter-spacing="2.4" fill="currentColor"><textPath href="#lv-ring">Site of the Month · Site of the Month ·</textPath></text></g>
        <path d="M36 32h13v7h-6.5zM36 39h6.5l6.5 7h-6.5v7l-6.5-7z" fill="currentColor"/></svg></a>`);
  document.querySelector(".lv-cookie button").addEventListener("click", (e) => e.currentTarget.parentElement.remove());

  // Lenis — the original Framer ‹Smooth Scroll› part runs new Lenis({ duration: strength/10 }) shows it
  const intensity = { home: 3, about: 2 }[page];
  if (intensity && !reduce && window.Lenis) {
    const lenis = (LV.lenis = new Lenis({ duration: intensity / 10 }));
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    document.addEventListener("click", (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a || a.getAttribute("href").length < 2) return;
      const to = document.querySelector(a.getAttribute("href"));
      if (to) { e.preventDefault(); lenis.scrollTo(to, { offset: -100 }); }
    });
  }

  // data-* options "Key: value; Key: value"
  const opts = (s) => Object.fromEntries((s || "").split(";").map((p) => p.split(":").map((v) => v.trim())).filter((p) => p[0]));

  // Interaction response — data-hover="scale: 1.02" · "y: -3" · "opacity: .7; back: soft" · "y: -4; dur: .3"(tween cubic-bezier(.44,0,.56,1)) · "opacity: .7; in: .2; back: fm"
  // Measured from the original: a 400/30/1 spring going in, and a slower 200/25/.8 spring when opacity returns (about .25s) — back: soft
  const SOFT = LV.spring(200, 25, 0.8);
  LV.soft = SOFT;
  // Baked into a linear() curve so CSS transitions use the same spring (skin-feel knob, text color)
  root.style.setProperty("--lv-soft", `linear(${Array.from({ length: 25 }, (_, i) => SOFT.ease(i / 24).toFixed(4)).join(", ")})`);
  root.style.setProperty("--lv-soft-dur", `${SOFT.duration.toFixed(3)}s`);
  const bez = (x1, y1, x2, y2) => (p) => { const b = (t, a, c) => 3 * (1 - t) * (1 - t) * t * a + 3 * (1 - t) * t * t * c + t * t * t; let lo = 0, hi = 1; for (let i = 0; i < 20; i++) { const mid = (lo + hi) / 2; b(mid, x1, x2) < p ? (lo = mid) : (hi = mid); } return b((lo + hi) / 2, y1, y2); };
  const tweenEase = bez(0.44, 0, 0.56, 1);
  // ”in: .2” · ”back: fm” — measuring the original Framer button, entering uses a tween of cubic-bezier(.25,.1,.35,1) .2~.25s, and returning uses the Framer default:
  // Opacity uses the same curve .3s (2% threshold for 250ms), position·size use spring 500/25/1 (12% overshoot, 250ms)
  const FM = bez(0.25, 0.1, 0.35, 1), BOUNCY = LV.spring(500, 25, 1);
  const hoverFx = (el) => {
    const o = opts(el.dataset.hover);
    const to = {};
    for (const k of ["scale", "y", "x", "rotate", "opacity"]) if (o[k] != null) to[k] = +o[k];
    const back = Object.fromEntries(Object.keys(to).map((k) => [k, k === "scale" || k === "opacity" ? 1 : 0]));
    const tw = o.in != null ? { duration: +o.in, ease: FM } : o.dur != null ? { duration: +o.dur, ease: tweenEase } : { duration: SPRING.duration, ease: SPRING.ease };
    const twBack = o.back === "soft" ? { duration: SOFT.duration, ease: SOFT.ease } : tw;
    const leave = () => {
      if (o.back !== "fm") return gsap.to(el, { ...back, ...twBack, overwrite: "auto" });
      const { opacity, ...move } = back;
      if (opacity != null) gsap.to(el, { opacity, duration: 0.3, ease: FM, overwrite: "auto" });
      if (Object.keys(move).length) gsap.to(el, { ...move, duration: BOUNCY.duration, ease: BOUNCY.ease, overwrite: "auto" });
    };
    el.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") gsap.to(el, { ...to, ...tw, overwrite: "auto" }); });
    el.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse") leave(); });
  };
  if (!reduce) document.querySelectorAll("[data-hover]").forEach(hoverFx);

  // Expert card — hovering attaches a ”Link ↗” pill at the photo’s bottom right. The original (Framer) swaps variants to attach the pill anew, with no transition
  document.querySelectorAll(".lv-doc").forEach((card) => {
    let pill = null;
    card.addEventListener("pointerenter", (e) => {
      if (e.pointerType !== "mouse" || pill) return;
      pill = document.createElement("span");
      pill.className = "lv-doc__in";
      pill.innerHTML = 'Link <svg viewBox="0 0 10 10" aria-hidden="true"><path d="M3 2h5v5M8 2 2 8" fill="none" stroke="currentColor" stroke-width="1.2"/></svg>';
      card.append(pill);
    });
    card.addEventListener("pointerleave", () => { pill?.remove(); pill = null; });
  });

  // FAQ — in the original the height opens immediately (0s) and only the answer text brightens at .23s. Only one opens at a time
  document.querySelectorAll(".lv-faq__item").forEach((item, i, all) => {
    const q = item.querySelector(".lv-faq__q"), a = item.querySelector(".lv-faq__a");
    const toggle = () => {
      const open = !item.classList.contains("is-open");
      all.forEach((o) => { if (o !== item && o.classList.contains("is-open")) { o.classList.remove("is-open"); o.querySelector(".lv-faq__a").style.height = "0px"; } });
      item.classList.toggle("is-open", open);
      q.setAttribute("aria-expanded", open);
      a.style.height = open ? "auto" : "0px";
      if (open && !reduce) gsap.fromTo(a.firstElementChild, { opacity: 0 }, { opacity: 1, duration: 0.25, delay: 0.016, ease: tweenEase });
      ScrollTrigger.refresh();
    };
    q.addEventListener("click", toggle);
    q.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); } });
  });

  // Pseudo carousel — the original is a stock carousel so it moves by horizontal scroll (snap), not transform. Buttons move smoothly one card (266px) at a time
  document.querySelectorAll(".lv-docs").forEach((box) => {
    const view = box.querySelector(".lv-docs__track"), next = box.querySelector(".lv-docs__next:not(.is-prev)"), prev = box.querySelector(".lv-docs__next.is-prev");
    const sync = () => { prev.hidden = view.scrollLeft < 4; next.hidden = view.scrollLeft > view.scrollWidth - view.clientWidth - 4; };
    next.addEventListener("click", () => view.scrollBy({ left: 266, behavior: reduce ? "auto" : "smooth" }));
    prev.addEventListener("click", () => view.scrollBy({ left: -266, behavior: reduce ? "auto" : "smooth" }));
    view.addEventListener("scroll", sync, { passive: true });
    sync();
  });
})();
