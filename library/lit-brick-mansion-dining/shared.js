// Shared by all pages: rem based on screen width, smooth scroll (PC only), loading and page transitions, text roll, header and drawer, floating buttons,
// Parallax photo, section gallery and zoom window, footer marquee, plus the cover, pinned scene and vertical gallery shared by About and Menu.
// Each page’s own motion is attached by that page’s js, which receives window.NL.
(() => {
  const root = document.documentElement;
  const body = document.body;
  const setVw = () => root.style.setProperty("--vw", body.clientWidth + "px");
  setVw();
  addEventListener("resize", setVw);

  // The original treats under 767 as phone context, and when the context changes it re-reads and rebuilds the pin · scroll setup
  const ctxOf = () => (body.clientWidth < 767 ? "sp" : "pc");
  const ctx = ctxOf();
  addEventListener("resize", () => { if (ctxOf() !== ctx) location.reload(); });
  const isTouch = "ontouchstart" in document;
  if (isTouch) body.classList.add("is-touch");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const rpx = (v) => (v * body.clientWidth) / (ctx === "pc" ? 1440 : 375);
  const remPx = () => parseFloat(getComputedStyle(root).fontSize);
  const lvh = () => { const d = document.createElement("div"); d.style.cssText = "position:fixed;height:100lvh"; body.append(d); const h = d.offsetHeight; d.remove(); return h; };

  gsap.registerPlugin(ScrollTrigger, ScrollSmoother);
  ScrollTrigger.config({ ignoreMobileResize: true });

  let smoother = null;
  if (ctx === "pc" && !reduce) {
    smoother = ScrollSmoother.create({ wrapper: "#nl-wrapper", content: "#nl-content", smooth: 1.5, speed: 1, effects: true, normalizeScroll: !isTouch });
    smoother.paused(true);
  }
  const NL = (window.NL = { ctx, rpx, lvh, smoother, reduce, isTouch, ready: [] });

  const scrollToEl = (target, smooth = true) => {
    if (smoother) return smoother.scrollTo(target, smooth, "top top");
    const y = target === 0 ? 0 : target.getBoundingClientRect().top + scrollY;
    scrollTo({ top: y, behavior: smooth && !reduce ? "smooth" : "auto" });
  };
  document.querySelectorAll('a[href^="#"]').forEach((a) => a.addEventListener("click", (e) => {
    const h = a.getAttribute("href");
    const t = h.length === 1 ? 0 : document.querySelector(h);
    if (t === null) return;
    e.preventDefault();
    scrollToEl(t);
  }));

  /* ── Loading ── only first-time visitors get a diamond grid + logo, after that just a short curtain */
  const intro = document.querySelector(".nl-intro");
  const KEY = "nl-intro-viewed";
  const viewed = sessionStorage.getItem(KEY) === "1";
  sessionStorage.setItem(KEY, "1");
  const open = () => {
    body.classList.add("is-open");
    if (smoother) smoother.paused(false);
    NL.ready.forEach((f) => f());
    setTimeout(() => body.classList.add("is-intro-hide"), 1800);
  };
  const fontsReady = Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), new Promise((r) => setTimeout(r, 2000))]);
  if (reduce || !intro) {
    body.classList.add("is-open", "is-intro-hide");
    if (smoother) smoother.paused(false);
  } else if (!viewed) {
    const grid = intro.querySelector(".nl-intro__grid");
    const cols = ctx === "pc" ? 15 : 7;
    const rows = Math.max(1, Math.ceil(lvh() / rpx(ctx === "pc" ? 96 : 58)));
    const oy = (rows - 1) / 2, ox = (cols - 1) / 2, max = Math.hypot(ox, oy);
    for (let y = 0; y < rows; y++) {
      const line = document.createElement("div");
      line.className = "nl-intro__line";
      for (let x = 0; x < cols; x++) {
        const c = document.createElement("div");
        c.className = "nl-intro__cell t" + Math.max(1, Math.ceil(4 * Math.random()));
        c.style.setProperty("--d", Math.hypot(ox - x, oy - y) / max + "s");
        c.innerHTML = "<i></i><i></i><i></i><i></i>";
        line.append(c);
      }
      grid.append(line);
    }
    fontsReady.then(() => setTimeout(() => {
      body.classList.add("is-intro-active");
      setTimeout(open, 3800);
    }, 10));
  } else {
    fontsReady.then(() => setTimeout(open, 100));
  }

  // Page transition: a dark curtain covers in .1s and moves 0.1 second later — returning via back lifts the curtain
  const internal = (h) => h && !h.startsWith("#") && !/^(https?:|mailto:|tel:|javascript:)/.test(h);
  document.querySelectorAll("a[href]").forEach((a) => a.addEventListener("click", (e) => {
    const h = a.getAttribute("href");
    if (a.target === "_blank" || !internal(h) || e.metaKey || e.ctrlKey) return;
    e.preventDefault();
    root.classList.add("is-transit-ready");
    requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add("is-transit")));
    setTimeout(() => { location.href = h; }, 100);
  }));
  addEventListener("pageshow", (e) => {
    if (!e.persisted) return;
    root.classList.remove("is-transit-ready", "is-transit");
    if (smoother) smoother.paused(false);
  });

  /* ── Text roll ── attach a second copy of the same text, roll it up, then remove it when done */
  document.querySelectorAll(".nl-roll").forEach((el) => {
    const parts = [...el.querySelectorAll(".nl-roll__text")].map((label) => {
      const span = label.querySelector("span");
      return { label, span, copy: span.cloneNode(true) };
    });
    let on = false;
    const done = () => { parts.forEach((p) => p.copy.remove()); el.classList.remove("is-hover"); };
    parts.forEach((p) => p.span.addEventListener("animationend", done));
    el.addEventListener("click", () => { el.classList.remove("is-hover"); on = false; });
    if (isTouch) return;
    el.addEventListener("mouseenter", () => {
      if (on) return;
      on = true;
      el.classList.remove("is-hover");
      parts.forEach((p) => p.label.append(p.copy));
      requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add("is-hover")));
    });
    el.addEventListener("mouseleave", () => { on = false; });
  });

  /* ── Header ── */
  const header = document.querySelector(".nl-header");
  const footer = document.querySelector(".nl-footer");
  if (header) {
    const cont = header.querySelector(".nl-header__container");
    header.querySelectorAll(".nl-nav__link").forEach((link, i) => {
      link.style.setProperty("--i", i);
      const en = link.querySelector(".nl-nav__en");
      link.addEventListener("mouseenter", () => link.classList.add("is-hover", "is-roll"));
      link.addEventListener("mouseleave", () => { link.classList.remove("is-hover"); link.classList.add("is-roll"); });
      en.addEventListener("animationend", () => link.classList.remove("is-roll"));
    });
    header.querySelector(".nl-logo-line.l4")?.addEventListener("animationend", () => header.classList.add("is-frozen"), { once: true });
    addEventListener("resize", () => header.classList.add("is-frozen"), { once: true });
    if (ctx === "pc") {
      // Scrolling down hides the header, scrolling up shows it. Past 110px the back is blurred
      let active = false, filled = false, last = 0, off = 0;
      const upd = (y) => {
        off = Math.min(0, Math.max(-header.offsetHeight, off + last - y));
        body.style.setProperty("--header-offset", off + "px");
        last = y;
        if (filled) { if (y <= 20) { filled = false; header.classList.remove("is-fill"); } }
        else if (y > 110) { filled = true; header.classList.add("is-fill"); }
      };
      ScrollTrigger.create({ trigger: header, endTrigger: footer, start: "top top", end: "bottom bottom",
        onUpdate: (s) => active && upd((s.end - s.start) * s.progress),
        onEnter: (s) => { active = true; upd((s.end - s.start) * s.progress); },
        onLeaveBack: () => { active = false; last = 0; upd(0); } });
      ScrollTrigger.create({ trigger: cont, endTrigger: footer, start: "top top", end: "bottom bottom", pin: true, pinSpacing: false });
    } else {
      header.querySelector(".nl-header__toggle").addEventListener("click", () => header.classList.toggle("is-menu-open"));
    }
  }

  /* ── Floating booking button ── */
  const float = document.querySelector(".nl-float");
  if (float && footer) {
    ScrollTrigger.create({ trigger: footer, start: "top bottom", end: "bottom bottom",
      onEnter: () => float.classList.add("is-stuck"), onLeaveBack: () => float.classList.remove("is-stuck") });
    if (ctx === "pc") ScrollTrigger.create({ trigger: float, start: () => "bottom bottom-=" + rpx(30), endTrigger: footer, end: "bottom bottom", pin: true, pinSpacing: false });
  }

  /* ── Parallax photo ── scale type (cropped small photo: 140% height, top to bottom) · range type (full photo: up and down by r) ── */
  if (!reduce) {
    document.querySelectorAll("[data-prlx-mag]").forEach((el) => {
      const t = el.querySelector(".nl-prlx__in");
      const m = +el.dataset.prlxMag || 1.4;
      t.style.top = "0"; t.style.height = m * 100 + "%";
      gsap.fromTo(t, { yPercent: 0 }, { yPercent: ((m - 1) / m) * 100, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true } });
    });
    document.querySelectorAll("[data-prlx-range]").forEach((el) => {
      const t = el.querySelector(".nl-prlx__in");
      const r = +el.dataset.prlxRange;
      t.style.top = -r * 100 + "%"; t.style.height = (1 + 2 * r) * 100 + "%";
      const p = (r / (1 + 2 * r)) * 100;
      gsap.fromTo(t, { yPercent: -p }, { yPercent: p, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true } });
    });
  }

  /* ── Endless flowing row ── the farther the mouse is from the center the faster it goes by a cube, and when it leaves it slows in the last direction */
  const marquee = ({ track, wrapLen, base, gain, area, widthOf }) => {
    let u = base, d = base, h = 0, dir = true, raf = 0;
    const tick = () => {
      d += (u - d) / 10;
      h += d;
      const c = wrapLen();
      if (h >= c) h -= c;
      if (h <= -c) h += c;
      track.style.transform = "translateX(" + -h + "rem)";
      raf = requestAnimationFrame(tick);
    };
    if (reduce) return;
    tick();
    if (!isTouch) {
      area.addEventListener("mousemove", (e) => {
        const w = widthOf();
        const x = (Math.max(0, Math.min(w, e.clientX)) - w / 2) / (w / 2);
        dir = x > 0;
        u = gain * x * Math.abs(x * x);
      });
      area.addEventListener("mouseleave", () => { u = dir ? base : -base; });
    } else {
      // Exactly as the original: phone context only, on the first move, if horizontal exceeds vertical it is treated as a drag (if vertical, the page scrolls), and it follows .1rem per 1px,
      // On release it keeps flowing at the last step distance ÷ 8.5 speed, then returns to the original speed
      let sx = 0, sy = 0, lx = 0, px = 0, horiz = null, drag = false, c0 = 0;
      area.addEventListener("touchstart", (e) => {
        if (ctx === "pc") return;
        cancelAnimationFrame(raf);
        sx = lx = px = e.touches[0].pageX; sy = e.touches[0].pageY;
        horiz = null; drag = true; c0 = h;
      }, { passive: true });
      area.addEventListener("touchmove", (e) => {
        if (ctx === "pc" || !drag) return;
        const x = e.touches[0].pageX, y = e.touches[0].pageY;
        if (horiz === null) horiz = Math.abs(sx - x) > Math.abs(sy - y);
        if (!horiz) return;
        const c = wrapLen();
        c0 = (x - sx) / -10 + h;
        if (x - sx > 0) { if (c0 >= c) c0 -= c; } else if (c0 <= -c) c0 += c;
        track.style.transform = "translateX(" + -c0 + "rem)";
        px = lx; lx = x;
        e.preventDefault();
      }, { passive: false });
      const end = () => {
        if (ctx === "pc" || !drag) return;
        drag = false;
        if (horiz) h = c0;
        d = (px - lx) / 8.5;
        tick();
      };
      area.addEventListener("touchend", end);
      area.addEventListener("touchcancel", end);
    }
  };
  NL.marquee = marquee;

  /* ── Scene gallery ── photo row repeated two more times for an endless loop, click to open an enlarged window */
  const modal = document.querySelector(".nl-modal");
  document.querySelectorAll(".nl-gallery").forEach((g) => {
    const viewport = g.querySelector(".nl-gallery__viewport");
    const track = g.querySelector(".nl-gallery__track");
    const set = track.querySelector(".nl-gallery__set");
    const thumbs = [...set.querySelectorAll(".nl-gallery__thumb")];
    track.append(set.cloneNode(true), set.cloneNode(true));
    track.querySelectorAll(".nl-gallery__set + .nl-gallery__set").forEach((s) => s.setAttribute("aria-hidden", "true"));
    const gap = ctx === "pc" ? 20 : 10;
    marquee({ track, base: 0.075, gain: 0.5, area: viewport, widthOf: () => viewport.offsetWidth, wrapLen: () => (set.offsetWidth + rpx(gap)) / remPx() });
    track.querySelectorAll(".nl-gallery__thumb").forEach((t, i) => t.addEventListener("click", () => openModal(thumbs, i % thumbs.length)));
  });

  let modalIndex = 0, modalCount = 0;
  const showModal = (i) => {
    modalIndex = Math.max(0, Math.min(modalCount - 1, i));
    modal.querySelectorAll(".nl-modal__image").forEach((el, k) => el.classList.toggle("is-current", k === modalIndex));
    // Original page dots: slide a five-slot window around the current dot (-100% × first slot of the window), dots more than two slots away are small — the five slots at either end are not made small
    const first = Math.min(Math.max(modalCount - 5, 0), Math.max(0, modalIndex - 2));
    modal.querySelectorAll(".nl-modal__dot").forEach((el, k) => {
      el.classList.toggle("is-current", k === modalIndex);
      const far = Math.abs(modalIndex - k) > 2 && !(modalIndex < 2 && k < 5) && !(modalIndex > modalCount - 3 && k > modalCount - 6);
      el.classList.toggle("is-mini", far);
      el.style.transform = "translateX(" + -100 * first + "%)";
    });
    modal.querySelector(".nl-modal__prev").style.display = modalIndex <= 0 ? "none" : "";
    modal.querySelector(".nl-modal__next").style.display = modalIndex >= modalCount - 1 ? "none" : "";
    modal.querySelector(".nl-modal__cur").textContent = String(modalIndex + 1).padStart(2, "0");
  };
  const openModal = (thumbs, i) => {
    if (!modal) return;
    const vp = modal.querySelector(".nl-modal__viewport");
    const dots = modal.querySelector(".nl-modal__dots");
    vp.innerHTML = ""; dots.innerHTML = "";
    modalCount = thumbs.length;
    thumbs.forEach((t, k) => {
      const ph = t.querySelector(".wf-img");
      const im = document.createElement("div");
      im.className = "nl-modal__image" + (t.classList.contains("is-p") ? " is-p" : "");
      im.innerHTML = '<div class="nl-modal__photo"><div class="wf-img nl-ph"></div></div><div class="nl-modal__bg" aria-hidden="true"><div class="wf-img nl-ph"></div></div>';
      im.querySelector(".nl-modal__photo .wf-img").dataset.label = ph.dataset.label;
      vp.append(im);
      const dot = document.createElement("button");
      dot.type = "button"; dot.className = "nl-modal__dot"; dot.setAttribute("aria-label", "Photo " + (k + 1));
      dot.addEventListener("click", () => showModal(k));
      dots.append(dot);
    });
    modal.querySelector(".nl-modal__max").textContent = String(modalCount).padStart(2, "0");
    showModal(i);
    modal.classList.add("is-open");
    requestAnimationFrame(() => requestAnimationFrame(() => modal.classList.add("is-active")));
  };
  if (modal) {
    const close = () => { modal.classList.remove("is-active"); setTimeout(() => { if (!modal.classList.contains("is-active")) modal.classList.remove("is-open"); }, 500); };
    modal.querySelector(".nl-modal__close").addEventListener("click", close);
    modal.querySelector(".nl-modal__prev").addEventListener("click", () => showModal(modalIndex - 1));
    modal.querySelector(".nl-modal__next").addEventListener("click", () => showModal(modalIndex + 1));
    addEventListener("keydown", (e) => {
      if (!modal.classList.contains("is-active")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") showModal(modalIndex - 1);
      if (e.key === "ArrowRight") showModal(modalIndex + 1);
    });
    // Original: on first move, if horizontal exceeds vertical it locks to horizontal swipe and blocks page scroll, and a push over 50px advances one slide that way
    let sx = 0, sy = 0, lx = 0, axis = null, toLeft = false;
    modal.addEventListener("touchstart", (e) => { e.stopPropagation(); axis = false; sx = lx = e.touches[0].pageX; sy = e.touches[0].pageY; }, { passive: true });
    modal.addEventListener("touchmove", (e) => {
      if (axis === null) return;
      if (axis === true) e.preventDefault();
      lx = e.touches[0].pageX;
      if (axis === false) { if (Math.abs(lx - sx) > Math.abs(e.touches[0].pageY - sy)) { axis = true; toLeft = !(lx - sx > 0); } else axis = null; }
    }, { passive: false });
    const swipeEnd = () => {
      if (axis === true && Math.abs(lx - sx) > 50) {
        if (!toLeft && lx - sx > 0) showModal(modalIndex - 1);
        if (toLeft && lx - sx < 0) showModal(modalIndex + 1);
      }
      axis = null;
    };
    modal.addEventListener("touchend", swipeEnd, { passive: true });
    modal.addEventListener("touchcancel", swipeEnd, { passive: true });
  }

  /* ── Footer ── the monochrome background rises late, a closing line floats up, and a related brand row flows */
  const fmain = document.querySelector(".nl-fmain");
  if (fmain) {
    const bg = fmain.querySelector(".nl-fmain__bg .nl-prlx__in");
    if (!reduce) gsap.fromTo(bg, { yPercent: -20 }, { yPercent: 0, ease: "none", scrollTrigger: { trigger: fmain, start: "top bottom", end: "bottom bottom", scrub: true, invalidateOnRefresh: true } });
    const catchEl = fmain.querySelector(".nl-fmain__catch");
    ScrollTrigger.create({ trigger: catchEl, start: "top 80%", onEnter: () => catchEl.classList.add("is-appear"), onLeaveBack: () => catchEl.classList.remove("is-appear") });
    const rel = fmain.querySelector(".nl-related");
    const track = rel.querySelector(".nl-related__track");
    track.append(...[...track.children].map((n) => { const c = n.cloneNode(true); c.setAttribute("aria-hidden", "true"); return c; }));
    marquee({ track, base: 0.05, gain: 0.3, area: rel, widthOf: () => innerWidth, wrapLen: () => (ctx === "sp" ? 1113 : 1920) / 10 });
  }

  /* ── About·Menu cover ── the title plate descends slower than the photo */
  const cover = document.querySelector(".nl-cover");
  if (cover && !reduce) {
    const c = cover.querySelector(".nl-cover__contents");
    if (ctx === "pc") gsap.fromTo(c, { yPercent: 0 }, { yPercent: 100, ease: "none", scrollTrigger: { trigger: cover, start: "top top", end: "bottom top", scrub: true, invalidateOnRefresh: true } });
    else gsap.fromTo(c, { y: 0 }, { y: () => cover.offsetHeight - c.offsetHeight + rpx(70), ease: "none", scrollTrigger: { trigger: cover, start: "top top", end: "bottom top", scrub: true, invalidateOnRefresh: true } });
  }

  /* ── Pinned scene ── the text panel stays stuck while photos pass, and progress picks which scene is current */
  document.querySelectorAll(".nl-features").forEach((f) => {
    const n = +f.dataset.sections;
    const bodyEl = f.querySelector(".nl-features__body");
    const secs = [...f.querySelectorAll(".nl-features__msec")];
    const frame = f.querySelector(".nl-features__frame");
    let cur = 0;
    const setPos = (p) => {
      cur = p;
      const s = secs[p - 1];
      secs.forEach((el) => el.classList.toggle("is-current", el === s));
      f.style.setProperty("--label", s.dataset.label || 0);
      f.style.setProperty("--page", p - 1);
      if (frame) frame.classList.toggle("is-on", s.dataset.frame !== undefined);
    };
    setPos(1);
    ScrollTrigger.create({ trigger: bodyEl, start: "top top", endTrigger: f, end: "bottom bottom", pin: true, pinSpacing: false,
      onUpdate: (st) => {
        f.style.setProperty("--scroll-progress", st.progress);
        const p = Math.floor(Math.min(n, Math.max(0, st.progress * (n - 1) + 1.5)));
        if (p !== cur && p >= 1) setPos(p);
      } });
  });

  /* ── Vertical gallery ── the text and photo frame stick at screen center, four cards slide up, and earlier ones move 20% less each */
  document.querySelectorAll(".nl-vgal").forEach((v) => {
    const heading = v.querySelector(".nl-vgal__heading");
    const area = v.querySelector(".nl-vgal__area");
    const cont = v.querySelector(".nl-vgal__container");
    const vp = v.querySelector(".nl-vgal__viewport");
    const stack = v.querySelector(".nl-vgal__stack");
    const bar = v.querySelector(".nl-vgal__progress i");
    const imgs = [...v.querySelectorAll(".nl-vgal__img .nl-ph")];
    const len = imgs.length;
    const upd = (st) => {
      const p = st.progress, h = vp.offsetHeight;
      bar.style.transform = "scaleY(" + p + ")";
      stack.style.transform = "translateY(calc(" + -100 * p + "% + " + h * p + "px))";
      imgs.forEach((im, i) => { im.style.transform = "translateY(" + -20 * (i - Math.min(len, Math.max(0, p * (len - 1)))) + "%)"; });
    };
    if (reduce) return;
    if (ctx === "pc") {
      area.style.height = vp.offsetHeight * len + "px";
      ScrollTrigger.create({ trigger: heading, start: () => "top-=" + rpx(30) + " top", endTrigger: cont, end: () => "center+=" + vp.offsetHeight * (len - 1) + " center", pin: true, pinSpacing: false });
      ScrollTrigger.create({ trigger: cont, start: "center center", end: () => "center+=" + vp.offsetHeight * (len - 1) + " center", pin: true, pinSpacing: false, onUpdate: upd });
    } else {
      ScrollTrigger.create({ trigger: v, start: () => "top+=" + rpx(-70) + " top", end: () => "top+=" + (rpx(-70) + vp.offsetHeight * (len - 1)) + " top", pin: true, pinSpacing: true, onUpdate: upd });
    }
  });

  // Even if the page js pin is created later than the header and button pins, reorder so they are computed from the top
  addEventListener("load", () => { ScrollTrigger.refresh(); ScrollTrigger.sort(); ScrollTrigger.refresh(); });
})();
