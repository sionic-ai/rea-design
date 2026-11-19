// Four pages share the same hamburger · drawer menu · sticky footer · wave tape, so they are drawn and animated here. The sparkle cursor is _fx/sparkle-trail-cursor (attached to body)
(() => {
  const MENU = [["HOME", "index.html#top"], ["CONCEPT", "index.html#concept"], ["NEWS", "news.html"], ["PRODUCT", "index.html#product"], ["SPECIAL", "index.html#special"], ["SHOP", "index.html#shop"]];
  // Social buttons are icon slots (three types) instead of text — the caller swaps in its own icons
  const SNS = ["<circle cx='12' cy='12' r='6'/>", "<rect x='6' y='6' width='12' height='12' rx='4'/>", "<path d='M7 7l10 10M17 7 7 17'/>"];
  const snsIco = (s) => `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true">${s}</svg>`;
  const LINKS = ["Company info", "Privacy policy", "Terms of service", "Accessibility policy", "Inquiry", "Information Provision Notice", "", "Social media policy"];
  const STICKERS = [
    ["LALALA", "var(--site-cyan-88)", "-6deg", "2%", "38%"], ["LALA", "var(--site-magenta-74b)", "4deg", "22%", "58%"], ["LALALA", "var(--site-yellow-91)", "-3deg", "30%", "30%"],
    ["PLAY!", "var(--site-tape-pink)", "8deg", "50%", "40%"], ["LA LA", "var(--site-violet)", "-8deg", "64%", "52%"], ["LALALA", "var(--site-green-81)", "3deg", "78%", "34%"],
  ];
  const logo = (sub = true) => `<span class="mm-logo"><span>LA</span><span>LA</span><span>LA</span>${sub ? '<small data-label="Your one-line English Brand text here">✦ BRAND LINE ✦</small>' : ""}</span>`;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const head = document.querySelector('[data-slot="header"]');
  head.innerHTML = `<button class="mm-burger" type="button" aria-label="Menu"><span class="mm-burger__in"><span></span><span></span><span></span></span></button>`;
  const menu = document.querySelector('[data-slot="menu"]');
  menu.className = "mm-menu";
  menu.innerHTML = `<div class="mm-menu__in">
      <a class="mm-menu__logo" href="index.html#top" style="font-size:56px">${logo(false)}</a>
      <ul class="mm-menu__list">${MENU.map(([t, h]) => `<li><a href="${h}">${t}</a></li>`).join("")}</ul>
      <div class="mm-menu__sns">${SNS.map((s) => `<a class="mm-sns" href="#" aria-label="Social">${snsIco(s)}</a>`).join("")}</div>
    </div>`;
  const burger = head.querySelector(".mm-burger");
  const setMenu = (open) => {
    menu.classList.toggle("is-open", open);
    burger.classList.toggle("is-active", open);
  };
  burger.addEventListener("click", () => setMenu(!menu.classList.contains("is-open")));
  menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));

  // In-page menu moves slide at .8s easeOutExpo like the original TargetScroll (top is 0, Concept is 2 screens, the others at position −10px)
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href*='#']");
    if (!a) return;
    const u = new URL(a.href, location.href);
    if (u.pathname !== location.pathname || !u.hash) return;
    const tgt = u.hash === "#top" ? document.body : document.querySelector(u.hash);
    if (!tgt) return;
    e.preventDefault();
    const to = u.hash === "#top" ? 0 : u.hash === "#concept" ? innerHeight * 2 : tgt.getBoundingClientRect().top + scrollY - 10;
    const from = scrollY, t0 = performance.now();
    const step = (now) => {
      const p = reduce ? 1 : Math.min((now - t0) / 800, 1);
      scrollTo(0, from + (to - from) * (p === 1 ? 1 : 1 - Math.pow(2, -10 * p)));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });

  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.className = "mm-foot";
    foot.innerHTML = `<div class="mm-foot__deco" data-inview>${STICKERS.map(([t, c, r, x, y], i) =>
        `<span class="mm-foot__sticker" style="--c:${c};--r:${r};--d:${i * 0.08}s;left:${x};top:${y}">${t}</span>`).join("")}</div>
      <div class="mm-foot__box">
        <div class="mm-foot__brand">${logo()}<div class="mm-foot__sns">${SNS.map((s) => `<a class="mm-sns" href="#" aria-label="Social">${snsIco(s)}</a>`).join("")}</div></div>
        <div class="mm-foot__links">${LINKS.map((t) => (t ? `<a href="#">${t}</a>` : "<span></span>")).join("")}</div>
      </div>`;
  }

  // Turn on once when it starts becoming visible (footer stickers pop out one by one, etc.)
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
  }), { rootMargin: "0px 0px -10% 0px" });
  document.querySelectorAll("[data-inview]").forEach((el) => io.observe(el));

  // ---------- Modal ----------
  const openModal = (id) => {
    const m = document.getElementById(id);
    if (!m) return;
    m.classList.add("is-open");
    document.body.classList.add("is-locked");
  };
  const closeModal = (m) => {
    m.classList.remove("is-open");
    if (!document.querySelector(".mm-modal.is-open")) document.body.classList.remove("is-locked");
  };
  document.addEventListener("click", (e) => {
    const opener = e.target.closest("[data-modal-open]");
    if (opener) { e.preventDefault(); openModal(opener.dataset.modalOpen); return; }
    const closer = e.target.closest(".mm-modal__close, .mm-modal__overlay");
    if (closer) closeModal(closer.closest(".mm-modal"));
  });
  addEventListener("keydown", (e) => {
    if (e.key === "Escape") document.querySelectorAll(".mm-modal.is-open").forEach(closeModal);
  });

  // ---------- Wave tape: black border + shimmering gradient band, with text flowing along the path ----------
  const W = 3360;
  const wave = (amp, len, phase, tilt) => {
    let d = "";
    const y0 = 170;
    for (let x = -len, i = 0; x < W + len; x += len / 2, i++) {
      const s = (i + phase) % 2 ? 1 : -1;
      const ya = y0 + (tilt * x) / W;
      const yb = y0 + (tilt * (x + len / 2)) / W;
      if (!d) d = `M${x},${ya.toFixed(1)}`;
      d += ` C${(x + len / 6).toFixed(1)},${(ya + s * amp * 1.33).toFixed(1)} ${(x + len / 3).toFixed(1)},${(yb + s * amp * 1.33).toFixed(1)} ${(x + len / 2).toFixed(1)},${yb.toFixed(1)}`;
    }
    return d;
  };
  let uid = 0;
  document.querySelectorAll("[data-roll]").forEach((wrap) => {
    const word = wrap.dataset.roll;
    const colors = wrap.dataset.colors.split(",");
    wrap.className = "mm-rolls";
    wrap.innerHTML = [false, true].map((rev) => {
      const id = `mm-roll-${uid++}`;
      const d = rev ? wave(30, 900, 1, -60) : wave(40, 760, 0, 50);
      const fill = colors[rev ? 1 : 0];
      return `<div class="mm-roll${rev ? " is-reverse" : ""}"><svg viewBox="0 0 ${W} 340" aria-hidden="true">
        <defs><linearGradient id="${id}-g" x1="0%" x2="100%">
          ${reduce ? "" : '<animate attributeName="x1" values="100%;-100%" dur="4s" repeatCount="indefinite"/><animate attributeName="x2" values="200%;0%" dur="4s" repeatCount="indefinite"/>'}
          <stop offset="0%" style="stop-color:${fill}"/><stop offset="50%" style="stop-color:${colors[2]}"/><stop offset="100%" style="stop-color:${fill}"/>
        </linearGradient><path id="${id}" d="${d}"/></defs>
        <use href="#${id}" fill="none" stroke-width="85" style="stroke:var(--kf-line)"/>
        <use href="#${id}" fill="none" stroke="url(#${id}-g)" stroke-width="80"/>
        <text><textPath href="#${id}" startOffset="0">${(word + "  ").repeat(40)}</textPath></text>
      </svg></div>`;
    }).join("");
  });

  gsap.registerPlugin(ScrollTrigger);
  // Text width has to be measured, so attach after the typeface has fully loaded
  document.fonts.ready.then(() => gsap.matchMedia().add({ motion: "(prefers-reduced-motion: no-preference)", sp: "(max-width: 768px)" }, (ctx) => {
    if (!ctx.conditions.motion) return;
    // The original runs each letter at 3× the path length over 80s (35s on phones) — pushes the textPath start point at the same speed
    const secs = ctx.conditions.sp ? 35 : 80;
    document.querySelectorAll(".mm-roll").forEach((roll) => {
      const tp = roll.querySelector("textPath");
      const path = roll.querySelector("path");
      const speed = (path.getTotalLength() * 3) / secs;
      const span = tp.getComputedTextLength() / 2;
      const rev = roll.classList.contains("is-reverse");
      const tw = gsap.fromTo(tp, { attr: { startOffset: rev ? -span : 0 } }, { attr: { startOffset: rev ? 0 : -span }, duration: span / speed, ease: "none", repeat: -1 });
      ScrollTrigger.create({ trigger: roll, start: "top bottom", end: "bottom top", onToggle: (st) => (st.isActive ? tw.play() : tw.pause()) });
    });
  }));
})();
