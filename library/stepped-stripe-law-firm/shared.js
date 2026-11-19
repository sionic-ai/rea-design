// Common to the whole site — attaches the header, menu drawer, footer, banner, transition curtain, first loader, cookie card and back-to-top button to every page, and
// Like the original data-animate, reads data-k marks and attaches the entrance motion parts (line-rise·fade-up·stripe-band-reveal) after the curtain lifts.
(() => {
  const html = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const page = document.body.dataset.page || "home";
  gsap.registerPlugin(ScrollTrigger);
  gsap.defaults({ ease: "power3.out" });
  gsap.ticker.lagSmoothing(0);
  ScrollTrigger.config({ ignoreMobileResize: true });

  // ── Image pieces ──
  const ARROW = (d = "M4.5 10h10M10.5 6l4 4-4 4") => `<svg class="k-arrow" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><path d="${d}"/></svg>`;
  // Logo — the original wordmark spot. Fits lowercase English placeholder text to 124px width in the title typeface
  const LOGO = (cls = "k-logo") => `<svg class="${cls}" viewBox="0 0 124 24" aria-hidden="true" data-label="Company wordmark (lowercase English)"><text x="0" y="19" textLength="124" lengthAdjust="spacingAndGlyphs" fill="currentColor" style="font: 700 24px var(--kf-font-display); letter-spacing: .02em">firmname</text></svg>`;
  const btn = (kind, href, label, extra = "") => `<a class="k-btn k-btn--${kind}" href="${href}" data-fx="layer-wipe-button"${extra}><span data-fx-part="label">${label}</span><span data-fx-part="icon">${ARROW()}</span></a>`;
  window.kSite = { ARROW, LOGO, btn };

  const NAV = [["service.html", "Services"], ["profile.html", "Arbitrator"], ["about.html", "About"]];
  const MENU = [["service.html", "Services"], ["profile.html", "Arbitrator"], ["about.html", "About"], ["service.html#tools", "Tools"], ["profile.html#publications", "Knowledge"]];
  const here = location.pathname.split("/").pop() || "index.html";
  const cur = (h) => (h === here ? ' aria-current="page"' : "");

  // ── Header ──
  const header = document.querySelector("[data-slot=header]");
  if (header) {
    header.className = "k-header";
    header.dataset.theme = document.body.dataset.headerTheme || "dark";
    header.innerHTML = `
      <div class="k-header__static"><div class="k-wrap"><div>
        <a href="index.html" aria-label="Home">${LOGO()}</a>
        <div class="k-header__nav">
          <nav aria-label="Main menu"><ul>${NAV.map(([h, t]) => `<li><a class="k-link" href="${h}"${cur(h)}>${t}</a></li>`).join("")}</ul></nav>
          <a class="k-link k-under" href="#k-contact">Get in Touch</a>
        </div>
      </div></div></div>
      <div class="k-header__bar"><div class="k-wrap"><div><span></span>
        <a href="index.html" aria-label="Home">${LOGO()}</a>
        <div class="k-right"><a class="k-link k-under" href="#k-contact">Get in Touch</a><button type="button" class="k-link k-under" id="k-menu-toggle" aria-expanded="false" aria-controls="k-menu">Menu</button></div>
      </div></div></div>`;
    document.body.insertAdjacentHTML("beforeend", `
      <div class="k-menu" id="k-menu" role="dialog" aria-modal="true" aria-label="Menu" inert data-slot="menu">
        <span class="k-menu__veil" data-close></span>
        <div class="k-menu__side"><div class="k-menu__panel">
          <div class="k-menu__top"><a href="index.html" aria-label="Home">${LOGO()}</a><button type="button" class="k-link" data-close>Close</button></div>
          <ul class="k-menu__list">${MENU.map(([h, t], i) => `<li style="--d:${(0.07 * i).toFixed(2)}s"><div><a href="${h}"${cur(h)}>${t}</a></div></li>`).join("")}</ul>
          <div class="k-menu__foot">${btn("blue", "#k-contact", "Get in Touch")}</div>
        </div></div>
      </div>`);
  }

  // ── Banner · Footer ──
  const banner = document.querySelector("[data-slot=banner]");
  if (banner) {
    banner.className = "k-banner";
    banner.innerHTML = `<div class="k-wrap k-banner__in">
        <div class="k-stripes" style="height:140px" data-k="stripes" data-k-drift="off" data-k-start="top center"></div>
        <svg class="k-wordmark" viewBox="0 0 1410 300" aria-hidden="true" data-label="Company wordmark (lowercase English, full screen width)"><text x="0" y="255" textLength="1410" lengthAdjust="spacingAndGlyphs" fill="currentColor" style="font: 700 330px var(--kf-font-display); letter-spacing: -.02em">firmname</text></svg>
        <div class="k-banner__row">
          <h3 class="k-h3" data-k="lines">Ready to raise your strategy to the next level?</h3>
          <div>
            <p data-k="lines" data-k-delay=".15">Your one line here encouraging the next step.</p>
            <div data-k="move" data-k-delay=".25" style="max-width:340px">${btn("light", "#k-contact", "Let's Talk")}</div>
          </div>
        </div>
      </div>`;
  }
  const footer = document.querySelector("[data-slot=footer]");
  if (footer) {
    footer.className = "k-footer";
    footer.id = "k-contact";
    const col = (title, items) => `<div><h4>${title}</h4><ul>${items.map((t) => `<li><a class="k-link" href="${t[1] || "#"}">${t[0]}</a></li>`).join("")}</ul></div>`;
    footer.innerHTML = `<div class="k-wrap">
      <div class="k-footer__grid">
        <div class="k-footer__contact"><h4>Contact Us:</h4><dl>
          <div><dt>Address: <a class="k-link k-under" href="#">(View map)</a></dt><dd>Your one-line office address here<br>Your City · postal code here</dd></div>
          <div><dt>Email:</dt><dd><a class="k-link" href="#">office@example.com</a></dd></div>
          <div><dt>Phone / Messenger:</dt><dd>+00 000 00 00 000</dd></div>
        </dl></div>
        <nav class="k-footer__nav" aria-label="Bottom Menu">
          ${col("Main Pages", [["Home", "index.html"], ["Services", "service.html"], ["Approach", "about.html"], ["Arbitrator", "profile.html"]])}
          ${col("Tools →", [["Arbitration"], ["Negotiation"], ["Mediation"], ["Litigation"], ["Contracts"], ["Specialized Tools"]])}
          ${col("Knowledge →", [["Publications", "profile.html#publications"], ["Training"], ["Agreement Builder"], ["Access to Justice"]])}
          ${col("About", [["About Us", "about.html"], ["Our Founder", "profile.html"], ["General Terms"]])}
        </nav>
      </div>
      <div class="k-footer__base"><span>© 0000 Firm Name. Your copyright line here</span><nav><a class="k-link" href="#">Personal information</a><a class="k-link" href="#">Terms of service</a><a class="k-link" href="#">Business Info</a></nav></div>
    </div>`;
  }

  // ── Transition curtain · cookie · back to top ──
  document.body.insertAdjacentHTML("beforeend", `
    <div class="k-curtain" data-fx="clip-curtain-nav" aria-hidden="true" data-slot="page-curtain"><span data-fx-part="inner"></span><div class="k-wrap"><span data-fx-part="mark" style="display:block">${LOGO()}</span></div></div>
    <div class="k-cookie" role="region" aria-label="Visit Analysis Info" data-slot="cookie"><div>
      <h4>Web analytics</h4>
      <p>Your two or three lines on visit analytics go here. Say whether counting is done without cookies and where to change the settings.</p>
      <div class="k-row"><button type="button" class="k-link k-under" data-cookie>Consent</button><button type="button" class="k-link k-under" data-cookie>Refusal</button></div>
    </div></div>
    <div class="k-totop" data-slot="to-top" inert><button type="button" class="k-btn k-btn--light" data-fx="layer-wipe-button" data-fx-layer-wipe-button="dir: up" aria-label="Back to top"><span data-fx-part="label">To Top</span><span data-fx-part="icon">${ARROW("M10 15.5v-10M6 9.5l4-4 4 4")}</span></button></div>`);

  // ── Smooth scroll — the original Lenis 1.3.26 defaults (lerp .1) driven by the GSAP clock ──
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ autoRaf: false, lerp: 0.1 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
  }
  window.kLenis = lenis;
  const scrollY = () => (lenis ? lenis.scroll : window.scrollY);

  // ── Header switch: past 3× the header height, a white fixed header appears, on return the fixed header slides up with .3s power2.in, then the original header drops down ──
  const hd = document.querySelector(".k-header");
  if (hd) {
    const bar = hd.querySelector(".k-header__bar");
    let h = hd.getBoundingClientRect().height || 54, on = false;
    const set = () => {
      const now = scrollY() >= 3 * h;
      if (now === on) return;
      on = now;
      if (now) {
        gsap.killTweensOf(bar);
        gsap.set(bar, { clearProps: "all" });
        hd.classList.remove("is-hiding");
        hd.classList.add("is-scrolled", "is-animate");
      } else {
        hd.classList.remove("is-scrolled");
        if (matchMedia("(min-width: 1024px)").matches && !reduce) {
          hd.classList.add("is-hiding");
          gsap.fromTo(bar, { yPercent: 0, display: "block", position: "fixed", top: 0, left: "50%", xPercent: -50, width: "100%" }, { yPercent: -100, duration: 0.3, ease: "power2.in", clearProps: "all", onComplete: () => hd.classList.remove("is-hiding") });
        }
      }
    };
    ScrollTrigger.create({ start: 0, end: "max", onUpdate: set, onRefresh: () => { h = hd.getBoundingClientRect().height || h; set(); } });
    set();
  }

  // ── Menu Drawer ──
  const menu = document.getElementById("k-menu");
  const toggle = document.getElementById("k-menu-toggle");
  if (menu && toggle) {
    const open = (v) => {
      menu.classList.toggle("is-open", v);
      v ? menu.removeAttribute("inert") : menu.setAttribute("inert", "");
      toggle.setAttribute("aria-expanded", String(v));
      v ? lenis?.stop() : lenis?.start();
      if (v) menu.querySelector(".k-menu__list a")?.focus({ preventScroll: true });
      else toggle.focus({ preventScroll: true });
    };
    toggle.addEventListener("click", () => open(!menu.classList.contains("is-open")));
    menu.addEventListener("click", (e) => { if (e.target.closest("[data-close]")) open(false); });
    addEventListener("keydown", (e) => { if (e.key === "Escape" && menu.classList.contains("is-open")) open(false); });
  }

  // ── Entrance motion: data-k → part. Like the original, attached when the first loader·transition curtain clears (runAnimations) ──
  const RISE = "y: 100; dur: 1.3; stagger: .1; ease: power2.out; start: top bottom; widen: .95; squash: .85; jitter: 2";
  const arm = () => {
    document.querySelectorAll("[data-k]").forEach((el) => {
      const k = el.dataset.k, d = el.dataset;
      const extra = (d.kDelay ? `; delay: ${d.kDelay}` : "") + (d.kStart ? `; start: ${d.kStart}` : "");
      if (k === "lines") { el.dataset.fx = "line-rise"; el.dataset.fxLineRise = RISE + extra; }
      else if (k === "chars") { el.dataset.fx = "line-rise"; el.dataset.fxLineRise = RISE.replace("y: 100", "split: chars; y: 100") + extra; }
      else if (k === "move") { el.dataset.fx = "fade-up"; el.dataset.fxFadeUp = `y: ${d.kY ?? 50}; duration: ${d.kDur || 1.3}; ease: power2.out; start: ${d.kStart || "top bottom"}` + (d.kStagger ? `; stagger: ${d.kStagger}` : "") + (d.kDelay ? `; delay: ${d.kDelay}` : ""); }
      else if (k === "fade") { el.dataset.fx = "fade-up"; el.dataset.fxFadeUp = `y: 20; duration: 1.1; ease: power2.out; start: top bottom` + (d.kDelay ? `; delay: ${d.kDelay}` : ""); }
      else if (k === "fill") { el.dataset.fx = "char-highlight-scrub"; el.dataset.fxCharHighlightScrub = `fade: .3; each: .1; dur: .1; start: ${d.kStart || "top bottom-=15%"}; end: bottom center`; }
      else if (k === "stripes") { el.dataset.fx = "stripe-band-reveal"; el.dataset.fxStripeBandReveal = `look: ${d.kLook || "wipe"}` + (d.kScrub ? `; scrub: ${d.kScrub}` : "") + (d.kDrift ? `; drift: ${d.kDrift}` : "") + (d.kStart ? `; start: ${d.kStart}` : ""); }
      el.removeAttribute("data-k");
    });
    ScrollTrigger.refresh();
  };
  // Original first loader — over a gray-blue curtain the logo, one line and 0→100% open from below (.7s, .05 stagger), once the number fills, entrance turns on .3s later, and the items, gray-blue curtain and blue curtain peel away from the top (1s power3.inOut)
  const loader = () => new Promise((done) => {
    const box = document.createElement("div");
    box.className = "k-loader";
    box.setAttribute("aria-hidden", "true");
    box.dataset.slot = "loader";
    box.innerHTML = `<span class="k-loader__gray"></span><div class="k-wrap k-loader__in"><div class="k-loader__item">${LOGO()}</div><div class="k-loader__item k-loader__mid">Beyond Winning</div><div class="k-loader__item k-loader__end"><span>0</span>%</div></div>`;
    document.body.append(box);
    lenis?.stop();
    const items = box.querySelectorAll(".k-loader__item"), num = box.querySelector(".k-loader__end span");
    const tl = gsap.timeline({ delay: 0.1, onComplete: () => { box.remove(); lenis?.start(); } });
    tl.fromTo(items, { clipPath: "inset(0% 0% 100% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.7, stagger: 0.05, ease: "power3.inOut" });
    tl.fromTo(num, { textContent: "0" }, { textContent: "100", duration: 0.6, snap: { textContent: 1 }, ease: "none", delay: 0.3, onComplete: () => gsap.delayedCall(0.3, done) }, "<+=0.1");
    tl.to(items, { clipPath: "inset(100% 0% 0% 0%)", duration: 0.7, stagger: 0.05, ease: "power2.inOut" });
    tl.to(box.querySelector(".k-loader__gray"), { clipPath: "inset(100% 0% 0% 0%)", duration: 1, ease: "power3.inOut" }, "<");
    tl.to(box, { clipPath: "inset(100% 0% 0% 0%)", duration: 1, ease: "power3.inOut" }, "<+=0.05");
  });
  const arrived = sessionStorage.getItem("fx-clip-curtain") === "1";
  if (reduce) arm();
  else if (arrived) document.addEventListener("fx:curtain-open", arm, { once: true });
  else loader().then(arm);

  // ── Parallax: data-k-par="Speed" — At 1280px and wider, yPercent −50·speed → +50·speed (scrub). If shorter than the screen, it splits into two stages and passes through in place ──
  const mm = gsap.matchMedia();
  mm.add("(min-width: 1280px) and (prefers-reduced-motion: no-preference)", () => {
    document.querySelectorAll("[data-k-par]").forEach((el) => {
      // For items grouped from the very top like the hero, measuring the original shows it starts at 0 and runs down to +50 · speed (data-k-par-from="0")
      const sp = +el.dataset.kPar || 0.4, a = el.dataset.kParFrom != null ? +el.dataset.kParFrom : -50 * sp, b = 50 * sp;
      const trigger = el.dataset.kTrigger === "parent" ? el.parentElement : el;
      const start = el.dataset.kParStart;
      const h = el.offsetHeight, vh = innerHeight;
      if (h > vh || start) {
        gsap.fromTo(el, { yPercent: a }, { yPercent: b, ease: "none", scrollTrigger: { trigger, start: start || "top bottom", end: "bottom top", scrub: true } });
      } else {
        const t = h + vh, r = vh / t;
        gsap.set(el, { yPercent: a });
        gsap.timeline({ scrollTrigger: { trigger, start: "top bottom", end: "bottom top", scrub: true } })
          .to(el, { yPercent: 0, duration: h / t, ease: "none" }, 0)
          .to(el, { yPercent: b, duration: 1 - r, ease: "none" }, r);
      }
    });
  });

  // ── Cookie card: rises from below after 2s in .5s power2.out, reverses once an option is chosen ──
  const cookie = document.querySelector(".k-cookie");
  if (cookie) {
    const seen = sessionStorage.getItem("k-cookie") === "1";
    if (seen) cookie.remove();
    else {
      const tl = gsap.timeline({ paused: true }).fromTo(cookie, { yPercent: 120 }, { yPercent: 0, duration: 0.5, ease: "power2.out" });
      gsap.delayedCall(2, () => tl.play());
      // Once chosen, it runs back down and stays off-screen (the original is removed after it has fully descended) — the pressed button’s underline stays retracted
      cookie.addEventListener("click", (e) => { const pick = e.target.closest("[data-cookie]"); if (!pick) return; sessionStorage.setItem("k-cookie", "1"); cookie.classList.add("is-done"); pick.classList.add("is-picked"); cookie.setAttribute("inert", ""); tl.reverse(); });
    }
  }

  // ── Back to top: after scrolling down more than two screens, it rises in .3s ease-out only when scrolling up, and hides when the footer is visible ──
  const top = document.querySelector(".k-totop");
  if (top) {
    let last = 0, footSeen = false;
    const ft = document.querySelector(".k-footer");
    if (ft) new IntersectionObserver(([en]) => { footSeen = en.isIntersecting; tick(); }).observe(ft);
    function tick() {
      const y = scrollY(), up = y < last;
      last = y;
      const show = y > 2 * innerHeight && up && !footSeen && !document.querySelector(".k-cookie:not(.is-done)");
      top.classList.toggle("is-on", show);
      show ? top.removeAttribute("inert") : top.setAttribute("inert", "");
    }
    lenis ? lenis.on("scroll", tick) : addEventListener("scroll", tick, { passive: true });
    top.querySelector("button").addEventListener("click", () => (lenis ? lenis.scrollTo(0, { duration: 1.2, easing: (e) => (e < 0.5 ? 8 * e ** 4 : 1 - Math.pow(-2 * e + 2, 4) / 2) }) : scrollTo({ top: 0, behavior: "smooth" })));
  }

  // ── Same-page links (#) — moved with Lenis in 1.25s (original scrollToSettings) ──
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || !lenis) return;
    const t = document.querySelector(a.getAttribute("href"));
    if (!t) return;
    e.preventDefault();
    lenis.scrollTo(t, { duration: 1.25, easing: (x) => (x < 0.5 ? 8 * x ** 4 : 1 - Math.pow(-2 * x + 2, 4) / 2) });
  });

  // ── Dot-art icon (tool card) — our own pattern replaces the original dot pattern: per cell . empty, o blue, x ink ──
  const DOTS = {
    a: ["oo.oo", "oooxo", "ooxoo", "oo.oo"],
    b: [".ooo.", "o.x.o", "oox.oo", "ooooo"],
    c: ["x.x.x", ".o.o.", "ooooo", "ooooo"],
    d: ["..x..", ".ooo.", "ooooo", "ooooooo"],
    e: ["oo..oo", "ooo.oo", "..xx..", ".oxo."],
    f: ["..o..oo", ".ooo.oo", "ooxoooo", "ooxoooo"],
  };
  document.querySelectorAll("[data-dots]").forEach((el) => {
    const rows = DOTS[el.dataset.dots] || DOTS.a, r = 3.6, gap = 10.4;
    const w = Math.max(...rows.map((s) => s.length)) * gap, hh = rows.length * gap;
    let c = "";
    rows.forEach((s, y) => [...s].forEach((ch, x) => { if (ch === ".") return; c += `<circle cx="${(x * gap + gap / 2).toFixed(1)}" cy="${(y * gap + gap / 2).toFixed(1)}" r="${r}" class="${ch === "x" ? "is-ink" : "is-blue"}"/>`; }));
    el.innerHTML = `<svg viewBox="0 0 ${w} ${hh}" aria-hidden="true">${c}</svg>`;
  });

  // ── The small photo in a list row follows the cursor up to 8px horizontally and 6px vertically (original useListItemPointerParallax) ──
  if (fine && !reduce) {
    document.querySelectorAll("[data-k-follow]").forEach((row) => {
      const img = row.querySelector("[data-k-follow-img]");
      if (!img) return;
      let raf = 0, px = 0, py = 0;
      const loop = () => {
        const b = row.getBoundingClientRect();
        const nx = Math.max(-1, Math.min(1, (px - (b.left + b.width / 2)) / Math.max(b.width / 2, 1)));
        const ny = Math.max(-1, Math.min(1, (py - (b.top + b.height / 2)) / Math.max(b.height / 2, 1)));
        img.style.transform = `translate3d(${(nx * 8).toFixed(2)}px, ${(ny * 6).toFixed(2)}px, 0px)`;
        raf = requestAnimationFrame(loop);
      };
      row.addEventListener("pointerenter", (e) => { px = e.clientX; py = e.clientY; cancelAnimationFrame(raf); raf = requestAnimationFrame(loop); });
      row.addEventListener("pointermove", (e) => { px = e.clientX; py = e.clientY; });
      row.addEventListener("pointerleave", () => { cancelAnimationFrame(raf); img.style.transform = "translate3d(0px, 0px, 0px)"; });
    });
  }

  // ── Drag cursor — over the slider a round ‹Drag› label follows the cursor and shrinks while pressed ──
  window.kDragCursor = (zone) => {
    if (!fine || !zone) return;
    const cur = document.createElement("div");
    cur.className = "k-drag";
    cur.setAttribute("aria-hidden", "true");
    cur.innerHTML = `<span>${ARROW("M8 6l-4 4 4 4")}</span><b>Drag</b><span>${ARROW("M12 6l4 4-4 4")}</span>`;
    document.body.append(cur);
    const xTo = gsap.quickTo(cur, "x", { duration: 0.4, ease: "power3" }), yTo = gsap.quickTo(cur, "y", { duration: 0.4, ease: "power3" });
    zone.addEventListener("pointerenter", (e) => { gsap.set(cur, { x: e.clientX, y: e.clientY }); cur.classList.add("is-on"); });
    zone.addEventListener("pointerleave", () => cur.classList.remove("is-on", "is-down"));
    zone.addEventListener("pointermove", (e) => { xTo(e.clientX); yTo(e.clientY); });
    zone.addEventListener("pointerdown", () => cur.classList.add("is-down"));
    addEventListener("pointerup", () => cur.classList.remove("is-down"));
  };

  // Dot map — continents are drawn as dots and pins planted, then a small dot travels along curves between pins (original: short route .5s as baseline, duration proportional to length, straight, pin trembles on arrival)
  const LAND = [
    "      ####       ##             ######          ",
    "   ##########  ####     ##  ##############      ",
    "  ############  ##     ####################  #  ",
    "    ##########         #####################    ",
    "     ########         ####################      ",
    "      ######          ###################       ",
    "       ####          ####  ##########           ",
    "        ###          #######  ######  #         ",
    "         ##           ######   ####   #         ",
    "          ####         #####    ##    ##        ",
    "           #####        ####          ###       ",
    "           ######       ####                    ",
    "            #####       ###            ####     ",
    "             ####        ##          #######    ",
    "             ###                     #######    ",
    "             ##                       ####      ",
    "             #                                  ",
  ];
  document.querySelectorAll("[data-k-map]").forEach((el) => {
    const C = 20, cols = LAND[0].length, rows = LAND.length, W = cols * C, H = rows * C;
    const pins = el.dataset.kMap.trim().split(/\s+/).map((p) => p.split(",").map(Number)).map(([x, y]) => [(x / 100) * W, (y / 100) * H]);
    let dots = "";
    LAND.forEach((r, y) => [...r].forEach((ch, x) => { if (ch === "#") dots += `<circle cx="${x * C + C / 2}" cy="${y * C + C / 2}" r="2.6"/>`; }));
    const arcs = pins.slice(1).map(([x, y], i) => { const [a, b] = pins[i], mx = (a + x) / 2, my = (b + y) / 2 - Math.hypot(x - a, y - b) * 0.3; return `<path d="M${a.toFixed(1)} ${b.toFixed(1)} Q${mx.toFixed(1)} ${my.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}"/>`; }).join("");
    const pinEls = pins.map(([x, y], i) => `<g class="k-map__pin" transform="translate(${x.toFixed(1)} ${y.toFixed(1)})"><g><rect x="-9" y="-9" width="18" height="18" rx="3"/><text y="4" text-anchor="middle">${i % 3 === 1 ? i + 1 : ""}</text></g></g>`).join("");
    el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" aria-hidden="true"><g class="k-map__land">${dots}</g><g class="k-map__arcs">${arcs}</g><g class="k-map__runs">${pins.slice(1).map(() => '<circle r="4"/>').join("")}</g>${pinEls}</svg>`;
    // The dot travelling between pins is only on the About page map (original content-image-map) — Work page maps stay still
    if (reduce || !el.hasAttribute("data-k-map-run")) return;
    const paths = [...el.querySelectorAll(".k-map__arcs path")], runs = [...el.querySelectorAll(".k-map__runs circle")], pinG = [...el.querySelectorAll(".k-map__pin > g")];
    if (!paths.length) return;
    const lens = paths.map((p) => p.getTotalLength()), min = Math.min(...lens);
    const shake = (g) => g && gsap.fromTo(g, { rotation: 2 }, { keyframes: { rotation: [2, -2, 2, -2, 2, -2, 0] }, duration: 0.4, ease: "none", transformOrigin: "50% 50%" });
    const tl = gsap.timeline({ repeat: -1, paused: true, repeatDelay: 0.6 });
    paths.forEach((p, i) => {
      const d = i * 0.6, len = lens[i], dur = (0.5 * len) / min, fwd = i < 5, o = { t: 0 }, c = runs[i];
      tl.set(c, { opacity: 0 }, d).to(c, { opacity: 1, duration: 0.3 }, d).call(() => shake(pinG[fwd ? i : i + 1]), null, d);
      tl.to(o, { t: 1, duration: dur, ease: "none", onUpdate: () => { const pt = p.getPointAtLength((fwd ? o.t : 1 - o.t) * len); c.setAttribute("cx", pt.x); c.setAttribute("cy", pt.y); } }, d);
      tl.to(c, { opacity: 0, duration: 0.15 }, d + dur).call(() => shake(pinG[fwd ? i + 1 : i]), null, d + dur);
    });
    ScrollTrigger.create({ trigger: el, start: "top bottom", end: "bottom top", onToggle: (st) => (st.isActive ? tl.play() : tl.pause()) });
  });

  // ── Card slider — original Swiper (slidesPerView auto · 15px gap · transition curve cubic-bezier(.65,.05,.36,1)) + ”Drag” cursor ──
  document.querySelectorAll(".k-swiper").forEach((el) => {
    if (!window.Swiper) return;
    const box = el.closest(".k-slider");
    const sw = new Swiper(el, { slidesPerView: "auto", spaceBetween: 15 });
    box?.querySelector(".k-prev")?.addEventListener("click", () => sw.slidePrev());
    box?.querySelector(".k-next")?.addEventListener("click", () => sw.slideNext());
    window.kDragCursor(el);
  });
})();
