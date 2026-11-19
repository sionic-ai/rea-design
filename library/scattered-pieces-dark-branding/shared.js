// Spanning multiple pages — drawing nav, menu, cookie and footer, Lenis (lerp .08), nav change, word and line rise, footer parallax, page transition
(() => {
  const root = document.documentElement;
  const page = document.body.dataset.page || "home";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  gsap.registerPlugin(ScrollTrigger, CustomEase);
  CustomEase.create("natureSway", "M0,0 C0.08,0.494 0.14,1 1,1");
  CustomEase.create("premiumGlide", "M0,0 C0.1,0.4 0.15,1 1,1");
  CustomEase.create("customBezier", "M0,0 C0.83,0 0.17,1 1,1");

  const links = [["works", "works.html", "Work"], ["studio", "index.html#studio", "Studio"], ["news", "news.html", "Journal"], ["contact", "#contact", "Contact"]];
  // Menu text is layered in two copies, and on hover it rolls up one line
  const roll = (t) => `<span class="r-box"><span class="r-in"><span>${t}</span><span aria-hidden="true">${t}</span></span></span>`;
  const nav = document.querySelector('[data-slot="nav"]');
  if (nav) {
    nav.className = "nav";
    nav.innerHTML = `<a class="logo" href="index.html" data-label="Brand English wordmark (slash through the middle O)">STUDIØ</a>
      <div class="sets">${page !== "home" ? "" : `<nav class="set first" aria-label="Main menu">${links.map(([k, h, l]) => `<a class="bracket roll" href="${h}"${k === page ? ' aria-current="page"' : ""}>${roll(l)}</a>`).join("")}</nav>`}
      <div class="set second${page !== "home" ? " solo" : ""}"><a class="bracket roll" href="#contact">${roll("Contact")}</a><button class="bracket roll" type="button" data-menu-open aria-expanded="false">${roll("Menu")}</button></div></div>`;
    const menu = document.createElement("div");
    menu.className = "menu"; menu.setAttribute("aria-hidden", "true");
    menu.innerHTML = `<button class="m-close bracket" type="button" data-menu-close>Close</button>
      <nav class="m-links">${links.map(([, h, l]) => `<a href="${h}"><span class="l-mask"><span class="m-line">${l}</span></span></a>`).join("")}</nav>
      <div class="m-pic wf-img" data-label="Photo beside menu · mossy dark forest · portrait 4:5"></div>`;
    document.body.append(menu);
    const btn = nav.querySelector("[data-menu-open]");
    let tl;
    const open = (on) => {
      btn.setAttribute("aria-expanded", String(on)); menu.setAttribute("aria-hidden", String(!on));
      tl?.kill();
      if (on) { menu.classList.add("open"); window.lenis?.stop(); tl = gsap.timeline().to(menu, { clipPath: "inset(0 0 0% 0)", duration: reduce ? 0 : 0.8, ease: "power3.inOut" }).fromTo(menu.querySelectorAll(".m-line"), { yPercent: 100 }, { yPercent: 0, duration: reduce ? 0 : 0.9, stagger: 0.06, ease: "power4.out" }, "-=.35"); }
      else { window.lenis?.start(); tl = gsap.timeline({ onComplete: () => menu.classList.remove("open") }).to(menu, { clipPath: "inset(0 0 100% 0)", duration: reduce ? 0 : 0.6, ease: "power3.inOut" }); }
    };
    btn.addEventListener("click", () => open(true));
    menu.querySelector("[data-menu-close]").addEventListener("click", () => open(false));
    addEventListener("keydown", (e) => { if (e.key === "Escape" && menu.classList.contains("open")) open(false); });

    // On scroll down the first row ([WORK]…) slides up and [CONTACT][MENU] rise in — after passing the hero height
    const first = nav.querySelector(".set.first"), second = nav.querySelector(".set.second");
    let down = null;
    const swap = () => {
      if (!first) return;
      const d = page !== "home" || scrollY > innerHeight * 0.9;
      if (d === down || innerWidth <= 640) return;
      down = d;
      if (d) { gsap.to(first, { y: "-100%", opacity: 0, pointerEvents: "none", duration: 0.5, ease: "power4.out" }); gsap.to(second, { y: "0%", opacity: 1, pointerEvents: "auto", duration: 0.5, ease: "power3.inOut" }); }
      else { gsap.to(second, { y: "100%", opacity: 0, pointerEvents: "none", duration: 0.5, ease: "power4.out" }); gsap.to(first, { y: "0%", opacity: 1, pointerEvents: "auto", duration: 0.5, ease: "power3.inOut" }); }
    };
    addEventListener("scroll", swap, { passive: true }); swap();
  }

  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    const ico = '<svg viewBox="0 0 14 14" fill="currentColor" aria-hidden="true"><rect x="2" y="2" width="10" height="10" rx="2"/></svg>';
    foot.className = "footer"; foot.id = "contact";
    foot.innerHTML = `<div class="ft-in">
      <div class="ft-cols mono">
        <div class="ft-col"><span class="label">Menu/</span>${links.map(([, h, l]) => `<a class="bracket" href="${h}">${l}</a>`).join("")}</div>
        <div class="ft-col"><span class="label">Headquarters/</span><span>City name, Country</span><span>Working Area</span></div>
        <div class="ft-col"><span class="label">Newsletter/</span><form class="nl" data-nl><label class="vh" for="ft-mail">Email</label><input id="ft-mail" type="email" placeholder="EMAIL" required><button type="submit" aria-label="Send">↗</button></form><span>Your news notice line here.</span></div>
        <div class="ft-col"><span class="label">Socials/</span><div class="socials"><a href="#" aria-label="Social 1">${ico}</a><a href="#" aria-label="Social 2">${ico}</a><a href="#" aria-label="Social 3">${ico}</a></div></div>
      </div>
      <div class="ft-mark" data-fx="ink-reveal-wordmark"><span data-fx-part="word">STUDIØ</span></div>
      <div class="ft-bottom mono"><nav><a href="#">Privacy policy</a><a href="#">Support</a></nav><span>© 0000 Studio Name. All rights reserved.</span></div>
    </div>`;
    foot.querySelector("[data-nl]").addEventListener("submit", (e) => e.preventDefault());
  }

  const cookie = document.createElement("aside");
  cookie.className = "cookie"; cookie.setAttribute("aria-label", "Cookie Notice");
  cookie.innerHTML = `<div class="c-head"><span class="c-ico" aria-hidden="true"></span><p class="c-title">A long time ago, in a browser far, far away…</p></div>
    <p class="c-body mono">Your cookie notice here in about three lines. What is collected and why.</p><button class="c-ok bracket" type="button">Accept and continue</button>`;
  document.body.append(cookie);

  if (!reduce && window.Lenis) {
    const lenis = new Lenis({ lerp: 0.08, wheelMultiplier: 0.9 });
    window.lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // Cookie card — pops up after .3s with .4s back.out(1.7), and disappears with .4s power3.in when pressed
  gsap.fromTo(cookie, { scale: 0.85, opacity: 0 }, { scale: 1, opacity: 1, duration: reduce ? 0 : 0.4, delay: 0.3, ease: "back.out(1.7)" });
  cookie.querySelector(".c-ok").addEventListener("click", () => gsap.to(cookie, { opacity: 0, scale: 1, duration: 0.4, ease: "power3.in", onComplete: () => gsap.set(cookie, { visibility: "hidden" }) }));

  // Word rise (titles) · line rise (paragraphs): words are wrapped as chunks, and the spaces between are left as they are
  const splitWords = (el) => {
    const walk = (n) => [...n.childNodes].forEach((c) => {
      if (c.nodeType === 3) {
        const frag = document.createDocumentFragment();
        c.textContent.split(/(\s+)/).forEach((p) => { if (!p) return; if (/^\s+$/.test(p)) frag.append(p); else { const m = document.createElement("span"); m.className = "w-mask"; const w = document.createElement("span"); w.className = "w-rise"; w.textContent = p; m.append(w); frag.append(m); } });
        c.replaceWith(frag);
      } else if (c.nodeType === 1 && c.tagName !== "BR") walk(c);
    });
    walk(el);
    return el.querySelectorAll(".w-rise");
  };
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    document.querySelectorAll('[data-rise="words"]').forEach((el) => {
      const words = splitWords(el);
      const go = { y: 0, rotate: 0, opacity: 1, filter: "blur(0px)", duration: +(el.dataset.dur || 1.4), stagger: +(el.dataset.stagger || 0.07), ease: "natureSway" };
      if (el.dataset.now !== undefined) gsap.to(words, { ...go, delay: +(el.dataset.delay || 0) });
      else gsap.to(words, { ...go, scrollTrigger: { trigger: el, start: el.dataset.start || "top 85%", toggleActions: "play none none none" } });
    });
    document.querySelectorAll('[data-rise="lines"]').forEach((el) => {
      const lines = el.querySelectorAll(".l-rise");
      const go = { y: 0, opacity: 1, duration: 1.1, stagger: 0.2, ease: "power4.out" };
      if (el.dataset.now !== undefined) gsap.to(lines, { ...go, delay: +(el.dataset.delay || 0) });
      else gsap.to(lines, { ...go, scrollTrigger: { trigger: el, start: el.dataset.start || "top 95%", toggleActions: "play none none none" } });
    });
    const ftIn = document.querySelector(".footer .ft-in");
    if (ftIn) gsap.fromTo(ftIn, { yPercent: -30 }, { yPercent: 0, ease: "none", scrollTrigger: { trigger: ".footer", start: "top bottom", end: "bottom bottom", scrub: true } });
  });

  // Page transition: pressing a case panel (data-fade) fades the whole body out over .8s power3.inOut before navigating (original case link as is)
  if (!reduce) {
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[data-fade][href]");
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || a.target) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || !/\.html$/.test(url.pathname) || url.pathname === location.pathname) return;
      e.preventDefault();
      gsap.to(document.body, { opacity: 0, duration: 0.8, ease: "power3.inOut", onComplete: () => { location.href = url.href; } });
    });
    addEventListener("pageshow", (e) => { if (e.persisted) gsap.set(document.body, { opacity: 1 }); });
  }
})();
