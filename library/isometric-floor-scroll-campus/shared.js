// Frame and motion shared by all pages. The values are read from the reference site’s theme.css and bundle.js.
(() => {
  const doc = document.documentElement;
  doc.classList.add("js");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const page = document.body.dataset.page || "home";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  gsap.registerPlugin(ScrollTrigger);

  // The original bundle’s smooth scroll is Lenis 1.3.15 — it follows not by lerp but along a .6s expo curve
  const lenis = reduce ? null : new Lenis({ autoRaf: false, anchors: true, duration: 0.6, easing: (e) => Math.min(1, 1.001 - Math.pow(2, -10 * e)), smoothWheel: true });
  if (lenis) {
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // Original c-arrow: a ring of two overlapping tilted ellipses — on hover the two spread 4.5px apart and fill gray, and the overlapping part gets darker. The overlap is a sheet clipped by each other’s shape
  let rid = 0;
  const ring = () => {
    const n = ++rid;
    // Draws a tilted ellipse as an arc without transform — so the rotation doesn’t get overridden and come undone when it’s shifted sideways with CSS
    const e = (cls, cx) => { const dx = 11.2 * Math.cos(Math.PI / 6), dy = 11.2 * Math.sin(Math.PI / 6), a = `A11.2 19.6 30 1 1`; return `<path class="${cls}" d="M${(cx + dx).toFixed(2)} ${(21.4 + dy).toFixed(2)}${a} ${(cx - dx).toFixed(2)} ${(21.4 - dy).toFixed(2)}${a} ${(cx + dx).toFixed(2)} ${(21.4 + dy).toFixed(2)}Z"/>`; };
    // Like the original, the shape sits once in defs and the outline · clip plates follow the same shape via use
    const u = (cls, id) => `<use href="#${id}" class="${cls}"/>`;
    return `<span class="ring"><svg viewBox="0 0 41 42" aria-hidden="true"><defs>${e("", 18.3).replace("<path", `<path id="ring-sa${n}"`)}${e("", 22.6).replace("<path", `<path id="ring-sb${n}"`)}<clipPath id="ring-l${n}">${u("ring__l", `ring-sa${n}`)}</clipPath><clipPath id="ring-r${n}">${u("ring__r", `ring-sb${n}`)}</clipPath></defs>${u("ring__o ring__l", `ring-sa${n}`)}${u("ring__o ring__r", `ring-sb${n}`)}<g clip-path="url(#ring-l${n})"><rect class="ring__x" width="100%" height="100%" clip-path="url(#ring-r${n})"/></g><path class="ring__a" d="M15.1 26.3 23.6 17.8H18.4V16.6h7.2v7.2h-1.2v-5.2L15.9 27.1Z"/></svg></span>`;
  };

  const NAV = [
    { href: "index.html", label: "Home", key: "home" },
    { href: "about.html", label: "Campus About", key: "about" },
    { href: "event.html", label: "Event", key: "event" },
    { href: "news.html", label: "News", key: "news" },
    { href: "about.html#info", label: "For companies · general public" },
    { href: "about.html#info", label: "For examinees and guardians" },
  ];
  const cur = { article: "news" }[page] || page;

  function buildChrome() {
    const hd = $('[data-slot="header"]');
    if (hd) {
      hd.className = "hd";
      hd.innerHTML = `<div class="hd__inner">
        <a class="hd__title" href="index.html"><span class="en">School Campus Name</span><span class="ja">University name · Campus name here</span></a>
        <nav aria-label="Main menu"><ul class="gmenu">${NAV.map((n) => `<li><a href="${n.href}"${n.key === cur ? ' aria-current="page"' : ""}>${n.label}</a></li>`).join("")}</ul></nav>
        <button class="hd__toggle" type="button" aria-expanded="false" aria-label="Open Menu"><i></i></button>
      </div>`;
      const sp = document.createElement("nav");
      sp.className = "spmenu";
      sp.setAttribute("aria-label", "Phone menu");
      sp.innerHTML = `<ul>${NAV.map((n) => `<li><a href="${n.href}"><span>${n.label}</span>${ring()}</a></li>`).join("")}</ul>`;
      hd.after(sp);
    }
    const ft = $('[data-slot="footer"]');
    if (ft) {
      ft.className = "ft";
      ft.innerHTML = `<div class="ft__bg"><div class="wf-img" data-label="Campus building front with black tile exterior · daytime under a clear sky · tall vertical photo (2880:3578), top 2/3 sky, bottom 1/3 building and street trees"></div></div>
        <div class="ft__body">
          <div class="ft__row">
            <div><p class="ft__title"><span class="en" style="display:block">School Campus Name</span><span class="ja">University name · Campus name here</span></p>
              <ul class="ft__addr"><li>Postal code 000-0000 One line for the campus address here</li><li>Your first station, 0 minutes on foot here</li><li>Your second station here, 0 min on foot</li></ul></div>
            <nav class="ft__menu" aria-label="Footer Menu">${NAV.slice(1).map((n) => `<a href="${n.href}"><span>${n.label}</span><span>→</span></a>`).join("")}</nav>
          </div>
          <nav class="ft__sub" aria-label="Related Sites"><a href="#">Your university main campus site here</a><a href="#">Campus facilities guide</a><a href="#">Your adult learner program site here</a><a href="#">Privacy policy</a></nav>
          <a class="bt" href="#top" data-top><svg viewBox="0 0 14 20" fill="none" stroke="currentColor" stroke-width="1"><path d="M7 19V1M1 7l6-6 6 6"/></svg>Back to Top</a>
        </div>`;
    }
  }

  // White zigzag mountain pattern behind the subpage header (stands in for the original single_bg.svg)
  function zig() {
    $$("[data-zig]").forEach((el) => {
      el.insertAdjacentHTML("afterbegin", '<svg class="zig" viewBox="0 0 1440 520" preserveAspectRatio="none" aria-hidden="true"><polygon class="is-2" points="0,120 210,40 420,170 640,60 900,210 1180,90 1440,200 1440,330 0,330"/><polygon points="0,160 300,90 520,240 760,110 1040,300 1260,150 1440,250 1440,520 0,520"/></svg>');
    });
  }

  function decorate(root = document) {
    $$("[data-ring]", root).forEach((el) => { el.insertAdjacentHTML("beforeend", ring()); el.removeAttribute("data-ring"); });
  }

  function initChrome() {
    const btn = $(".hd__toggle");
    btn?.addEventListener("click", () => {
      const open = document.body.classList.toggle("is-menu-open");
      btn.setAttribute("aria-expanded", String(open));
      btn.setAttribute("aria-label", open ? "Close Menu" : "Open Menu");
      open ? lenis?.stop() : lenis?.start();
    });
    $$("[data-top]").forEach((a) => a.addEventListener("click", (e) => {
      e.preventDefault();
      lenis ? lenis.scrollTo(0, { duration: 1.6 }) : scrollTo(0, 0);
    }));
    // Footer: in the last screen the dark veil goes up to pow(t,1.5)×.8
    const ft = $(".ft");
    if (ft) {
      ScrollTrigger.create({
        trigger: ft, start: "bottom bottom+=" + innerHeight, end: "bottom bottom",
        onUpdate: (s) => ft.style.setProperty("--overlay", (Math.pow(Math.max(0, (s.progress - 0.5) * 2), 1.5) * 0.8).toFixed(3)),
      });
      if (reduce) ft.style.setProperty("--overlay", 0.8);
    }
  }

  // Lower head: original inkanim (blurFrom 15 · translateY .2em · 400ms easeOutQuad · step 40ms)
  function initHeadInk() {
    const head = $(".pgh__title");
    if (!head) return;
    const chars = [];
    $$("h1, p", head).forEach((el) => {
      const words = el.textContent.trim().split(/(\s+)/);
      el.textContent = "";
      words.forEach((w) => {
        if (/^\s+$/.test(w)) return el.append(" ");
        const word = document.createElement("span");
        word.style.cssText = "display:inline-block;white-space:nowrap";
        for (const ch of w) { const s = document.createElement("span"); s.className = "ink"; s.textContent = ch; word.append(s); chars.push(s); }
        el.append(word);
      });
    });
    if (reduce) { head.style.opacity = 1; return; }
    // Blur only after the font has fully loaded and glyph shapes are settled — blurring in a fallback font then swapping causes a jolt
    gsap.set(chars, { filter: "blur(15px)", opacity: 0, y: "0.2em" });
    head.style.opacity = 1;
    document.fonts.ready.then(() => gsap.to(chars, { filter: "blur(0px)", opacity: 1, y: 0, duration: 0.4, ease: "power1.out", stagger: 0.04, clearProps: "filter" }));
  }


  // Event card and news row placeholders — length matched to the original character count
  const EV = [
    { n: "Open today!", lg: 1, r: "43", d: "0000.10.27 Tue", t: "【Held Tue 10/27】 Your forum name here 0000", p: ["Place ○ Campus 7F"], o: "Hosted by ○ Your university name here", l: "Forum poster · yellow-to-blue gradient text and faces of three speakers · landscape 4:3", rsv: 1 },
    { n: "In progress!", lg: 1, d: "0000.10.23 Fri - 0000.10.27 Tue", t: "【Seminar Exhibition】 Opening ”Exhibition name here” 【Opens 10/23】", p: ["Place ○ Campus 2F"], o: "Hosted by ○ Your faculty name here", l: "Exhibition poster · large serif English title on white · landscape 16:9" },
    { n: "In progress!", d: "0000.9.19 Sat - 0000.11.21 Sat", t: "”Stop, look back, and then move forward” vol.0 Author name here", p: ["Place ○ Campus 2F"], o: "Organizer ○ Gallery Name", l: "Author speaking on a dark stage · video light · landscape 16:9" },
    { d: "0000.11.14 Sat - 0000.12.3 Thu", t: "Soft co-creation ── it connects, sparks, and shifts", p: ["Place ○ Campus 2F"], o: "Hosted by ○ Your department name here", l: "Exhibition poster · pink, sky and green vertical bands with extending lines · landscape 16:9" },
    { d: "0000.11.14 Sat - 0000.11.15 Sun", t: "Held: “Your event name here 0000 ~Unlocking learning~”", p: ["Place ○ Campus 5F", "Campus B2F"], o: "Hosted by ○ Your center name here", l: "Event poster · cream background with orange and pink brush curves and a vertical title · landscape 16:9", rsv: 1 },
    { d: "0000.11.18 Wed", t: "【Joint Event】 How to collaborate properly with freelancers in the creative industry? ~The boundaries of contracts~", p: ["Place ○ Campus 7F"], o: "Host ○ Venue name", l: "Event banner · hand-drawn people illustration and a large date · landscape 16:9", rsv: 1 },
    { d: "0000.11.30 Mon", t: "Between “awareness” and “design” ── Designing the irrationality of business", p: ["Place ○ Campus 7F"], o: "Host ○ Venue name", l: "Talk banner · orange speech-bubble title and circular speaker face · landscape 16:9", rsv: 1 },
  ];
  function fillEvents(root = document) {
    $$("[data-ev]", root).forEach((box) => {
      const n = +box.dataset.ev || EV.length;
      box.innerHTML = Array.from({ length: n }, (_, i) => EV[i % EV.length]).map((e) => `<article class="ev${e.lg ? " is-lg" : ""}${e.r === "43" ? " is-43" : ""}">
        <a class="ev__link" href="article.html">${e.n ? `<span class="ev__notify">${e.n}</span>` : ""}
          <div class="ev__pic"><div class="wf-img" data-label="${e.l}"></div></div>
          <div class="ev__meta">${e.rsv ? '<span class="lbl is-black">Booking needed</span>' : ""}<span class="lbl date">${e.d}</span></div>
          <p class="ev__title">${e.t}</p>
          <div class="ev__place">${e.p.map((x) => `<span class="lbl">${x}</span>`).join("")}<span class="lbl">${e.o}</span></div>
        </a></article>`).join("");
    });
  }
  const TP = [
    ["Event", "9/15/0000 (Tue)", "【Held Tue 10/27】 Your forum name here 0000"],
    ["Notice", "9/15/0000 (Tue)", "[Until 11/6 (Fri)] Now enrolling for the certificate program for working adults"],
    ["Event", "Tue, September 8, 0000", "Online info session for a certificate program for working adults"],
    ["Notice", "4/17/0000 (Fri)", "Program information for working adults was refreshed for 0000."],
    ["Notice", "Mon, March 2, 0000", "We have launched a new campus website"],
  ];
  function fillTopics(root = document) {
    $$("[data-tp]", root).forEach((box) => {
      const n = +box.dataset.tp || 4;
      box.innerHTML = Array.from({ length: n }, (_, i) => TP[i % TP.length]).map(([c, d, t]) => `<div class="tp__wrap"><span class="lbl">${c}</span><a class="tp__item" href="article.html"><span class="date">${d}</span><span class="bar"></span><p>${t}</p>${ring()}</a></div>`).join("");
    });
  }

  window.MAUW = { ring, decorate, lenis, reduce, $, $$ };

  fillEvents();
  fillTopics();
  buildChrome();
  zig();
  decorate();
  initChrome();
  initHeadInk();
  document.fonts.ready.then(() => ScrollTrigger.refresh());
})();
