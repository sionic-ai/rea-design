// Things spanning several sections — smooth scroll, loader, wordmark, menu collapse and drawer, cursor, bottom-line section number, tour button, cookie panel
(() => {
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  gsap.registerPlugin(ScrollTrigger);
  const intro = [];
  const site = (window.apSite = { lenis: null, onIntro: (fn) => intro.push(fn), introDone: false });

  // ── Smooth scroll: same Lenis 1.3.27 defaults as the original (lerp .1)
  if (!reduce && window.Lenis) {
    const lenis = new Lenis({ autoRaf: false });
    site.lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
  }
  const scrollTo = (target, opts = {}) => {
    if (site.lenis) site.lenis.scrollTo(target, { duration: 2, easing: (s) => Math.min(1, 1.001 - Math.pow(2, -10 * s)), ...opts });
    else {
      const y = typeof target === "number" ? target : target.getBoundingClientRect().top + scrollY;
      window.scrollTo(0, y);
    }
  };
  site.scrollTo = scrollTo;

  // ── Loader: a three-digit number rolls digit by digit until it reaches 100, then the triangular grid covering the screen turns off in order farthest from the center (.22 each) and lifts
  const loader = document.querySelector(".ap-loader");
  const digits = loader.querySelector(".ap-loader__digits");
  const mark = loader.querySelector(".ap-loader__mark");
  const cells = [0, 1, 2].map(() => {
    const d = document.createElement("span");
    d.className = "ap-loader__digit";
    const s = document.createElement("span");
    s.textContent = "0";
    d.append(s);
    digits.append(d);
    return s;
  });
  const show = (n) => {
    const str = String(n).padStart(3, "0");
    cells.forEach((c, i) => { if (c.textContent !== str[i]) c.textContent = str[i]; });
    mark.style.opacity = String(0.3 + (n / 100) * 0.7);
  };

  const tris = loader.querySelector(".ap-loader__tris");
  const lift = () => new Promise((done) => {
    const ctx = tris.getContext("2d");
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const w = innerWidth, h = innerHeight;
    tris.width = w * dpr; tris.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const side = 30, tall = side * 0.8660254, cx = w / 2, cy = h / 2, far = Math.hypot(cx, cy);
    const list = [];
    for (let r = 0; r * tall < h + tall; r++) {
      const top = r * tall, bot = top + tall, sh = r % 2 ? side / 2 : 0;
      for (let c = -1; c * side < w + side; c++) {
        const x = c * side - sh;
        for (const p of [[x, bot, x + side, bot, x + side / 2, top], [x + side / 2, top, x + side * 1.5, top, x + side, bot]]) {
          const mx = (p[0] + p[2] + p[4]) / 3, my = (p[1] + p[3] + p[5]) / 3;
          const g = Math.sin(mx * 127.1 + my * 311.7) * 43758.5453;
          list.push({ p, at: (Math.hypot(mx - cx, my - cy) / far) * 0.62 + (g - Math.floor(g)) * 0.16 });
        }
      }
    }
    const bg = getComputedStyle(root).getPropertyValue("--kf-bg").trim() || "black";
    const ink = getComputedStyle(root).getPropertyValue("--kf-ink-soft").trim() || "silver";
    loader.style.background = "transparent";
    const t0 = performance.now(), total = 910;
    const tri = (p) => { ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(p[2], p[3]); ctx.lineTo(p[4], p[5]); ctx.closePath(); };
    const step = (now) => {
      const o = (now - t0) / total;
      ctx.clearRect(0, 0, w, h);
      let left = 0;
      for (const t of list) {
        const l = Math.min(1, Math.max(0, (o - t.at) / 0.22));
        if (l >= 1) continue;
        left++;
        tri(t.p);
        ctx.globalAlpha = l > 0 ? 1 - (l < 0.2 ? 0 : (l - 0.2) / 0.8) : 1;
        ctx.fillStyle = bg; ctx.fill();
        if (l > 0) { ctx.globalAlpha = 0.2 * Math.sin(l * Math.PI); ctx.strokeStyle = ink; ctx.stroke(); }
      }
      ctx.globalAlpha = 1;
      if (left) requestAnimationFrame(step); else done();
    };
    requestAnimationFrame(step);
  });

  const finish = () => {
    loader.remove();
    root.classList.remove("is-loading");
    site.lenis?.start();
    site.introDone = true;
    intro.forEach((fn) => fn());
    ScrollTrigger.refresh();
  };
  if (reduce) { show(100); finish(); }
  else {
    const count = { n: 0 };
    gsap.timeline()
      .to(count, { n: 100, duration: 2.2, ease: "power2.inOut", onUpdate: () => show(Math.round(count.n)) })
      .to([mark, loader.querySelector(".ap-loader__count")], { opacity: 0, duration: 0.3, ease: "power2.in" }, "+=0.25")
      .add(() => lift().then(finish));
  }

  // ── Wordmark: on hover each letter rolls .11s later to another letter set (3s) and then returns
  const word = document.querySelector(".ap-wordmark");
  if (word) {
    const a = [...word.textContent.trim()], b = [...(word.dataset.alt || word.textContent)];
    word.textContent = "";
    a.forEach((ch, i) => {
      const box = document.createElement("span");
      box.className = "ap-wordmark__ch"; box.setAttribute("aria-hidden", "true"); box.style.setProperty("--i", i);
      box.innerHTML = `<span class="ap-wordmark__track"><span>${ch}</span><span>${b[i] || ch}</span><span>${ch}</span></span>`;
      word.append(box);
    });
    let busy = false;
    word.addEventListener("pointerenter", () => {
      if (busy || reduce) return;
      busy = true;
      word.classList.add("is-swapping");
      setTimeout(() => { word.classList.remove("is-swapping"); busy = false; }, 3000 + a.length * 110);
    });
  }

  // ── Menu: while passing the product section, the list rolls up and folds into a single Menu. Tap to open the drawer
  const products = document.querySelector("#products");
  if (products) ScrollTrigger.create({ trigger: products, start: "top 40%", end: "bottom 40%", toggleClass: { targets: root, className: "nav-collapsed" } });
  const menuBtn = document.querySelector(".ap-menu-btn");
  const drawer = document.querySelector(".ap-drawer");
  const setMenu = (on) => {
    root.classList.toggle("menu-open", on);
    menuBtn.setAttribute("aria-expanded", String(on));
    if (on) site.lenis?.stop(); else site.lenis?.start();
  };
  menuBtn.addEventListener("click", () => setMenu(!root.classList.contains("menu-open")));
  // When a section link in the open menu is clicked, like the original the hidden menu button floats up 10px after .3s and drops out at 1.35s, and the scroll starts after .45s. When back at the top the button appears immediately
  // Original recording: .3s after the press it floats up 10px and vanishes at .45s, then at 1.1s returns and settles in place over .55s (a bounce)
  const liftMenuBtn = () => {
    if (reduce || root.classList.contains("nav-collapsed")) return;
    gsap.killTweensOf(menuBtn);
    gsap.timeline().to(menuBtn, { y: -10, duration: 0.45, ease: "power2.inOut" }, 0.15).to(menuBtn, { opacity: 0, duration: 0.45, ease: "power2.inOut" }, 0.185)
      .to(menuBtn, { y: 0, duration: 0.55, ease: "power3.out" }, 1.1).to(menuBtn, { opacity: 1, duration: 0.75, ease: "power3.out" }, 1.12).set(menuBtn, { clearProps: "transform,opacity" });
  };
  ScrollTrigger.create({ start: 0, end: "max", onUpdate: (s) => { if (s.scroll() <= 1) gsap.set(menuBtn, { clearProps: "transform,opacity" }); } });
  drawer.querySelector(".ap-drawer__close").addEventListener("click", () => setMenu(false));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute("href");
    e.preventDefault();
    setMenu(false);
    if (id === "#" ) return;
    const t = id === "#top" ? 0 : document.querySelector(id);
    if (t === null) return;
    if (a.closest(".ap-nav")) { liftMenuBtn(); setTimeout(() => scrollTo(t), reduce ? 0 : 450); }
    else scrollTo(t);
  });

  // ── Bottom row: swaps the number and name of the section passing screen center (.25s up on leaving, .6s on entering)
  const tag = document.querySelector(".ap-section-tag");
  const tagNum = tag.querySelector(".ap-section-tag__num"), tagLabel = tag.querySelector(".ap-section-tag__label");
  let tagNow = "";
  const setTag = (el) => {
    const key = el.dataset.tag + el.dataset.tagLabel;
    if (key === tagNow) return;
    tagNow = key;
    tag.classList.add("is-swap");
    setTimeout(() => {
      tagNum.textContent = el.dataset.tag; tagLabel.textContent = el.dataset.tagLabel;
      tag.style.visibility = el.dataset.tag === "00" ? "hidden" : "";
      tag.classList.remove("is-swap");
    }, 250);
  };
  document.querySelectorAll("[data-tag]").forEach((el) => ScrollTrigger.create({ trigger: el, start: "top 50%", end: "bottom 50%", onToggle: (s) => s.isActive && setTag(el) }));
  setTag(document.querySelector("[data-tag]"));

  // ── Flip the text color when the frame overlaps a white surface ──
  const paperAt = (y, x = innerWidth / 2) => [...document.querySelectorAll("[data-paper-on], .ap-panel")].some((el) => {
    const r = el.getBoundingClientRect();
    return r.top <= y && r.bottom >= y && r.left < x && r.right > x;
  });
  const flip = () => {
    root.classList.toggle("on-paper-top", paperAt(40));
    root.classList.toggle("on-paper-bottom", paperAt(innerHeight - 35));
  };
  gsap.ticker.add(flip);

  // Tour button: on press it descends section by section with 2s expo and stays 1.4s. Past the hero it becomes an arrow, and at the end it reads ”Again”
  const tour = document.querySelector(".ap-tour");
  const words = tour.querySelector(".ap-tour__line");
  let touring = false;
  const stops = [...document.querySelectorAll("main > section, main > footer")];
  const runTour = async () => {
    touring = true;
    if (scrollY > innerHeight * 0.5) scrollTo(0, { immediate: true });
    for (const s of stops) {
      if (!touring) return;
      scrollTo(s);
      await new Promise((r) => setTimeout(r, 3400));
    }
    touring = false;
  };
  let tourTimers = [];
  const stopTour = () => { touring = false; tourTimers.forEach(clearTimeout); tourTimers = []; tour.classList.remove("is-starting", "is-playing", "is-touring"); words.textContent = "Take the tour"; };
  tour.addEventListener("click", () => {
    if (touring) { stopTour(); return; }
    tour.classList.add("is-starting");
    tourTimers.push(setTimeout(() => { words.textContent = "Tour started"; }, 60));
    tourTimers.push(setTimeout(() => tour.classList.add("is-playing"), 2100), setTimeout(() => tour.classList.add("is-touring"), 2700));
    runTour().then(stopTour);
  });
  addEventListener("wheel", () => { if (touring) stopTour(); }, { passive: true });
  ScrollTrigger.create({ start: () => innerHeight * 0.3, end: "max", onToggle: (s) => tour.classList.toggle("is-arrow", s.isActive && s.progress < 0.99 && !tour.classList.contains("is-starting")) });
  ScrollTrigger.create({
    start: () => ScrollTrigger.maxScroll(window) - 4, end: "max",
    onToggle: (s) => { tour.classList.toggle("is-replay", s.isActive); tour.classList.toggle("is-arrow", !s.isActive && scrollY > innerHeight * 0.3); words.textContent = s.isActive ? "Take the tour again" : "Take the tour"; },
  });

  // ── Cursor (original values): the small triangle sits right at the cursor, the ring follows with .38s power2.out (matched by measuring the original ring curve). Entering links·buttons grows the ring radius 24 → 48 (1.3s elastic),
  //    The triangle turns into a rotating triangle (.5s) and reverts on leave. When movement is fast the ring swells by (speed/50) times in .5s power4.out. The speech bubble goes 38px right of the cursor in .5s power4.out
  if (fine && !reduce) {
    root.classList.add("has-cursor");
    const cur = document.querySelector(".ap-cursor");
    const big = cur.querySelector(".ap-cursor__big"), small = cur.querySelector(".ap-cursor__small"), path = big.querySelector("path");
    const tip = document.querySelector(".ap-tooltip");
    const ring = { x: innerWidth / 2, y: innerHeight / 2, r: 24 };
    let p = null, mult = 1, speed = 1, prev = null, now = null, hovering = null;
    const ringX = gsap.quickTo(ring, "x", { duration: 0.38, ease: "power2.out" }), ringY = gsap.quickTo(ring, "y", { duration: 0.38, ease: "power2.out" });
    const scale = (dur, ease) => gsap.to(ring, { r: 24 * speed * mult, duration: dur, ease, overwrite: "auto" });
    addEventListener("mousemove", (e) => {
      if (!p) { ring.x = e.clientX; ring.y = e.clientY; }
      p = { x: e.clientX, y: e.clientY };
      ringX(p.x); ringY(p.y);
      now = e;
      big.style.opacity = "1";
      gsap.set(small, { x: p.x - 10, y: p.y - 10, opacity: 1 });
      const w = tip.offsetWidth, flipX = p.x + 38 + w + 16 > innerWidth;
      gsap.to(tip, { duration: 0.5, ease: "power4.out", x: flipX ? p.x - 38 : p.x + 38, y: p.y, xPercent: flipX ? -100 : 0, yPercent: -50 });
      scale(0.5, "power4.out");
    });
    setInterval(() => {
      if (prev && now) { const d = Math.hypot(now.clientX - prev.clientX, now.clientY - prev.clientY) / 50; speed = d > 1 ? d : 1; }
      prev = now;
    }, 100);
    // Triangle swap changes only opacity like the original (size stays) — the speech bubble turns on first and the triangle transitions .5s on the next frame
    const styles = { default: small.querySelector(".is-default"), loading: small.querySelector(".is-loading") };
    // Original order: on entering, both triangles sit in the same frame (the rotating triangle shows right away), on leaving, the exiting triangle goes first and the entering one lands in the next frame
    const setStyle = (name, now) => Object.entries(styles).forEach(([k, el]) => {
      if (k === name && !now) requestAnimationFrame(() => { el.style.opacity = "1"; });
      else el.style.opacity = k === name ? "1" : "0";
    });
    setStyle("default");
    // Tooltip: turns on right away on enter, and if data-tip-next exists, changes the text after .45s (original ”Say it” tooltip). On leave it turns off slightly late like the original (.03s · or the ms of data-tip-hold)
    let tipTimer = 0, nextTimer = 0;
    const enter = (e) => {
      const el = e.currentTarget;
      if (hovering === el) return;
      hovering = el;
      clearTimeout(tipTimer); clearTimeout(nextTimer);
      const t = el.dataset.tip;
      if (t) tip.textContent = t;
      tip.style.opacity = t ? "1" : "0";
      if (t && el.dataset.tipNext) nextTimer = setTimeout(() => { if (hovering === el) tip.textContent = el.dataset.tipNext; }, 450);
      mult = 2; scale(1.3, "elastic.out(1, 0.3)");
      setStyle("loading", true);
    };
    const leave = (e) => {
      const el = e.currentTarget;
      if (el !== hovering) return;
      hovering = null;
      clearTimeout(nextTimer);
      tipTimer = setTimeout(() => { tip.style.opacity = "0"; }, +(el.dataset.tipHold || 30));
      mult = 1; scale(1.3, "elastic.out(1, 0.3)");
      setStyle("default");
    };
    const wire = (el) => { if (el.dataset.cursor) return; el.dataset.cursor = "1"; el.addEventListener("mouseenter", enter); el.addEventListener("mouseleave", leave); };
    document.querySelectorAll("a, button, [data-tip]").forEach(wire);
    new MutationObserver(() => document.querySelectorAll("a:not([data-cursor]), button:not([data-cursor]), [data-tip]:not([data-cursor])").forEach(wire)).observe(document.body, { childList: true, subtree: true });
    gsap.ticker.add(() => {
      big.style.transform = `translate(${ring.x - 30}px, ${ring.y - 30}px)`;
      const r = Math.max(0.5, ring.r);
      path.setAttribute("d", `M30 ${30 - r}A${r} ${r} 0 1 1 ${29.9} ${30 - r}Z`);
      root.classList.toggle("on-paper-cursor", !!p && paperAt(p.y, p.x));
    });
  }

  // ── Cookie panel
  const cookie = document.querySelector(".ap-cookie");
  cookie.querySelectorAll("[data-cookie]").forEach((b) => b.addEventListener("click", () => cookie.classList.add("is-gone")));
})();
