// Shared by all pages: draws the header row, phone drawer, footer and cookie box, with smooth scroll (Lenis 1.3.26 defaults · driven by gsap ticker) and
// Hang the page title box (from above, .8s power3.inOut). Page transitions use vt-swap-page (swapping only the wrapper in the same document) and
// The page-vt-reveal part does it (old screen shrinks and goes down, new screen opens from below, 1.1s cubic-bezier(.75,0,.1,1)) — same order as the original Nuxt transition.
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const OF = (window.OF = { reduced, lenis: null });

  // A placeholder newly drawn at the same ratio (1408:181) instead of the original wordmark — one circle + a rounded rectangle + a serif name
  const logo = (cls) => `<svg class="${cls}" viewBox="0 0 1408 181" fill="currentColor" aria-hidden="true">
    <circle cx="90.5" cy="90.5" r="90.5"/>
    <rect x="206" y="0" width="181" height="181" rx="22"/>
    <text x="420" y="176" textLength="988" lengthAdjust="spacingAndGlyphs" style="font-family: var(--kf-font-display); font-size: 236px; font-weight: 400">WORDMARK</text>
  </svg>`;
  const arrow = '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><path d="M6 14 14 6M7.5 6H14v6.5"/></svg>';
  OF.icons = { arrow };
  let page = document.body.dataset.page || "home";
  const cur = (p) => (p === page ? ' aria-current="page"' : "");

  // Header and footer — drawn once at first, and again in the new wrapper’s place each time vt-swap-page swaps the wrapper
  const build = () => {
  page = document.body.dataset.page || "home";
  const head = document.querySelector('[data-slot="header"]');
  if (head && !head.childElementCount) {
    head.className = `of-head${document.body.dataset.head === "light" ? " is-light" : ""}`;
    head.dataset.fx = "clip-drop-menu";
    head.setAttribute("data-fx-clip-drop-menu", "dur: .7; ease: .87,0,.13,1; shift: 30; lock: none");
    head.innerHTML = `
      <div class="of-head__bar of-wrap">
        <a class="of-head__logo" href="index.html" aria-label="Home">${logo("of-logo")}</a>
        <div class="of-head__side">
          <div class="of-head__nav t-btn">
            <nav aria-label="Main menu"><ul><li><a class="of-uline" href="about.html"${cur("about")}><span>About</span></a></li></ul></nav>
            <a class="of-uline of-lang" href="#" aria-label="Other language">EN</a>
          </div>
        </div>
      </div>
      <button class="of-burger" type="button" data-fx-part="toggle" aria-label="Menu"><i></i><i></i></button>
      <div class="of-head__dim"></div>
      <div class="of-drawer" data-fx-part="panel" data-slot="mobile-menu">
        <ul class="t-h3f">
          <li><a href="about.html"${cur("about")}>About</a></li>
          <li><a href="media.html"${cur("media")}>Media room</a></li>
          <li><a href="#">Inquiry</a></li>
          <li><a href="#">Frequently asked questions</a></li>
        </ul>
        <a class="of-lang t-btn" href="#">EN</a>
      </div>`;
    const burger = head.querySelector(".of-burger");
    head.querySelector(".of-head__dim").addEventListener("click", () => burger.click());
  }

  const foot = document.querySelector('[data-slot="footer"]');
  if (foot && !foot.childElementCount) {
    foot.classList.add("of-foot", "of-wrap");
    if (foot.hasAttribute("data-borderless")) foot.classList.add("is-borderless");
    const radio = (v, t) => `<label class="of-radio"><input type="radio" name="of-news" value="${v}"><span class="of-radio__o"><i></i></span><span class="t-btn">${t}</span></label>`;
    const col = (links) => `<div class="of-foot__col">${links.map(([t, h]) => `<div class="of-px"><a class="of-uline t-btn" href="${h}"><span>${t}</span></a></div>`).join("")}</div>`;
    foot.innerHTML = `
      <div class="of-foot__in">
        <div class="of-foot__top">
          <div class="of-foot__join" data-slot="newsletter">
            <h3 class="t-h3o of-px">Your news signup notice here<br>Set in two lines.</h3>
            <div class="of-radios of-px" data-label="Choose to receive news by event only (English)">${radio("a", "Only Event 1")}${radio("b", "Only Event 2")}</div>
            <form class="of-form" onsubmit="return false" data-label="News signup field name and button (English)">
              <div class="of-form__fields"><div class="of-px"><input type="text" placeholder="Name" aria-label="Name" autocomplete="off"></div><div class="of-px"><input type="email" placeholder="Email" aria-label="Email" autocomplete="off"></div></div>
              <div class="of-px"><button class="t-btn" type="submit">Subscribe</button></div>
            </form>
          </div>
          <div class="of-foot__nav">
            <div class="of-foot__links" data-label="Footer link name (English)">${col([["Media Room", "media.html"], ["FAQ", "#"], ["Contact", "#"]])}${col([["Privacy Policy", "#"]])}</div>
            <div class="of-foot__social of-px">
              <div><span class="t-h5o">Event 1</span><div class="of-pills"><a class="of-pill t-btn" href="#">SNS</a><a class="of-pill t-btn" href="#">SNS</a></div></div>
              <div><span class="t-h5o">Event 2</span><div class="of-pills"><a class="of-pill t-btn" href="#">SNS</a></div></div>
            </div>
          </div>
        </div>
        <div class="of-foot__bottom">
          <div class="of-foot__mark of-px" data-slot="boundary-wordmark">${logo("of-logo-full")}</div>
          <div class="of-foot__legal of-px"><p class="t-small">©0000 Your name here. All rights reserved.</p><a class="t-small" href="#">Maker credit</a></div>
        </div>
      </div>`;
    const form = foot.querySelector(".of-form");
    foot.querySelectorAll('input[name="of-news"]').forEach((r) => r.addEventListener("change", () => form.classList.add("is-open")));
  }
  };
  build();

  // Cookie box: on first open it rises 8px from the bottom right while fading in (.3s), and on choice it goes down over the same length and fades out. The choice is remembered
  let agreed = false;
  try { agreed = localStorage.getItem("of-consent") === "1"; } catch (e) {}
  if (!agreed) {
    const back = '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><path d="M7.5 2.5 4 6l3.5 3.5"/></svg>';
    const sw = (on) => `<label class="of-switch"><input type="checkbox"${on ? " checked" : ""}><i></i></label>`;
    document.body.insertAdjacentHTML("beforeend", `
      <div class="of-consent t-small" role="region" aria-label="Cookie Notice" data-slot="consent">
        <div class="of-consent__card" data-c="simple">
          <h2 class="t-h5o">Your cookie notice title here</h2>
          <p>Your text goes here in about three lines on why cookies are used. One more line on how visit records are viewed, and for details see <a href="#">Terms of service</a>.</p>
          <div class="of-consent__btns"><button class="of-consent__btn" data-c-act="all">Allow all</button><button class="of-consent__btn" data-c-act="need">Allow only what’s necessary</button><button class="of-consent__btn" data-c-act="manage">Pick a Cookie</button></div>
        </div>
        <div class="of-consent__card" data-c="manage">
          <button class="of-consent__back" data-c-act="back">${back}<span>Back</span></button>
          <h2 class="t-h5o" style="margin-top:16px">Pick a Cookie</h2>
          <div class="of-consent__list">
            <div class="of-consent__item"><span>Essential cookies</span><em>Always on</em></div>
            <div class="of-consent__item"><span>Visit analytics</span>${sw(false)}</div>
            <div class="of-consent__item"><span>Custom settings</span>${sw(false)}</div>
          </div>
          <div class="of-consent__btns"><button class="of-consent__btn" data-c-act="all">Allow all</button><button class="of-consent__btn" data-c-act="save">Save selection</button></div>
        </div>
      </div>`);
    const box = document.querySelector(".of-consent");
    const card = (n) => box.querySelector(`[data-c="${n}"]`);
    requestAnimationFrame(() => requestAnimationFrame(() => card("simple").classList.add("is-on")));
    box.addEventListener("click", (e) => {
      const act = e.target.closest("[data-c-act]")?.dataset.cAct;
      if (!act) return;
      if (act === "manage") { card("simple").classList.remove("is-on"); card("manage").classList.add("is-on"); return; }
      if (act === "back") { card("manage").classList.remove("is-on"); card("simple").classList.add("is-on"); return; }
      box.querySelectorAll(".of-consent__card").forEach((c) => c.classList.remove("is-on"));
      try { localStorage.setItem("of-consent", "1"); } catch (err) {}
      setTimeout(() => box.remove(), 400);
    });
  }

  // Smooth scroll — original Lenis defaults (lerp .1) with autoRaf off, driven by the gsap ticker (lagSmoothing 0)
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const lenis = new Lenis({ autoRaf: false });
    OF.lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (t) => lenis.raf(t * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    return () => { gsap.ticker.remove(raf); lenis.destroy(); OF.lenis = null; };
  });

  // Page title box — after the turn ends (immediately if opened directly) it drops in from the top (.8s power3.inOut)
  const drop = (wait) => {
    const title = document.querySelector(".of-title h1");
    if (!title) return;
    if (reduced) return gsap.set(title, { y: 0, yPercent: 0 });
    gsap.set(title, { y: 0, yPercent: -100 });
    gsap.to(title, { yPercent: 0, duration: 0.8, ease: "power3.inOut", delay: wait });
  };
  // On first open, like the original, after the document finishes loading (when the app attaches) the title drops and the photo turns on
  const fadeIn = () => document.querySelectorAll(".of-fade:not(.is-in)").forEach((el) => el.classList.add("is-in"));
  const first = () => { drop(0.1); setTimeout(fadeIn, 100); };
  if (document.readyState === "complete") first();
  else addEventListener("load", first, { once: true });
  // Same-document transition (vt-swap-page) — draws the header and footer in the new wrapper, moves to the top, and after the transition length (1.1s) lowers the title
  document.addEventListener("fx:page-enter", () => {
    build();
    OF.lenis?.scrollTo(0, { immediate: true, force: true });
    ScrollTrigger.refresh();
    drop(reduced ? 0 : 1.1);
    requestAnimationFrame(fadeIn);
  });
})();
