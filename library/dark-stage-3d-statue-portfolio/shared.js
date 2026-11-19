// The same header band, menu drawer, side drawer, cursor, form and footer go on every page. Between pages there is no transition effect, as in the original, and the page loads fresh (WordPress full reload).
// Menu open values are carried over as is from the original navigation-desktop.js timeline (ink 0.7s → letters back.inOut(3) → on close, reversed at 3x speed).
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  gsap.registerPlugin(ScrollTrigger, SplitText);

  // Convert the skin variable colors to rgb(a) — GSAP and canvas can’t read var() or color-mix. Paint onto 1px and read it back so any color syntax becomes the same value
  const px = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  window.bsRgb = (css, alpha = 1) => {
    const el = document.createElement("i");
    el.style.color = css;
    document.documentElement.appendChild(el);
    const c = getComputedStyle(el).color;
    el.remove();
    px.clearRect(0, 0, 1, 1);
    px.fillStyle = c;
    px.fillRect(0, 0, 1, 1);
    const [r, g, b] = px.getImageData(0, 0, 1, 1).data;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const chev = '<svg viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3.5 1.5 7 5l-3.5 3.5"/></svg>';
  const mark = `<svg class="bs-logo__mark" viewBox="0 0 28 28"><rect width="28" height="28" rx="7" style="fill: var(--kf-accent)"/><path d="M8 20V8h6.2c2.4 0 3.8 1.2 3.8 3 0 1.2-.7 2.1-1.8 2.5 1.4.3 2.3 1.4 2.3 2.9 0 2.2-1.6 3.6-4.2 3.6H8Zm3-7.2h2.7c1 0 1.5-.5 1.5-1.2s-.5-1.2-1.5-1.2H11v2.4Zm0 4.8h3.1c1.1 0 1.7-.5 1.7-1.3s-.6-1.3-1.7-1.3H11v2.6Z" style="fill: var(--kf-on-accent)"/></svg>`;
  const iconIn = '<svg viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="5.5" width="3" height="9.5"/><circle cx="2.5" cy="2.5" r="1.7"/><path d="M6.5 5.5h2.9v1.3c.5-.8 1.5-1.5 3-1.5 2.4 0 3.1 1.5 3.1 3.9V15h-3v-5.2c0-1.2-.3-2-1.3-2-1.1 0-1.7.8-1.7 2V15h-3z"/></svg>';
  const iconIg = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1.5" y="1.5" width="13" height="13" rx="4"/><circle cx="8" cy="8" r="3"/><circle cx="12" cy="4" r=".6" fill="currentColor"/></svg>';

  // ── Video slot: loops silently like the original. Plays only while visible on screen (same as Chrome pausing hidden muted autoplay),
  // A video the user paused stays paused when it comes into view again. With reduced motion, it does not play ──
  const seen = new IntersectionObserver((es) => es.forEach((e) => {
    const v = e.target;
    if (e.isIntersecting && !v.dataset.held) v.play().catch(() => {});
    else if (!e.isIntersecting) v.pause();
  }), { threshold: 0.01 });
  window.bsVideo = {
    watch(v) { v.muted = true; if (reduce) { v.removeAttribute("autoplay"); v.pause(); } else seen.observe(v); },
    // Width of bar i as its share of playback time
    bar(v, i) { if (!v || !i) return; const f = () => { if (v.duration) i.style.width = (v.currentTime / v.duration) * 100 + "%"; }; v.addEventListener("timeupdate", f); gsap.ticker.add(() => !v.paused && f()); },
  };
  $$("video[data-play]").forEach((v) => bsVideo.watch(v));

  // ── Header band ──
  const head = $("[data-slot=header]");
  if (head) {
    const sub = document.body.dataset.logoSub;
    head.className = "bs-head";
    head.innerHTML = `
      <a class="bs-logo${sub ? " has-sub" : ""}" href="index.html" aria-label="Back to start">${mark}
        <span><span class="bs-logo__word" data-label="Your brand’s English name here">Studio Name</span>${sub ? `<span class="bs-logo__sub">${sub}</span>` : ""}</span></a>
      <button class="bs-toggle" type="button" aria-label="Open Menu" aria-expanded="false"><i></i><i></i><i></i><i></i></button>`;
  }

  // Header text color: dark cell (data-tone=Turns white when dark) hits the header band height
  const tone = { forced: null };
  const paintHead = () => {
    if (!head) return;
    if (tone.forced) return head.classList.toggle("is-dark", tone.forced === "dark");
    const y = 35;
    const dark = $$("[data-tone=dark]").some((el) => { const r = el.getBoundingClientRect(); return r.top <= y && r.bottom > y; });
    head.classList.toggle("is-dark", dark);
  };
  addEventListener("scroll", paintHead, { passive: true });
  addEventListener("resize", paintHead);
  window.bsHead = {
    el: head,
    force(t) { tone.forced = t; paintHead(); },
    hide(on) { head && head.classList.toggle("is-hidden", on); },
    paint: paintHead,
  };

  // ── Menu Drawer ──
  const menu = document.createElement("div");
  menu.className = "bs-menu";
  menu.setAttribute("data-slot", "menu-overlay");
  menu.innerHTML = `
    <div class="bs-menu__ink"></div>
    <div class="bs-menu__in">
      <nav class="bs-menu__nav" aria-label="Main menu" data-label="Five section names (one or two English words each)"><ul>
        <li><a href="#" data-drawer="solutions">Solutions</a></li>
        <li><a href="#" data-drawer="services">Services</a></li>
        <li><a href="works.html">Works</a></li>
        <li><a href="#" data-drawer="insights">Insights</a></li>
        <li><a href="about.html">About</a></li>
      </ul></nav>
      <div class="bs-menu__side">
        <div class="bs-menu__figure wf-img" data-label="White statue cutout · figure carrying a club · front lighting · portrait 3:4"></div>
        <a class="bs-menu__cta" href="#talk" data-label="Contact button English text">Contact ${chev}</a>
        <div class="bs-menu__icons"><a href="#" aria-label="Professional network">${iconIn}</a><a href="#" aria-label="Social Media">${iconIg}</a></div>
      </div>
      <div class="bs-menu__links"><a href="#">Your link @ID here</a><a href="index.html">&lt; Back to start</a></div>
    </div>
    <button class="bs-menu__close" type="button" aria-label="Close Menu"><svg viewBox="0 0 36 36" fill="none" stroke="currentColor" stroke-width="2"><path d="m10 10 16 16M26 10 10 26"/></svg></button>`;
  document.body.append(menu);

  const navLinks = $$(".bs-menu__nav a", menu);
  const splits = navLinks.map((a) => new SplitText(a, { type: "chars", charsClass: "nav-char" }));
  const mtl = gsap.timeline({ paused: true, onReverseComplete: () => gsap.set(menu, { visibility: "hidden" }) });
  mtl.to($(".bs-menu__ink", menu), { clipPath: () => `circle(150% at ${menu.style.getPropertyValue("--ox") || "95%"} ${menu.style.getPropertyValue("--oy") || "5%"})`, duration: 0.7, ease: "power2.inOut" }).addLabel("start");
  splits.forEach((sp, i) => {
    mtl.addLabel(`start-${i}`, "-=0.32");
    mtl.fromTo(sp.chars, { scale: 1.2, opacity: 0, x: 30 }, { scale: 1, opacity: 1, x: 0, duration: 0.3, stagger: 0.02, ease: "back.inOut(3)" }, `start-${i}`);
  });
  mtl.addLabel("button");
  mtl.fromTo([$(".bs-menu__cta", menu), $(".bs-menu__figure", menu)], { opacity: 0, x: 100 }, { opacity: 1, x: 0, duration: 0.6, ease: "back.inOut(3)" }, "button-=0.28");
  mtl.addLabel("icons");
  mtl.fromTo($$(".bs-menu__icons a", menu), { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.05, ease: "back.inOut(3)" }, "icons-=0.15");
  mtl.addLabel("closeItem");
  mtl.fromTo($(".bs-menu__close", menu), { opacity: 0 }, { opacity: 1, duration: 0.9, ease: "power2.inOut" }, "closeItem-=0.9");
  mtl.addLabel("closeLink");
  mtl.fromTo($$(".bs-menu__links a", menu), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.2, stagger: 0.08, ease: "power2.inOut" }, "closeLink-=0.2");

  const toggle = head && $(".bs-toggle", head);
  const openMenu = () => {
    if (toggle) {
      const r = toggle.getBoundingClientRect();
      menu.style.setProperty("--ox", `${r.left + r.width / 2}px`);
      menu.style.setProperty("--oy", `${r.top + r.height / 2}px`);
    }
    mtl.invalidate();
    gsap.set(menu, { visibility: "visible" });
    toggle && toggle.setAttribute("aria-expanded", "true");
    if (reduce) mtl.progress(1).pause(); else mtl.timeScale(1).play();
  };
  const closeMenu = () => {
    toggle && toggle.setAttribute("aria-expanded", "false");
    if (reduce) { mtl.progress(0).pause(); gsap.set(menu, { visibility: "hidden" }); } else mtl.timeScale(3).reverse();
  };
  toggle && toggle.addEventListener("click", openMenu);
  $(".bs-menu__close", menu).addEventListener("click", closeMenu);
  $(".bs-menu__cta", menu).addEventListener("click", closeMenu);
  addEventListener("keydown", (e) => { if (e.key === "Escape") { closeMenu(); closeDrawer(); } });

  // ── Side Drawer ──
  const item = (n, d) => `<a href="#"><b>${n}</b>${d ? `<small>${d}</small>` : ""}</a>`;
  const drawers = {
    solutions: { lead: "One line asking which goal it suits goes here.", items: [item("Solution 01", "Your line and a half of description here. What you do together."), item("Solution 02", "Your one-line description goes here."), item("Solution 03", "Your one-line description goes here."), item("Solution 04", "Your one-line description goes here.")] },
    services: { lead: "One line asking how we can help", items: [item("Service 01", "Your one-line description goes here."), item("Service 02", "Your one-line description goes here."), item("Service 03", "Your one-line description goes here."), item("Service 04", "Your one-line description goes here.")] },
    insights: { lead: "Your article collection intro in one line here", items: ["Category 01", "Category 02", "Category 03", "Category 04", "Category 05", "Category 06"].map((n) => item(n)) },
    about: { lead: "Your about group here, one line", items: ["About Me", "Team", "Awards", "Reviews", "Contact"].map((n) => item(n)) },
  };
  const drawer = document.createElement("div");
  drawer.className = "bs-drawer";
  drawer.setAttribute("data-slot", "offcanvas");
  drawer.innerHTML = `<div class="bs-drawer__veil"></div><aside class="bs-drawer__panel" role="dialog" aria-modal="true"><p class="bs-drawer__lead"></p><div class="bs-drawer__list"></div><button class="bs-drawer__back" type="button">&lt; Close</button></aside>`;
  document.body.append(drawer);
  const dtl = gsap.timeline({ paused: true, onReverseComplete: () => gsap.set(drawer, { visibility: "hidden" }) })
    .set(drawer, { visibility: "visible" })
    .to($(".bs-drawer__veil", drawer), { opacity: 1, duration: 0.45, ease: "power2.out" }, 0)
    .to($(".bs-drawer__panel", drawer), { x: 0, duration: 0.55, ease: "power2.out" }, 0)
    .from(() => $$(".bs-drawer__list a", drawer), { opacity: 0, y: 20, duration: 0.45, stagger: 0.06, ease: "power2.out" }, 0.2);
  const openDrawer = (key) => {
    const d = drawers[key];
    if (!d) return;
    $(".bs-drawer__lead", drawer).textContent = d.lead;
    $(".bs-drawer__list", drawer).innerHTML = d.items.join("");
    dtl.invalidate();
    if (reduce) dtl.progress(1).pause(); else dtl.timeScale(1).play(0);
  };
  function closeDrawer() { if (reduce) { dtl.progress(0).pause(); gsap.set(drawer, { visibility: "hidden" }); } else if (dtl.progress() > 0) dtl.timeScale(1.6).reverse(); }
  $(".bs-drawer__veil", drawer).addEventListener("click", closeDrawer);
  $(".bs-drawer__back", drawer).addEventListener("click", closeDrawer);
  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-drawer]");
    if (!t) return;
    e.preventDefault();
    if (menu.style.visibility !== "hidden" && mtl.progress() > 0) closeMenu();
    openDrawer(t.dataset.drawer);
  });

  // ── ”Let’s talk” form ──
  $$("[data-talk]").forEach((sec) => {
    sec.classList.add("bs-talk");
    sec.id = sec.id || "talk";
    sec.innerHTML = `
      <h2 class="bs-talk__title" data-label="Contact section English greeting title (two words)"><span class="line"><span>Say hello</span></span></h2>
      <p class="bs-talk__sub">${sec.dataset.talk || "Your one sentence here: let’s talk about what’s next together."}</p>
      <form class="bs-form" onsubmit="return false">
        <input type="text" placeholder="Name" aria-label="Name">
        <input type="email" placeholder="Email" aria-label="Email">
        <textarea placeholder="Field here for your concerns or goals" aria-label="Content"></textarea>
        <button class="bs-btn" type="submit">Your send button $ here{chev}</button>
        <p class="bs-form__note">One short line here saying you’ll get news once you send.</p>
      </form>`;
  });

  // ── Footer ──
  const qr = (() => {
    let s = 7, cells = "";
    const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
    const finder = (x, y) => `<rect x="${x}" y="${y}" width="7" height="7" fill="#000"/><rect x="${x + 1}" y="${y + 1}" width="5" height="5" fill="#fff"/><rect x="${x + 2}" y="${y + 2}" width="3" height="3" fill="#000"/>`; // Not skin: a QR code must be black cells on white to be readable
    for (let y = 0; y < 25; y++) for (let x = 0; x < 25; x++) {
      if ((x < 8 && y < 8) || (x > 16 && y < 8) || (x < 8 && y > 16)) continue;
      if (rnd() > 0.52) cells += `<rect x="${x}" y="${y}" width="1" height="1"/>`;
    }
    return `<svg viewBox="-2 -2 29 29" aria-hidden="true"><g fill="#000">${cells}</g>${finder(0, 0)}${finder(18, 0)}${finder(0, 18)}</svg>`; // Not Skin: QR
  })();
  const group = (h, n) => `<div class="bs-foot__group"><h4>${h}</h4>${Array.from({ length: n }, (_, i) => `<a href="#">Your item $ here{i + 1}</a>`).join("")}</div>`;
  const foot = $("[data-slot=footer]");
  if (foot) {
    foot.classList.add("bs-foot");
    foot.innerHTML = `
      <div class="bs-foot__panel">
        <span class="bs-foot__handle" aria-hidden="true"></span>
        <button class="bs-foot__up" type="button" aria-label="Back to top"><svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 12V2M2.5 6.5 7 2l4.5 4.5"/></svg></button>
        <div class="bs-foot__list" data-label="Group heading is the English section name, items below are in Korean"><div class="bs-foot__scroll">
          ${group("Group 01", 4)}${group("Group 02", 6)}${group("Group 03", 8)}${group("Group 04", 7)}
        </div></div>
        <div class="bs-foot__fist" data-slot="chrome-fist">${fistSVG()}</div>
        <div class="bs-foot__right">
          <div class="bs-foot__cols">
            <div><h4><a href="works.html" style="display:inline;font:inherit;color:inherit">:: Works</a></h4><p>Your short description here<br>Split into three lines<br>We put it in.</p></div>
            <div><h4>Academy</h4><p>Your short description here<br>Set in two lines.</p></div>
            <div><h4>Insights</h4>${Array.from({ length: 8 }, (_, i) => `<a href="#">Your post category $ here{i + 1}</a>`).join("")}</div>
            <div><h4><a href="about.html" style="display:inline;font:inherit;color:inherit">About</a></h4>${["Story", "Team", "Award", "Contact info"].map((n) => `<a href="#">${n}</a>`).join("")}</div>
          </div>
          <div class="bs-foot__cta"><span class="bs-foot__glow"></span><a class="bs-btn" href="#talk">Your contact button label here</a><i></i></div>
          <p class="bs-foot__follow">Your follow-along here</p>
          <div class="bs-foot__social"><a href="#" aria-label="Professional network">${iconIn}</a><a href="#" aria-label="Social Media">${iconIg}</a></div>
          <div class="bs-foot__legal"><a href="#">Cookie Policy</a><a href="#">Personal information</a><a href="#">Terms of service</a></div>
          <p class="bs-foot__love">Your one-line signature phrase here.</p>
          <p class="bs-foot__copy">© Your Name, 0000</p>
        </div>
        <div class="bs-foot__qr">View on phone${qr}</div>
      </div>`;
    $(".bs-foot__up", foot).addEventListener("click", () => scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }));
  }

  // Chrome fist: an SVG drawing of the original’s 3D chrome arm (tattoo) at the same place and size — metal band gradient and tattoo lines
  function fistSVG() {
    return `<svg viewBox="0 0 380 630" aria-label="Chrome fist illustration on a tattooed arm">
      <defs>
        <linearGradient id="chA" x1="0" x2="1"><stop offset="0" stop-color="#1a1a1a"/><stop offset=".22" stop-color="#6c6c6c"/><stop offset=".42" stop-color="#e9e9e9"/><stop offset=".55" stop-color="#9b9b9b"/><stop offset=".8" stop-color="#3a3a3a"/><stop offset="1" stop-color="#0e0e0e"/></linearGradient> <!-- Not skin: chrome metal material and tattoo lines — they are material colors baked into the original PNG artwork, so they stay chrome even when the skin is changed -->
        <linearGradient id="chB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4f4f4"/><stop offset=".35" stop-color="#a9a9a9"/><stop offset=".7" stop-color="#4a4a4a"/><stop offset="1" stop-color="#1c1c1c"/></linearGradient> <!-- Not skin: chrome metal material and tattoo lines — they are material colors baked into the original PNG artwork, so they stay chrome even when the skin is changed -->
        <linearGradient id="chC" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#d9d9d9"/><stop offset=".5" stop-color="#5c5c5c"/><stop offset="1" stop-color="#181818"/></linearGradient> <!-- Not skin: chrome metal material and tattoo lines — they are material colors baked into the original PNG artwork, so they stay chrome even when the skin is changed -->
        <radialGradient id="chGlow" cx=".5" cy=".4" r=".5"><stop offset="0" stop-color="#fff" stop-opacity=".09"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient> <!-- Not skin: chrome metal material and tattoo lines — they are material colors baked into the original PNG artwork, so they stay chrome even when the skin is changed -->
        <filter id="chBlur"><feGaussianBlur stdDeviation="3"/></filter>
      </defs>
      <ellipse cx="190" cy="260" rx="190" ry="260" fill="url(#chGlow)"/>
      <path d="M118 630c-3-110 4-230 22-330h112c16 100 22 220 20 330z" fill="url(#chA)"/>
      <g fill="none" stroke="#0b0b0b" stroke-opacity=".55" stroke-width="2.2" stroke-linecap="round"> <!-- Not skin: chrome metal material and tattoo lines — they are material colors baked into the original PNG artwork, so they stay chrome even when the skin is changed -->
        <path d="M140 360c30 10 58 4 84-12 18-10 30-6 34 6"/><path d="M134 420c26 22 64 26 98 8"/><path d="M152 470c10-20 34-28 56-20s30 30 18 48-40 22-58 8"/>
        <path d="M128 540c40-14 84-12 132 6"/><path d="M146 580c24 12 52 14 84 2"/><path d="M200 380c-8 20-6 40 6 58"/>
        <path d="M168 500c-12 26-10 56 6 82" stroke-opacity=".35"/><path d="M236 450c10 30 8 66-8 98" stroke-opacity=".35"/>
      </g>
      <path d="M210 330c6 4 10 12 6 20m4-24c8 6 10 18 4 26" stroke="#0b0b0b" stroke-opacity=".6" stroke-width="2" fill="none"/> <!-- Not skin: chrome metal material and tattoo lines — they are material colors baked into the original PNG artwork, so they stay chrome even when the skin is changed -->
      <rect x="92" y="196" width="200" height="130" rx="46" fill="url(#chC)"/>
      <rect x="98" y="118" width="50" height="126" rx="25" fill="url(#chB)" transform="rotate(-6 123 181)"/>
      <rect x="146" y="104" width="52" height="136" rx="26" fill="url(#chB)" transform="rotate(-2 172 172)"/>
      <rect x="196" y="108" width="52" height="134" rx="26" fill="url(#chB)" transform="rotate(3 222 175)"/>
      <rect x="244" y="126" width="46" height="118" rx="23" fill="url(#chB)" transform="rotate(8 267 185)"/>
      <rect x="104" y="236" width="150" height="50" rx="25" fill="url(#chA)" transform="rotate(-7 179 261)"/>
      <g fill="#fff" filter="url(#chBlur)" opacity=".85"> <!-- Not skin: chrome metal material and tattoo lines — they are material colors baked into the original PNG artwork, so they stay chrome even when the skin is changed -->
        <ellipse cx="122" cy="140" rx="9" ry="18"/><ellipse cx="170" cy="126" rx="10" ry="20"/><ellipse cx="220" cy="130" rx="10" ry="20"/><ellipse cx="264" cy="148" rx="8" ry="16"/>
        <ellipse cx="160" cy="250" rx="34" ry="6"/><ellipse cx="196" cy="380" rx="6" ry="60" opacity=".5"/>
      </g>
    </svg>`;
  }

  // ── Cursor ──
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (fine) {
    const cur = document.createElement("div");
    cur.className = "bs-cursor";
    cur.innerHTML = '<span class="bs-cursor__dot"></span><span class="bs-cursor__ring"></span><span class="bs-cursor__label"></span>';
    document.body.append(cur);
    const qx = gsap.quickTo(cur, "x", { duration: 0.18, ease: "power2.out" });
    const qy = gsap.quickTo(cur, "y", { duration: 0.18, ease: "power2.out" });
    addEventListener("pointermove", (e) => { qx(e.clientX); qy(e.clientY); }, { passive: true });
    document.addEventListener("pointerover", (e) => {
      const lab = e.target.closest("[data-cursor]");
      cur.classList.toggle("has-label", !!lab);
      if (lab) $(".bs-cursor__label", cur).textContent = lab.dataset.cursor;
      cur.classList.toggle("is-hover", !lab && !!e.target.closest("a, button, input, textarea, [role=button]"));
    });
  }

  // ── Film Grain ──
  const grain = document.createElement("div");
  grain.className = "bs-grain";
  document.body.append(grain);

  // ── Common reveal: data-up groups rise from below at 0.15s intervals ──
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    $$("[data-up-group]").forEach((g) => {
      gsap.from($$("[data-up]", g), { y: 40, opacity: 0, duration: 0.8, ease: "power2.out", stagger: 0.15, scrollTrigger: { trigger: g, start: "top 85%" } });
    });
    $$(".bs-talk__title .line > span").forEach((s) => {
      gsap.from(s, { yPercent: 100, duration: 1, ease: "power2.out", scrollTrigger: { trigger: s, start: "top 90%" } });
    });
  });

  addEventListener("load", () => { ScrollTrigger.refresh(); paintHead(); });
  paintHead();
})();
