/* Device shared by all pages: header (widening four-cell menu·expand·process fade carousel), phone menu, fixed Contact, box accordion, 
   Choice-field contact form, footer, Lenis (1.2s exponential curve), page transition (fade out .35s → fade in .45s). Header and footer are built only once here. */
(() => {
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) root.classList.add("tk-reduce");
  const page = document.body.dataset.page || "index";
  const main = document.querySelector(".tk-page");

  // ── Header ──
  const STEPS = ["Site preparation · construction site from above · landscape 3:2", "Blueprint and model · On a desk · Landscape 3:2", "Factory assembly · wooden frame · landscape 3:2", "On-site installation · crane · landscape 3:2", "Completed exterior · forest house · landscape 3:2"];
  const head = document.createElement("header");
  head.className = "tk-head" + (document.body.dataset.light === "true" ? " is-light" : "");
  head.dataset.slot = "header";
  head.innerHTML = `
    <div class="tk-head__in">
      <div class="tk-head__logo tk-box"><a class="tk-logo" href="index.html" aria-label="First Page">Logo.</a></div>
      <button class="tk-burger" type="button" aria-label="Open Menu" aria-expanded="false"><i></i></button>
      <nav class="tk-head__menu" aria-label="Main menu" data-label="Menu English names · expansion-step descriptions in Korean">
        <div class="tk-menu-btn tk-box"><span>About</span>
          <div class="tk-drop-menu tk-serif"><a href="why.html">Why Us</a><a href="about.html">About Us</a><a href="recruit.html">Join Our Team</a></div>
        </div>
        <div class="tk-menu-btn tk-box"><a href="index.html#process">Our Process</a>
          <div class="tk-drop-menu"><a href="index.html#process" style="padding:0;border:0"><div class="swiper" data-slot="menu-carousel"><div class="swiper-wrapper">${STEPS.map((l, i) => `<div class="swiper-slide tk-drop-slide"><div class="wf-img tk-ph" data-label="${l}"></div><div class="tk-box"><p class="tk-label">0${i + 1} Step Name</p><p class="tk-body">Write your step description here, about two lines.</p></div></div>`).join("")}</div></div></a></div>
        </div>
        <div class="tk-menu-btn tk-box"><a href="index.html#design">Design</a></div>
        <div class="tk-menu-btn tk-box"><a href="#contact" data-contact>Contact</a></div>
      </nav>
    </div>`;
  document.body.prepend(head);
  const mnav = document.createElement("nav");
  mnav.className = "tk-mnav tk-stack";
  mnav.setAttribute("aria-label", "Phone menu");
  mnav.innerHTML = [["Why Us", "why.html"], ["About Us", "about.html"], ["Join Our Team", "recruit.html"], ["Our Process", "index.html#process"], ["Design", "index.html#design"], ["Contact", "#contact"]].map(([t, h]) => `<a class="tk-box" href="${h}">${t}</a>`).join("");
  head.after(mnav);
  const burger = head.querySelector(".tk-burger");
  burger.addEventListener("click", () => { const v = !head.classList.contains("is-open"); head.classList.toggle("is-open", v); burger.setAttribute("aria-expanded", String(v)); });

  // ── Fixed ”Contact” ──
  const git = document.createElement("a");
  git.className = "tk-git";
  git.href = "#contact";
  git.dataset.slot = "fixed-cta";
  git.textContent = "Contact Us →";
  const gitWrap = document.createElement("div");
  gitWrap.append(git);
  document.body.append(gitWrap);

  // ── Footer ──
  const foot = document.createElement("footer");
  foot.className = "tk-foot";
  foot.dataset.slot = "footer";
  foot.innerHTML = `
    <div class="tk-foot__top"><p class="tk-foot__logo">Logo.</p><span class="tk-label tk-pointer" role="button" tabindex="0" data-news-open>Newsletter →</span></div>
    <div class="tk-foot__bot" data-label="Footer address, contact and menu in English filler text · thank-you copy in Korean">
      <p class="tk-foot__ack">Your two-line note of thanks here for the land and its people.</p>
      <div><p>00 Street Name,</p><p>Suburb ST 0000</p></div>
      <div><a href="#">00 0000 0000</a><a href="#">hello@example.com</a></div>
      <div><a href="#">Social 1</a><a href="#">Social 2</a></div>
      <div><a href="why.html">Why Us</a><a href="about.html">About Us</a><a href="recruit.html">Join Our Team</a><a href="index.html#process">Our Process</a><a href="index.html#design">Design</a></div>
      <div><a href="#contact">Contact</a><a href="#">FAQs</a><a href="#">Privacy</a></div>
      <div class="tk-credits"><span class="tk-pointer tk-credits__t" role="button" tabindex="0" data-credits>Credits</span><a class="tk-credits__t is-hidden" href="#">Design by Studio Name</a></div>
    </div>
    <div class="tk-news-over" data-slot="newsletter-overlay" aria-hidden="true"><div class="tk-news-over__in tk-box"><p class="tk-h2">Sign up for updates.</p><label class="tk-cell is-input tk-box"><span class="tk-cell__label">Email</span><input placeholder=""></label><div class="tk-form__foot"><span>By sending, you agree to the privacy policy.</span><button class="tk-submit" type="button" data-news-close>Submit →</button></div><button class="tk-news-over__x" type="button" aria-label="Close" data-news-close>×</button></div></div>`;
  main.append(foot);

  // ── Newsletter sign-up curtain (.5s)·maker’s note (.2s) ──
  const over = foot.querySelector(".tk-news-over"), credits = foot.querySelector(".tk-credits");
  foot.addEventListener("click", (e) => {
    if (e.target.closest("[data-news-open]")) { over.classList.add("is-on"); over.setAttribute("aria-hidden", "false"); }
    else if (e.target.closest("[data-news-close]") || e.target === over) { over.classList.remove("is-on"); over.setAttribute("aria-hidden", "true"); }
    // As in the original, ”Made by” blurs out over .25s and the maker link appears in its place
    if (e.target.closest("[data-credits]")) credits.querySelectorAll(".tk-credits__t").forEach((t) => t.classList.toggle("is-hidden"));
  });

  // ── Lenis 1.0.42: 1.2s · min(1, 1.001 − 2^(−10t)) ──
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ duration: 1.2, orientation: "vertical", easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true, wheelMultiplier: 1, smoothTouch: false });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  window.tkLenis = lenis;

  // ── Header state: scroll down a bit and it shrinks with a background laid down (scaled), over photos it gets a steel-colored line ──
  let leaving = false;
  const state = () => {
    if (!leaving) head.classList.toggle("is-scaled", scrollY > 50);
    git.classList.toggle("is-on", scrollY > innerHeight * 0.5);
  };
  addEventListener("scroll", state, { passive: true });
  state();

  // ── Fade carousel of the header ”Process” dropdown: crossfades every 3s over .65s (Swiper 11 fade · loop) ──
  const sw = head.querySelector(".swiper");
  if (sw && window.Swiper) new Swiper(sw, { slidesPerView: 1, loop: true, speed: 650, effect: "fade", fadeEffect: { crossFade: true }, autoplay: reduce ? false : { delay: 3000, disableOnInteraction: false } });

  // ── Box accordion: only one open per group. First item starts open ──
  window.tkAcc = (scope = document) => scope.querySelectorAll("[data-acc-group]").forEach((group) => {
    const items = [...group.querySelectorAll(":scope > .tk-acc, :scope > * > .tk-acc")];
    const set = (open) => items.forEach((it) => {
      const on = it === open;
      it.classList.toggle("is-open", on);
      it.querySelector(".tk-acc__btn").setAttribute("aria-expanded", String(on));
      const inner = it.querySelector(".tk-acc__inner");
      inner.style.height = on ? `${inner.firstElementChild.scrollHeight}px` : "0px";
    });
    items.forEach((it) => it.querySelector(".tk-acc__btn").addEventListener("click", () => set(it.classList.contains("is-open") ? null : it)));
    set(group.dataset.accGroup === "none" ? null : items[0]);
    addEventListener("resize", () => set(items.find((i) => i.classList.contains("is-open")) || null));
  });

  // ── Contact form select: tapping unfolds the choices with grid-rows .3s and the arrow flips ──
  window.tkForm = (scope = document) => scope.querySelectorAll(".tk-cell[data-options]").forEach((cell) => {
    const val = cell.querySelector(".tk-cell__value");
    cell.querySelector(".tk-opts__in").innerHTML = cell.dataset.options.split("|").map((o) => `<button class="tk-opt" type="button">${o}</button>`).join("");
    cell.addEventListener("click", (e) => {
      const opt = e.target.closest(".tk-opt");
      if (opt) { val.textContent = opt.textContent; }
      const v = opt ? false : !cell.classList.contains("is-open");
      document.querySelectorAll(".tk-cell.is-open").forEach((c) => c !== cell && c.classList.remove("is-open"));
      cell.classList.toggle("is-open", v);
    });
  });
  document.addEventListener("click", (e) => { if (!e.target.closest(".tk-cell")) document.querySelectorAll(".tk-cell.is-open").forEach((c) => c.classList.remove("is-open")); });

  // ── Contact links scroll smoothly to the contact form ──
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href="#contact"]');
    if (!a) return;
    const t = document.getElementById("contact");
    if (!t) return;
    e.preventDefault();
    lenis ? lenis.scrollTo(t, { offset: -80 }) : t.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  });

  // ── Page transition: going to another page, the body fades out in .35s → switch → the new body appears .35s later over .45s ──
  // The original puts one fade on a single sheet wrapping header, body and fixed buttons — all three vanish and appear together
  const faders = [main, head, gitWrap];
  if (!reduce) faders.forEach((el) => el.classList.add("tk-fader", "is-in"));
  document.addEventListener("click", (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || reduce) return;
    const a = e.target.closest("a[href]");
    if (!a || a.target || /^(mailto:|tel:|#)/.test(a.getAttribute("href"))) return;
    const u = new URL(a.href, location.href);
    if (u.origin !== location.origin || !/\.html$/.test(u.pathname)) return;
    if (u.pathname === location.pathname) { if (u.hash) { const t = document.querySelector(u.hash); if (t) { e.preventDefault(); lenis ? lenis.scrollTo(t, { offset: -80 }) : t.scrollIntoView(); } } return; }
    e.preventDefault();
    head.classList.remove("is-open");
    head.classList.remove("is-scaled");
    leaving = true;
    // Attached with Web Animations so fading starts right from the frame that was clicked (.35s ease, same value as the original fade--out)
    faders.forEach((el) => { el.classList.remove("is-in"); el.style.opacity = "1"; el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 350, easing: "ease", fill: "forwards" }); });
    setTimeout(() => (location.href = u.href), 350);
  });
  addEventListener("pageshow", (e) => { if (e.persisted) faders.forEach((el) => { el.classList.remove("is-out"); el.classList.add("is-in"); }); });

  // ── Building the inquiry form: two types, Start (customer inquiry) and Apply (work with us) ──
  const ARW = '<svg class="tk-cell__arrow" viewBox="0 0 12 8" fill="none" aria-hidden="true"><path d="M1 1l5 5 5-5" stroke="currentColor" stroke-width="1.3"/></svg>';
  const pick = (label, value, options, full) => `<div class="tk-box tk-cell${full ? " is-full" : ""}" data-options="${options}"><p class="tk-cell__label">${label}</p><div class="tk-cell__body"><div style="flex:1"><p class="tk-cell__value">${value}</p><div class="tk-opts"><div class="tk-opts__in"></div></div></div>${ARW}</div></div>`;
  const field = (label, ph, cls = "") => `<label class="tk-box tk-cell is-input ${cls}"><span class="tk-cell__label">${label}</span>${cls.includes("is-msg") ? `<textarea placeholder="${ph}"></textarea>` : `<input placeholder="${ph}">`}</label>`;
  const FORMS = {
    start: () => pick("I am a", "Homeowner", "Homeowner|Operator|Developer|Architect", true) + pick("Interested in", "New Home", "New Home|Extension|Guest Lodge") + pick("Location", "City Name", "City 01|City 02|City 03") + pick("Budget", "0000+", "0000+|0000+|0000+") + pick("Rooms", "1", "1|2|3|4+") + field("First Name", "") + field("Surname", "") + field("Email", "") + field("Phone", "") + field("Message", "", "is-full is-msg") + `<div class="tk-form__foot"><label class="tk-check"><input type="checkbox"><i></i>Get News</label><span>If you send <a class="tk-under" href="#">Privacy policy</a>Doing so means you agree to it.</span><button class="tk-submit" type="submit">Submit →</button></div>`,
    work: () => field("First Name", "") + field("Surname", "") + field("Email", "") + field("Phone", "") + field("Message", "", "is-full is-msg") + `<div class="tk-form__foot"><label class="tk-check"><input type="checkbox"><i></i>Upload File</label><span>If you send <a class="tk-under" href="#">Privacy policy</a>Doing so means you agree to it.</span><button class="tk-submit" type="submit">Submit →</button></div>`,
  };
  document.querySelectorAll("[data-tk-form]").forEach((f) => (f.innerHTML = FORMS[f.dataset.tkForm]()));

  // ── Photo fade carousel: pressing a name button or the photo goes to the next photo ──
  document.querySelectorAll("[data-finish]").forEach((fin) => {
    const imgs = [...fin.querySelectorAll(".tk-finish__stage > .wf-img")], tabs = [...fin.querySelectorAll(".tk-finish__nav button")];
    let cur = 0;
    const go = (i) => { cur = i; tabs.forEach((x, k) => x.classList.toggle("is-on", k === i)); imgs.forEach((x, k) => x.classList.toggle("is-active", k === i)); };
    // ‹Why› section carousel (data-finish="advance") moves to the next photo when a photo or the chosen name is tapped again — measured: in the original, tapping Housing lowers Housing and the next section appears overlapping. The home closing carousel stays unchanged when the chosen name is tapped again
    const adv = fin.dataset.finish === "advance";
    tabs.forEach((t, i) => t.addEventListener("click", (e) => { e.stopPropagation(); go(adv && i === cur ? (cur + 1) % imgs.length : i); }));
    if (adv) fin.querySelector(".tk-finish__stage").addEventListener("click", (e) => { if (!e.target.closest("button")) go((cur + 1) % imgs.length); });
  });

  const boot = () => {
    window.tkAcc();
    window.tkForm();
    document.dispatchEvent(new CustomEvent("tk:built"));
    ScrollTrigger.refresh();
  };
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", boot) : boot();
  addEventListener("load", () => ScrollTrigger.refresh());
})();
