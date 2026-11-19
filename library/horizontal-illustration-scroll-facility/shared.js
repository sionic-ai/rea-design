// Motion used across the whole site: vertical wheel → horizontal stage (Lenis), first-visit loader, round menu panel, left vertical tab, color modal,
// Entrance that turns on when crossing the screen’s horizontal line, a character that walks along, turns around, and flips with each section.
(() => {
  const root = document.documentElement;
  const stage = document.querySelector("[data-stage]");
  const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  // On phone touch, no wheel emulation like the original — the document itself scrolls horizontally
  const native = isTouch && innerWidth <= 767;
  const firstVisit = !sessionStorage.getItem("the610-access");
  sessionStorage.setItem("the610-access", "1");
  let lenis = null;

  const scrollX = () => (native ? document.body.scrollLeft || root.scrollLeft : -gsap.getProperty(stage, "x"));
  const listeners = [];
  const onScroll = (fn) => listeners.push(fn);
  const emit = () => listeners.forEach((fn) => fn());

  // ---------- Horizontal stage ----------
  const fitHeight = () => {
    const max = stage.scrollWidth - innerWidth;
    document.body.style.height = `${max + innerHeight}px`;
    return max;
  };
  let maxX = 0;
  const mm = gsap.matchMedia();

  if (native) {
    Object.assign(root.style, { height: "100%", overflowX: "auto", overflowY: "hidden" });
    Object.assign(document.body.style, { height: "100%", margin: "0", overflowX: "auto", overflowY: "hidden" });
    Object.assign(stage.style, { position: "static", transform: "none", display: "flex", width: "max-content", minHeight: "100svh" });
    document.body.addEventListener("scroll", emit, { passive: true });
    addEventListener("scroll", emit, { passive: true });
  } else {
    maxX = fitHeight();
    addEventListener("resize", () => { maxX = fitHeight(); emit(); });
    addEventListener("load", () => { maxX = fitHeight(); });
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 2,
      });
      lenis.on("scroll", ({ scroll }) => {
        gsap.set(stage, { x: -Math.min(scroll, maxX) });
        emit();
      });
      const raf = (time) => lenis.raf(time * 1000);
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);
      return () => { gsap.ticker.remove(raf); lenis.destroy(); lenis = null; };
    });
    mm.add("(prefers-reduced-motion: reduce)", () => {
      const direct = () => { gsap.set(stage, { x: -Math.min(scrollY, maxX) }); emit(); };
      addEventListener("scroll", direct, { passive: true });
      direct();
      return () => removeEventListener("scroll", direct);
    });
  }
  const scrollToX = (x) => {
    if (native) document.body.scrollTo({ left: x, behavior: "smooth" });
    else if (lenis) lenis.scrollTo(x, { duration: 1.2 });
    else scrollTo(0, x);
  };

  // ---------- Appear: turn on once when the left edge crosses the 50~90% line of screen width ----------
  const appears = [...document.querySelectorAll("[data-at]")];
  const checkAppear = () => {
    appears.forEach((el) => {
      if (el.classList.contains("is-visible")) return;
      if (el.getBoundingClientRect().left < innerWidth * parseFloat(el.dataset.at)) el.classList.add("is-visible");
    });
  };

  // While the section enters from the screen’s right edge (100%) to the 70% line, the color plate and bands follow from 10% right into place
  const scrubSections = [...document.querySelectorAll("[data-scrub-section]")];
  gsap.set("[data-scrub]", { xPercent: 10 });
  const checkScrub = () => {
    scrubSections.forEach((sec) => {
      if (sec.dataset.done) return;
      const left = sec.getBoundingClientRect().left;
      const start = innerWidth, end = innerWidth * 0.7;
      if (left >= start) return;
      const p = left <= end ? 1 : (start - left) / (start - end);
      sec.querySelectorAll("[data-scrub]").forEach((el) => gsap.set(el, { xPercent: 10 * (1 - p) }));
      if (p === 1) sec.dataset.done = "1";
    });
  };

  // ---------- Companion character that walks along ----------
  const walker = document.querySelector(".walker");
  if (walker) {
    const dir = walker.querySelector(".walker__dir");
    const hide = walker.querySelector(".walker__hide");
    const flip = walker.querySelector(".walker__3d");
    const imgs = [...walker.querySelectorAll(".walker__img")];
    const hideAreas = [...document.querySelectorAll("[data-walker-hide]")];
    // When the section’s left edge passes this fraction of screen width, it flips to the next character
    const phases = [["#concept", 0.4], ["#enjoy", 0.3], ["#about", 0.2]];
    let left = walker.getBoundingClientRect().left;
    let prev = scrollX();
    let reversed = false, phase = 0, flipping = false, hidden = false;

    const setDir = (rev) => {
      if (rev === reversed) return;
      reversed = rev;
      gsap.to(dir, { rotateY: rev ? 180 : 0, transformPerspective: 600, duration: 0.3, ease: "power1.inOut" });
    };
    const flipTo = (next) => {
      const cur = flip.querySelector(".walker__img.is-active");
      if (flipping || !next || cur === next) return;
      flipping = true;
      gsap.to(flip, {
        rotateY: 90, transformPerspective: 600, duration: 0.2, ease: "power1.in",
        onComplete: () => {
          cur.classList.remove("is-active");
          next.classList.add("is-active");
          gsap.fromTo(flip, { rotateY: -90 }, { rotateY: 0, transformPerspective: 600, duration: 0.2, ease: "power1.out", onComplete: () => (flipping = false) });
        },
      });
    };
    const update = () => {
      const x = scrollX();
      const diff = x - prev;
      const back = diff < 0;
      if (diff) { setDir(back); left -= diff; }
      prev = x;
      const min = innerWidth * 0.02;
      const maxLeft = innerWidth - walker.offsetWidth - min;
      if (!back) {
        if (left <= min) { left = min; walker.style.left = "2vw"; walker.style.right = "auto"; }
        else { walker.style.left = `${left}px`; walker.style.right = "auto"; }
      } else if (left >= maxLeft) {
        left = maxLeft; walker.style.left = "auto"; walker.style.right = "2vw";
      } else { walker.style.left = `${left}px`; walker.style.right = "auto"; }

      phases.forEach(([sel, ratio], i) => {
        const sec = document.querySelector(sel);
        if (!sec) return;
        const at = sec.getBoundingClientRect().left;
        if (at <= innerWidth * ratio && phase === i) { flipTo(imgs[i + 1]); phase++; }
        else if (at > innerWidth * ratio && phase === i + 1) { flipTo(imgs[i]); phase--; }
      });

      // On phone, overlapping a card or table makes it turn sideways and hide
      if (innerWidth > 767) {
        if (hidden) { hidden = false; gsap.set(hide, { clearProps: "transform" }); }
        return;
      }
      const r = walker.getBoundingClientRect();
      const over = hideAreas.some((a) => { const b = a.getBoundingClientRect(); return r.left < b.right && r.right > b.left; });
      if (over !== hidden) {
        hidden = over;
        gsap.to(hide, { rotateY: over ? 90 : 0, transformPerspective: 600, duration: 0.2, ease: over ? "power1.in" : "power1.out", overwrite: true });
      }
    };
    onScroll(update);
    addEventListener("resize", update);
  }
  onScroll(checkAppear);
  onScroll(checkScrub);

  // ---------- Loader ----------
  const fv = document.querySelectorAll("[data-fv]");
  const showFv = () => fv.forEach((el) => el.classList.add("is-visible"));
  const hint = document.querySelector(".scroll-hint");
  const loader = document.querySelector(".loader");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!loader || !firstVisit || reduce) {
    showFv();
    checkAppear();
    checkScrub();
  } else {
    loader.classList.add("is-loading");
    const value = loader.querySelector(".loader__value b");
    let cur = 0, loaded = document.readyState === "complete";
    addEventListener("load", () => (loaded = true));
    const minWait = new Promise((r) => setTimeout(r, 3000));
    const count = new Promise((r) => {
      const t = setInterval(() => {
        cur = Math.min(cur + (loaded ? 5 : Math.random() * 3), loaded ? 100 : 95);
        value.textContent = Math.floor(cur);
        if (cur >= 100) { clearInterval(t); r(); }
      }, 100);
    });
    Promise.all([minWait, count]).then(() => {
      loader.querySelector(".loader__bg").classList.add("is-active");
      loader.classList.add("is-active");
      loader.addEventListener("transitionend", function done(e) {
        if (e.target !== loader) return;
        loader.removeEventListener("transitionend", done);
        showFv();
        checkAppear();
        checkScrub();
        hint?.classList.add("is-active");
      });
    });
  }
  addEventListener("pointerdown", (e) => {
    const y = e.clientY, x = e.clientX;
    addEventListener("pointermove", function move(e2) {
      if (Math.abs(e2.clientY - y) + Math.abs(e2.clientX - x) > 0) { hint?.classList.add("is-scroll"); removeEventListener("pointermove", move); }
    });
  }, { once: true });

  // ---------- Menu ----------
  const menuBtn = document.querySelector(".menu-btn");
  const nav = document.querySelector(".nav");
  const lock = (on) => { document.body.classList.toggle("is-stop", on); root.classList.toggle("is-stop", on); };
  const setMenu = (open) => {
    menuBtn.classList.toggle("is-active", open);
    nav.classList.toggle("is-active", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Close Menu" : "Open Menu");
    // Same as the original Fn.fixedBody — locks only body and does not stop Lenis (locking html too re-measures the whole stage and delays button response)
    document.body.classList.toggle("is-stop", open);
  };
  menuBtn?.addEventListener("click", () => setMenu(!menuBtn.classList.contains("is-active")));
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      if (nav.classList.contains("is-active")) setMenu(false);
      const href = a.getAttribute("href");
      const target = href.length > 1 ? document.querySelector(href) : null;
      setTimeout(() => {
        let x = 0, el = target;
        while (el && el !== stage) { x += el.offsetLeft; el = el.offsetParent; }
        scrollToX(target ? x : 0);
      }, 300);
    });
  });

  // ---------- Left tab ----------
  document.querySelectorAll(".tab__btn").forEach((b) => b.addEventListener("click", () => b.closest(".tab").classList.toggle("is-active")));

  // ---------- Modal ----------
  const openModal = (id) => {
    const m = document.getElementById(id);
    if (!m) return;
    m.classList.add("is-active");
    lenis?.stop();
    lock(true);
  };
  const closeModal = (m) => {
    m.classList.remove("is-active");
    lenis?.start();
    lock(false);
  };
  document.querySelectorAll("[data-open]").forEach((b) => b.addEventListener("click", () => openModal(b.dataset.open)));
  document.querySelectorAll(".modal, .menu-modal").forEach((m) => {
    m.addEventListener("click", (e) => {
      if (e.target.closest(".js-close")) return closeModal(m);
      const inner = m.querySelector(".js-inner");
      if (inner && inner.contains(e.target)) return;
      closeModal(m);
    });
  });
  addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    document.querySelectorAll(".modal.is-active, .menu-modal.is-active").forEach(closeModal);
    if (nav?.classList.contains("is-active")) setMenu(false);
  });

  // ---------- Q&A box scrolled only inside: the stage takes the wheel, and the box is scrolled by dragging the bar ----------
  document.querySelectorAll("[data-inner-scroll]").forEach((box) => {
    const thumb = box.querySelector(".qa-thumb");
    const track = () => box.clientHeight - 64 - thumb.offsetHeight;
    const paint = () => {
      const max = box.scrollHeight - box.clientHeight;
      thumb.style.transform = `translateY(${Math.round((max > 0 ? box.scrollTop / max : 0) * track())}px)`;
    };
    box.addEventListener("wheel", (e) => e.preventDefault(), { passive: false });
    let drag = false, y0 = 0, s0 = 0;
    thumb.addEventListener("mousedown", (e) => { drag = true; y0 = e.clientY; s0 = box.scrollTop; document.body.style.userSelect = "none"; e.preventDefault(); });
    addEventListener("mousemove", (e) => { if (drag) box.scrollTop = s0 + ((e.clientY - y0) / track()) * (box.scrollHeight - box.clientHeight); });
    addEventListener("mouseup", () => { drag = false; document.body.style.userSelect = ""; });
    let ty = 0, ts = 0;
    box.addEventListener("touchstart", (e) => { ty = e.touches[0].clientY; ts = box.scrollTop; }, { passive: true });
    box.addEventListener("touchmove", (e) => { box.scrollTop = ts + (ty - e.touches[0].clientY); e.preventDefault(); }, { passive: false });
    box.addEventListener("scroll", paint, { passive: true });
    paint();
  });

  emit();
})();
