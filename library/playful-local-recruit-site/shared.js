// Drawn in once here so every page uses the same header·menu overlay·hidden consultation band·tag cloud·footer·art.
(() => {
  const page = document.body.dataset.page || "home";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) document.documentElement.classList.add("no-motion");
  gsap.registerPlugin(ScrollTrigger);

  // ── Redrawn artwork (stands in for the original illustration, same spot, size and feel) ──
  const ILL = {
    car: (c = "var(--site-orange-62)") => `<svg viewBox="0 0 120 64"><path d="M10 40c0-8 6-12 14-14l14-12c4-3 8-4 14-4h22c7 0 11 2 15 6l10 10c9 1 16 5 18 12v8c0 3-2 4-4 4H14c-3 0-4-2-4-4Z" style="fill: ${c}"/><path d="M42 16h16v12H32Zm22 0h12c4 0 6 1 9 4l7 8H64Z" style="fill: var(--site-blue-92)"/><circle cx="32" cy="50" r="10" style="fill: var(--kf-ink-soft)"/><circle cx="32" cy="50" r="4" style="fill: var(--site-gray-85)"/><circle cx="92" cy="50" r="10" style="fill: var(--kf-ink-soft)"/><circle cx="92" cy="50" r="4" style="fill: var(--site-gray-85)"/><rect x="104" y="34" width="8" height="5" rx="2" style="fill: var(--site-yellow-92)"/></svg>`,
    van: (c = "var(--site-cyan-71)") => `<svg viewBox="0 0 120 80"><path d="M14 22c0-8 5-12 12-12h50c8 0 13 3 18 9l12 16c3 4 4 8 4 12v14c0 3-2 5-5 5H17c-2 0-3-1-3-3Z" style="fill: ${c}"/><path d="M26 18h20v18H24Zm26 0h22v18H52Zm28 0h8c3 0 5 1 7 3l10 15H80Z" style="fill: var(--site-blue-95)"/><circle cx="36" cy="66" r="10" style="fill: var(--kf-ink-soft)"/><circle cx="36" cy="66" r="4" style="fill: var(--site-gray-85)"/><circle cx="92" cy="66" r="10" style="fill: var(--kf-ink-soft)"/><circle cx="92" cy="66" r="4" style="fill: var(--site-gray-85)"/></svg>`,
    cup: () => `<svg viewBox="0 0 80 56"><ellipse cx="38" cy="48" rx="34" ry="6" style="fill: var(--site-blue-46)"/><path d="M10 14h56c0 18-10 32-28 32S10 32 10 14Z" style="fill: var(--site-blue-54)"/><ellipse cx="38" cy="14" rx="28" ry="6" style="fill: var(--site-blue-36)"/><path d="M64 20c10 0 12 12 2 14" fill="none" stroke-width="5" style="stroke: var(--site-blue-54)"/></svg>`,
    tools: () => `<svg viewBox="0 0 90 90"><path d="M20 76 58 38" stroke-width="7" stroke-linecap="round" style="stroke: var(--site-gray-71)"/><path d="M58 38c-4-10 2-22 14-22l-6 9 4 6 8-3c2 12-8 20-20 10Z" style="fill: var(--site-gray-71)"/><path d="M30 20l34 44" stroke-width="8" stroke-linecap="round" style="stroke: var(--site-orange-62)"/><path d="M64 64l8 10" stroke-width="3" style="stroke: var(--site-gray-45)"/></svg>`,
    bag: () => `<svg viewBox="0 0 80 64"><rect x="6" y="16" width="68" height="44" rx="6" style="fill: var(--site-orange-53)"/><path d="M28 16v-6c0-3 2-5 5-5h14c3 0 5 2 5 5v6" fill="none" stroke-width="4" style="stroke: var(--site-orange-41)"/><rect x="6" y="30" width="68" height="4" style="fill: var(--site-orange-41)"/><rect x="35" y="27" width="10" height="10" rx="2" style="fill: var(--site-yellow-83)"/></svg>`,
    lipstick: () => `<svg viewBox="0 0 30 80"><rect x="6" y="40" width="18" height="38" rx="3" style="fill: var(--site-gray-29)"/><rect x="8" y="26" width="14" height="16" style="fill: var(--site-yellow-78)"/><path d="M9 26V12l12-8v22Z" style="fill: var(--site-red-58)"/></svg>`,
    watch: () => `<svg viewBox="0 0 60 80"><rect x="20" y="0" width="20" height="80" rx="6" style="fill: var(--site-orange-44)"/><circle cx="30" cy="40" r="17" style="fill: var(--site-yellow-78)"/><circle cx="30" cy="40" r="13" style="fill: var(--kf-surface)"/><path d="M30 31v9l6 4" stroke-width="2" fill="none" style="stroke: var(--kf-ink-soft)"/></svg>`,
    vase: () => `<svg viewBox="0 0 70 100"><path d="M24 58h22c4 10 6 18 4 28-2 8-8 12-15 12s-13-4-15-12c-2-10 0-18 4-28Z" style="fill: var(--site-blue-83)"/><path d="M35 58V30M35 44l-12-14M35 40l13-12" stroke-width="2.5" style="stroke: var(--site-green-65)"/><circle cx="35" cy="24" r="8" style="fill: var(--site-red-78)"/><circle cx="21" cy="28" r="7" style="fill: var(--site-yellow-88b)"/><circle cx="50" cy="26" r="7" style="fill: var(--site-orange-79)"/></svg>`,
    phone: () => `<svg viewBox="0 0 50 84"><rect x="4" y="2" width="42" height="80" rx="7" transform="rotate(14 25 42)" style="fill: var(--site-gray-71)"/><rect x="9" y="10" width="32" height="62" rx="3" transform="rotate(14 25 42)" style="fill: var(--site-gray-95b)"/></svg>`,
    key: () => `<svg viewBox="0 0 40 80"><rect x="6" y="2" width="28" height="34" rx="12" style="fill: var(--site-gray-29)"/><path d="M20 36v40M20 56h8M20 66h6" stroke-width="5" style="stroke: var(--site-gray-80)"/></svg>`,
    tire: () => `<svg viewBox="0 0 80 80"><circle cx="40" cy="40" r="38" style="fill: var(--site-gray-25)"/><circle cx="40" cy="40" r="22" style="fill: var(--site-gray-90b)"/><circle cx="40" cy="40" r="7" style="fill: var(--site-gray-71)"/><g stroke-width="4" style="stroke: var(--site-gray-71)"><path d="M40 20v12M40 48v12M20 40h12M48 40h12"/></g></svg>`,
    tent: () => `<svg viewBox="0 0 90 70"><path d="M45 4 4 66h82Z" style="fill: var(--site-yellow-78b)"/><path d="M45 4 34 66h22Z" style="fill: var(--site-yellow-65)"/><path d="M0 66h90" stroke-width="3" style="stroke: var(--site-yellow-51)"/></svg>`,
    pin: () => `<svg viewBox="0 0 24 32"><path d="M12 31S2 19 2 12a10 10 0 1 1 20 0c0 7-10 19-10 19Z" style="fill: var(--kf-accent)"/><circle cx="12" cy="12" r="4" style="fill: var(--kf-surface)"/></svg>`,
    loupe: () => `<svg viewBox="0 0 70 70"><circle cx="28" cy="28" r="20" stroke-width="5" style="fill: var(--site-gray-96); stroke: var(--site-gray-71)"/><path d="M43 43l22 22" stroke-width="8" stroke-linecap="round" style="stroke: var(--site-orange-44)"/></svg>`,
    person: (c = "var(--kf-accent)", s = "var(--site-navy)") => `<svg viewBox="0 0 40 100"><circle cx="20" cy="12" r="9" style="fill: var(--site-orange-86)"/><path d="M14 6c2-5 12-5 14 2-4-2-9-2-14-2Z" style="fill: var(--site-gray-29)"/><path d="M8 26c0-3 3-5 6-5h12c3 0 6 2 6 5v30H8Z" style="fill: ${c}"/><path d="M10 56h20l-2 40h-6l-2-30-2 30h-6Z" style="fill: ${s}"/></svg>`,
    runner: () => `<svg viewBox="0 0 60 90"><circle cx="34" cy="10" r="8" style="fill: var(--site-orange-86)"/><path d="M26 22l14 2 4 22-10 2Z" style="fill: var(--site-yellow-92b)"/><path d="M28 24 14 38M42 26l12 14" stroke-width="5" stroke-linecap="round" style="stroke: var(--site-orange-86)"/><path d="M34 48 22 70l-12 4M36 48l10 18 10 2" stroke-width="6" stroke-linecap="round" fill="none" style="stroke: var(--site-navy)"/></svg>`,
    girl: () => `<svg viewBox="0 0 40 80"><circle cx="20" cy="12" r="9" style="fill: var(--site-orange-86)"/><path d="M10 14c0-12 20-12 20 0v10H10Z" style="fill: var(--site-orange-30)"/><path d="M8 28c0-3 3-5 6-5h12c3 0 6 2 6 5v24H8Z" style="fill: var(--kf-surface); stroke: var(--site-gray-71)"/><path d="M10 52h20l-2 26h-16Z" style="fill: var(--site-navy)"/></svg>`,
    faq: () => `<svg viewBox="0 0 40 40"><circle cx="20" cy="16" r="9" style="fill: var(--site-orange-86)"/><path d="M8 40c0-8 5-14 12-14s12 6 12 14Z" style="fill: var(--site-navy)"/><circle cx="32" cy="8" r="7" style="fill: var(--kf-accent-soft)"/><text x="32" y="12" font-size="10" text-anchor="middle" font-weight="700" style="fill: var(--kf-surface)">?</text></svg>`,
    memo: () => `<svg viewBox="0 0 40 40"><rect x="8" y="4" width="26" height="32" rx="3" transform="rotate(-8 20 20)" style="fill: var(--site-blue-92)"/><path d="M13 14h16M13 20h16M13 26h10" stroke-width="2" transform="rotate(-8 20 20)" style="stroke: var(--site-blue)"/></svg>`,
    finger: () => `<svg viewBox="0 0 20 32"><path d="M8 30V10c0-4 4-4 4 0v8l4 1c2 1 2 3 2 5v6Z" style="fill: var(--site-orange-82)"/></svg>`,
  };
  window.crIll = ILL;
  const fillIll = (root = document) => root.querySelectorAll("[data-ill]").forEach((el) => {
    const [name, ...args] = el.dataset.ill.split(":");
    if (ILL[name]) el.innerHTML = ILL[name](...args);
  });

  const LOGO = `<svg class="cr-logo-svg" viewBox="0 0 134 150" fill="currentColor" aria-label="Logo"><text x="2" y="36" font-size="38" font-weight="800" letter-spacing="2">Logo Logo</text><text x="2" y="62" font-size="19" font-weight="800">Recruit PJ</text><rect x="2" y="74" width="34" height="18" rx="3" style="fill: var(--kf-line)"/><rect x="48" y="72" width="22" height="34" rx="3" style="fill: var(--kf-accent)"/><rect x="82" y="74" width="34" height="18" rx="3" style="fill: var(--kf-line)"/><text x="6" y="118" font-size="13" font-weight="800" style="fill: var(--kf-accent)">AB</text><text x="2" y="134" font-size="10.5" font-weight="800" font-family="Josefin Sans, sans-serif">YOUR COMPANY NAME</text><text x="2" y="148" font-size="10.5" font-weight="800" font-family="Josefin Sans, sans-serif">RECRUIT PROJECT</text></svg>`;
  const TAGS = ["#Play", "#Hiring project", "#About the Company", "#Fulfillment", "#JobType", "#Growing a career", "#Role model", "#Work Environment", "#Roundtable", "#FAQ", "#Internship", "#Hiring Flow", "#Sales Staff", "#Gallery Staff", "#Telecom store staff", "#Service engineer", "#Store 1", "#Store 2", "#Store 3", "#Store 4", "#Store 5", "#Store 6", "#Store 7", "#Store 8", "#Store 9", "#Store 10", "#Store 11", "#Store 12", "#Store 13", "#Store 14", "#Headquarters"];
  const DECO = "YOUR COMPANY NAME RECRUIT PROJECT";
  const decoLine = () => `<p class="cr-deco__t" aria-hidden="true">${[...DECO].map((c) => `<i>${c === " " ? "&nbsp;" : c}</i>`).join("")}</p>`;

  // ── Header ──
  const head = document.createElement("div");
  head.innerHTML = `
    <div class="cr-deco" data-slot="deco-title"><div class="cr-deco__track" data-deco>${decoLine().repeat(6)}</div></div>
    <a class="cr-logo" href="index.html">${LOGO}</a>
    <button class="cr-menu" type="button" aria-label="Menu" aria-expanded="false"><i></i><i></i><i></i></button>
    <nav class="cr-side"><a class="is-entry" href="process.html">Entry <svg viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M2 8 8 2M3 2h5v5"/></svg></a><a class="is-consult" href="#consult">Want to chat?</a></nav>
    <div class="cr-nav" data-slot="menu-overlay" data-lenis-prevent><span class="cr-nav__backdrop"></span><div class="cr-nav__ui"><span class="cr-nav__bg"></span><button class="cr-nav__close" type="button" aria-label="Close"><i></i><i></i></button>
      <div class="cr-nav__in">
        <div class="cr-nav__brand">${LOGO}<p class="cr-nav__vert">${DECO}</p></div>
        <div class="cr-nav__grp is-menu"><h3>Menu</h3><div class="cr-nav__menu">
          <a href="index.html">First Page</a><a href="project.html">About Our Hiring</a><a href="about.html">This is who we are</a><a href="index.html#workstyle">How we work and what rewards it</a>
          <a class="is-sub" href="index.html#workstyle">Job Type Map</a><a class="is-sub" href="index.html#workstyle">Work and daily schedule</a><a class="is-sub" href="index.html#workstyle">Experienced application</a>
          <a href="index.html#rolemodel">Role model</a><a href="index.html#map">Workplace and environment</a><a href="list.html">Play News</a><a href="index.html#discussion">Roundtable</a><a href="#">Frequently asked questions</a><a href="#">Internship</a><a href="process.html">Hiring Process</a><a href="index.html#consult">Private consultation</a><a href="#">Apply</a><a href="#">Privacy processing</a>
        </div></div>
        <div class="cr-nav__grp is-tags"><h3>Tag</h3><div class="cr-nav__tags">${TAGS.map((t) => `<a href="list.html">${t}</a>`).join("")}</div></div>
      </div>
    </div></div>`;
  document.body.prepend(...head.children);

  // ── Hidden consult strip ──
  document.querySelectorAll('[data-slot="consult"]').forEach((el) => {
    el.id = "consult";
    el.classList.add("consult");
    el.innerHTML = `<span class="wf-note">Secret consultation · sky-blue polka-dot pill panel + vertical handwritten speech bubble + female staff illustration</span>
      <div class="consult__box"><p class="consult__bubble">Private consultation<br>Want to try?</p>
        <div class="consult__btns"><a class="obtn" href="#">Request a specific staff member</a><a class="obtn" href="#">Ask a question</a></div></div>
      <span class="ill is-girl" data-ill="girl" data-speed="0.9"></span>
      <p class="big">CONSULT ONLY HERE</p>`;
  });
  // ── Tag Cloud ──
  document.querySelectorAll('[data-slot="tags"]').forEach((el) => {
    el.classList.add("tags");
    el.innerHTML = `<span class="dotc" style="width:120px;height:120px;left:6%;top:18%" data-speed="0.8"></span>
      <span class="dotc" style="width:70px;height:70px;right:10%;top:30%" data-speed="1.2"></span>
      <span class="dotc" style="width:150px;height:150px;right:4%;bottom:6%" data-speed="0.85"></span>
      <div class="wrap"><span class="ill" data-ill="van" style="width:90px;left:-10px;top:-80px" data-speed="0.92"></span>
      <p class="tags__label">Tag</p><div class="tags__list">${TAGS.map((t) => `<a href="list.html">${t}</a>`).join("")}</div></div>`;
  });
  // ── Footer ──
  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.classList.add("cr-foot");
    const q = Array.from({ length: 7 }, (_, i) => `<circle cx="${8 + i * 14}%" cy="${20 + ((i * 37) % 60)}%" r="${14 + (i % 3) * 6}" opacity=".8" style="fill: var(--site-yellow-92bb)"/><text x="${8 + i * 14}%" y="${22 + ((i * 37) % 60)}%" font-size="14" text-anchor="middle" font-weight="700" style="fill: var(--kf-surface)">?</text>`).join("");
    const tri = Array.from({ length: 9 }, (_, i) => `<path d="M0 -8 7 6H-7Z" transform="translate(${30 + ((i * 97) % 640)} ${30 + ((i * 53) % 220)}) rotate(${i * 40})" style="fill: var(--site-red-81)"/>`).join("");
    foot.innerHTML = `
      <div class="cr-foot__navi" data-slot="footer-navi">
        <a class="fnb" href="#"><svg class="fnb__pat" preserveAspectRatio="none">${q}</svg><span class="fnb__card"><span data-ill="faq"></span><span><b>Frequently asked questions</b><small>FAQ</small></span></span></a>
        <a class="fnb" href="#" style="background:var(--site-gray-93)"><svg class="fnb__pat" viewBox="0 0 720 278" preserveAspectRatio="xMidYMid slice">${tri}</svg><span class="fnb__card"><span data-ill="memo"></span><span><b>Internship</b><small>Internship</small></span></span></a>
      </div>
      <div class="cr-foot__proc" data-slot="footer-process">
        <div class="cr-foot__proc-in">
          <p class="cr-foot__proc-label"><b>Hiring Process</b><small>Recruitment<br>process</small></p>
          <div class="fpi"><a href="process.html"><b>Newcomer</b><small>New<br>graduate</small></a><i></i></div>
          <div class="fpi"><a href="process.html"><b>Career</b><small>Mid-career<br>recruit</small></a><i></i></div>
        </div>
      </div>
      <div class="cr-foot__bottom"><div class="cr-deco__track" data-deco>${decoLine().repeat(6)}</div><p class="cr-foot__copy">© YOUR COMPANY NAME CO., LTD.</p><a class="cr-foot__top" href="#" data-ill="finger" aria-label="Back to top"></a></div>`;
  }
  fillIll();

  // ── Smooth scroll ──
  let lenis = null;
  if (!reduce && window.Lenis) {
    // Original LenisService — duration 1.2 · expo curve · ScrollTrigger refresh · gsap ticker
    lenis = new Lenis({ duration: 1.2, easing: (e) => Math.min(1, 1.001 - Math.pow(2, -10 * e)), smoothWheel: true, autoResize: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  document.querySelector(".cr-foot__top")?.addEventListener("click", (e) => { e.preventDefault(); lenis ? lenis.scrollTo(0) : scrollTo(0, 0); });

  // ── Menu cover: an orange circle spreads from the menu circle’s spot ──
  const btn = document.querySelector(".cr-menu");
  const nav = document.querySelector(".cr-nav");
  // Original OverlayService · OverlayUi — on press the CDK overlay attaches (transparent backdrop .4s cubic-bezier(.25,.8,.25,1)), and 300ms later on the next frame an orange background
  // Descends from height 0 with .6s power4.out, and the menu content opens the same way .3s later. On close the cover is removed immediately. The menu button stays as is
  const navBg = nav.querySelector(".cr-nav__bg"), navIn = nav.querySelector(".cr-nav__in");
  let showTimer = 0;
  const setNav = (open) => {
    btn.classList.toggle("is-open", open);
    btn.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("is-open", open);
    clearTimeout(showTimer);
    gsap.killTweensOf([navBg, navIn]);
    gsap.set([navBg, navIn], { clearProps: "all" });
    if (open) {
      lenis && lenis.stop();
      showTimer = setTimeout(() => requestAnimationFrame(() => {
        if (reduce) return gsap.set([navBg, navIn], { visibility: "visible" });
        // Same order and values as the original show() — build the content tween (.3s later) first and the background afterward
        gsap.to(navIn, { visibility: "visible", delay: 0.3, immediateRender: false });
        gsap.from(navIn, { height: 0, duration: 0.6, ease: "power4.out", delay: 0.3, onComplete: () => gsap.set(navIn, { height: "" }) });
        gsap.set(navBg, { visibility: "visible" });
        gsap.from(navBg, { height: 0, duration: 0.6, ease: "power4.out", onComplete: () => gsap.set(navBg, { height: "" }) });
      }), 300);
    } else lenis && lenis.start();
  };
  btn.addEventListener("click", () => setNav(!nav.classList.contains("is-open")));
  nav.querySelector(".cr-nav__close")?.addEventListener("click", () => setNav(false));
  nav.querySelector(".cr-nav__backdrop")?.addEventListener("click", () => setNav(false));

  // ── page transition: original Angular fadeAnimation — the head (logo · menu · text band) stays, the outgoing page (body · footer) disappears with .6s ease, then
  //    The next page waits .2s, then appears in .6s ease (the appearance is cr-page-in in shared.css, and it runs on first load too) ──
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || e.metaKey || e.ctrlKey) return;
    const href = a.getAttribute("href");
    if (!/^[a-z]+\.html/.test(href)) return;
    e.preventDefault();
    const page = [...document.querySelectorAll("body > main, body > footer")];
    if (reduce || !page.length) return void (location.href = href);
    let left = page.length;
    page.forEach((el) => {
      el.getAnimations().forEach((x) => x.cancel());
      el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 600, easing: "ease", fill: "forwards" }).onfinish = () => { if (--left === 0) location.href = href; };
    });
  });
  // Restore a page revived via the back button (bfcache) so it doesn’t stay hidden
  addEventListener("pageshow", (e) => { if (e.persisted) document.querySelectorAll("body > main, body > footer").forEach((el) => el.getAnimations().forEach((x) => x.cancel())); });

  // ── Text band: original DecorationTitle — flows over 80s, appears after 1s, paints each letter randomly in one of five colors (orange · yellow · two grays · white), then
  //    All change to different random colors in .2s (in random order at .02 intervals), repeating endlessly ──
  document.querySelectorAll("[data-deco]").forEach((t) => {
    if (!reduce) gsap.fromTo(t, { xPercent: 0 }, { xPercent: -50, duration: 80, ease: "none", repeat: -1 });
  });
  const decoColors = ["--kf-accent", "--site-deco-yellow", "--kf-line", "--site-deco-gray", "--kf-surface"].map((v) => {
    const probe = document.createElement("i");
    probe.style.color = `var(${v})`;
    document.body.append(probe);
    const c = getComputedStyle(probe).color;
    probe.remove();
    return c;
  });
  document.querySelectorAll(".cr-deco__t").forEach((line) => {
    const letters = [...line.querySelectorAll("i")].filter((i) => i.textContent.trim());
    letters.forEach((i) => gsap.set(i, { color: gsap.utils.random(decoColors) }));
    if (reduce) return;
    const cycle = () => gsap.to(letters, { color: () => gsap.utils.random(decoColors), duration: 0.2, stagger: { each: 0.02, from: "random" }, onComplete: cycle });
    gsap.delayedCall(1, () => { gsap.set(line, { visibility: "visible" }); cycle(); });
  });

  // English title — no motion like the original, only the first letter of each word turns orange
  document.querySelectorAll(".ttl__en").forEach((el) => {
    el.innerHTML = el.textContent.split(" ").map((w) => (w ? `<i class="is-o">${w[0]}</i>${w.slice(1)}` : w)).join(" ");
  });

  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    // Original parallax: s = (screen height + height) × (1 - speed), ties y to scroll from -s/2 to s/2
    document.querySelectorAll("[data-speed]").forEach((n) => {
      const r = parseFloat(n.dataset.speed || "1");
      if (r === 1) return;
      const s = () => (innerHeight + n.offsetHeight) * (1 - r);
      gsap.fromTo(n, { y: () => -s() / 2 }, { y: () => s() / 2, ease: "none", scrollTrigger: { trigger: n, start: "top bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true } });
    });
    // Speech bubble pop-out (original voiceFukidashi): opacity 0, y30, scale 0 → back.out(1.6) .6s, ”bottom 80%”
    document.querySelectorAll("[data-pop]").forEach((el) => {
      gsap.fromTo(el, { opacity: 0, y: 30, scale: 0, transformOrigin: "50% 100%" }, { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "back.out(1.6)", scrollTrigger: { trigger: el, start: "bottom 80%" } });
    });
    // Magnifier (home·company about) — lying 90° around the bottom-right pivot, it stands up from off the right edge in .6s power3.out
    document.querySelectorAll("[data-loupe]").forEach((el) => gsap.fromTo(el, { x: "100%", rotate: 90, transformOrigin: "100% 100%" }, { x: 0, rotate: 0, duration: 0.6, ease: "power3.out", scrollTrigger: { trigger: el, start: "bottom 80%" } }));
    // Project vase — 1s power3.out from 30px below
    document.querySelectorAll("[data-rise]").forEach((el) => gsap.fromTo(el, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1, ease: "power3.out", scrollTrigger: { trigger: el, start: "bottom 80%" } }));
  });
  addEventListener("load", () => ScrollTrigger.refresh());
})();
