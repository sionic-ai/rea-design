// Plugs in the header bar, entry sections and footer of every page, and hooks up lenis smooth scroll, header bar that hides on scroll down, English title letter rise, float-up and back-to-top.
// Original common.js — lenis 1.3.3 defaults (new Lenis() + raf), scroll direction is re-measured every 10 scrolls and the header is hidden when scrolling down more than 30px,
// Appears when it reaches 95% down the screen, letters staggered 50ms, and only after scrolling more than 500px from the very top
(() => {
  const arrow = '<i class="r-arrow" aria-hidden="true"></i>';
  const mark = '<svg viewBox="0 0 22 26" aria-hidden="true"><path d="M11 1l9 7v10l-9 7-9-7V8z" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M11 7l4 3v6l-4 3-4-3v-6z" style="fill:var(--kf-accent)"/></svg>';
  const links = [["#", "Internalization challenge"], ["about.html", "Company About"], ["#", "People at work"], ["about.html", "Career"], ["page.html", "Work environment"], ["#", "Hiring Info"]];
  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.className = "r-head";
    head.innerHTML = `
      <a class="r-logo" href="index.html"><span class="r-logo__mark">${mark}Bank name<span class="r-en">Bank Name</span></span><span class="r-logo__site">IT·digital talent recruiting site</span></a>
      <a class="r-entry r-sp-entry" href="#"><span style="position:relative">Entry</span></a>
      <button class="r-menu-btn" type="button" aria-label="Menu" aria-expanded="false"><i></i><i></i><i></i></button>
      <nav class="r-nav" aria-label="Site Menu">
        <ul>${links.map(([h, t]) => `<li><a href="${h}">${t}</a></li>`).join("")}</ul>
        <a class="r-entry" href="#"><span style="position:relative">Entry</span>${arrow}</a>
      </nav>`;
  }
  const cta = document.querySelector('[data-slot="cta"]');
  if (cta) {
    cta.className = "r-cta r-dots";
    cta.innerHTML = `
      <a class="r-entry-band r-fade" href="#"><span class="r-en">Entry</span><b>Entry / Open positions</b><small>A one-liner like ”Making this company more fun together.”</small>${arrow}</a>
      <div class="r-tiles r-fade"><a class="r-tile" href="#">Selection Flow<span class="r-go">${arrow}</span></a><a class="r-tile" href="#">Frequently asked questions<span class="r-go">${arrow}</span></a></div>`;
  }
  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.className = "r-foot r-dots";
    const col = (t, items) => `<div><b>${t}</b>${items.map((i) => `<a href="#">${i}</a>`).join("")}</div>`;
    foot.innerHTML = `
      <span class="r-foot__mark r-en r-rise" data-label="Large English slogan">Redesign Banking</span>
      <div class="r-foot__top"><a class="r-logo" href="index.html"><span class="r-logo__mark">${mark}Bank name<span class="r-en">Bank Name</span></span><span class="r-logo__site">IT·digital talent recruiting site</span></a>
        <div class="r-foot__sns"><a href="#" aria-label="SNS 1"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3l14 14M17 3L3 17"/></svg></a><a href="#" aria-label="SNS 2"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="16" height="16" rx="5"/><circle cx="10" cy="10" r="3.5"/></svg></a></div></div>
      <div class="r-foot__map">
        ${col("Internalization challenge", ["Building a new dev team", "Tech Stack", "Development Environment"])}
        ${col("Company About", ["Key message", "The company through staff eyes", "Vision", "Company in Numbers"])}
        ${col("People at work", ["Engineer 1", "Engineer 2", "Designer"])}
        ${col("Career", ["Career support program", "HR Policy"])}
        ${col("Work environment", ["Employee benefits", "Diversity", "Workspace"])}
        ${col("Hiring Info", ["Job type", "Selection Flow", "Frequently asked questions"])}
      </div>
      <div class="r-foot__bottom"><ul><li><a href="#">Site Guide</a></li><li><a href="#">Privacy policy</a></li><li><a href="#">Social media policy</a></li><li><a href="#">Company Website</a></li></ul><small class="r-en" style="text-transform:none">© Bank Name, Ltd.</small></div>`;
    const top = document.createElement("a");
    top.className = "r-pagetop";
    top.href = "#top";
    top.setAttribute("aria-label", "Back to top");
    top.innerHTML = '<svg viewBox="0 0 18 20" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 19V2M2 9l7-7 7 7"/></svg>';
    document.body.append(top);
  }

  // Link text roll — as in the original, text goes in data-txt and the height is fit to one line (the ::after rises from beneath it)
  const rolls = [...document.querySelectorAll(".r-logo__site, .r-nav ul a, .r-foot__map a, .r-foot__bottom a, .r-bread a, .dt-ext, .dt__toc a")];
  rolls.forEach((el) => { el.dataset.txt = el.textContent.trim(); el.innerHTML = `<span>${el.innerHTML}</span>`; });
  const rollH = () => rolls.forEach((el) => { el.style.height = `${el.firstElementChild.offsetHeight}px`; });
  rollH();
  addEventListener("load", rollH);
  addEventListener("resize", rollH);

  // Splits big English titles into letters — words stay whole and spaces between stay as is (so line breaks don’t split inside a word)
  document.querySelectorAll(".r-rise").forEach((el) => {
    let n = 0;
    // <br> Lines split by br are kept as is and words are split per line (the original also keeps br) — letter order continues across lines
    const lines = el.innerHTML.split(/<br\s*\/?>/i).map((h) => { const t = document.createElement("i"); t.innerHTML = h; return t.textContent.trim(); });
    el.setAttribute("aria-label", lines.join(" "));
    el.innerHTML = lines.map((line) => line.split(/\s+/).filter(Boolean).map((w) => `<span class="r-rise__w" aria-hidden="true">${[...w].map((c) => `<span class="r-rise__c" style="transition-delay:${(n++) * 0.05}s">${c}</span>`).join("")}</span>`).join(" ")).join("<br>");
  });

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const io = new IntersectionObserver((list) => {
    for (const e of list) if (e.isIntersecting) { e.target.classList.add("is-done"); io.unobserve(e.target); }
  }, { rootMargin: "0px 0px -5% 0px" });
  document.querySelectorAll(".r-rise, .r-fade, .r-zoom").forEach((el) => (reduce ? el.classList.add("is-done") : io.observe(el)));

  // Phone menu
  const btn = document.querySelector(".r-menu-btn");
  const ul = document.querySelector(".r-nav ul");
  let menuOpen = false;
  btn?.addEventListener("click", () => {
    menuOpen = !menuOpen;
    btn.classList.toggle("is-on", menuOpen);
    btn.setAttribute("aria-expanded", String(menuOpen));
    ul?.classList.toggle("is-open", menuOpen);
  });

  // Smooth scroll — same lenis 1.3.3 defaults as the original
  let lenis = null;
  if (window.Lenis && !reduce) {
    lenis = new Lenis();
    window.siteLenis = lenis;
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    const id = a?.getAttribute("href");
    if (!id || id === "#") return;
    const to = id === "#top" ? 0 : document.querySelector(id);
    if (to == null) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(to, { offset: -(document.querySelector(".r-head")?.offsetHeight || 0) });
    else scrollTo({ top: to === 0 ? 0 : to.getBoundingClientRect().top + scrollY, behavior: "smooth" });
  });

  // Scroll direction: re-measured every 10 scrolls, and the header row hides if scrolling down more than 30px
  const root = document.documentElement;
  const pagetop = document.querySelector(".r-pagetop");
  let prev = 0, down = false, count = 10;
  const onScroll = () => {
    const y = scrollY;
    if (count <= 0) { down = y > prev; count = 10; prev = y; } else count--;
    root.classList.toggle("is-scrolling-down", down && y > 30 && !menuOpen);
    pagetop?.classList.toggle("is-show", y > 500);
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();
