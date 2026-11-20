// Common to all pages: draws the header, phone menu, transition curtain, dot cursor, pill cursor, cookie note and footer, and hooks up Lenis, entrances and letter shuffle.
// Original values: GSAP default curve power3.out·1.1s · Lenis lerp .085 · cursor .45s power3 · curtain cover .6s power1.inOut / lift .8s power4.out (.2s delay)
(() => {
  gsap.registerPlugin(ScrollTrigger, SplitText, ScrambleTextPlugin, CustomEase);
  gsap.defaults({ ease: "power3.out", duration: 1.1 });
  ScrollTrigger.config({ ignoreMobileResize: true });

  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const MOTION = "(prefers-reduced-motion: no-preference)";
  const page = document.body.dataset.page || "home";
  const root = document.documentElement;
  root.classList.add("js");
  const EE = (window.EE = { reduced, fine, page, lenis: null });

  // ───── Dot art (newly drawn) — cells marked # are filled
  const PX = {
    bubble: ["#########", "#.......#", "#.......#", "#.......#", "#.......#", "#########", "...##....", "...#.....", "..#......"],
    eye: ["..#####..", ".#.....#.", "#..###..#", "#..###..#", ".#.....#.", "..#####.."],
    mail: ["#########", "##.....##", "#.#...#.#", "#..#.#..#", "#...#...#", "#########"],
    check: [".......##", "......##.", "##...##..", ".##.##...", "..###....", "...#....."],
    case: ["..####..", "..#..#..", "########", "#......#", "###..###", "#......#", "########"],
    person: ["..##..", ".####.", "..##..", "......", ".####.", "######", "######"],
    spark: ["...#...", "...#...", "..###..", "#######", "..###..", "...#...", "...#..."],
    cookie: [".#####.", "##.#.##", "#.###.#", "###.###", "#.#.#.#", "##.#.##", ".#####."],
  };
  const pxSvg = (rows) => {
    const h = rows.length, w = rows[0].length;
    let r = "";
    rows.forEach((row, y) => [...row].forEach((c, x) => { if (c === "#") r += `<rect x="${x}" y="${y}" width="1.02" height="1.02"/>`; }));
    return `<svg viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges" aria-hidden="true">${r}</svg>`;
  };
  // Rotating dot icon — as in the original, dots stood at 1.1-cell thickness are rotated through 72 steps (6 rows × 12 cells), baked into one image,
  // Rows push at 6s steps(6) and cells at 1s steps(12), viewed through a one-cell window. Front faces dark, side faces .5
  const sheets = new Map();
  const bake = (rows) => {
    const key = rows.join("/");
    if (sheets.has(key)) return sheets.get(key);
    const h = rows.length, w = rows[0].length, D = 1.1, pad = 1, cell = 6;
    const fw = (w + 2 * pad) * cell, fh = (h + 2 * pad) * cell;
    const cv = document.createElement("canvas");
    cv.width = fw * 12; cv.height = fh * 6;
    const g = cv.getContext("2d");
    const on = (x, y) => rows[y]?.[x] === "#";
    for (let k = 0; k < 72; k++) {
      const t = (k / 72) * Math.PI * 2, c = Math.cos(t), sn = Math.sin(t);
      const ox = (k % 12) * fw + fw / 2, oy = Math.floor(k / 12) * fh + pad * cell;
      const px = (x, z) => ox + (x * c + z * sn) * cell;
      const quad = (x0, x1, y, alpha) => { const a = Math.min(x0, x1), b = Math.max(x0, x1); g.globalAlpha = alpha; g.fillRect(a, oy + y * cell, Math.max(b - a, 0.6), cell + 0.5); };
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        if (!on(x, y)) continue;
        const l = x - w / 2, r = l + 1;
        if (sn > 0 && !on(x - 1, y)) quad(px(l, D / 2), px(l, -D / 2), y, 0.5);
        if (sn < 0 && !on(x + 1, y)) quad(px(r, D / 2), px(r, -D / 2), y, 0.5);
      }
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        if (!on(x, y)) continue;
        const l = x - w / 2, z = c >= 0 ? D / 2 : -D / 2;
        quad(px(l, z), px(l + 1, z), y, 1);
      }
    }
    const out = { url: cv.toDataURL(), pad: pad / w, padY: pad / h, w, h };
    sheets.set(key, out);
    return out;
  };
  EE.px = (name, cls = "") => {
    const rows = PX[name];
    if (reduced) return `<span class="ee-px ${cls}" data-px="${name}">${pxSvg(rows)}</span>`;
    const b = bake(rows);
    return `<span class="ee-px ${cls}" data-px="${name}" style="--px-ar:${b.w / b.h}"><span class="ee-px__sheet" style="inset:${-b.padY * 100}% ${-b.pad * 100}%"><span class="ee-px__rows"><span class="ee-px__cols"><span class="ee-px__shape" style="-webkit-mask-image:url(${b.url});mask-image:url(${b.url})"></span></span></span></span></span>`;
  };

  // ───── Letter roll frame
  EE.chars = (text) => `<span class="ee-chars"><span class="ee-sr">${text}</span><span class="ee-chars-in" aria-hidden="true">${[...text].map((c, i) => `<span style="--i:${i}">${c === " " ? "&nbsp;" : c}</span>`).join("")}</span></span>`;
  const arrowR = '<svg class="ee-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4"/></svg>';
  const arrowUR = '<svg class="ee-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M4 12 12 4M5 4h7v7"/></svg>';
  EE.icons = { arrowR, arrowUR };
  document.querySelectorAll("[data-chars]").forEach((el) => { el.innerHTML = EE.chars(el.textContent.trim()); });
  document.querySelectorAll("[data-px-icon]").forEach((el) => { el.innerHTML = EE.px(el.dataset.pxIcon); });

  // ───── Header · Menu
  const NAME = "name surname";
  const links = [["home", "index.html", "Home"], ["works", "list.html", "Work"], ["contact", "contact.html", "Inquiry"]];
  const cur = (p) => (p === page || (p === "works" && page === "detail") ? ' aria-current="page"' : "");
  const lang = (cls = "") => `<div class="ee-lang ${cls}" role="group" aria-label="Language"><span><a class="ee-nav-item" href="#" aria-current="true">${EE.chars("KO")}</a></span><span class="ee-lang__sep">/</span><span><a class="ee-nav-item" href="#">${EE.chars("EN")}</a></span></div>`;
  const meta = (cls = "") => `<div class="ee-head__meta ${cls}"><p><span class="ee-meta-label">Where I am now</span> <span class="ee-meta-place">City</span><time class="ee-time" data-time>00<i>:</i>00</time></p></div>`;
  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.className = "ee-head";
    head.innerHTML = `
      <div class="ee-head__in">
        <a class="ee-head__mark" href="index.html" aria-label="Home">${EE.chars(NAME)}</a>
        ${meta()}
        <nav class="ee-nav" aria-label="Main menu">${links.map(([p, h, t]) => `<a class="ee-nav-item" href="${h}"${cur(p)}>${EE.chars(t)}</a>`).join("")}${lang()}</nav>
        <button class="ee-nav-item ee-burger" type="button" aria-expanded="false" aria-controls="ee-menu"><span class="ee-sr">Open Menu</span><span class="ee-burger__lines" aria-hidden="true"><span></span><span></span></span></button>
      </div>
      <div class="ee-scrim" hidden data-slot="menu-scrim"></div>
      <nav id="ee-menu" class="ee-menu" hidden aria-label="Phone menu" data-slot="mobile-menu">
        ${links.map(([p, h, t]) => `<a class="ee-menu__item" href="${h}"${cur(p)}>${EE.chars(t)}<svg class="ee-menu__arrow" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4"/></svg></a>`).join("")}
        <div class="ee-menu__foot">${lang()}${meta()}</div>
      </nav>`;
    const set = () => head.toggleAttribute("data-scrolled", scrollY > 8);
    set();
    addEventListener("scroll", set, { passive: true });

    // Phone menu: the panel drops from the top (clip .7s expo.inOut), items come in from 24px below at .05s intervals, letters shuffle in. Close .595s
    const burger = head.querySelector(".ee-burger");
    const panel = head.querySelector(".ee-menu");
    const scrim = head.querySelector(".ee-scrim");
    const SHUT = "inset(0% 0% 100% 0% round 0px 0px 6px 6px)", OPEN = "inset(0% 0% 0% 0% round 0px 0px 6px 6px)";
    let open = false, tl = null;
    const toggle = (want) => {
      if (want === open) return;
      open = want;
      burger.setAttribute("aria-expanded", String(open));
      burger.querySelector(".ee-sr").textContent = open ? "Close Menu" : "Open Menu";
      tl?.kill();
      if (open) {
        head.toggleAttribute("data-menu-open", true);
        panel.hidden = scrim.hidden = false;
        EE.lenis?.stop();
        if (reduced) return;
        tl = gsap.timeline();
        tl.fromTo(panel, { clipPath: SHUT }, { clipPath: OPEN, duration: 0.7, ease: "expo.inOut" });
        tl.fromTo(scrim, { opacity: 0 }, { opacity: 1, duration: 0.7, ease: "expo.inOut" }, 0);
        tl.from(panel.children, { y: 24, opacity: 0, stagger: 0.05, duration: 0.8, ease: "expo.out" }, 0.25);
        panel.querySelectorAll(".ee-chars-in").forEach((ci, i) => ci.querySelectorAll(":scope > span").forEach((s, n) => {
          const t = s.textContent;
          if (t.trim()) tl.to(s, { duration: 0.35, ease: "none", scrambleText: { text: t, chars: EE.scrambleChars(t), speed: 1 } }, 0.25 + 0.05 * i + 0.025 * n);
        }));
      } else {
        const done = () => { head.toggleAttribute("data-menu-open", false); panel.hidden = scrim.hidden = true; EE.lenis?.start(); };
        if (reduced) return done();
        tl = gsap.timeline({ onComplete: done });
        tl.fromTo(panel, { clipPath: OPEN }, { clipPath: SHUT, duration: 0.595, ease: "expo.inOut" });
        tl.to(scrim, { opacity: 0, duration: 0.595, ease: "expo.inOut" }, 0);
      }
    };
    burger.addEventListener("click", () => toggle(!open));
    scrim.addEventListener("click", () => toggle(false));
    addEventListener("keydown", (e) => e.key === "Escape" && toggle(false));
  }

  // ───── Footer
  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.className = "ee-foot";
    foot.setAttribute("data-fx", "dot-grid-spot");
    foot.innerHTML = `
      <nav class="ee-grid ee-label ee-foot__links" aria-label="Footer">
        <ul class="ee-foot__col"><li><a href="#">${EE.chars("Link 1")}${arrowUR}</a></li><li><a href="#">${EE.chars("Link 2")}${arrowUR}</a></li></ul>
        <ul class="ee-foot__col">${links.map(([p, h, t]) => `<li><a href="${h}">${EE.chars(t)}</a></li>`).join("")}</ul>
        <ul class="ee-foot__col"><li><button type="button" class="ee-copy" data-copy="hello@example.com" data-cursor="Copy Email" data-cursor-icon="mail">${EE.chars("hello@example.com")}</button></li></ul>
        <ul class="ee-foot__col"><li class="ee-foot__places"><span class="ee-foot__place" aria-current="true">City</span><span class="ee-foot__place">City</span></li><li class="ee-foot__time">Local time <time class="ee-time" data-time>00<i>:</i>00</time></li></ul>
      </nav>
      <div class="ee-foot__name">
        <div class="ee-foot__badges" data-slot="award-badges">${["Award Name 1", "Award Name 2", "Award Name 3", "Award Name 4"].map((t) => `<a class="ee-badge" href="#" aria-label="${t}">${t}</a>`).join("")}</div>
        <p class="ee-big ee-big--full" aria-hidden="true" data-big><span>${NAME}</span></p>
        <p class="ee-big ee-big--first" aria-hidden="true" data-big><span>${NAME.split(" ")[0]}</span></p>
      </div>
      <div class="ee-label ee-foot__legal">
        <p class="ee-foot__legal-start"><span>© 0000 ${NAME}</span><a href="#">${EE.chars("Typeface Source")}${arrowUR}</a></p>
        <p class="ee-foot__legal-links"><a href="#">${EE.chars("Personal information")}</a><button type="button">${EE.chars("Cookie Settings")}</button></p>
      </div>`;
  }

  // ───── Transition curtain, first-page curtain, cursor, cookies
  document.body.insertAdjacentHTML("beforeend", `
    <div class="ee-curtain" aria-hidden="true" data-slot="page-curtain"><p class="ee-curtain__line"><span class="ee-curtain__name">${NAME}</span><span class="ee-curtain__role">Digital Designer</span><span class="ee-curtain__place">City · City</span></p></div>
    <div class="ee-cursor" data-kind="dot" aria-hidden="true"><span class="ee-cursor__dot"></span></div>
    <div class="ee-pill-cursor" data-icon="eye" aria-hidden="true">${EE.px("eye")}${EE.px("mail")}${EE.px("check")}<span class="ee-pill-cursor__label"></span></div>
    <aside class="ee-cookie" data-slot="cookie" hidden><div class="ee-cookie__body">${EE.px("cookie")}<p class="ee-cookie__text">This site uses cookies for visit statistics.</p></div>
      <div class="ee-cookie__actions"><a class="ee-cookie__more" href="#">${EE.chars("Cookie Policy")}</a><button class="ee-cookie__link" type="button">${EE.chars("Essentials only")}</button><button class="ee-cookie__link ee-cookie__accept" type="button">${EE.chars("Accept")}</button></div></aside>`);
  const cookie = document.querySelector(".ee-cookie");
  if (!sessionStorage.getItem("ee-cookie")) cookie.hidden = false;
  cookie.querySelectorAll("button").forEach((b) => b.addEventListener("click", () => { sessionStorage.setItem("ee-cookie", "1"); cookie.hidden = true; }));

  // Local time — the colon blinks in 1-second steps
  const tick = () => {
    const [h, m] = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: "UTC" }).format(Date.now()).split(":");
    document.querySelectorAll("[data-time]").forEach((t) => { t.innerHTML = `${h}<i>:</i>${m}`; });
  };
  tick();
  setInterval(tick, 15000);

  // ───── Text scramble — each letter shuffles through letters of similar width and settles in place (original h: .03s per letter, speed .7)
  const LAT = "abcdefghijklmnopqrstuvwxyz", HAN = "Korean alphabet sample characters";
  EE.scrambleChars = (t) => (/[가-힣]/.test(t) ? HAN : /[A-Z]/.test(t) && !/[a-z]/.test(t) ? LAT.toUpperCase() : LAT);
  EE.charScramble = (chars, { stagger = 0.03, duration = 0.7 } = {}) => {
    const tl = gsap.timeline();
    const widths = chars.map((c) => c.getBoundingClientRect().width / (parseFloat(getComputedStyle(c).fontSize) || 1));
    chars.forEach((c, i) => {
      const t = c.textContent;
      if (!t.trim()) return;
      c.style.width = `${widths[i]}em`;
      tl.to(c, { duration, ease: "none", scrambleText: { text: t, chars: EE.scrambleChars(t), speed: 0.7 }, onComplete: () => { c.style.width = ""; } }, i * stagger);
    });
    return tl;
  };

  // ───── Lenis (original 1.3.26 · lerp .085)
  if (!reduced && window.Lenis) {
    const lenis = (EE.lenis = new Lenis({ lerp: 0.085, smoothWheel: true, wheelMultiplier: 1 }));
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // ───── Promise to wait for the hero opening — on the first page the opening cover, on other pages the transition cover, and once it lifts the entrances run
  let readyFn;
  EE.ready = new Promise((r) => (readyFn = r));
  EE.open = () => { root.classList.add("copy-in"); readyFn(); };

  // ───── Transition curtain
  const curtain = document.querySelector(".ee-curtain");
  const main = document.querySelector("main");
  const FULL = "inset(0% 0% 0% 0%)", BELOW = "inset(100% 0% 0% 0%)", ABOVE = "inset(0% 0% 100% 0%)";
  // The transition mark only accepts documents opened within 5 seconds of the press — so a document refreshed later isn’t covered by the curtain
  const arrived = Date.now() - (+sessionStorage.getItem("ee-nav") || 0) < 5000;
  sessionStorage.removeItem("ee-nav");
  EE.arrived = arrived;
  if (arrived && !reduced) {
    curtain.dataset.active = "";
    gsap.set(curtain, { clipPath: FULL });
    if (main) gsap.set(main, { y: 100 });
    root.classList.remove("ee-arriving");
    // The original lifts the cover when the new section’s data has all arrived (aria-busy cleared). The copy waits for fonts and the document load.
    const loaded = new Promise((r) => (document.readyState === "complete" ? r() : addEventListener("load", r, { once: true })));
    Promise.all([loaded, document.fonts?.ready]).then(() => {
      // The .2s delay is the original value, and the leading .15s is the share where the curtain stays while the original fetches new route data (router fetch)
      const tl = gsap.timeline({ defaults: { duration: 0.8, ease: "power4.out" }, delay: 0.35, onComplete: () => delete curtain.dataset.active });
      tl.fromTo(curtain, { clipPath: FULL }, { clipPath: ABOVE });
      if (main) tl.to(main, { y: 0, clearProps: "transform" }, 0);
      tl.call(EE.open, [], 0);
    });
  } else if (page !== "home" || reduced) {
    requestAnimationFrame(EE.open);
  }
  document.addEventListener("click", (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest?.("a[href]");
    if (!a || (a.target && a.target !== "_self")) return;
    const href = a.getAttribute("href");
    if (!/^[\w-]+\.html(#.*)?$/.test(href)) return;
    const to = new URL(href, location.href);
    if (to.pathname === location.pathname) return;
    e.preventDefault();
    if (reduced) return void (location.href = to.href);
    sessionStorage.setItem("ee-nav", String(Date.now()));
    curtain.dataset.active = "";
    const tl = gsap.timeline({ defaults: { duration: 0.6, ease: "power1.inOut" }, onComplete: () => { location.href = to.href; } });
    tl.fromTo(curtain, { clipPath: BELOW }, { clipPath: FULL });
    if (main) tl.to(main, { y: -100 }, 0);
  }, true);
  addEventListener("pageshow", (e) => { if (e.persisted) { delete curtain.dataset.active; gsap.set(main, { clearProps: "transform" }); } });

  // ───── Header entrance — on the first page the opening curtain brings the wordmark, so only the rest (1s, .1 interval, .2 delay)
  if (head && !reduced) {
    EE.ready.then(() => {
      const sel = page === "home" && root.classList.contains("was-intro") ? ".ee-head__in > :not(.ee-head__mark)" : ".ee-head__in > *";
      gsap.from(head.querySelectorAll(sel), { autoAlpha: 0, y: -16, duration: 1, stagger: 0.1, delay: 0.2 });
    });
  }

  // ───── Cursor — dot and pill
  if (fine) {
    root.classList.add("has-ee-cursor");
    const dot = document.querySelector(".ee-cursor");
    const pill = document.querySelector(".ee-pill-cursor");
    const label = pill.querySelector(".ee-pill-cursor__label");
    const dur = reduced ? 0 : 0.45;
    gsap.set(dot, { autoAlpha: 0 });
    gsap.set(pill, { xPercent: -50, yPercent: -50, scale: 0.4, autoAlpha: 0 });
    const dx = gsap.quickTo(dot, "x", { duration: dur, ease: "power3" }), dy = gsap.quickTo(dot, "y", { duration: dur, ease: "power3" });
    const px = gsap.quickTo(pill, "x", { duration: 0.45, ease: "power3" }), py = gsap.quickTo(pill, "y", { duration: 0.45, ease: "power3" });
    let shown = false, kind = "dot", last = null, at = null, pillOn = null, pillText = null, raf = 0;
    const show = (v) => { if (v !== shown) { shown = v; gsap.to(dot, { autoAlpha: v ? 1 : 0, duration: v ? 0.2 : 0.15, overwrite: "auto" }); } };
    const kindOf = (t) => t?.closest("[data-cursor]") ? "pill" : t?.closest('input:not([type="checkbox"]):not([type="radio"]):not([type="submit"]):not([type="button"]), textarea') ? "text" : t?.closest('a[href], button:not(:disabled), [role="button"], label[for]') ? "link" : "dot";
    const look = (t) => { last = t; const k = kindOf(t); if (k !== kind) { kind = k; dot.dataset.kind = k; } show(!!at); };
    const pillLook = () => {
      if (!at) return;
      const el = document.elementFromPoint(at.x, at.y)?.closest("[data-cursor]") ?? null;
      const icon = el?.getAttribute("data-cursor-icon") || "eye";
      if (el === pillOn) {
        const t = el?.getAttribute("data-cursor");
        if (el && t !== pillText) { pillText = t; gsap.killTweensOf(label); reduced ? (label.textContent = t) : gsap.to(label, { duration: 0.5, ease: "none", scrambleText: { text: t, chars: EE.scrambleChars(t), speed: 0.8 } }); }
        if (el) pill.dataset.icon = icon;
        return;
      }
      pillOn = el;
      if (el) {
        gsap.killTweensOf(label);
        label.textContent = pillText = el.getAttribute("data-cursor");
        pill.dataset.icon = icon;
        pill.dataset.on = "";
        gsap.to(pill, { scale: 1, autoAlpha: 1, duration: 0.4, ease: "back.out(2)", overwrite: "auto" });
      } else gsap.to(pill, { scale: 0.4, autoAlpha: 0, duration: 0.25, ease: "power2.in", overwrite: "auto", onComplete: () => delete pill.dataset.on });
    };
    const queue = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; pillLook(); }); };
    addEventListener("pointermove", (e) => {
      if (e.pointerType !== "mouse") return;
      if (!at) { gsap.set(dot, { x: e.clientX, y: e.clientY }); gsap.set(pill, { x: e.clientX, y: e.clientY }); }
      at = { x: e.clientX, y: e.clientY };
      dx(at.x); dy(at.y); px(at.x); py(at.y);
      e.target !== last ? look(e.target) : show(true);
      queue();
    }, { passive: true });
    addEventListener("pointerdown", (e) => { if (e.pointerType === "mouse") dot.dataset.down = ""; }, { passive: true });
    addEventListener("pointerup", () => delete dot.dataset.down, { passive: true });
    document.addEventListener("pointerout", (e) => { if (!e.relatedTarget) { show(false); at = null; pillOn = null; gsap.to(pill, { autoAlpha: 0, duration: 0.2 }); } }, { passive: true });
    addEventListener("scroll", () => { if (at) { look(document.elementFromPoint(at.x, at.y)); queue(); } }, { passive: true });
    EE.refreshCursor = queue;
  }

  // ───── Copy email — the pill turns into Copied and a check
  document.addEventListener("click", (e) => {
    const b = e.target.closest(".ee-copy");
    if (!b) return;
    navigator.clipboard?.writeText(b.dataset.copy).catch(() => {});
    b.setAttribute("data-cursor", "Copied");
    b.setAttribute("data-cursor-icon", "check");
    EE.refreshCursor?.();
    setTimeout(() => { b.setAttribute("data-cursor", "Copy Email"); b.setAttribute("data-cursor-icon", "mail"); EE.refreshCursor?.(); }, 2400);
  });

  // ───── Entrances — numbers exactly as the original Reveal · SplitLines · ImageReveal · StaggeredText
  const mm = gsap.matchMedia();
  const inView = (el, r = 0.08) => { const b = el.getBoundingClientRect(); return b.top < innerHeight * (1 - r) && b.bottom > 0; };
  // If in the hero, waits for the opening then runs, otherwise once when it arrives in place
  const when = (el, start, fn) => {
    if (inView(el)) EE.ready.then(() => fn(true));
    else ScrollTrigger.create({ trigger: el, start, once: true, onEnter: () => fn(false) });
  };
  // Original StaggeredText curve — first half is back.in (pulls back then enters), second half is expo.out
  const stagEase = (e) => { e *= 2; return e < 1 ? 0.5 * e * e * (2.70158 * e - 1.70158) : 0.5 * (2 - Math.pow(2, -10 * (e - 1))); };
  mm.add(MOTION, () => {
    document.querySelectorAll("[data-reveal='fade']").forEach((el) => {
      const d = +(el.dataset.delay ?? 0);
      when(el, "top 90%", () => gsap.fromTo(el, { opacity: 0, y: 32 }, { opacity: 1, y: 0, delay: d }));
    });
    document.querySelectorAll("[data-reveal='lines']").forEach((el) => {
      const d = +(el.dataset.delay ?? 0);
      SplitText.create(el.querySelector("[data-split]") || el, { type: "lines", mask: "lines", linesClass: "ee-line", autoSplit: true, onSplit: (s) => {
        gsap.set(el, { opacity: 1 });
        gsap.set(s.lines, { yPercent: 110 });
        when(el, "top 90%", () => gsap.to(s.lines, { yPercent: 0, duration: 1.2, stagger: 0.08, ease: "expo.out", delay: d }));
      } });
    });
    document.querySelectorAll("[data-reveal='image']").forEach((el) => {
      const d = +(el.dataset.delay ?? 0);
      when(el, "top 92%", (first) => gsap.fromTo(el, { opacity: 0, y: 80 }, { opacity: 1, y: 0, duration: 1.3, ease: "expo.out", delay: d + (first ? 0.35 : 0) }));
      if (el.hasAttribute("data-parallax")) gsap.fromTo(el.firstElementChild, { yPercent: -5 }, { yPercent: 5, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } });
    });
    // Letters fall from .55em above while a 6px blur clears — with scramble the letters also shuffle
    document.querySelectorAll("[data-reveal='stagger']").forEach((el) => {
      const d = +(el.dataset.delay ?? 0), scramble = el.hasAttribute("data-scramble"), mask = el.hasAttribute("data-mask");
      SplitText.create(el.querySelector("[data-split]") || el, { type: mask ? "lines,words,chars" : "words,chars", ...(mask && { mask: "lines", linesClass: "ee-drop-mask" }), autoSplit: true, onSplit: (s) => {
        gsap.set(el, { opacity: 1 });
        const tl = gsap.timeline({ paused: true });
        if (scramble) {
          tl.from(s.chars, { y: "-0.55em", duration: 1, ease: stagEase, stagger: 0.03 }, 0);
          tl.from(s.chars, { opacity: 0, duration: 0.15, ease: "none", stagger: 0.03 }, 0);
          tl.add(EE.charScramble(s.chars, { stagger: 0.03, duration: 1 }), 0);
        } else tl.from(s.chars, { y: "-0.55em", opacity: 0, duration: 1, ease: stagEase, stagger: 0.03 });
        tl.from(el, { filter: "blur(6px)", duration: 0.8, ease: "power2.out", clearProps: "filter" }, 0);
        when(el, "top 90%", () => gsap.delayedCall(d, () => tl.play()));
        return tl;
      } });
    });
    // Card title: letters scramble on one by one, tags rise from 10px below at .6s expo.out (.12 interval)
    document.querySelectorAll(".ee-card__content").forEach((el) => {
      const t = el.querySelector(".ee-card__title > span"), tags = el.querySelectorAll(".ee-tags li");
      const d = +(el.closest("[data-delay]")?.dataset.delay ?? 0);
      const s = SplitText.create(t, { type: "words,chars" });
      gsap.set(el, { opacity: 1 });
      gsap.set(s.chars, { opacity: 0 });
      gsap.set(tags, { opacity: 0, y: 10 });
      when(el.parentElement, "top 92%", () => {
        const tl = gsap.timeline({ delay: d + 0.35 });
        tl.to(s.chars, { opacity: 1, duration: 0.01, stagger: 0.03 }, 0);
        tl.add(EE.charScramble(s.chars, { stagger: 0.03, duration: 0.6 }), 0);
        tl.to(tags, { opacity: 1, y: 0, duration: 0.6, ease: "expo.out", stagger: 0.12 }, 0.25 + 0.03 * t.textContent.length);
      });
    });
    return () => {};
  });
  mm.add("(prefers-reduced-motion: reduce)", () => { gsap.set("[data-reveal], .ee-card__content", { opacity: 1 }); });

  // ───── Work card hover — the next photo rises from below with a clip (.75s power4.inOut, photo 1.12→1 in 1.05s power3.out) and the one after follows 1.6s later. On leave it returns to the first photo
  if (fine && !reduced) {
    document.querySelectorAll(".ee-card").forEach((card) => {
      const layers = [...card.querySelectorAll(".ee-card__layer")];
      if (layers.length < 2) return;
      let cur = 0, on = false, run = 0, tl = null, next = null;
      const show = (i) => {
        const me = ++run;
        tl?.kill(); next?.kill();
        const m = layers[i];
        const done = () => {
          if (me !== run) return;
          layers.forEach((l) => { if (l !== m) l.removeAttribute("data-active"); l.style.zIndex = ""; });
          cur = i;
          if (on) next = gsap.delayedCall(1.6, () => show((cur + 1) % layers.length));
        };
        if (i === cur) {
          const rest = layers.filter((l) => l !== m && l.hasAttribute("data-active"));
          tl = gsap.timeline({ onComplete: done });
          if (rest.length) tl.to(rest, { clipPath: "inset(100% 0% 0% 0%)", duration: 0.45, ease: "power3.inOut" });
          return;
        }
        layers.forEach((l) => { l.style.zIndex = l === m ? "2" : l.hasAttribute("data-active") && layers.indexOf(l) !== cur ? "1" : ""; });
        m.setAttribute("data-active", "");
        tl = gsap.timeline({ onComplete: done });
        tl.fromTo(m, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.75, ease: "power4.inOut" });
        tl.fromTo(m.firstElementChild, { scale: 1.12 }, { scale: 1, duration: 1.05, ease: "power3.out" }, 0);
      };
      card.addEventListener("pointerenter", () => { on = true; show((cur + 1) % layers.length); });
      card.addEventListener("pointerleave", () => { on = false; next?.kill(); if (cur !== 0 || tl?.isActive()) show(0); });
    });
  }

  // ───── Pixel curtain of the picker row (industry filter in the list section) — cells turn on in shuffled order (within .35s) to cover, then after the change rest .08s and lift the same way
  EE.pixelSwap = (grid, swap) => {
    const cells = grid.querySelectorAll(".ee-card-pixels > span");
    if (!cells.length || reduced) return swap();
    gsap.to(cells, { visibility: "visible", duration: 0, stagger: { amount: 0.35, from: "random" }, onComplete: () => {
      swap();
      const now = grid.querySelectorAll(".ee-card-pixels > span");
      gsap.set(now, { visibility: "visible" });
      ScrollTrigger.refresh();
      gsap.to(now, { visibility: "hidden", duration: 0, delay: 0.08, stagger: { amount: 0.35, from: "random" } });
    } });
  };

  // ───── Decorative-font words — shuffle for .9s, 1.6s after becoming visible
  if (!reduced) {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      EE.ready.then(() => gsap.delayedCall(1.6, () => e.target.querySelectorAll(".ee-word").forEach((w) => {
        const t = w.textContent;
        gsap.to(w, { duration: 0.9, ease: "none", scrambleText: { text: t, chars: EE.scrambleChars(t), speed: 0.6 } });
      })));
    }), { rootMargin: "0px 0px -15% 0px" });
    document.querySelectorAll("main .ee-word").forEach((w) => io.observe(w.closest("h1, h2, h3, p") || w.parentElement));
  }

  // ───── Footer giant name — font size set to fit the width, letters rise from 100% below in 1.2s expo.out (.06 stagger) and blend in
  document.querySelectorAll("[data-big]").forEach((p) => {
    const span = p.firstElementChild;
    const fit = () => {
      if (!p.clientWidth) return;
      span.style.fontSize = "100px";
      const w = span.getBoundingClientRect().width;
      if (!w) return;
      const size = (100 * p.clientWidth) / w;
      span.style.fontSize = `${size}px`;
      p.style.setProperty("--ee-big-size", `${size}px`);
    };
    fit();
    // Measuring before the display font arrives fits the fallback font width and overflows — load that font directly, wait, then measure again
    const face = getComputedStyle(span).fontFamily.split(",")[0];
    document.fonts?.load(`100px ${face}`).then(fit);
    addEventListener("load", fit, { once: true });
    new ResizeObserver(fit).observe(p);
    mm.add(MOTION, () => {
      const s = SplitText.create(span, { type: "chars" });
      fit();
      const tl = gsap.timeline({ scrollTrigger: { trigger: p, start: "top 95%", once: true } });
      tl.from(s.chars, { yPercent: 100, duration: 1.2, ease: "expo.out", stagger: 0.06 });
      tl.add(EE.charScramble(s.chars, { stagger: 0.06, duration: 0.9 }), 0);
      return () => s.revert();
    });
  });

  addEventListener("load", () => ScrollTrigger.refresh());
})();
