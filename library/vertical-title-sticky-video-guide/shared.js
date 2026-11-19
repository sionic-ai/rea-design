// Common to all pages: draws the header, Menu pill, blurred-panel menu, contact photo strip and footer in one place, and wires up Lenis smooth scroll, reveals, scattered-photo parallax and pill appearance.
// Original values: Lenis 1.3.11 defaults (lerp .1) · appearance is per section ([data-trigger]) — when the section head reaches 75% of the screen, all .fadein inside fade to opacity 1 together over 1s (.5s delay),
// At 70% the .fadein__train chunks appear in turn (.7s total spacing) over 1s (.5s delay), and hide again when scrolling back · photo yPercent 0→-5 scrub 2 (top 80% → bottom top).
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const page = document.body.dataset.page || "home";
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const MK = (window.MK = {});
  if (page !== "home") document.body.classList.add("is-sub");

  const arrow = '<svg viewBox="0 0 11 9" fill="currentColor" aria-hidden="true"><path d="M6.6 0 11 4.5 6.6 9l-.7-.7 3.2-3.3H0V4h9.1L5.9.7z"/></svg>';
  const ext = '<svg viewBox="0 0 8 8" fill="none" stroke="currentColor" aria-hidden="true"><path d="M1 7 7 1M2.5 1H7v4.5"/></svg>';
  // Placeholder newly drawn instead of the original symbol — one sun and two waves, with letters above and below
  const markArt = '<svg viewBox="0 0 102 96" fill="none" stroke="currentColor" aria-hidden="true"><path d="M8 50h86" stroke-width="1"/><circle cx="51" cy="50" r="7" stroke-width="1"/><path d="M14 62q6-6 12 0t12 0 12 0 12 0 12 0 12 0M20 70q5-5 10 0t10 0 10 0 10 0 10 0 10 0" stroke-width="1.1"/></svg>';
  const logo = (cls = "") => `<span class="mk-mark ${cls}"><b>Your name here</b>${markArt}<b class="is-sub">Group name</b><small>Place name team guide</small></span>`;
  MK.icon = { arrow, ext };
  document.querySelectorAll('[data-icon="arrow"]').forEach((el) => (el.innerHTML = arrow));
  MK.logo = logo;

  const navA = [["Go home", "index.html"], ["About the group", "about.html"], ["Meet the Members", "list.html"], ["About the Area", "about-place.html"]];
  const navB = [["Try it out", "index.html#experience"], ["Directions", "index.html#access"], ["Contact Us", "#contact"]];
  const sns = [["Instagram", "#"], ["Facebook", "#"]];
  const links = (list) => list.map(([t, h]) => `<a class="mk-ul" href="${h}"><span class="label">${t}</span>${arrow}</a>`).join("");
  const snsLinks = sns.map(([t, h]) => `<a class="mk-ul" href="${h}"><span class="label">${t}</span>${ext}</a>`).join("");

  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.classList.add("mk-head");
    head.innerHTML = `
      <a class="mk-logo" href="index.html" aria-label="Home">${logo()}</a>
      <div class="mk-gnav"><nav>${links(navA)}</nav><nav>${links(navB)}</nav><nav class="is-sns">${snsLinks}</nav></div>`;
    head.insertAdjacentHTML(
      "afterend",
      `<button class="mk-btn" type="button" aria-label="Menu" data-slot="menu-button"><span class="mk-btn__box"><span class="mk-btn__label"><span class="is-open-label">Menu</span><span class="is-close">Close</span></span><span class="mk-btn__icon"><span></span><span></span><span></span></span></span></button>
      <div class="mk-dnav" data-slot="menu-drawer"><div class="mk-dnav__in"><nav>${links(navA)}</nav><nav>${links(navB)}</nav><nav class="is-sns">${snsLinks}</nav></div></div>`,
    );
  }
  const btn = document.querySelector(".mk-btn");
  const setOpen = (open) => {
    btn.classList.toggle("is-open", open);
    document.body.classList.toggle("is-open", open);
  };
  btn?.addEventListener("click", () => setOpen(!btn.classList.contains("is-open")));
  document.querySelectorAll(".mk-dnav a").forEach((a) => a.addEventListener("click", () => setOpen(false)));

  const photo = (label) => `<div class="wf-img mk-img mk-fill" data-label="${label}"></div>`;
  const cta = document.querySelector('[data-slot="contact-marquee"]');
  if (cta) {
    const rowA = ["Guide in a straw hat explaining with a smile · seaside daytime · landscape", "Child holding a grilled clam · Evening indoors · Landscape", "Seated guests and guide · sunset · landscape"];
    const rowB = ["Hosts in front of a street food stall · evening light · landscape", "Guest taking a photo with a phone · night · landscape", "Sea horizon at sunset · dusk · landscape"];
    const row = (list, dir) => `<div class="mk-marq__wrap${dir === "right" ? " is-right" : ""}">${[0, 1].map(() => `<ul class="mk-marq__list">${[...list, ...list].map((l) => `<li class="mk-marq__item">${photo(l)}</li>`).join("")}</ul>`).join("")}</div>`;
    cta.classList.add("mk-cta");
    cta.id = "contact";
    cta.innerHTML = `
      <span class="wf-note">Contact · two photo rows flowing in opposite directions at 60s · white card in the center</span>
      <div class="mk-marq">${row(rowA, "left")}${row(rowB, "right")}</div>
      <div class="mk-cta__card">
        <h2 class="mk-cta__title"><span class="en">Contact</span>Contact Us</h2>
        <p class="mk-cta__text">Your two lines go here saying you can ask anything, such as about experiences or press coverage, ending with an invitation to get in touch easily through the form.</p>
        <a class="mk-button is-black" href="#"><span class="label">Go straight to the contact form</span>${arrow}</a>
      </div>`;
  }

  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    const fl = (list) => list.map(([t, h]) => `<a href="${h}">${t}</a>`).join("");
    foot.classList.add("mk-foot");
    foot.innerHTML = `
      <div class="mk-foot__in">
        <div class="mk-sitemap">
          <div class="mk-sitemap__left"><nav>${fl(navA)}</nav><nav>${fl(navB)}</nav><nav class="is-sns">${fl(sns)}</nav></div>
          <div class="mk-sitemap__right"><p>Your group name here<br>Your one-line address 00-0 here</p><small>©2025 Your group name here</small></div>
        </div>
      </div>
      <div class="mk-foot__bg">${photo("High view of a sunset bay and islands · dusk pink sky · landscape panorama")}<span class="mk-foot__logo">${logo("is-big")}</span></div>`;
  }

  // Smooth scroll — original uses Lenis autoRaf defaults
  if (!reduced && window.Lenis) {
    const lenis = new Lenis({ lerp: 0.1 });
    MK.lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    document.querySelectorAll('a[href^="#"]:not([href="#"]), a[href^="index.html#"]').forEach((a) =>
      a.addEventListener("click", (e) => {
        const id = a.getAttribute("href").split("#")[1];
        const t = document.getElementById(id);
        if (!t) return;
        e.preventDefault();
        lenis.scrollTo(t);
      }),
    );
  }

  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    gsap.utils.toArray("[data-trigger]").forEach((sec) => {
      const own = (sel) => [...sec.querySelectorAll(sel)].filter((el) => el.closest("[data-trigger]") === sec);
      const fades = own(".fadein"), trains = own(".fadein__train");
      if (fades.length) gsap.to(fades, { opacity: 1, duration: 1, delay: 0.5, scrollTrigger: { trigger: sec, start: "top 75%", toggleActions: "play none none reverse" } });
      if (trains.length) gsap.to(trains, { opacity: 1, duration: 1, delay: 0.5, stagger: { from: "start", amount: 0.7 }, scrollTrigger: { trigger: sec, start: "top 70%", toggleActions: "play none none reverse" } });
    });
    gsap.utils.toArray("[data-py]").forEach((el) => {
      const [from, to] = el.dataset.py.split(",").map(Number);
      gsap.fromTo(el, { yPercent: from }, { yPercent: to, ease: "none", scrollTrigger: { trigger: el, start: "top 80%", end: "bottom top", scrub: 2 } });
    });
    const fixedAt = document.getElementById("addFixed");
    if (fixedAt) {
      ScrollTrigger.create({
        trigger: fixedAt,
        start: "top top",
        onEnter: () => btn.classList.add("is-fixed"),
        onLeaveBack: () => { btn.classList.remove("is-fixed"); setOpen(false); },
      });
    }
  });
  mm.add("(prefers-reduced-motion: reduce)", () => {
    gsap.set(".fadein, .fadein__train", { opacity: 1 });
    btn?.classList.add("is-fixed");
  });
})();
