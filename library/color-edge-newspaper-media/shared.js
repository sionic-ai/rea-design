// Plug in here so the four pages use the same strip, header, menu panel, age-check dialog and footer. Motion values are exactly the original:
// Speech-bubble title .5s (default curve) · rotation 40° → 0 .5s (.05s later, a curve that overshoots and returns) · first wordmark shrink scrub 0 → 246px (phone 149px) · small header logo .4s
(() => {
  const page = document.body.dataset.page || "home";
  const root = document.documentElement;
  if (window.CustomEase) {
    CustomEase.create("krDefault", "M0,0 C0.36,0.04 0.23,1 1,1");
    CustomEase.create("krBalloon", "M0,0 C0.083,0.294 0.065,1.109 0.657,1.11 0.84,1.11 0.827,1.033 1,1");
  }
  const EASE = window.CustomEase ? "krDefault" : "power2.out";
  const motionOn = () => root.dataset.motionEnabled !== "false" && !matchMedia("(prefers-reduced-motion: reduce)").matches;

  const ico = {
    clock: '<svg class="kr-ico" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6.6" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M8 4.5V8l2.4 1.6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
    book: '<svg class="kr-ico" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 2.5h8.5v11H4.5A1.5 1.5 0 0 1 3 12z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M3 12a1.5 1.5 0 0 1 1.5-1.5h7" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>',
    help: '<svg class="kr-ico" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6.6" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M6.3 6.3a1.8 1.8 0 1 1 2.4 1.7c-.5.2-.7.6-.7 1.1v.4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="8" cy="11.4" r=".9" fill="currentColor"/></svg>',
    dict: '<svg class="kr-ico" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6.6" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M5 6.5h6M5 9.5h4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
    search: '<svg class="kr-ico" viewBox="0 0 16 16" aria-hidden="true"><circle cx="7" cy="7" r="4.6" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M10.5 10.5 14 14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    out: '<svg class="kr-ico" viewBox="0 0 16 16" aria-hidden="true"><rect x="2" y="5" width="9" height="9" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M6 2h8v8" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>',
  };
  const CATS = [["Health·Beauty", "blue"], ["Drinks · Alcohol", "red"], ["Research · Technology", "yellow"], ["Society · Sustainability", "pink"], ["People · Organization", "orange"], ["Business & management", "green"]];
  const cat = (i, big) => `<span class="kr-cat${big ? " kr-cat--l" : ""}" style="--c: var(--site-cat-${CATS[i][1]})"><i></i>${CATS[i][0]}</span>`;
  const now = new Date(), MON = ["Jan.", "Feb.", "Mar.", "Apr.", "May", "Jun.", "Jul.", "Aug.", "Sep.", "Oct.", "Nov.", "Dec."];
  const dateHTML = (cls = "") => `<time class="kr-date ${cls}"><small>${MON[now.getMonth()]}</small><b>${String(now.getDate()).padStart(2, "0")}</b><i>${now.getFullYear()}</i></time>`;
  const links = [["news.html", ico.clock, "New post"], ["news.html", ico.book, "Serial"], ["about.html", ico.help, "About the Site"]];
  // Branch pages and posts: the band is that branch’s single color (body data-rail)
  const rails = document.body.dataset.rail || "--site-cat-red, --site-cat-yellow, --site-cat-blue, --site-cat-pink, --site-cat-orange, --site-cat-green";

  const head = `
<div class="kr-rail kr-rail--l" data-fx="wave-rail" data-fx-wave-rail="colors: ${rails}"></div>
<div class="kr-rail kr-rail--r" data-fx="wave-rail" data-fx-wave-rail="colors: ${rails}; flip: on"></div>
<div class="kr-rail kr-rail--t" data-fx="wave-rail" data-fx-wave-rail="orient: horizontal; colors: ${rails}"></div>
<header class="kr-head" data-slot="header">
  <div class="kr-head__in">
    <div class="kr-head__group kr-head__group--l">
      ${dateHTML("kr-head__date")}
      <div class="kr-switch kr-pc">Motion <button class="kr-pill-btn js-motion" type="button" aria-pressed="true">Ⅱ Pause</button></div>
      <div class="kr-switch kr-pc">Language <div class="kr-lang"><a href="#" class="is-on">Ko</a><a href="#">En</a></div></div>
    </div>
    <a class="kr-head__small kr-mark kr-mark--s" href="index.html" data-label="Brand wordmark (small)">Studio</a>
    <div class="kr-head__group">
      <nav class="kr-nav" aria-label="Main menu">${links.map(([h, i, t]) => `<a href="${h}" data-fx="sweep-hover" class="kr-ul">${i}${t}</a>`).join("")}</nav>
      <button class="kr-menu-btn js-menu" type="button" aria-expanded="false" aria-label="Open Menu"><i></i>${ico.search}</button>
    </div>
    <span class="kr-dot kr-head__line"></span>
  </div>
</header>
<div class="kr-gnav js-gnav" data-slot="menu-panel">
  <div class="kr-gnav__in">
    <form class="kr-search" onsubmit="return false"><input type="search" placeholder="Your search term here" aria-label="Site Search"><button class="kr-btn" type="submit">${ico.search}Find</button></form>
    <p class="kr-gnav__label">Eye-catching words</p>
    <ul class="kr-gnav__tags">${["Innovation (pioneering)", "Company research", "Interview", "Health services", "Interviews · Roundtables", "Wine", "Cocktail", "Company group", "Environment", "Leader’s Perspective", "Long-term management plan", "Beer", "Video", "Company village", "Drink"].map((t, i) => `<li><a class="kr-tagpill" href="news.html">${i % 5 === 3 ? '<span class="wf-img" data-label="Horse photo"></span>' : ""}# ${t}</a></li>`).join("")}</ul>
    <div class="kr-gnav__cols">
      <div class="kr-gnav__col"><ul class="kr-linklist">${[[ico.clock, "New post", "news.html"], [ico.book, "Series list", "news.html"], [ico.dict, "Glossary", "#"], [ico.help, "About the Site", "about.html"]].map(([i, t, h]) => `<li><a href="${h}" data-fx="sweep-hover" data-fx-sweep-hover="look: pad" style="--fx-pad: 0px; --fx-shrink: -8px"><span>${i}${t}</span><span class="kr-arrow"></span></a></li>`).join("")}</ul></div>
      <div class="kr-gnav__col"><div class="kr-themes">${CATS.map((_, i) => `<a href="news.html">${cat(i, true)}</a>`).join("")}</div></div>
      <div class="kr-gnav__col"><ul class="kr-sns">${["Instagram", "YouTube", "LinkedIn", "note", "X"].map((n) => `<li><a href="#"><span><i class="kr-logo-sq"></i>${n}</span>${ico.out}</a></li>`).join("")}</ul></div>
    </div>
  </div>
</div>`;

  const foot = `
<footer class="kr-foot" data-slot="footer">
  <div class="kr-foot__top"><p>( Your one-line tagline here )</p><a class="kr-mark kr-mark--s" href="index.html">Studio</a><a class="kr-foot__totop js-top" href="#">Back to top<b>↑</b></a></div>
  <div class="kr-foot__cols">
    <div class="kr-foot__col"><span class="kr-label">Contents</span><ul class="kr-linklist">${[[ico.clock, "New post", "news.html"], [ico.book, "Series list", "news.html"], [ico.dict, "Glossary", "#"], [ico.help, "About the Site", "about.html"]].map(([i, t, h]) => `<li><a href="${h}" data-fx="sweep-hover" class="kr-ul"><span>${i}${t}</span><span class="kr-arrow"></span></a></li>`).join("")}</ul></div>
    <div class="kr-foot__col"><span class="kr-label">Themes</span><div class="kr-themes">${CATS.map((_, i) => `<a href="news.html">${cat(i, true)}</a>`).join("")}</div></div>
    <div class="kr-foot__col"><span class="kr-label">SNS</span><ul class="kr-sns">${["Instagram", "YouTube", "LinkedIn", "note", "X"].map((n) => `<li><a href="#" data-fx="sweep-hover" class="kr-ul"><span><i class="kr-logo-sq"></i>${n}</span>${ico.out}</a></li>`).join("")}</ul></div>
  </div>
  <div class="kr-foot__bottom">
    <div><nav class="kr-foot__links">${["Company · investment info site", "Product and service info site", "Site usage guide", "Privacy protection", "Inquiry", "Cookie Settings"].map((t) => `<a href="#" data-fx="sweep-hover" class="kr-ul">${t}</a>`).join("")}</nav>
      <p class="kr-foot__note"><i></i>Your two-line drinking warning here. No underage drinking or drunk driving, and<br>Write a notice urging people to avoid alcohol during pregnancy and nursing.</p></div>
    <div class="kr-foot__brand">Your company slogan, one line<b>BRAND</b><p class="kr-foot__copy">© Company Name Holdings, Limited.</p></div>
  </div>
</footer>`;
  const overlay = `
<button class="kr-motion js-motion" type="button" aria-pressed="true">Motion <b>Ⅱ</b></button>
<div class="kr-age" data-slot="age-gate" hidden>
  <div class="kr-age__box" role="dialog" aria-modal="true" aria-label="Age Check">
    <p>Your drink details go here<br>Notice about age verification.<br>Are you 20 years old or older?</p>
    <button class="kr-btn js-age-yes" type="button">Yes (I am 20 or older)<span class="bar"></span><span class="kr-arrow"></span></button>
    <button class="kr-age__no" type="button">No (under 20 years old)</button>
  </div>
</div>`;

  document.body.insertAdjacentHTML("afterbegin", head);
  document.querySelector("[data-kr-foot]")?.insertAdjacentHTML("afterend", foot);
  document.querySelector("[data-kr-foot]")?.remove();
  document.body.insertAdjacentHTML("beforeend", overlay);
  document.querySelectorAll("[data-kr-date]").forEach((n) => { n.outerHTML = dateHTML(n.dataset.krDate || ""); });
  document.querySelectorAll("[data-kr-cat]").forEach((n) => { n.outerHTML = cat(+n.dataset.krCat, n.hasAttribute("data-big")); });

  // Motion = Preference (motion button) && not paused — the original halts the band · auto-advance · marquee · video entirely with suspendMotion while the age-check window is open
  const motion = { preferred: true, suspended: false };
  const applyMotion = () => { const on = motion.preferred && !motion.suspended; if (root.dataset.motionEnabled !== String(on)) { root.dataset.motionEnabled = String(on); document.dispatchEvent(new Event("kr:motion")); } };
  root.dataset.motionEnabled = "true";

  // Age check — pressing ”Yes” once keeps it on this device so it isn’t asked again. ”No” closes it just this time
  const KEY = "kr-library:age-ok", age = document.querySelector(".kr-age");
  let stored = false; try { stored = localStorage.getItem(KEY) === "1"; } catch {}
  const closeAge = () => { age.hidden = true; root.classList.remove("kr-locked"); motion.suspended = false; applyMotion(); };
  if (!stored) { age.hidden = false; root.classList.add("kr-locked"); motion.suspended = true; applyMotion(); }
  document.querySelector(".js-age-yes").addEventListener("click", () => { try { localStorage.setItem(KEY, "1"); } catch {} closeAge(); });
  document.querySelector(".kr-age__no").addEventListener("click", closeAge);

  // Full menu panel
  const btn = document.querySelector(".js-menu"), nav = document.querySelector(".js-gnav");
  const setMenu = (open) => { btn.setAttribute("aria-expanded", String(open)); btn.setAttribute("aria-label", open ? "Close Menu" : "Open Menu"); nav.classList.toggle("is-open", open); document.body.classList.toggle("navigation-open", open); root.classList.toggle("kr-locked", open); };
  btn.addEventListener("click", () => setMenu(btn.getAttribute("aria-expanded") !== "true"));
  addEventListener("keydown", (e) => { if (e.key === "Escape" && nav.classList.contains("is-open")) setMenu(false); });

  // Motion toggle — html[data-motion-enabled=If false], the strip, auto-advance and hover zoom stop
  const motionBtns = document.querySelectorAll(".js-motion");
  const paintMotion = () => motionBtns.forEach((b) => { const on = motion.preferred; b.setAttribute("aria-pressed", String(on)); b.innerHTML = b.classList.contains("kr-motion") ? `Motion <b>${on ? "Ⅱ" : "▶"}</b>` : on ? "Ⅱ Pause" : "▶ Play"; });
  motionBtns.forEach((b) => b.addEventListener("click", () => { motion.preferred = !motion.preferred; paintMotion(); applyMotion(); }));
  paintMotion();
  document.querySelectorAll(".js-top").forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); scrollTo({ top: 0, behavior: motionOn() ? "smooth" : "auto" }); }));
  document.querySelectorAll('a[href="#"]').forEach((a) => a.addEventListener("click", (e) => e.preventDefault()));

  if (!window.gsap) return;
  gsap.registerPlugin(ScrollTrigger);
  const mm = gsap.matchMedia();

  // Speech bubble title — once when it hits the 90% line of the screen: .8x and transparent → in place over .5s, and the 40° tilt overshoots .05s late then swings back and stands straight
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    document.querySelectorAll("[data-balloon]").forEach((el) => {
      gsap.set(el, { autoAlpha: 0, scale: 0.5, transformOrigin: "0 3px" });
      ScrollTrigger.create({ trigger: el, start: "top 90%", once: true, onEnter: () => {
        gsap.fromTo(el, { autoAlpha: 0, scale: 0.8 }, { autoAlpha: 1, scale: 1, duration: 0.5, ease: EASE });
        gsap.fromTo(el, { rotate: 40 }, { rotate: 0, duration: 0.5, delay: 0.05, ease: window.CustomEase ? "krBalloon" : "back.out(2)" });
      } });
    });
  });

  // Home big wordmark — over scroll 0 → 246px (phone 149px) it shrinks to .43x (phone .57) and moves down 116px (phone 74px), then swaps to the small logo in the header (.4s)
  const big = document.querySelector("[data-top-logo]"), small = document.querySelector(".kr-head__small");
  if (big && page === "home") {
    mm.add({ desk: "(min-width: 1024px)", mob: "(max-width: 1023px)", reduce: "(prefers-reduced-motion: reduce)" }, (ctx) => {
      const { mob, reduce } = ctx.conditions;
      const end = mob ? 149 : 246;
      if (!reduce) {
        const tl = gsap.timeline({ scrollTrigger: { trigger: document.body, start: 0, end, scrub: true } });
        tl.to(big, { scale: mob ? 0.57142 : 0.42857, transformOrigin: "center center", ease: EASE });
        tl.to(big, { y: mob ? 74 : 116, ease: "power1.in" }, "<");
      }
      ScrollTrigger.create({ trigger: document.body, start: end, onEnter: () => { gsap.set(big, { autoAlpha: 0 }); gsap.to(small, { autoAlpha: 1, duration: reduce ? 0 : 0.4, ease: EASE, overwrite: "auto" }); },
        onLeaveBack: () => { gsap.set(big, { autoAlpha: 1 }); gsap.to(small, { autoAlpha: 0, duration: reduce ? 0 : 0.4, ease: EASE, overwrite: "auto" }); } });
    });
  } else if (small) gsap.set(small, { autoAlpha: 1 });

  // Phone bottom motion button — hides when scrolling down, shows when scrolling up
  const mot = document.querySelector(".kr-motion");
  let lastY = scrollY;
  addEventListener("scroll", () => { const y = scrollY; mot.classList.toggle("is-hidden", y > lastY && y > 200); lastY = y; }, { passive: true });
})();
