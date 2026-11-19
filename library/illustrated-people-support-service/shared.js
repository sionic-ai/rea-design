// Spanning several pages — plugs in the header row · phone menu · contact section (people row band) · footer · loading curtain in one place, draws the people graphic,
// Rebuilds the original jQuery devices (loading, anchor, accordion, toggle, scroll toggle) with the same values.
(() => {
  const page = document.body.dataset.page || "home";
  const LINKS = [
    ["about.html", "Each About", "Company About", "About Us", "Company About"],
    ["news.html", "News & Column", "News", "News & Column", "News & Columns"],
    ["faq.html", "FAQ", "Frequently asked questions", "FAQ", "Frequently asked questions"],
  ];
  const SEND = '<svg class="b-send" viewBox="0 0 24 24" aria-hidden="true"><path d="M22 2.5 1.8 10.6l6.1 2.6L18.6 5.6 10 14.6v6.9l3.6-4.6 5 2.4z"/></svg>';
  const ARROW = '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M4.5 2.5 8 6l-3.5 3.5"/></svg>';
  const mark = (cls = "") => `<svg class="e-logo__mark e-mark ${cls}" viewBox="0 0 54 48" aria-hidden="true"><rect class="m-d" x="2" y="38" width="44" height="8" rx="1.5"/><rect class="m-a" x="6" y="18" width="12" height="18" rx="1.5"/><rect class="m-b" x="20" y="6" width="12" height="30" rx="1.5"/><path class="m-c" d="M37 10.5a2 2 0 0 1 2.7-.8l11 6.4a2 2 0 0 1 .8 2.7L44 31.6a2 2 0 0 1-2.7.8l-6.4-3.7a2 2 0 0 1-.8-2.7z"/></svg>`;
  const logo = (extra = "") => `${mark()}<span class="e-logo__name" data-label="Brand English name">Name</span>${extra}`;

  // ── Header line
  const header = document.querySelector('[data-slot="header"]');
  if (header) {
    header.className = "l-header";
    header.innerHTML = `
      <a class="header__logo e-logo" href="index.html">${logo()}<span class="header__tag">Your one-line service name here</span></a>
      <nav class="header__navi">
        <ul class="navi__list">${LINKS.map(([h, , ko]) => `<li><a href="${h}">${ko}</a></li>`).join("")}</ul>
        <a class="navi__contact c-button c-button--sm" href="#contact">${SEND}Contact Us</a>
      </nav>
      <nav class="header__menu">
        <button class="menu__icon" type="button" aria-label="Menu"><i></i><i></i><i></i></button>
        <div class="menu__content">
          <ul class="menu__list">
            <li><a href="index.html"><span class="h-en">Top</span><span class="h-sub">Service Hero</span></a></li>
            ${LINKS.map(([h, , , en, sub]) => `<li><a href="${h}"><span class="h-en">${en}</span><span class="h-sub">${sub}</span></a></li>`).join("")}
          </ul>
          <a class="menu__contact c-button c-button--lg c-button--white" href="#contact">${SEND}Contact Us</a>
        </div>
      </nav>`;
    header.querySelectorAll(".navi__list a").forEach((a) => { if (a.getAttribute("href") === `${page}.html`) a.setAttribute("aria-current", "page"); });
    const menu = header.querySelector(".header__menu"), btn = menu.querySelector(".menu__icon"), panel = menu.querySelector(".menu__content");
    const setMenu = (open) => {
      menu.classList.toggle("is-active", open);
      btn.classList.toggle("is-active", open);
      header.classList.toggle("is-open", open);
      // Original js-toggle — plate (data-delay=100) only turns on 100ms late, and turns off right away when closing
      clearTimeout(setMenu.t);
      if (open) setMenu.t = setTimeout(() => panel.classList.add("is-active"), 100);
      else panel.classList.remove("is-active");
    };
    btn.addEventListener("click", () => setMenu(!menu.classList.contains("is-active")));
    panel.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
  }

  // ── Contact section: big English title + bold line + big button + a strip of people in a row
  const CROWD = [
    ["stand jacket ink grey m", "talk yellow grey f skirt l"],
    ["walk blue grey m", "point jacket ink ink f l"],
    ["prop:bench"],
    ["walk blue green m wave"],
    ["talk green blue m", "talk yellow coral f l"],
    ["prop:blocks", "point jacket ink ink m l"],
    ["walk white grey f skirt", "stand blue ink m l"],
    ["hold yellow ink f box", "talk jacket ink ink m l"],
    ["wave green ink m", "walk coral grey f skirt"],
    ["read white blue m paper", "stand jacket ink ink f l"],
  ];
  const crowdSlides = () => CROWD.map((g) => `<li class="splide__slide"><div class="e-crowd" data-label="Flat illustration of people working and talking · white background · aligned to the floor line">${g.map((t) => t.startsWith("prop:") ? PROP[t.slice(5)] : `<svg class="fig" data-fig="${t}"></svg>`).join("")}</div></li>`).join("");
  const PROP = {
    bench: '<svg class="e-prop" viewBox="0 0 230 260" aria-hidden="true"><rect class="p-yellow" x="0" y="168" width="230" height="22" rx="2"/><circle class="p-green" cx="46" cy="222" r="26"/><circle class="p-green" cx="184" cy="222" r="26"/><svg class="fig" data-fig="sit ink blue m wave-sit" x="44" y="40" width="124" height="200"></svg></svg>',
    blocks: '<svg class="e-prop" viewBox="0 0 110 260" aria-hidden="true"><rect class="p-green" x="8" y="150" width="44" height="104" rx="3"/><rect class="p-blue" x="56" y="196" width="44" height="58" rx="3"/><rect class="p-yellow" x="10" y="100" width="46" height="46" rx="3"/><rect class="p-blue" x="58" y="132" width="40" height="60" rx="3"/></svg>',
  };
  document.querySelectorAll("[data-crowd]").forEach((ul) => (ul.innerHTML = crowdSlides()));
  const contact = document.querySelector('[data-slot="contact"]');
  if (contact) {
    contact.id = "contact";
    contact.className = "l-contact e-paper";
    contact.innerHTML = `
      <h2 class="c-heading c-heading--lg c-heading--center"><span class="h-en">Contact Us</span><span class="h-sub">Contact Us</span></h2>
      <div class="contact__body">
        <p>Feel free to ask us about our services first.</p>
        <a class="contact__button c-button c-button--xl" href="#contact">${SEND}Contact Us</a>
      </div>
      <div class="contact__visual">
        <div class="splide c-visual" id="splide-contact" data-slot="crowd-marquee"><div class="splide__track"><ul class="splide__list">${crowdSlides()}</ul></div></div>
      </div>`;
  }

  // ── Footer
  const footer = document.querySelector('[data-slot="footer"]');
  if (footer) {
    footer.className = "l-footer";
    footer.innerHTML = `
      <a class="footer__logo e-logo" href="index.html">${logo()}<span class="footer__tag">Your one-line service name here</span></a>
      <nav class="footer__menu"><ul class="f-list">${LINKS.map(([h, , ko]) => `<li><a href="${h}">${ko}</a></li>`).join("")}<li><a href="#contact">Contact Us</a></li></ul></nav>
      <div class="footer__sub">
        <ul><li><a href="#">Privacy policy</a></li><li><a href="#">Policy on responding to antisocial groups</a></li></ul>
        <small>Copyright© Company Name. All rights reserved.</small>
      </div>
      <div class="footer__topLink"><a href="#wrapper" aria-label="Back to top"><svg viewBox="0 0 24 24"><path d="M5 15.5 12 8.5l7 7"/></svg></a><span>TOP</span></div>`;
  }

  document.querySelectorAll(".b-circle").forEach((el) => { if (!el.querySelector("svg")) el.innerHTML = ARROW; });

  // ── Person drawing — data-fig="Pose, top color, bottom color m|f [jacket] [skirt] [l] [prop]"
  //   The original is a flat PNG illustration (suit · shirt · plain trousers, thick limbs, round head). Redrawn with the same proportions (head:height ≈ 1:8) and the same few colors.
  const COL = { blue: "var(--site-blue)", green: "var(--kf-accent)", yellow: "var(--site-yellow)", ink: "var(--site-suit)", grey: "var(--site-grey)", white: "var(--kf-bg)", coral: "var(--site-coral)", dim: "var(--kf-dim)" };
  const STAND_L = [[55, 190, 54, 248], [65, 190, 66, 248]];
  const POSE = {
    stand: { a: [[44, 92, 44, 126], [76, 92, 76, 126]], l: STAND_L },
    walk: { a: [[42, 90, 32, 120], [80, 92, 90, 120]], l: [[50, 188, 36, 246], [70, 188, 86, 244]] },
    wave: { a: [[44, 92, 44, 126], [86, 44, 90, 12]], l: STAND_L },
    point: { a: [[44, 92, 44, 126], [92, 60, 120, 56]], l: STAND_L },
    push: { a: [[74, 74, 100, 64], [80, 80, 106, 74]], l: [[50, 188, 36, 246], [66, 190, 68, 248]] },
    hold: { a: [[42, 96, 62, 98], [78, 96, 64, 102]], l: STAND_L },
    think: { a: [[46, 100, 72, 102], [82, 98, 68, 46]], l: STAND_L },
    talk: { a: [[44, 92, 44, 126], [84, 88, 100, 74]], l: STAND_L },
    read: { a: [[36, 82, 40, 64], [84, 82, 80, 64]], l: STAND_L },
    laptop: { a: [[44, 98, 58, 116], [76, 98, 62, 116]], l: STAND_L },
    sit: { a: [[44, 92, 54, 114], [76, 92, 72, 116]], l: [[90, 134, 92, 192], [84, 134, 86, 194]] },
  };
  const draw = (svg) => {
    const tok = (svg.dataset.fig || "").split(/\s+/);
    const pose = POSE[tok[0]] ? tok[0] : "stand", P = POSE[pose];
    const has = (k) => tok.includes(k), fem = has("f");
    // Color words are the top and bottom clothes in order. If jacket has only one color, a formal (ink-black) jacket + pants in that color
    const cols = tok.filter((t) => COL[t]).map((t) => COL[t]);
    const top = has("jacket") && cols.length < 2 ? COL.ink : cols[0] || COL.blue;
    const bot = has("jacket") && cols.length < 2 ? cols[0] || COL.ink : cols[1] || COL.ink;
    let [aL, aR] = P.a;
    if (has("wave-sit")) aR = [86, 44, 92, 14];
    const legs = P.l, sit = pose === "sit";
    const line = (pts, cls, w) => `<polyline class="${cls}" points="${pts.join(" ")}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
    let s = "";
    // Legs (skirt plus bare legs if a skirt)
    if (has("skirt") && !sit) {
      s += line([54, 196, 54, 246], "f-skin-s", 8) + line([66, 196, 66, 246], "f-skin-s", 8);
      s += `<path class="f-bot" d="M47 120h26l12 84H35z"/>`;
      s += `<ellipse class="f-shoe" cx="57" cy="249" rx="8" ry="4"/><ellipse class="f-shoe" cx="69" cy="249" rx="8" ry="4"/>`;
    } else {
      s += line([52, 126, legs[0][0], legs[0][1], legs[0][2], legs[0][3]], "f-bot-s", 14);
      s += line([68, 126, legs[1][0], legs[1][1], legs[1][2], legs[1][3]], "f-bot-s", 14);
      s += `<ellipse class="f-shoe" cx="${legs[0][2] + 4}" cy="${legs[0][3] + 3}" rx="9" ry="4.5"/><ellipse class="f-shoe" cx="${legs[1][2] + 4}" cy="${legs[1][3] + 3}" rx="9" ry="4.5"/>`;
      if (sit) s += `<path class="f-bot" d="M46 118h40v22H46z"/>`;
    }
    // Rear arm
    s += line([47, 58, aL[0], aL[1], aL[2], aL[3]], "f-top-s", 11) + `<circle class="f-skin" cx="${aL[2]}" cy="${aL[3]}" r="5.5"/>`;
    // Body · neck · shirt
    s += `<rect class="f-skin" x="55.5" y="40" width="9" height="14" rx="3"/>`;
    s += `<path class="f-top" d="M44 56q2-6 9-6h14q7 0 9 6l2 76H42z"/>`;
    if (has("jacket")) s += `<path class="f-shirt" d="M54 50h12l-2 52h-8z"/>`;
    // Head
    if (fem) s += `<rect class="f-hair" x="45" y="16" width="30" height="${has("short") ? 26 : 34}" rx="13"/>`;
    s += `<circle class="f-hair" cx="59.5" cy="26" r="14"/>`;
    s += `<ellipse class="f-skin" cx="61.5" cy="31.5" rx="11.5" ry="12.5"/>`;
    s += fem ? `<path class="f-hair" d="M48 26q8-14 25-4q-6 1-12 6q-7 4-13 3z"/><circle class="f-hair" cx="${has("bun") ? 60 : 44}" cy="${has("bun") ? 11 : 30}" r="${has("bun") ? 6 : 7}"/>`
      : `<path class="f-hair" d="M47 27q4-17 22-12q6 2 6 9q-9-4-18 2q-5 3-10 1z"/>`;
    // Prop
    if (has("paper") || pose === "read") s += `<path class="f-paper" d="M22 56l38 6 38-6 4 64-42 8-42-8z"/><path class="f-paper-line" d="M60 62v64" stroke-width="1.6"/>`;
    if (has("box")) s += `<rect class="f-box" x="54" y="80" width="22" height="20" rx="2"/>`;
    if (has("tablet")) s += `<rect class="f-tab" x="62" y="104" width="22" height="16" rx="2" transform="rotate(-18 73 112)"/>`;
    if (pose === "laptop") s += `<rect class="f-pc" x="34" y="112" width="52" height="34" rx="3"/><circle class="f-pc-dot" cx="60" cy="129" r="4"/>`;
    // Front arm
    if (pose !== "read") s += line([73, 58, aR[0], aR[1], aR[2], aR[3]], "f-top-s", 11) + `<circle class="f-skin" cx="${aR[2]}" cy="${aR[3]}" r="5.5"/>`;
    else s += `<circle class="f-skin" cx="${aL[2]}" cy="${aL[3]}" r="5.5"/><circle class="f-skin" cx="${aR[2]}" cy="${aR[3]}" r="5.5"/>`;
    const bust = has("bust");
    svg.setAttribute("viewBox", bust ? "26 2 70 70" : sit ? "0 0 124 200" : "0 0 124 260");
    svg.setAttribute("aria-hidden", "true");
    svg.style.setProperty("--t", top);
    svg.style.setProperty("--b", bot);
    if (sit) svg.classList.add("is-sit");
    svg.innerHTML = has("l") ? `<g transform="translate(124 0) scale(-1 1)">${s}</g>` : s;
  };
  const drawAll = (root = document) => root.querySelectorAll("svg[data-fig]").forEach(draw);
  window.eachDraw = drawAll;
  drawAll();

  // ── Scroll toggle (original js-scrollToggle) — on every scroll, items whose top edge has risen above scroll + screen height/1.5 get is-animated after data-delay ms
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const items = [...document.querySelectorAll(".js-scrollToggle__item")];
  if (reduce) items.forEach((el) => el.classList.add("is-animated"));
  else {
    const toggle = () => {
      const line = scrollY + innerHeight / 1.5;
      items.forEach((el) => {
        if (el.dataset.done) return;
        if (el.getBoundingClientRect().top + scrollY <= line) {
          el.dataset.done = "1";
          setTimeout(() => el.classList.add("is-animated"), +(el.dataset.delay || 0));
        }
      });
    };
    addEventListener("scroll", toggle, { passive: true });
  }

  // ── Anchor — scrolls less by the header line height, 500ms (jQuery swing = sine.inOut)
  if (window.gsap && window.ScrollToPlugin) gsap.registerPlugin(ScrollToPlugin);
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute("href").slice(1), target = id ? document.getElementById(id) : null;
    e.preventDefault();
    if (!target) return;
    const head = document.querySelector(".l-header");
    const y = target.getBoundingClientRect().top + scrollY - (id === "wrapper" ? 0 : head ? head.offsetHeight : 0);
    if (window.gsap && window.ScrollToPlugin && !reduce) gsap.to(window, { scrollTo: y, duration: 0.5, ease: "sine.inOut", overwrite: true });
    else scrollTo(0, y);
  });

  // Accordion (FAQ) — on press the chevron turns and the answer slides open and closed with a 300ms swing
  document.querySelectorAll(".js-accordion").forEach((box) => {
    const trig = box.querySelector(".js-accordion__trigger"), body = box.querySelector(".js-accordion__content");
    if (!trig || !body) return;
    trig.addEventListener("click", () => {
      const open = !body.classList.contains("is-active");
      trig.classList.toggle("is-active", open);
      body.classList.toggle("is-active", open);
      if (!window.gsap || reduce) { body.style.display = open ? "block" : "none"; return; }
      gsap.killTweensOf(body);
      if (open) gsap.fromTo(body, { display: "block", height: 0 }, { height: "auto", duration: 0.3, ease: "sine.inOut", clearProps: "height" });
      else gsap.to(body, { height: 0, duration: 0.3, ease: "sine.inOut", onComplete: () => gsap.set(body, { display: "none", clearProps: "height" }) });
    });
  });

  // ── People procession strip — original Splide loop + AutoScroll (speed .5 · no dragging · doesn’t stop on hover · 5% gap)
  if (window.Splide) document.querySelectorAll(".splide.c-visual").forEach((el) => {
    const s = new Splide(el, { type: "loop", autoWidth: true, perPage: 1, gap: "5%", arrows: false, pagination: false, drag: false, autoScroll: { speed: reduce ? 0 : 0.5, pauseOnHover: false, pauseOnFocus: false } });
    s.mount(window.splide && window.splide.Extensions);
  });

  // ── Loading veil — only on the first open in a tab (sessionStorage visited). 1s after load, is-active goes on the circle · indicator in the veil, then the body opens.
  //   Hero image turns on 3.5s later, on a returning tab 1s after load, and the title line is 1.6s later than the image (original function.js)
  const wrap = document.getElementById("wrapper");
  const loading = document.querySelector(".e-loading");
  const fire = (ms, name) => setTimeout(() => document.dispatchEvent(new CustomEvent(name)), ms);
  let visited = false;
  try { visited = !!sessionStorage.getItem("each-visited"); sessionStorage.setItem("each-visited", "1"); } catch (e) { visited = true; }
  if (reduce) visited = true;
  const start = () => {
    if (!loading || visited) {
      if (loading) loading.classList.remove("is-show");
      wrap && wrap.classList.remove("is-hidden");
      fire(reduce ? 0 : 1000, "each:illust");
      fire(reduce ? 0 : 2600, "each:text");
      return;
    }
    loading.classList.add("is-show");
    setTimeout(() => {
      loading.classList.add("is-active");
      loading.querySelectorAll(":scope > *").forEach((c) => c.classList.add("is-active"));
      wrap && wrap.classList.remove("is-hidden");
      fire(3500, "each:illust");
      fire(5100, "each:text");
    }, 1000);
  };
  if (loading) loading.innerHTML = `<p class="e-loading__logo">${mark().replace("e-logo__mark", "e-logo__mark e-loading__svg")}</p><div class="e-loading__circle"></div>`;
  if (document.readyState === "complete") start();
  else addEventListener("load", start);
})();
