// Common to all pages: draws in the logo, header, menu drawer, transition curtain, booking, careers strip and footer, and hooks up smooth scroll, text-line masking, grayscale → color, parallax and tabs.
// Original value: curve primary = cubic-bezier(.17,.84,.44,1) · text line yPercent 100 → 0, line stagger .1s, duration .8 × (text px/14)^.2
// Menu open clip-path inset(0 0 0 100%) → 0, expo.inOut 1s · items yPercent 100, power1.out, .8 + i/50 s
// Transition curtain autoAlpha 1 (.2s power2.in) → navigate → autoAlpha 0 (.8s power1.out, after .3s)
(() => {
  gsap.registerPlugin(ScrollTrigger, CustomEase, SplitText);
  CustomEase.create("primary", "0.17, 0.84, 0.44, 1");

  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const page = document.body.dataset.page || "home";
  const isMd = () => matchMedia("(min-width: 768px)").matches;
  const DB = (window.DB = { reduced, lenis: null, isMd });

  const arrow = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M.9 10.8V9.2l15.8-.1-7.2-7.1L10.7.8 19.9 10l-9.2 9.2-1.2-1.2 7.2-7.1-15.8-.1Z"/></svg>';
  const back = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M7.5 4.6 8.7 5.8 5.4 9.1h8.1a4.6 4.6 0 0 1 0 9.2h-2.2v-1.7h2.2a2.9 2.9 0 0 0 0-5.8H5.4l3.3 3.3-1.2 1.2L2.2 10Z"/></svg>';
  const ext = '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><rect x="1" y="3" width="8" height="8"/><path d="M4 1h7v7"/></svg>';
  // Instead of the original logo, a placeholder newly drawn with the same composition (round slogan + narrow wordmark + small line below + years on both sides)
  const logo = (id) => `<svg viewBox="0 0 140 82" fill="currentColor" aria-label="Logo slot">
      <defs><path id="${id}" d="M22 30 Q70 -6 118 30"/></defs>
      <text font-size="9" font-style="italic" font-family="Libre Baskerville, serif"><textPath href="#${id}" startOffset="50%" text-anchor="middle">Slogan goes here</textPath></text>
      <text x="70" y="56" text-anchor="middle" font-size="27" font-family="Oswald, sans-serif" letter-spacing=".5">WORDMARK</text>
      <text x="70" y="76" text-anchor="middle" font-size="14" font-family="Oswald, sans-serif" letter-spacing="3">SHOP</text>
      <text x="4" y="69" font-size="6" font-family="Oswald, sans-serif">ES</text><text x="4" y="76" font-size="6" font-family="Oswald, sans-serif">TD</text>
      <text x="128" y="69" font-size="6" font-family="Oswald, sans-serif">20</text><text x="128" y="76" font-size="6" font-family="Oswald, sans-serif">00</text>
    </svg>`;
  const slash = '<svg class="db-slash" viewBox="0 0 16 11" aria-hidden="true"><path d="M0 9.3 13.6 0 16 1.7 2.4 11Z" fill="currentColor"/></svg>';
  DB.icons = { arrow, ext, logo, slash };

  const links = [
    ["index.html", "First Page", "home"],
    ["index.html#concept", "Concept"],
    ["service.html", "About the service", "service"],
    ["index.html#stylist", "Stylist"],
    ["lookbook.html", "Gallery", "lookbook"],
    ["index.html#price", "Price list"],
    ["index.html#news", "News"],
    ["index.html#info", "Store info"],
    ["recruit.html", "Hiring Info", "recruit"],
  ];
  const cur = (k) => (k && k === page ? ' aria-current="page"' : "");
  const langs = (mask) => `<ul class="db-langs">${["KO", "EN", "JA", "CN"].map((l, i) => `<li>${i ? "<i></i>" : ""}<a href="#"${i ? "" : " aria-current=\"true\""}>${mask ? `<span class="db-mask"><span>${l}</span></span>` : l}</a></li>`).join("")}</ul>`;
  const sns = (mask) => `<ul class="db-sns">${["SNS 1", "SNS 2", "SNS 3"].map((s) => `<li>${mask ? '<span class="db-mask"><span>' : ""}<a href="#">( ${s} ${ext} )</a>${mask ? "</span></span>" : ""}</li>`).join("")}</ul>`;

  // ---------- Drawing in ----------
  const hd = document.querySelector('[data-slot="header"]');
  if (hd) {
    hd.innerHTML = `
      <a class="db-logo" href="index.html" aria-label="First Page">${logo("lg-h")}</a>
      <div class="db-head">
        <ul class="db-head__cta"><li><a class="db-head__tel" href="#">Tel 00 0000 0000</a></li><li><a class="db-head__book" href="#">Reservation</a></li></ul>
        <div class="db-burger-hit"><button class="db-burger" type="button" aria-label="Menu" aria-expanded="false"><span></span><span></span><span></span></button></div>
        <div class="db-head__break"></div>
        <div class="db-head__langs--md">${langs(false)}</div>
        <div class="db-head__sp"><ul class="db-langs"><li><a href="#">Tel</a></li><li><i></i><a href="#">Reservation</a></li></ul></div>
      </div>
      <div class="db-veil"></div>
      <nav class="db-nav" hidden aria-label="Main menu">
        <ul class="db-nav__list">${links.map(([h, t, k]) => `<li><a href="${h}"${cur(k)}><span class="db-mask"><span>${t}</span></span></a></li>`).join("")}</ul>
        <div class="db-nav__foot">${langs(true)}${sns(true)}</div>
      </nav>`;
  }

  const ap = document.querySelector('[data-slot="appointment"]');
  if (ap) {
    ap.classList.add("db-sec", "db-white", "db-appo");
    ap.id = "appointment";
    ap.innerHTML = `<div class="db-wrap">
      <div class="db-appo__grid">
        <div class="db-hg" style="margin:0">${slash}
          <p class="db-appo__lead" data-split>Your short guide line here</p>
          <h2 data-split data-label="Your English Booking section name here">Book a Visit</h2>
        </div>
        <ul class="db-book">
          <li><a href="#"><div class="db-book__dot"><i></i></div><small>Book by phone</small><b>00 0000 0000</b></a><div class="db-book__note"><p>Your one-line accepted language here</p></div></li>
          <li><a href="#"><div class="db-book__dot"><i></i></div><small>Book via messenger</small><b>Line</b></a><div class="db-book__note"><p>Your one-line condition for receiving here</p><p style="display:flex;gap:1.25rem;align-items:baseline"><b class="db-latin" style="font-size:.75rem">For guests</b><span class="db-sns"><a href="#">( SNS 1 ${ext} )</a></span></p></div></li>
          <li><a href="#"><div class="db-book__dot"><i></i></div><small>Book via Web</small><b>Web</b></a></li>
        </ul>
      </div>
      <section class="db-policy">
        <h3 data-split>Your policy title here</h3>
        <div>
          <p>Your one-line note that booking is required here</p>
          <h4>Your single subheading here</h4>
          <p>About two lines here on what happens with same-day and no-show cancellations. Continue the body copy here.<br>Your deadline for changes here.<br>e.g. One example line here</p>
          <h4>Your subheading two here</h4>
          <p>Your notice for running late goes here. Add two lines of body copy here.<br>Your body text continues here, <strong>Your bold one-line condition statement here</strong>...are included (your parenthetical note goes here). Add one more line of body copy here and wrap up.</p>
        </div>
      </section>
    </div>`;
  }

  const rb = document.querySelector('[data-slot="recruit-block"]');
  if (rb) {
    rb.classList.add("db-rec");
    rb.innerHTML = `
      <div class="db-para" style="--off:3rem"><div class="wf-img db-tone db-gs" data-label="Customer seated in a chair in the shop and a barber trimming hair · black and white under fluorescent light · low angle landscape wide"></div></div>
      <div class="db-rec__box">
        <div class="db-rec__en"><em>Be</em><span>Headline here.</span></div>
        <h3><span class="db-line"><span>Your short title here,</span></span><span class="db-line"><span>Set in two lines.</span></span></h3>
        <p class="db-rec__copy"><span class="db-line"><span>Your hiring notice body goes here in one line,</span></span><span class="db-line"><span>The second continuing line goes here.</span></span></p>
        <div class="db-rec__go"><a class="db-more" href="recruit.html">Recruit <i>${arrow}</i></a></div>
      </div>`;
  }

  const ft = document.querySelector('[data-slot="footer"]');
  if (ft) {
    const nx = ft.dataset;
    ft.classList.add("db-foot");
    ft.innerHTML = `<div class="db-foot__grid">
      <aside>
        <a class="db-next" href="${nx.next || "service.html"}">
          <div class="db-para" style="--off:2rem"><div class="wf-img" data-label="${nx.nextLabel || "Storefront standing sign · black and white · angled front view"}"></div></div>
          <div class="db-next__txt">
            <p class="db-next__big"><span>${nx.nextTitle || "Next<br>Contents"}</span><span class="db-next__arrow">${nx.nextIcon === "return" ? back : arrow}</span></p>
            <p class="db-next__sub">${nx.nextSub || "View next page"}</p>
          </div>
        </a>
      </aside>
      <footer class="db-footer" id="site-footer">
        <div class="db-footer__logo">${logo("lg-f")}</div>
        <div class="db-footer__mid">
          <ul class="db-footer__call"><li><a href="#">00 0000 0000</a></li><li><a href="#">Line</a></li><li><a href="#">Web</a></li></ul>
          <ul class="db-footer__nav">${links.slice(1).map(([h, t]) => `<li><a href="${h}">${t}</a></li>`).join("")}</ul>
        </div>
        <div class="db-footer__bot">
          <div class="db-footer__loc">
            <p>Location</p>
            <p class="db-footer__addr">Address line one, 0-00-0<br>Address line two, City<br>〒000-0000</p>
            <p class="db-footer__copy">©0000 WORDMARK SHOP</p>
          </div>
          <div class="db-footer__sns">${sns(false)}</div>
        </div>
      </footer>
    </div>`;
  }

  document.querySelectorAll(".db-more > i:empty").forEach((i) => (i.innerHTML = arrow));
  document.querySelectorAll(".hm-mark, .hm-concept__mark").forEach((m) => (m.innerHTML = slash));
  document.querySelectorAll(".db-sns-a").forEach((a) => (a.innerHTML = `( ${a.textContent} ${ext} )`));

  // ---------- Smooth scroll ----------
  if (!reduced && window.Lenis) {
    // Original: lenis 1.3.1 as { lerp: .1, anchors: true } With (ReactLenis root)
    const lenis = new Lenis({ lerp: 0.1, anchors: true, autoRaf: false });
    DB.lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // ---------- Menu drawer ----------
  const burger = document.querySelector(".db-burger");
  const nav = document.querySelector(".db-nav");
  const veil = document.querySelector(".db-veil");
  let navState = "CLOSED", busy = false;
  const lines = burger ? burger.querySelectorAll("span") : [];
  // The original counts numbers separately per group (menu list, language, SNS), delaying .02s each
  const order = (s) => [...s.closest("ul").querySelectorAll(".db-mask > span")].indexOf(s);
  function openNav() {
    if (busy) return;
    navState = "OPENED"; busy = true; burger.setAttribute("aria-expanded", "true");
    nav.hidden = false;
    gsap.fromTo(nav, { clipPath: "inset(0 0 0 100%)" }, { clipPath: "inset(0 0 0 0%)", ease: "expo.inOut", duration: 1, onComplete: () => (busy = false) });
    gsap.to(veil, { autoAlpha: 1 });
    nav.querySelectorAll(".db-mask > span").forEach((s) => gsap.fromTo(s, { yPercent: 100 }, { yPercent: 0, ease: "power1.out", delay: 0.8 + order(s) / 50 }));
    gsap.to([lines[0], lines[2]], {
      scaleX: 0, ease: "power2.in", duration: 0.3,
      onComplete: () => {
        gsap.set(lines[0], { top: 0, bottom: 0, margin: "auto 0" });
        gsap.set([lines[0], lines[1]], { transformOrigin: "center", scaleX: 1 });
        gsap.to(lines[0], { rotate: 25, ease: "power2.out", duration: 0.6, delay: 0.1 });
        gsap.to(lines[1], { rotate: -25, ease: "power2.out", duration: 1, delay: 0.1 });
      },
    });
    gsap.to(lines[1], { scaleX: 1 });
  }
  function closeNav() {
    if (busy || navState !== "OPENED") return;
    navState = "CLOSED"; busy = true; burger.setAttribute("aria-expanded", "false");
    nav.querySelectorAll(".db-mask > span").forEach((s) => gsap.to(s, { yPercent: -100, ease: "power2.in", delay: order(s) / 50 }));
    gsap.to(nav, { clipPath: "inset(0 0 0 100%)", ease: "expo.out", duration: 1, delay: 0.6, onComplete: () => { nav.hidden = true; busy = false; } });
    gsap.to(veil, { autoAlpha: 0, delay: 0.6 });
    gsap.to([lines[0], lines[1]], {
      scaleX: 0, ease: "power2.in", duration: 0.3,
      onComplete: () => {
        gsap.set(lines[0], { clearProps: "top,bottom,margin", transformOrigin: "left", rotate: 0 });
        gsap.set(lines[1], { transformOrigin: "right", rotate: 0 });
        gsap.to([lines[0], lines[2]], { scaleX: 1, ease: "power2.out", duration: 0.8 });
        gsap.to(lines[1], { scaleX: 0.45444, ease: "power2.out", duration: 0.8 });
      },
    });
  }
  if (burger) {
    burger.addEventListener("click", () => (navState === "OPENED" ? closeNav() : openNav()));
    veil.addEventListener("click", closeNav);
    addEventListener("keydown", (e) => e.key === "Escape" && closeNav());
  }

  // ---------- Transition curtain: same-page # goes curtain → scroll .8s → lift, other pages go curtain → navigate ----------
  const layer = document.querySelector(".db-layer");
  if (layer) {
    gsap.set(layer, { autoAlpha: 1 });
    gsap.to(layer, { autoAlpha: 0, duration: reduced ? 0 : 0.8, ease: "power1.out", delay: reduced ? 0 : 0.3 });
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || e.metaKey || e.ctrlKey || a.target === "_blank") return;
      const href = a.getAttribute("href");
      if (!href || href === "#" || /^(https?:|mailto:|tel:)/.test(href)) { if (href === "#") { e.preventDefault(); e.stopPropagation(); } return; }
      const [file, hash] = href.split("#");
      const here = location.pathname.split("/").pop() || "index.html";
      e.preventDefault();
      // Original menu links are "/#id" Because of its form, Lenis anchors can’t catch it — handled here "#id" Let this block handle it so it does not bubble up to Lenis
      e.stopPropagation();
      // Original: after the curtain fully covers, close the menu (the closing motion happens behind the curtain), and if it is the same page scroll in .8s and then lift the curtain
      const shut = () => { if (navState === "OPENED") { busy = false; closeNav(); } };
      if ((file === "" || file === here) && hash) {
        const target = document.getElementById(hash);
        const out = () => gsap.to(layer, { autoAlpha: 0, duration: reduced ? 0 : 0.8, ease: "power1.out", delay: reduced ? 0 : 0.3 });
        gsap.to(layer, {
          autoAlpha: 1, duration: reduced ? 0 : 0.2, ease: "power2.in",
          onComplete: () => {
            shut();
            if (DB.lenis) DB.lenis.scrollTo(target, { duration: 0.8, onComplete: out }); else { target.scrollIntoView(); out(); }
          },
        });
        return;
      }
      gsap.to(layer, { autoAlpha: 1, duration: reduced ? 0 : 0.2, ease: "power2.in", onComplete: () => (location.href = href) });
    });
    addEventListener("pageshow", (e) => e.persisted && gsap.set(layer, { autoAlpha: 0 }));
    if (location.hash) {
      const t = document.getElementById(location.hash.slice(1));
      if (t) requestAnimationFrame(() => (DB.lenis ? DB.lenis.scrollTo(t, { immediate: true }) : t.scrollIntoView()));
    }
  }

  // ---------- Tabs (service·gallery): upper and lower tabs move together ----------
  // Original: pressing it changes the URL to ?tab= Write it in, blur the panel over .2s, then lock-scroll over .8s to a spot 80px above the tab group → swap the panel and
  // If already at that spot, wait 400ms, then the new panel rises from 2rem below and transparent in .5s (power1.out). URL ?tab= If present, it opens to that tab
  document.querySelectorAll("[data-tabs]").forEach((root) => {
    const panels = [...root.querySelectorAll(".db-panel")];
    const bars = document.querySelectorAll(`[data-tabbar="${root.dataset.tabs}"]`);
    const anchor = bars[0] || root;
    const mark = (i) => bars.forEach((b) => b.querySelectorAll(".db-tab").forEach((t, j) => t.setAttribute("aria-selected", String(i === j))));
    const show = (i) => {
      panels.forEach((p, j) => (p.hidden = i !== j));
      ScrollTrigger.refresh();
      root.dispatchEvent(new CustomEvent("tabchange", { detail: i }));
    };
    const select = (i, move) => {
      mark(i);
      if (!move) { show(i); return; }
      gsap.to(panels, { opacity: 0, duration: reduced ? 0 : 0.2 });
      const done = () => {
        show(i);
        const settled = Math.round(anchor.getBoundingClientRect().top) === 80;
        setTimeout(() => gsap.fromTo(panels[i], { opacity: 0, y: "2rem" }, { opacity: 1, y: 0, duration: reduced ? 0 : 0.5 }), reduced || !settled ? 0 : 400);
      };
      if (DB.lenis) DB.lenis.scrollTo(anchor, { offset: -80, lock: true, duration: 0.8, onComplete: done });
      else { scrollTo({ top: anchor.getBoundingClientRect().top + scrollY - 80 }); done(); }
    };
    bars.forEach((b) => b.querySelectorAll(".db-tab").forEach((t, j) => t.addEventListener("click", () => {
      history.replaceState(null, "", `?tab=${j + 1}`);
      select(j, true);
    })));
    const want = Number(new URLSearchParams(location.search).get("tab")) - 1;
    if (want > 0 && want < panels.length) { select(want, false); requestAnimationFrame(() => (DB.lenis ? DB.lenis.scrollTo(anchor, { offset: -80, immediate: true }) : scrollTo(0, anchor.getBoundingClientRect().top + scrollY - 80))); }
    else select(0, false);
  });

  // ---------- Scroll motion ----------
  const durFor = (el) => 0.8 * Math.pow(parseFloat(getComputedStyle(el).fontSize) / 14, 0.2);
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const startDelay = page === "home" ? 1.4 : 0.1;
    // The original always delays by .1s (animateOptions delay .1) — only items in the hero wait longer, until the loader and transition curtain lift
    const ready = (el) => (el.getBoundingClientRect().top < innerHeight ? startDelay : 0.1);

    // Text pre-split into lines (.db-line)
    document.querySelectorAll(":is(h1,h2,h3,p,div):has(> .db-line)").forEach((el) => {
      gsap.from(el.querySelectorAll(":scope > .db-line > span"), {
        yPercent: 100, stagger: { each: 0.1 }, duration: durFor(el), ease: "primary", delay: ready(el),
        scrollTrigger: { trigger: el },
      });
    });
    // Paragraphs find their lines with SplitText and mask them. Lines can’t be measured inside hidden tab panels so they are split when the panel opens
    const split = (root) => root.querySelectorAll("[data-split]:not([data-split-done])").forEach((el) => {
      if (el.closest("[hidden]")) return;
      el.dataset.splitDone = "";
      SplitText.create(el, {
        type: "lines", mask: "lines", autoSplit: true,
        onSplit: (self) => gsap.from(self.lines, {
          yPercent: 100, stagger: { each: 0.1 }, duration: durFor(el), ease: "primary", delay: ready(el),
          scrollTrigger: { trigger: el },
        }),
      });
    });
    split(document);
    document.querySelectorAll("[data-tabs]").forEach((r) => r.addEventListener("tabchange", () => { split(r); ScrollTrigger.refresh(); }));
    // Grayscale → color: 1s once half the element reaches the screen bottom, reversed on scroll back
    document.querySelectorAll(".db-gs").forEach((el) => {
      gsap.fromTo(el, { "--gs": 1 }, { "--gs": 0, duration: 1, scrollTrigger: { trigger: el, start: "50% bottom", toggleActions: "play reverse play reverse" } });
    });
    // Parallax photo
    document.querySelectorAll(".db-para").forEach((box) => {
      const img = box.firstElementChild;
      const off = parseFloat(getComputedStyle(box).getPropertyValue("--off")) * parseFloat(getComputedStyle(document.documentElement).fontSize) || 0;
      gsap.fromTo(img, { y: -off / 2 }, { y: off / 2, ease: "none", scrollTrigger: { trigger: box, start: "top bottom", end: "bottom top", scrub: true } });
    });
  });
  mm.add("(prefers-reduced-motion: reduce)", () => {
    document.querySelectorAll(".db-gs").forEach((el) => el.style.setProperty("--gs", 0));
  });

  addEventListener("load", () => ScrollTrigger.refresh());
})();
