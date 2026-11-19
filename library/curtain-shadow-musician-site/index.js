/* First page scenes. Values are read from the original bundle (home init). The barba container attaches them via shared.js when it enters (inside gsap.context) and calls the returned teardown when it leaves. */
(() => {
  window.ikPages = window.ikPages || {};
  window.ikPages.home = () => {
  const { reduce } = window.ik;
  const offs = [];
  const listen = (t, type, fn, opt) => { t.addEventListener(type, fn, opt); offs.push(() => t.removeEventListener(type, fn, opt)); };
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp01 = (v) => Math.max(0, Math.min(1, v));
  const smooth = (t) => t * t * (3 - 2 * t);

  /* ── Hero: photo stands up from a tilted grayscale blur, color fills in and the name takes shape ── */
  const fv = $(".home-fv");
  const kv = $(".home-fv__kv");
  const title = $(".home-fv__title");
  const headIn = $(".ik-head__in");
  let visited = true;
  try { visited = !!sessionStorage.getItem(window.ik.VISITED_KEY); } catch {}
  if (!reduce) {
    gsap.set(kv, { x: 10, y: 10, rotation: -2, transformOrigin: "100% 0%", autoAlpha: 0, filter: "blur(30px) saturate(0)" });
    gsap.set(title, { autoAlpha: 0, filter: "blur(12px)", y: -10 });
  }
  const intro = () => {
    if (reduce) return;
    if (!visited) gsap.set(headIn, { autoAlpha: 0, filter: "blur(12px)", y: -10 });
    const tl = gsap.timeline({ delay: 0.2 });
    tl.fromTo(kv, { x: 10, y: 10, rotation: -2 }, { x: 0, y: 0, rotation: 0, duration: 1.2, ease: "power2.out" }, 0);
    tl.to(kv, { autoAlpha: 1, filter: "blur(0px) saturate(0)", duration: 1.2 * 0.7, ease: "power1.out" }, 0);
    tl.addLabel("color", ">+=0.3");
    tl.to(kv, { filter: "blur(0px) saturate(1)", duration: 0.6, ease: "none" }, "color");
    tl.to(title, { autoAlpha: 1, filter: "blur(0px)", y: 0, duration: 0.6, ease: "power1.out" }, "color");
    if (!visited) {
      tl.to(headIn, { autoAlpha: 1, filter: "blur(0px)", y: 0, duration: 0.6, ease: "power1.out", onComplete: () => {
        try { sessionStorage.setItem(window.ik.VISITED_KEY, "1"); } catch {}
        gsap.set(headIn, { clearProps: "filter,y" });
      } }, "color");
    }
    tl.set(kv, { clearProps: "filter" });
  };

  const scenes = () => {
    const mm = gsap.matchMedia();

    mm.add({ isPc: "(min-width: 1025px)", isSp: "(max-width: 1024px)", ok: "(prefers-reduced-motion: no-preference)" }, (c) => {
      const { isPc, ok } = c.conditions;
      if (!ok) return;

      /* The hero fades and blurs, erased from the bottom over 1200px once it scrolls 5% past the top of the screen */
      gsap.timeline({ scrollTrigger: { trigger: fv, start: "top -5%", end: "+=1200", scrub: 0.6, invalidateOnRefresh: true } })
        .fromTo(fv, { maskPosition: "0% 0%", webkitMaskPosition: "0% 0%", filter: "blur(0px)" }, { maskPosition: "0% 100%", webkitMaskPosition: "0% 100%", filter: "blur(20px)", ease: "none" });

      /* Gray veil during the profile */
      gsap.timeline({ scrollTrigger: { trigger: ".home-profile", start: "top 95%", end: "bottom 45%", scrub: 0.5, invalidateOnRefresh: true } })
        .fromTo(".ik-veil", { autoAlpha: 0 }, { autoAlpha: 1, ease: "none", duration: 0.35 })
        .to({}, { duration: 0.4 })
        .to(".ik-veil", { autoAlpha: 0, ease: "none", duration: 0.25 });

      /* Schedule photo: stays fixed while moving to the left end, scaled 692/235 (phone 293/128) */
      const sec = $(".home-schedule");
      const img = $(".home-schedule__img");
      const photo = $(".home-schedule__photo");
      const toLeft = () => Math.round(sec.getBoundingClientRect().left - img.getBoundingClientRect().left);
      if (isPc) {
        gsap.ticker.lagSmoothing(1000, 16);
        gsap.fromTo(photo, { y: 40 }, { y: -28, ease: "none", scrollTrigger: { trigger: img, start: "top bottom", end: "center+=1 center", scrub: 2, invalidateOnRefresh: true } });
        const tl = gsap.timeline({ scrollTrigger: { trigger: img, start: "center+=1 center", end: () => "+=" + innerWidth * 0.8, scrub: 2.2, pin: true, pinType: "transform", pinSpacing: true, anticipatePin: 2, invalidateOnRefresh: true } });
        tl.to({}, { duration: 0.01 }).to({}, { duration: 0.25 });
        tl.to(img, { x: toLeft, scale: 692 / 235, transformOrigin: "left center", ease: "none", duration: 0.5 }, 0.25);
        tl.to({}, { duration: 0.5 });
      } else {
        const tl = gsap.timeline({ scrollTrigger: { trigger: img, start: "center 70%", end: () => "+=" + innerWidth * 1.6, scrub: 1.2, invalidateOnRefresh: true } });
        tl.to(img, { x: toLeft, scale: 293 / 128, transformOrigin: "left center", ease: "none", duration: 0.6 }, 0);
        tl.to({}, { duration: 0.4 });
      }
    });

    /* Project: on PC the list is fixed at 1200px and swaps the section at 330px going forward, 1030px coming back */
    const list = $(".common-projects__list");
    const items = $$(".common-projects__item");
    const setProject = (w) => items.forEach((it, i) => {
      const on = i === w;
      it.classList.toggle("is-active", on);
      it.classList.toggle("is-front", on);
      it.classList.toggle("is-delay", on);
      it.classList.toggle("is-back", !on);
    });
    const PRE = 400, AFTER = 400, POST = 400, OFFSET = 120, HOLD = 350, TOTAL = PRE + AFTER + POST;
    mm.add({ isPc: "(min-width: 1025px)", isSp: "(max-width: 1024px)" }, (c) => {
      const r = list.getBoundingClientRect();
      const base = scrollY + innerHeight / 2 < scrollY + r.top + r.height / 2 ? 0 : 1;
      setProject(base);
      if (c.conditions.isPc) {
        ScrollTrigger.create({
          trigger: list, start: "center center", end: () => "+=" + TOTAL, pin: true, pinSpacing: true,
          pinType: ScrollTrigger.isTouch ? "fixed" : "transform", anticipatePin: 2, invalidateOnRefresh: true,
          onUpdate: (self) => {
            const w = self.scroll() - self.start;
            const L = Math.max(0, Math.min(TOTAL, PRE + AFTER - OFFSET + ((self.direction || 1) === 1 ? -HOLD : HOLD)));
            setProject(w >= L ? (base === 0 ? 1 : 0) : base);
          },
        });
      } else {
        ScrollTrigger.create({ trigger: list, start: "top bottom", end: "bottom top", onUpdate: () => {
          const b = list.getBoundingClientRect();
          setProject(b.top + b.height / 2 > innerHeight / 2 ? 0 : 1);
        } });
      }
      return () => items.forEach((it) => it.classList.remove("is-active", "is-front", "is-back", "is-delay"));
    });

    /* News: tabs + (PC) width carousel / (phone) bigger the closer to the center */
    const news = $(".home-news");
    window.ikTabs(news, { btn: "data-news-tab", panel: "data-news-panel" });
    mm.add({ isPc: "(min-width: 1025px)", isSp: "(max-width: 1024px)" }, (c) => {
      const panels = $$("[data-flex-rotator]", news);
      if (c.conditions.isPc) {
        const timers = [];
        let inView = false;
        const rots = panels.map((panel) => {
          const its = $$(".home-news__item", panel);
          if (its.length < 3) return null;
          const n = its.length;
          const rot = { i: 2, held: false };
          rot.paint = () => its.forEach((it, k) => {
            it.classList.toggle("is-flex5", k === rot.i);
            it.classList.toggle("is-flex4", k === (rot.i - 1 + n) % n);
            it.classList.toggle("is-flex3", k === (rot.i + 1) % n);
          });
          rot.paint();
          its.forEach((it, k) => it.addEventListener("mouseenter", () => { if (!inView) return; rot.held = true; rot.i = k; rot.paint(); }));
          panel.addEventListener("mouseleave", () => { rot.held = false; });
          rot.next = () => { if (!rot.held && inView && panel.classList.contains("is-active")) { rot.i = (rot.i + 1) % n; rot.paint(); } };
          return rot;
        }).filter(Boolean);
        if (!reduce) timers.push(setInterval(() => rots.forEach((r) => r.next()), 3600));
        ScrollTrigger.create({ trigger: news, start: "top bottom", end: "bottom top", onToggle: (self) => { inView = self.isActive; if (!inView) rots.forEach((r) => (r.held = false)); } });
        return () => { timers.forEach(clearInterval); $$(".home-news__item", news).forEach((it) => it.classList.remove("is-flex3", "is-flex4", "is-flex5")); };
      }
      if (reduce) return;
      const paintScale = () => {
        const mid = innerHeight / 2;
        const range = Math.min(innerHeight * 0.65, 520);
        $$(".ik-panel.is-active .home-news__item", news).forEach((it) => {
          const b = it.getBoundingClientRect();
          const s = lerp(0.82, 1, smooth(clamp01(1 - Math.abs(b.top + b.height / 2 - mid) / range)));
          gsap.set(it, { scaleX: s, scaleY: s, transformOrigin: "0 50%", force3D: true });
        });
      };
      ScrollTrigger.create({ trigger: news, start: "top bottom", end: "bottom top", onUpdate: paintScale, onRefresh: paintScale });
      paintScale();
      return () => gsap.set($$(".home-news__item", news), { clearProps: "transform" });
    });

    /* Video: tabs + (PC) thumbnail follows the cursor / (phone) row thumbnail height 36→208px */
    const video = $(".common-video");
    window.ikTabs(video, { btn: "data-video-tab", panel: "data-video-panel" });
    const vst = $(".ik-vstalker");
    const vimg = $(".ik-vstalker__img");
    mm.add({ isPc: "(min-width: 1025px)", isSp: "(max-width: 1024px)" }, (c) => {
      if (c.conditions.isPc) {
        const p = { bx: 0, by: 0, x: 0, y: 0, inArea: false };
        const area = $(".common-video__contents .ik-tabs", video);
        const move = (e) => { p.bx = e.clientX; p.by = e.clientY; };
        // Original Ec(): entering the list board jumps straight to the cursor −40px spot, and only while inside the board does it follow with lerp .16
        const loop = () => {
          if (!p.inArea) return;
          p.x = lerp(p.x, p.bx - 40, 0.16);
          p.y = lerp(p.y, p.by - 40, 0.16);
          vst.style.transform = `translate3d(${p.x}px, ${p.y}px, 0)`;
        };
        addEventListener("pointermove", move, { passive: true });
        const enterArea = (e) => { p.inArea = true; p.x = e.clientX - 40; p.y = e.clientY - 40; vst.style.transform = `translate3d(${p.x}px, ${p.y}px, 0)`; };
        const leaveArea = () => { p.inArea = false; vst.classList.remove("is-active"); };
        area.addEventListener("pointerenter", enterArea);
        area.addEventListener("pointerleave", leaveArea);
        const rows = $$(".common-video__row", video);
        const on = (e) => { vimg.dataset.label = e.currentTarget.dataset.thumb; vst.classList.add("is-active"); };
        const off = () => vst.classList.remove("is-active");
        rows.forEach((r) => { r.addEventListener("pointerenter", on); r.addEventListener("pointerleave", off); });
        gsap.ticker.add(loop);
        return () => {
          removeEventListener("pointermove", move);
          area.removeEventListener("pointerenter", enterArea);
          area.removeEventListener("pointerleave", leaveArea);
          rows.forEach((r) => { r.removeEventListener("pointerenter", on); r.removeEventListener("pointerleave", off); });
          gsap.ticker.remove(loop);
          vst.classList.remove("is-active");
          vst.style.transform = "";
        };
      }
      const paintThumbs = () => {
        const range = (208 * innerWidth / 375) * 1.6;
        const mid = innerHeight / 2;
        $$(".ik-panel.is-active .common-video__img", video).forEach((el) => {
          const b = el.getBoundingClientRect();
          const h = lerp(36, 208, smooth(clamp01(1 - Math.abs(b.top + b.height / 2 - mid) / range)));
          el.style.setProperty("--thumb-h", `${Math.round(h / 2) * 2}px`);
        });
      };
      ScrollTrigger.create({ trigger: video, start: "top bottom+=20%", end: "bottom top", onUpdate: paintThumbs, onRefresh: paintThumbs });
      paintThumbs();
      return () => $$(".common-video__img", video).forEach((el) => el.style.removeProperty("--thumb-h"));
    });

    /* Music: (PC) row hover swaps the large cover / (phone) cover carousel */
    const disco = $(".home-disco");
    const cover = $(".home-disco__image", disco);
    const track = $(".home-disco__track", disco);
    const slides = $$(".home-disco__slide", disco);
    const activePanel = () => $(".home-disco__tab.is-active", disco);
    const setCover = (panel) => {
      const it = $(".home-disco__item.is-active", panel) || $(".home-disco__item", panel);
      if (it) cover.dataset.label = it.dataset.cover;
    };
    let slide = 0;
    const u = () => innerWidth / 375;
    const placeTrack = () => { track.style.transform = `translate3d(${Math.round(-(slide * (277 * u() + 29 * u())) + 20 * u())}px, 0, 0)`; };
    const setSlide = (k) => {
      const panel = activePanel();
      const its = $$(".home-disco__item", panel);
      const n = Math.min(slides.length, its.length);
      slide = ((k % n) + n) % n;
      slides.forEach((s, i) => { s.classList.toggle("is-active", i === slide); s.style.visibility = i < n ? "" : "hidden"; });
      its.forEach((it, i) => it.classList.toggle("is-active", i === slide));
      its.forEach((it, i) => { if (slides[i]) $(".wf-img", slides[i]).dataset.label = it.dataset.cover; });
      setCover(panel);
      placeTrack();
    };
    window.ikTabs(disco, { btn: "data-disco-tab", panel: "data-disco-panel", onChange: (k, panel) => { setCover(panel); if (innerWidth <= 1024) setSlide(0); } });
    disco.addEventListener("pointerover", (e) => {
      if (innerWidth <= 1024) return;
      const it = e.target.closest(".home-disco__item");
      const panel = activePanel();
      if (!it || !panel.contains(it)) return;
      $$(".home-disco__item", panel).forEach((x) => x.classList.toggle("is-active", x === it));
      cover.dataset.label = it.dataset.cover;
    });
    $(".home-disco__next", disco).addEventListener("click", () => setSlide(slide + 1));
    // Original phone carousel: if vertical movement leads, it lets go. Past 24px horizontally it follows the finger. On release, beyond 50px or a leftward flick faster than .35px/ms goes to the next slide (1s expo.out)
    let sx = 0, sy = 0, st = 0, drag = false, follow = false;
    const view = $(".home-disco__view", disco);
    const base = () => -(slide * (277 * u() + 29 * u())) + 20 * u();
    view.style.touchAction = "pan-y";
    listen(view, "touchstart", (e) => {
      if (e.target.closest(".home-disco__next")) return;
      drag = true; follow = false; sx = e.touches[0].clientX; sy = e.touches[0].clientY; st = performance.now();
      track.style.transition = "none";
    }, { passive: true });
    listen(view, "touchmove", (e) => {
      if (!drag) return;
      const dx = e.touches[0].clientX - sx, dy = e.touches[0].clientY - sy;
      if (!follow && Math.abs(dy) > Math.abs(dx)) { drag = false; track.style.transition = ""; placeTrack(); return; }
      if (Math.abs(dx) > 24) follow = true;
      if (follow) track.style.transform = `translate3d(${Math.round(base() + dx)}px, 0, 0)`;
    }, { passive: true });
    listen(view, "touchend", (e) => {
      if (!drag) return;
      drag = false;
      const dx = e.changedTouches[0].clientX - sx;
      const v = Math.abs(dx) / Math.max(1, performance.now() - st);
      track.style.transition = "";
      if ((Math.abs(dx) > 50 || v > 0.35) && dx < 0) setSlide(slide + 1); else placeTrack();
    }, { passive: true });
    listen(window, "resize", placeTrack, { passive: true });
    setSlide(0);

    window.ikStalker(".js-stalker-area", "View");
  };

  scenes();
  intro();
  return () => offs.forEach((f) => f());
  };
})();
