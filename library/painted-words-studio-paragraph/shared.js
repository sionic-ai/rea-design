// Shared across pages: the original framer-motion springs translated into GSAP curves, the bottom island pill, the work overlay, mail copy
(() => {
  // framer-motion’s length plus bounce spring: damping ratio 1−bounce, with the natural frequency solved so the wobble dies down to .001 at the end of the duration (same formula as findSpring)
  const springFromDuration = (d, bounce) => {
    const z = Math.min(1, Math.max(0.05, 1 - bounce));
    let lo = 0.1, hi = 400;
    const env = (w) => {
      if (z < 1) {
        const wd = w * Math.sqrt(1 - z * z);
        return 0.001 - ((w * z) / wd) * Math.exp(-w * z * d);
      }
      return -0.001 + Math.exp(-w * d) * (w * d + 1);
    };
    for (let i = 0; i < 60; i++) {
      const mid = (lo + hi) / 2;
      if (env(mid) < 0) lo = mid; else hi = mid;
    }
    return { w: (lo + hi) / 2, z, d };
  };
  const springCurve = ({ w, z, d }) => {
    if (z >= 1) return (p) => (p >= 1 ? 1 : 1 - Math.exp(-w * p * d) * (1 + w * p * d));
    const wd = w * Math.sqrt(1 - z * z);
    return (p) => {
      if (p >= 1) return 1;
      const t = p * d;
      return 1 - Math.exp(-z * w * t) * (Math.cos(wd * t) + ((z * w) / wd) * Math.sin(wd * t));
    };
  };
  // Physics spring (stiffness·damping·mass) — framer’s default transform spring (500·25)·scale spring (550·30). The end is when the wobble settles below 1%
  const springPhys = (k, c, m = 1) => {
    const w = Math.sqrt(k / m), z = c / (2 * Math.sqrt(k * m));
    const d = Math.min(2, Math.log(100) / (z * w) + (z < 1 ? 0.05 : 0));
    return { ease: springCurve({ w, z, d }), duration: d };
  };
  const spring = (d, bounce) => ({ ease: springCurve(springFromDuration(d, bounce)), duration: d });
  window.rbMotion = { spring, springPhys, easeOut: "power1.out" };

  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasGsap = !!window.gsap;
  if (hasGsap && window.CustomEase) gsap.registerPlugin(CustomEase);

  // Copy mail — pressing it turns the icon into a check and the address into the accent color for 1 second (original setTimeout 1000)
  document.querySelectorAll("[data-copy]").forEach((btn) => {
    btn.addEventListener("click", () => {
      navigator.clipboard?.writeText(btn.dataset.copy).catch(() => {});
      btn.classList.add("is-copied");
      clearTimeout(btn._t);
      btn._t = setTimeout(() => btn.classList.remove("is-copied"), 1000);
    });
  });

  const wrap = document.querySelector(".rb-island-wrap");
  if (!wrap || !hasGsap) return;
  const pill = wrap.querySelector(".rb-island");
  const notch = wrap.querySelector(".rb-island__notch");
  const gesture = wrap.querySelector(".rb-island__gesture");
  const titles = wrap.querySelector(".rb-island__titles");
  const hit = wrap.querySelector(".rb-island__hit");
  const overlay = document.querySelector(".rb-work");
  const side = document.querySelector(".rb-side");

  // Gesture icons — the original Rive gestures (swipe, press, grid, magic wand) rebuilt in the same 24px slot with SVG plus a CSS loop
  const ICONS = {
    studio: '<svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="5" fill="currentColor" opacity=".55"/><circle cx="12" cy="12" r="3.4" fill="var(--kf-contrast-bg)"/></svg>',
    Swipe: '<svg viewBox="0 0 24 24" class="rb-g rb-g--swipe"><path d="M5 12h14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" opacity=".35"/><circle class="rb-g__dot" cx="8" cy="12" r="3.2" fill="currentColor"/></svg>',
    Click: '<svg viewBox="0 0 24 24" class="rb-g rb-g--click"><circle class="rb-g__ring" cx="11" cy="11" r="6" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M10 9l8 4.5-3.4 1-1.8 3.3z" fill="currentColor"/></svg>',
    Grid: '<svg viewBox="0 0 24 24" class="rb-g rb-g--grid"><rect x="4" y="4" width="7" height="7" rx="2" fill="currentColor"/><rect x="13" y="4" width="7" height="7" rx="2" fill="currentColor"/><rect x="4" y="13" width="7" height="7" rx="2" fill="currentColor"/><rect x="13" y="13" width="7" height="7" rx="2" fill="currentColor"/></svg>',
    Wand: '<svg viewBox="0 0 24 24" class="rb-g rb-g--wand"><path d="M5 19 15 9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path class="rb-g__spark" d="M17 3v4M15 5h4M20 10v2M19 11h2M11 3v2M10 4h2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
  };
  const ITEMS = [
    { title: "Showreel 0000", icon: "studio", width: 220, co: -1 },
    { title: "Client site", icon: "Swipe", width: 190, co: 0 },
    { title: "Intro motion", icon: "Wand", width: 200, co: 0 },
    { title: "404 page", icon: "Wand", width: 180, co: 0 },
    { title: "Dashboard", icon: "Grid", width: 190, co: 1 },
    { title: "Signup modal", icon: "Click", width: 208, co: 1 },
    { title: "Product site", icon: "Swipe", width: 200, co: 2 },
    { title: "Music player", icon: "Click", width: 264, co: 2 },
  ];
  const COMPANIES = [
    { name: "Client One", desc: "Your customer intro here in two lines. What the company does and one award received.", stage: "Bootstrap", service: "Design + Build", dur: "00 weeks", link: "clientone.com", quote: "" },
    { name: "Client Two", desc: "Your two-line introduction of the second client here.", stage: "Series A", service: "Build", dur: "Ongoing", link: "clienttwo.com", quote: "Your client’s one- or two-sentence review here.", who: "Name Surname, Role" },
    { name: "Client Three", desc: "Your third customer intro here in two lines.", stage: "Seed", service: "Design + Build", dur: "00 weeks", link: "clientthree.com", quote: "" },
  ];

  const S_BOTTOM = spring(0.4, 0.2), S_WIDTH = spring(0.5, 0.3);
  let open = false, shown = false, cur = -1, curCo = -2, titleTimer = 0;

  const setTitle = (text) => {
    const old = titles.querySelector(".rb-island__title:not(.is-out)");
    const enter = () => {
      if (text == null) return;
      const p = document.createElement("p");
      p.className = "rb-island__title";
      p.textContent = text;
      titles.append(p);
      if (!reduce) gsap.fromTo(p, { opacity: 0, filter: "blur(4px)" }, { opacity: 1, filter: "blur(0px)", duration: 0.15, ease: "power1.out" });
    };
    if (!old) return enter();
    old.classList.add("is-out");
    if (reduce) { old.remove(); return enter(); }
    gsap.to(old, { opacity: 0, filter: "blur(4px)", duration: 0.15, ease: "power1.out", onComplete: () => { old.remove(); enter(); } });
  };
  const setWidth = (w) => {
    if (reduce) return gsap.set(pill, { width: w });
    gsap.to(pill, { width: w, duration: S_WIDTH.duration, ease: S_WIDTH.ease, overwrite: "auto" });
  };
  const setIcon = (name) => { gesture.innerHTML = ICONS[name] || ICONS.studio; gesture.dataset.icon = name; };
  // Original setData: icon and width change at once, the title is cleared and the new title appears .1s later
  const setData = (icon, width, title) => {
    setIcon(icon);
    setWidth(width);
    setTitle(null);
    clearTimeout(titleTimer);
    titleTimer = setTimeout(() => setTitle(title), 100);
  };

  const show = (on) => {
    if (on === shown) return;
    shown = on;
    const y = on ? 40 : -40;
    if (reduce) return gsap.set(wrap, { bottom: y });
    gsap.to(wrap, { bottom: y, duration: S_BOTTOM.duration, ease: S_BOTTOM.ease, overwrite: "auto" });
  };

  // Client description cell — showreel is a one-paragraph intro, and when the client changes the name swaps with blur · 10px in .3s, description · line in .2s (the old one leaves in .2s)
  const renderSide = (co) => {
    if (!side || co === curCo) return;
    const first = curCo === -2;
    curCo = co;
    const build = () => {
      side.innerHTML = "";
      if (co < 0) {
        side.append(document.getElementById("rb-side-intro").content.cloneNode(true));
        const p = side.firstElementChild;
        if (!reduce) gsap.fromTo(p, { opacity: 0 }, { opacity: 1, duration: 0.5, delay: first ? 0.6 : 0, ease: "power1.out" });
        return;
      }
      const c = COMPANIES[co];
      side.innerHTML = `<div class="rb-side__co" data-swap><span class="rb-side__logo wf-img" data-label=""></span><p class="rb-side__name">${c.name}</p></div>
        <p class="rb-side__desc" data-swap>${c.desc}</p>
        <div class="rb-side__rows"><div data-swap>${c.stage}</div><div data-swap>${c.service}</div><div data-swap>${c.dur}</div><div data-swap><a href="#">${c.link}</a></div></div>
        ${c.quote ? `<div class="rb-side__quote" data-swap><p>${c.quote}</p><div class="rb-side__who"><span class="rb-side__face wf-img" data-label=""></span>${c.who}</div></div>` : ""}`;
      if (reduce) return;
      gsap.fromTo(side.querySelector(".rb-side__co"), { opacity: 0, y: 10, filter: "blur(5px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.3, ease: "power1.out" });
      gsap.fromTo(side.querySelectorAll(".rb-side__desc, .rb-side__rows > div, .rb-side__quote"), { opacity: 0 }, { opacity: 1, duration: 0.2, ease: "power1.out" });
    };
    const old = side.children;
    if (!old.length || reduce) return build();
    gsap.to(old, { opacity: 0, duration: 0.2, ease: "power1.out", onComplete: build });
  };

  let tops = [];
  const measure = () => {
    const st = overlay.scrollTop;
    tops = [...overlay.querySelectorAll(".get-clip")].map((el) => el.getBoundingClientRect().top + st).reverse();
  };
  // Original: the last video past the screen center (½ window height) is the current video — pill icon·width·title and left description follow that video
  const onScroll = () => {
    const e = overlay.scrollTop, half = innerHeight / 2;
    const t = tops.findIndex((top) => top < e + half);
    const i = tops.length - 1 - t;
    if (t < 0 || i === cur) return;
    cur = i;
    const it = ITEMS[i] || ITEMS[0];
    setData(it.icon, it.width, it.title);
    renderSide(it.co);
  };

  const fadeIn = overlay ? overlay.querySelectorAll(".rb-work__reel, .rb-work__list") : [];
  const setOpen = (on, fromLoad) => {
    if (on === open || !overlay) return;
    open = on;
    root.classList.toggle("is-work-open", on);
    hit.setAttribute("aria-expanded", String(on));
    root.style.overflow = on ? "hidden" : "";
    const url = new URL(location.href);
    if (on) url.searchParams.set("work", "open"); else url.searchParams.delete("work");
    history.replaceState(null, "", url);
    if (on) {
      show(true);
      overlay.scrollTop = 0;
      cur = 0;
      gsap.fromTo(notch, { width: 0, opacity: 0 }, { width: 45, opacity: 1, duration: reduce ? 0 : 0.3, ease: "power1.out" });
      setData(ITEMS[0].icon, ITEMS[0].width, ITEMS[0].title);
      curCo = -2;
      renderSide(-1);
      gsap.fromTo(fadeIn, { opacity: 0 }, { opacity: 1, duration: reduce ? 0 : 0.5, delay: reduce ? 0 : 0.6, ease: "power1.out" });
      requestAnimationFrame(measure);
      overlay.focus?.({ preventScroll: true });
    } else {
      gsap.to(notch, { width: 0, opacity: 0, duration: reduce ? 0 : 0.3, ease: "power1.out" });
      gsap.set(fadeIn, { opacity: 0 });
      setData("studio", 148, "See work");
      if (side) side.innerHTML = "";
      curCo = -2;
      show(window.rbIslandWanted ? window.rbIslandWanted() : true);
    }
  };
  window.rbIsland = { show: (on) => { if (!open) show(on); }, open: () => setOpen(true), close: () => setOpen(false) };

  // Start: spring from width 180 to the current width (148), hidden below the bottom (−40)
  gsap.set(wrap, { bottom: -40 });
  gsap.set(pill, { width: 180 });
  setIcon("studio");
  setWidth(148);
  hit.addEventListener("click", () => setOpen(!open));
  addEventListener("keydown", (e) => { if (e.key === "Escape" && open) setOpen(false); });
  overlay?.addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", () => open && measure());
  if (new URLSearchParams(location.search).get("work") === "open") setOpen(true, true);
})();
