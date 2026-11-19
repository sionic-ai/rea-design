// Shared by all pages: draws in icon symbols·header·phone drawer·character intro window·footer, and sets up mountain ridge generation·entrance·parallax·auto band·fade slider·page transition.
// Original values: hover .3s cubic-bezier(.4,.4,0,1) · entrance .6s 60px · auto strip 1px/frame (≥1280) · .5 (phone) · fade transition 4 seconds · character button hides when 10% of the footer is visible.
(() => {
  gsap.registerPlugin(ScrollTrigger, CustomEase);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const page = document.body.dataset.page || "home";
  const HS = (window.HS = { reduced });
  // Original Motion curve names as-is
  HS.easeOut = CustomEase.create("hsMotionOut", "0,0,0.58,1");
  HS.easeInOut = CustomEase.create("hsMotionInOut", "0.42,0,0.58,1");
  // Character window pop — a curve fitted to the original size curve measured with motion-probe (≈.27s after .14s, overshooting to 1.05)
  HS.pop = CustomEase.create("hsPop", "0.3,0,0.2,1.3");
  HS.appear = CustomEase.create("hsAppear", "0.39,0.575,0.565,1");

  // ---------- Icon symbols (newly drawn characters, mushrooms and icons instead of the original art) ----------
  const sprite = `<svg class="hs-sprite" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
  <symbol id="hs-logo-mark" viewBox="0 0 52 24"><path d="M10 0h12L12 24H0z" style="fill:var(--lm1,var(--kf-accent-text))"/><path d="M25 0h12L27 24H15z" style="fill:var(--lm2,var(--kf-accent))"/><path d="M40 0h12L42 24H30z" style="fill:var(--lm3,var(--site-green-33))"/></symbol>
  <symbol id="hs-chara" viewBox="0 0 100 110"><ellipse cx="50" cy="98" rx="24" ry="6" fill="#000" opacity=".12"/><path d="M30 58c-2 14 0 30 6 38h28c6-8 8-24 6-38z" fill="#fff4e2"/><path d="M36 96h28l-2 6H38z" fill="#c98e5a"/><path d="M8 52C8 24 28 6 50 6s42 18 42 46c0 8-6 12-14 12H22C14 64 8 60 8 52z" fill="#e8693a"/><circle cx="30" cy="30" r="7" fill="#ffd9b8"/><circle cx="62" cy="20" r="5" fill="#ffd9b8"/><circle cx="74" cy="42" r="6" fill="#ffd9b8"/><circle cx="46" cy="44" r="4" fill="#ffd9b8"/><circle cx="42" cy="74" r="3.2" fill="#3a2a20"/><circle cx="58" cy="74" r="3.2" fill="#3a2a20"/><ellipse cx="36" cy="81" rx="4" ry="2.4" fill="#f4a08a"/><ellipse cx="64" cy="81" rx="4" ry="2.4" fill="#f4a08a"/><path d="M46 82q4 3 8 0" stroke="#3a2a20" stroke-width="2" fill="none" stroke-linecap="round"/></symbol><!-- Not Skin: characters and mushroom art keep their own colors -->
  <symbol id="hs-chara-joy" viewBox="0 0 100 110"><ellipse cx="50" cy="98" rx="24" ry="6" fill="#000" opacity=".12"/><path d="M30 58c-2 14 0 30 6 38h28c6-8 8-24 6-38z" fill="#fff4e2"/><path d="M36 96h28l-2 6H38z" fill="#c98e5a"/><path d="M8 50C8 22 28 4 50 4s42 18 42 46c0 8-6 12-14 12H22C14 62 8 58 8 50z" fill="#e8693a"/><circle cx="30" cy="28" r="7" fill="#ffd9b8"/><circle cx="62" cy="18" r="5" fill="#ffd9b8"/><circle cx="74" cy="40" r="6" fill="#ffd9b8"/><circle cx="46" cy="42" r="4" fill="#ffd9b8"/><path d="M38 75q4-5 8 0M54 75q4-5 8 0" stroke="#3a2a20" stroke-width="2.4" fill="none" stroke-linecap="round"/><ellipse cx="36" cy="81" rx="4" ry="2.4" fill="#f4a08a"/><ellipse cx="64" cy="81" rx="4" ry="2.4" fill="#f4a08a"/><path d="M44 81q6 7 12 0z" fill="#3a2a20"/></symbol><!-- Not Skin: characters and mushroom art keep their own colors -->
  <symbol id="hs-mush-brown" viewBox="0 0 60 60"><path d="M24 30c-1 10 0 20 3 26h8c3-6 4-16 3-26z" fill="#f3e6d2"/><path d="M4 32C4 16 16 6 31 6s27 10 27 26c0 3-3 4-6 4H10c-4 0-6-1-6-4z" fill="#8a5a3b"/><path d="M14 18q16-10 34 0" stroke="#a97752" stroke-width="3" fill="none" opacity=".6"/></symbol><!-- Not Skin: characters and mushroom art keep their own colors -->
  <symbol id="hs-mush-eringi" viewBox="0 0 40 90"><path d="M10 24c-2 20 0 46 4 62h12c4-16 6-42 4-62z" fill="#f6eedf"/><path d="M2 22C2 12 10 4 20 4s18 8 18 18c0 4-4 6-8 6H10c-5 0-8-2-8-6z" fill="#cdb48f"/></symbol><!-- Not Skin: characters and mushroom art keep their own colors -->
  <symbol id="hs-mush-enoki" viewBox="0 0 60 90"><g stroke="#f4efe2" stroke-width="3.4" stroke-linecap="round" fill="none"><path d="M30 88 18 14M30 88 26 8M30 88 34 10M30 88 42 14M30 88 50 22M30 88 10 22"/></g><g fill="#efe6cf"><circle cx="18" cy="13" r="4"/><circle cx="26" cy="7" r="4"/><circle cx="34" cy="9" r="4"/><circle cx="42" cy="13" r="4"/><circle cx="50" cy="21" r="4"/><circle cx="10" cy="21" r="4"/></g><path d="M22 70h16l-2 18H24z" fill="#e9dfc6"/></symbol><!-- Not Skin: characters and mushroom art keep their own colors -->
  <symbol id="hs-mush-shimeji" viewBox="0 0 70 60"><g fill="#f1eadb"><path d="M18 26c-1 10 0 22 3 32h7c1-10 1-22-1-32z"/><path d="M34 22c-1 12 0 24 2 36h7c1-12 1-24-1-36z"/><path d="M50 28c-1 10-1 20 1 30h7c2-10 2-20 0-30z"/></g><g fill="#9b8a76"><ellipse cx="23" cy="25" rx="13" ry="8"/><ellipse cx="39" cy="20" rx="14" ry="9"/><ellipse cx="55" cy="27" rx="12" ry="8"/></g></symbol><!-- Not Skin: characters and mushroom art keep their own colors -->
  <symbol id="hs-map" viewBox="0 0 100 170"><path d="M52 2 66 10l4 16 12 6-2 14 10 10-6 12 8 14-4 16 8 12-10 10 2 16-12 8-4 14-14 6-10-8-12 4-6-12 4-14-10-10 6-14-8-12 10-10-4-14 8-10-2-16 10-8 2-14z" fill="currentColor"/></symbol>
  <symbol id="hs-i-cart" viewBox="0 0 24 23"><path d="M2 3h3l2.4 11.2a2 2 0 0 0 2 1.6h8.4a2 2 0 0 0 2-1.5L21.6 7H6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 10.5h10M8.5 12.8h9.6" stroke="currentColor" stroke-width="1.4"/><circle cx="10" cy="20" r="1.6" fill="currentColor"/><circle cx="17" cy="20" r="1.6" fill="currentColor"/></symbol>
  <symbol id="hs-i-cart2" viewBox="0 0 24 23"><path d="M2 3h3l2.4 11.2a2 2 0 0 0 2 1.6h8.4a2 2 0 0 0 2-1.5L21.6 7H6z" fill="currentColor"/><circle cx="10" cy="20" r="1.8" fill="currentColor"/><circle cx="17" cy="20" r="1.8" fill="currentColor"/></symbol>
  <symbol id="hs-i-mail" viewBox="0 0 24 24"><rect x="2.5" y="5" width="19" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="m3.5 6.5 8.5 7 8.5-7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></symbol>
  <symbol id="hs-i-mail2" viewBox="0 0 24 24"><rect x="2.5" y="5" width="19" height="14" rx="2" fill="currentColor"/><path d="m3.5 6.5 8.5 7 8.5-7" fill="none" stroke="var(--kf-on-accent)" stroke-width="1.6" stroke-linejoin="round"/></symbol>
  <symbol id="hs-i-insta" viewBox="0 0 24 24"><rect x="2.5" y="2.5" width="19" height="19" rx="5.5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4.4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.6" cy="6.4" r="1.3" fill="currentColor"/></symbol>
  <symbol id="hs-i-chev" viewBox="0 0 12 12"><path d="m4.5 2 4 4-4 4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></symbol>
  <symbol id="hs-i-down" viewBox="0 0 12 12"><path d="m2.5 4.5 3.5 3.5 3.5-3.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></symbol>
  <symbol id="hs-i-x" viewBox="0 0 12 12"><path d="m2 2 8 8M10 2l-8 8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></symbol>
  <symbol id="hs-i-menu" viewBox="0 0 12 10"><path d="M1 1h10M1 5h10M1 9h10" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></symbol>
  <symbol id="hs-i-chat" viewBox="0 0 16 16"><path d="M8 2C4.1 2 1 4.5 1 7.6c0 1.9 1.2 3.6 3 4.6L3.5 15l3.2-2c.4.1.9.1 1.3.1 3.9 0 7-2.5 7-5.5S11.9 2 8 2z" fill="currentColor"/></symbol>
</svg>`;
  document.body.insertAdjacentHTML("afterbegin", sprite);
  const ic = (id, cls = "") => `<svg class="${cls}" aria-hidden="true"><use href="#${id}"/></svg>`;
  HS.ic = ic;

  const NAV = [
    ["TOP", "Menu 1", "index.html", "home"],
    ["ABOUT", "Menu Second", "about.html", "about"],
    ["PRODUCT", "Menu 3", "product.html", "product"],
    ["COMPANY", "Menu 4", "company.html", "company"],
    ["RECIPE", "Menu Fifth", "recipe.html", "recipe"],
  ];
  const logo = (white = false) =>
    `<a class="hs-logo${white ? " is-white" : ""}" href="index.html" aria-label="Home"><span class="hs-logo__mark">${ic("hs-logo-mark")}<b>LOGO</b></span><small>Your one-line slogan goes here</small></a>`;
  const chips = () => `
    <a class="hs-chip" href="#" data-ext><span class="hs-chip__ic">${ic("hs-i-cart")}${ic("hs-i-cart2")}</span><span>Online shop name</span></a>
    <a class="hs-chip" href="contact.html"><span class="hs-chip__ic">${ic("hs-i-mail")}${ic("hs-i-mail2")}</span><span>Contact Us</span></a>`;
  const insta = () => `<a class="hs-insta" href="#" aria-label="SNS">${ic("hs-i-insta")}</a>`;

  // ---------- Head ----------
  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.classList.add("hs-head");
    head.innerHTML = `
      <div class="hs-head__pill">
        ${logo()}
        <nav class="hs-nav" aria-label="Main menu">${NAV.map(([en, ko, href, key]) => `<a href="${href}" class="${key === page ? "is-current" : ""}"><span>${en}</span><b>${ko}</b></a>`).join("")}</nav>
        <i class="hs-head__bar"></i>
        ${chips()}
        ${insta()}
        <button class="hs-menu-btn" type="button" aria-expanded="false">Menu ${ic("hs-i-menu")}</button>
      </div>`;
  }

  // Character button, the speech bubble tail is drawn as the same face as the white ring
  const charaBtn = document.createElement("button");
  charaBtn.type = "button";
  charaBtn.className = "hs-chara-btn";
  charaBtn.setAttribute("aria-label", "Open character intro");
  charaBtn.dataset.slot = "chara-button";
  charaBtn.innerHTML = `
    <svg class="hs-chara-btn__ring" viewBox="0 0 81 89" aria-hidden="true"><circle cx="40.5" cy="41" r="40.5" fill="var(--kf-surface)"/><path d="M52 76 58 89 66 70z" fill="var(--kf-surface)"/></svg>
    <span class="hs-chara-btn__in">${ic("hs-chara")}${ic("hs-chara-joy")}<svg class="hs-chara-btn__x" viewBox="0 0 12 12" style="width:16px;height:16px;color:var(--kf-on-accent)"><use href="#hs-i-x"/></svg></span>`;
  document.body.append(charaBtn);

  const modal = document.createElement("div");
  modal.className = "hs-modal";
  modal.dataset.slot = "chara-modal";
  modal.innerHTML = `
    <div class="hs-modal__dim"></div>
    <div class="hs-modal__card" role="dialog" aria-label="Character About">
      <div>
        <p class="hs-modal__name">Name <b>Your character name here</b></p>
        <div class="hs-modal__pic">${ic("hs-chara")}</div>
        <p class="hs-modal__say"><b>Character Name</b><br>Your two lines here on the origin of the name. One more line on where it came from.</p>
      </div>
      <div>
        <dl>
          <div><dt>Affiliation</dt><dd>Your affiliation line here</dd></div>
          <div><dt>Birthday</dt><dd>00/00/0000</dd></div>
          <div><dt>About</dt><dd>Add about four lines of character introduction here. A field for when they were born, what they like and what work they help with. One more line is fine.</dd></div>
          <div><dt>Personality</dt><dd>Your one-line personality here</dd></div>
          <div><dt>A word</dt><dd>Add three lines of what the character says. Write in a friendly tone and end with a one-line greeting.</dd></div>
        </dl>
        <a class="hs-modal__line" href="#">Your character goods guide link here<i>${ic("hs-i-chat")}</i></a>
      </div>
      <div class="hs-modal__hills" data-ridge="modal"></div>
    </div>`;
  document.body.append(modal);

  // ---------- Phone drawer ----------
  const drawer = document.createElement("div");
  drawer.className = "hs-drawer";
  drawer.dataset.slot = "menu-drawer";
  drawer.innerHTML = `
    <div class="hs-drawer__dim"></div>
    <svg class="hs-drawer__chara" viewBox="0 0 100 110" aria-hidden="true"><use href="#hs-chara-joy"/></svg>
    <div class="hs-drawer__panel">
      <div class="hs-drawer__top">${logo()}<button class="hs-drawer__close" type="button">Close ${ic("hs-i-x")}</button></div>
      <nav class="hs-drawer__nav">${NAV.map(([en, ko, href]) => `<a href="${href}"><span>${en}</span><b>${ko}</b></a>`).join("")}</nav>
      <div class="hs-drawer__cats">${["Category 1", "Category 2", "Category 3", "Category 4", "Category 5"].map((t, i) => `<a href="product.html#cat-${i + 1}"><span class="wf-img" data-label="Product cutout · white background"></span>${t}</a>`).join("")}</div>
      ${chips()}
      ${insta()}
    </div>`;
  document.body.append(drawer);

  const openDrawer = (on) => {
    const btn = document.querySelector(".hs-menu-btn");
    btn && btn.setAttribute("aria-expanded", on);
    const panel = drawer.querySelector(".hs-drawer__panel");
    const tl = gsap.timeline({ defaults: { duration: reduced ? 0 : 0.4, ease: "power3.out" } });
    if (on) {
      gsap.set(drawer, { visibility: "visible" });
      tl.to(drawer.querySelector(".hs-drawer__dim"), { opacity: 1 }, 0)
        .to(panel, { xPercent: 0 }, 0)
        .to(drawer.querySelector(".hs-drawer__chara"), { x: 0, opacity: 1, duration: reduced ? 0 : 0.5, ease: "back.out(1.6)" }, 0.15);
    } else {
      tl.to(drawer.querySelector(".hs-drawer__chara"), { x: 60, opacity: 0, duration: reduced ? 0 : 0.2 }, 0)
        .to(panel, { xPercent: 100 }, 0)
        .to(drawer.querySelector(".hs-drawer__dim"), { opacity: 0 }, 0)
        .set(drawer, { visibility: "hidden" });
    }
  };
  gsap.set(drawer.querySelector(".hs-drawer__panel"), { xPercent: 100 });
  document.querySelector(".hs-menu-btn")?.addEventListener("click", () => openDrawer(true));
  drawer.querySelector(".hs-drawer__close").addEventListener("click", () => openDrawer(false));
  drawer.querySelector(".hs-drawer__dim").addEventListener("click", () => openDrawer(false));

  // ---------- Character intro window ----------
  let modalOpen = false;
  const toggleModal = (on) => {
    modalOpen = on;
    charaBtn.classList.toggle("is-open", on);
    charaBtn.setAttribute("aria-label", on ? "Close character intro" : "Open character intro");
    const d = reduced ? 0 : 0.4;
    if (on) {
      gsap.set(modal, { visibility: "visible" });
      gsap.to(modal.querySelector(".hs-modal__dim"), { opacity: 1, duration: d });
      // Original STUDIO window: the panel goes from size 0, overshoots slightly (1.05) and settles
      gsap.fromTo(modal.querySelector(".hs-modal__card"), { opacity: 1, scale: 0 }, { scale: 1, duration: d ? 0.28 : 0, ease: HS.pop });
    } else {
      gsap.to(modal.querySelector(".hs-modal__dim"), { opacity: 0, duration: d });
      gsap.to(modal.querySelector(".hs-modal__card"), { opacity: 0, duration: d * 0.7, onComplete: () => gsap.set(modal, { visibility: "hidden" }) });
    }
  };
  charaBtn.addEventListener("click", () => toggleModal(!modalOpen));
  modal.querySelector(".hs-modal__dim").addEventListener("click", () => toggleModal(false));
  addEventListener("keydown", (e) => e.key === "Escape" && (modalOpen ? toggleModal(false) : openDrawer(false)));

  // ---------- Footer ----------
  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.classList.add("hs-foot");
    const ring = `<svg class="hs-top__ring" viewBox="0 0 168 168" aria-hidden="true"><defs><path id="hs-top-arc" d="M84 84m-62 0a62 62 0 1 1 124 0a62 62 0 1 1-124 0"/></defs><text><textPath href="#hs-top-arc" startOffset="3%">Back to top</textPath></text></svg>`;
    foot.innerHTML = `
      <div class="hs-foot__head">${logo(true)}</div>
      <div class="hs-foot__body">
        <button class="hs-top" type="button" aria-label="Back to top" data-slot="back-to-top">${ring}<span class="hs-top__face">${ic("hs-chara")}</span></button>
        <div class="hs-foot__grid">
          <nav class="hs-foot__links" aria-label="Footer Menu">${NAV.map(([en, ko, href]) => `<a href="${href}"><b>${ko}</b><span>${en}</span></a>`).join("")}</nav>
          <div class="hs-foot__side">
            <ul class="hs-foot__certs">
              <li><span class="wf-img" data-label="Certification mark 1 · white background square"></span>Your certification 1 here</li>
              <li><span class="wf-img" data-label="Certification mark 2 · white background square"></span>Your certification 2 here</li>
              <li><span class="wf-img" data-label="Regional certification logo · white background"></span>Your certification three here</li>
            </ul>
            <div class="hs-foot__tel"><p>Toll-free call<span>Your phone number pun here</span></p><a href="tel:0000000000">0000-00-0000</a><small>Delivery time: weekdays 00:00~00:00</small></div>
            <a class="hs-foot__cta" href="contact.html">Your contact button $ here{ic("hs-i-chev")}</a>
          </div>
        </div>
        <a class="hs-foot__pp" href="#">${ic("hs-i-insta")}privacy policy</a>
        <div class="hs-foot__cos">
          <div><h3>${ic("hs-logo-mark")}Your company name 1 here</h3><dl><dt>Headquarters</dt><dd>〒000-0000 One line of your address here</dd><dt>Office and packing center</dt><dd>〒000-0000 One line of your address here</dd></dl></div>
          <div><h3>${ic("hs-logo-mark")}Your affiliate name here</h3><dl><dt>Sales office</dt><dd>〒000-0000 One line of your address here</dd><dt>Shipping center</dt><dd>〒000-0000 One line of your address here</dd></dl></div>
        </div>
        <p class="hs-foot__copy">© 0000 LOGO</p>
      </div>`;
    // Original footer(): the hand drawn with lottie-web repeats from the start only while hovered (75 frames · 60fps), and rests on the first frame on release.
    // The artwork is ours (media/back-to-top.js — the character raises its arms twice pointing up), playback method and length are as in the original
    const top = foot.querySelector(".hs-top");
    const face = top.querySelector(".hs-top__face");
    if (window.lottie && window.hsTopLottie && !reduced) {
      face.replaceChildren();
      const anim = lottie.loadAnimation({ container: face, renderer: "svg", loop: true, autoplay: false, animationData: window.hsTopLottie });
      top.addEventListener("mouseenter", () => { top.classList.add("while-hovering"); anim.goToAndPlay(0); });
      top.addEventListener("mouseleave", () => { top.classList.remove("while-hovering"); anim.stop(); });
    }
    // Original smoothScrollTo: to the top over .4s with Motion easeInOut(.42,0,.58,1)
    top.addEventListener("click", () => {
      if (reduced) return scrollTo(0, 0);
      const s = { y: scrollY };
      gsap.to(s, { y: 0, duration: 0.4, ease: HS.easeInOut, onUpdate: () => scrollTo(0, s.y) });
    });
    // On phone the character button sits at the top of the footer’s back so it does not overlap the button
    new IntersectionObserver((es) => es.forEach((e) => charaBtn.classList.toggle("is-hidden", e.isIntersecting)), { threshold: 0.1 }).observe(foot);
  }

  // ---------- Mountain ridge ----------
  // Builds a jagged ridge with seeded random + midpoint displacement. Each layer has a top (ridge) → bottom (mist) gradient.
  const rng = (seed) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const ridgeLine = (seed, n, rough) => {
    const r = rng(seed);
    const h = new Array(n + 1).fill(0);
    h[0] = r(); h[n] = r();
    let step = n, amp = 1;
    while (step > 1) {
      const half = step / 2;
      for (let i = half; i < n; i += step) h[i] = (h[i - half] + h[i + half]) / 2 + (r() - 0.5) * amp;
      step = half; amp *= rough;
    }
    const min = Math.min(...h), max = Math.max(...h);
    return h.map((v) => (v - min) / (max - min || 1));
  };
  let gid = 0;
  HS.ridge = (el, layers, { w = 1440, h = 300 } = {}) => {
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    svg.setAttribute("preserveAspectRatio", "none");
    svg.setAttribute("aria-hidden", "true");
    let defs = "", body = "";
    layers.forEach((L) => {
      const id = `hs-rg${gid++}`;
      const n = 256;
      const line = ridgeLine(L.seed, n, L.rough ?? 0.56);
      const top = L.top * h, amp = L.amp * h;
      const pts = line.map((v, i) => `${((i / n) * (w + 40) - 20).toFixed(1)},${(top + (1 - v) * amp).toFixed(1)}`);
      const [c1, c2, o1 = 1, o2 = 1] = L.fill;
      defs += `<linearGradient id="${id}" x1="0" y1="${top}" x2="0" y2="${L.fadeTo ?? h}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${c1}" stop-opacity="${o1}"/><stop offset="1" stop-color="${c2}" stop-opacity="${o2}"/></linearGradient>`;
      body += `<g data-ridge-speed="${L.speed ?? 0}"><path d="M-20,${h + 60} L${pts.join(" L")} L${w + 20},${h + 60} Z" fill="url(#${id})"/></g>`;
    });
    svg.innerHTML = `<defs>${defs}</defs>${body}`;
    el.append(svg);
    return svg;
  };
  // Ridge laid under the bottom edge of the dark green block — same shape in every section
  HS.greenRidges = (el, seed = 7) =>
    HS.ridge(el, [
      { seed, top: 0.18, amp: 0.34, fill: ["var(--site-green-52)", "var(--kf-accent)", 0.9, 0], speed: -0.04 },
      { seed: seed + 11, top: 0.36, amp: 0.3, fill: ["var(--site-green-41)", "var(--site-green-53)", 1, 0.4], speed: -0.08 },
      { seed: seed + 23, top: 0.55, amp: 0.26, fill: ["var(--site-green-36)", "var(--site-green-45)", 1, 0.9], speed: -0.12 },
    ], { w: 1440, h: 260 });
  document.querySelectorAll('[data-ridge="green"]').forEach((el, i) => HS.greenRidges(el, 5 + i * 13));
  document.querySelectorAll('[data-ridge="modal"]').forEach((el) =>
    HS.ridge(el, [
      { seed: 31, top: 0.25, amp: 0.4, fill: ["var(--site-green-90)", "var(--site-green-99)", 1, 0] },
      { seed: 41, top: 0.5, amp: 0.35, fill: ["var(--site-green-81)", "var(--site-green-95)", 0.9, 0.6] },
    ], { w: 900, h: 110 })
  );

  // Smooth hills (sub-page header · background haze) — connects several height ratios with a curve
  HS.hill = (el, ys, { w = 1000, h = 330, c1 = "var(--site-green-92)", c2 = "var(--kf-bg)", o1 = 0.9, o2 = 0 } = {}) => {
    const id = `hs-hl${gid++}`;
    const step = w / (ys.length - 1);
    let d = `M0,${h} L0,${ys[0] * h}`;
    for (let i = 1; i < ys.length; i++) {
      const x0 = (i - 1) * step, x1 = i * step;
      d += ` C${x0 + step / 2},${ys[i - 1] * h} ${x1 - step / 2},${ys[i] * h} ${x1},${ys[i] * h}`;
    }
    d += ` L${w},${h} Z`;
    el.innerHTML = `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" style="width:100%;height:100%;display:block" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c1}" stop-opacity="${o1}"/><stop offset=".85" stop-color="${c2}" stop-opacity="${o2}"/></linearGradient></defs><path d="${d}" fill="url(#${id})"/></svg>`;
  };
  document.querySelectorAll("[data-hill]").forEach((el) => HS.hill(el, el.dataset.hill.split(",").map(Number)));

  // ---------- Reveal·parallax ----------
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    gsap.utils.toArray("[data-appear]").forEach((el) => {
      // Original appear (&appear): from 60px below and transparent, .6s cubic-bezier(.39,.575,.565,1), per-cell delays 200·300·500ms
      gsap.fromTo(el, { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 0.6, ease: HS.appear, delay: (+el.dataset.appear || 0) / 1000, scrollTrigger: { trigger: el, start: "top 97%", once: true } });
    });
    gsap.utils.toArray("[data-ridge-speed]").forEach((g) => {
      const s = +g.dataset.ridgeSpeed;
      if (!s) return;
      const host = g.closest("[data-ridge-host]") || g.closest("svg").parentElement;
      gsap.fromTo(g, { y: () => -s * 300 }, { y: () => s * 300, ease: "none", scrollTrigger: { trigger: host, start: "top bottom", end: "bottom top", scrub: true } });
    });
    gsap.utils.toArray("[data-speed]").forEach((el) => {
      const s = +el.dataset.speed;
      gsap.fromTo(el, { y: () => -s * 300 }, { y: () => s * 300, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } });
    });
  });

  // ---------- Page transition: the white curtain lifts, and covers again when going to our own page ----------
  const veil = document.createElement("div");
  veil.className = "hs-veil";
  document.body.append(veil);
  gsap.to(veil, { opacity: 0, duration: reduced ? 0 : 0.6, ease: "power1.out", delay: 0.05 });
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || e.defaultPrevented || a.hasAttribute("data-ext") || e.metaKey || e.ctrlKey) return;
    const href = a.getAttribute("href");
    if (href.length > 1 && href.startsWith("#") && document.querySelector(href)) {
      e.preventDefault();
      document.querySelector(href).scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
      return;
    }
    if (!/\.html/.test(href) || href.startsWith("http")) return;
    const [file, hash] = href.split("#");
    const here = location.pathname.split("/").pop() || "index.html";
    if (file === here) {
      if (hash) {
        e.preventDefault();
        openDrawer(false);
        document.getElementById(hash)?.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
      }
      return;
    }
    e.preventDefault();
    gsap.to(veil, { opacity: 1, duration: reduced ? 0 : 0.35, ease: "power1.in", onComplete: () => (location.href = href) });
  });
  addEventListener("pageshow", (e) => e.persisted && gsap.set(veil, { opacity: 0 }));
})();
