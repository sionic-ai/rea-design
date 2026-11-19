// Shared by all pages: draws in the bottom fixed bar, phone menu, contact and footer, and news window, and hooks up the entrance, title droop and image repeat.
// Original values: entrance 1s cubic-bezier(.9,0,.1,1) · 30px from below · vertical scale .9 → 1 · delays 300/400/500ms. Link .4s cubic-bezier(.4,.4,0,1).
(() => {
  const page = document.body.dataset.page || "home";
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const NSL = (window.NSL = { reduced });

  const circleArrow = '<svg class="nsl-go" viewBox="0 0 26 26" aria-hidden="true"><path class="nsl-go__ring" d="M13 2.2C19.6 2 24 6.6 23.8 13.2C23.6 19.4 18.8 24 12.6 23.8C6.4 23.6 2 19 2.2 12.8C2.4 7.6 6 3.6 10.6 2.6" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/><g class="nsl-go__in"><path d="M9.6 13.4L16 12.6M13.6 9.8L16.2 12.6L13.4 15.6" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></g></svg>';
  // Button shaped like a pen nib that has drawn an underline — spot for the original VIEW MORE graphic
  const nib = '<svg class="nsl-more__nib" viewBox="0 0 34 30" aria-hidden="true"><path d="M2 2C10 6 18 12 24 18L30 26L22 22C16 16 8 9 2 2Z" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><path d="M26 22L32 28" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><circle cx="17" cy="14" r="1.4" fill="currentColor"/></svg>';
  document.querySelectorAll("a.nsl-more:empty").forEach((a) => {
    a.innerHTML = `<span class="nsl-more__t">${a.dataset.label || "VIEW MORE"}</span><span class="nsl-more__line"></span>${nib}`;
  });
  document.querySelectorAll(".nsl-news__row").forEach((r) => r.insertAdjacentHTML("beforeend", circleArrow));

  const NAV = [["ABOUT", "about.html", "about"], ["WORKS", "works.html", "works"], ["NEWS", "news.html", "news"], ["CONTACT", "#contact", ""]];
  const markTxt = (light) => `<span class="nsl-logo">${BrandArt.mark(light ? "var(--kf-surface)" : "var(--kf-ink)", light ? "var(--kf-ink)" : "var(--kf-surface)")}<span class="nsl-logo__w">LOGO</span></span>`;
  // Spot for the original service logo (brush-script wordmark) — a bold serif placeholder with a thin band below
  const brand = (cls = "") => `<span class="nsl-brand ${cls}"><b>BR+ND</b><i><em></em>Brand<em></em></i></span>`;
  NSL.brand = brand;
  const serviceBadge = `<a class="nsl-badge" href="index.html#service"><span class="nsl-badge__n"><b>BR+ND</b><i>Brand</i></span><span class="nsl-badge__t">Your service one-liner</span>${circleArrow}</a>`;

  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.classList.add("nsl-head");
    head.innerHTML = `
      <a class="nsl-head__logo" href="index.html" aria-label="Home">${markTxt(false)}</a>
      <a class="nsl-head__logo is-light" href="index.html" aria-hidden="true" tabindex="-1">${markTxt(true)}</a>
      <nav class="nsl-head__nav" aria-label="Main menu">${NAV.map(([t, h, p]) => `<a class="${p === page ? "is-current" : ""}" href="${h}">${t}</a>`).join("")}</nav>
      ${serviceBadge}
      <button class="nsl-burger" type="button" aria-label="Open Menu" aria-expanded="false"><svg viewBox="0 0 32 32" aria-hidden="true"><rect class="nsl-burger__bg" x="1" y="1" width="30" height="30"/><path class="nsl-burger__a" d="M9 12.5L23 11M9 17L20 16.4M10.5 21L22 20"/><path class="nsl-burger__x" d="M10 10L22 22M10.5 21.5L21.5 10.5"/></svg></button>`;
    head.insertAdjacentHTML("beforebegin", `<div class="nsl-menu" data-slot="mobile-menu" aria-hidden="true">
        <nav>${NAV.map(([t, h]) => `<a href="${h}">${t}</a>`).join("")}</nav>
        <div class="nsl-menu__svc">${brand("is-light")}<p class="nsl-menu__tag">Your service one-liner</p>
          <p class="nsl-menu__txt">Your service intro here, about three lines. What can be bundled and handed over, and how simply you can make a request.</p></div>
        <div class="nsl-menu__co"><p>Your company name here</p><p>Your postal code · address line here</p><p class="nsl-copy" data-label="Your copyright notice with the company’s English name here">© Company, all rights reserved</p></div>
      </div>`);
  }

  const contact = document.querySelector('[data-slot="contact"]');
  if (contact) {
    contact.id = "contact";
    contact.classList.add("nsl-contact");
    contact.innerHTML = `
      <div class="nsl-contact__stool" data-art="stool" data-fit="xMidYMin meet"></div>
      <div class="nsl-contact__grid">
        <div class="nsl-contact__head">
          <h2 class="nsl-title" data-type data-frames="12">CONTACT</h2>
          <p class="nsl-sub">Your inquiry here</p>
          <p class="nsl-contact__lead ap">Your line inviting inquiries here in about three lines. Say it’s fine if you don’t yet know what you need, and how far consultation can go.</p>
        </div>
        <div class="nsl-contact__list">
          <a class="nsl-row ap" href="#"><span class="nsl-row__k">FORM</span><span class="nsl-row__v">Your contact form here</span>${circleArrow}</a>
          <a class="nsl-row ap" data-ap="400" href="#"><span class="nsl-row__k">TEL</span><span class="nsl-row__v"><b>00-0000-0000</b><small>Your hours here / Weekdays 00:00~00:00</small></span>${circleArrow}</a>
          <a class="nsl-svc ap" data-ap="500" href="index.html#service">${brand("is-light")}<span class="nsl-svc__t"><b>Your service one-liner</b><small>Your service intro here in about three lines. Explain what can be handed off together as one bundle and how simply you can ask.</small></span>${circleArrow}</a>
        </div>
      </div>
      <footer class="nsl-foot" data-slot="footer">
        <div class="nsl-foot__co">${markTxt(true)}<p>Your company name here<br>Your postal code · address line here</p></div>
        <div class="nsl-foot__nav"><nav><a href="about.html">ABOUT</a><a href="works.html">WORKS</a><a href="index.html#service">BRAND</a></nav><nav><a href="news.html">NEWS</a><a href="#contact">CONTACT</a></nav>
          <p class="nsl-copy" data-label="Your copyright notice with the company’s English name here">© Company, all rights reserved</p></div>
      </footer>`;
  }

  // Detail window opened by tapping a news row — the original is one white sheet over a mustard scrim
  document.body.insertAdjacentHTML("beforeend", `<div class="nsl-modal" data-slot="news-modal" aria-hidden="true" role="dialog" aria-modal="true">
      <div class="nsl-modal__veil"></div>
      <article class="nsl-modal__paper">
        <p class="nsl-modal__date">0000.0.00</p>
        <h3 class="nsl-modal__title">Your news title here, one line</h3>
        <div class="wf-img" data-label="Work key image · poster with a large title logo · landscape 16:6"></div>
        <p class="nsl-modal__body">Your news body here in two lines. State what you took on and when it airs or goes public.</p>
        <dl class="nsl-modal__meta"><div><dt>List</dt><dd><a href="works.html">Your list URL here</a></dd></div><div><dt>Official page</dt><dd><a href="#">Your official address here</a></dd></div></dl>
        <button class="nsl-back" type="button">${nib}<span class="nsl-back__line"></span><span>BACK</span></button>
      </article>
    </div>`);
  const modal = document.querySelector(".nsl-modal");
  const openModal = (row) => {
    modal.querySelector(".nsl-modal__date").textContent = row.querySelector(".nsl-news__d")?.textContent || "";
    modal.querySelector(".nsl-modal__title").textContent = row.querySelector(".nsl-news__t")?.textContent || "";
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.documentElement.classList.add("is-locked");
  };
  const closeModal = () => {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.documentElement.classList.remove("is-locked");
  };
  document.addEventListener("click", (e) => {
    const row = e.target.closest(".nsl-news__row");
    if (row) { e.preventDefault(); openModal(row); return; }
    if (e.target.closest(".nsl-back, .nsl-modal__veil")) closeModal();
  });
  addEventListener("keydown", (e) => { if (e.key === "Escape") { closeModal(); toggleMenu(false); } });

  const burger = document.querySelector(".nsl-burger");
  const toggleMenu = (force) => {
    const open = force ?? !document.documentElement.classList.contains("is-menu");
    document.documentElement.classList.toggle("is-menu", open);
    burger?.setAttribute("aria-expanded", String(open));
    document.querySelector(".nsl-menu")?.setAttribute("aria-hidden", String(!open));
  };
  burger?.addEventListener("click", () => toggleMenu());
  document.querySelectorAll(".nsl-menu a").forEach((a) => a.addEventListener("click", () => toggleMenu(false)));

  BrandArt.render();

  // English section titles · service copy · vertical-writing sentences are one-shot lettering GIFs in the original — hold for data-hold-ms (default 500ms), then 100ms per frame across data-frames frames
  // Letters are written in turn (WORKS 9 · NEWS 8 · CONTACT 12 · ABOUT 9 · service copy 21 · vertical writing 28 frames, cut off without in-between values)
  const FRAME = 100;
  const splitChars = (el) => {
    const out = [];
    const walk = (node) => [...node.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        [...n.textContent].forEach((ch) => {
          if (!ch.trim()) return frag.append(ch);
          const c = document.createElement("span");
          c.className = "nsl-c";
          c.setAttribute("aria-hidden", "true");
          c.textContent = ch;
          frag.append(c);
          out.push(c);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1 && !n.matches("svg")) walk(n);
    });
    el.setAttribute("aria-label", el.textContent.trim());
    walk(el);
    return out;
  };
  const typed = new Map();
  document.querySelectorAll("[data-type]").forEach((el) => typed.set(el, splitChars(el)));
  const typeIn = (el) => {
    const cs = typed.get(el) || [];
    const hold = Number(el.dataset.holdMs ?? 500), frames = Number(el.dataset.frames) || Math.round(cs.length * 1.8);
    const loop = el.querySelector(".nsl-tate__loop path");
    // Text is drawn over the earlier frames, and if there is a pen loop it spans the last 30% of frames
    const textFrames = loop ? Math.max(1, Math.round(frames * 0.7)) : frames;
    cs.forEach((c, i) => setTimeout(() => c.classList.add("is-on"), hold + FRAME * Math.ceil(((i + 1) * textFrames) / cs.length)));
    if (loop) gsap.fromTo(loop, { strokeDashoffset: 260 }, { strokeDashoffset: 0, duration: ((frames - textFrames) * FRAME) / 1000, delay: (hold + textFrames * FRAME) / 1000, ease: `steps(${frames - textFrames})` });
  };
  window.NSL.typeIn = typeIn;
  window.NSL.splitChars = splitChars;

  const show = (el) => el.classList.add("is-in");
  if (reduced) {
    document.querySelectorAll(".ap, [data-type]").forEach(show);
    document.querySelectorAll(".nsl-c").forEach((c) => c.classList.add("is-on"));
  } else {
    const io = new IntersectionObserver((ents) => ents.forEach((en) => {
      if (!en.isIntersecting) return;
      const el = en.target;
      if (el.hasAttribute("data-type")) typeIn(el);
      show(el);
      io.unobserve(el);
    }), { rootMargin: "0px 0px -8% 0px" });
    // For pages with a separate hero sequence (loading intro), observation starts after it
    NSL.watch = () => document.querySelectorAll(".ap:not([data-hold]), [data-type]:not([data-hold])").forEach((el) => {
      if (el.dataset.ap) el.style.transitionDelay = el.dataset.ap + "ms";
      io.observe(el);
    });
    if (!document.body.hasAttribute("data-intro")) NSL.watch();
  }

  // Repetition within the picture — the original GIF keeps the pose but draws the same picture 3 times with slightly different lines, cycling every 0.5s (hand-drawn jitter).
  // Apply a noise displacement filter at the same tempo to our drawing and cycle through three seeds
  const boil = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  boil.setAttribute("class", "nsl-boil-defs");
  boil.setAttribute("aria-hidden", "true");
  boil.innerHTML = '<filter id="nsl-boil" x="-1%" y="-1%" width="102%" height="102%"><feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="1"/><feDisplacementMap in="SourceGraphic" scale="3" xChannelSelector="R" yChannelSelector="G"/></filter>';
  document.body.append(boil);
  if (!reduced) {
    const turb = boil.querySelector("feTurbulence");
    let frame = 0;
    setInterval(() => { frame = (frame + 1) % 3; turb.setAttribute("seed", String(frame + 1)); }, 500);
  }
})();
