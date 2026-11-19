// Every section uses the same overlay, menu and footer — the markup is injected in this one place so no section needs editing.
// Like the original (Brand theme main.js), ScrollSmoother (smooth 1.5) is applied only on wide screens, and section motion starts after the cover lifts (fx:phase open).
(() => {
  const page = document.body.dataset.page || "home";
  const SM = 767;
  const isPc = () => document.body.clientWidth > SM;
  // Original rpx — px measured at 1440 (phone 375) width, converted to the current width
  const rpx = (x) => (x * document.body.clientWidth) / (isPc() ? 1440 : 375);
  const lvh = () => {
    const probe = document.createElement("div");
    probe.style.cssText = "position:fixed;height:100lvh;width:0;visibility:hidden";
    document.body.append(probe);
    const h = probe.offsetHeight;
    probe.remove();
    return h || innerHeight;
  };
  const setVw = () => document.documentElement.style.setProperty("--vw", document.body.clientWidth + "px");
  setVw();
  addEventListener("resize", setVw);

  const ROLL = 'data-fx="char-roll" data-fx-char-roll="mode: once; dur: .75; ease: 0.19,1,0.22,1; gap: 2"';
  // Original logo image spot — newly drawn two-letter S·C shapes in bold lines (stacked staggered vertically, S on top and C at bottom right)
  const MARK_V = '<path d="M60 10H30a12 12 0 0 0 0 24h6a12 12 0 0 1 0 24H6"/><path d="M78 68H54a15 15 0 0 0 0 30h24"/>';
  const MARK_H = '<path d="M60 14H30a18 18 0 0 0 0 36h8a18 18 0 0 1 0 36H8"/><path d="M136 14h-32a36 36 0 0 0 0 72h32"/>';
  const markV = () => `<svg class="sc-mark" viewBox="0 0 84 106" aria-hidden="true">${MARK_V}</svg>`;
  const markH = () => `<svg class="sc-mark" viewBox="0 0 140 100" aria-hidden="true">${MARK_H}</svg>`;
  // First-visit panel logo — as in the original, eight pieces (4 S, 4 C) slide in from different sides over 1.5s and fit together
  const PARTS = [
    ["s1", 0, 0, 119, 191, "101%,101%", 0.35], ["s2", 119, 0, 113, 191, "-101%,0", 0.55], ["s3", 0, 191, 120, 193, "101%,0", 0.45], ["s4", 120, 191, 118, 193, "0,-101%", 0.65],
    ["c1", 232, 0, 163, 191, "0,101%", 0.65], ["c2", 395, 0, 140, 191, "-101%,0", 0.35], ["c3", 238, 191, 157, 193, "101%,0", 0.55], ["c4", 395, 191, 140, 193, "0,-101%", 0.55],
  ];
  const introLogo = PARTS.map(([, x, y, w, h, t, d]) =>
    `<i style="left:${(x / 535) * 100}%;top:${(y / 384) * 100}%;width:${(w / 535) * 100}%;height:${(h / 384) * 100}%"><b style="position:absolute;inset:0;transform:translate(${t});transition:transform 1.5s var(--kf-ease-out-expo) ${d}s"><svg class="sc-mark" viewBox="0 0 140 100" preserveAspectRatio="none" style="position:absolute;left:${(-x / w) * 100}%;top:${(-y / h) * 100}%;width:${(535 / w) * 100}%;height:${(384 / h) * 100}%">${MARK_H}</svg></b></i>`,
  ).join("");
  const tagline = (cls) => `<div class="sc-tagline ${cls}" aria-label="Your brand copy here"><span><span>Your copy here,</span></span><span><span>In two lines.</span></span><span><span><b>BRAND</b></span></span><span><span><b>NAMES</b></span></span></div>`;
  const NAV = [["TOP", "index.html", "home"], ["NEWS", "news.html", "news"], ["ABOUT", "about.html", "about"], ["PRODUCT", "index.html#product", ""], ["SAMPLE", "index.html#sample", ""], ["CONTACT", "index.html#contact", ""]];
  const SUB = [["Privacy policy", "guide.html", ""], ["Terms of service", "guide.html", ""], ["Seller Information Notice", "guide.html", ""], ["Shopping Guide", "guide.html", "guide"]];
  const bagSvg = '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M1.5 4h9l-.7 7H2.2zM4 4V3a2 2 0 0 1 4 0v1"/></svg>';
  // The cart button also rolls two sets of icons once, like the text buttons
  const bag = `<span class="sc-iconroll"><span>${bagSvg}</span><span>${bagSvg}</span></span>`;
  const cur = (p) => (p && p === page ? ' aria-current="page"' : "");

  const veil = `<div class="sc-veil" data-fx="tile-veil" data-fx-tile-veil="cell: 275; y: 104; cell-sm: 118; y-sm: 50; ready: 1" data-slot="loader">
  <div class="sc-intro" data-fx-part="intro">
    <div class="sc-intro__bg wf-img" data-label="Pile of white gravel and tile raw material · overcast daylight · full-width landscape"></div>
    <div class="sc-intro__logo">${introLogo}</div>
  </div>
</div>`;
  const menu = `<div class="sc-menu" data-slot="menu">
  <div class="sc-menu__meta">
    <button class="sc-pill sc-menu__toggle" type="button" aria-expanded="false" ${ROLL}><span class="is-open" data-fx-part="text">MENU</span><span class="is-close">CLOSE</span></button>
    <a class="sc-pill sc-pill--border sc-menu__login" href="#" data-veil-skip data-label="Login button, English text" ${ROLL}>Log In</a>
    <a class="sc-pill sc-pill--border sc-menu__register" href="#" data-veil-skip ${ROLL}>Sign up</a>
    <a class="sc-pill sc-menu__cart" href="#" data-veil-skip data-cart aria-label="Cart">${bag}</a>
  </div>
  <div class="sc-menu__panel"><div class="sc-menu__body">
    <ul class="sc-menu__nav">${NAV.map(([t, h, p]) => `<li><a class="sc-dot" href="${h}"${cur(p)}><span>${t}</span></a></li>`).join("")}</ul>
    <ul class="sc-menu__sub">${SUB.map(([t, h, p]) => `<li><a class="sc-dot" href="${h}"${cur(p)}>${t}</a></li>`).join("")}</ul>
    <a class="sc-menu__lang" href="#" data-veil-skip aria-label="Language"><span>KO</span><span>EN</span></a>
  </div></div>
</div>`;
  const footer = `<footer class="sc-foot" data-slot="footer" data-fx="pin-cross-frames">
  <div class="sc-foot__stage" data-fx-part="stage">
    <div class="sc-foot__bg">
      <div data-fx-part="back"><div class="wf-img" data-label="Close-up of white gravel and raw material piles · overcast daylight · full-bleed landscape"></div></div>
      <div data-fx-part="back"><div class="wf-img" data-label="White tile slab with grid grooves · soft side light · oblique overhead view"></div></div>
      <div data-fx-part="back"><div class="wf-img" data-label="Wall tiled with white triangular tiles · rough white backdrop · front view"></div></div>
    </div>
    <div class="sc-foot__img">
      <div data-fx-part="front"><div class="wf-img sc-ph-dark" data-label="White triangle tile in hand · low light · square"></div></div>
      <div data-fx-part="front"><div class="wf-img sc-ph-dark" data-label="Grid tile on a palm · dark background · square"></div></div>
      <div data-fx-part="front"><div class="wf-img sc-ph-dark" data-label="Raw material lump on a palm · warm light · square"></div></div>
    </div>
    ${tagline("sc-foot__tagline")}
    <div class="sc-foot__logo">${markV()}</div>
  </div>
  <div class="sc-foot__main">
    <p class="sc-foot__name">Your company name here</p>
    <p class="sc-foot__info">〒000-0000 One line of your address here<br>TEL 00-0000-0000／FAX 00-0000-0000</p>
    <div class="sc-foot__nav">
      <a class="sc-foot__login sc-pill sc-pill--border" href="#" data-veil-skip data-label="Login button, English text" ${ROLL}>Log In</a>
      <a class="sc-foot__register sc-pill sc-pill--border" href="#" data-veil-skip ${ROLL}>Sign up</a>
      <a class="sc-foot__cart sc-pill sc-menu__cart" href="#" data-veil-skip data-cart aria-label="Cart">${bag}</a>
    </div>
    <div class="sc-foot__sub">${SUB.map(([t, h, p], i) => `<a class="sc-foot__sub-${i + 1} sc-dot" href="${h}"${cur(p)}>${t}</a>`).join("")}</div>
  </div>
  <small class="sc-foot__small" data-label="Copyright line — company’s English name">© COMPANY NAME. ALL RIGHTS RESERVED.</small>
  <div class="sc-foot__sns">
    <a href="#" data-veil-skip aria-label="Photo SNS"><svg viewBox="0 0 20 20"><rect x="4" y="4" width="12" height="12" rx="3.5"/><circle cx="10" cy="10" r="3"/></svg></a>
    <a href="#" data-veil-skip aria-label="Pin SNS"><svg viewBox="0 0 20 20"><circle cx="10" cy="8.5" r="5"/><path d="M9 11l-2 6"/></svg></a>
  </div>
  <a class="sc-pill sc-pill--up sc-foot__top" href="#" aria-label="Back to top"></a>
</footer>`;

  const cart = `<div class="sc-cart" data-slot="cart-drawer" aria-hidden="true">
  <div class="sc-cart__overlay"></div>
  <div class="sc-cart__inner" role="dialog" aria-label="Cart">
    <button class="sc-pill sc-cart__close" type="button" ${ROLL}><span data-fx-part="text">CLOSE</span></button>
    <div class="sc-cart__acct"><a class="sc-pill sc-pill--border" href="#" data-veil-skip data-label="Login button, English text" ${ROLL}>Log In</a><a class="sc-pill sc-pill--border" href="#" data-veil-skip ${ROLL}>Sign up</a></div>
    <div class="sc-cart__empty">
      <p class="sc-cart__text">${bagSvg}Your cart is empty</p>
      <a class="sc-rect sc-cart__btn" href="index.html#product">Continue shopping</a>
      <p class="sc-cart__login">Already have an account?<br><a href="#" data-veil-skip>Log in</a>Doing so speeds up checkout.</p>
    </div>
  </div>
</div>`;
  document.body.insertAdjacentHTML("afterbegin", veil + menu + cart);
  document.querySelector("#smooth-content")?.insertAdjacentHTML("beforeend", footer);
  document.querySelectorAll("[data-sc-mark]").forEach((n) => (n.innerHTML = markV()));
  document.querySelectorAll("[data-tagline]").forEach((n) => (n.outerHTML = tagline(n.className)));
  document.querySelectorAll("[data-sc-mark-h]").forEach((n) => (n.innerHTML = markH()));

  gsap.registerPlugin(ScrollTrigger, ScrollSmoother, ScrollToPlugin);
  ScrollTrigger.config({ ignoreMobileResize: true });
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let smoother = null;
  if (isPc() && !reduce) {
    smoother = ScrollSmoother.create({ wrapper: "#smooth-wrapper", content: "#smooth-content", smooth: 1.5, speed: 1, effects: true, normalizeScroll: true });
    ScrollTrigger.normalizeScroll({ allowNestedScroll: true });
  }
  window.scSmoother = smoother;

  const scrollToEl = (target, smooth) => {
    if (smoother) smoother.scrollTo(target, smooth, "top top");
    else gsap.to(window, { duration: smooth ? 1 : 0, scrollTo: { y: target, autoKill: false }, ease: "expo.out" });
  };
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute("href");
    if (a.hasAttribute("data-veil-skip") && id === "#") { e.preventDefault(); return; }
    const target = id.length > 1 ? document.querySelector(id) : 0;
    if (target === null) return;
    e.preventDefault();
    scrollToEl(target, true);
  });

  // When the cover lifts, section motion starts — hero layers at the moment it lifts (hide), the rest .6s later (open)
  document.addEventListener("fx:phase", (e) => {
    const p = e.detail.phase;
    if (p === "ready" || p === "open") document.body.classList.add("is-ready");
    if (p === "hide") document.querySelectorAll('[data-fx~="mosaic-shift"]').forEach((h) => h.dispatchEvent(new CustomEvent("fx:play")));
    if (p === "open") {
      document.body.classList.add("is-active");
      dispatchEvent(new Event("sc:active"));
      smoother?.refresh();
      if (location.hash.length > 1) {
        const t = document.querySelector(location.hash);
        if (t) setTimeout(() => scrollToEl(t, false), 100);
      }
    }
  });

  // Menu — open/close, hidden when the footer stage touches the top of the screen
  const m = document.querySelector(".sc-menu");
  const toggle = m.querySelector(".sc-menu__toggle");
  toggle.addEventListener("click", (e) => {
    e.preventDefault();
    const open = !m.classList.contains("is-open");
    m.classList.toggle("is-open", open);
    m.classList.toggle("is-close", !open);
    toggle.setAttribute("aria-expanded", String(open));
  });

  // Cart drawer — slides in from the right in .2s, backdrop deepens to 50% ink in .25s
  const drawer = document.querySelector(".sc-cart");
  const setCart = (on) => { drawer.classList.toggle("is-open", on); drawer.setAttribute("aria-hidden", String(!on)); };
  document.addEventListener("click", (e) => {
    // The original Brand drawer sets an open/close flag in the next task gap after a press — it varies 119~172ms per panel, so we aim for the middle (25ms delay)
    if (e.target.closest("[data-cart]")) { e.preventDefault(); setTimeout(() => setCart(true), 25); }
    else if (e.target.closest(".sc-cart__close, .sc-cart__overlay")) setCart(false);
  });
  addEventListener("keydown", (e) => e.key === "Escape" && setCart(false));
  document.querySelectorAll(".sc-iconroll").forEach((r) => {
    const host = r.closest("a, button");
    let inside = false;
    host.addEventListener("pointerenter", () => { if (inside || !matchMedia("(hover: hover)").matches) return; inside = true; r.classList.remove("is-roll"); requestAnimationFrame(() => requestAnimationFrame(() => r.classList.add("is-roll"))); });
    host.addEventListener("pointerleave", () => (inside = false));
    r.addEventListener("animationend", () => r.classList.remove("is-roll"));
  });

  const foot = document.querySelector(".sc-foot");
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    ScrollTrigger.create({ trigger: foot, start: () => "top top+=" + (rpx(60) + 20), onEnter: () => m.classList.add("is-hide"), onLeaveBack: () => m.classList.remove("is-hide") });
    // In the last 80px of the footer (50px on phone) the marker rises along and stacks at the page bottom
    const logo = foot.querySelector(".sc-foot__logo");
    ScrollTrigger.create({
      trigger: foot,
      start: () => "bottom-=" + rpx(isPc() ? 80 : 50) + " top+=" + lvh(),
      end: () => "bottom top+=" + lvh(),
      onUpdate: (t) => foot.style.setProperty("--site-offset", t.progress * rpx(isPc() ? 80 : 50) + "px"),
      onEnter: () => logo.classList.add("is-stack"),
      onLeaveBack: () => logo.classList.remove("is-stack"),
    });
    // Parallax inside the photo cell — a 1.4x (data-mag) tall photo moves down by (mag−1)/mag from when the cell’s top edge touches the bottom of the screen until the cell leaves the top of the screen.
    document.querySelectorAll(".sc-prlx").forEach((box) => {
      const pic = box.firstElementChild;
      const mag = +(box.dataset.mag || 1.4);
      pic.style.height = mag * 100 + "%";
      gsap.fromTo(pic, { yPercent: 0 }, { yPercent: ((mag - 1) / mag) * 100, ease: "none", scrollTrigger: { trigger: box, start: () => "top top+=" + lvh(), end: "bottom top", scrub: true, invalidateOnRefresh: true } });
    });
    // Text wipe — once when the top edge rises above 100px (rpx) from the bottom of the screen
    document.querySelectorAll(".sc-wipe").forEach((t) => ScrollTrigger.create({ trigger: t, start: () => "top bottom-=" + rpx(100), once: true, onEnter: () => t.classList.add("is-show") }));
  });
  if (reduce) document.querySelectorAll(".sc-wipe").forEach((t) => t.classList.add("is-show"));
  addEventListener("load", () => ScrollTrigger.refresh());
})();
