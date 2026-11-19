// Shared for Brand site — fits the top section tab row, right console panel, bottom pill menu and green den footer, and wires up Lenis 1.3.8 (lerp .1), text entrances, console printing per section, and page transitions.
// Curves are the original bundle’s power4.out · expo.out · cubic-bezier(.23,1,.32,1), stagger .04 · .15.
(() => {
  const root = document.documentElement;
  root.classList.add("et-js");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const page = document.body.dataset.page || "index";
  const LOGO = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M24 19.2V24H9.6v-4.8zM19.2 14.4h-13c-.8 0-1.4.6-1.4 1.4V24H0v-9.6h3.4c.8 0 1.4-.6 1.4-1.4V9.6h14.4zM4.8 4.8H0V0h4.8zm19.2 0H9.6V0H24z"/></svg>';
  const PLUS = '<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M7 1v12M1 7h12"/></svg>';
  const CHEV = '<svg viewBox="0 0 9 6" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><path d="M1 1l3.5 3.5L8 1"/></svg>';
  const ARROW = '<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M3 11 11 3M5 3h6v6"/></svg>';
  window.etArrowBtn = (label, href) => `<a class="et-btn et-btn--arrow" href="${href}"><span class="et-btn__icon"><span class="et-btn__a">${ARROW}</span><span class="et-btn__b">${ARROW}</span></span><span class="et-btn__label">${label}</span></a>`;
  window.etBtn = (label, href, ghost) => `<a class="et-btn${ghost ? " is-ghost" : ""}" href="${href}"><span class="et-btn__icon">${PLUS}</span><span class="et-btn__label">${label}</span></a>`;

  // Top section tab row — each section has a data-et-tab name
  const tabs = [...document.querySelectorAll("[data-et-tab]")];
  document.body.insertAdjacentHTML("afterbegin", `
    <div class="et-tabs" data-slot="section-tabs" aria-hidden="true"><ul><li class="is-on">${document.body.dataset.pageName || "Hero"}.page</li>${tabs.map((t) => `<li>${t.dataset.etTab}.section</li>`).join("")}</ul><span class="et-tabs__console">console.log</span></div>`);
  const tabItems = [...document.querySelectorAll(".et-tabs li")].slice(1);

  // Right console panel — on entering the section, that section’s lines print down one at a time
  const CODE = {
    first: ["<span class=\"c\">// ..██..███████....</span>", "", "<span class=\"k\">Hello</span>(You) {", "  As for this", "  company.site();", "  Output(<span class=\"w\">'Welcome in'</span>);", "}", "", "We. is [", "  Ethical_Hackers", "];"],
    issue: ["", "<span class=\"c\">// Problem</span>", "<span class=\"k\">Vulnerabilities</span>(Our) {", "  <span class=\"w\">Outer surface</span>;", "  <span class=\"w\">Gap</span>;", "  <span class=\"k\">If</span> (Attack.Real) {", "    <span class=\"w\">Risk.High</span>;", "  }", "  Falsehood;", "}"],
    agent: ["", "<span class=\"c\">// Solution</span>", "<span class=\"k\">During</span> (you.speak()) {", "  Threat", "    .faster();", "  Outer surface", "    .grow();", "}", "Proof.does();", "Fix (important_thing);"],
    steps: ["", "<span class=\"c\">// View · Test · Action</span>", "<span class=\"k\">View</span>() { Map.skin(); }", "<span class=\"k\">Exam</span>() { Proof.danger(); }", "<span class=\"k\">Action</span>() { Fix.gap(); }"],
    platform: ["", "<span class=\"c\">// Platform</span>", "<span class=\"k\">Class</span> Real time {", "  Water purification risk = 0;", "  All.test();", "  <span class=\"k\">If</span> (Found == 0) {", "    Board.evidence();", "  }", "}"],
    cases: ["", "<span class=\"c\">// Work</span>", "<span class=\"k\">Class</span> Case study {", "  Evidence = client.data();", "  <span class=\"k\">If</span> (evidence.real()) {", "    number.speak();", "  }", "}"],
    end: ["", "<span class=\"c\">// Start</span>", "Trial (30 days);", "expose.check();", "Proof.fix();", "", "<span class=\"c\">// 0000 ··</span>"],
  };
  document.body.insertAdjacentHTML("beforeend", `
    <aside class="et-panel" data-slot="console-panel" aria-hidden="true"><div class="et-panel__body"><div class="et-panel__track"></div></div><div class="et-panel__foot">Your place of making here · 0000</div></aside>`);
  const track = document.querySelector(".et-panel__track");
  let lineNo = 0;
  const typed = new Set();
  const typeBlock = (key) => {
    if (!track || typed.has(key) || !CODE[key]) return;
    typed.add(key);
    CODE[key].forEach((html, i) => {
      lineNo++;
      const row = document.createElement("div");
      row.className = "et-panel__line" + (reduce ? "" : " is-typing");
      row.innerHTML = `<span>${String(lineNo).padStart(3, "0")}</span><span>${html || " "}</span>`;
      track.append(row);
      if (!reduce && window.gsap) gsap.fromTo(row, { "--et-type": "0%" }, { "--et-type": "100%", duration: 0.25, delay: i * 0.06, ease: "steps(12)", onComplete: () => row.classList.remove("is-typing") });
    });
    const body = track.parentElement, over = track.scrollHeight - body.clientHeight + 24;
    track.style.transform = `translateY(${-Math.max(0, over)}px)`;
  };
  typeBlock("first");

  // Bottom pill menu + expanding panel
  const NAV = [["Platform", null, "platform"], ["Hacker", "index.html#agent", null], ["Usage", "works.html", "cases"], ["Price", "service.html", null], ["About", "about.html", null], ["Resource room", "works.html", null]];
  const DROPS = {
    platform: [["Exam as a Service", "service.html"], ["Surface care", "service.html"], ["Exposure check", "service.html"], ["Risk management", "service.html"], ["Regulation report", "service.html"], ["Platforms at a Glance", "service.html"]],
    cases: [["Manufacturing", "detail.html"], ["Communication", "detail.html"], ["Public · Infrastructure Facilities", "detail.html"], ["AI·SaaS", "detail.html"], ["Medical", "detail.html"], ["Distribution", "detail.html"], ["Aviation", "detail.html"], ["Finance", "detail.html"]],
  };
  const cur = { works: "Usage", detail: "Usage", about: "About", service: "Platform" }[page];
  document.body.insertAdjacentHTML("beforeend", `
    <nav class="et-menu" data-slot="pill-menu" aria-label="Main menu">
      <a class="et-menu__logo" href="index.html" aria-label="Hero">${LOGO}Logo</a>
      <div class="et-menu__links">${NAV.map(([l, h, d]) => d && !h ? `<button type="button" aria-expanded="false" data-drop="${d}"${l === cur ? ' class="is-current" aria-current="page"' : ""}>${l}${CHEV}</button>` : `<a href="${h}"${d ? ` data-drop="${d}" aria-expanded="false"` : ""}${l === cur ? ' class="is-current" aria-current="page"' : ""}>${l}${d ? CHEV : ""}</a>`).join("")}</div>
      <a class="et-menu__login" href="#contact">→ Log in</a>
      <button class="et-menu__burger" type="button" aria-label="Open Menu" data-drop="platform">${PLUS}</button>
      ${window.etBtn("Start", "#contact")}
    </nav>
    ${Object.entries(DROPS).map(([k, items]) => `<div class="et-drop" data-slot="menu-drop" data-drop-panel="${k}" data-h="${k === "cases" ? 600 : 451}">${items.map(([l, h]) => `<a href="${h}"><b>${l}</b><span>Your one-line description goes here.</span></a>`).join("")}<a class="et-drop__feature" href="${items[0][1]}"><span class="wf-img" data-label="Platform screen preview · dark dashboard · landscape"></span><span><b>Your at-a-glance view here</b><br>Your bundle intro in one line here</span></a></div>`).join("")}
    <div class="et-shade" aria-hidden="true"></div>
    <div class="et-veil" aria-hidden="true"></div>`);
  const drops = [...document.querySelectorAll(".et-drop")];
  // Original: hovering a menu word grows the panel from height 0 → 451 (600 for Use Cases) over .4s expo.out, and .1s later its width 264 → 528 over .69s expo.out (curve shape from re-measuring), while the items rise in turn from 10px below. Press and keyboard open the same panel too.
  const openDrop = (b) => {
    const panel = document.querySelector(`[data-drop-panel="${b.dataset.drop}"]`);
    if (!panel || panel.classList.contains("is-open")) return;
    closeDrops();
    panel.classList.add("is-open");
    document.querySelector(".et-shade")?.classList.add("is-on");
    b.setAttribute("aria-expanded", "true");
    if (window.gsap && !reduce) {
      gsap.fromTo(panel, { height: 0 }, { height: +(panel.dataset.h || 451) + 36, duration: 0.4, ease: "expo.out", overwrite: true });
      gsap.fromTo(panel, { width: 264 }, { width: 528, duration: 0.69, delay: 0.1, ease: "expo.out" });
      gsap.fromTo(panel.children, { y: 10 }, { y: 0, duration: 0.4, stagger: 0.025, ease: "power2.out", delay: 0.05, overwrite: "auto" });
      gsap.fromTo(panel.children, { opacity: 0 }, { opacity: 1, duration: 0.4, stagger: 0.075, ease: "expo.out", overwrite: "auto" });
    }
  };
  function closeDrops() { document.querySelector(".et-shade")?.classList.remove("is-on"); drops.forEach((d) => { d.classList.remove("is-open"); if (window.gsap) gsap.set(d, { clearProps: "height,width" }); }); document.querySelectorAll("[data-drop]").forEach((b) => b.setAttribute("aria-expanded", "false")); }
  const hoverable = matchMedia("(hover: hover)").matches;
  document.querySelectorAll(".et-menu__links [data-drop]").forEach((b) => b.addEventListener("pointerenter", () => { if (hoverable) openDrop(b); }));
  // Leaving the menu or panel closes it right away (original 29ms) — moving between the menu and the panel doesn’t close it
  const zone = [document.querySelector(".et-menu"), ...drops];
  zone.forEach((el) => el.addEventListener("pointerleave", (e) => {
    if (!hoverable) return;
    if (e.relatedTarget && zone.some((z) => z.contains(e.relatedTarget))) return;
    closeDrops();
  }));
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-drop]");
    if (b && b.tagName === "BUTTON") { openDrop(b); return; }
    if (!e.target.closest(".et-drop")) closeDrops();
  });
  addEventListener("keydown", (e) => { if (e.key === "Escape") closeDrops(); });

  // Green tunnel footer
  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.classList.add("et-foot");
    foot.id = "contact";
    foot.setAttribute("data-et-tab", foot.dataset.etTab || "Footer");
    foot.innerHTML = `
      <div data-fx="pixel-scan-gl" data-fx-pixel-scan-gl="look: tunnel"></div>
      <div class="et-foot__in">
        <div class="et-foot__mark">${LOGO}</div>
        <div class="et-foot__center">
          <h2 class="t-pixel" data-et-split="chars" data-label="Your two-line English title for the starting pixel here">Start with<br>one action</h2>
          <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center">${window.etBtn("Get started", "#contact")}${window.etBtn("Demo Booking", "#contact", true)}</div>
        </div>
        <div class="et-foot__base">
          <ul><li><a href="#">Terms of service</a></li><li><a href="#">Security Rules</a></li><li><a href="#">Sitemap</a></li><li><a href="#">Personal information</a></li></ul>
          <div class="et-foot__partners"><span>Sponsor 1</span><span>Sponsor 2</span><span>Sponsor 3</span></div>
          <span>Your place of making here</span>
        </div>
      </div>
      <div class="et-foot__social">${["L", "X", "G", "Y"].map((k) => `<a href="#" aria-label="Social ${k}"></a>`).join("")}</div>`;
  }

  if (!window.gsap) return;
  if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
  if (window.Lenis && !reduce) {
    const lenis = new Lenis({ lerp: 0.1 });
    window.etLenis = lenis;
    lenis.on("scroll", () => window.ScrollTrigger?.update());
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // If the section below the menu is light, change the menu hover type
  const menuEl = document.querySelector(".et-menu");
  const onLight = () => {
    if (document.body.hasAttribute("data-menu-light")) { menuEl.classList.add("on-light"); return; }
    const y = innerHeight - 30;
    menuEl.classList.toggle("on-light", [...document.querySelectorAll(".et-light, .et-mint")].some((d) => { const r = d.getBoundingClientRect(); return r.top <= y && r.bottom > y; }));
  };
  addEventListener("scroll", onLight, { passive: true });
  onLight();

  // Tab underline · console line follow the section
  tabs.forEach((sec, i) => {
    ScrollTrigger.create({
      trigger: sec, start: "top 45%", end: "bottom 45%",
      onToggle: (st) => { tabItems[i]?.classList.toggle("is-on", st.isActive); if (st.isActive) typeBlock(sec.dataset.etCode); },
    });
  });

  // Text splitting — words as chunks, or per character with chars
  const split = (el, chars) => {
    const walk = (node) => [...node.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((p) => {
          if (!p) return;
          if (/^\s+$/.test(p)) { frag.append(p); return; }
          const w = document.createElement("span"); w.className = "et-word";
          if (chars) [...p].forEach((c) => { const s = document.createElement("span"); s.className = "et-ch"; s.textContent = c; w.append(s); });
          else w.textContent = p;
          frag.append(w);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1 && n.tagName !== "BR") walk(n);
    });
    walk(el);
    el.classList.add("is-split");
    return [...el.querySelectorAll(chars ? ".et-ch" : ".et-word")];
  };
  const arrived = sessionStorage.getItem("et-nav") === "1";
  sessionStorage.removeItem("et-nav");
  if (arrived) document.querySelectorAll("[data-et-hero]").forEach((el) => { el.removeAttribute("data-et-split"); el.removeAttribute("data-et-fade"); el.removeAttribute("data-et-hero"); });
  if (arrived) root.classList.add("et-arrived");
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    document.querySelectorAll("[data-et-split]").forEach((el) => {
      const chars = el.dataset.etSplit === "chars";
      const parts = split(el, chars);
      const hero = el.hasAttribute("data-et-hero");
      const st = hero ? undefined : { trigger: el, start: "top 80%", once: true };
      if (chars) gsap.fromTo(parts, { opacity: 0 }, { opacity: 1, duration: 0.01, stagger: 0.04, ease: "steps(1)", scrollTrigger: st, delay: hero ? 0.3 : 0 });
      else gsap.fromTo(parts, { opacity: 0, yPercent: 60 }, { opacity: 1, yPercent: 0, duration: 1, stagger: 0.04, ease: "power4.out", scrollTrigger: st, delay: hero ? 0.2 : 0 });
    });
    document.querySelectorAll("[data-et-fade]").forEach((el) => {
      gsap.fromTo(el, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7, ease: "power2.out", delay: el.hasAttribute("data-et-hero") ? 0.5 : 0, scrollTrigger: el.hasAttribute("data-et-hero") ? undefined : { trigger: el, start: "top 85%", once: true } });
    });
    document.querySelectorAll("[data-et-stagger]").forEach((el) => {
      gsap.fromTo(el.children, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.15, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 80%", once: true } });
    });
    document.querySelectorAll("[data-et-count]").forEach((el) => {
      const raw = el.textContent, m = raw.match(/[\d.,]+/);
      if (!m) return;
      const target = parseFloat(m[0].replace(/,/g, "")), dec = (m[0].split(".")[1] || "").length, pre = raw.slice(0, m.index), post = raw.slice(m.index + m[0].length);
      const o = { v: 0 }, show = () => { el.textContent = pre + o.v.toFixed(dec) + post; };
      show();
      gsap.to(o, { v: target, duration: 1.5, ease: "expo.out", onUpdate: show, scrollTrigger: { trigger: el, start: "top 85%", once: true } });
    });
    return () => {};
  });

  // Page transition — measured, the original (Nuxt) leaves 50ms after receiving the next page data and arrives in about 233ms — the curtain covers at .05s and lifts at .42s in the next document (measures about 233ms). The incoming page does not replay its Hero entrance
  const veil = document.querySelector(".et-veil");
  if (!reduce) {
    if (arrived) gsap.fromTo(veil, { opacity: 1 }, { opacity: 0, duration: 0.42, ease: "power2.out" });
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank") return;
      const href = a.getAttribute("href");
      if (!href || href.startsWith("#") || /^(mailto:|tel:|https?:)/.test(href)) return;
      const url = new URL(a.href, location.href);
      if (url.pathname === location.pathname) return;
      e.preventDefault();
      closeDrops();
      root.classList.add("et-leaving");
      sessionStorage.setItem("et-nav", "1");
      gsap.to(veil, { opacity: 1, duration: 0.05, ease: "none", onComplete: () => { location.href = url.href; } });
    });
    addEventListener("pageshow", (e) => { if (e.persisted) { root.classList.remove("et-leaving"); gsap.set(veil, { opacity: 0 }); } });
  }
})();
