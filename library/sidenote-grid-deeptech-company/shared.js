// Injects and animates what spans several pages (header line, News/Contact modal, phone menu, cell-pattern transition curtain, footer, emphasized-word painting) from one place.
(() => {
  const page = document.body.dataset.page;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const D = { xs: 0.1, sm: 0.3, md: 0.6, lg: 1, xl: 1.6 };
  const MARK = '<svg viewBox="0 0 23 25" aria-hidden="true"><path fill="currentColor" d="M9 0h5l9 25h-5l-2-6H7l-2 6H0zM8.6 15h5.8L11.5 6.5z"/><rect x="0" y="0" width="4" height="4" fill="currentColor"/></svg>';
  const NAV = [["index.html", "Home", "home"], ["service.html", "Product", "service"], ["news.html", "Learn", "news"], ["#", "Media", ""], ["recruit.html", "Careers", "recruit"], ["#", "Gathering", ""]];
  const navItem = ([h, t, p]) => `<a class="at-nav at-label${p === page ? " is-on" : ""}" href="${h}"><span class="at-nav__i"></span>${t}</a>`;
  const FIELDS = ["Full Name", "Email Address", "Company Name"].map((l) => `<label class="at-field"><span class="at-label">${l}</span><input type="text" placeholder="${l}"></label>`).join("");

  document.querySelector('[data-slot="header"]').outerHTML = `
<div class="at-vline" aria-hidden="true"></div>
<div class="at-veil" aria-hidden="true"></div>
<div class="at-veil-pattern" aria-hidden="true" data-fx="cell-walk-pattern" data-fx-cell-walk-pattern="mode: veil" data-cols="[[2,1],[2,2],[3,3],[4,3],[1,1]]" data-rows="[10,15,30,10,15,20]"></div>
<header class="at-head" data-slot="header">
  <a class="at-head__logo" href="index.html" aria-label="Back to start">${MARK}</a>
  <nav class="at-head__nav">${NAV.map(navItem).join("")}</nav>
  <div class="at-head__modals">
    <div><button class="at-modal-btn at-label" type="button" aria-expanded="false" data-drop="updates">Updates <em>1 New</em></button>
      <div class="at-drop is-updates" data-slot="updates-modal"><div class="at-drop__in"><a class="at-update" href="news.html"><span class="wf-img" data-label="TV appearance screen · studio lighting · 4:3"></span><span class="at-label" data-label="Your new English news title on one line">News headline in one line<small>Learn more</small></span></a></div></div></div>
    <span class="at-head__div"></span>
    <div><button class="at-modal-btn at-label" type="button" aria-expanded="false" data-drop="contact">Contact Us</button>
      <div class="at-drop is-contact" data-slot="contact-modal"><div class="at-drop__in"><form class="at-form" onsubmit="return false">${FIELDS}<label class="at-field"><span class="at-label">Message</span><textarea placeholder="Write your message"></textarea></label><button class="at-btn at-label" type="submit">Submit</button></form></div></div></div>
  </div>
  <button class="at-head__menu at-label" type="button" aria-expanded="false"><span class="at-nav__i"></span>&nbsp;Menu</button>
</header>
<div class="at-mmenu" data-slot="mobile-menu"><nav class="at-mmenu__in">${NAV.slice(1).map(([h, t]) => `<a class="at-h-l" href="${h}">/ ${t}</a>`).join("")}</nav></div>`;

  document.querySelector('[data-slot="footer"]').outerHTML = `
<footer class="at-foot" data-slot="footer">
  <div class="at-foot__pattern" aria-hidden="true" data-fx="cell-walk-pattern" data-fx-cell-walk-pattern="mode: scrub" data-cols="[[2,1],[2,2],[3,3],[2,2],[3,3]]" data-rows="[16,16,16,16,16,20]"></div>
  <div class="at-layout">
    <div class="at-foot__text"><p class="at-label" data-label="Your company official English name here">ⓒ 0000<br>Company Name Inc.</p><div class="at-foot__socials">${[["#", "LinkedIn"], ["#", "X"], ["#", "YouTube"]].map(([h, t]) => navItem([h, t, ""])).join("")}</div><a class="at-label at-credit" href="#">Site Credit</a></div>
    <nav class="at-foot__nav">${[["service.html", "Product", "service"], ["news.html", "Learn", "news"], ["recruit.html", "Careers", "recruit"], ["#contact", "Contact Us", ""], ["#", "Privacy", ""], ["#", "Terms", ""]].map(navItem).join("")}</nav>
  </div>
  <div class="at-foot__mark" aria-label="Company wordmark" data-label="Your company English wordmark here"><svg viewBox="0 0 1200 250" aria-hidden="true"><g fill="currentColor"><rect x="0" y="150" width="40" height="40"/><rect x="40" y="110" width="40" height="40"/><rect x="80" y="70" width="40" height="40"/><rect x="120" y="30" width="40" height="40"/><rect x="40" y="190" width="40" height="40"/></g><text x="190" y="228" fill="currentColor" style="font: 300 250px var(--kf-font-display); letter-spacing: -0.04em">Brand</text></svg></div>
</footer>`;

  // Header bar: logo, menu and modal come in one after another from -10px with .6s power4.out (.1s total)
  if (!reduce) {
    const tl = gsap.timeline();
    tl.to(".at-head__logo", { opacity: 1, x: 0, duration: D.md, ease: "power4.out" })
      .to(".at-head__nav .at-nav", { opacity: 1, x: 0, duration: D.md, ease: "power4.out", stagger: { amount: 0.1, ease: "circ.in" } }, "<0.1")
      .to(".at-head__menu", { opacity: 1, x: 0, duration: D.md, ease: "power4.out" }, "<0.1")
      .to(".at-head__modals", { opacity: 1, x: 0, duration: D.md, ease: "power4.out" }, "<0.1");
  }

  // News and Contact modal: height 0 → auto in 1s expo.out, .6s when closing
  const drops = [...document.querySelectorAll("[data-drop]")];
  const modals = document.querySelector(".at-head__modals");
  const setDrop = (btn, open) => {
    btn.setAttribute("aria-expanded", String(open));
    modals.classList.toggle("is-open", drops.some((b) => b.getAttribute("aria-expanded") === "true"));
    const box = btn.parentElement.querySelector(".at-drop");
    gsap.to(box, open ? { height: "auto", duration: reduce ? 0 : D.lg, ease: "expo.out", overwrite: true } : { height: 0, duration: reduce ? 0 : D.md, ease: "power4.out", overwrite: true });
  };
  drops.forEach((b) => b.addEventListener("click", () => { const open = b.getAttribute("aria-expanded") !== "true"; drops.forEach((o) => o !== b && o.getAttribute("aria-expanded") === "true" && setDrop(o, false)); setDrop(b, open); }));
  document.addEventListener("click", (e) => { if (!e.target.closest(".at-head__modals")) drops.forEach((b) => b.getAttribute("aria-expanded") === "true" && setDrop(b, false)); });

  // Phone menu: panel opens with 1s expo.out, then links settle in at .6s (sum .1s), and on closing -5px in .3s
  const mBtn = document.querySelector(".at-head__menu"), mBox = document.querySelector(".at-mmenu");
  let mTl = gsap.timeline();
  mBtn.addEventListener("click", () => {
    const open = mBtn.getAttribute("aria-expanded") !== "true";
    mBtn.setAttribute("aria-expanded", String(open));
    mTl.kill();
    mTl = gsap.timeline();
    const links = mBox.querySelectorAll("a");
    if (open) mTl.to(mBox, { height: "auto", duration: D.lg, ease: "expo.out" }).to(links, { y: 0, opacity: 1, duration: D.md, ease: "power4.out", stagger: { amount: 0.1 } }, "<0.1");
    else mTl.to(links, { y: -5, opacity: 0, duration: D.sm, ease: "power4.out", stagger: { amount: -0.1 } }).to(mBox, { height: 0, duration: D.md, ease: "power4.out" }, "<");
  });

  // Page transition: the panel covers from below in .3s power4.inOut and cells turn on from the bottom row up, then it moves on — on the new page, turn the cells off and lift the panel away upward.
  const veil = document.querySelector(".at-veil"), veilPat = document.querySelector(".at-veil-pattern");
  // GSAP reads CSS translateY(100%) as px, so clear y to avoid overlapping with yPercent
  gsap.set(veil, { y: 0, yPercent: 100 });
  if (!sessionStorage.getItem("at-veil") || reduce) document.documentElement.classList.remove("at-arriving");
  if (sessionStorage.getItem("at-veil") && !reduce) {
    sessionStorage.removeItem("at-veil");
    gsap.set(veil, { yPercent: 0 });
    document.documentElement.classList.remove("at-arriving");
    requestAnimationFrame(() => {
      veilPat.querySelectorAll(".fx-cwp > i").forEach((c) => gsap.set(c, { opacity: 1 }));
      veilPat.dispatchEvent(new Event("fx:uncover"));
      gsap.to(veil, { yPercent: -100, duration: D.sm, ease: "power4.inOut", delay: 0.2, onComplete: () => gsap.set(veil, { yPercent: 100 }) });
    });
  }
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || a.target === "_blank") return;
    const href = a.getAttribute("href");
    if (href.startsWith("#") || /^(https?:|mailto:|tel:)/.test(href)) return;
    e.preventDefault();
    if (reduce) { location.href = href; return; }
    sessionStorage.setItem("at-veil", "1");
    gsap.fromTo(veil, { yPercent: 100 }, { yPercent: 0, duration: D.sm, ease: "power4.inOut" });
    gsap.delayedCall(0.15, () => veilPat.dispatchEvent(new Event("fx:cover")));
    gsap.delayedCall(D.sm + 0.3, () => { location.href = href; });
  });
  addEventListener("pageshow", (e) => { if (e.persisted) { gsap.set(veil, { yPercent: 100 }); veilPat.dispatchEvent(new Event("fx:uncover")); } });

  // When a highlighted word (off-white mark) reaches 80% of the screen, each letter goes gray → off-white at .05s intervals
  gsap.registerPlugin(ScrollTrigger, SplitText);
  gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
    document.querySelectorAll("[data-mark]").forEach((m) => {
      SplitText.create(m, { type: "words, chars", onSplit(s) {
        gsap.set(m, { color: "var(--kf-dim)" });
        return gsap.to(s.chars, { color: "var(--kf-ink)", duration: D.md, ease: "power4.out", stagger: { each: 0.05, ease: "circ.in" }, scrollTrigger: { trigger: m, start: "top 80%", once: true } });
      } });
    });
  });
})();
