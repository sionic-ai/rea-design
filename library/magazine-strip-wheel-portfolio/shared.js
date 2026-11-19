// Shared across the site — header (image logo·menu·sound·clock·mail copy), phone burger menu, contact curtain, footer line, page-flip curtain.
(() => {
  const body = document.body;
  const page = body.dataset.page || "home";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Picture logo — the original is a self-portrait animated with Rive. Ours is a face line drawing in a square frame + eye blink
  const LOGO = `<svg viewBox="0 0 55 123" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true">
    <rect x="1" y="1" width="53" height="121"/><path d="M1 17h53"/>
    <text x="27.5" y="13" text-anchor="middle" fill="currentColor" stroke="none" font-size="10" font-weight="600" letter-spacing=".5">LOGO</text>
    <path d="M12 64c0-14 7-24 16-24s16 10 16 24c0 13-7 22-16 22s-16-9-16-22Z"/>
    <path d="M10 50c4-9 11-14 18-14s14 5 18 14l-3 2c-5-4-10-6-15-6s-10 2-15 6Z" fill="currentColor"/>
    <circle class="eye" cx="22" cy="62" r="4.5"/><circle class="eye" cx="34" cy="62" r="4.5"/><path d="M26.5 62h3"/>
    <path d="M23 75c3 2 6 2 9 0"/><path d="M14 86l-4 30M41 86l4 30M20 96l7 6 7-6"/>
  </svg>`;
  // About·playground aren’t in the original recording, so only placeholders (gaps)
  const LINKS = [["index.html", "Work", "home"], ["#", "About", "about"], ["#", "Playground", "play"], ["#contact", "Contact", "contact"]];
  const item = ([h, t, k]) => `<li><a href="${h}"${k === "contact" ? " data-contact" : ""} class="t-menu${k === page || (k === "home" && page === "detail") ? " is-active" : ""}"><span class="arr">→</span><span class="mt"><span>${t}</span><span aria-hidden="true">${t}</span></span></a></li>`;
  const hd = document.querySelector('[data-slot="header"]');
  if (hd) {
    hd.outerHTML = `<header class="hd grid16" data-slot="header">
      <button class="hd__logo" type="button" data-contact aria-label="Open contact"><span class="hd__word"><b>LOGO<sup>®</sup></b><span class="t-xs">copyright 2026</span><span class="t-xs">City, country</span><span class="t-xs">+00</span></span><span class="hd__face">${LOGO}</span></button>
      <nav class="hd__menu" aria-label="Main menu"><span class="hd__label t-s dim">Menu</span><ul class="menu" data-label="Section names in English · Work · About · Playground · Contact">${LINKS.map(item).join("")}</ul></nav>
      <div class="hd__audio t-s"><span class="dim">Sound</span><span class="audio-state"><span class="audio-state__in"><span>On</span><span>Blink</span></span></span><button class="audio-btn" type="button" aria-pressed="false" aria-label="Sound On"><i class="bar"></i></button></div>
      <div class="hd__where t-s"><span>We Work Anywhere</span><br><span class="dim">City name, <span class="clock">00:00</span></span></div>
      <div class="hd__mail t-s"><span class="dim mail-label">Inquiry</span><button class="copy" type="button" data-copy="hello@example.com"><span class="copy__track"><span class="addr">hello@example.com</span><span class="hint" aria-hidden="true">Press to copy</span></span><span class="done" aria-hidden="true">Copied</span></button></div>
    </header>
    <header class="hd-m" data-slot="header-mobile"><button class="burger" type="button" aria-label="Menu" aria-expanded="false"><i></i><i></i></button><a class="hd-m__name" href="index.html">LOGO<sup>®</sup></a><span class="hd-m__slot"></span></header>
    <nav class="menu-m" data-slot="mobile-menu" aria-label="Phone menu" data-label="Section names in English · Work · About · Playground · Contact">${LINKS.map(([h, t, k]) => `<a href="${h}"${k === "contact" ? " data-contact" : ""}>${t}</a>`).join("")}</nav>`;
  }
  const tick = () => document.querySelectorAll(".clock").forEach((c) => (c.textContent = new Date().toTimeString().slice(0, 5)));
  tick(); setInterval(tick, 15000);
  // Sweep — measuring the original, it always sweeps once more from left to right both on hover and on leave (in .63s · out .72~.8s, cubic ease-out)
  const hoverable = matchMedia("(hover: hover)").matches;
  // Rolling text (showreel·mail): on enter 0 → +width (old text exits right and its twin enters from the left), on leave −width → 0 (old text returns from the left) · line (view site): entering or leaving −width → +width+23
  const sweep = (host, target, inFT, outFT, inDur, outDur, rest, outEase = "power3.out", outDelay = 0) => {
    if (!host || !target || !hoverable || reduce) return;
    const go = ([f, t], d, after, ease, delay) => gsap.fromTo(target, { x: f }, { x: t, duration: d, delay, ease, overwrite: true, immediateRender: true, onComplete: () => after != null && gsap.set(target, { x: after }) });
    host.addEventListener("pointerenter", () => go(inFT(), inDur, null, "power3.out", 0));
    host.addEventListener("pointerleave", () => go(outFT(), outDur, rest, outEase, outDelay));
  };
  const reelT = document.querySelector(".reel__track");
  sweep(document.querySelector(".reel"), reelT, () => [0, reelT.offsetWidth + 17], () => [-(reelT.offsetWidth + 17), 0], 0.63, 0.72, null);
  const mailT = document.querySelector(".copy__track");
  sweep(document.querySelector(".hd__mail"), mailT, () => [0, mailT.offsetWidth], () => [-mailT.offsetWidth, 0], 0.63, 0.75, null);
  const visitL = document.querySelector(".visit__line");
  // When the site-view row exits — the 10%-interval movement shares measured from the original (.05 · .31 · .47 · .60 · .73 · .80 · .88 · .92 · .95 · .97, 567ms) used as a curve as is
  const visitOut = window.CustomEase ? CustomEase.create("hy-visit-out", "M0,0 L0.0915,0.05 L0.183,0.31 L0.274,0.47 L0.366,0.6 L0.457,0.73 L0.549,0.8 L0.64,0.88 L0.732,0.92 L0.823,0.95 L0.915,0.97 L1,1") : "power2.out";
  sweep(document.querySelector(".visit"), visitL, () => [0, 2 * visitL.offsetWidth + 23], () => [0, 2 * visitL.offsetWidth + 23], 0.91, 0.62, 0, visitOut, 0);
  // Sound — hovering the Off text slides On in from the left, and releasing pushes it out to the right and back into place. Pressing only changes the state
  const aud = document.querySelector(".hd__audio");
  const audIn = aud?.querySelector(".audio-state__in");
  if (aud && hoverable && !reduce) {
    const st = aud.querySelector(".audio-state");
    st.addEventListener("pointerenter", () => gsap.fromTo(audIn, { x: 0 }, { x: 22, duration: 0.66, ease: "power3.out", overwrite: true }));
    st.addEventListener("pointerleave", () => gsap.to(audIn, { x: 44, duration: 0.74, ease: "power3.out", overwrite: true, onComplete: () => gsap.set(audIn, { x: 0 }) }));
  }
  const toggleAudio = () => {
    const on = aud.classList.toggle("is-on");
    // Swap only the letter positions — the second cell is the current state, the first cell is the next state previewed on hover
    const [a, b2] = audIn.children; a.textContent = on ? "Blink" : "On"; b2.textContent = on ? "On" : "Blink";
    const b = aud.querySelector(".audio-btn");
    b.setAttribute("aria-pressed", String(on)); b.setAttribute("aria-label", on ? "Sound Off" : "Sound On");
  };
  aud?.querySelector(".audio-btn").addEventListener("click", toggleAudio);
  aud?.querySelector(".audio-state").addEventListener("click", toggleAudio);
  document.querySelectorAll("[data-copy]").forEach((b) => b.addEventListener("click", () => {
    navigator.clipboard?.writeText(b.dataset.copy).catch(() => {});
    b.classList.add("is-copied"); setTimeout(() => b.classList.remove("is-copied"), 1600);
  }));
  const burger = document.querySelector(".burger"), mm = document.querySelector(".menu-m");
  burger?.addEventListener("click", () => { const o = mm.classList.toggle("is-open"); burger.classList.toggle("is-open", o); burger.setAttribute("aria-expanded", String(o)); });

  // ── Bottom Row ──
  const ft = document.querySelector('[data-slot="footer-bar"]');
  if (ft) {
    ft.className = "ft t-s";
    ft.innerHTML = `<span class="dim">Scroll</span><button class="reel" type="button" data-reel><span class="reel__roll"><span class="reel__track"><span>Reel 25</span><span aria-hidden="true">Reel 25</span></span></span><svg viewBox="0 0 10 12" fill="currentColor"><path d="M0 0l10 6-10 6Z"/></svg></button>`;
  }

  // ── Showreel overlay — a 16:9 video slot over a dark overlay, closes on a click anywhere or Esc ──
  const reel = document.createElement("div");
  reel.className = "reel-modal"; reel.dataset.slot = "reel-modal"; reel.setAttribute("role", "dialog"); reel.setAttribute("aria-label", "Showreel");
  reel.innerHTML = `<div class="reel-modal__video wf-img wf-video" data-label="Year work reel · 16:9 · with sound · autoplay"></div><button class="contact__close t-s" type="button">Close<svg viewBox="0 0 11 11" stroke="currentColor"><path d="M1 1l9 9M10 1l-9 9"/></svg></button>`;
  body.append(reel);
  document.addEventListener("click", (e) => { if (e.target.closest("[data-reel]")) { reel.classList.add("is-open"); return; } if (reel.classList.contains("is-open") && !e.target.closest(".reel-modal__video")) reel.classList.remove("is-open"); });
  addEventListener("keydown", (e) => e.key === "Escape" && reel.classList.remove("is-open"));

  // ── Contact Card ──
  const ct = document.querySelector('[data-slot="contact"]');
  if (ct) {
    const pair = (k, vs) => `<div><span class="t-xs">${k}</span>${vs.map((v) => `<a class="t-s" href="#">${v}</a>`).join("")}</div>`;
    ct.className = "contact";
    ct.setAttribute("role", "dialog"); ct.setAttribute("aria-label", "Contact"); ct.id = "contact";
    ct.innerHTML = `<div class="contact__card contact__hi"><h2 class="contact__title" data-label="Your short English greeting">Get in touch</h2><div class="contact__grid">${pair("Leave us a line", ["hello@example.com"])}${pair("Design story", ["Video channel"])}${pair("View more work", ["Channel one", "Channel two"])}${pair("Recent News", ["Channel one", "Channel two", "Channel three"])}${pair("Shots saved", ["One photo channel", "Photo Channel Two"])}</div>
        <button class="contact__close t-s" type="button" data-contact-close>Close<svg viewBox="0 0 11 11" stroke="currentColor"><path d="M1 1l9 9M10 1l-9 9"/></svg></button></div>
      <div class="contact__card contact__credit"><h2 class="contact__title" data-label="Credits section name">Credits</h2><div class="contact__grid">${pair("Development", ["Name"])}${pair("Picture", ["Name"])}${pair("Typeface", ["Two typeface names"])}${pair("Text", ["Name"])}</div>
        <svg class="contact__face" viewBox="0 0 84 96" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M20 44c0-14 9-24 22-24s22 10 22 24-9 26-22 26-22-12-22-26Z"/><path d="M16 32c6-12 16-18 26-18s20 6 26 18l-4 3c-7-6-14-8-22-8s-15 2-22 8Z" fill="currentColor"/><circle cx="34" cy="44" r="5"/><circle cx="50" cy="44" r="5"/><path d="M36 58c4 3 8 3 12 0M8 96c4-16 16-24 34-24s30 8 34 24"/><path d="M6 60l6-18 6 18M14 42v-8"/></svg></div>`;
    const close = () => { ct.classList.remove("is-open"); body.classList.remove("is-contact"); };
    const open = (e) => { if (!e.target.closest("[data-contact]")) return; e.preventDefault(); ct.classList.add("is-open"); body.classList.add("is-contact"); mm?.classList.remove("is-open"); burger?.classList.remove("is-open"); };
    document.addEventListener("click", (e) => { if (e.target.closest("[data-contact]")) return open(e); if (ct.classList.contains("is-open") && (e.target.closest("[data-contact-close]") || !e.target.closest(".contact__card"))) close(); });
    addEventListener("keydown", (e) => e.key === "Escape" && close());
  }

  // ── Page transition — when going to a page within the same site, covers with a paper-colored curtain in .5s and moves on ──
  const veil = document.createElement("div"); veil.className = "veil"; veil.setAttribute("aria-hidden", "true"); body.append(veil);
  if (document.documentElement.classList.contains("is-arriving")) requestAnimationFrame(() => requestAnimationFrame(() => document.documentElement.classList.remove("is-arriving")));
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || e.defaultPrevented || a.hasAttribute("data-contact") || e.metaKey || e.ctrlKey) return;
    const href = a.getAttribute("href");
    if (!/^[\w-]+\.html(#.*)?$/.test(href)) return;
    e.preventDefault();
    if (reduce) { location.href = href; return; }
    veil.classList.add("is-on");
    try { sessionStorage.setItem("hy-arrive", "1"); } catch (err) {}
    setTimeout(() => (location.href = href), 500);
  });
  addEventListener("pageshow", (e) => e.persisted && veil.classList.remove("is-on"));
  window.HY = { go: (href) => { veil.classList.add("is-on"); try { sessionStorage.setItem("hy-arrive", "1"); } catch (err) {} setTimeout(() => (location.href = href), reduce ? 0 : 500); } };
})();
