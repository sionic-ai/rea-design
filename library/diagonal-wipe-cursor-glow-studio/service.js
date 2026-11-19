// Services — original Services: Hero pin (theme change), Gallery (preview cursor: a copy with the panel shrunk to 16.8rem height and a 14.5rem window cut by horizontal inset, follows with .6s power3.out,
// Pressing it turns the whole panel full in 1s power3.out), ServicesInfo (4-screen pin, line blur .4 stagger), ServicesAccordion (1.2-screen pin, line height 14rem↔screen−…),
// Offer (3-screen pin, spot above the ellipse, blur |sin|²×3rem, star playback), featured work, places we worked with (only the hovered row is sharp)
(() => {
  const ES = window.ES;
  const { q, qa, rem } = ES;
  const arrow = '<svg viewBox="0 0 36 36" aria-hidden="true"><path d="M8 18h20M20 10l8 8-8 8" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>';

  ES.gallery = (el, services) => {
    if (!el) return () => {};
    const items = qa(".es-gallery-item", el);
    const n = items.length;
    let index = 0, top = n - 1, busy = false, hovered = false;
    items.forEach((it, k) => gsap.set(it, { zIndex: k === 0 ? n : 0 }));
    const cursor = document.createElement("div");
    cursor.className = "es-gallery-cursor";
    cursor.innerHTML = `<div class="es-gallery-cursor-img"></div><div class="es-gallery-cursor-inner"><div class="es-gallery-cursor-overlay"></div><div class="es-gallery-cursor-icon">${arrow}</div></div>`;
    el.append(cursor);
    const img = q(".es-gallery-cursor-img", cursor), icon = q(".es-gallery-cursor-icon", cursor);
    const fill = (k) => { img.innerHTML = ""; const m = q(".es-media", items[k]) || items[k]; img.append(m.cloneNode(true)); };
    fill(1 % n);
    let ratio = 0, s = 1, progress = 0;
    const pos = { x: 0, y: 0 };
    const bounds = () => {
      ratio = ES.mobile ? 0 : (innerWidth / innerHeight) * 14.4;
      s = rem(16.8) / innerHeight;
      gsap.set(cursor, { scale: s, clipPath: `inset(0% ${ratio}%)`, zIndex: n + 1 });
      gsap.set(icon, { scale: 6 });
      pos.x = innerWidth * 0.5 - (innerWidth * s) * 0.5;
      pos.y = services ? -rem(18) : innerHeight * 0.5 - rem(16.8) * 0.5;
      if (!hovered) gsap.set(cursor, { x: pos.x, y: pos.y });
    };
    bounds();
    addEventListener("resize", bounds);
    if (ES.mobile || ES.reduce) {
      el.addEventListener("click", () => navigate());
    }
    // Services first section: while the photo panel rises, the preview is moved down by the panel’s progress so it stays in the title box position (original isServices)
    if (services) ScrollTrigger.create({ trigger: el, start: 0, end: "bottom bottom", onUpdate: (st) => { progress = st.progress; } });
    const xTo = gsap.quickTo(cursor, "x", { duration: 0.6, ease: "power3.out" });
    const yTo = gsap.quickTo(cursor, "y", { duration: 0.6, ease: "power3.out" });
    const mouse = { x: 0, y: 0 };
    const move = (e) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    if (!ES.mobile) {
      el.addEventListener("mousemove", (e) => { move(e); if (!hovered) { hovered = true; el.classList.add("is-active"); } });
      el.addEventListener("mouseleave", () => { hovered = false; el.classList.remove("is-active"); });
      q(".es-gallery-prev", el)?.addEventListener("mouseenter", () => gsap.to(icon, { rotateY: 180, duration: 1, ease: "power3.out", overwrite: "auto" }));
      q(".es-gallery-next", el)?.addEventListener("mouseenter", () => gsap.to(icon, { rotateY: 0, duration: 1, ease: "power3.out", overwrite: "auto" }));
      q(".es-gallery-prev", el)?.addEventListener("click", () => navigate(false));
      q(".es-gallery-next", el)?.addEventListener("click", () => navigate(true));
    }
    const loop = () => {
      if (ES.mobile || busy) return;
      if (!hovered) { xTo(pos.x); yTo(pos.y + (services ? progress * (el.offsetTop - rem(16.8) * 0.5) : 0)); return; }
      const b = el.getBoundingClientRect();
      xTo(mouse.x - (innerWidth * s) * 0.5);
      yTo(mouse.y - b.top - rem(16.8) * 0.5);
    };
    gsap.ticker.add(loop);
    function navigate(next = true) {
      if (busy) return;
      busy = true;
      index = (index + (next ? 1 : -1) + n) % n;
      const it = items[index];
      gsap.set(it, { zIndex: ++top + n });
      const x = gsap.getProperty(cursor, "x"), y = gsap.getProperty(cursor, "y");
      const tl = gsap.timeline({ onComplete: () => { busy = false; } });
      const d = ES.reduce ? 0 : ES.mobile ? 0.6 : 1;
      tl.fromTo(q(".es-media", it), { autoAlpha: 0.5 }, { autoAlpha: 1, duration: d, ease: "power3.out" }, 0)
        .fromTo(it, { x, y, scale: s, clipPath: `inset(0% ${ratio}%)` }, { x: 0, y: 0, scale: 1, clipPath: "inset(0% 0%)", duration: d, ease: "power3.out" }, 0)
        .add(() => fill((index + 1) % n), 0.05)
        .fromTo(img, { yPercent: -50, clipPath: "inset(0% 0% 100% 0%)" }, { yPercent: 0, clipPath: "inset(0% 0% 0% 0%)", duration: d, ease: "power3.out" }, 0.2)
        .fromTo(icon, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6 * d, ease: "power3.out" }, 0.4);
    }
    return () => { gsap.ticker.remove(loop); removeEventListener("resize", bounds); };
  };

  const offer = (sec, offs) => {
    const items = qa(".es-offer-item", sec), nums = qa(".es-offer-number", sec);
    nums.forEach((nm) => { nm.innerHTML = [...nm.textContent.trim()].map((c) => `<span>${c}</span>`).join(""); });
    const icon = ES.icon(q(".es-offer-icon", sec));
    offs.push(() => icon.lottie.destroy());
    if (!ES.mobile) items.forEach((it) => ES.splitLines(q(".es-offer-text", it)));
    let index = -1, progress = 0, active = false;
    const setIndex = (p) => {
      progress = p;
      const k = Math.round(p * (items.length - 1));
      if (k === index) return;
      index = k;
      items.forEach((it, j) => it.classList.toggle("is-active", j === k));
      nums.forEach((nm, j) => nm.classList.toggle("is-active", j === k));
    };
    setIndex(0);
    if (ES.mobile || ES.reduce) {
      items.forEach((it) => it.classList.add("is-active"));
      return;
    }
    const wrap = q(".es-offer-services", sec);
    let rX = 0, rY = 0, hs = [];
    const measure = () => { const b = wrap.getBoundingClientRect(); rX = b.width * 0.5; rY = b.height * 0.5; hs = items.map((it) => it.offsetHeight); };
    measure();
    const place = () => {
      const quarter = Math.PI * 0.5, step = quarter / (items.length - 1), base = progress * quarter;
      items.forEach((it, k) => {
        const a = base - k * step, c = Math.cos(a), sn = Math.sin(a), as = Math.abs(sn);
        gsap.set(it, { x: rX + c * rX - k * 60 * as * as, y: rY - sn * rY - hs[k] * 0.5, autoAlpha: 1 - Math.pow(as, 1.5) * 3, scale: 1 - Math.pow(as, 1.5) * 0.5 });
        const blur = as < 0.05 ? 0 : as * as * 3;
        gsap.set(q(".es-offer-title", it), { filter: `blur(${blur.toFixed(2)}rem)` });
      });
    };
    place();
    const head = { f: 0 };
    gsap.timeline({
      scrollTrigger: {
        trigger: q(".es-offer-inner", sec), start: "center center", end: () => `+=${innerHeight * 3}`, scrub: true, pin: true,
        onUpdate: (st) => setIndex(st.progress), onEnter: () => { active = true; }, onEnterBack: () => { active = true; }, onLeave: () => { active = false; }, onLeaveBack: () => { active = false; },
      },
    })
      .to(head, { f: icon.total - 1, ease: "none", onUpdate: () => icon.go(head.f) }, 0)
      .to(q(".es-offer-label", sec), { y: innerHeight * 0.8 }, 0);
    const loop = () => { if (active) place(); };
    gsap.ticker.add(loop);
    const ro = new ResizeObserver(() => { measure(); place(); });
    ro.observe(wrap);
    offs.push(() => { gsap.ticker.remove(loop); ro.disconnect(); });
  };

  ES.pages.service = (root, api) => {
    const offs = [];
    const hero = q(".es-shero", root);
    const gal = q(".es-gallery", root);
    offs.push(ES.gallery(gal, true));
    if (!ES.reduce) {
      api.intro.moveBlur([q(".es-shero-l", hero), q(".es-shero-r", hero)], { yPercent: 30 }, 0)
        .fromTo(qa(".es-gallery-item", gal), { yPercent: 10 }, { yPercent: 0, ease: "expo.out", duration: 1 }, 0.2);
      gsap.timeline({ scrollTrigger: { trigger: hero, pin: true, start: "top top", end: () => `+=${hero.offsetHeight}`, pinSpacing: false, scrub: true } })
        .to(hero, { duration: 1 })
        .add(() => ES.busy || ES.nav.theme("light"), 0.9)
        .add(() => ES.busy || ES.nav.theme("dark"), 0.91);
    }

    // Fixed declaration
    const info = q(".es-sinfo", root);
    const iTitle = q(".es-sinfo-title", info);
    if (ES.mobile || ES.reduce) ES.title(iTitle);
    else {
      const lines = ES.splitLines(iTitle);
      gsap.set(info, { paddingBottom: () => innerHeight * 1.6 });
      gsap.set(lines, { yPercent: 105 });
      gsap.timeline({ scrollTrigger: { trigger: q(".es-sinfo-inner", info), start: "top top", end: () => `+=${innerHeight * 4}`, scrub: true, pin: true, pinSpacing: false, invalidateOnRefresh: true } })
        .to(q(".es-sinfo-inner", info), { duration: 10 }, 0)
        .add(() => ES.busy || ES.nav.theme("light"), 1.6)
        .fromTo(iTitle, { yPercent: () => innerHeight * 0.14 }, { yPercent: 0, ease: "power1.out", duration: 3 }, 0)
        .moveBlur(lines, { stagger: 0.4, duration: 3 }, 0)
        .fromTo(q(".es-sinfo-content", info), { yPercent: () => innerHeight }, { yPercent: () => innerHeight * -0.1, duration: 4 }, 1);
    }

    // Pin accordion — open row is screen − 8rem − (rows−1)×14rem, closed row 14rem, photo 10rem, photo 1↔1.2
    const acc = q(".es-acc", root);
    const rows = qa(".es-acc-row", acc);
    if (!ES.mobile && !ES.reduce) {
      const shut = "14rem", open = `calc(100vh - 8rem - ${(rows.length - 1) * 14}rem)`, imgShut = "10rem", imgOpen = `calc(100vh - 12rem - ${(rows.length - 1) * 14}rem)`;
      const imgs = rows.map((r) => q(".es-acc-media", r)), medias = rows.map((r) => q(".es-acc-media .es-media", r)), texts = rows.map((r) => q(".es-acc-content", r));
      gsap.set(rows[0], { height: open });
      gsap.set(imgs[0], { height: imgOpen });
      gsap.set(medias, { height: imgOpen });
      const tl = gsap.timeline({ scrollTrigger: { trigger: acc, start: "top top", end: () => `+=${innerHeight * 1.2}`, pin: true, scrub: true }, defaults: { duration: 1, ease: "none" } });
      rows.forEach((r, k) => {
        if (k === 0) {
          tl.to(r, { height: shut }, 0).to(imgs[k], { height: imgShut }, 0).to(medias[k], { scale: 1.2 }, 0).to(texts[k], { autoAlpha: 0, duration: 0.8 }, 0);
          return;
        }
        gsap.set(medias[k], { scale: 1.2 });
        gsap.set(texts[k], { autoAlpha: 0 });
        if (k !== rows.length - 1) tl.to(r, { height: shut }, k).to(imgs[k], { height: imgShut }, k).fromTo(medias[k], { scale: 1 }, { scale: 1.2 }, k).to(texts[k], { autoAlpha: 0, duration: 0.8 }, k);
        tl.to(r, { height: open }, k - 1).to(imgs[k], { height: imgOpen }, k - 1).fromTo(texts[k], { autoAlpha: 0 }, { autoAlpha: 1 }, k - 1).fromTo(medias[k], { scale: 1.2 }, { scale: 1 }, k - 1);
      });
    }

    offer(q(".es-offer", root), offs);
    ES.workView(q(".es-work", root));

    const clients = qa(".es-client", root);
    ES.text(q(".es-clients-label", root));
    clients.forEach((c) => {
      c.addEventListener("mouseenter", () => clients.forEach((o) => { o.classList.toggle("is-inactive", o !== c); }));
      c.addEventListener("mouseleave", () => clients.forEach((o) => o.classList.remove("is-inactive")));
    });
    return { destroy: () => offs.forEach((f) => f && f()) };
  };
})();
