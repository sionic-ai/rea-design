// Shared across the whole site — lays the header search bar · full menu · search drawer · ask window · phone bar · footer on every page.
// The original is a Next.js app, so these panels sit once in the layout and only the page changes — the copy builds the same frame on every page from this file.
(() => {
  const page = document.body.dataset.page || "home";
  const ICON = {
    plane: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M12 2.5c.8 0 1.4.9 1.4 2V9l8.1 4.6v2.2l-8.1-2.3v4.1l2.3 1.7v1.8L12 20l-3.7 1.1v-1.8l2.3-1.7v-4.1L2.5 15.8v-2.2L10.6 9V4.5c0-1.1.6-2 1.4-2z"/></svg>',
    land: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M21.5 12c0 .8-.9 1.4-2 1.4H15l-4.6 8.1H8.2l2.3-8.1H6.4l-1.7 2.3H2.9L4 12 2.9 8.3h1.8l1.7 2.3h4.1L8.2 2.5h2.2L15 10.6h4.5c1.1 0 2 .6 2 1.4z"/></svg>',
    cal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15.5"/><path d="M3.5 9.5h17M8 3v4M16 3v4"/></svg>',
    pax: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="9" cy="8.5" r="3.5"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6"/><circle cx="16.5" cy="7.5" r="2.8"/><path d="M17 13.5c2.7.3 4.5 2.4 4.5 5.5"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="10.5" cy="10.5" r="7"/><path d="M16 16l5.5 5.5"/></svg>',
    close: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19"/></svg>',
    back: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
    minus: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 12h14"/></svg>',
    plus: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 12h14M12 5v14"/></svg>',
    send: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>',
    mic: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>',
    mark: '<svg viewBox="0 0 64 64" fill="none" aria-hidden="true"><circle cx="32" cy="32" r="8.2" stroke-width="2.2"/><path d="M11.6 29L14.2 17c.6-2.8 3.3-5 6.1-5h12M52.4 35l-2.6 12c-.6 2.8-3.3 5-6.1 5h-12" stroke="currentColor" stroke-width="5.2" stroke-linecap="round"/></svg>',
  };
  const LINKS = [
    ["index.html", "Home", "home"], ["news.html", "Listings", "listings"], ["about.html", "Platform", "platform", true], ["news.html", "Payments", "pay"],
    ["news.html", "Journal", "news"], ["about.html", "About", "about"], ["recruit.html", "Contact", "recruit"],
  ];
  const brand = (size) => `<span class="vl-mark" data-label="Brand English name (italic lowercase wordmark)"${size ? ` style="--logo-size:${size}"` : ""}>wordmark</span>`;

  // ── Head
  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.className = "vl-head";
    head.innerHTML = `
      <div class="vl-head__row">
        <a class="vl-head__logo" href="index.html" aria-label="First Page">${brand()}</a>
        <div class="vl-head__spacer"></div>
        <div class="vl-head__burger-cell"><button class="vl-burger" type="button" aria-label="Open Menu" aria-expanded="false" data-menu-open>
          <svg viewBox="0 0 24 18" width="24" height="18" fill="none" stroke-width="1.5" stroke-linecap="round">
            <line class="is-a" x1="2" y1="3" x2="24" y2="3" style="--d:880ms"/><line class="is-a" x1="0" y1="9" x2="14" y2="9" style="--d:600ms"/><line class="is-a" x1="5" y1="15" x2="24" y2="15" style="--d:960ms"/>
            <line class="is-b" x1="2" y1="3" x2="24" y2="3" style="--d:880ms"/><line class="is-b" x1="0" y1="9" x2="14" y2="9" style="--d:600ms"/><line class="is-b" x1="5" y1="15" x2="24" y2="15" style="--d:960ms"/>
          </svg></button></div>
        <div class="vl-head__search">
          <div class="vl-field" data-drop="from" tabindex="0">${ICON.plane}<span>From</span></div>
          <div class="vl-field" data-drop="to" tabindex="0">${ICON.land}<span>To</span></div>
          <div class="vl-field" data-drop="date" tabindex="0">${ICON.cal}<span>Date</span></div>
          <div class="vl-pax"><span class="vl-pax__ic">${ICON.pax}</span><span class="vl-pax__row"><button type="button" aria-label="Minus One Person" data-pax="-1">${ICON.minus}</button><b data-pax-n>4</b><button type="button" aria-label="Add one more person" data-pax="1">${ICON.plus}</button></span></div>
          <button class="vl-search-btn" type="button" data-sheet-open>${ICON.search}<span>Search</span></button>
        </div>
      </div>`;
  }

  // ── Full menu (the panel rises from below in .8s cubic-bezier(.78,.01,.23,.99), then item text slides in from the left over .8s)
  const menu = document.createElement("div");
  menu.className = "vl-menu";
  menu.setAttribute("data-slot", "menu");
  menu.setAttribute("aria-hidden", "true");
  menu.innerHTML = `
    <button class="vl-menu__close" type="button" aria-label="Close menu (Esc)" data-menu-close>${ICON.close}<kbd>Esc</kbd></button>
    <div class="vl-rule vl-menu__top" data-menu-rule></div>
    <div class="vl-menu__grid">
      <nav class="vl-menu__nav">${LINKS.map(([href, label, key, mark]) => `
        <div class="vl-menu__item"><a href="${href}"${key === page ? ' aria-current="page"' : ""}>
          ${mark ? `<span class="vl-mark" data-fx="char-clip-slide" data-fx-char-clip-slide="play: event; delay: .8; each: .02" data-label="Product name in English (italic wordmark)">wordOS</span>` : `<span data-fx="char-clip-slide" data-fx-char-clip-slide="play: event; delay: .8; each: .02" data-label="Menu name (English)">${label}</span>`}
          <span class="vl-menu__dot"></span></a><div class="vl-rule" data-menu-rule></div></div>`).join("")}
      </nav>
      <div class="vl-menu__side">
        <div class="vl-menu__frame">
          <div class="vl-rule is-v" style="right:5rem;top:0;bottom:0" data-menu-rule></div>
          <div class="vl-rule is-v" style="left:5rem;top:0;bottom:0" data-menu-rule></div>
          <div class="vl-rule" style="left:0;right:0;bottom:6.6rem" data-menu-rule></div>
          <div class="vl-menu__photo"><div class="wf-img" data-label="Scene photo of the hovered menu item · airplane cabin seat or runway · tall rounded frame"></div></div>
          <div class="vl-menu__contact">CONTACT</div>
        </div>
      </div>
      <div class="vl-menu__foot">
        <div class="vl-menu__foot-row">
          <div class="vl-menu__duo">
            <button class="vl-pill is-solid" type="button" data-sheet-open><span>${ICON.search.replace("<svg", '<svg width="14" height="14"')}Search</span><span>Search</span></button>
            <button class="vl-pill" type="button" data-agent-open><span>Ask ${brand("1em")}</span><span>Ask wordmark</span></button>
          </div>
          <div class="vl-menu__links"><a href="recruit.html">Partners</a><a href="#">Partner Sign In</a><a href="recruit.html">Operators</a><a href="#">Operator Sign In</a><a href="recruit.html">Careers</a></div>
        </div>
        <p class="vl-menu__copy">© 0000 Company Name. One-line copyright.</p>
      </div>
      <div class="vl-menu__map" aria-hidden="true">
        <svg viewBox="0 0 600 160" preserveAspectRatio="xMidYMid slice"><g data-globe fill="none" stroke="currentColor" stroke-width=".6" opacity=".7"><circle cx="300" cy="80" r="150"/><ellipse cx="300" cy="80" rx="150" ry="55"/><ellipse cx="300" cy="80" rx="55" ry="150"/><path d="M150 80H450M300 -70V230"/></g><g fill="currentColor" opacity=".7">${Array.from({ length: 220 }, (_, i) => {
          const x = (i * 37) % 600, y = 20 + ((i * 53) % 120);
          return `<circle cx="${x}" cy="${y}" r="1.1"/>`;
        }).join("")}</g></svg>
      </div>
    </div>`;
  document.body.append(menu);

  const items = () => [...menu.querySelectorAll('[data-fx~="char-clip-slide"]')];
  const rules = menu.querySelectorAll("[data-menu-rule]");
  const menuPhoto = menu.querySelector(".vl-menu__photo");
  const menuFoot = menu.querySelectorAll(".vl-menu__foot-row > *, .vl-menu__copy");
  const globe = menu.querySelector("[data-globe]");
  // Original map cluster rotation: from −45.57° to −57.7° in the first 4.23s — a long rotation that eases out slightly, so use 20s power1.out up to −77.66°
  const globeTw = globe ? gsap.fromTo(globe, { rotation: -45.57, svgOrigin: "300 80" }, { rotation: -77.66, svgOrigin: "300 80", duration: 20, ease: "power1.out", paused: true }) : null;
  const rulesH = [...rules].filter((r) => !r.classList.contains("is-v"));
  const rulesV = [...rules].filter((r) => r.classList.contains("is-v"));
  const menuEase = "fx-menu";
  if (window.CustomEase && !CustomEase.get(menuEase)) CustomEase.create(menuEase, "0.78,0.01,0.23,0.99");
  gsap.set(menu, { yPercent: 100 });
  gsap.set(rulesH, { scaleX: 0 });
  gsap.set(rulesV, { scaleY: 0 });
  let menuTl = null;
  const openMenu = () => {
    menu.classList.add("is-open");
    menu.setAttribute("aria-hidden", "false");
    document.querySelectorAll("[data-menu-open]").forEach((b) => b.setAttribute("aria-expanded", "true"));
    window.lenis?.stop();
    if (globeTw) { globeTw.pause(0); gsap.delayedCall(.06, () => menu.classList.contains("is-open") && globeTw.restart()); }
    menuTl?.kill();
    menuTl = gsap.timeline()
      .to(menu, { yPercent: 0, duration: .8, delay: .03, ease: window.CustomEase ? menuEase : "power3.inOut" })
      .to(rulesH, { scaleX: 1, duration: .9, ease: "power2.out", stagger: .1 }, .03)
      .to(rulesV, { scaleY: 1, duration: .9, ease: "power2.out", stagger: .08 }, .03)
      // Original: the three bottom items (button · small link · copyright) come in one after another from 1.1s at .15s intervals, 1s ease-out, and the photo area goes from blur 8px → 0 over 5.95s cubic-bezier(.16,1,.3,1), starting 1.3s late
      .fromTo(menuFoot, { opacity: 0 }, { opacity: 1, duration: 1, ease: "power1.out", stagger: .15 }, 1.1)
      .fromTo(menuPhoto, { filter: "blur(8px)" }, { filter: "blur(0px)", duration: 5.95, ease: window.CustomEase ? (CustomEase.get("vl-0.16,1,0.3,1") || CustomEase.create("vl-0.16,1,0.3,1", "0.16,1,0.3,1")) : "expo.out" }, 1.3);
    items().forEach((el) => el.dispatchEvent(new CustomEvent("fx:play")));
  };
  const closeMenu = () => {
    if (!menu.classList.contains("is-open")) return;
    document.querySelectorAll("[data-menu-open]").forEach((b) => b.setAttribute("aria-expanded", "false"));
    menuTl?.kill();
    menuTl = gsap.timeline({ onComplete: () => { menu.classList.remove("is-open"); menu.setAttribute("aria-hidden", "true"); items().forEach((el) => el.dispatchEvent(new CustomEvent("fx:reset"))); gsap.set(rulesH, { scaleX: 0 }); gsap.set(rulesV, { scaleY: 0 }); } })
      .to(menu, { yPercent: 100, duration: .8, delay: .2, ease: window.CustomEase ? menuEase : "power3.inOut" });
    window.lenis?.start();
  };

  // ── Search drawer
  const scrim = document.createElement("div");
  scrim.className = "vl-sheet-scrim";
  const sheet = document.createElement("div");
  sheet.className = "vl-sheet";
  sheet.setAttribute("data-slot", "search-sheet");
  sheet.setAttribute("aria-hidden", "true");
  sheet.innerHTML = `
    <div class="vl-sheet__bar"><button type="button" aria-label="Back" data-sheet-close>${ICON.back}</button><button type="button" aria-label="Close" data-sheet-close>${ICON.close}</button></div>
    <div class="vl-sheet__in">
      <h2 class="vl-sheet__title" data-label="Drawer title in English">New Trip</h2>
      <div class="vl-sheet__grid">
        <div class="vl-sheet__head"><h3>1. Your Route</h3><p>Your two-line guide here for choosing departure, destination, date and number of people.</p></div>
        <div class="vl-steps-dots"><span class="is-on">1</span><span>2</span><span>3</span></div>
        <div class="vl-sheet__sum">Summary</div>
        <div class="vl-rows">
          <div class="vl-row">${ICON.plane.replace("<svg", '<svg width="18" height="18"')}<div><small>From</small><b>Choose departure point</b></div></div>
          <div class="vl-row">${ICON.land.replace("<svg", '<svg width="18" height="18"')}<div><small>To</small><b>Choose a destination</b></div></div>
          <div class="vl-row">${ICON.cal.replace("<svg", '<svg width="18" height="18"')}<div><small>Date</small><b>Date and time</b></div></div>
          <div class="vl-row">${ICON.pax.replace("<svg", '<svg width="18" height="18"')}<div><small>Passengers</small><b>4</b></div></div>
          <form class="vl-form" style="padding:1.5rem 1rem 1.5rem 0" onsubmit="return false">
            <label>Your request field here<textarea rows="2" placeholder="Your requests here, such as luggage or pets"></textarea></label>
          </form>
        </div>
      </div>
    </div>
    <div class="vl-sheet__next"><button class="vl-pill is-paper is-solid" type="button"><span>Next</span><span>Next</span></button></div>`;
  document.body.append(scrim, sheet);
  const openSheet = () => { closeAgent(); sheet.classList.add("is-open"); scrim.classList.add("is-open"); sheet.setAttribute("aria-hidden", "false"); window.lenis?.stop(); };
  const closeSheet = () => { sheet.classList.remove("is-open"); scrim.classList.remove("is-open"); sheet.setAttribute("aria-hidden", "true"); if (!menu.classList.contains("is-open")) window.lenis?.start(); };

  // ── Ask Pill · Chat Panel
  const ask = document.createElement("button");
  ask.className = "vl-ask";
  ask.type = "button";
  ask.setAttribute("data-agent-open", "");
  ask.innerHTML = `<span class="vl-agent-mark">${ICON.mark}</span><span><b>Ask ${brand("1em")}</b><small>Your one-line guide here</small></span>`;
  const agent = document.createElement("section");
  agent.className = "vl-agent";
  agent.setAttribute("data-slot", "agent-panel");
  agent.setAttribute("aria-hidden", "true");
  agent.innerHTML = `
    <header class="vl-agent__head"><span class="vl-agent-mark">${ICON.mark}</span><div class="t"><b>${brand("1em")}</b><small>Your line here: search fills in as it listens</small></div>
      <button class="vl-agent__ib" type="button" aria-label="By search" data-sheet-open>${ICON.search.replace("<svg", '<svg width="16" height="16"')}</button>
      <button class="vl-agent__ib" type="button" aria-label="Close" data-agent-close>${ICON.close}</button></header>
    <div class="vl-agent__body">
      <div class="vl-agent__msg"><div class="vl-agent__who"><b>${brand("1em")}</b> · Support helper</div><p>Two or three lines of greeting the helper offers first. It asks where you are going, with whom and when.</p></div>
      <div class="vl-chips"><button class="vl-chip" type="button">Your sample question 1 here</button><button class="vl-chip" type="button">Your sample question 2 here</button><button class="vl-chip" type="button">Your sample question 3 here</button><button class="vl-chip" type="button">Your sample question 4 here</button></div>
    </div>
    <div class="vl-agent__foot"><form class="vl-composer" onsubmit="return false"><input type="text" placeholder="Write your question here" aria-label="Question"><button type="button" aria-label="Ask by voice">${ICON.mic}</button><button class="is-send" type="submit" aria-label="Send">${ICON.send}</button></form></div>`;
  document.body.append(ask, agent);
  const halo = agent.querySelector(".vl-agent__head circle");
  let haloTw = null;
  function openAgent() {
    agent.classList.add("is-open"); agent.setAttribute("aria-hidden", "false"); ask.classList.add("is-hidden");
    // Original: the ring of the panel header mark slowly settles from 3.4x to 1.08x after .34s
    if (halo && !matchMedia("(prefers-reduced-motion: reduce)").matches) { haloTw?.kill(); haloTw = gsap.fromTo(halo, { scale: 3.4 }, { scale: 1.08, duration: 1.8, delay: .34, ease: "power2.out", repeat: -1, repeatDelay: 2.45 }); }
  }
  function closeAgent() { haloTw?.kill(); agent.classList.remove("is-open"); agent.setAttribute("aria-hidden", "true"); ask.classList.remove("is-hidden"); }

  // ── Phone bottom bar
  const bar = document.createElement("div");
  bar.className = "vl-bar";
  bar.setAttribute("data-slot", "mobile-bar");
  bar.innerHTML = `<button class="vl-bar__search" type="button" data-sheet-open>${ICON.search.replace("<svg", '<svg width="16" height="16"')}Search</button><button class="vl-bar__ask" type="button" data-agent-open><span class="vl-agent-mark">${ICON.mark}</span>Ask ${brand("1em")}</button>`;
  document.body.append(bar);

  // ── Footer
  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.className = "vl-foot";
    foot.innerHTML = `
      <div class="vl-foot__top">
        <div class="vl-foot__brand">${brand()}<span>Introduce your company in one line here</span></div>
        <div class="vl-foot__cols">
          <div><h4>Navigation</h4><nav>${LINKS.map(([href, label, , mark]) => `<a href="${href}">${mark ? brand("1em").replace("wordmark", "wordOS") : label}</a>`).join("")}</nav></div>
          <div class="vl-foot__contact"><h4>Contact</h4><a href="#">hello@example.com</a><a href="#">+00 (000) 000-0000</a><p>Your one-line office address here</p><p>Your business number here</p></div>
        </div>
      </div>
      <div class="vl-foot__bottom">
        <ul><li>© 0000 Company Name</li><li><a href="#">Partners</a></li><li><a href="#">Partner Sign In</a></li><li><a href="#">Operators</a></li><li><a href="#">Operator Sign In</a></li><li><a href="#">Sign In</a></li><li><a href="#">Privacy</a></li><li><a href="#">Terms</a></li><li><a href="recruit.html">Careers</a></li></ul>
        <p class="vl-foot__legal">Your legal notice here, two lines, stating what the company is and is not. Include the sentence that operations are handled by a licensed operator.</p>
        <div class="vl-foot__badge"><i></i><span>Powered by Studio Name</span></div>
      </div>`;
  }

  // ── Grain · Transition Curtain
  const grain = document.createElement("div");
  grain.className = "vl-grain";
  grain.setAttribute("aria-hidden", "true");
  const veil = document.createElement("div");
  veil.setAttribute("data-fx", "layer-rise-page");
  veil.setAttribute("data-fx-layer-rise-page", "mark: from-internal-nav");
  veil.setAttribute("data-slot", "page-transition");
  const blur = document.createElement("div");
  blur.setAttribute("data-fx", "velocity-edge-blur");
  blur.setAttribute("data-slot", "speed-blur");
  document.body.append(grain, veil, blur);

  // ── Header cell dropdown — original: backdrop under the header (.35s) and panel under the cell (transparent 0→1 .35s · from −6px with .05s delay, cubic-bezier(.25,.1,.25,1))
  const dropVeil = document.createElement("div");
  dropVeil.className = "vl-drop-veil";
  const drop = document.createElement("div");
  drop.className = "vl-drop";
  drop.setAttribute("data-slot", "field-dropdown");
  document.body.append(dropVeil, drop);
  const DROP = {
    from: `<label class="vl-drop__q">${ICON.search.replace("<svg", '<svg width="14" height="14"')}<input type="text" placeholder="Find your departure airport or city here."></label><ul>${[1, 2, 3, 4, 5].map((n) => `<li><b>City Name ${n}</b><span>Airport Name (AA${n})</span></li>`).join("")}</ul>`,
    to: `<label class="vl-drop__q">${ICON.search.replace("<svg", '<svg width="14" height="14"')}<input type="text" placeholder="Find your arrival airport or city here"></label><ul>${[1, 2, 3, 4, 5].map((n) => `<li><b>City Name ${n}</b><span>Airport Name (BB${n})</span></li>`).join("")}</ul>`,
    date: `<div class="vl-drop__cal"><p>Month 0000</p><div>${Array.from({ length: 35 }, (_, i) => `<span${i === 17 ? ' class="is-on"' : ""}>${(i % 31) + 1}</span>`).join("")}</div></div>`,
  };
  let dropFor = null;
  const openDrop = (field) => {
    const key = field.dataset.drop;
    if (dropFor === field) { closeDrop(); return; }
    dropFor = field;
    const r = field.getBoundingClientRect();
    const w = Math.min(Math.max(r.width, innerWidth >= 768 && innerWidth < 1280 ? (key === "date" ? 380 : 520) : (key === "date" ? 320 : r.width)), innerWidth - r.left - 16);
    drop.innerHTML = DROP[key];
    Object.assign(drop.style, { left: `${r.left}px`, top: `${r.bottom}px`, width: `${w}px` });
    dropVeil.style.top = `${r.bottom}px`;
    drop.classList.add("is-open");
    dropVeil.classList.add("is-open");
  };
  function closeDrop() { dropFor = null; drop.classList.remove("is-open"); dropVeil.classList.remove("is-open"); }
  dropVeil.addEventListener("click", closeDrop);

  // ── Handle
  document.addEventListener("click", (e) => {
    const f = e.target.closest("[data-drop]");
    if (f) { openDrop(f); return; }
    const t = e.target.closest("[data-menu-open],[data-menu-close],[data-sheet-open],[data-sheet-close],[data-agent-open],[data-agent-close],[data-pax]");
    if (!t) { if (e.target === scrim) closeSheet(); return; }
    if (t.matches("[data-menu-open]")) openMenu();
    else if (t.matches("[data-menu-close]")) closeMenu();
    else if (t.matches("[data-sheet-open]")) { closeMenu(); closeDrop(); openSheet(); }
    else if (t.matches("[data-sheet-close]")) closeSheet();
    else if (t.matches("[data-agent-open]")) { closeMenu(); openAgent(); }
    else if (t.matches("[data-agent-close]")) closeAgent();
    else if (t.matches("[data-pax]")) {
      const n = document.querySelector("[data-pax-n]");
      const v = Math.max(1, Math.min(19, +n.textContent + +t.dataset.pax));
      n.textContent = v;
      n.classList.add("is-set");
    }
  });
  addEventListener("keydown", (e) => { if (e.key === "Escape") { closeMenu(); closeSheet(); closeAgent(); closeDrop(); } });


  // ── Testimonial switch (first page · About) — each quote line staggers by .06s, .8s [.16,1,.3,1], the name comes .4s later with a .5s fade
  if (document.querySelector("[data-q-text]")) {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const EXPO = window.CustomEase ? (CustomEase.get("vl-0.16,1,0.3,1") || CustomEase.create("vl-0.16,1,0.3,1", "0.16,1,0.3,1")) : "expo.out";
  const QUOTES = 4;
    let qi = 0;
    const qn = document.querySelector("[data-q-n]"), qt = document.querySelector("[data-q-text]"), qw = document.querySelector("[data-q-who]");
    const TEXT = ["Your guest review goes here, about three lines. Saying they will entrust the next trip to you too.", "Your two-line second review here. Words about being kind.", "Your third review here in about four lines. Mention that schedule changes were handled right away, and add thanks.", "Your fourth review in one line here."];
    const showQuote = () => {
      qn.textContent = `${String(qi + 1).padStart(2, "0")}/${String(QUOTES).padStart(2, "0")}`;
      qt.textContent = TEXT[qi];
      if (reduce) return;
      const sp = SplitText.create(qt, { type: "lines", mask: "lines" });
      gsap.from(sp.lines, { yPercent: 110, duration: .8, ease: EXPO, stagger: .06, onComplete: () => sp.revert() });
      gsap.fromTo(qw, { opacity: 0 }, { opacity: 1, duration: .5, delay: .4 });
    };
    document.querySelectorAll("[data-q]").forEach((btn) => btn.addEventListener("click", () => { qi = (qi + +btn.dataset.q + QUOTES) % QUOTES; showQuote(); }));

  }

  // ── Smooth scroll (original Lenis 1.3.20 · lerp .1 · duration 1.2 · touchMultiplier 2)
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const lenis = new Lenis({ lerp: .1, duration: 1.2, smoothWheel: true, touchMultiplier: 2 });
    window.lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (t) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => { gsap.ticker.remove(tick); lenis.destroy(); window.lenis = null; };
  });

  // Line appears as it is drawn — original Line: once when visible, scaleX 0→1, 3.6s [.16,1,.3,1] delayed .1s
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    document.querySelectorAll("[data-draw]").forEach((el) => {
      gsap.fromTo(el, { scaleX: el.classList.contains("is-v") ? 1 : 0, scaleY: el.classList.contains("is-v") ? 0 : 1 },
        { scaleX: 1, scaleY: 1, duration: 3.6, delay: .1, ease: window.CustomEase ? CustomEase.create("fx-line", "0.16,1,0.3,1") : "expo.out", scrollTrigger: { trigger: el, start: "top bottom", once: true } });
    });
  });

  // ── Subscription card (first page, News) — once at 60% visible: card rises from 10% below at .92 scale → settles, inner photo 1.15 scale and transparent → 1, 1.2s, delayed .25s
  const newsCard = document.querySelector("[data-news-card]");
  const newsImg = document.querySelector("[data-news-img]");
  if (newsCard) mm.add("(prefers-reduced-motion: no-preference)", () => {
    const EX = window.CustomEase ? (CustomEase.get("vl-0.16,1,0.3,1") || CustomEase.create("vl-0.16,1,0.3,1", "0.16,1,0.3,1")) : "expo.out";
    gsap.set(newsCard, { yPercent: 10, scale: .92, opacity: 0 });
    if (newsImg) gsap.set(newsImg, { scale: 1.15, opacity: 0 });
    ScrollTrigger.create({ trigger: newsCard, start: "top 72%", once: true, onEnter: () => {
      gsap.to(newsCard, { yPercent: 0, scale: 1, opacity: 1, duration: 1.2, delay: .25, ease: EX });
      if (newsImg) gsap.to(newsImg, { scale: 1, opacity: 1, duration: 1.2, delay: .25, ease: EX });
    } });
  });
})();
