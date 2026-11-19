// Common to all pages: draws the header bar, dropdown, phone menu, side vertical links, record photo cards, link panel and footer in one place, and hooks up photo fade slides, parallax and line drawing.
// Original values: photo swiper 6 fade speed 2000 · autoplay 1500 · loop · touchRatio 1.5, phone menu slides in at .5s cubic-bezier(.68,.31,.28,1) and items start from 7vw after .25 + .075×i.
(() => {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const page = document.body.dataset.page || "home";
  const OK = (window.OK = { reduced });

  const ext = '<svg class="ok-ext" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1" aria-hidden="true"><path d="M3.5 1.5H8.5V6.5M8.5 1.5 3.5 6.5M6.5 8.5h-5v-5"/></svg>';
  const fb = '<svg viewBox="0 0 29 29" fill="none" stroke="currentColor" aria-hidden="true"><circle cx="14.5" cy="14.5" r="14"/><path d="M15.6 21v-6h2l.3-2.3h-2.3v-1.4c0-.7.2-1.1 1.1-1.1h1.2V8.1a16 16 0 0 0-1.8-.1c-1.8 0-3 1.1-3 3.1v1.6h-2V15h2v6z" fill="currentColor" stroke="none"/></svg>';
  const tw = '<svg viewBox="0 0 29 29" fill="none" stroke="currentColor" aria-hidden="true"><circle cx="14.5" cy="14.5" r="14"/><path d="M20.5 10.6a5 5 0 0 1-1.4.4 2.4 2.4 0 0 0 1-1.4 5 5 0 0 1-1.5.6 2.4 2.4 0 0 0-4.2 2.2 6.9 6.9 0 0 1-5-2.5 2.4 2.4 0 0 0 .7 3.2 2.4 2.4 0 0 1-1.1-.3 2.4 2.4 0 0 0 1.9 2.4 2.4 2.4 0 0 1-1.1 0 2.4 2.4 0 0 0 2.3 1.7 4.9 4.9 0 0 1-3.6 1 6.9 6.9 0 0 0 10.6-6.1 5 5 0 0 0 1.2-1.2z" fill="currentColor" stroke="none"/></svg>';
  // Slots for the two sponsor organization marks of the original — placeholders newly drawn with our shapes
  const markA = '<svg viewBox="0 0 79 49" fill="none" stroke="currentColor" aria-hidden="true"><circle cx="39.5" cy="18" r="15"/><path d="M27 24l7-8 5 5 4-4 9 7"/><path d="M10 44h59" /><path d="M16 40h47" stroke-width=".6"/></svg>';
  const markB = '<svg viewBox="0 0 59 61" fill="currentColor" aria-hidden="true"><path d="M21 4h6v6h-6zM33 4h6v6h-6zM27 10h6v6h-6zM15 10h6v6h-6zM39 10h6v6h-6zM21 16h6v6h-6zM33 16h6v6h-6zM27 22h6v6h-6z"/><rect x="8" y="44" width="43" height="2"/><rect x="14" y="52" width="31" height="1.2"/></svg>';


  const cur = (p) => (p === page ? " is-current" : "");
  const PERF = ["Your local performance 1 here", "Your local performance 2 here", "Your local performance 3 here", "Your regional show 4 here"];

  // ───────── Header row ─────────
  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.innerHTML = `
      <div class="ok-head__bar">
        <div><a class="ok-logo" href="index.html" data-label="Project English logo">PROJECT NAME</a><button class="ok-burger" type="button" aria-label="Open Menu"></button></div>
        <nav class="ok-nav" aria-label="Main menu">
          <a class="ok-menu__logo" href="index.html">PROJECT NAME</a>
          <button class="ok-close" type="button" aria-label="Close Menu"></button>
          <ul>
            <li><button class="ok-nav__top${cur("service")}" type="button" data-href="service.html">PERFORMANCE</button>
              <div class="ok-drop"><div class="ok-drop__in">
                <a class="ok-drop__main${cur("service")}" href="service.html">PERFORMANCE TOP</a>
                <dl><div><dt>ARCHIVE</dt>${PERF.map((t) => `<dd><a href="service.html#archive">${t}</a></dd>`).join("")}</div></dl>
              </div></div></li>
            <li><button class="ok-nav__top${cur("event")}" type="button" data-href="event.html">EXHIBITION</button>
              <div class="ok-drop"><div class="ok-drop__in">
                <a class="ok-drop__main${cur("event")}" href="event.html">EXHIBITION TOP</a>
                <dl><div><dt>ARCHIVE</dt><dd><a href="event.html#archive">Your city exhibition here</a></dd></div></dl>
              </div></div></li>
            <li><a class="ok-nav__top" href="index.html#symposium">SYMPOSIUM</a></li>
            <li><a class="ok-nav__top" href="index.html#booklet">BOOKLET</a></li>
            <li><button class="ok-nav__top" type="button" data-href="service.html#archive">ARCHIVE</button>
              <div class="ok-drop is-plain"><div class="ok-drop__in">
                <dl>
                  <div><dt>PERFORMANCE</dt>${PERF.map((t) => `<dd><a href="service.html#archive">${t}</a></dd>`).join("")}</div>
                  <div><dt>EXHIBITION</dt><dd><a href="event.html#archive">Your city exhibition here</a></dd></div>
                  <div><dt>SYMPOSIUM</dt><dd><a href="index.html#symposium">Your event title 1 here</a></dd><dd><a href="index.html#symposium">Event title two here</a></dd></div>
                </dl>
              </div></div></li>
            <li><button class="ok-nav__top${cur("about")}" type="button" data-href="about.html">ABOUT US</button>
              <div class="ok-drop is-right"><div class="ok-drop__in">
                <a class="ok-drop__main${cur("about")}" href="about.html">ABOUT US</a>
                <a class="ok-drop__main" href="about.html#links">WHAT IS IT?</a>
              </div></div></li>
            <li><a class="ok-nav__top" href="mailto:hello@example.com">CONTACT${ext}</a></li>
          </ul>
          <div class="ok-menu__contact"><a href="mailto:hello@example.com">Inquiries about projects${ext}</a><p>One-line press contact address</p></div>
        </nav>
      </div>`;
    const nav = head.querySelector(".ok-nav");
    const lis = [...nav.querySelectorAll("li")];
    const phone = matchMedia("(max-width: 768px)");
    const open = () => {
      nav.classList.add("is-open");
      if (reduced) return gsap.set(lis, { x: 0, opacity: 1 });
      // framer spring (.8s) fills transparency slowly at first — measured, it starts showing .32s after the first item is pressed and is full at .27s
      gsap.fromTo(lis, { x: "7vw", opacity: 0 }, { x: 0, duration: 0.8, ease: "power3.out", delay: (i) => 0.25 + 0.075 * i, overwrite: true });
      gsap.to(lis, { opacity: 1, duration: 0.33, ease: "sine.inOut", delay: (i) => 0.31 + 0.075 * i });
    };
    // On close the whole panel slides out in .5s and the items are left as they are (the original also shows items while closing) — next open they re-enter from their starting positions
    const close = () => {
      nav.classList.remove("is-open");
      gsap.killTweensOf(lis);
    };
    head.querySelector(".ok-burger").addEventListener("click", open);
    head.querySelector(".ok-close").addEventListener("click", close);
    nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => phone.matches && close()));
    // Desktop dropdown — the original (framer) turns display on when entering and runs opacity 0→1 · y −10→0 in .3s easeIn, and on leaving runs the same curve and then turns display off
    nav.querySelectorAll("li").forEach((li) => {
      const drop = li.querySelector(".ok-drop");
      if (!drop) return;
      const show = () => { if (phone.matches) return; gsap.set(drop, { display: "block", pointerEvents: "auto" }); gsap.to(drop, { opacity: 1, y: 0, duration: reduced ? 0 : 0.3, ease: "power1.in", overwrite: true }); };
      const hide = () => { if (phone.matches) return; gsap.set(drop, { pointerEvents: "none" }); gsap.to(drop, { opacity: 0, y: -10, duration: reduced ? 0 : 0.3, ease: "power1.in", overwrite: true, onComplete: () => gsap.delayedCall(0.03, () => drop.style.opacity === "0" && gsap.set(drop, { display: "none" })) }); };
      li.addEventListener("pointerenter", show);
      li.addEventListener("pointerleave", hide);
      li.addEventListener("focusin", show);
      li.addEventListener("focusout", (e) => !li.contains(e.relatedTarget) && hide());
    });
    // Phone menu submenu — in the original, tapping an item opens and closes height 0 ↔ auto in .3s easeOut (desktop uses a hover dropdown)
    nav.querySelectorAll("button.ok-nav__top").forEach((b) => b.addEventListener("click", () => {
      // On desktop, like the original, pressing goes to that section’s first page (the sub-list is a hover dropdown)
      if (!phone.matches) { if (b.dataset.href) location.href = b.dataset.href; return; }
      if (!nav.classList.contains("is-open")) return;
      const drop = b.nextElementSibling;
      const opened = b.classList.toggle("is-open");
      gsap.to(drop, { height: opened ? "auto" : 0, duration: reduced ? 0 : 0.3, ease: "power1.out", overwrite: true });
    }));
    phone.addEventListener("change", () => { nav.classList.remove("is-open"); gsap.set(lis, { clearProps: "transform,opacity" }); gsap.set(".ok-drop", { clearProps: "height,display,opacity,transform" }); });
  }

  // ───────── Side vertical links ─────────
  document.querySelectorAll("[data-side]").forEach((el) => {
    el.innerHTML = `<div class="ok-side__in"><a class="ok-side__what" href="about.html#links">what is BRAND?</a><div class="ok-side__sns"><div class="ok-side__label">SNS</div><div class="ok-side__icons"><a href="#" aria-label="SNS 1">${fb}</a><a href="#" aria-label="SNS 2">${tw}</a></div></div></div>`;
  });

  // ───────── Record photo card ─────────
  const slides = (label, n = 6) => Array.from({ length: n }, (_, i) => `<div class="swiper-slide"><div class="wf-img" data-label="${label[i % label.length]}"></div></div>`).join("");
  const PERF_PH = ["Performer full body on stage · night lighting · portrait 9:10", "Performer in profile with accompanist · warm lighting · portrait 9:10", "Stage seen from behind the seats · Dark forest · Portrait 9:10", "Hand holding a fan close-up · backlit · vertical 9:10", "Stage foreground and audience · dusk · portrait 9:10", "Curtain call · stage front · portrait 9:10"];
  const EXHI_PH = ["Exhibition room display case · spotlight in a dark interior · portrait 9:10", "One hanging garment, front view · bright wall · vertical 9:10", "Mask close-up in a display case · glass reflection · portrait 9:10", "Gallery corridor · Floor reflection · Portrait 9:10", "Tool display · diagonal from above · portrait 9:10", "Close-up of clothing pattern · gold thread texture · portrait 9:10", "Visitors seen from behind · low lighting · portrait 9:10"];
  const card = (o) => `
    <div class="ok-card${o.dim ? " is-dim" : ""}">
      <div class="ok-blur" data-fx="blur-focus-in" data-fx-blur-focus-in="dur: 0.7; ease: none; start: bottom 75%">
        ${o.dim
          ? `<div class="ok-card__photo"><p class="ok-card__note">※ Your one-line coming-soon notice here.</p><div class="swiper-container ok-bullets" data-swiper><div class="swiper-wrapper">${slides(o.ph, 7)}</div><div class="swiper-pagination"></div></div></div>`
          : `<div class="ok-more-area" data-fx="cursor-disc-pulse" data-fx-cursor-disc-pulse="band: 650"><a class="ok-card__photo" href="${o.href}"><div class="swiper-container ok-bullets" data-swiper><div class="swiper-wrapper">${slides(o.ph, o.n || 6)}</div><div class="swiper-pagination"></div></div></a></div>`}
      </div>
      <div class="ok-plate${o.short ? " is-short" : ""}">
        <p class="ok-plate__tag">ARCHIVED</p>
        <div class="ok-plate__name"><b>${o.name}</b>${o.unit ? `<i>${o.unit}</i>` : ""}${o.city ? `<span>${o.city}</span>` : ""}</div>
        <div class="ok-plate__text"><strong>${o.when}</strong><span>${o.what}</span></div>
      </div>
    </div>`;
  const SETS = {
    perf4: [
      [{ name: "Name", unit: "Round", city: "City Performance", when: "Sun, 00/00/0000 | Venue Name", what: "Introduce the performance in one line here and<br>Add one more line about where it was held.", href: "service.html", ph: PERF_PH, n: 6 },
       { name: "Name", unit: "Round", city: "City Performance", when: "0000.00.00 (Thu) | One-line venue name", what: "Introduce the performance in one line here and<br>Add a line saying it was a one-day stage.", href: "service.html", ph: PERF_PH.slice(1).concat(PERF_PH[0]), n: 7 }],
      [{ name: "Name", unit: "Round", city: "City Performance", when: "Fri, 0/00/0000 | Venue Name", what: "A related performance name in one line here<br>Enter one line for the host organization name.", href: "service.html", ph: PERF_PH.slice(2).concat(PERF_PH.slice(0, 2)), n: 7 },
       { name: "Name", unit: "Round", city: "City Performance", when: "0/0/0000 (Tue) | Venue name", what: "One line on whose performance it was here<br>Mention that it was a stage first seen in decades.", href: "service.html", ph: PERF_PH.slice(3).concat(PERF_PH.slice(0, 3)), n: 7 }],
    ],
    exhi2: [
      [{ dim: true, short: true, name: "City", when: "Your gallery name here", what: "0000.00.00 – 0000.0.00", ph: EXHI_PH },
       { short: true, name: "City", when: "Your gallery name here", what: "0000.0.00 ～ 0.00", href: "event.html", ph: EXHI_PH.slice(1).concat(EXHI_PH[0]), n: 7 }],
    ],
  };
  document.querySelectorAll("[data-cards]").forEach((el) => {
    el.innerHTML = (SETS[el.dataset.cards] || []).map((row) => `<div class="ok-cards">${row.map(card).join("")}</div>`).join("");
  });

  // ───────── Link panel ─────────
  const linkBox = document.querySelector('[data-slot="links"]');
  if (linkBox) {
    const L = [
      ["service.html", "PERFORMANCE", "Your category name here", "Outdoor stage performance · dark forest · landscape 16:9"],
      ["event.html", "EXHIBITION", "Your category name here", "Close-up of a pattern on displayed clothing · dim lighting · landscape 16:9"],
      ["index.html#symposium", "SYMPOSIUM", "Your category name here", "Lecture stage and audience · green lighting · landscape 16:9", true],
      ["index.html#booklet", "BOOKLET", "Your category name here", "Booklet cover close-up · gray background · landscape 16:9"],
    ];
    linkBox.innerHTML = `<div class="ok-links__grid">${L.map(([h, t, s, ph, bright]) => `
      <a class="ok-link${bright ? " is-bright" : ""}" href="${h}"><div class="wf-img" data-label="${ph}"></div><div class="ok-link__body"><h2 class="ok-latin">${t}</h2><p class="ok-blur" data-fx="blur-focus-in" data-fx-blur-focus-in="dur: 0.7; ease: none; start: bottom 75%">${s}</p></div><i class="ok-arrow"></i></a>`).join("")}
      <a class="ok-link is-wide" href="about.html#links"><div class="ok-link__clip"><div class="wf-img" data-label="Dancing figure in an old painting · faded colors · landscape 16:10"></div></div><div class="ok-link__body"><h2 class="ok-latin">WHAT IS IT?</h2><p>Your short query here</p><i class="ok-arrow"></i></div></a>
    </div>`;
  }

  // ───────── Footer ─────────
  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.innerHTML = `<div class="ok-foot">
      <div class="ok-foot__l"><a class="ok-logo ok-foot__logo" href="index.html">PROJECT NAME</a><p class="ok-foot__contact">Inquiries about projects:<a href="mailto:hello@example.com">From here<svg viewBox="0 0 11 11" fill="none" stroke="currentColor" aria-hidden="true"><path d="M4 1.5h5.5V7M9.5 1.5 4 7M7 9.5H1.5V4"/></svg></a></p></div>
      <div class="ok-foot__r"><div class="ok-foot__marks"><a class="ok-mark is-a" href="#" aria-label="Sponsor 1 logo spot">${markA}</a><a class="ok-mark is-b" href="#" aria-label="Sponsor 2 logo spot">${markB}</a></div>
        <div class="ok-foot__note"><p>Your hosted and sponsored program name here on one line</p><p>© PROJECT NAME.</p></div></div>
    </div>`;
  }

  // ───────── Photo fade slider (swiper 6) ─────────
  document.querySelectorAll("[data-swiper]").forEach((el) => {
    new Swiper(el, {
      effect: "fade",
      speed: 2000,
      loop: true,
      touchRatio: 1.5,
      pagination: { el: el.querySelector(".swiper-pagination"), clickable: true },
      autoplay: reduced ? false : { delay: 1500 },
      // The original build has no accessibility module so dots are plain spans — if a dot inside a link became its own pressable button, the touch response would differ from the original
      a11y: { enabled: false },
    });
  });

  // ───────── Parallax · line drawing · section title line ─────────
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    document.querySelectorAll("[data-parallax]").forEach((el) => {
      const [a, b] = el.dataset.parallax.split(",").map(Number);
      gsap.fromTo(el, { yPercent: a }, { yPercent: b, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } });
    });
  });
  document.querySelectorAll("[data-border], .ok-arc-head").forEach((el) => {
    ScrollTrigger.create({ trigger: el, start: "top 90%", once: true, onEnter: () => el.classList.add("is-in") });
  });
  // Original subpages stay still for about .4s after the first paint (while the framework wakes up) and then draw the line
  document.querySelectorAll(".ok-title").forEach((el) => setTimeout(() => el.classList.add("is-in"), 400));

  // Video — in the original, pressing the play button over the preview (light) attaches the player in place and plays right away
  document.querySelectorAll("[data-movie]").forEach((box) => box.addEventListener("click", () => {
    if (box.classList.contains("is-playing")) return;
    box.classList.add("is-playing");
    box.querySelector(".wf-img")?.setAttribute("data-label", "Slot for a performance video being played (YouTube embed player) · landscape 16:9");
  }));

  document.fonts?.ready.then(() => ScrollTrigger.refresh());
  addEventListener("load", () => ScrollTrigger.refresh());
})();
