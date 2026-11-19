// Shared by all pages: header row (two-line name · cycling award line · signature drawing · menu/contact roll · local time · clock dial), menu panel, contact panel, Lenis.
// The page calls by.headIntro() for the first headline entrance (first page together with the gallery’s first entrance, detail pages right away). Original values: each line 1s power2.out, stagger .06,
// Signature strokes 1.3 · .6 · .4s power1.inOut (.225s late · overlapping the previous stroke’s end by .15s), menu lines logo + 1.2s, time line + .225s, clock circle 1s, hands 1s turning to the current time.
(() => {
  gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin, CustomEase);
  const morph = CustomEase.create("by-morph", "0.46,0,0.09,1");
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const desktop = matchMedia("(min-width: 1025px)");
  const here = location.pathname.split("/").pop() || "index.html";

  const SIGN = '<svg viewBox="0 0 46 30" aria-hidden="true"><path d="M3 24c4-9 7-18 9-20 2-2 1 8-1 15-1 4 6-9 11-10 4-1-2 9 1 10 3 1 6-6 8-6"/><path d="M27 18c2 0 4-1 5-3"/><path d="M36 20c2-3 5-4 7-3"/></svg>';
  const head = document.createElement("header");
  head.className = "by-head by-12";
  head.setAttribute("data-slot", "header");
  head.innerHTML = `
    <div class="by-logo-wrap">
      <a class="by-logo" href="index.html" aria-label="Your name — Back to start here">
        <span class="by-roll" data-line><span class="by-roll__in"><span>Here</span><span aria-hidden="true">Here</span></span></span>
        <span class="by-roll" data-line><span class="by-roll__in"><span>Name</span><span aria-hidden="true">Name</span></span></span>
        <span class="by-award" aria-hidden="true">
          <span class="by-award__line"><span>Here</span><span>Award name</span><span>Site of the day</span></span>
          <span class="by-award__line"><span>Name</span><span>Site of the day</span><span>00 OCT '00</span></span>
        </span>
      </a>
    </div>
    <a class="by-sign" href="index.html" aria-label="Signature — To the start">${SIGN}</a>
    <nav class="by-nav" aria-label="Main menu">
      <button class="by-link by-roll" type="button" data-menu aria-expanded="false" aria-controls="by-menu"><span class="by-roll__in"><span>Menu</span><span aria-hidden="true">Menu</span></span></button>
      <button class="by-link by-roll" type="button" data-contact aria-expanded="false" aria-controls="by-contact"><span class="by-roll__in"><span>Inquiry</span><span aria-hidden="true">Inquiry</span></span></button>
    </nav>
    <div class="by-time">
      <span class="by-time__label"><span>Local time</span><span data-fx-part="reset">Time Travel ✕</span></span>
      <span class="by-roll" data-line><span data-fx-part="time">00.00</span></span>
    </div>
    <div class="by-egg" data-fx="sky-time-dial" data-fx-sky-time-dial="hover: 6.3rem; hold: 8.8rem" data-slot="time-dial" role="img" aria-label="Clock — drag the hand tips to change the sky">
      <svg viewBox="0 0 52 52" data-fx-part="face"><circle cx="26" cy="26" r="25.5" vector-effect="non-scaling-stroke" transform="rotate(-90 26 26)"/></svg>
      <i class="by-egg__hand" data-fx-part="hand"></i><i class="by-egg__follow" data-fx-part="follower"></i>
    </div>`;
  document.body.prepend(head);
  // The dot in the clock text blinks on a 1-second tempo — the part rewraps the dot each time it writes digits
  const timeEl = head.querySelector('[data-fx-part="time"]');
  new MutationObserver(() => {
    if (timeEl.querySelector(".by-dot")) return;
    const [h, m] = timeEl.textContent.split(".");
    if (m == null) return;
    timeEl.innerHTML = `${h}<span class="by-dot"> . </span>${m}`;
  }).observe(timeEl, { childList: true, characterData: true, subtree: true });

  // ───────── Lenis ─────────
  const lenis = reduce || document.body.hasAttribute("data-no-scroll") ? null : new Lenis({ lerp: 0.1 });
  if (lenis) {
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // Roll — each hover rolls up one line in .4s power2.out, and restarts from the beginning once all are rolled
  const roll = (host, targets) => {
    const tl = gsap.timeline({ paused: true }).to(targets, { yPercent: -100, duration: 0.4, ease: "power2.out" });
    host.addEventListener("mouseenter", () => (tl.progress() === 1 ? tl.restart() : tl.play()));
    return tl;
  };
  if (!reduce && desktop.matches) {
    // The roll is applied to the wrapper (.by-roll__in) around the letter that appears first (the first batch)
    head.querySelectorAll(".by-link").forEach((b) => roll(b, b.querySelector(".by-roll__in")));
    const logo = head.querySelector(".by-logo");
    const logoTl = gsap.timeline({ paused: true }).to(logo.querySelectorAll(".by-roll__in"), { yPercent: -100, duration: 0.4, ease: "power2.out" });
    logo.addEventListener("mouseenter", () => { if (awardTl?.isActive()) return; logoTl.progress() === 1 ? logoTl.restart() : logoTl.play(); });
  }

  // ───────── Awards row — three sets swap into the two name-line slots in .4s (cubic out) and each stays 1.5s. Repeats every 90s ─────────
  let awardTl = null;
  const award = () => {
    if (reduce) return;
    const box = head.querySelector(".by-award");
    const lines = head.querySelectorAll(".by-logo [data-line]");
    const sets = [0, 1, 2].map((k) => [...box.querySelectorAll(".by-award__line")].map((l) => l.children[k]));
    const step = 0.4 + 1.5;
    const ease = (e) => 1 - (1 - e) ** 3;
    // While the award line runs, the logo width is pinned to that line’s width (original minWidth)
    const logo = head.querySelector(".by-logo");
    gsap.set(box, { visibility: "visible" });
    gsap.set(logo, { minWidth: box.offsetWidth });
    gsap.set(lines, { opacity: 0 });
    gsap.set(sets[0], { yPercent: 0 });
    gsap.set([...sets[1], ...sets[2]], { yPercent: 100 });
    awardTl = gsap.timeline({ defaults: { duration: 0.4, ease, immediateRender: false }, onComplete: () => { gsap.set(box, { clearProps: "visibility" }); gsap.set(lines, { clearProps: "opacity" }); gsap.set(logo, { clearProps: "minWidth" }); } })
      .fromTo(sets[0], { yPercent: 0 }, { yPercent: -100 }, 0).fromTo(sets[1], { yPercent: 100 }, { yPercent: 0 }, 0)
      .fromTo(sets[1], { yPercent: 0 }, { yPercent: -100 }, step).fromTo(sets[2], { yPercent: 100 }, { yPercent: 0 }, step)
      .fromTo(sets[2], { yPercent: 0 }, { yPercent: -100 }, step * 2).fromTo(sets[0], { yPercent: 100 }, { yPercent: 0 }, step * 2);
  };
  gsap.set(head.querySelector(".by-award"), { visibility: "hidden" });
  const startAwards = (delay) => { gsap.delayedCall(delay, function loop() { award(); gsap.delayedCall(90, loop); }); };

  // ───────── Header bar first appearance ─────────
  let introDone = false;
  const headIntro = (opts = {}) => {
    if (introDone) return;
    introDone = true;
    const lines = head.querySelectorAll(".by-logo .by-roll__in > span:first-child");
    const links = head.querySelectorAll(".by-nav .by-roll__in > span:first-child");
    const time = head.querySelectorAll(".by-time__label, .by-time [data-line] > span");
    const paths = head.querySelectorAll(".by-sign path");
    const circle = head.querySelector(".by-egg circle");
    const hand = head.querySelector('.by-egg [data-fx-part="hand"]');
    root.classList.remove("by-intro");
    if (reduce || opts.instant) { startAwards(5); return; }
    const handRot = Number(gsap.getProperty(hand, "rotation")) || 0;
    gsap.set([...lines, ...links, ...time], { yPercent: 100 });
    gsap.set(paths, { drawSVG: "0%" });
    gsap.set(circle, { drawSVG: "0%" });
    gsap.set(hand, { autoAlpha: 0, rotation: 0 });
    const sign = getComputedStyle(head.querySelector(".by-sign")).display !== "none";
    // The original unpacks the first four images and then the first entrance runs, so the award row arrives that much later (measured, it starts after the hand raise) — the placeholder has no waiting, so add 4s more
    const tl = gsap.timeline({ delay: opts.delay || 0, onComplete: () => startAwards(4.7) });
    tl.addLabel("logo", 0).to(lines, { yPercent: 0, duration: 1, stagger: 0.06, ease: "power2.out" }, "logo");
    if (sign) paths.forEach((p, i) => tl.to(p, { drawSVG: "100%", duration: i === 0 ? 1.3 : i === 1 ? 0.6 : 0.4, ease: "power1.inOut" }, i === 0 ? "logo+=0.225" : "-=0.15"));
    tl.addLabel("nav", sign ? "logo+=1.2" : "logo+=0.225")
      .to(links, { yPercent: 0, duration: 1, stagger: 0.06, ease: "power2.out" }, "nav")
      .to(time, { yPercent: 0, duration: 1, stagger: 0.06, ease: "power2.out" }, "<+=0.225")
      .to(circle, { drawSVG: "100%", duration: 1, ease: "power1.inOut" }, "<+=0.225")
      .to(hand, { autoAlpha: 1, rotation: handRot, duration: 1, ease: "power2.out" }, opts.handAt ?? "<");
    return tl;
  };

  // ───────── Menu — the panel wrapping the header line and body (.by-shell) shrinks to the first panel’s spot (28vw) in .8s power3.inOut, and the other panels slide in from the right at .06s intervals ─────────
  const shell = document.createElement("div");
  shell.className = "by-shell";
  document.body.insertBefore(shell, head);
  shell.append(head, ...document.querySelectorAll("body > main"));
  const tiles = [
    here !== "index.html" && { href: "index.html", kind: "cases", title: "Works", label: "Work list section name in English", labels: ["Work photo · portrait 4:5", "Work photo · portrait 4:5"] },
    { href: "#", kind: "archive", title: "Archive", label: "Archive English section name", labels: ["Work piece · Building", "Work piece · Print", "Work piece · Text"] },
    { href: "#", kind: "about", title: "About", label: "About English section name", labels: ["Portrait photo · seated on a chair · portrait 4:5"] },
  ].filter(Boolean);
  const menu = document.createElement("nav");
  menu.id = "by-menu";
  menu.className = "by-menu";
  menu.setAttribute("aria-label", "Page");
  menu.setAttribute("data-slot", "menu-tiles");
  // The first column is left empty — the current page (.by-shell) shrinks to .75x and is cropped to that column’s width as it settles in
  menu.innerHTML = `<div class="by-menu__row"><span class="by-tile is-slot" aria-hidden="true"></span>${tiles.map((t) => `<a class="by-tile" data-kind="${t.kind}" href="${t.href}"><span class="by-tile__head"><span>Here<br>Name</span>${SIGN}</span><span class="by-tile__title" data-label="${t.label}">${t.title}</span><span class="by-tile__body">${t.labels.map((l) => `<span class="by-ph" data-label="${l}"></span>`).join("")}</span></a>`).join("")}</div>`;
  document.body.append(menu);
  const menuBtn = head.querySelector("[data-menu]");
  const slot = menu.querySelector(".is-slot");
  const tileEls = [...menu.querySelectorAll(".by-tile:not(.is-slot)")];
  let menuOpen = false, menuTl = null;
  const setMenu = (open) => {
    if (open === menuOpen) return;
    menuOpen = open;
    menuBtn.setAttribute("aria-expanded", String(open));
    if (open) { setContact(false); lenis?.stop(); } else lenis?.start();
    if (open) {
      // Original: the page pivots on the screen center at .75x, crops the right side to leave only the first cell width (1s after a .2s delay), and other panels enter from 919px on the right over 1s
      const y = lenis ? lenis.animatedScroll : scrollY;
      const h = shell.offsetHeight, k = 0.75;
      const sr = slot.getBoundingClientRect();
      const keep = +((sr.width / k / innerWidth) * 100).toFixed(1);
      gsap.set(menu, { autoAlpha: 1 });
      gsap.set(shell, { transformOrigin: `50% ${y + innerHeight / 2}px` });
      menuTl?.kill();
      // The curve is the original h2wMorph(.46,0,.09,1) — measured, it ends around 1.2s and starts .1s late
      const clipOf = (keepPct) => (h <= innerHeight + 1
        ? `polygon(0% 0%, ${keepPct}% 0%, ${keepPct}% 100%, 0% 100%)`
        : `polygon(0% ${y}px, ${keepPct}% ${y}px, ${keepPct}% ${y + innerHeight}px, 0% ${y + innerHeight}px)`);
      menuTl = gsap.timeline({ defaults: { ease: morph } })
        .set(tileEls, { autoAlpha: 1 }, 0)
        .fromTo(tileEls, { x: 919 }, { x: 0, duration: reduce ? 0 : 1.2, stagger: reduce ? 0 : { amount: 0.05 } }, reduce ? 0 : 0.05)
        .fromTo(shell, { scale: 1, clipPath: clipOf(100) }, { scale: k, clipPath: clipOf(keep), duration: reduce ? 0 : 1.2 }, 0);
      shell.addEventListener("click", closeFromShell, { capture: true });
    } else if (menuTl) {
      shell.removeEventListener("click", closeFromShell, { capture: true });
      menuTl.eventCallback("onReverseComplete", () => { gsap.set(menu, { autoAlpha: 0 }); gsap.set(shell, { clearProps: "transform,clipPath,pointerEvents,transformOrigin" }); });
      menuTl.timeScale(1.4).reverse();
    }
  };
  const closeFromShell = (e) => { e.preventDefault(); e.stopPropagation(); setMenu(false); };
  gsap.set(menu, { autoAlpha: 0 });
  gsap.set(tileEls, { autoAlpha: 0 });
  menuBtn.addEventListener("click", () => setMenu(!menuOpen));
  // Clicking outside the panel (dark background) or the shrunken current page closes it
  menu.addEventListener("click", (e) => { if (!e.target.closest(".by-tile:not(.is-slot)")) setMenu(false); });
  tileEls.forEach((t) => t.addEventListener("click", (e) => { if (t.getAttribute("href") === "#") { e.preventDefault(); setMenu(false); } }));

  // ───────── Contact panel ─────────
  const contact = document.createElement("aside");
  contact.id = "by-contact";
  contact.className = "by-contact by-12";
  contact.setAttribute("data-slot", "contact-panel");
  contact.innerHTML = `<p class="by-40" data-label="Your one-line English greeting">Let us work together</p><a href="#">name@example.com</a><a href="#">Social 1</a><a href="#">Social 2</a>`;
  document.body.append(contact);
  const contactBtn = head.querySelector("[data-contact]");
  let contactOpen = false;
  const setContact = (open) => {
    if (open === contactOpen) return;
    contactOpen = open;
    contactBtn.setAttribute("aria-expanded", String(open));
    if (open) setMenu(false);
    gsap.to(contact, { autoAlpha: open ? 1 : 0, y: open ? 0 : -8, duration: reduce ? 0 : 0.4, ease: "power2.out", overwrite: true });
  };
  gsap.set(contact, { autoAlpha: 0, y: -8 });
  contactBtn.addEventListener("click", () => setContact(!contactOpen));
  addEventListener("keydown", (e) => { if (e.key === "Escape") { setMenu(false); setContact(false); } });

  window.by = { lenis, reduce, desktop, headIntro, head };
})();
