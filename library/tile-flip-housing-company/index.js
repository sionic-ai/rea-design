// Home page — rolling logo loader, tile-flip Hero (Splide is just a container that swaps scene cells, as in the original), drag-to-flip cards, product card stack, row of people photos, concept video blur.
(() => {
  const root = document.documentElement;
  const sp = matchMedia("(max-width: 767px)");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ───── Hero cell building: PC 5×4, phone 3×3, each cell shows its own piece of the same picture
  const slides = [...document.querySelectorAll(".js-slide-flip")];
  slides.forEach((s) => {
    const grid = document.createElement("div");
    grid.className = "ih-mv__grid";
    const cell = (c, r, kind) => `<div class="ih-mv__tile ih-mv__tile--${kind} ${kind === "pc" ? "js-flip-item" : "js-flip-item-sp"}" style="--col:${c};--row:${r}"><div class="ih-mv__face ih-mv__face--front"></div><div class="ih-mv__face ih-mv__face--back"></div></div>`;
    let html = "";
    for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++) html += cell(c, r, "pc");
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) html += cell(c, r, "sp");
    grid.innerHTML = html;
    s.append(grid);
  });

  // ───── Loader: raise the logo strip all the way in one go (1.8s), rest .4s, lift the panel in .6s, then unfold the cells at 80ms intervals
  const opening = document.querySelector(".js-opening");
  const logos = document.querySelector(".js-opening-logos");
  const mark = '<svg class="ih-logo__mark" viewBox="0 0 32 32" aria-hidden="true"><path d="M16 2l12 7-12 7L4 9z" style="fill:var(--kf-accent)"/><path d="M4 9l12 7v14L4 23z" style="fill:var(--kf-ink)"/><path d="M28 9v14l-12 7V16z" style="fill:var(--kf-dim)"/></svg>';
  logos.innerHTML = ["Group Company Name 1", "Group Company Name 2", "Group Company Name 3", "Group Company Name 4", "Group Company Name 5", "Company name Inc."].map((t, i, a) => `<div class="ih-opening__logo">${i === a.length - 1 ? mark : ""}${t}</div>`).join("");
  const KEY = "ih-opening-shown";
  const firstItems = () => slides[0].querySelectorAll(sp.matches ? ".js-flip-item-sp" : ".js-flip-item");
  if (reduce || sessionStorage.getItem(KEY)) opening.classList.add("is-hidden");
  else {
    sessionStorage.setItem(KEY, "1");
    firstItems().forEach((it) => it.classList.add("is-hidden-rotate"));
    const run = () => {
      logos.style.opacity = "1";
      const move = -(logos.scrollHeight - logos.parentElement.offsetHeight);
      logos.style.transform = `translateY(${move}px)`;
      setTimeout(() => {
        opening.classList.add("is-fadeout");
        setTimeout(() => {
          opening.classList.add("is-hidden");
          firstItems().forEach((it, i) => setTimeout(() => { it.classList.remove("is-hidden-rotate"); it.classList.add("is-revealing"); }, i * 80));
        }, 600);
      }, 1800 + 400);
    };
    // The original moves the band on DOMContentLoaded — hooking it in the same frame leaves the initial position undrawn, so the transition doesn’t run
    requestAnimationFrame(() => requestAnimationFrame(run));
  }

  // ───── Scene Change
  const label = document.querySelector(".js-mv-label");
  const links = [...document.querySelectorAll(".js-mv-link")];
  const dots = document.querySelector(".js-mv-dots");
  const splide = new Splide(".js-mv .splide", { type: "slide", rewind: true, speed: 0, drag: false, waitForTransition: false, pagination: false, arrows: false });
  const sel = () => (sp.matches ? ".js-flip-item-sp" : ".js-flip-item");
  const faces = (it) => [it.querySelector(".ih-mv__face--front"), it.querySelector(".ih-mv__face--back")];
  let flipItems = [], flipT = null, slideT = null, rotating = false, programmatic = false;
  const FLIP_WAIT = 5000, SLIDE_WAIT = 5000;

  const setLabel = (i, back) => { const s = slides[i]; label.textContent = back ? s.dataset.back : s.dataset.front; };
  const lockFlip = (on) => {
    root.classList.toggle("is-mv-flipping", on);
    if (on) setTimeout(() => root.classList.remove("is-mv-flipping"), 800 + Math.max(0, flipItems.length - 1) * 100 + 80);
  };
  function flipAll() {
    if (!flipItems.length) return;
    lockFlip(true);
    let done = 0;
    const end = () => { if (++done === flipItems.length) startSlideTimer(); };
    flipItems.forEach((it, i) => {
      const [f, b] = faces(it);
      gsap.killTweensOf([f, b]);
      it.dataset.hover = "0";
      const fr = gsap.getProperty(f, "rotationY"), br = gsap.getProperty(b, "rotationY");
      if (fr === 180 && br === 0) { it.classList.add("is-flipped"); return end(); }
      if (fr > 0 && fr < 180 && br > 0 && br <= 180) {
        gsap.to(f, { rotationY: 180, duration: 0.3, ease: "power2.out" });
        gsap.to(b, { rotationY: 0, duration: 0.3, ease: "power2.out", onComplete: end });
      } else {
        gsap.to(f, { rotationY: 180, duration: 0.8, delay: i * 0.1, ease: "power2.inOut" });
        gsap.to(b, { rotationY: 0, duration: 0.8, delay: i * 0.1, ease: "power2.inOut", onComplete: end });
      }
      it.classList.add("is-flipped");
    });
    setLabel(splide.index, true);
  }
  const startFlipTimer = () => { clearTimeout(flipT); if (flipItems.length) flipT = setTimeout(flipAll, FLIP_WAIT); };
  const startSlideTimer = () => { clearTimeout(slideT); slideT = setTimeout(() => go(">"), SLIDE_WAIT); };
  const stopTimers = () => { clearTimeout(flipT); clearTimeout(slideT); };
  const resetSlide = (i) => slides[i].querySelectorAll(sel()).forEach((it) => {
    const [f, b] = faces(it);
    gsap.killTweensOf([f, b, it]);
    gsap.set(f, { rotationY: 0 }); gsap.set(b, { rotationY: 180 });
    it.classList.remove("is-flipped");
  });
  const syncUi = (i) => {
    links.forEach((l) => {
      const on = +l.dataset.slide === i, was = l.classList.contains("is-active");
      if (was && !on) { l.classList.remove("is-active"); l.classList.add("is-leaving"); setTimeout(() => l.classList.remove("is-leaving"), 400); }
      else if (!was && on) l.classList.add("is-active");
    });
    [...dots.children].forEach((d, k) => d.classList.toggle("is-active", k === i));
  };
  function go(target) {
    const n = slides.length, cur = splide.index;
    const next = typeof target === "number" ? target : target === ">" ? (cur >= n - 1 ? 0 : cur + 1) : (cur <= 0 ? n - 1 : cur - 1);
    if (next === cur || rotating) return;
    stopTimers();
    root.classList.remove("is-mv-flipping");
    resetSlide(next);
    rotating = true;
    root.classList.add("is-mv-slide-moving");
    syncUi(next);
    slides[cur].querySelectorAll(".js-flip-item, .js-flip-item-sp").forEach((it) => { gsap.killTweensOf(faces(it)); it.dataset.hover = "0"; });
    slides[next].classList.add("is-next-slide");
    const curItems = [...slides[cur].querySelectorAll(sel())], nextItems = [...slides[next].querySelectorAll(sel())];
    curItems.forEach((it) => it.classList.remove("is-revealing"));
    gsap.killTweensOf([...curItems, ...nextItems]);
    gsap.set(curItems, { transformPerspective: 1600, transformOrigin: "50% 50%" });
    gsap.set(nextItems, { transformPerspective: 1600, transformOrigin: "50% 50%", rotationY: -90 });
    // Original values: .04s per cell in order · folds 90° at .34s and at that moment the next cell unfolds from −90° (PC brought forward by .2s, phone by 1s)
    const D = 0.34, off = sp.matches ? -1 : -0.2;
    const tl = gsap.timeline({ onComplete: () => {
      programmatic = true; splide.go(next); programmatic = false;
      resetSlide(cur);
      slides[next].classList.remove("is-next-slide");
      gsap.set(curItems, { rotationY: 0 }); gsap.set(nextItems, { rotationY: 0 });
      rotating = false;
      root.classList.remove("is-mv-slide-moving");
    } });
    curItems.forEach((it, i) => {
      const t = 0.04 * i + off;
      tl.to(it, { rotationY: 90, duration: D, ease: "power2.in" }, t);
      if (nextItems[i]) tl.to(nextItems[i], { rotationY: 0, duration: D, ease: "power2.out" }, t + D);
    });
  }
  splide.on("mounted", () => {
    for (let i = 0; i < slides.length; i++) {
      const d = document.createElement("button");
      d.type = "button"; d.className = "ih-mv__dot" + (i ? "" : " is-active"); d.setAttribute("aria-label", `Scene ${i + 1}`);
      d.addEventListener("click", () => go(i));
      dots.append(d);
    }
    flipItems = [...slides[splide.index].querySelectorAll(sel())];
    setLabel(splide.index, false);
    if (!reduce) startFlipTimer();
  });
  splide.on("moved", (i) => {
    if (!programmatic) { stopTimers(); resetSlide(splide.index); }
    flipItems = [...slides[i].querySelectorAll(sel())];
    syncUi(i);
    setLabel(i, false);
    if (!reduce) startFlipTimer();
  });
  document.querySelector(".js-mv-prev").addEventListener("click", () => go("<"));
  document.querySelector(".js-mv-next").addEventListener("click", () => go(">"));
  links.forEach((l) => l.addEventListener("click", (e) => { if (l.classList.contains("is-active")) return; e.preventDefault(); go(+l.dataset.slide); }));
  splide.mount();

  // Hover a cell and only that cell flips, then returns after .125s (.8s power2.inOut)
  if (!reduce) slides.forEach((s) => s.querySelectorAll(".js-flip-item").forEach((it) => {
    it.dataset.hover = "0";
    it.addEventListener("mouseenter", () => {
      if (sp.matches || root.classList.contains("is-mv-slide-moving") || root.classList.contains("is-mv-flipping") || it.dataset.hover === "1") return;
      it.dataset.hover = "1";
      const [f, b] = faces(it);
      const flipped = it.classList.contains("is-flipped");
      const busy = () => root.classList.contains("is-mv-flipping") || root.classList.contains("is-mv-slide-moving");
      const A = flipped ? [0, -180] : [180, 0], B = flipped ? [180, 0] : [0, -180];
      gsap.to(f, { rotationY: A[0], duration: 0.8, ease: "power2.inOut" });
      gsap.to(b, { rotationY: A[1], duration: 0.8, ease: "power2.inOut", onComplete: () => {
        it.classList.toggle("is-flipped", !flipped);
        setTimeout(() => {
          if (busy()) { it.dataset.hover = "0"; return; }
          gsap.to(f, { rotationY: B[0], duration: 0.8, ease: "power2.inOut" });
          gsap.to(b, { rotationY: B[1], duration: 0.8, ease: "power2.inOut", onComplete: () => { it.classList.toggle("is-flipped", flipped); it.dataset.hover = "0"; } });
        }, 125);
      } });
    });
  }));

  // ───── Drag-to-flip card row + progress bar (drag distance ×1.5)
  const dragBar = (wrap, thumb, drag) => {
    if (!wrap) return;
    const update = () => {
      if (!thumb) return;
      const max = wrap.scrollWidth - wrap.clientWidth, room = thumb.parentElement.clientWidth - thumb.clientWidth;
      thumb.style.transform = `translateX(${room * Math.min(max > 0 ? wrap.scrollLeft / max : 0, 1)}px)`;
    };
    wrap.addEventListener("scroll", () => requestAnimationFrame(update), { passive: true });
    addEventListener("resize", update);
    update();
    if (!drag) return;
    let down = false, moved = false, x0 = 0, s0 = 0;
    wrap.addEventListener("mousedown", (e) => { e.preventDefault(); down = true; moved = false; x0 = e.pageX - wrap.offsetLeft; s0 = wrap.scrollLeft; wrap.classList.add("is-dragging"); });
    const up = () => { if (!down) return; down = false; wrap.classList.remove("is-dragging"); setTimeout(() => (moved = false), 10); };
    wrap.addEventListener("mouseleave", up);
    wrap.addEventListener("mouseup", up);
    wrap.addEventListener("mousemove", (e) => { if (!down) return; e.preventDefault(); const walk = (e.pageX - wrap.offsetLeft - x0) * 1.5; if (Math.abs(walk) > 5) moved = true; wrap.scrollLeft = s0 - walk; });
    wrap.querySelectorAll("a").forEach((a) => a.addEventListener("click", (e) => moved && e.preventDefault()));
  };
  dragBar(document.querySelector(".js-drag-cards"), document.querySelector(".js-drag-thumb"), true);
  dragBar(document.querySelector(".js-owner-cards"), document.querySelector(".js-owner-thumb"), false);

  // ───── Two rows of people photos — the top row moves left, the bottom row right at .3px per frame, sticking up to 4 on scroll and settling in 1.5s
  const rec = document.querySelector(".js-recruit");
  const rowTop = rec.querySelector(".js-recruit-top .ih-recruit__inner"), rowBot = rec.querySelector(".js-recruit-bottom .ih-recruit__inner");
  const people = ["Suited sales rep half-length · office · portrait", "Site supervisor in a hard hat · Outdoors · Portrait", "Design lead holding a laptop · bright interior · portrait", "Employee on the phone · by the window · portrait", "Smiling new employee · white wall · portrait"];
  const fill = (row, shift) => (row.innerHTML = [...people, ...people].map((_, i) => `<div class="ih-recruit__item"><div class="wf-img" data-label="${people[(i + shift) % 5]}"></div></div>`).join(""));
  fill(rowTop, 0); fill(rowBot, 2);
  if (!reduce) {
    const base = 0.3, maxBoost = 4, speed = { v: base };
    let lastY = scrollY, top = 0, bot = 0, tw = null;
    const loopW = () => (rowTop.firstElementChild.offsetWidth + 16 * (parseFloat(getComputedStyle(root).fontSize) / 10)) * 5;
    bot = -loopW();
    rowBot.style.transform = `translateX(${bot}px)`;
    addEventListener("scroll", () => {
      const d = Math.abs(scrollY - lastY); lastY = scrollY;
      if (!d) return;
      if (tw) tw.kill();
      speed.v = Math.min(base + d * 0.3, maxBoost);
      tw = gsap.to(speed, { v: base, duration: 1.5, ease: "power3.out", overwrite: true });
    }, { passive: true });
    const tick = () => {
      const r = rec.getBoundingClientRect();
      if (r.bottom > 0 && r.top < innerHeight) {
        const w = loopW();
        top -= speed.v; if (top <= -w) top += w;
        bot += speed.v; if (bot >= 0) bot -= w;
        rowTop.style.transform = `translateX(${top}px)`;
        rowBot.style.transform = `translateX(${bot}px)`;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  // ───── Concept wordmark — when on screen, changes type every 140ms for one full loop
  const logoBox = document.querySelector(".js-concept-logo");
  const looks = [["400", "0.02em", "normal"], ["300", "0.12em", "normal"], ["600", "0", "normal"], ["400", "0.06em", "italic"], ["500", "0.2em", "normal"], ["400", "0.02em", "normal"]];
  logoBox.innerHTML = looks.map(([w, ls, st], i) => `<svg viewBox="0 0 540 160" class="${i ? "" : "is-active"}" aria-hidden="true"><text x="270" y="112" text-anchor="middle" font-size="118" font-weight="${w}" letter-spacing="${ls}" font-style="${st}">wordmark</text></svg>`).join("");
  const imgs = [...logoBox.children];
  let played = false;
  new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting || played) return;
    played = true;
    let k = 0, count = 0;
    const id = setInterval(() => {
      imgs[k].classList.remove("is-active"); k = (k + 1) % imgs.length; imgs[k].classList.add("is-active");
      if (++count >= imgs.length) clearInterval(id);
    }, 140);
  })).observe(logoBox);

  // ───── ScrollTrigger scenes
  gsap.registerPlugin(ScrollTrigger);
  gsap.matchMedia().add({ go: "(prefers-reduced-motion: no-preference)" }, () => {
    // Concept: while the section top edge goes −50%→−125% of the screen (phone 0→−75%), video blur 0→4px, ink veil 0→.2
    const concept = document.querySelector(".js-concept");
    const vids = [...concept.querySelectorAll(".ih-concept__video")];
    ScrollTrigger.create({
      trigger: concept, start: () => (sp.matches ? "top 0%" : "top -50%"), end: () => (sp.matches ? "top -75%" : "top -125%"), scrub: 0.5, invalidateOnRefresh: true,
      onUpdate: (self) => vids.forEach((v) => { v.style.setProperty("--overlay-opacity", 0.2 * self.progress); v.firstElementChild.style.filter = `blur(${4 * self.progress}px)`; }),
    });

    // Product stack: each time you scroll by a card height, the next card goes from 1.2x and below the screen to 1x in place (scrub .25), and the whole stack moves up 4rem×(n−1) (scrub .5)
    const sec = document.querySelector(".js-solutions"), box = sec.querySelector(".js-solutions-cards"), inner = sec.querySelector(".js-solutions-inner");
    const cards = [...sec.querySelectorAll(".js-solutions-card")];
    let H = 600, shift = 0;
    const layout = () => {
      H = cards[0].querySelector(".ih-scard").offsetHeight || 600;
      shift = -4 * (cards.length - 1) * parseFloat(getComputedStyle(root).fontSize);
      const stack = cards.reduce((m, c) => Math.max(m, c.offsetTop + c.offsetHeight), 0);
      box.style.height = `${stack}px`;
      inner.style.minHeight = `${H * cards.length + stack}px`;
    };
    layout();
    gsap.to(box, { y: () => shift, ease: "none", scrollTrigger: { trigger: sec, start: () => `top+=${H} top`, end: () => `top+=${H * cards.length} top`, scrub: 0.5, invalidateOnRefresh: true } });
    cards.forEach((c, i) => {
      const card = c.querySelector(".ih-scard");
      if (!i) return gsap.set(card, { scale: 1, y: 0, transformOrigin: "top center" });
      gsap.set(card, { scale: 1.2, y: innerHeight, transformOrigin: "top center" });
      gsap.to(card, { scale: 1, y: 0, ease: "none", scrollTrigger: { trigger: sec, start: () => `top+=${H * i - H * 0.5} top`, end: () => `top+=${H * (i + 1) - H * 0.5} top`, scrub: 0.25, invalidateOnRefresh: true } });
    });
    addEventListener("resize", layout);
  });
})();
