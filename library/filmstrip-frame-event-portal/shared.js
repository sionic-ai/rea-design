// Shared by all pages: the left floating menu panel (logo, four menus, SNS, collapse button), phone menu button and footer are drawn into placeholders (data-ks),
// Applies the motion from the original main.js — leaving the hero shrinks the menu panel to .8x and folds the list in .5s, the panel disappears at the footer, and it rises in when visible
(() => {
  const page = document.body.dataset.page || "home";
  const fill = (key, html) => document.querySelectorAll(`[data-ks="${key}"]`).forEach((el) => { el.outerHTML = html; });
  const NAV = [["event.html", "Event", "event", "event"], ["about.html", "Message", "message", "about"], ["index.html#partner", "Partner", "partner", ""], ["#contact", "Contact Us", "contact", ""]];
  const ICON = {
    fb: '<svg viewBox="0 0 24 24" aria-hidden="true"><path class="ks-ico-fill" d="M13.4 21v-7.6h2.6l.4-3h-3V8.5c0-.9.3-1.5 1.5-1.5h1.6V4.3c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H7.7v3h2.6V21z"/></svg>',
    ig: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect class="ks-ico-line" x="4" y="4" width="16" height="16" rx="4.5"/><circle class="ks-ico-line" cx="12" cy="12" r="3.8"/><circle class="ks-ico-fill" cx="16.6" cy="7.4" r="1"/></svg>',
    flower: '<svg viewBox="0 0 32 32" aria-hidden="true"><g class="ks-ico-fill">' + [0, 60, 120, 180, 240, 300].map((d) => `<ellipse cx="16" cy="8.5" rx="4.2" ry="6.5" transform="rotate(${d} 16 16)"/>`).join("") + '</g><circle class="ks-ico-hole" cx="16" cy="16" r="3.2"/></svg>',
  };
  // Logo slot — the original is a line of handwritten kana + English CINEMA + waves + a town name drawing. Our text logo with the same three-line structure
  const logo = (cls) => `<svg class="${cls}" viewBox="0 0 185 150" role="img" aria-label="Logo — one handwritten line · large English letters · waves · town name" data-label="Group logo — one line of handwritten Korean, English CINEMA slot, wave, English town name">
    <text class="ks-logo__hand" x="92.5" y="40" text-anchor="middle">Brand Theater</text>
    <text class="ks-logo__big" x="92.5" y="88" text-anchor="middle" textLength="168" lengthAdjust="spacing">CINEMA</text>
    <path class="ks-logo__wave" d="M8 104c10-7 20 7 30 0s20 7 30 0 20 7 30 0 20 7 30 0 20 7 30 0 20 7 9 0"/>
    <text class="ks-logo__town" x="92.5" y="136" text-anchor="middle">✻ TOWN NAME ✻</text>
  </svg>`;
  const share = `<div class="ks-share"><p>FOLLOW US</p><a class="ks-share__icon" href="#" aria-label="Brand">${ICON.fb}</a><a class="ks-share__icon ks-share__icon--ig" href="#" aria-label="Social Media">${ICON.ig}</a></div>`;

  fill("chrome", `
<nav class="ks-gnav" aria-label="Main menu" data-slot="side-menu">
  <a class="ks-gnav__logo" href="index.html" aria-label="First Page">${logo("ks-logo")}</a>
  <div class="ks-gnav__group">
    <div class="ks-gnav__accordion">
      <ul class="ks-gnav__list">${NAV.map(([h, ko, en]) => `<li><a href="${h}">${ko}<span class="ks-gnav__label">${en}</span></a></li>`).join("")}</ul>
      ${share}
    </div>
    <button class="ks-gnav__btn" type="button" aria-label="Expand Menu" aria-expanded="true"><span class="ks-gnav__bars"><i></i><i></i><i></i></span></button>
  </div>
</nav>
<button class="ks-spmenu" type="button" aria-label="Open Menu" aria-expanded="false"><span><i></i><i></i><i></i></span></button>`);

  fill("footer", `
<footer class="ks-footer" id="contact" data-slot="footer">
  <div class="ks-footer__bg wf-img" data-label="Footer background photo · night riverside screening crowd · bathed in blue light · wide landscape" aria-hidden="true"></div>
  <div class="ks-footer__wrap">
    <a class="ks-footer__logo" href="index.html" aria-label="First Page">${logo("ks-logo")}</a>
    <div class="ks-footer__contents">
      <div class="ks-footer__nav">${NAV.map(([h, ko, en]) => `<div class="ks-footer__item"><span>${en}</span><a href="${h}">${ko}</a></div>`).join("")}</div>
      <div class="ks-footer__bottom"><small>copyright © Organization Name</small>${share}</div>
    </div>
  </div>
  <svg class="ks-footer__film" viewBox="0 0 460 300" aria-hidden="true"><g class="ks-film-roll">
    <path d="M40 300 150 60l70 30L110 300Z"/><path d="M190 300 300 40l80 34-100 226Z"/><path d="M330 300 420 110l40 18v172Z"/>
    ${Array.from({ length: 7 }, (_, k) => `<rect class="ks-film-hole" x="${158 + k * 6}" y="${80 + k * 28}" width="10" height="14" rx="2" transform="rotate(23 ${163 + k * 6} ${87 + k * 28})"/>`).join("")}
  </g></svg>
</footer>`);

  // Flower mark for section heads (where the original icon_title.svg sits) · share button mark
  ICON.x = '<svg viewBox="0 0 24 24" aria-hidden="true"><path class="ks-ico-line" d="M5 5l14 14M19 5L5 19"/></svg>';
  document.querySelectorAll("[data-ks-icon]").forEach((el) => { el.innerHTML = ICON.flower; });
  document.querySelectorAll("[data-ks-logo]").forEach((el) => { el.innerHTML = logo("ks-logo"); });
  document.querySelectorAll("[data-ks-ico]").forEach((el) => { el.innerHTML = ICON[el.dataset.ksIco] || ""; });

  NAV.forEach(([h, , , key]) => { if (key && key === page) document.querySelectorAll(`.ks-gnav__list a[href="${h}"], .ks-footer__item a[href="${h}"]`).forEach((a) => a.setAttribute("aria-current", "page")); });

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const gnav = document.querySelector(".ks-gnav"), acc = gnav?.querySelector(".ks-gnav__accordion"), btn = gnav?.querySelector(".ks-gnav__btn");
  // jQuery slideUp and slideDown (.5s swing) — measure the height and go 0 ↔ its own height
  const slide = (open, dur = 0.5) => {
    if (!acc) return;
    acc.classList.toggle("is-open", open);
    btn?.setAttribute("aria-expanded", String(open));
    btn?.classList.toggle("is-hidden", open);
    if (reduce || !window.gsap) { acc.style.height = open ? "" : "0px"; return; }
    gsap.killTweensOf(acc);
    if (open) gsap.fromTo(acc, { height: acc.offsetHeight }, { height: acc.scrollHeight, duration: dur, ease: "sine.inOut", onComplete: () => { acc.style.height = ""; } });
    else gsap.fromTo(acc, { height: acc.offsetHeight }, { height: 0, duration: dur, ease: "sine.inOut" });
  };
  btn?.addEventListener("click", () => slide(!acc.classList.contains("is-open"), 0.4));
  const wide = matchMedia("(min-width: 769px)");
  const kv = document.querySelector("[data-ks-kv]");
  if (gnav && kv) {
    new IntersectionObserver(([e]) => {
      if (!wide.matches) return;
      gnav.classList.toggle("is-scroll", !e.isIntersecting);
      slide(e.isIntersecting);
    }, { rootMargin: "-10% 0px", threshold: [0] }).observe(kv);
  } else if (gnav && wide.matches) { gnav.classList.add("is-scroll"); slide(false, 0); }
  const foot = document.querySelector(".ks-footer");
  if (gnav && foot) new IntersectionObserver(([e]) => gnav.classList.toggle("is-gone", e.isIntersecting), { rootMargin: "-10% 0px", threshold: [0, 0.2, 0.8] }).observe(foot);
  const sp = document.querySelector(".ks-spmenu");
  sp?.addEventListener("click", () => { const on = !sp.classList.contains("is-active"); sp.classList.toggle("is-active", on); gnav?.classList.toggle("is-sp-open", on); sp.setAttribute("aria-expanded", String(on)); });

  // Reveal on visible — original rootMargin -10% (-20% for lines inside event cards) · lists stagger each child by .1s
  const on = (sel, margin) => {
    const els = document.querySelectorAll(sel);
    if (reduce) { els.forEach((el) => el.classList.add("is-active")); return; }
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      if (el.matches("[data-ks-list]")) [...el.children].forEach((c, k) => setTimeout(() => c.classList.add("is-active"), 100 * k));
      else el.classList.add("is-active");
      io.unobserve(el);
    }), { rootMargin: `${margin} 0px`, threshold: [0, 0.2, 0.8] });
    els.forEach((el) => io.observe(el));
  };
  on("[data-ks-show], [data-ks-fade], [data-ks-chars], [data-ks-list]", "-10%");
  on("[data-ks-in]", "-20%");
  // Vertical text split into letters: each letter .07s later, from 2x to 1x
  document.querySelectorAll("[data-ks-chars]").forEach((el) => {
    let n = 0;
    el.querySelectorAll("[data-ks-split]").forEach((part) => {
      const t = part.textContent;
      part.textContent = "";
      [...t].forEach((ch) => { const s = document.createElement("span"); s.className = "ks-char"; s.textContent = ch; s.style.transitionDelay = `${(0.07 * n++).toFixed(2)}s`; part.appendChild(s); });
    });
  });
})();
