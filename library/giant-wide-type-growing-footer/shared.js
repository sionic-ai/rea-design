/* Shared by the five pages — nav (wordmark · pill menu · fly clock) and section color following, mobile menu, footer · post footer, title word entrance, selected-text color. 
   Original figures: the section panel color is read live at the screen center and just below the nav bar and switched instantly · the nav comes down after 1.4s over .8s power4.out (first four pages) ·
   Title words rise from 1em below, .8s power4.out, .2s stagger in total (when the top passes 70% of the screen, resets to the start when scrolled back up) */
(() => {
  const PAGES = [
    { href: "works.html", label: "Works" },
    { href: "approach.html", label: "Approach" },
    { href: "about.html", label: "About" },
    { href: "about.html#contact", label: "Contact" },
  ];
  const page = document.body.dataset.page;
  const here = `${page === "home" ? "index" : page}.html`;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  gsap.registerPlugin(ScrollTrigger, SplitText);
  // The original Webflow interactions (IX3) start after the document becomes complete — the copy’s same motions are attached then too
  const whenComplete = (fn) => (document.readyState === "complete" ? fn() : addEventListener("load", fn, { once: true }));

  /* ── Nav ── */
  const nav = document.querySelector('[data-slot="nav"]');
  if (nav) {
    nav.className = "lr-nav";
    nav.innerHTML = `
      <div class="lr-nav__bar">
        <a class="lr-nav__logo" href="index.html" aria-label="Back to start" data-label="Your brand English wordmark here">LOGO</a>
        <nav class="lr-nav__links" aria-label="Main menu" data-label="Your English menu name here">${PAGES.map((p) => `<a class="lr-nav__link" href="${p.href}"${p.href === here ? ' aria-current="page"' : ""}>${p.label}</a>`).join("")}</nav>
        <div class="lr-nav__clock"><span data-clock>-- : --</span><span data-label="Your office city English name here">City</span></div>
        <button class="lr-nav__burger" type="button" aria-expanded="false" aria-label="Open Menu"><i></i><i></i></button>
      </div>
      <div class="lr-nav__menu" data-label="Your English menu name here">${PAGES.map((p) => `<a href="${p.href}">${p.label}</a>`).join("")}</div>`;
    const burger = nav.querySelector(".lr-nav__burger");
    burger.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", String(open));
    });
    const fmt = new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
    const tick = () => {
      nav.querySelector("[data-clock]").textContent = fmt.format(new Date()).replace(":", " : ");
      setTimeout(tick, 60000 - (Date.now() % 60000) + 50);
    };
    tick();
    if (!reduce && ["home", "works", "about", "approach"].includes(page)) {
      const bar = nav.querySelector(".lr-nav__bar");
      whenComplete(() => gsap.fromTo(bar, { yPercent: -100 }, { yPercent: 0, duration: 0.8, ease: "power4.out", delay: 1.4, immediateRender: true }));
    }
  }

  /* ── Section panel color following: the section at screen center → body, the section below the nav bar → nav ── */
  const THEMED = '[data-theme]:not([data-theme=""])';
  const themeAt = (y) => {
    for (const el of document.elementsFromPoint(innerWidth / 2, y)) {
      if (nav && nav.contains(el)) continue;
      const block = el.closest(THEMED);
      if (block) return block.dataset.theme.trim();
    }
    return null;
  };
  let ticking = false;
  const update = () => {
    ticking = false;
    const b = themeAt(innerHeight / 2);
    if (b) document.body.dataset.tone = b; else delete document.body.dataset.tone;
    if (nav) nav.dataset.tone = themeAt(32) || "light";
  };
  const schedule = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
  addEventListener("scroll", schedule, { passive: true });
  addEventListener("resize", schedule);
  schedule();

  /* ── Chosen text color: a different one of four colors on each pick ── */
  const swatches = ["--site-purple", "--site-lime", "--site-blue", "--site-teal"];
  let last = -1;
  const pick = () => {
    let i;
    do { i = Math.floor(Math.random() * swatches.length); } while (i === last);
    last = i;
    document.documentElement.style.setProperty("--lr-sel", `var(${swatches[i]})`);
  };
  pick();
  document.addEventListener("selectstart", pick);

  /* ── Footer + post footer · title word entrance — reattached to the new body when barba swaps the body ── */
  const mount = (root = document) => {
    const foot = root.querySelector('[data-slot="footer"]');
    if (foot && !foot.dataset.built) {
      foot.dataset.built = "1";
      foot.className = "lr-foot";
      foot.innerHTML = `
        <div class="lr-container lr-foot__main">
          <div>
            <section class="lr-foot__group"><h3>Contact info</h3><a class="lr-foot__link" href="mailto:hello@example.com">hello@example.com</a></section>
            <section class="lr-foot__group"><h3>City Name</h3><a class="lr-foot__link" href="#" data-label="Your one-line office address in English">Street address line, 00000</a></section>
          </div>
          <p class="lr-h2 lr-foot__heading" data-label="Your closing English remark here · three lines">Closing<br>line goes<br>here</p>
        </div>
        <div class="lr-container lr-foot__bottom"><div class="lr-foot__links"><a class="lr-foot__social" href="https://www.example.com/" target="_blank" rel="noopener">Link 1</a><a class="lr-foot__social" href="https://www.example.org/" target="_blank" rel="noopener">Link 2</a></div><div>Company © <span data-year></span></div></div>`;
      foot.querySelector("[data-year]").textContent = String(new Date().getFullYear());
    }
    if (foot && document.body.dataset.post !== "none" && !foot.nextElementSibling?.matches?.(".lr-post")) {
      const post = document.createElement("div");
      post.className = "lr-post";
      post.setAttribute("data-slot", "post-footer");
      post.setAttribute("data-fx", "stretch-footer-title");
      post.innerHTML = `<div data-fx-part="spacer"></div><div data-fx-part="stage"><p data-fx-part="title" lang="en" data-label="Your short English sentence · two lines">${document.body.dataset.post || "A short line<br>set in two"}</p></div>`;
      foot.after(post);
    }
    if (reduce) return;
    root.querySelectorAll("[data-heading]").forEach((el) => {
      if (el.dataset.split) return;
      el.dataset.split = "1";
      const s = new SplitText(el, { type: "words", mask: "words", wordsClass: "lr-word" });
      const tw = gsap.from(s.words, { y: "1em", duration: 0.8, stagger: { amount: 0.2, from: "start" }, ease: "power4.out", paused: true, immediateRender: false });
      whenComplete(() => { tw.pause(0); ScrollTrigger.create({ trigger: el, start: "top bottom", end: "top 70%", onLeave: () => tw.play(), onLeaveBack: () => tw.pause(0) }); });
    });
  };
  mount();
  window.LR = { mount, refreshTone: schedule, whenComplete };
})();
