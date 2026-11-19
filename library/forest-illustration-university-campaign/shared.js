// Shared across several sections — line-art generator · header · menu · scrollbar · footer · swup transition (first page ↔ lookbook). Section scripts attach via mj.page(name, init) and run again on every transition.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mobile = () => innerWidth < 768;
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  gsap.registerPlugin(ScrollTrigger, CustomEase);
  // Original curve names as they are (Il.*)
  const EASE = {
    out: CustomEase.create("mjOut", "0,0,0.58,1"),
    circOut: CustomEase.create("mjCircOut", "0,0.56,0.46,1"),
    msgOn: CustomEase.create("mjMsgOn", "M0,0 C0.202,1.092 0.358,1.506 1,1"),
    msgHover: CustomEase.create("mjMsgHover", "M0,0 C0,0.408 0.178,0.726 0.231,0.778 0.282,0.829 0.584,1 1,1"),
  };
  const ICON = { arrow: '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h6M6.4 3.4 9 6 6.4 8.6"/></svg>' };

  /* ── Line art — human body (hip origin) · tree layers · clouds · mountains · birds · deer · bear. Angle 0 is down, 90 is right ── */
  const dir = (a) => [Math.sin((a * Math.PI) / 180), Math.cos((a * Math.PI) / 180)];
  const limb = (x, y, [a1, a2], len, w, cls, end) => {
    const [dx1, dy1] = dir(a1), [dx2, dy2] = dir(a2 ?? a1);
    const mx = x + dx1 * len, my = y + dy1 * len, ex = mx + dx2 * len, ey = my + dy2 * len;
    const d = `M${x} ${y}L${mx.toFixed(1)} ${my.toFixed(1)}L${ex.toFixed(1)} ${ey.toFixed(1)}`;
    return `<path class="o" stroke-width="${w + 2.4}" d="${d}"/>` + (cls === "k" || cls === "kk" ? "" : `<path class="l${cls}" stroke-width="${w}" d="${d}"/>`) + (end === "hand" ? `<circle class="s" cx="${ex.toFixed(1)}" cy="${ey.toFixed(1)}" r="2.5"/>` : end === "shoe" ? `<ellipse class="w" cx="${(ex + (dx2 >= 0 ? 1.4 : -1.4)).toFixed(1)}" cy="${ey.toFixed(1)}" rx="4" ry="2.4"/>` : "");
  };
  const HAIR = {
    short: '<path class="b" d="M-9.8-36C-10.5-46-4-48.6 0-48.4 6-48.2 10.6-44 9.8-36 7-40.5 2.5-41.8-1.5-41.2-5.5-40.6-8.2-38.6-9.8-36Z"/>',
    long: '<path class="kk" d="M-9.8-35C-11-46-4-48.6 0-48.4 6-48.2 11-46 9.8-35L10.4-24C8-24 7.4-29 7.6-33 5-38.5-3-39.5-7.6-34-7.6-29-8-24.5-10.4-24Z"/>',
    pink: '<path class="p" d="M-10-33C-13-44-5-50 1-49 9-48 13-42 10-33L12-25C7-25 7-30 7.4-34 4-39-4-39-7.4-34-7.4-30-7-25-12-25Z"/>',
    hat: '<path class="t" d="M-13-41C-12-49-6-52 0-52S12-49 13-41Z"/><path class="t" d="M-16-41H16"/><path class="o" stroke-width="2" d="M-16-41H16"/>',
    blond: '<path class="y" d="M-9.8-36C-10.5-46-4-48.6 0-48.4 6-48.2 10.6-44 9.8-36 7-40.5 2.5-41.8-1.5-41.2-5.5-40.6-8.2-38.6-9.8-36Z"/>',
  };
  const figure = (o) => {
    const { x = 0, y = 0, s = 1, rot = 0, hair = "short", shirt = "w", pants = "t", aL = [-12, -6], aR = [12, 6], lL = [-3, 0], lR = [3, 0], bag = false } = o;
    const arm = shirt === "kk" ? "k" : shirt;
    return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">${bag ? '<rect class="r" x="-14" y="-26" width="9" height="14" rx="3"/>' : ""}${limb(-4.4, -1, lL, 10, 5.5, pants, "shoe")}${limb(4.4, -1, lR, 10, 5.5, pants, "shoe")}<path class="${shirt}" d="M-8-26C-9.4-26-10.4-24.4-10.4-21.6L-9.4 0H9.4L10.4-21.6C10.4-24.4 9.4-26 8-26Z"/>${limb(-8.4, -23.6, aL, 9, 3.4, arm, "hand")}${limb(8.4, -23.6, aR, 9, 3.4, arm, "hand")}<circle class="s" cx="0" cy="-36" r="9.6"/>${HAIR[hair]}<circle class="k" cx="-3.4" cy="-35.4" r="1"/><circle class="k" cx="3.4" cy="-35.4" r="1"/><path class="o" stroke-width="1.3" d="M-1.6-31.2Q0-29.8 1.6-31.2"/></g>`;
  };
  // Trees: split into tiers so each tier sways separately (original tree-1~4, each tier .07s later)
  const tree = (tiers = 3, tone = "g") => {
    let out = '<path class="b" d="M-4 0V-16H4V0Z"/>';
    for (let i = tiers - 1; i >= 0; i--) {
      const w = 16 + i * 7, top = -24 - (tiers - 1 - i) * 16 - 18, bot = top + 26 + i * 2;
      out += `<g class="tier" data-fx-part="tier" style="transform-origin: 0px ${top}px"><path class="${tone}" d="M0 ${top}C4 ${top + 6} ${w * 0.7} ${bot - 8} ${w} ${bot}C${w * 0.4} ${bot + 4} ${-w * 0.4} ${bot + 4} ${-w} ${bot}C${-w * 0.7} ${bot - 8} -4 ${top + 6} 0 ${top}Z"/><path class="o" stroke-width="1.4" d="M${-w * 0.4} ${bot - 6}l2 2M${w * 0.3} ${bot - 9}l2 2M0 ${bot - 12}l2 2"/></g>`;
    }
    return out;
  };
  const cloud = () => '<path class="w" d="M-36 0C-44 0-46-10-38-12-38-20-28-24-22-18-18-28-4-30 2-20 8-28 22-26 24-16 34-18 40-8 34 0Z"/>';
  const bird = (f) => `<g transform="translate(0 -8) rotate(${f ? -6 : 4})"><path class="y" d="M-12 0C-12-8-4-12 4-10 10-14 14-8 12-4 16-2 14 4 8 4H-8C-12 4-12 2-12 0Z"/><path class="y" d="M-2-4C${f ? "-8 -16 4 -18 6 -8" : "-6 2 6 4 6 -4"}Z"/><circle class="k" cx="6" cy="-6" r="1"/><path class="r" d="M12-6 17-5 12-3Z"/></g>`;
  const deer = (f) => `<g transform="translate(0 0)"><path class="y" d="M-16-14C-16-24-4-26 6-24 12-30 18-30 20-24 22-20 18-16 14-16V-2H10V-12H-8V-2H-12V-12C-14-12-16-13-16-14Z"/><path class="o" stroke-width="2" d="M14-28C13-34 10-36 8-38M14-28C16-34 19-35 21-38M16-30C17-33 19-33 20-32"/><circle class="k" cx="16" cy="-25" r="1"/><path class="o" stroke-width="2" d="M-16-16C-20-${f ? 20 : 15}-21-${f ? 18 : 12}-19-12"/></g>`;
  const bear = (f) => `<g><circle class="kk" cx="-8" cy="-44" r="4"/><circle class="kk" cx="8" cy="-44" r="4"/><path class="kk" d="M-12-2C-14-14-14-30-12-36-10-46 10-46 12-36 14-30 14-14 12-2Z"/><circle class="w" cx="0" cy="-30" r="5"/><circle class="w" cx="-5" cy="-37" r="1.4"/><circle class="w" cx="5" cy="-37" r="1.4"/><rect class="t" x="-10" y="-24" width="20" height="14" rx="2" transform="rotate(${f ? -6 : 0} 0 -17)"/></g>`;
  const sign = (f) => `<g><path class="b" d="M-2 0V-40H2V0Z"/><g transform="rotate(${f ? 4 : -2} 0 -34)"><path class="r" d="M-20-38H16L22-33 16-28H-20Z"/></g><g transform="rotate(${f ? -3 : 2} 0 -20)"><path class="b" d="M-22-24H18L22-19 18-14H-22Z"/></g></g>`;
  const rabbit = (f) => `<g transform="rotate(${f ? -8 : 8})"><path class="p" d="M-14-6C-16-14-8-18 0-16 8-18 14-12 12-4 8 0-10 0-14-6Z"/><path class="p" d="M4-16C2-26 4-32 8-32S10-24 8-16M-2-16C-6-24-4-30 0-30S2-22 2-16"/><circle class="k" cx="6" cy="-10" r="1"/></g>`;
  const ILL = {
    hiker: (f) => figure({ y: -21, s: 1.35, hair: "hat", shirt: "w", pants: "b", bag: true, aL: [-40, 40], aR: [40 + f * 10, -40], lL: [-20 + f * 30, -10], lR: [20 - f * 30, 10] }) + `<rect class="w" x="-14" y="-54" width="${24 + f}" height="16" rx="1" transform="rotate(-8 0 -46)"/>`,
    camera: (f) => figure({ y: -8, s: 1.3, hair: "pink", shirt: "w", pants: "t", lL: [100, 10], lR: [-20, 30], aL: [140, 60], aR: [-160 + f * 6, -70] }) + `<rect class="r" x="-8" y="${-48 + f}" width="13" height="9" rx="2"/>`,
    laptop: (f) => figure({ x: 0, y: -6, rot: -80, s: 1.1, hair: "blond", shirt: "w", pants: "t", lL: [-20 - f * 30, -150 + f * 40], lR: [-10, -120 - f * 30], aL: [150, 120], aR: [170, 140] }) + '<rect class="w" x="-40" y="-16" width="16" height="12" rx="1.6"/>',
    telescope: (f) => figure({ y: -21, s: 1.3, hair: "blond", shirt: "p", pants: "w", aL: [-120, -100], aR: [-100 + f * 6, -70] }) + `<g transform="rotate(${-18 + f * 4} -10 -60)"><rect class="b" x="-50" y="-66" width="40" height="10" rx="3"/></g>`,
    student: (f) => figure({ y: -21, s: 1.35, hair: "short", shirt: "t", pants: "kk", aL: [-14, -4], aR: [150 - f * 30, 170 - f * 30] }),
    tree3: () => tree(3), tree4: () => tree(4), treeD: () => tree(4, "d"),
    cloud: () => cloud(), bird, deer, bear, sign, rabbit,
  };
  const drawIll = (el) => {
    const make = ILL[el.dataset.ill];
    if (!make || el.childElementCount) return;
    // In the original, people and animals don’t swap their image — only those with data-flip, like the scrollbar bird, flip between two images
    const frames = el.hasAttribute("data-flip") ? [0, 1] : [0];
    el.innerHTML = frames.map((f) => `<svg ${frames.length > 1 ? 'data-fx-part="frame"' : ""} viewBox="-50 -100 100 100" aria-hidden="true">${make(f)}</svg>`).join("");
    if (el.hasAttribute("data-sway")) el.setAttribute("data-fx", `${el.getAttribute("data-fx") || ""} cascade-sway-loop`.trim());
    if (frames.length > 1) { el.setAttribute("data-fx", `frame-flip-loop ${el.dataset.fx || ""}`.trim()); if (!el.hasAttribute("data-fx-frame-flip-loop")) el.setAttribute("data-fx-frame-flip-loop", `every: ${el.dataset.every || 700}; hide: opacity`); }
  };

  /* ── Header · menu · bar · footer ── */
  const SECTIONS = [["MESSAGES", "#messages"], ["DATA", "#data"], ["LOOKBOOK", "#lookbook"], ["ADMISSIONS", "#admissions"], ["MOVIE", "#movie"]];
  const home = (h) => `index.html${h}`;
  // The lookbook page header has a single ”Close” that returns to the first page instead of nav·menu (original btn-close)
  const header = (layout) => `<div class="mj-head"><a class="mj-logo" href="index.html" aria-label="First Page"><b>OURNAVI<span>2026</span></b><small>Your school intro in one line here</small></a>
      ${layout === "lookbook" ? "" : `<nav class="mj-nav">${SECTIONS.map(([t, h]) => `<a href="${home(h)}"><span>${t}</span></a>`).join("")}</nav>`}</div>
    ${layout === "lookbook" ? '<a class="mj-menu-btn is-close" href="index.html#lookbook" aria-label="Close"><b></b><i></i><i></i></a>' : '<button class="mj-menu-btn" type="button" aria-label="Open Menu" data-menu-btn><b></b><i></i><i></i></button>'}`;
  const menu = () => `<div class="mj-menu" data-menu data-slot="menu-drawer"><button class="mj-menu__overlay" type="button" data-menu-part="overlay" aria-label="Close Menu"></button><nav class="mj-menu__panel" data-menu-part="contents"><button class="mj-menu-btn is-close mj-menu__close" type="button" aria-label="Close Menu" data-menu-close data-menu-part="fade"><b></b><i></i><i></i></button><ul class="mj-menu__list">${[...SECTIONS, ["LOOKBOOK 01", "lookbook.html"], ["INFO", "#info"]].map(([t, h]) => `<li><a href="${h.startsWith("#") ? home(h) : h}"><b class="mj-en" data-menu-part="text">${t}</b><span data-menu-part="fade">Your menu description in one line here</span><i data-menu-part="arrow" data-icon="arrow"></i></a></li>`).join("")}</ul><ul class="mj-menu__sns">${[1, 2, 3, 4].map((i) => `<li data-menu-part="sns"><a href="#" class="wf-logo">SNS ${i}</a></li>`).join("")}</ul><i class="mj-ill mj-menu__bird" data-ill="bird" data-menu-part="bird"></i></nav></div>`;
  const bar = () => `<div class="mj-bar" data-fx="runner-scroll-bar" data-slot="scroll-runner" aria-hidden="true"><div class="mj-bar__track"><span class="mj-bar__drag" data-fx-part="drag"></span>${SECTIONS.map(([t, h]) => `<i class="mj-bar__pt" data-fx-part="point" data-target="${h}" data-name="${t}"></i>`).join("")}<i class="mj-bar__pt" data-fx-part="point" data-target="#info" data-name=""></i></div><span class="mj-bar__bird" data-fx-part="runner"><i class="mj-ill" data-ill="bird" data-flip data-every="300"></i></span><span class="mj-bar__label" data-fx-part="label"></span></div>`;
  const footer = () => `<div class="mj-foot__scene" data-slot="footer-scene">
      <i class="mj-ill" data-ill="cloud" data-float style="left:8%;top:22%;width:9%;--move-x:15px"></i><i class="mj-ill" data-ill="cloud" data-float style="right:12%;top:12%;width:11%;--move-x:12px;--dur:4s"></i>
      <svg class="mj-foot__mtn" viewBox="0 0 1400 520" preserveAspectRatio="none" style="inset:0;width:100%;height:100%"><path class="mj-foot__m1" d="M0 300 140 150 260 260 420 90 600 300 760 170 940 320H0Z"/><path class="mj-foot__m2" d="M600 520 700 300 820 330 900 210 1000 260 1100 120 1200 200 1400 160V520Z"/><path class="mj-foot__hill" d="M-60 520C200 380 520 340 720 360S1260 400 1460 520Z"/></svg>
      <i class="mj-ill" data-ill="hiker" style="left:20%;top:40%;width:5%"></i><i class="mj-ill" data-ill="sign" style="left:25%;top:50%;width:5%"></i><i class="mj-ill" data-ill="student" style="left:56%;top:6%;width:5%"></i>
    </div>
    <div class="mj-foot__body"><h2 class="mj-title"><span class="mj-title__en" data-pop>${[..."OURNAVI"].map((c) => `<span>${c}</span>`).join("")}</span></h2>
      <div class="mj-foot__links"><a class="mj-foot__card" href="#"><small>Your school here</small>Exam candidate guide site</a><div class="mj-foot__mid">Your admissions center here<span>Email: Your address here</span></div><a class="mj-foot__card" href="#"><small>Your school here</small>Official site</a></div>
      <p class="mj-foot__copy">© Your school name here</p></div>
    <a class="mj-foot__top" href="#top">PAGE TOP</a>`;

  const mount = () => {
    const h = document.querySelector('[data-slot="header"]'), layout = document.querySelector("[data-layout]")?.dataset.layout;
    if (h && h.dataset.for !== layout) { h.innerHTML = header(layout); h.dataset.for = layout; }
    const f = document.querySelector('[data-slot="footer"]');
    if (f && !f.childElementCount) { f.classList.add("mj-foot"); f.innerHTML = footer(); }
    if (!document.querySelector("[data-menu]")) document.body.insertAdjacentHTML("beforeend", menu() + bar());
    document.querySelectorAll("[data-icon]").forEach((b) => { if (!b.childElementCount) b.innerHTML = ICON[b.dataset.icon] || ""; });
    document.querySelectorAll(".mj-ill[data-ill]").forEach(drawIll);
  };

  /* ── Loop class (original LoopClass): after a delay, adds className every interval and removes it after duration ── */
  const loops = [];
  const loopClass = (el, { cls = "is-swing", delay = 0, duration = 1500, interval = 2600, out } = {}) => {
    if (reduce) return;
    let t1, t2, iv;
    const fire = () => { el.classList.remove(out || "_"); el.classList.add(cls); t2 = setTimeout(() => { el.classList.remove(cls); if (out) { el.classList.add(out); setTimeout(() => el.classList.remove(out), duration); } }, duration); };
    t1 = setTimeout(() => { fire(); iv = setInterval(fire, interval); }, delay);
    loops.push(() => { clearTimeout(t1); clearTimeout(t2); clearInterval(iv); });
  };
  const startTrees = (root = document) => root.querySelectorAll("[data-tree]").forEach((el) => loopClass(el, { delay: (mobile() ? +(el.dataset.delaySp ?? el.dataset.delay ?? 0) : +(el.dataset.delay || 0)) * 1000, duration: 1500, interval: 2600 }));

  /* ── Balloon title: when visible, the letters swell 0→1.2→1 at .11s intervals (same keyframes as the original logo textView) ── */
  const own = [];
  const popTitles = (root = document) => {
    if (reduce) return;
    root.querySelectorAll("[data-pop]").forEach((t) => {
      const ch = [...t.children];
      gsap.set(ch, { scale: 0 });
      own.push(ScrollTrigger.create({ trigger: t, start: "top 85%", once: true, onEnter: () => gsap.to(ch, { keyframes: [{ scale: 1.2, duration: 0.37, ease: "power1.inOut" }, { scale: 1, duration: 0.3, ease: "power1.inOut" }], stagger: 0.11 }) }));
    });
  };

  /* ── Menu (original Menu): the panel slides in from the right at .5s circ.out, then text after .5s, arrow at .67s, social links at .83s, and a bird flies in at 1s. On close the bird flies upward and the panel drops away ── */
  let menuTl = null;
  const part = (n) => [...document.querySelectorAll(`[data-menu-part="${n}"]`)];
  const toggleMenu = (on = !document.body.classList.contains("is-menu")) => {
    const box = document.querySelector("[data-menu]");
    if (!box) return;
    document.querySelector("[data-menu-btn]")?.setAttribute("aria-label", on ? "Close Menu" : "Open Menu");
    menuTl?.kill();
    if (reduce) { document.body.classList.toggle("is-menu", on); box.style.visibility = on ? "visible" : ""; return; }
    if (on) {
      document.body.classList.add("is-menu");
      box.style.visibility = "visible";
      gsap.set(part("overlay"), { opacity: 0 }); gsap.set(part("contents"), { x: "100%" });
      gsap.set(part("text"), { y: 10, opacity: 0.3, visibility: "hidden" }); gsap.set(part("fade"), { opacity: 0.3, visibility: "hidden" });
      gsap.set(part("arrow"), { x: -10, opacity: 0.5, visibility: "hidden" }); gsap.set(part("sns"), { scale: 1.1, opacity: 0.5, visibility: "hidden" });
      gsap.set(part("bird"), { x: -110, y: -10, rotation: 20, opacity: 1, visibility: "hidden" });
      menuTl = gsap.timeline()
        .to(part("overlay"), { opacity: 1, duration: 0.5, ease: "circ.out" }, 0).to(part("contents"), { x: 0, duration: 0.5, ease: "circ.out" }, 0)
        .to(part("text"), { y: 0, opacity: 1, visibility: "visible", duration: 0.3, ease: "power1.out" }, 0.5).to(part("fade"), { opacity: 1, visibility: "visible", duration: 0.3, ease: "power1.out" }, 0.5)
        .to(part("arrow"), { x: 0, opacity: 1, visibility: "visible", duration: 0.3, ease: "power1.out" }, 0.67).to(part("sns"), { scale: 1, opacity: 1, visibility: "visible", duration: 0.3, ease: "power1.out" }, 0.83)
        .to(part("bird"), { x: 0, y: 0, rotation: 0, visibility: "visible", duration: 1, ease: "power1.out" }, 0.83);
    } else {
      menuTl = gsap.timeline()
        .to(part("overlay"), { opacity: 0, duration: 0.5, ease: "circ.out" }, 0).to(part("contents"), { x: "100%", duration: 0.5, ease: "circ.out" }, 0)
        .to([...part("text"), ...part("fade"), ...part("arrow"), ...part("sns")], { opacity: 0, duration: 0.03 }, 0)
        .to(part("bird"), { x: 200, y: -70, rotation: -20, duration: 1, ease: "power1.in" }, 0).to(part("bird"), { opacity: 0, duration: 0.16, ease: "power1.out" }, 0.84)
        .call(() => document.body.classList.remove("is-menu"), null, 0.5).call(() => { box.style.visibility = ""; }, null, 1);
    }
  };
  document.addEventListener("click", (e) => { if (e.target.closest("[data-menu-btn]")) toggleMenu(); else if (e.target.closest('[data-menu-part="overlay"]') || e.target.closest("[data-menu-close]") || e.target.closest("[data-menu] a")) toggleMenu(false); });
  addEventListener("keydown", (e) => { if (e.key === "Escape" && document.body.classList.contains("is-menu")) toggleMenu(false); });

  /* ── Section script registration — when swup swaps the body, the old section is removed and the new one attached ── */
  const pages = {};
  let cleanup = [];
  const run = () => {
    cleanup.forEach((f) => f?.()); cleanup = [];
    loops.splice(0).forEach((f) => f());
    own.splice(0).forEach((t) => t.kill());
    mount();
    const name = document.querySelector("[data-layout]")?.dataset.layout;
    startTrees(); popTitles();
    if (pages[name]) cleanup.push(pages[name]());
    requestAnimationFrame(() => ScrollTrigger.refresh());
  };
  window.mj = { reduce, mobile, wait, EASE, ICON, drawIll, loopClass, page: (name, fn) => { pages[name] = fn; } };

  // On first load: the background-color panel is lifted .5s after load (original Loader)
  addEventListener("load", () => { document.documentElement.classList.add("is-loaded"); setTimeout(() => document.querySelector("[data-loader]")?.remove(), 500); });
  document.addEventListener("DOMContentLoaded", () => {
    run();
    if (!window.Swup || reduce) return;
    // Original swup 4.8.2 + JsPlugin: first page → lookbook scatters clouds ±70px to the sides · character ±130px · cards ±500px · ±24°, then lookbook → first page uses a .83s background panel
    const side = (el) => { const r = el.getBoundingClientRect(); return r.left + r.width / 2 < innerWidth / 2 ? -1 : 1; };
    const swup = new Swup({
      containers: ["[data-layout]"], animationSelector: false, animateHistoryBrowsing: true,
      plugins: [new SwupScrollPlugin({ animateScroll: false }), new SwupBodyClassPlugin(), new SwupJsPlugin({ animations: [
        { from: "(.*)index.html(.*)", to: "(.*)lookbook.html(.*)", out: async (done, { visit }) => {
          document.querySelectorAll("[data-out-cloud]").forEach((c) => c.style.setProperty("--cloud-x", `${70 * side(c)}px`));
          document.querySelectorAll("[data-out-char]").forEach((c) => c.style.setProperty("--cloud-x", `${130 * side(c)}px`));
          document.querySelectorAll("[data-out-link]").forEach((c) => { c.style.setProperty("--link-x", `${500 * side(c)}px`); c.style.setProperty("--link-r", `${24 * side(c)}deg`); });
          visit.trigger.el?.parentElement?.classList.add("is-clicked");
          document.documentElement.classList.add("is-home-to-lookbook");
          await wait(830); document.documentElement.classList.remove("is-loaded"); await wait(50); done();
        }, in: async (done) => { document.documentElement.classList.remove("is-home-to-lookbook"); await wait(50); document.documentElement.classList.add("is-loaded"); done(); } },
        { from: "(.*)lookbook.html(.*)", to: "(.*)index.html(.*)", out: async (done) => { window.mjHeroSkip = true; document.documentElement.classList.add("is-loading"); await gsap.to("[data-layout]", { opacity: 0, duration: 0.67 }); done(); }, in: async (done) => { await wait(320); document.documentElement.classList.remove("is-loading"); done(); } },
      ] })],
    });
    swup.hooks.on("page:view", () => { window.scrollTo(0, 0); run(); });
  });
})();
