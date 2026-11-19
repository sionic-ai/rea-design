// Home page: window opening · cloud parallax · runway diagram repeat · number panel · rotating map and five zone cards.
// Original values: opening video starts on loadeddata · after .5s (delay 1s) plays +.2s → 4s later overlay, window and symbol 3s Cubic.easeOut, video scale .5 3s Cubic.easeInOut, curtain 2s fade
//            cloud scrub 1/.9/1.2/1.4 · airport photo scale 1→1.03 scrub 1.5 · Hero background y -5% scrub .6
//            runway repeat repeatDelay 1 · number panel .5s intervals .1/.4/.1/.1 · map scrub .3 · card .3s, cover mask 2s (delay .3)
(() => {
  SO.pages.home = (root) => {
  const { reduced, windowPath } = SO;
  const doc = document.documentElement;
  doc.style.setProperty("--so-window", SO.windowMask);
  // The window frame is a css image URL (data:) so it can’t read var() — skin variables are resolved to real colors and inserted
  const fc = [1, 2, 3, 4, 5].map((n) => SO.color(`--site-frame-${n}`));
  const frame = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='-30 -30 339 393'><defs><linearGradient id='s' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='${fc[0]}'/><stop offset='.6' stop-color='${fc[1]}'/><stop offset='1' stop-color='${fc[2]}'/></linearGradient></defs><path d='${windowPath}' fill='url(#s)' stroke='${fc[3]}' stroke-width='40'/><path d='${windowPath}' fill='none' stroke='${fc[4]}' stroke-width='3'/></svg>`;
  doc.style.setProperty("--so-window-frame", `url("data:image/svg+xml,${encodeURIComponent(frame)}")`);

  // Clouds: four each, as layers of blurry white circles. Upper clouds stack downward and lower clouds hang down from above
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  root.querySelectorAll("[data-clouds]").forEach((box) => {
    const top = box.dataset.clouds === "top";
    let html = "";
    for (let layer = 0; layer < 4; layer++) {
      let puffs = "";
      for (let i = 0; i < 16; i++) {
        const x = rnd() * 1300 - 50;
        const base = top ? 497 - rnd() * (140 + layer * 60) : rnd() * (140 + layer * 60);
        const r = 60 + rnd() * 110;
        puffs += `<circle cx="${x.toFixed(0)}" cy="${base.toFixed(0)}" r="${r.toFixed(0)}" fill-opacity="${(0.55 + rnd() * 0.45).toFixed(2)}" style="fill: var(--site-white)"/>`;
      }
      const band = top ? `<rect x="-100" y="420" width="1400" height="120" style="fill: var(--site-white)"/>` : `<rect x="-100" y="-40" width="1400" height="110" style="fill: var(--site-white)"/>`;
      html += `<svg viewBox="0 0 1200 497" preserveAspectRatio="none" aria-hidden="true"><defs><filter id="cb${box.dataset.clouds}${layer}" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="${14 + layer * 4}"/></filter></defs><g filter="url(#cb${box.dataset.clouds}${layer})" opacity="${1 - layer * 0.12}">${puffs}${band}</g></svg>`;
    }
    box.innerHTML = html;
  });

  const isDt = () => !matchMedia("(max-width: 768px)").matches;
  const vw = () => document.documentElement.clientWidth;
  const markEl = root.querySelector(".fv__main .mark");
  const opening = root.querySelector(".opening");
  const seen = sessionStorage.getItem("so-opening") === "1";

  // Opening — keep only one video that fits the width, and play the timeline when that video fires loadeddata (same as the original)
  const startOpening = () => {
    sessionStorage.setItem("so-opening", "1");
    const dt = isDt();
    const videos = [...opening.querySelectorAll("video")];
    videos.filter((v) => v.classList.contains(dt ? "so-mb-only" : "so-dt-only")).forEach((v) => v.remove());
    const video = opening.querySelector("video");
    const mask = opening.querySelector(".mask");
    const windows = opening.querySelector(".windows");
    const b = dt ? (vw() / 100) * 120 : (vw() / 100) * 200;
    const O = dt ? 279 : 153;
    const I = dt ? b / 279 : b / 152;
    const late = [".so-gnav", ".so-topage", ".so-weather", ".fv__main .logo .text", ".fv__main .copy", ".fv__foot .so-scroll"].map((s) => document.querySelector(s));
    gsap.set(late, { autoAlpha: 0 });
    gsap.set(windows, { scale: I });
    gsap.set(markEl, { scale: I });
    SO.stop();
    const tl = gsap.timeline({ paused: true });
    tl.to(video, { opacity: 1, duration: 0.5, delay: 1, ease: "power3.out" })
      .add(() => video.play().catch(() => {}), ">0.2")
      .add(() => {
        gsap.fromTo(mask, { maskSize: `${b}px`, webkitMaskSize: `${b}px` }, { maskSize: `${O}px`, webkitMaskSize: `${O}px`, duration: 3, ease: "power2.out" });
        gsap.fromTo(windows, { scale: I }, { scale: 1, duration: 3, ease: "power2.out" });
        gsap.fromTo(markEl, { scale: I }, { scale: 1, duration: 3, ease: "power2.out" });
      }, "<4")
      .to(video, { scale: 0.5, duration: 3, ease: "power2.inOut" }, "<0.6")
      .to(opening, { opacity: 0, duration: 2, ease: "power2.inOut", onComplete: () => { opening.remove(); SO.start(); ScrollTrigger.refresh(); } }, "<0")
      .to(late[4], { autoAlpha: 1, duration: 1, ease: "power2.out" }, ">0.3")
      .to(late[3], { autoAlpha: 1, duration: 0.6, ease: "power2.out" }, "<0")
      .to(late[0], { autoAlpha: 1, duration: 0.6, ease: "power2.out" }, "<1")
      .to(late[2], { autoAlpha: 1, duration: 0.6, ease: "power2.out" }, "<0")
      .to(late[1], { autoAlpha: 1, duration: 0.6, ease: "power2.out" }, "<1")
      .to(late[5], { autoAlpha: 1, duration: 0.6, ease: "power2.out" }, "<0");
    if (video.readyState >= 2) tl.play();
    else video.addEventListener("loadeddata", () => tl.play(), { once: true });
  };

  // First load (shared.js calls it on load) — if arriving via navigation, the symbol stands immediately without the opening
  const reveal = () => {
    window.scrollTo(0, 0);
    SO.reveal();
    if (!seen && !reduced) startOpening();
    else { opening?.remove(); gsap.set(markEl, { scale: 1 }); }
  };
  if (seen || reduced) { opening?.remove(); gsap.set(markEl, { scale: 1 }); }

  // Area card — pressed on the map, it appears at bottom right (center of screen on phones)
  const area = root.querySelector(".about .map .area");
  const cardsBox = root.querySelector(".about .cards");
  const cards = [...root.querySelectorAll(".so-areacard")];
  const footGroup = root.querySelector(".about__foot .group");
  const veil = document.createElement("div");
  veil.className = "card-veil";
  document.body.appendChild(veil);
  let openArea = null;
  const closeCard = () => {
    if (!openArea) return;
    openArea = null;
    delete area.dataset.active;
    area.querySelectorAll(".area_item").forEach((p) => p.classList.remove("is-active"));
    gsap.to(footGroup, { opacity: 1, duration: 0.3, ease: "power2.out" });
    if (!isDt()) gsap.to(veil, { opacity: 0, duration: 0.3, ease: "power2.out", onComplete: () => veil.classList.remove("is-active") });
    const open = cards.filter((c) => c.classList.contains("is-body"));
    gsap.to(open, { opacity: 0, duration: reduced ? 0 : 0.3, ease: "power2.out", onComplete: () => open.forEach((c) => { c.classList.remove("is-active", "is-body"); cardsBox.appendChild(c); }) });
    SO.start();
  };
  const openCard = (key) => {
    cards.forEach((c) => { if (c.classList.contains("is-body")) { c.classList.remove("is-active", "is-body"); cardsBox.appendChild(c); } });
    openArea = key;
    area.dataset.active = key;
    area.querySelectorAll(".area_item").forEach((p) => p.classList.toggle("is-active", p.dataset.area === key));
    const card = cards.find((c) => c.dataset.area === key);
    document.body.appendChild(card);
    card.classList.add("is-body", "is-active");
    if (!isDt()) { veil.classList.add("is-active"); gsap.to(veil, { opacity: 1, duration: 0.3, ease: "power2.out" }); }
    gsap.fromTo(card, { opacity: 0 }, { opacity: 1, duration: reduced ? 0 : 0.3, ease: "power2.out" });
    const cover = card.querySelector(".cover");
    gsap.killTweensOf(cover);
    if (!reduced) {
      Object.assign(cover.style, { opacity: "1", maskImage: "linear-gradient(to bottom, transparent 0%, black 30%, black 100%)", webkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 30%, black 100%)", maskSize: "100% 300%", webkitMaskSize: "100% 300%", maskRepeat: "no-repeat", webkitMaskRepeat: "no-repeat" });
      gsap.fromTo(cover, { maskPosition: "0% 100%", webkitMaskPosition: "0% 100%" }, { maskPosition: "0% -100%", webkitMaskPosition: "0% -100%", duration: 2, delay: 0.3, ease: "power2.out", onComplete: () => (cover.style.opacity = "0") });
    }
    gsap.to(footGroup, { opacity: 0, duration: 0.3, ease: "power2.out" });
    SO.stop();
  };
  area.querySelectorAll(".area_item").forEach((p) => p.addEventListener("click", (e) => { e.stopPropagation(); openCard(p.dataset.area); }));
  cards.forEach((c) => c.querySelector(".close").addEventListener("click", (e) => { e.stopPropagation(); closeCard(); }));
  veil.addEventListener("click", closeCard);
  const outside = (e) => { if (openArea && !e.target.closest(".so-areacard")) closeCard(); };
  document.addEventListener("click", outside);

  const mm = gsap.matchMedia();
  mm.add({ dt: "(min-width: 769px)", mb: "(max-width: 768px)", reduce: "(prefers-reduced-motion: reduce)" }, (ctx) => {
    const { dt, reduce } = ctx.conditions;
    const translate = root.querySelector(".about .map .translate");
    const rotate = root.querySelector(".about .map .rotate");
    const brand = root.querySelector(".about .map .brand");
    const head = root.querySelector(".about__head");
    const main = root.querySelector(".about__main");
    const foot = root.querySelector(".about__foot");
    const mainDesc = main.querySelector(".description");
    const footDesc = foot.querySelector(".description");
    const ovHead = root.querySelector(".overview__head");
    const dataParts = [1, 2, 3, 4, 5].map((n) => root.querySelector(`.overview__main .data${n}`));

    // Map: starts zoomed in at a slant, then straightens while zooming out
    const startT = dt ? { xPercent: 16, yPercent: -49.5, scale: 4.5, left: "50%" } : { xPercent: 0, yPercent: 29.5, scale: 4.2, left: "0%" };
    const endT = { left: "0%", xPercent: 0, yPercent: dt ? -50 : 0, scale: 1 };
    gsap.set(translate, { transform: "none" });

    if (reduce) {
      gsap.set(translate, endT);
      gsap.set(rotate, { rotation: 0 });
      gsap.set(dataParts, { opacity: 1, y: 0 });
      gsap.set(ovHead, { "--mask-progress-group": "0%" });
      gsap.set(ovHead.querySelectorAll(".alternate, .label"), { opacity: 1 });
      gsap.set(ovHead.querySelectorAll(".line"), { "--mask-progress": "0%" });
      gsap.set([mainDesc, footDesc], { height: "auto", opacity: 1 });
      head.classList.remove("is-active");
      foot.classList.add("is-active");
      return;
    }

    gsap.set(translate, startT);
    gsap.set(rotate, { rotation: 299.12 });
    gsap.timeline({ scrollTrigger: { trigger: ".about .target_head", start: "top top", end: "bottom top", scrub: 0.3 } })
      .to(translate, { ...endT, ease: "none" }, 0)
      .to(rotate, { rotation: 0, ease: "none" }, 0);

    gsap.set(brand, { stroke: "transparent" });
    ScrollTrigger.create({
      trigger: ".about .target_main", start: "top center", end: "bottom top",
      onEnter: () => gsap.to(brand, { stroke: SO.color("--site-white"), duration: 0.5, ease: "power2.out" }),
      onLeaveBack: () => gsap.to(brand, { stroke: "transparent", duration: 0.3, ease: "power2.out" }),
    });
    ScrollTrigger.create({
      trigger: ".about .target_main", start: "top top", end: "bottom top",
      onEnter: () => { head.classList.remove("is-active"); main.classList.add("is-active"); },
      onLeaveBack: () => { main.classList.remove("is-active"); head.classList.add("is-active"); },
    });
    ScrollTrigger.create({
      trigger: ".about .target_foot", start: "top top", end: "bottom top",
      onEnter: () => { main.classList.remove("is-active"); foot.classList.add("is-active"); },
      onEnterBack: () => { main.classList.remove("is-active"); foot.classList.add("is-active"); },
      onLeave: () => foot.classList.remove("is-active"),
      onLeaveBack: () => { foot.classList.remove("is-active"); main.classList.add("is-active"); },
    });
    ScrollTrigger.create({ trigger: ".about .target_head", start: "top center", endTrigger: ".about .target_main", end: "bottom top", toggleClass: { targets: document.body, className: "bg-about1" } });
    ScrollTrigger.create({ trigger: ".about .target_foot", start: "top top", end: "bottom center", toggleClass: { targets: document.body, className: "bg-about2" } });
    ScrollTrigger.create({ trigger: ".about .target_foot", start: "top top", end: "bottom-=30% center", onLeave: closeCard, onLeaveBack: closeCard });

    gsap.timeline({ scrollTrigger: { trigger: ".about .target_foot", start: "top bottom+=50%", end: "top top+=80%", scrub: 0.3, invalidateOnRefresh: true } })
      .to(mainDesc, { height: () => mainDesc.scrollHeight, ease: "sine.inOut" })
      .to(mainDesc, { opacity: 1, ease: "none" }, "<0.4");
    gsap.timeline({ scrollTrigger: { trigger: ".about .target_foot", start: "top top", end: "top+=30% top", scrub: 0.3, invalidateOnRefresh: true } })
      .to(footDesc, { height: () => footDesc.scrollHeight, ease: "sine.inOut" })
      .to(footDesc, { opacity: 1, ease: "none" }, "<0.5");

    // Hero background, clouds, airport photo
    gsap.timeline({ scrollTrigger: { trigger: ".intro .section_group", start: "top top", end: "bottom top", scrub: 0.6 } })
      .to(".intro .bg .sky", { yPercent: -5, ease: "sine.out" });
    const cloudTop = [[-10, 5, 1], [10, 5, 0.9], [15, 10, 1.2], [-15, 10, 1.4]];
    const cloudBot = [[-10, -5, 1], [10, -5, 0.9], [15, -10, 1.2], [-15, -10, 1.4]];
    root.querySelectorAll(".cloud.top svg").forEach((el, i) => {
      const [x, y, s] = cloudTop[i];
      gsap.fromTo(el, { xPercent: x, yPercent: y, opacity: 0.9 }, { xPercent: 0, yPercent: 0, opacity: 1, ease: "none", scrollTrigger: { trigger: ".cloud.top", start: "top bottom", end: "bottom top+=30%", scrub: s } });
    });
    root.querySelectorAll(".cloud.bottom svg").forEach((el, i) => {
      const [x, y, s] = cloudBot[i];
      gsap.fromTo(el, { xPercent: 0, yPercent: 0, opacity: 1 }, { xPercent: x, yPercent: y, opacity: 0.9, ease: "none", scrollTrigger: { trigger: ".cloud.bottom", start: "top bottom", end: "bottom top+=30%", scrub: s } });
    });
    gsap.fromTo(".airport__main .photo .wf-img", { scale: 1 }, { scale: 1.03, ease: "none", scrollTrigger: { trigger: ".airport__head", start: "bottom-=300px bottom", end: "bottom top", scrub: 1.5 } });

    // Runway diagram loop — runs only while on screen
    const other = ovHead.querySelectorAll(".group_other");
    const alt = ovHead.querySelectorAll(".alternate");
    const lineC = ovHead.querySelectorAll(".runway_c .line");
    const lineB = ovHead.querySelectorAll(".runway_b .line");
    const labC = ovHead.querySelectorAll(".runway_c .label");
    const labB = ovHead.querySelectorAll(".runway_b .label");
    const heading = ovHead.querySelector(".heading");
    let loop = null;
    const build = () => {
      gsap.set(labB, { y: 10 });
      gsap.set(labC, { y: -10 });
      return gsap.timeline({ repeat: -1, repeatDelay: 1, paused: true })
        .to(ovHead, { "--mask-progress-group": "0%", duration: 1, ease: "power2.inOut" }, 0)
        .to(alt, { opacity: 1, duration: 0.8, ease: "power2.out" }, "<0")
        .to(lineB, { "--mask-progress": "0%", duration: 1.2, ease: "power3.out" }, "<0.6")
        .to(labB, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }, "<0.2")
        .to(lineC, { "--mask-progress": "0%", duration: 1.2, ease: "power3.out" }, "<0")
        .to(labC, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }, "<0.2")
        .to(other, {
          opacity: 0, duration: 0.6, ease: "power3.out",
          onComplete: () => {
            gsap.set(ovHead, { "--mask-progress-group": "100%" });
            gsap.set(alt, { opacity: 0 });
            gsap.set([lineB, lineC], { "--mask-progress": "100%" });
            gsap.set(labB, { opacity: 0, y: 10 });
            gsap.set(labC, { opacity: 0, y: -10 });
            gsap.set(other, { opacity: 1 });
            gsap.set(heading, { opacity: 1 });
          },
        }, "<3")
        .to(heading, { opacity: 0, duration: 0.6, ease: "power3.out" }, "<0");
    };
    const io = new IntersectionObserver((es) => es.forEach((e) => (e.isIntersecting ? loop?.play() : loop?.pause())), { threshold: 0.1 });
    ScrollTrigger.create({ trigger: ovHead, start: "top 50%", once: true, onEnter: () => { loop = build(); io.observe(ovHead); } });

    // Five number panels
    const dio = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      gsap.timeline()
        .to(dataParts[0], { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" })
        .to(dataParts[1], { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }, "<0.1")
        .to(dataParts[2], { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }, "<0.4")
        .to(dataParts[3], { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }, "<0.1")
        .to(dataParts[4], { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }, "<0.1");
      dio.disconnect();
    }), { rootMargin: "-40% 0px -40% 0px" });
    dio.observe(root.querySelector(".overview__main .data"));

    return () => { io.disconnect(); dio.disconnect(); loop?.kill(); };
  });

  return {
    reveal,
    destroy: () => {
      closeCard();
      document.body.classList.remove("bg-about1", "bg-about2");
      document.removeEventListener("click", outside);
      cards.forEach((c) => c.remove());
      veil.remove();
      mm.revert();
    },
  };
  };
})();
