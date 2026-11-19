// Motion across several pages: Lenis 1.3.15 (original as is: lerp 1·duration 1.5·autoRaf — effectively follows instantly, and stays stopped until ready),
// Sky curtain loader (first visit logo 3.2s · return visit 2s), page transition, logo tree growth,
// Letter-roll hover, vertical-writing nav expand, MENU board, parallax photos, dark footer photo columns · flowing logo strip, booking button hidden in the footer.
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const root = document.documentElement;
  const body = document.body;
  const isSP = () => window.matchMedia("(max-width: 767px)").matches;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const SL = (window.SL = { isSP, reduced });
  const rem = () => parseFloat(getComputedStyle(root).fontSize);

  /* ---------- Ready: original siteready — once the fonts are on (cut off at 3s at most) and the hero image has arrived. Does not wait for document load ---------- */
  const ready = Promise.race([document.fonts?.ready ?? Promise.resolve(), new Promise((r) => setTimeout(r, 3000))]);
  const lenis = (SL.lenis = !reduced && window.Lenis ? new Lenis({ autoRaf: true, smoothTouch: true, lerp: 1, duration: 1.5 }) : null);
  if (lenis) {
    lenis.on("scroll", ScrollTrigger.update);
    lenis.stop();
  }
  ready.then(() => {
    const t = location.hash.length > 1 && document.querySelector(location.hash);
    if (t) lenis ? lenis.scrollTo(t, { force: true, immediate: true }) : t.scrollIntoView();
    lenis?.start();
  });

  /* ---------- Sky curtain ---------- */
  const mask = document.querySelector(".sl-mask");
  const activate = () => {
    body.classList.add("is-active");
    window.dispatchEvent(new Event("sl:activate"));
  };
  const open = () => body.classList.add("is-open", "is-grow");
  let openTween;
  if (reduced) {
    mask.style.display = "none";
    activate();
    open();
  } else if (!sessionStorage.getItem("sl-intro")) {
    /* First visit: if the sky video can play, a tree logo grows after .25s, and once ready · 1.5s · video are all met, the curtain and logo lift up over 3.2s expo.inOut and the hero wakes at 1.5s */
    sessionStorage.setItem("sl-intro", "1");
    mask.classList.add("is-logo");
    const logo = mask.querySelector(".sl-mask__logo");
    const video = mask.querySelector(".sl-mask__video video");
    let waits = 3;
    const go = () => {
      if (--waits) return;
      const h = mask.querySelector(".sl-mask__container").offsetHeight;
      openTween = gsap.fromTo(mask, { y: 0 }, { y: -h, ease: "expo.inOut", duration: 3.2, onComplete: () => (mask.style.display = "none") });
      gsap.fromTo(logo, { y: 0 }, { y: -h, ease: "expo.inOut", duration: 3.2 });
      setTimeout(() => { activate(); setTimeout(open, 200); }, 1500);
    };
    const canplay = () => { setTimeout(() => logo.classList.add("is-grow"), 250); go(); };
    if (video && video.readyState < 3) video.addEventListener("canplay", canplay, { once: true });
    else canplay();
    ready.then(go);
    setTimeout(go, 1500);
  } else {
    /* Revisit: when ready, the white curtain slides up with 2s expo.out */
    ready.then(() => {
      activate();
      openTween = gsap.fromTo(mask, { y: 0 }, { y: () => -mask.offsetHeight, ease: "expo.out", duration: 2, onComplete: () => (mask.style.display = "none") });
      setTimeout(open, 250);
    });
  }

  /* Page transition: a white curtain rises from below in 1s to cover, then hands over at 0.6s */
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || a.target || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const href = a.getAttribute("href");
    if (!/^[\w-]+\.html(#.*)?$/.test(href)) return;
    e.preventDefault();
    if (reduced) return void (location.href = href);
    openTween?.kill();
    mask.removeAttribute("style");
    mask.classList.remove("is-logo");
    root.classList.add("is-transit-ready");
    requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add("is-transit")));
    setTimeout(() => (location.href = href), 600);
  });
  addEventListener("pageshow", (e) => {
    if (!e.persisted) return;
    root.classList.remove("is-transit-ready", "is-transit");
    mask.style.display = "none";
  });

  /* In-page (#) jumps scroll smoothly */
  document.querySelectorAll('a[href^="#"]').forEach((a) => a.addEventListener("click", (e) => {
    const id = a.getAttribute("href");
    const target = id.length > 1 ? document.querySelector(id) : null;
    if (id !== "#top" && !target) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(target || 0);
    else window.scrollTo({ top: target ? target.getBoundingClientRect().top + scrollY + 1 : 0 });
  }));

  /* ---------- Text roll: a duplicate text is attached below and both move up one line over 1s ---------- */
  document.querySelectorAll(".sl-hoverroll").forEach((el) => {
    const rolls = [...el.querySelectorAll(".sl-roll")].map((r) => ({ r, span: r.firstElementChild, copy: r.firstElementChild.cloneNode(true) }));
    let busy = false;
    const done = () => {
      rolls.forEach((x) => x.copy.remove());
      el.classList.remove("is-rolling");
      busy = false;
    };
    rolls.forEach((x) => x.span.addEventListener("animationend", done));
    if (reduced || !window.matchMedia("(hover: hover)").matches) return;
    el.addEventListener("mouseenter", () => {
      if (busy) return;
      busy = true;
      el.classList.remove("is-rolling");
      rolls.forEach((x) => x.r.append(x.copy));
      requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add("is-rolling")));
    });
  });

  /* ---------- Vertical-writing nav: press ▼ and the inner list width opens from 0 (0.75s expo) ---------- */
  document.querySelectorAll(".sl-vnav__toggle").forEach((btn) => {
    const item = btn.closest(".sl-vnav__item");
    const inner = item.querySelector(".sl-vnav__inner");
    const list = inner.querySelector(".sl-vnav__list");
    inner.addEventListener("transitionend", () => {
      if (item.classList.contains("is-open")) inner.style.width = "auto";
    });
    btn.addEventListener("click", () => {
      if (item.classList.contains("is-open")) {
        inner.style.width = list.offsetWidth + "px";
        inner.offsetWidth;
        item.classList.remove("is-open");
        inner.style.width = "0px";
      } else {
        item.classList.add("is-open");
        inner.style.width = list.offsetWidth + "px";
      }
    });
  });

  /* ---------- MENU panel ---------- */
  const menu = document.querySelector(".sl-menu");
  menu.querySelector(".sl-menu__toggle").addEventListener("click", () => menu.classList.toggle("is-open"));
  menu.querySelector(".sl-menu__body").setAttribute("data-lenis-prevent", "");

  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    /* Parallax photo: while a 1.4× tall photo passes through the frame it moves down by (1.4-1)/1.4 */
    document.querySelectorAll(".sl-prlx").forEach((w) => {
      const t = w.querySelector(".sl-prlx__target");
      const n = Number(w.dataset.mag || 1.4);
      t.style.height = n * 100 + "%";
      gsap.fromTo(t, { yPercent: 0 }, { yPercent: ((n - 1) / n) * 100, ease: "none", scrollTrigger: { trigger: w, start: "top bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true } });
    });
    /* Dark footer background photo column descends from -50% above */
    const fm = document.querySelector(".sl-fmain");
    if (fm) gsap.fromTo(".sl-fmain__bg", { yPercent: -50 }, { yPercent: 0, ease: "none", scrollTrigger: { trigger: fm, start: "top bottom", end: "bottom bottom", scrub: true, invalidateOnRefresh: true } });
  });

  /* ---------- Flowing band (footer logo · album thumbnails): default 0.05rem/frame, and when the mouse moves left and right over the band
     Speeds up with 0.3·n·|n|² for distance n from the center and flips direction. Speed follows at 1/10 per step ---------- */
  SL.flow = (area, track) => {
    if (reduced) return;
    const set = track.firstElementChild;
    while (track.children.length < 3) track.append(set.cloneNode(true));
    const base = 0.05;
    let target = base, speed = base, x = 0, forward = true, dragging = false;
    gsap.ticker.add(() => {
      if (dragging) return;
      const w = set.offsetWidth;
      speed += (target - speed) / 10;
      x += speed * rem();
      if (x >= w) x -= w;
      if (x <= -w) x += w;
      track.style.transform = `translateX(${-x - w}px)`;
    });
    if (!window.matchMedia("(hover: hover)").matches) {
      // Phone: drag the strip with a finger — 1rem per 10px, on release it glides at the last step ÷ 8.5 speed and then returns to default speed (original). If pushed vertically first, the page scrolls down
      let sx = 0, sy = 0, from = 0, last = 0, before = 0, lock = null;
      const wrap = (v) => { const w = set.offsetWidth; return v >= w ? v - w : v <= -w ? v + w : v; };
      track.addEventListener("touchstart", (e) => {
        if (!isSP()) return;
        const t = e.changedTouches[0];
        sx = last = before = t.pageX; sy = t.pageY; from = x; lock = null; dragging = true;
      }, { passive: true });
      track.addEventListener("touchmove", (e) => {
        if (!dragging) return;
        const t = e.changedTouches[0];
        if (lock === null) lock = Math.abs(t.pageX - sx) > Math.abs(t.pageY - sy);
        if (!lock) return;
        x = wrap(from + ((sx - t.pageX) / 10) * rem());
        track.style.transform = `translateX(${-x - set.offsetWidth}px)`;
        before = last; last = t.pageX;
        e.preventDefault();
      }, { passive: false });
      const end = () => {
        if (!dragging) return;
        dragging = false;
        if (lock) speed = (before - last) / 8.5;
      };
      track.addEventListener("touchend", end, { passive: true });
      track.addEventListener("touchcancel", end, { passive: true });
      return;
    }
    area.addEventListener("mousemove", (e) => {
      const r = area.getBoundingClientRect();
      const n = (Math.max(0, Math.min(r.width, e.clientX - r.left)) - r.width / 2) / (r.width / 2);
      forward = n > 0;
      target = 0.3 * n * Math.abs(n * n);
    });
    area.addEventListener("mouseleave", () => (target = forward ? base : -base));
  };
  const related = document.querySelector(".sl-fmain__related");
  if (related) SL.flow(related, related.querySelector(".sl-fmain__track"));

  /* ---------- Dot on the current page link ---------- */
  const here = `${body.dataset.page}.html`;
  document.querySelectorAll(`.sl-vnav__link[href="${here}"], .sl-menu__link[href="${here}"]`).forEach((a) => a.classList.add("is-current"));

  /* ---------- Hides the bottom-right booking button when it reaches the dark footer ---------- */
  const cta = document.querySelector(".sl-cta");
  if (cta && document.querySelector(".sl-fmain")) {
    ScrollTrigger.create({ trigger: ".sl-fmain", start: "top bottom", onEnter: () => cta.classList.add("is-hide"), onLeaveBack: () => cta.classList.remove("is-hide") });
  }

  /* Crossing between phone and large screen reloads and recalculates values, as in the original */
  window.matchMedia("(max-width: 767px)").addEventListener("change", () => location.reload());
})();
