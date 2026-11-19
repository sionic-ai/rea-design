/* Original values for each section, as is —
   Hero: elliptical window diameter 332+.2y by scroll y (at width 1600), frame scale (332+.2y)/332, background (332+.02y)/332, blur .001y px. Disappears in .75s after passing 2 screens.
   About: the text panel turns on at 3.5 screens, and the photo width scrubs to full screen width over 1 screen. Features: photo .375→1 (sine.inOut scrub 1.5 screens), then the point panel stays pinned.
   Performance record: photo plate 1→3× (sine.out scrub over 2 screens). Learning: subject tab and framed photo change every screen (9 cells). Career: card strip scrubs horizontally, and messages light up one at a time every .75 screen. */
(() => {
  const sp = matchMedia("(max-width: 767px)");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const vh = () => innerHeight;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const invert = (on) => window.bkInvert && window.bkInvert(on);

  // Placeholder data (the original draws three JSON sets with Vue)
  const lecturers = Array.from({ length: 10 }, (_, i) => ({ role: `Your field $ here{String(i + 1).padStart(2, "0")}`, name: `Name Here ${String(i + 1).padStart(2, "0")}` }));
  const subjects = [["Core subjects", "Advanced course"], ["Physical expression major", "Food and Beauty Majors", "Qualification obtainable as a minor"], ["Liberal Brand Course 1", "Career basics course", "International communication course", "Liberal Brand Course 2"]];
  const models = Array.from({ length: 12 }, (_, i) => ({ career: `Your career path $ here{String(i + 1).padStart(2, "0")}`, name: `Name ${String(i + 1).padStart(2, "0")}` }));

  // ── Instructor List · Modal ──
  const lecList = $(".bk-lecturer__list");
  const lecSwiperWrap = $('.bk-modal[data-modal="lecturer"] .swiper-wrapper');
  if (lecList) {
    lecList.innerHTML = lecturers.map((l, i) => `<li><button type="button" class="${i ? "" : "is-active"}" data-lecture-modal-trigger="${i + 1}"><span class="bk-lecturer__role">${l.role}</span><span class="bk-lecturer__name" lang="en">${l.name}</span></button></li>`).join("") + '<li class="bk-lecturer__etc">...etc</li>';
    lecSwiperWrap.innerHTML = lecturers.map((l) => `<div class="swiper-slide"><div class="bk-modal__scroll" data-lenis-prevent><p class="bk-modal__role">${l.role}</p><h3 class="bk-modal__ttl" lang="en">${l.name}</h3><p>About five lines for the instructor bio. Continue the career here. Put signature works here. Put awards here. Close here.</p></div></div>`).join("");
    const modal = $('.bk-modal[data-modal="lecturer"]');
    const swiper = new Swiper($(".swiper", modal), { navigation: { prevEl: $(".is-prev", modal), nextEl: $(".is-next", modal) } });
    const imgs = $$(".bk-lecturer__img");
    const btns = $$("[data-lecture-modal-trigger]");
    btns.forEach((b, i) => {
      b.addEventListener("mouseenter", () => {
        btns.forEach((x) => x.classList.remove("is-active"));
        imgs.forEach((x) => x.classList.remove("is-active"));
        b.classList.add("is-active");
        imgs[i % imgs.length].classList.add("is-active");
      });
      b.addEventListener("click", () => { swiper.slideTo(i, 0); window.bkOpenModal("lecturer"); });
    });
  }

  // ── Performance record photo panel (video panel in the center, eight photos around it)
  const grid = $(".bk-record__grid");
  if (grid) {
    const labels = ["Performance photo · curtain call", "Performance photo · group dance", "Performance photo · duet", "Performance photo · chorus", "Performance photo · solo dance", "Performance photo · prop scene", "Performance photo · Curtain call", "Performance photo · Dressing room"];
    grid.innerHTML = labels.map((t, i) => `<div class="bk-record__cell bk-record__cell--${i + 1} bk-photo" data-label="${t} · Landscape 3:2"></div>`).join("") + '<button class="bk-record__movie" type="button" data-record-modal-trigger><span class="bk-photo" data-label="Performance video opening scene · full stage view · landscape 16:9"></span><b lang="en">MOVIE</b></button>';
  }
  $$("[data-record-modal-trigger]").forEach((b) => b.addEventListener("click", () => {
    const m = window.bkOpenModal("record");
    const v = m && $("video", m);
    v && v.play().catch(() => {});
  }));

  // ── Learning: tabs, list, nine framed photos
  const tabsBody = $(".bk-tabs__body");
  const imgsBox = $(".bk-learning__imgs");
  const flat = [];
  if (tabsBody) {
    const parents = $$(".bk-tabs__head button").map((b) => b.outerHTML);
    tabsBody.innerHTML = `<div class="bk-tabs__col">${subjects.map((group, g) => `<div class="bk-tabs__block">${parents[g]}<div class="bk-tabs__group${g ? "" : " is-active"}" data-group="${g}">${group.map((name) => {
      const k = flat.push(name) - 1;
      return `<button class="bk-tab${k ? "" : " is-active"}" data-k="${k}">${name}</button>`;
    }).join("")}</div></div>`).join("")}</div>` + `<div class="bk-learning__lists">${flat.map((name, k) => `<ul class="bk-learning__list${k ? "" : " is-active"}" data-k="${k}">${Array.from({ length: 8 }, (_, j) => `<li><button type="button" data-learning-modal-trigger>Your subject name $ here{String(j + 1).padStart(2, "0")}</button></li>`).join("")}</ul>`).join("")}</div>`;
    imgsBox.innerHTML = flat.map((name, k) => `<div class="bk-learning__img${k ? "" : " is-active"}"><svg class="bk-oval" viewBox="0 0 400 480" data-frame="oval"></svg><div class="bk-learning__photo bk-photo" data-label="Class scene ${k + 1} · Inside a gold oval frame · vertical"></div></div>`).join("");
    $$("[data-learning-modal-trigger]").forEach((b) => b.addEventListener("click", () => window.bkOpenModal("learning")));
  }
  const setLearning = (k) => {
    $$(".bk-tab").forEach((t) => t.classList.toggle("is-active", +t.dataset.k === k));
    $$(".bk-learning__list").forEach((t) => t.classList.toggle("is-active", +t.dataset.k === k));
    $$(".bk-learning__img").forEach((t, i) => t.classList.toggle("is-active", i === k));
    let g = 0, acc = 0;
    subjects.forEach((grp, gi) => { if (k >= acc && k < acc + grp.length) g = gi; acc += grp.length; });
    $$(".bk-tabs__block > button").forEach((b) => b.classList.toggle("is-active", +b.dataset.parent === g));
    $$(".bk-tabs__group").forEach((x) => x.classList.toggle("is-active", +x.dataset.group === g));
  };
  const head = $(".bk-tabs__head");
  head && head.remove();
  $$(".bk-tabs__block > button").forEach((b) => b.addEventListener("click", () => {
    const g = +b.dataset.parent;
    setLearning(subjects.slice(0, g).reduce((s, x) => s + x.length, 0));
  }));

  // ── Career Card Band
  const mlist = $(".bk-model__list");
  if (mlist) mlist.innerHTML = models.map((m) => `<li class="bk-model__item"><div class="bk-photo" data-label="Graduate portrait · bright background · portrait 3:4"></div><p class="bk-model__career">${m.career}</p><p class="bk-model__name">${m.name}</p></li>`).join("");

  // Oval frame (the original is a white Baroque frame with golden floral ornaments above and below) — drawn as a thick white rim + thin inner line + clusters of golden blossoms
  $$('svg[data-frame="oval"]').forEach((svg) => {
    const bloom = (cx, cy, s) => {
      let g = "";
      for (let i = 0; i < 9; i++) {
        const a = (i / 9) * Math.PI * 2 + s;
        const r = 10 + (i % 3) * 7;
        g += `<ellipse cx="${(cx + Math.cos(a) * r * 2.2).toFixed(1)}" cy="${(cy + Math.sin(a) * r * 0.9).toFixed(1)}" rx="${(9 + (i % 4) * 3)}" ry="${(6 + (i % 3) * 2)}" transform="rotate(${Math.round((a * 180) / Math.PI)} ${(cx + Math.cos(a) * r * 2.2).toFixed(1)} ${(cy + Math.sin(a) * r * 0.9).toFixed(1)})"/>`;
      }
      return g + `<circle cx="${cx}" cy="${cy}" r="11"/>`;
    };
    svg.innerHTML = `<ellipse class="bk-oval__ring" cx="200" cy="240" rx="186" ry="226" fill="none" stroke-width="22"/><ellipse class="bk-oval__line" cx="200" cy="240" rx="171" ry="210" fill="none" stroke-width="2"/><g class="bk-oval__gold">${bloom(200, 26, 0.3)}${bloom(130, 52, 1.2)}${bloom(270, 50, 2.1)}${bloom(200, 458, 0.8)}${bloom(150, 440, 1.7)}${bloom(252, 442, 2.6)}</g>`;
  });

  // ── Scroll effects
  const mv = $(".bk-mv");
  const mvInner = $(".bk-mv__inner");
  const frameImg = $(".bk-frame--1");
  const video = $(".bk-about video");
  let L = 0, A = 332, Ccoef = 402 / 332;

  const mvLayout = () => {
    const isSp = sp.matches;
    const design = isSp ? 390 : 1600, cy = isSp ? 300 : 403, cx = isSp ? 195.5 : 811;
    const W = mvInner.clientWidth, H = vh();
    const p0 = (W / design) * cy, u0 = (W / design) * cx;
    L = H * 2;
    $(".bk-mv-observer").style.height = `${L * 1.5}px`;
    A = isSp ? 280 : 332;
    Ccoef = (isSp ? 339 : 402) / A;
    const w = isSp ? 0 : 30 / 1652;
    const gx = (document.documentElement.clientWidth - W) / 2 + u0 - W * w;
    const by = (H - mvInner.clientHeight) / 2 + p0;
    mv.style.setProperty("--position-x", `${gx}px`);
    mv.style.setProperty("--position-y", `${by}px`);
    mv.style.setProperty("--origin-x", `${frameImg.clientWidth / 2 - u0}px`);
    mv.style.setProperty("--origin-y", `${H / 2 - p0 - (H - mvInner.clientHeight) / 2}px`);
    mvScroll();
  };
  let lastRun = 0, tail = 0;
  const mvApply = () => {
    lastRun = performance.now();
    const y = scrollY;
    const design = sp.matches ? 390 : 1600, W = mvInner.clientWidth;
    if (y > 100) { window.bkResetFrames && window.bkResetFrames(); window.bkNearTop = false; } else window.bkNearTop = true;
    if (y > L) {
      mv.classList.add("is-active");
      video && video.play().catch(() => {});
      invert(true);
      return;
    }
    mv.classList.remove("is-active");
    if (video) video.currentTime = 0;
    invert(false);
    const p = A + y * 0.2, u = A + y * 0.02;
    mv.style.setProperty("--ellipse-x", `${((W / design) * p) / 2}px`);
    mv.style.setProperty("--ellipse-y", `${((W / design) * p * Ccoef) / 2}px`);
    mv.style.setProperty("--frame-scale", p / A);
    mv.style.setProperty("--bg-scale", u / A);
    mv.style.setProperty("--blur", `${(p - A) * 0.005}px`);
  };
  // The original uses lodash throttle 10ms
  const mvScroll = () => {
    const now = performance.now();
    clearTimeout(tail);
    if (now - lastRun >= 10) mvApply(); else tail = setTimeout(mvApply, 10 - (now - lastRun));
  };
  let mvOn = true;
  new IntersectionObserver((es) => es.forEach((e) => (mvOn = e.isIntersecting)), { threshold: 0 }).observe($(".bk-mv-observer"));
  addEventListener("scroll", () => mvOn && mvScroll(), { passive: true });
  addEventListener("resize", mvLayout);

  const mm = gsap.matchMedia();
  const build = () => mm.add({ pc: "(min-width: 768px)", sp: "(max-width: 767px)", reduce: "(prefers-reduced-motion: reduce)" }, (ctx) => {
    const { pc, reduce: rd } = ctx.conditions;
    const H = vh();
    const play = "play none none reverse";
    if (rd) {
      gsap.set(".bk-about__top-inner, .bk-about__object, .bk-visual__type, .bk-visual__contents, .bk-hero__wrapper, .bk-model__hero-in, .bk-model__list-wrap, .bk-msg__item, .bk-feature__typo, .bk-toplayer__contents", { opacity: 1 });
      gsap.set(".bk-toplayer__visual", { scale: 1 });
      return;
    }

    // About
    const top = $(".bk-about__top");
    gsap.to(".bk-about__top-inner", { opacity: 1, scrollTrigger: { toggleActions: play, trigger: top, start: () => `top+=${vh() * 3.5}` } });
    gsap.to(".bk-about__object", { opacity: 1, scrollTrigger: { toggleActions: play, trigger: top, start: () => `top+=${vh() * 3.5}` } });
    const objs = $$(".bk-obj"), topInner = $(".bk-about__top-inner");
    const objMove = () => objs.forEach((o) => (o.style.transform = `translate3d(0, ${-topInner.getBoundingClientRect().top * +o.dataset.speed}px, 0)`));
    addEventListener("scroll", objMove, { passive: true });
    $$(".bk-visual").forEach((r, o) => {
      const img = $(".bk-visual__img", r), typo = $(".bk-visual__type", r), cont = $(".bk-visual__contents", r);
      gsap.set(img, { clearProps: "width" });
      const f = img.offsetWidth;
      ScrollTrigger.create({ trigger: r, start: () => `top+=${vh()}`, end: () => `+=${vh()}`, scrub: true, onUpdate: (d) => { img.style.width = `${f + (document.documentElement.clientWidth - f) * d.progress}px`; } });
      gsap.to(typo, { opacity: 1, scrollTrigger: { toggleActions: play, trigger: r, start: () => `top+=${vh() / 2}`, end: () => `+=${vh()}`, onLeaveBack: () => gsap.to(typo, { opacity: 0 }), onEnterBack: () => gsap.to(typo, { opacity: 1 }), onLeave: () => gsap.to(typo, { opacity: 0 }) } });
      gsap.to(cont, { opacity: 1, scrollTrigger: { toggleActions: play, trigger: r, start: () => `top+=${vh() * 2.5}`, end: () => `+=${vh()}`, onLeaveBack: () => o < 1 && gsap.to(cont, { opacity: 0 }), onEnterBack: () => o < 1 && gsap.to(cont, { opacity: 1 }), onLeave: () => o < 1 && gsap.to(cont, { opacity: 0 }) } });
    });

    // Features
    const feature = $(".bk-feature"), topLayer = $(".bk-toplayer"), tv = $(".bk-toplayer__visual"), tvi = $(".bk-toplayer__photo"), tc = $(".bk-toplayer__contents");
    const points = $$(".bk-point");
    $(".bk-feature__top").style.height = `${H * 2}px`;
    topLayer.style.height = `${H * 4.5}px`;
    let sum = topLayer.clientHeight;
    points.forEach((h) => { const box = $(".bk-point__contents", h), over = Math.max(0, $(".bk-point__box", h).clientHeight - $(".bk-point__pin", h).clientHeight); h.style.height = `${H * 2 + over * 3}px`; h.dataset.over = over; sum += h.clientHeight; });
    $(".bk-feature__wrapper").style.height = `${sum}px`;
    let acc = 0;
    points.forEach((h) => { h.style.top = `${acc + H * 4.5}px`; acc += h.clientHeight; });
    gsap.set(tv, { scale: 0.375 });
    gsap.fromTo(".bk-feature__typo", { opacity: 0 }, { opacity: 1, scrollTrigger: { toggleActions: play, trigger: feature, start: "top 10px", end: `+=${H}`, onLeaveBack: () => invert(true), onEnter: () => invert(false), onEnterBack: () => gsap.set(tv, { scale: 0.375 }), onLeave: () => gsap.set(tv, { scale: 0.375 }) } });
    gsap.to(tv, { scale: 1, ease: "sine.inOut", scrollTrigger: { toggleActions: play, trigger: topLayer, start: `top+=${H * 0.5}`, end: () => `+=${vh() * 1.5}`, scrub: true, onLeaveBack: () => gsap.set(tv, { scale: 0.375 }), onLeave: () => gsap.to(tc, { opacity: 1 }), onEnterBack: () => gsap.to(tc, { opacity: 0 }) } });
    gsap.to(tvi, { top: 50, scale: 0.95, duration: 1, immediateRender: false, scrollTrigger: { toggleActions: play, trigger: $(".bk-point__sticky"), start: `top ${H}`, onEnter: () => gsap.to(tc, { opacity: 0 }), onLeaveBack: () => gsap.to(tc, { opacity: 1 }) } });
    const lines = $$(".bk-feature__progress span");
    points.forEach((h, i) => {
      const box = $(".bk-point__contents", h), inner = $(".bk-point__box", h), over = +h.dataset.over;
      ScrollTrigger.create({ trigger: h, start: `top ${H / 2}`, onEnter: () => { lines.forEach((l) => l.classList.remove("is-active")); lines[i].classList.add("is-active"); }, onLeaveBack: () => { lines.forEach((l) => l.classList.remove("is-active")); lines[Math.max(0, i - 1)].classList.add("is-active"); } });
      gsap.fromTo(box, { opacity: 0 }, { opacity: 1, scrollTrigger: { toggleActions: play, trigger: box, start: `top -${H / 2}`, onEnter: () => box.classList.add("is-active"), onLeaveBack: () => box.classList.remove("is-active") } });
      if (i > 0) gsap.to($(".bk-point__sticky", points[i - 1]), { scale: 0.95, duration: 0, immediateRender: false, ease: "none", scrollTrigger: { toggleActions: play, trigger: h, start: `top ${H / 2}` } });
      gsap.fromTo(inner, { y: 0 }, { y: -over, scrollTrigger: { toggleActions: play, trigger: box, start: `top -${H}`, end: () => `+=${over * 1.5}`, scrub: true } });
    });

    // Leadership, performance record and career headers — switch on with .5s sine.out when they touch 10px from the top
    $$(".bk-lecturer .bk-hero, .bk-record .bk-hero").forEach((hero) => gsap.fromTo($(".bk-hero__wrapper", hero), { opacity: 0 }, { opacity: 1, duration: 0.5, ease: "sine.out", scrollTrigger: { toggleActions: play, trigger: hero, start: "top 10px" } }));

    // Performance record panel 1→3x
    const record = $(".bk-record"), rv = $(".bk-record__visual"), ri = $(".bk-record__inner"), rc = $(".bk-record__contents");
    rv.style.paddingTop = pc ? `${H * 2}px` : "";
    if (pc) {
      gsap.fromTo(ri, { scale: 1 }, { scale: 3, ease: "sine.out", scrollTrigger: { toggleActions: play, trigger: record, start: () => `top+=${parseFloat(rv.style.paddingTop) || 0}px`, end: `+=${H * 2}`, scrub: true, onLeaveBack: () => ri.classList.remove("is-fixed"), onEnter: () => ri.classList.add("is-fixed"), onLeave: () => { gsap.to(rc, { opacity: 1 }); ri.classList.remove("is-fixed"); }, onEnterBack: () => { gsap.to(rc, { opacity: 0 }); ri.classList.add("is-fixed"); } } });
      ScrollTrigger.create({ trigger: ".bk-learning", start: "top 0", onEnter: () => { ri.classList.remove("is-fixed"); gsap.to(rc, { opacity: 0 }); }, onLeaveBack: () => { ri.classList.add("is-fixed"); gsap.to(rc, { opacity: 1 }); } });
    }

    // Learning — next subject on each screen
    const learning = $(".bk-learning");
    flat.forEach((_, k) => ScrollTrigger.create({ trigger: learning, start: `top -${H + k * H}`, end: () => `+=${vh()}`, onEnter: () => setLearning(k), onLeaveBack: () => setLearning(k) }));
    $$(".bk-tab").forEach((b) => (b.onclick = () => {
      const k = +b.dataset.k;
      setLearning(k);
      if (!pc) return;
      const target = learning.getBoundingClientRect().top + scrollY + H + k * H + 1;
      window.bkLenis ? window.bkLenis.scrollTo(target, { immediate: true }) : gsap.to(window, { duration: 0, scrollTo: target });
    }));

    // Career — header fixed, card strip moves sideways, messages appear in turn
    const mc = $(".bk-model__container"), mhero = $(".bk-model__hero"), mIn = $(".bk-model__hero-in"), mWrap = $(".bk-model__list-wrap"), mInner = $(".bk-model__list-in"), mList = $(".bk-model__list");
    const diff = Math.max(0, mList.scrollWidth - mInner.clientWidth);
    if (pc) mc.style.height = `${H * 3 + diff * 2}px`;
    gsap.to(mIn, { opacity: 1, duration: 0.5, ease: "sine.out", scrollTrigger: { toggleActions: play, trigger: mhero, start: "top 10px", end: `bottom ${H}`, onLeave: () => pc && mhero.classList.add("is-fixed"), onEnterBack: () => pc && mhero.classList.remove("is-fixed") } });
    ScrollTrigger.create({ trigger: mc, start: "top 0", end: `bottom ${H}`, onEnterBack: () => { if (pc) { mhero.classList.add("is-fixed"); mhero.classList.remove("is-absolute"); } }, onLeave: () => { if (pc) { mhero.classList.remove("is-fixed"); mhero.classList.add("is-absolute"); } } });
    gsap.to(mWrap, { opacity: 1, duration: 0.5, ease: "sine.out", scrollTrigger: { toggleActions: play, trigger: mhero, start: `top+=${H * (pc ? 1.5 : 0.25)}` } });
    if (pc) gsap.to(mList, { x: -diff, duration: 0.5, ease: "sine.out", scrollTrigger: { toggleActions: play, trigger: mhero, start: `bottom ${H / 2.5}`, end: `+=${diff * 2}`, scrub: true } });
    const msgBox = $(".bk-model__message");
    $$(".bk-msg__item").forEach((v, g) => gsap.to(v, { opacity: 1, duration: 0.5, ease: "sine.out", scrollTrigger: pc ? { toggleActions: play, trigger: msgBox, start: `top -${H + g * H * 0.75}` } : { toggleActions: play, trigger: v, start: `top-=${H / 2}` } }));

    // Footer — contact curtain (1 screen) → School name curtain
    const footer = $(".bk-footer"), fc = $(".bk-footer__contact"), fct = $(".bk-footer__contents");
    ScrollTrigger.create({ trigger: footer, start: "top 10px", end: () => `+=${vh()}`, onLeaveBack: () => fc.classList.remove("is-active"), onEnter: () => fc.classList.add("is-active"), onEnterBack: () => fc.classList.add("is-active"), onLeave: () => fc.classList.remove("is-active") });
    ScrollTrigger.create({ trigger: footer, start: `top+=${H}`, end: "bottom 0", onLeaveBack: () => fct.classList.remove("is-active"), onEnter: () => fct.classList.add("is-active") });

    return () => removeEventListener("scroll", objMove);
  });

  const start = () => {
    mvLayout();
    build();
    ScrollTrigger.refresh();
  };
  // As in the original, .8s after the curtain lifts the Hero frame and text settle down
  document.addEventListener("bk:loaded", () => mv.classList.add("is-loaded"));
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(start); else addEventListener("load", start);
})();
