// First page: hanging-scroll opening (original index.js scroll distance formula carried over as is) → cloud curtain → video hero → gallery horizontal flow → SNS marquee
(() => {
  gsap.registerPlugin(ScrollTrigger);
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const op = $(".op");
  const isPC = () => innerWidth > 768;

  // ── Image fill ──
  $(".op__makimono__body__image").innerHTML = ART.roller();
  $(".op__makimono__image__frame").innerHTML = ART.frame();
  $$("[data-art]").forEach((el) => { el.innerHTML = ART[el.dataset.art](); });
  $(".sc__logo__mark").innerHTML = TNM.mark();
  $(".hero__logo").innerHTML = TNM.logo();
  $$("[data-diamond]").forEach((el) => { el.innerHTML = TNM.diamond(el.dataset.diamond); });

  // Top and bottom border cloud and wave bands (across the whole scroll painting)
  ["_top", "_bottom"].forEach((side, s) => {
    const band = $(".op__band." + side);
    for (let i = 0; i < 9; i++) {
      const el = document.createElement("div");
      const w = 520 + ((i * 137) % 260);
      el.style.cssText = `right:${(i * 620 + (s ? 300 : 0)) * 100 / 1280}vw;width:${w * 100 / 1280}vw;${s ? "bottom:0" : "top:0"};${s ? "" : "transform:scaleY(-1)"}`;
      el.innerHTML = TNM.cloud({ w: 600, h: 260, seed: 40 + i + s * 20, lobes: 8, curls: 3, tail: i % 2 ? 3 : 0 });
      band.append(el);
      const st = document.createElement("div");
      st.style.cssText = `right:${(i * 620 + 360 + (s ? 0 : 200)) * 100 / 1280}vw;width:${360 * 100 / 1280}vw;${s ? "bottom:6vh" : "top:6vh"};opacity:.75`;
      st.innerHTML = TNM.streaks({ w: 600, h: 120, n: 10, seed: 70 + i + s * 10 });
      band.append(st);
    }
  });

  // Seven storm clouds inside the unfolded frame — original op__story__cloud positions (492×324 frame basis)
  const STORY_CLOUDS = [
    { w: 327.5, top: 44.7, left: 77, seed: 1 },
    null,
    { w: 328, top: -20.6, left: 137.3, seed: 3 },
    { w: 254, top: 81, left: -68, seed: 4 },
    { w: 497, bottom: -112, left: -18, seed: 5 },
    { w: 552, bottom: -47, left: -15, seed: 6 },
    { w: 552, top: -114, left: 7, seed: 7 },
  ];
  const cw = $(".op__story__cloud__wrap");
  STORY_CLOUDS.forEach((c, i) => {
    if (!c) return;
    const el = document.createElement("div");
    el.className = "op__story__cloud _0" + (i + 1);
    el.style.width = (c.w / 492) * 100 + "%";
    if (c.top != null) el.style.top = (c.top / 324) * 100 + "%";
    if (c.bottom != null) el.style.bottom = (c.bottom / 324) * 100 + "%";
    el.style.left = (c.left / 492) * 100 + "%";
    el.style.zIndex = 10 - i;
    el.innerHTML = TNM.cloud({ w: 500, h: 360, seed: c.seed * 11, lobes: 8, curls: 4, tail: i % 2 ? 2 : 0 });
    cw.append(el);
  });

  // Hero edge cloud veil
  const heroMask = $(".hero-mask");
  const HM = TNM.MASK.slice(0, 8);
  TNM.placeClouds(heroMask, HM, "hm");
  // On exit, it leaves the screen completely on the side opposite to where it came in (chunks that entered from top or bottom exit up or down)
  const HM_OUT_Y = [0, 0, 0, 0, 90, 0, -60, 0];

  // Hero edge clouds (original hero__cloud spot)
  const HC = [
    { h: 340, top: -117.6, right: -105.9 }, { h: 372, top: -11, right: -38 }, { h: 291, bottom: -35, right: -26 },
    { h: 282, bottom: -150.7, right: -17.6 }, { h: 662, top: -316.4, left: -49.5 }, { h: 218, bottom: 59, left: -29 }, { h: 336, bottom: -167.9, left: -39.2 },
  ];
  const hc = $(".hero__clouds");
  HC.forEach((c, i) => {
    const el = document.createElement("div");
    el.style.height = (c.h / 800) * 100 * (isPC() ? 1 : 0.45) + "%";
    ["top", "bottom"].forEach((k) => c[k] != null && (el.style[k] = (c[k] / 800) * 100 + "%"));
    ["left", "right"].forEach((k) => c[k] != null && (el.style[k] = (c[k] / 1280) * 100 + "%"));
    el.innerHTML = TNM.cloud({ w: 520, h: 360, seed: 90 + i, lobes: 8, curls: 4, tail: i % 2 ? 2 : 0 });
    hc.append(el);
  });

  ["_01", "_02"].forEach((k, i) => { $(".news__obj." + k).innerHTML = TNM.cloud({ w: 420, h: 300, seed: 120 + i, lobes: 7, curls: 3, tail: 2 }); });

  const loop = $(".insta__group");
  const clone = loop.cloneNode(true);
  clone.classList.add("_clone");
  clone.setAttribute("aria-hidden", "true");
  loop.parentNode.append(clone);

  // ── Skip button for returning visitors (the original checks a cookie to detect a same-day revisit) ──
  const today = new Date().toISOString().slice(0, 10);
  try {
    if (localStorage.getItem("tnm-access") === today) op.classList.add("is-revisit");
    localStorage.setItem("tnm-access", today);
  } catch (e) {}

  const mm = gsap.matchMedia();
  const reduce = "(prefers-reduced-motion: reduce)";

  // ── Gallery fade slider — same Swiper 11.2.10 and same options as the original (fade 1.2s, 5s autoplay, clickable pagination) ──
  const still = matchMedia(reduce).matches;
  new Swiper(".gallery_swiper", {
    effect: "fade", loop: true, speed: still ? 0 : 1200,
    autoplay: still ? false : { delay: 5000, disableOnInteraction: false },
    pagination: { el: ".gallery_swiper-pagination", clickable: true },
  });

  const onLoad = () => {
    // Original: .8s after window load the loading curtain lifts (shared.js), and at 1s the hanging scroll banner drops while SCROLL · badge fade in over 400ms
    setTimeout(() => op.classList.add("loaded", "is-ready"), 1000);
  };
  if (document.readyState === "complete") onLoad(); else addEventListener("load", onLoad);

  // Roof mark on badge: follows the badge text color (white for dark badges)
  $$(".t-badge").forEach((b) => b.insertAdjacentHTML("afterbegin", `<span class="t-badge__mark">${TNM.mark()}</span>`));

  // Skip button · now-open badge: moved right below the hero while the cloud cover is covering
  const skip = () => {
    TNM.cloudCover(() => {
      const y = $("#hero").getBoundingClientRect().top + scrollY + innerHeight * (isPC() ? 1 : 0.75);
      (TNM.lenis ? TNM.lenis.scrollTo(y, { immediate: true }) : scrollTo(0, y));
    });
  };
  $$(".op__skip, .js-skip").forEach((b) => b.addEventListener("click", skip));

  // ── Opening: original formula ──
  const build = (pc) => {
    const H = innerHeight;
    const W = innerWidth;
    const strip = $(".op__story__strip");
    const openT = H;
    const kakuStart = openT;
    const kakuT = H * 3.4;
    const startPt = kakuStart + kakuT + H * 1.5;
    const objT = H * 0.75;
    const moveStart = startPt - (H - 292) / 2 + H * 1.2;
    const moveDist = pc ? strip.clientWidth - W : 0;
    const endBuf = pc ? H * 1.5 : 0;
    const stepD = H * 2, stepI = H;
    const pinLen = pc ? moveStart + moveDist + (H - 292) / 2 + endBuf : startPt + stepD * 6 + stepI * 6 + stepD + endBuf;

    const tl = gsap.timeline({ defaults: { ease: "none" }, paused: true });
    const at = (target, vars, start, dur) => tl.to(target, { ...vars, duration: Math.max(dur, 0.001) }, start);
    const marks = [];

    // Expand: axis sprite steps(7), frame 0→518px, window 0→460px
    tl.to(".op__makimono__body__image", { left: "-700%", ease: "steps(7)", duration: openT }, 0);
    if (pc) at(".op__makimono__body", { x: "-5%" }, 0, openT);
    else at(".op__makimono__body", { x: "-5%", y: "-50%" }, 0, openT);
    at(".op__makimono__wrap", { width: pc ? 518 : 518 * 0.7 }, 0, openT);
    at(".op__story__wrap", { width: pc ? 460 : 460 * 0.7 }, 0, openT);

    // Zoom: if the screen ratio is wider than 460/292, width-based (130vw, 100vw), if narrower, height-based (123.4vh, 100vh)
    const wide = W / H > 460 / 292;
    if (wide) {
      at(".op__makimono__wrap", { width: W * 1.3 }, kakuStart, kakuT);
      at(".op__story__wrap", { width: W }, kakuStart, H * 2.8);
    } else {
      at(".op__makimono__wrap", { height: H * 1.234261 }, kakuStart, kakuT);
      at(".op__story__wrap", { height: H }, kakuStart, H * 3.2);
    }
    marks.push({ at: kakuStart, on: () => $$(".op__makimono__wrap, .op__story__wrap").forEach((e) => e.classList.add(wide ? "magnification_w" : "magnification_h")),
      off: () => $$(".op__makimono__wrap, .op__story__wrap").forEach((e) => e.classList.remove("magnification_w", "magnification_h")) });

    // Dark clouds split + 6px blur + fade out
    const cs = pc ? { s: openT, d: kakuT * 2.4 } : { s: H * 2, d: H * 3.5 };
    const CM = pc
      ? { "._01": { x: W * 1.1 }, "._03": { x: -W * 1.5 }, "._04": { x: -W * 0.4 }, "._05": { x: W * 0.2, y: H * 0.55 }, "._06": { x: -W * 0.2, y: H * 0.72 }, "._07": { y: -H * 0.65 } }
      : { "._01": { x: -W * 1.75 }, "._03": { x: W * 1.5 }, "._04": { x: -W * 0.4 }, "._05": { x: W * 0.2, y: H * 0.25 }, "._06": { x: -W * 0.2, y: H * 0.32 }, "._07": { y: -H * 0.35 } };
    Object.entries(CM).forEach(([k, v]) => at(".op__story__cloud" + k, v, cs.s, cs.d));
    at(".op__story__cloud__wrap", { filter: `blur(${pc ? 6 : 4}px)`, opacity: 0 }, openT * 1.7, kakuT);

    const first = $(".op__story__first_txt_wrap");
    marks.push({ at: openT + kakuT * 0.6, on: () => first.classList.add("show"), off: () => first.classList.remove("show") });
    marks.push({ at: startPt, on: () => first.classList.remove("show"), off: () => first.classList.add("show") });

    const scenes = $$(".sc");
    if (pc) {
      // The scroll picture flows to the right (the background follows by 100vw), and in each scene the art settles into place from x and y
      at(".op__story__contents__inner", { x: moveDist }, moveStart, moveDist);
      at(".op__story__wrap__bg__inner", { x: W }, moveStart, moveDist);
      const sceneStart = (sc) => {
        const r = parseFloat(sc.style.getPropertyValue("--r")) * (W / 1280);
        return r < W * 0.5 ? startPt : moveStart + Math.max(0, r - W * 0.55);
      };
      scenes.forEach((sc) => {
        const s0 = sceneStart(sc);
        $$(".sc__obj", sc).forEach((o, i) => {
          const [fx, fy] = (o.dataset.from || "0,6").split(",").map(Number);
          gsap.set(o, { xPercent: 50 + fx * 6, yPercent: fy * 6 });
          at(o, { opacity: 1, xPercent: 50, yPercent: 0 }, s0 + i * H * 0.08, objT);
        });
        $$(".sc__txt", sc).forEach((t, i) => marks.push({ at: s0 + H * (0.15 + i * 0.6), on: () => t.classList.add("show"), off: () => t.classList.remove("show") }));
        if (sc.classList.contains("sc--title")) marks.push({ at: s0 + H * 0.3, on: () => sc.classList.add("active"), off: () => sc.classList.remove("active") });
      });
      const logo = $(".sc--logo");
      marks.push({ at: moveStart + moveDist + (H - 292) / 2 - H * 0.3, on: () => logo.classList.add("show"), off: () => logo.classList.remove("show") });
    } else {
      // Phone: within one screen, step1~7 each turn on for 2H and rest 1H as they change, background moves up 200vh
      at(".op__story__wrap__bg__inner", { y: -2 * H }, startPt, stepD * 7 + stepI * 6);
      scenes.forEach((sc, i) => {
        const s = startPt + (stepD + stepI) * i;
        $$(".sc__obj", sc).forEach((o) => gsap.set(o, { opacity: 1 }));
        marks.push({ at: s, on: () => { sc.classList.add("is-step"); $$(".sc__txt", sc).forEach((t) => t.classList.add("show")); sc.classList.add("active", "show"); },
          off: () => { sc.classList.remove("is-step", "active", "show"); $$(".sc__txt", sc).forEach((t) => t.classList.remove("show")); } });
        if (i < scenes.length - 1) marks.push({ at: s + stepD, on: () => sc.classList.remove("is-step"), off: () => sc.classList.add("is-step") });
      });
    }
    tl.set({}, {}, pinLen);

    // Display switches: turned on and off only while the scroll position passes (the original’s toggleClass calls)
    marks.sort((a, b) => a.at - b.at);
    let lastY = 0;
    const flip = (y) => {
      if (y >= lastY) marks.forEach((m) => { if (lastY < m.at && y >= m.at) m.on(); });
      else [...marks].reverse().forEach((m) => { if (lastY >= m.at && y < m.at) m.off(); });
      lastY = y;
    };

    const pinST = ScrollTrigger.create({
      trigger: ".op__trigger",
      start: "top top",
      end: "+=" + pinLen,
      pin: true,
      anticipatePin: 0.2,
      scrub: true,
      animation: tl,
      onUpdate: (self) => {
        const y = self.progress * pinLen;
        flip(y);
        op.classList.toggle("is-past", y > H);
      },
    });

    // Cloud curtain: while covering, the opening fades out, while parting, the body is revealed
    const hmStart = pinLen - (pc ? H * 0.75 : H);
    const hmDist = H * 0.75;
    const objs = $$(".hm", heroMask);
    gsap.set("#l_wrapper", { opacity: 0 });
    const mt = gsap.timeline({ paused: true, defaults: { ease: "none" } });
    mt.to(".op", { opacity: 0, duration: hmDist }, 0);
    objs.forEach((o, i) => {
      const fromPct = parseFloat((o.style.transform.match(/translate\((-?[\d.]+)%/) || [0, 0])[1]);
      const r = o.getBoundingClientRect();
      const inLeft = r.left - (fromPct / 100) * r.width;
      const outX = HM_OUT_Y[i] ? 0 : fromPct > 0 ? -(inLeft + r.width) - 40 : W - inLeft + 40;
      mt.to(o, { opacity: 1, x: 0, y: 0, xPercent: 0, yPercent: 0, duration: hmDist }, 0);
      mt.to(o, { x: outX, yPercent: HM_OUT_Y[i], duration: hmDist }, hmDist + H * 0.25);
    });
    mt.to("#l_wrapper", { opacity: 1, duration: hmDist / 2 }, hmDist + H * 0.25);
    mt.to(".t-book", { opacity: 1, duration: hmDist / 2 }, hmDist + H * 0.25);
    ScrollTrigger.create({ start: hmStart, end: hmStart + hmDist * 2 + H * 0.25, scrub: true, animation: mt });

    // Hero fixed at 1H (on phones the whole body fixed at 0.75H)
    ScrollTrigger.create({ trigger: pc ? "#hero" : "#l_wrapper", start: "top top", end: "+=" + (pc ? H : H * 0.75), pin: true, anticipatePin: 0.2 });

    // The hamburger appears only after passing the hero
    const hbg = $(".t-hbg");
    ScrollTrigger.create({ trigger: "#hero", start: () => "top+=" + H + " top", onToggle: (self) => hbg.classList.toggle("is-hidden", !self.isActive), end: "max" });

    return () => { pinST.kill(); };
  };

  mm.add({ pc: "(min-width: 769px)", sp: "(max-width: 768px)", reduce }, (ctx) => {
    const { pc, reduce: r } = ctx.conditions;
    // In the original the PC reserve button sits inside the body (main#l_wrapper) — while the body is faint (opening) it is trapped in that stacking context and lies beneath the opening panel (z 50), and floats above once fully visible
    const book = $(".t-book");
    if (book) (pc ? $("#l_wrapper") : document.body).prepend(book);
    gsap.set(".t-book", { opacity: 0 });
    if (r) {
      // Reduced motion: skip the opening and show the body first
      op.style.display = "none";
      heroMask.style.display = "none";
      gsap.set("#l_wrapper, .t-book", { opacity: 1 });
      $(".t-hbg").classList.remove("is-hidden");
      return;
    }
    build(pc);

    if (pc) {
      // Gallery: pinned, moves horizontally — scroll twice the travel distance
      const track = $(".gallery__track");
      const pin = $(".gallery__pin");
      const dist = () => track.scrollWidth - pin.clientWidth;
      gsap.to(track, {
        x: () => -dist(),
        ease: "none",
        scrollTrigger: { trigger: pin, start: "top top", end: () => "+=" + dist() * 2, pin: true, scrub: true, anticipatePin: 0.2, invalidateOnRefresh: true },
      });
    }
    // SNS photo row: one loop per 60s
    gsap.to(".insta__loop__wrap", { xPercent: -100, duration: pc ? 60 : 40, repeat: -1, ease: "none" });
  });

  addEventListener("load", () => ScrollTrigger.refresh());
})();
