/* Home — loader, Hero photo fade and fixed copy, company·business entrance, on the product stage the careers panel opens and grows, notification tab */
(() => {
  const $ = (s, p = document) => p.querySelector(s);
  const $$ = (s, p = document) => [...p.querySelectorAll(s)];
  const body = document.body;
  const sp = () => matchMedia("(max-width: 767px)").matches;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  $$("[data-btn]").forEach((el) => { const [l, h, c] = el.dataset.btn.split("|"); el.outerHTML = window.miBtn(l, h, c || ""); });
  $$('[data-iso="town"]').forEach((svg) => miIso.town(svg, { cols: 16, rows: 16 }));
  $$('[data-iso="building"]').forEach((svg) => miIso.building(svg));

  // Notification tabs — one list per tab
  const ARW = '<svg viewBox="0 0 8 12" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M1 1l5 5-5 5"/></svg>';
  const CATS = ["Hiring related", "Notice", "Service", "Hiring related", "Competitions·Contests", "Others"];
  const area = $(".mi-tabarea");
  if (area) {
    area.innerHTML = CATS.map((cat, t) => '<ul class="mi-newslist' + (t ? "" : " is-on") + '"' + (t ? " hidden" : "") + ">" +
      [0, 1, 2].map((i) => '<li><a href="news.html"><time>0000.00.00</time><span class="cat">' + (t ? cat : CATS[i % 2 ? 1 : 0]) + '</span><span class="ttl">Your one-line news title goes here' + (i ? "" : " — A little longer") + "</span>" + ARW + '<span class="line"><i></i></span></a></li>').join("") + "</ul>").join("");
    const tabs = $$(".mi-tabs li"), lists = $$(".mi-newslist", area);
    tabs.forEach((tab, i) => {
      const go = () => {
        tabs.forEach((t) => t.classList.toggle("is-on", t === tab));
        lists.forEach((l, j) => { l.hidden = j !== i; l.classList.toggle("is-on", j === i); });
        if (!reduce) gsap.fromTo(lists[i].children, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.05, ease: "power2.out" });
      };
      tab.addEventListener("click", go);
      tab.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } });
    });
  }

  // White fragment flowing between Security+One
  const blocks = $(".topSecurity-blocks");
  if (blocks) {
    const rows = [[8, 22, 260, 40], [16, 64, 180, 24], [28, 4, 320, 46], [40, 70, 220, 30], [58, 12, 280, 36], [70, 60, 200, 22], [82, 28, 340, 44], [92, 74, 160, 26]];
    blocks.innerHTML = rows.map(([t, l, w, h], i) => '<i data-dir="' + (i % 2 ? -1 : 1) + '" style="top:' + t + "%;left:" + l + "%;--w:" + w + "px;--h:" + h + 'px"></i>').join("");
  }

  // Loading: the logo floats up on a white plate, after at least 2 seconds blurs out over .6s, then the plate lifts away over .4s (once per session)
  const loader = $(".js-top-loader");
  const markIntroDone = () => body.classList.add("is-mv-intro-done");
  const unlock = () => {
    body.classList.remove("is-top-loading");
    body.classList.add("is-top-loaded");
    window.miLock(false);
    const last = $(".topMv-layer.is-light .is-line3 > span");
    if (!last || reduce) { markIntroDone(); return; }
    last.addEventListener("animationend", markIntroDone, { once: true });
    setTimeout(markIntroDone, 2000);
  };
  if (loader) {
    let seen = false;
    try { seen = sessionStorage.getItem("miLoaderSeen") === "1"; } catch (e) {}
    if (seen || reduce) { loader.remove(); unlock(); }
    else {
      try { sessionStorage.setItem("miLoaderSeen", "1"); } catch (e) {}
      window.miLock(true);
      const wait = (ms) => new Promise((r) => setTimeout(r, ms));
      const firstImg = $(".topMv-slider img");
      (async () => {
        if (document.fonts) await document.fonts.ready.catch(() => {});
        requestAnimationFrame(() => loader.classList.add("is-in"));
        await Promise.all([wait(2000), firstImg && !firstImg.complete ? new Promise((r) => firstImg.addEventListener("load", r, { once: true })) : null]);
        loader.classList.add("is-out");
        await wait(600);
        loader.classList.add("is-done");
        await wait(400);
        unlock();
        loader.remove();
      })();
    }
  } else unlock();

  // Hero photos: 7s fade interval, 2s transition
  const mv = $(".topMv-slider");
  if (mv && window.Splide) new Splide(mv, { type: "fade", rewind: true, autoplay: !reduce, arrows: false, pagination: false, interval: 7000, speed: 2000, pauseOnHover: false, pauseOnFocus: false }).mount();

  // Recruitment photo two rows: endless vertical (left +.5, right −.5), phone is horizontal
  const recruitSplides = [];
  const base = { type: "loop", direction: "ttb", height: "100%", fixedHeight: "clamp(170px, 13.125vw, 310px)", drag: false, arrows: false, pagination: false, gap: 20,
    autoScroll: { autoStart: false, pauseOnHover: false, pauseOnFocus: false, rewind: false },
    breakpoints: { 767: { direction: "ltr", height: "auto", fixedHeight: "", autoWidth: true, gap: 12 } } };
  [[".topRecruit-slider.is-left", 0.5], [".topRecruit-slider.is-right", -0.5]].forEach(([sel, speed]) => {
    const el = $(sel);
    if (!el || !window.Splide) return;
    const s = new Splide(el, { ...base, autoScroll: { ...base.autoScroll, speed } }).mount(window.splide && window.splide.Extensions ? window.splide.Extensions : {});
    s.Components.AutoScroll && s.Components.AutoScroll.pause();
    recruitSplides.push(s);
  });
  const playRecruit = (on) => recruitSplides.forEach((s) => s.Components.AutoScroll && (on ? s.Components.AutoScroll.play() : s.Components.AutoScroll.pause()));

  // Badge over the hiring panel: follows the mouse at .12 per step
  const sec = $(".topRecruit"), st = $(".topRecruit__stalker");
  if (sec && st && !reduce && matchMedia("(hover: hover)").matches) {
    let tx = 0, ty = 0, cx = 0, cy = 0, on = false;
    const target = (e) => { const r = sec.getBoundingClientRect(); tx = (e.clientX - r.left) / (r.width / sec.offsetWidth); ty = (e.clientY - r.top) / (r.height / sec.offsetHeight); };
    const loop = () => { if (on) { cx += (tx - cx) * 0.12; cy += (ty - cy) * 0.12; st.style.transform = "translate(" + cx + "px, " + cy + "px) translate(-50%, -50%)"; } requestAnimationFrame(loop); };
    sec.addEventListener("mouseenter", (e) => { target(e); cx = tx; cy = ty; on = true; st.classList.add("is-active"); });
    sec.addEventListener("mousemove", target);
    sec.addEventListener("mouseleave", () => { on = false; st.classList.remove("is-active"); });
    requestAnimationFrame(loop);
  }

  const mm = gsap.matchMedia();
  mm.add({ motion: "(prefers-reduced-motion: no-preference)", still: "(prefers-reduced-motion: reduce)", pc: "(min-width: 768px)" }, (ctx) => {
    const { motion, pc } = ctx.conditions;
    document.documentElement.classList.toggle("is-still", !motion);
    if (!motion) { playRecruit(true); return; }

    // Copy pinned: it stays stuck over the photo, then flows along once the company title touches 40px below the copy. At the photo’s bottom edge the text splits into white and dark ink.
    const topMv = $(".topMv"), inner = $(".topMv-txtBox-inner"), coTtl = $(".topCompany-ttl"), slider = $(".topMv-slider");
    const light = $(".topMv-layer.is-light", inner);
    const split = () => {
      const edge = slider.getBoundingClientRect().bottom;
      const r = light.getBoundingClientRect();
      inner.style.setProperty("--mv-mask-split", Math.min(100, Math.max(0, ((edge - r.top) / r.height) * 100)) + "%");
    };
    const innerBottom = () => $(".topMv-txtBox").offsetTop + inner.offsetTop + inner.offsetHeight;
    ScrollTrigger.create({
      trigger: topMv, start: "top top", endTrigger: coTtl, end: () => "top " + (innerBottom() + (pc ? 40 : (210 / 375) * innerWidth)),
      pin: inner, pinSpacing: false, anticipatePin: 1, invalidateOnRefresh: true,
      onUpdate: split, onRefresh: split, onLeave: () => inner.style.setProperty("--mv-mask-split", "0%"), onEnterBack: split,
    });

    // About: title lines from 40px below in .7s (.15s stagger), image from 60px right in .8s, text from 32px below in 1.1s (screen 82·75·70%)
    gsap.from(".topCompany-ttlLine", { y: 40, autoAlpha: 0, duration: 0.7, stagger: 0.15, ease: "power2.out", scrollTrigger: { trigger: ".topCompany-ttl", start: "top 94%" } });
    gsap.from(".topCompany-illust", { x: pc ? 60 : 40, autoAlpha: 0, duration: 0.8, ease: "power2.out", scrollTrigger: { trigger: ".topCompany-ttl", start: "top 94%" } });
    $$(".topCompany-p").forEach((p, i) => gsap.from(p, { y: 32, autoAlpha: 0, duration: 1.1, ease: "power2.out", scrollTrigger: { trigger: p, start: "top " + [82, 75, 70][i] + "%" } }));
    gsap.from(".topCompany-txt .mi-btn", { y: 32, autoAlpha: 0, duration: 1.1, ease: "power2.out", scrollTrigger: { trigger: ".topCompany-txt .mi-btn", start: "top 65%" } });
    gsap.fromTo(".co-line path", { strokeDasharray: 400, strokeDashoffset: 400 }, { strokeDashoffset: 0, ease: "none", stagger: 0.12, scrollTrigger: { trigger: ".topCompany", start: "bottom 95%", end: "top 80%", scrub: 0.6 } });

    // Business: the panel enters from off the right edge, the yellow band follows, then the title and text
    const tl = gsap.timeline({ scrollTrigger: { trigger: ".topService", start: "top 70%" } });
    tl.from(".topService-panel", { x: "100vw", duration: 0.8, ease: "power2.out" })
      .from(".topService-band", { xPercent: 100, duration: 0.6, ease: "power2.out" }, 0.15)
      .from(".topService-head > *", { y: 36, autoAlpha: 0, duration: 0.55, stagger: 0.05, ease: "power1.out" }, 0.35)
      .from(".topService-aside > *", { x: -48, autoAlpha: 0, duration: 0.55, stagger: 0.12, ease: "power2.out" }, 0.45)
      .from(".topService-visual", { x: 60, autoAlpha: 0, duration: 0.8, ease: "power2.out" }, 0.3);

    // Product → Careers: the vertical gap in the center opens over .2, grows from .2→1 over .65, and once past .9x the large text blurs
    const recruit = $(".topRecruit");
    if (pc && recruit) {
      gsap.set(recruit, { scale: 0.2, clipPath: "polygon(50% 0%, 50% 0%, 50% 100%, 50% 100%)" });
      const sTl = gsap.timeline({ scrollTrigger: { trigger: ".topSecRec", start: "top top", end: "bottom bottom", scrub: 0.6,
        onUpdate: (s) => playRecruit(s.progress > 0.95), onLeave: () => playRecruit(true) } });
      sTl.to({}, { duration: 0.15 })
        .to(recruit, { clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)", duration: 0.2, ease: "none" }, 0.15)
        .to(recruit, { scale: 1, duration: 0.65, ease: "none" }, 0.35)
        .to(".topSecurity-word", { autoAlpha: 0, duration: 0.65 * 0.1 / 0.8, ease: "none" }, 0.35 + 0.65 * (0.7 / 0.8))
        .to({}, { duration: 0.15 });
      $$(".topSecurity-blocks i").forEach((b, i) => gsap.fromTo(b, { xPercent: -60 * +b.dataset.dir }, { xPercent: 60 * +b.dataset.dir, ease: "none", scrollTrigger: { trigger: ".topSecRec", start: "top bottom", end: "bottom top", scrub: 0.6 } }));
      return () => gsap.set(recruit, { clearProps: "transform,clipPath" });
    }
    playRecruit(true);
  });

  // Notification header .55s at .05s intervals, list .8s from 40px below (.3s intervals)
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    gsap.from(".topNews-head > *", { y: 36, autoAlpha: 0, duration: 0.55, stagger: 0.05, ease: "power1.out", scrollTrigger: { trigger: ".topNews", start: "top 80%" } });
    gsap.from([".topNews-main", ".topNews-pick"], { y: 40, autoAlpha: 0, duration: 0.8, stagger: 0.3, ease: "power2.out", scrollTrigger: { trigger: ".topNews-box", start: "top 70%" } });
  });
  addEventListener("load", () => ScrollTrigger.refresh());
})();
