// Common to all pages: draws header·footer·phone menu in one place and sets up Lenis (original 1.3.25 · lerp .13), grid scale, top progress line, intro, now-playing line, mail copy.
// Original values: reveal 24px 500ms ease-out · letter reveal 25ms stagger .25s · line while playing 26px/s · menu panel 500ms cubic-bezier(.16,1,.55,1)
(() => {
  const root = document.documentElement;
  const page = document.body.dataset.page || "home";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const AM = (window.AM = { reduce, lenis: null });

  // 1 at 1440, grows when wider and shrinks when narrower (down to 1024). Text gets only .7 of that difference
  const fit = () => {
    const gs = innerWidth >= 1024 ? innerWidth / 1440 : 1;
    root.style.setProperty("--gs", gs.toFixed(4));
    root.style.setProperty("--s", (1 + (gs - 1) * 0.7).toFixed(4));
  };
  fit();
  addEventListener("resize", fit);

  const cur = (p) => (p === page ? ' aria-current="page"' : "");
  const navItems = [["home", "index.html", "Projects"], ["about", "about.html", "About"], ["studies", "studies.html", "Studies"], ["contact", "contact.html", "Contact"]];
  const nav = navItems.map(([p, href, t]) => (p === page ? `<span aria-current="page">${t}</span>` : `<a href="${href}"${cur(p)}>${t}</a>`)).join("<span>,</span>");
  // Our placeholder emblem in the same spot and size instead of the original round emblem (circle + two chevrons)
  const mark = '<svg viewBox="0 0 52 52" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><circle cx="26" cy="26" r="24.5"/><path d="M14 36 22 16l4 10M26 26l4-10 8 20"/></svg>';
  AM.mark = mark;

  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.classList.add("am-head");
    head.innerHTML = `
      <a class="am-head__mark am-fade" href="index.html" data-label="Company English name">Studio Name Inc.</a>
      <nav class="am-head__nav am-fade" aria-label="Main menu">${nav}</nav>
      <div class="am-head__play am-fade">
        <b>Playing</b>
        <a class="am-ticker" href="#" data-label="Now playing · artist name (English)"><span class="am-ticker__run"><span data-chars>Song Title, Artist Name - Track Name - Album Version</span><span aria-hidden="true">Song Title, Artist Name - Track Name - Album Version</span></span></a>
      </div>`;
  }

  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.classList.add("am-foot");
    foot.innerHTML = `
      <p class="am-foot__copy" data-label="Copyright year · company name in English">©2026<br>Studio Name Inc.</p>
      <div class="am-foot__cols">
        <div><span class="am-mono">Inquiries</span><button class="am-copy" type="button" data-copy="info@example.jp"><span class="am-u" data-fx="relay-underline-hover" data-fx-relay-underline-hover="look: slide">info@example.jp</span></button></div>
        <div><span class="am-mono">Social</span><span><a href="#"><span class="am-u" data-fx="relay-underline-hover" data-fx-relay-underline-hover="look: slide">Instagram</span></a> , <a href="#"><span class="am-u" data-fx="relay-underline-hover" data-fx-relay-underline-hover="look: slide">X</span></a></span></div>
      </div>
      <button class="am-foot__top" type="button" data-top><span class="am-u" data-fx="relay-underline-hover" data-fx-relay-underline-hover="look: slide">Back to top</span></button>
      <a class="am-foot__mark" href="index.html" aria-label="Home">${mark}</a>`;
  }

  // Phone: bottom pill ”Menu” → black panel (menu, contact, social, logo mark, back to top)
  const pill = document.createElement("button");
  pill.className = "am-pill";
  pill.type = "button";
  pill.textContent = "Menu";
  const sheet = document.createElement("div");
  sheet.className = "am-sheet";
  sheet.setAttribute("aria-hidden", "true");
  sheet.innerHTML = `
    <nav class="am-sheet__nav" aria-label="Phone menu">${nav}</nav>
    <div class="am-sheet__row"><div><span class="am-mono">Inquiries</span><button class="am-copy" type="button" data-copy="info@example.jp">info@example.jp</button></div><div><span class="am-mono">Social</span><a href="#">Instagram</a> , <a href="#">X</a></div></div>
    <div class="am-sheet__copy"><p>©2026<br>Studio Name Inc.</p>${mark}</div>
    <button class="am-sheet__top" type="button" data-top>Back to Top</button>`;
  document.body.append(sheet, pill);
  const openSheet = (on) => { root.classList.toggle("am-open", on); sheet.setAttribute("aria-hidden", on ? "false" : "true"); };
  pill.addEventListener("click", () => openSheet(true));
  document.addEventListener("click", (e) => { if (root.classList.contains("am-open") && !sheet.contains(e.target) && e.target !== pill) openSheet(false); });

  const bar = document.createElement("i");
  bar.className = "am-progress";
  bar.setAttribute("aria-hidden", "true");
  if (document.body.dataset.progress !== "off") document.body.append(bar);

  // Smooth scroll — original Lenis 1.3.25, lerp .13
  if (!reduce && window.Lenis && document.body.dataset.scroll !== "off") {
    const lenis = new Lenis({ lerp: 0.13, autoRaf: false });
    AM.lenis = lenis;
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    if (window.ScrollTrigger) lenis.on("scroll", ScrollTrigger.update);
  }
  const progress = () => {
    const room = root.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${room > 0 ? Math.min(1, scrollY / room) : 0})`;
    foot?.classList.toggle("is-ready", reduce || room - scrollY <= 100);
  };
  addEventListener("scroll", progress, { passive: true });
  progress();

  document.addEventListener("click", (e) => {
    const top = e.target.closest("[data-top]");
    if (top) { openSheet(false); AM.lenis ? AM.lenis.scrollTo(0) : scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }); }
    const copy = e.target.closest("[data-copy]");
    if (copy) {
      navigator.clipboard?.writeText(copy.dataset.copy).catch(() => {});
      // Attach a new speech bubble centered 10px above the button, float it up from 8px below over .25s ease-out, and remove it right after 1.5s
      document.querySelector(".am-copied")?.remove();
      clearTimeout(AM.copyT);
      const r = copy.getBoundingClientRect(), tip = document.createElement("span");
      tip.className = "am-copied";
      tip.setAttribute("role", "status");
      tip.textContent = "Copied";
      tip.style.left = `${r.left + r.width / 2}px`;
      tip.style.top = `${r.top - 10}px`;
      document.body.append(tip);
      if (!reduce) tip.animate([{ opacity: 0, transform: "translate(-50%, calc(-100% + 8px))" }, { opacity: 1, transform: "translate(-50%, -100%)" }], { duration: 250, easing: "ease-out" });
      AM.copyT = setTimeout(() => tip.remove(), 1500);
    }
  });

  // Line while playing: each character appears 25ms later from 2px left in .25s, and flows one set width at 26px/s
  document.querySelectorAll("[data-chars]").forEach((n) => {
    const txt = n.textContent;
    n.textContent = "";
    [...txt].forEach((c, i) => {
      const s = document.createElement("span");
      s.className = "am-char";
      s.style.animationDelay = `${i * 25}ms`;
      s.textContent = c === " " ? " " : c;
      n.append(s);
    });
  });
  const tick = () => document.querySelectorAll(".am-ticker__run").forEach((run) => {
    const one = run.firstElementChild?.getBoundingClientRect().width || 0;
    run.style.setProperty("--am-run", `${one + 32}px`);
    run.style.setProperty("--am-tick", `${((one + 32) / 26).toFixed(2)}s`);
  });
  document.fonts?.ready.then(tick);
  tick();

  // Entrance: when in view, add .is-in after data-delay (ms)
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    io.unobserve(e.target);
    const d = reduce ? 0 : +(e.target.dataset.delay || 0);
    setTimeout(() => { e.target.classList.add("is-in"); e.target.dispatchEvent(new CustomEvent("am:in")); }, d);
  }));
  AM.watch = (scope = document) => scope.querySelectorAll(".am-rise, .am-fade, .am-lines").forEach((n) => io.observe(n));
  AM.watch();
})();
