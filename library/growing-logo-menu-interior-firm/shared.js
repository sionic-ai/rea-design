/* Devices shared by all pages: header (clock, menu panel, story drawer), footer (contact band, ruler), page transition, first-entry frame, reveal motion, Lenis. 
   Header and footer markup is built once here so every page keeps the same shape. */
(() => {
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) root.classList.add("tw-reduce");
  gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase, Draggable, InertiaPlugin);
  const EASE_BUTTON = CustomEase.create("twButton", "0.66,0.01,0.12,0.98");
  const EASE_MENU = CustomEase.create("twMenu", "0.35,0,0.35,1");

  const page = document.body.dataset.page || "index";
  const LINKS = [
    ["Approach", "#"],
    ["Services", "service.html"],
    ["People", "#"],
    ["Projects", "works.html"],
    ["Vision", "about.html"],
    ["Studio", "#"],
    ["Impact", "#"],
    ["Journal", "news.html"],
  ];
  const here = (href) => href === `${page}.html` || (page === "article" && href === "news.html");

  const ARROW = '<svg viewBox="0 0 11 8" fill="none" aria-hidden="true"><path d="M0 4h9.5M6.5 1l3 3-3 3" stroke="currentColor" stroke-width="1.4"/></svg>';
  const arrowBadge = (cls = "") => `<span class="tw-arrow ${cls}" aria-hidden="true">${ARROW}${ARROW}</span>`;
  window.twArrow = arrowBadge;

  // ── Header ──
  const tickerCards = Array.from({ length: 7 }, (_, i) => {
    const wide = i === 2 || i === 5;
    const labels = ["Office lounge · daytime window light · portrait", "Team portrait shot · warm indoor lighting · portrait", "Completed site overview · overcast day · landscape", "Designer’s work desk · from above · portrait", "Event group photo · Evening · Portrait", "Meeting room · arched wall · landscape", "Reception desk · Front view · Portrait"];
    return `<a class="tw-ticker__card${wide ? " is-wide" : ""}" href="article.html"><div class="wf-img tw-ph is-dark" data-label="${labels[i]}"></div><p>Your News title $ here{i + 1}</p></a>`;
  }).join("");
  const navLinks = LINKS.map(([t, href]) => `<a href="${href}" class="${here(href) ? "is-current" : ""}">${ARROW}<span>${t}</span></a>`).join("");
  const head = document.createElement("header");
  head.className = "tw-head";
  head.dataset.slot = "header";
  head.innerHTML = `
    <div class="tw-head__veil" data-menu-close></div>
    <div class="tw-wrap tw-head__bar">
      <div class="tw-clock" aria-label="Current time"><span class="tw-pill"><span data-hh>00</span></span><span>:</span><span class="tw-pill"><span data-mm>00</span></span><span class="tw-clock__zone">GMT</span></div>
      <button class="tw-btn tw-head__talk" type="button" data-talk><span class="tw-btn__label">Contact</span>${arrowBadge()}</button>
      <div class="tw-panel-wrap"><div class="tw-panel" data-slot="menu-panel">
        <div class="tw-panel__top">
          <a class="tw-logo" href="index.html" aria-label="First Page">Wordmark<span class="tw-tm">TM</span></a>
          <div class="tw-panel__tools">
            <button class="tw-panel__talk" type="button" data-talk>Contact</button>
            <button class="tw-menu-btn" type="button" aria-label="Open Menu" aria-expanded="false"><i></i><b></b></button>
          </div>
        </div>
        <div class="tw-panel__body" data-lenis-prevent inert>
          <nav class="tw-panel__nav" aria-label="Main menu">${navLinks}</nav>
          <div class="tw-panel__lately">
            <p class="tw-panel__label">Recent News</p>
            <div class="tw-ticker" data-slot="menu-ticker"><div class="tw-ticker__track"><div class="tw-ticker__copy">${tickerCards}</div></div></div>
          </div>
        </div>
      </div></div>
    </div>`;
  document.body.prepend(head);

  // ── Story Drawer ──
  const talk = document.createElement("div");
  talk.className = "tw-talk";
  talk.dataset.slot = "contact-sheet";
  talk.setAttribute("aria-hidden", "true");
  const rows = [["Name*", "Please write your name"], ["Email*", "Please write your email address"], ["Company", "Company name"], ["What kind of job is it?*", "Please choose from the list"]];
  talk.innerHTML = `
    <div class="tw-talk__veil" data-talk-close></div>
    <div class="tw-talk__sheet" role="dialog" aria-label="Inquiry" data-lenis-prevent>
      <button class="tw-nav-btn tw-talk__close" type="button" data-talk-close aria-label="Close"><svg viewBox="0 0 10 10" aria-hidden="true"><path d="M1 1l8 8M9 1L1 9" stroke="currentColor" stroke-width="1.4"/></svg></button>
      <div class="tw-talk__top">
        <p class="tw-h4" data-label="Your English opening line for contact here">Let's talk...</p>
        <div class="tw-talk__contacts">${["Main Phone", "Hiring", "New Job Phone", "Partner inquiries", "", "New Job Email"].map((t) => t ? `<p><span>${t}</span><a class="tw-line" href="#">00 0000 0000</a></p>` : "<p></p>").join("")}</div>
      </div>
      <form class="tw-form" onsubmit="return false">
        ${rows.map(([l, ph], i) => `<div class="tw-form__row"><label><span class="tw-pill">0${i + 1}</span>${l}</label><input placeholder="${ph}"></div>`).join("")}
        <div class="tw-form__row is-tall"><label><span class="tw-pill">05</span>Message*</label><textarea placeholder="Please write your message here"></textarea></div>
        <div class="tw-talk__faces">${Array.from({ length: 6 }, (_, i) => `<div class="wf-img tw-ph" data-label="Person in charge ${i + 1} Face · Portrait"></div>`).join("")}</div>
        <div class="tw-form__foot"><label><input type="checkbox"> I agree to the privacy policy.</label><button class="tw-btn" type="submit"><span class="tw-btn__label">Send</span>${arrowBadge()}</button></div>
      </form>
    </div>`;
  document.body.append(talk);

  // ── Footer ──
  const foot = document.createElement("footer");
  foot.dataset.slot = "footer";
  foot.innerHTML = `
    <div class="tw-cta" data-header-scheme="dark" data-slot="footer-cta">
      <div class="wf-img tw-ph is-dark" data-label="Open book on cafe table · golden striped curtain · full-width landscape"></div>
      <div class="tw-cta__card" role="button" tabindex="0" data-talk><p data-label="Your one English sentence inviting inquiries here · bold underline on the last word">Planning a new space? <span class="tw-heavy">Let's talk.<span class="tw-heavy__line"></span></span></p></div>
    </div>
    <div class="tw-foot" data-header-scheme="dark">
      <div class="tw-foot__in">
        <div class="tw-foot__top">
          <div class="tw-foot__mark">
            <svg class="tw-foot__badge" viewBox="0 0 64 64" aria-hidden="true"><ellipse cx="32" cy="32" rx="18" ry="30" fill="none" stroke="currentColor" stroke-width="2.4"/><text x="32" y="38" text-anchor="middle" class="tw-foot__badge-t" transform="rotate(-90 32 32)">AB</text></svg>
            <div class="tw-foot__word"><svg viewBox="0 0 585 112" aria-label="Wordmark"><text x="0" y="104" textLength="585" lengthAdjust="spacingAndGlyphs" class="tw-foot__word-t">Wordmark</text></svg></div>
          </div>
          <div class="tw-ruler" data-slot="scroll-ruler">
            <div class="tw-ruler__layer tw-ruler__base"><div class="tw-ruler__ticks"></div></div>
            <div class="tw-ruler__layer tw-ruler__fill"><div class="tw-ruler__ticks"></div></div>
            <div class="tw-ruler__tag"><i></i>
              <div class="tw-meter"><div class="wf-img tw-ph is-dark" data-label="Comparison photo · Horizontal"></div>
                <div class="tw-meter__text"><strong>So far <span data-metres>0cm</span> It came down</strong><p class="tw-small" data-compare>Write something here that matches that length.</p></div>
              </div>
            </div>
          </div>
        </div>
        <div class="tw-foot__cols">
          <div class="tw-foot__info">
            <div class="tw-foot__group"><p class="tw-serif">Address</p><p class="tw-small">Your address first line here,<br>Your address second line here</p></div>
            <div class="tw-foot__group"><p class="tw-serif">Email</p><a class="tw-small tw-line" href="#">hello@example.com</a></div>
            <div class="tw-foot__group"><p class="tw-serif">Follow</p><div class="tw-small"><a class="tw-line" href="#">Social 1</a><br><a class="tw-line" href="#">Social 2</a></div></div>
          </div>
          <div class="tw-foot__explore">
            <p class="tw-serif">Explore</p>
            <nav class="tw-foot__big">${LINKS.map(([t, href]) => `<a href="${href}" class="${here(href) ? "is-current" : ""}">${t}</a>`).join("")}</nav>
          </div>
          <div class="tw-foot__legal tw-small">${["Hiring", "Operating principles", "Privacy policy", "Cookie", "Fair Trade", "Declaration of Human Rights", "Social Responsibility", "Equal Opportunity"].map((t) => `<a class="tw-line" href="${t === "Hiring" ? "recruit.html" : "#"}" style="width:fit-content">${t}</a>`).join("")}</div>
          <div class="tw-foot__base"><span>© 0000 Your company name here</span><span><span>Brand · Web <a class="tw-line is-on" href="#">Studio 1</a></span><span>Production <a class="tw-line is-on" href="#">Studio 2</a></span></span></div>
        </div>
      </div>
    </div>`;
  const main = document.getElementById("smooth-content");
  main.append(foot);

  const curtain = document.createElement("div");
  curtain.className = "tw-curtain";
  curtain.setAttribute("aria-hidden", "true");
  document.body.append(curtain);

  // ── Lenis: same 1.3.25 defaults as the original (lerp .1) ──
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ autoRaf: false });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  window.twLenis = lenis;

  // ── Clock: City time hours · minutes ──
  const hh = head.querySelector("[data-hh]"), mm = head.querySelector("[data-mm]");
  const tick = () => {
    const [h, m] = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "UTC" }).format(new Date()).split(":");
    hh.textContent = h; mm.textContent = m;
  };
  tick(); setInterval(tick, 10000);

  // ── Header text color: dark section (data-header-scheme="dark") when the header’s center line is over it, light text ──
  const darks = () => [...document.querySelectorAll('[data-header-scheme="dark"]')];
  const scheme = () => {
    const y = 42;
    const on = darks().some((el) => { const r = el.getBoundingClientRect(); return r.top <= y && r.bottom >= y; });
    head.classList.toggle("is-light", on);
  };
  ScrollTrigger.create({ start: 0, end: "max", onUpdate: scheme, onRefresh: scheme });
  addEventListener("scroll", scheme, { passive: true });

  // ── Menu panel: width 172→680, height auto, .5s cubic-bezier(.35,0,.35,1). The inside appears in .3s, .12s late on open ──
  const panel = head.querySelector(".tw-panel"), body = head.querySelector(".tw-panel__body"), mbtn = head.querySelector(".tw-menu-btn");
  let open = false;
  const desk = () => matchMedia("(min-width: 1024px)").matches;
  const setMenu = (v) => {
    if (v === open) return;
    open = v;
    head.classList.toggle("is-open", v);
    mbtn.setAttribute("aria-expanded", String(v));
    mbtn.setAttribute("aria-label", v ? "Close Menu" : "Open Menu");
    body.inert = !v;
    if (v) lenis?.stop(); else lenis?.start();
    const d = reduce ? 0 : 0.5;
    const from = panel.offsetHeight;
    const to = v ? 44 + body.scrollHeight : 44;
    gsap.fromTo(panel, { height: from }, { height: Math.min(to, innerHeight - (desk() ? 40 : 32)), width: desk() ? (v ? 680 : 172) : "100%", duration: d, ease: EASE_MENU, overwrite: "auto" });
    gsap.to(body, { opacity: v ? 1 : 0, duration: reduce ? 0 : 0.3, delay: v && !reduce ? 0.12 : 0, overwrite: "auto" });
  };
  mbtn.addEventListener("click", () => setMenu(!open));
  head.querySelector("[data-menu-close]").addEventListener("click", () => setMenu(false));
  addEventListener("keydown", (e) => { if (e.key === "Escape") { setMenu(false); setTalk(false); } });

  // ── News strip: one set width passes in 60 seconds, pauses on hover, and throws with inertia when dragged ──
  const ticker = head.querySelector(".tw-ticker"), track = ticker.querySelector(".tw-ticker__track"), copy = track.firstElementChild;
  track.append(copy.cloneNode(true));
  track.lastElementChild.setAttribute("aria-hidden", "true");
  track.lastElementChild.querySelectorAll("a").forEach((a) => (a.tabIndex = -1));
  let w = copy.getBoundingClientRect().width, x = 0, hover = false, press = false, last = 0;
  new ResizeObserver(() => { w = copy.getBoundingClientRect().width; }).observe(copy);
  const place = () => w && gsap.set(track, { x: gsap.utils.wrap(-w, 0, x) });
  gsap.ticker.add(() => {
    const t = gsap.ticker.time, dt = last ? t - last : 0;
    last = t;
    if (reduce || hover || press || !w || !open) return;
    x -= (w / 60) * dt;
    place();
  });
  ticker.addEventListener("pointerenter", () => (hover = true));
  ticker.addEventListener("pointerleave", () => (hover = false));
  const proxy = document.createElement("div");
  let x0 = 0, p0 = 0;
  Draggable.create(proxy, {
    type: "x", trigger: ticker, inertia: true, throwResistance: 2600, maxDuration: 0.85, dragClickables: true,
    onPress() { press = true; x0 = x; p0 = this.x; },
    onDrag() { x = x0 + (this.x - p0); place(); },
    onThrowUpdate() { x = x0 + (this.x - p0); place(); },
    onRelease() { if (!this.isThrowing) press = false; },
    onThrowComplete() { press = false; },
  });

  // ── Story Drawer ──
  const setTalk = (v) => {
    talk.classList.toggle("is-open", v);
    talk.setAttribute("aria-hidden", String(!v));
    if (v) { setMenu(false); lenis?.stop(); } else if (!open) lenis?.start();
  };
  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-talk]")) { e.preventDefault(); setTalk(true); }
    else if (e.target.closest("[data-talk-close]")) setTalk(false);
  });
  document.addEventListener("keydown", (e) => { if ((e.key === "Enter" || e.key === " ") && e.target.matches?.(".tw-cta__card")) { e.preventDefault(); setTalk(true); } });

  // ── Footer ruler: distance scrolled (px ÷ 3779.53 = Fills the bright ticks up to d + (0.15u + 0.85u³)(0.5 − d) with m) and ratio u ──
  const ruler = foot.querySelector(".tw-ruler"), fill = ruler.querySelector(".tw-ruler__fill"), tag = ruler.querySelector(".tw-ruler__tag");
  const metresEl = foot.querySelector("[data-metres]"), meter = foot.querySelector(".tw-meter"), compareEl = foot.querySelector("[data-compare]");
  const COMPARE = [[0.5, "Write a 50cm item here."], [1, "Your 1m item goes here."], [2, "Your 2m item goes here."], [3, "Your 3m item goes here."]];
  let shown = null, swapT = 0;
  const meterUpdate = () => {
    const max = document.documentElement.scrollHeight - innerHeight, y = scrollY;
    const u = max > 0 ? Math.min(y / max, 1) : 0, metres = Math.max(0, y / 3779.5276);
    const H = ruler.offsetHeight, d = H ? (tag.offsetHeight / 2 + 4) / H : 0;
    const m = d + (0.15 * u + 0.85 * u * u * u) * (0.5 - d);
    fill.style.height = `calc(${m * 100}% + 1px)`;
    tag.style.top = `${m * 100}%`;
    const pick = [...COMPARE].filter((c) => c[0] <= metres).pop() || null;
    metresEl.textContent = pick ? `${pick[0]}m` : Math.round(metres * 100) >= 100 ? `${Math.round(metres)}m` : `${Math.round(metres * 100)}cm`;
    if (pick !== shown) {
      clearTimeout(swapT);
      meter.classList.add("is-swap");
      swapT = setTimeout(() => { shown = pick; compareEl.textContent = pick ? pick[1] : COMPARE[0][1]; requestAnimationFrame(() => meter.classList.remove("is-swap")); }, 250);
    }
  };
  let meterRaf = 0;
  addEventListener("scroll", () => { if (!meterRaf) meterRaf = requestAnimationFrame(() => { meterRaf = 0; meterUpdate(); }); }, { passive: true });
  addEventListener("resize", meterUpdate);
  meterUpdate();

  // ── Reveal motion ──
  // Title: each line rises 130% from below and appears (1s power3.out, .1s gap between lines, once at 85% of the screen)
  const splitUp = (el) => {
    if (reduce) { el.style.visibility = "visible"; return; }
    const run = () => SplitText.create(el, {
      type: "lines", linesClass: "split-line", autoSplit: true,
      onSplit(self) {
        el.style.visibility = "visible";
        const inners = self.lines.map((l) => { const s = document.createElement("span"); s.className = "split-line-inner"; while (l.firstChild) s.appendChild(l.firstChild); l.appendChild(s); return s; });
        return gsap.from(inners, { yPercent: 130, autoAlpha: 0, duration: +(el.dataset.dur ?? 1), ease: "power3.out", stagger: 0.1, delay: +(el.dataset.delay ?? 0), scrollTrigger: { trigger: el, start: "top 85%", once: true } });
      },
    });
    document.fonts?.status === "loaded" ? run() : document.fonts.ready.then(run);
  };
  // Block: rises from 24px below at .6s power3.out, when it enters 200px from the screen bottom
  const fadeUp = (el) => {
    if (reduce) { el.style.visibility = "visible"; return; }
    gsap.fromTo(el, { autoAlpha: 0, y: +(el.dataset.y ?? 24) }, { autoAlpha: 1, y: 0, duration: +(el.dataset.dur ?? 0.6), delay: +(el.dataset.delay ?? 0), ease: "power3.out", scrollTrigger: { trigger: el, start: "top bottom-=200", once: true } });
  };
  // Paragraph fill: each letter goes from .3 transparent to 1, scrub .5 while the section top passes between the screen bottom → 45%
  const scrollFill = (el) => {
    if (reduce) return;
    SplitText.create(el, {
      type: "words,chars", charsClass: "tw-fill-char", autoSplit: true,
      onSplit: (self) => gsap.fromTo(self.chars, { opacity: +(el.dataset.dim ?? 0.3) }, { opacity: 1, ease: "none", duration: 1.4, stagger: 0.09, scrollTrigger: { trigger: el, start: el.dataset.start || "top bottom", end: el.dataset.end || "top 45%", scrub: 0.5 } }),
    });
  };
  window.twReveal = (scope = document) => {
    scope.querySelectorAll(".tw-split").forEach(splitUp);
    scope.querySelectorAll(".tw-fade").forEach(fadeUp);
    scope.querySelectorAll(".tw-fill").forEach(scrollFill);
  };

  // ── Team card slider (Swiper 11): 8/7 slides on phone · 2.1 on tablet · 4 on desktop, gaps 12 · 16 · 24 ──
  window.twTeams = (scope = document) => scope.querySelectorAll(".tw-teams").forEach((sec) => {
    const el = sec.querySelector(".swiper");
    new Swiper(el, {
      slidesPerView: 8 / 7, spaceBetween: 12,
      breakpoints: { 768: { slidesPerView: 2.1, spaceBetween: 16 }, 1024: { slidesPerView: +(el.dataset.desk ?? 4), spaceBetween: 16 }, 1920: { slidesPerView: +(el.dataset.desk ?? 4), spaceBetween: 24 } },
      navigation: { prevEl: sec.querySelector(".tw-nav-btn.is-prev"), nextEl: sec.querySelector(".tw-nav-btn.is-next") },
    });
  });

  // ── Pinned project stack: pinned for slide height × (slide count − 1) with scrub .12. The next photo covers with inset(100% to 0), moving from 4% to 0, and the previous photo goes to −4% ──
  window.twProjects = (scope = document) => scope.querySelectorAll(".tw-projects").forEach((sec) => {
    const stage = sec.querySelector(".tw-projects__stage");
    const items = gsap.utils.toArray(".tw-pitem", sec), medias = items.map((i) => i.querySelector(".tw-pitem__media"));
    const texts = gsap.utils.toArray(".tw-ptext", sec), bar = sec.querySelector(".tw-projects__progress i");
    const n = items.length - 1;
    let cur = 0, want = 0, timer = 0;
    const show = (i) => texts.forEach((t, k) => t.classList.toggle("is-on", k === i));
    show(0);
    if (reduce || n < 1) return;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.set(items, { clipPath: (i) => (i === 0 ? "inset(0% 0 0 0)" : "inset(100% 0 0 0)"), zIndex: (i) => i + 1 });
      const intro = gsap.fromTo(medias[0], { yPercent: 0 }, { yPercent: 4, duration: 1, ease: "none", immediateRender: false });
      const st0 = ScrollTrigger.create({ trigger: sec, start: "top bottom", end: "top top", animation: intro, scrub: 0.12 });
      const tl = gsap.timeline({ defaults: { duration: 1, ease: "none" } });
      items.forEach((el, i) => {
        if (!i) return;
        tl.to(el, { clipPath: "inset(0% 0 0 0)" }, i - 1);
        tl.fromTo(medias[i], { yPercent: 4 }, { yPercent: 0 }, i - 1);
        tl.to(medias[i - 1], { yPercent: -4 }, i - 1);
      });
      const pick = (p) => {
        bar && gsap.set(bar, { scaleX: gsap.utils.clamp(0, 1, p) });
        const idx = Math.max(0, Math.min(n, Math.floor(p * n + 0.65)));
        if (idx === want) return;
        want = idx; clearTimeout(timer);
        if (idx === cur) { show(cur); return; }
        texts.forEach((t) => t.classList.remove("is-on"));
        timer = setTimeout(() => { cur = idx; show(idx); }, 200);
      };
      const st = ScrollTrigger.create({
        trigger: sec, start: "top top", end: () => `+=${stage.offsetHeight * n}`, pin: stage, pinSpacing: true, anticipatePin: 1,
        animation: tl, scrub: 0.12, invalidateOnRefresh: true, onUpdate: (s) => pick(s.progress), onRefresh: (s) => pick(s.progress),
      });
      return () => { st0.kill(); st.kill(); tl.kill(); intro.kill(); };
    });
  });

  // ── Page transition: a copy of the old screen shrinks to .94 (.6s power3.inOut) with .4 darkness (.6s power2.out), and a color curtain covers it from below (.6s power3.inOut).
  //    The new page opens with the curtain still down, and the body · white panel · header rise from below by one screen height in .8s power3.out (waits for the remainder if the .5s from the click hasn’t finished) ──
  const KEY = "tw-nav";
  const sameDoc = (a) => {
    const href = a.getAttribute("href");
    if (!href || href.startsWith("#") || a.target === "_blank" || a.hasAttribute("download")) return null;
    const u = new URL(href, location.href);
    if (u.origin !== location.origin && location.protocol !== "file:") return null;
    if (u.pathname === location.pathname) return null;
    if (!/\.html$/.test(u.pathname)) return null;
    return u;
  };
  document.addEventListener("click", (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || reduce) return;
    const a = e.target.closest("a");
    if (!a) return;
    const u = sameDoc(a);
    if (!u) return;
    const sw = a.closest(".swiper");
    if (sw?.swiper && !sw.swiper.allowClick) { e.preventDefault(); return; }
    e.preventDefault();
    setMenu(false);
    const ghost = document.createElement("div");
    ghost.className = "tw-ghost";
    const clone = main.cloneNode(true);
    clone.removeAttribute("id");
    clone.style.cssText = `position:absolute;left:0;right:0;top:${-scrollY}px`;
    clone.querySelectorAll(".pin-spacer").forEach((s) => (s.style.padding = s.style.padding));
    const dark = document.createElement("div");
    dark.className = "tw-ghost__dark";
    ghost.append(clone, head.cloneNode(true), dark);
    document.body.append(ghost);
    main.style.visibility = "hidden";
    head.style.visibility = "hidden";
    lenis?.stop();
    gsap.set(curtain, { visibility: "visible", yPercent: 100, y: 0, translate: "none" });
    gsap.to(ghost, { scale: 0.94, duration: 0.6, ease: "power3.inOut" });
    gsap.to(dark, { opacity: 0.4, duration: 0.6, ease: "power2.out" });
    gsap.to(curtain, { yPercent: 0, duration: 0.6, ease: "power3.inOut", onComplete: () => { try { sessionStorage.setItem(KEY, String(Date.now())); } catch {} location.href = u.href; } });
  });
  addEventListener("pageshow", (e) => { if (e.persisted) location.reload(); });

  const entering = (() => { try { const t = +sessionStorage.getItem(KEY); sessionStorage.removeItem(KEY); return t && Date.now() - t < 6000 ? t : 0; } catch { return 0; } })();
  window.twEntering = !!entering && !reduce;
  if (window.twEntering) {
    root.classList.add("tw-entering");
    scrollTo(0, 0);
    const a = innerHeight;
    const sheet = document.createElement("div");
    sheet.className = "tw-rise-sheet";
    document.body.append(sheet);
    gsap.set([main, sheet, head], { y: a });
    head.style.zIndex = "10002";
    const wait = Math.max(0, 0.5 - (Date.now() - entering) / 1000);
    gsap.to([main, sheet, head], {
      y: 0, duration: 0.8, ease: "power3.out", delay: wait,
      onComplete: () => { root.classList.remove("tw-entering"); sheet.remove(); head.style.zIndex = ""; gsap.set([main, head], { clearProps: "transform" }); ScrollTrigger.refresh(); },
    });
  }

  // ── Building blocks that repeat on every page — the same markup is not copied into several html files ──
  const SIGN = '<svg class="tw-team__sign" viewBox="0 0 72 40" fill="none" aria-hidden="true"><path d="M4 30c8-18 14-24 16-20s-6 22-2 22 10-26 16-24-4 18 2 18 8-10 12-10 4 6 8 4 10-6 12-8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
  const TEAM = [["Team One", "Person Name 01", "Office representative portrait · in front of a dark green sofa · warm indoor light · portrait 3:4"], ["Team Two", "Person Name 02", "Person half-length · black knit · in front of a wood wall · portrait 3:4"], ["Team Three", "Person Name 03", "Person with glasses · beige jacket · dim office · portrait 3:4"], ["Team Four", "Person Name 04", "Person half-length · navy shirt · dim bar lighting · portrait 3:4"], ["Team Five", "Person Name 05", "Person half-length · gray suit · window backlight · portrait 3:4"], ["Team Six", "Person Name 06", "Person half-length · white shirt · in front of a construction site · portrait 3:4"]];
  const teamSlides = (box) => {
    box.innerHTML = TEAM.map(([by, name, label]) => `<div class="swiper-slide"><a class="tw-team" href="about.html"><div class="wf-img tw-ph is-dark tw-shade" data-label="${label}"></div><span class="tw-team__more">${arrowBadge("is-small")}</span><div class="tw-team__txt" data-label="Your team English name and the team lead’s English name"><p class="tw-team__by">${by} by</p><p class="tw-team__name">${name}</p>${SIGN}<p class="tw-team__desc"><span><span>Your text here about the person leading this team and the spaces the team makes, about four lines. Write who it is for, how, and with what results, then the work the team cares about, why clients return, time spent together and promises for the future through the last line.</span></span></p></div></a></div>`).join("");
  };
  const PROJECTS = [
    ["Project Name 01", "Neighborhood name", "Reception wall · lime green arch · warm daylight · full width"],
    ["Project Name 02<br>Second Line", "Neighborhood name", "Pantry shelf · concrete wall · long bar light · full width"],
    ["Project Name 03<br>Second Line", "Neighborhood name", "Tiered lecture seating · black perforated wall · row of ceiling lights · full-width landscape"],
    ["Project Name 04", "Neighborhood name", "Hallway · wooden wall with vertical lights · picture-frame row · full-width landscape"],
  ];
  const projectStack = (sec) => {
    const list = PROJECTS.slice(0, +(sec.dataset.count ?? 4)), n = list.length, pad = (i) => String(i).padStart(2, "0");
    sec.innerHTML = `<div class="tw-projects__stage">
      <div class="tw-projects__text">
        <a class="tw-projects__view" href="works.html">View projects <span aria-hidden="true">&rarr;</span></a>
        <div class="tw-projects__bar"><div class="tw-projects__progress"><i></i></div><div class="tw-projects__texts">
        ${list.map(([t, place], i) => `<div class="tw-ptext"><p class="tw-ptext__count"><span class="tw-pill">${pad(i + 1)}</span>/<span class="tw-pill">${pad(n)}</span></p><div class="tw-ptext__title"><h3 class="tw-h4" data-label="Your project English name here">${t}</h3><div class="tw-ptext__meta"><span>${place}</span><span>Grade B</span><span class="tw-ptext__team">Team Name<sup>TM</sup></span></div></div><div class="tw-ptext__quote"><q>Your client’s words here in about four lines. What the team they worked with was like, how the finished space feels, and whether they would work together again.</q><p class="tw-ptext__who" data-label="Client’s English name and title · company here">Client Name<em>Job Title, Company</em></p></div></div>`).join("")}
        </div></div>
      </div>
      <div class="tw-projects__shade"></div>
      ${list.map((p) => `<div class="tw-pitem"><div class="tw-pitem__media"><div class="wf-img tw-ph is-dark" data-label="${p[2]}"></div></div></div>`).join("")}
    </div>`;
  };
  const POSTS = [["Completed building exterior · Clear sky · Street · Landscape", "Your news title here, one line"], ["Lounge round sofa · from above · landscape", "Your news title here, in two lines"], ["Upper-body portrait · red top · in front of green plants · horizontal", "Your news title here, in two lines"], ["Reception desk · navy wall logo · landscape", "Your news title here, one line"], ["Person · Green chair · Study · Landscape", "Your news title here, in two lines"], ["Office hallway · glass door · landscape", "Your news title here, in two lines"], ["Person half-length · black knit · landscape", "Your news title here, one line"], ["Bar counter · red tile · landscape", "Your news title here, in two lines"]];
  // In the original, each news card has a different color it tints on hover (mint, cream, yellow)
  const HOVERS = ["--site-mint", "--site-yellow", "--kf-accent-soft", "--site-yellow", "--kf-accent-soft", "--site-mint"];
  const post = (i, big) => { const [label, title] = POSTS[i % POSTS.length]; return `<a class="tw-post${big ? " is-big" : ""}" href="article.html" style="--tw-post-hover: var(${HOVERS[i % HOVERS.length]})"><div class="tw-post__img"><div class="wf-img tw-ph ${big ? "wf-r-16x9" : "wf-r-3x2"}" data-label="${label}"></div></div><p class="tw-post__date"><span class="tw-pill">${String(28 - i * 3).padStart(2, "0")}</span><span class="tw-pill">10</span><span class="tw-pill">0000</span></p><p class="tw-post__title">${title}</p></a>`; };
  window.twPost = post;
  const posts = (box) => { const n = +box.dataset.posts; box.innerHTML = Array.from({ length: n }, (_, i) => post(i + +(box.dataset.from ?? 0), i === 0 && box.dataset.big !== "no")).join(""); };

  const PCARDS = [
    ["Reception bar · round counter · garden beyond the glass · warm lighting", "wf-r-16x9"], ["Tiered lecture seating · black perforated wall · landscape", "wf-r-3x2"],
    ["Brick building front · street trees · clear daytime", "wf-r-3x2"], ["Long corridor · wooden wall vertical lights · portrait", "wf-r-4x5"], ["Lounge · round sofa · circular ceiling lights", "wf-r-1x1"],
    ["Reception · lime green arch wall · landscape", "wf-r-4x3"], ["Pantry · shelves and bar stools · window light · landscape", "wf-r-16x9"],
  ];
  const pcard = (i, big) => { const [label, ratio] = PCARDS[i % PCARDS.length]; return `<a class="tw-pcard${big ? " is-big" : ""}" href="works.html"><div class="tw-pcard__img"><div class="wf-img tw-ph ${ratio}" data-label="${label}"></div></div><p class="tw-pcard__meta"><span>Neighborhood name · Grade B</span><em>Team Name<sup>TM</sup></em></p><h3 class="tw-pcard__title" data-label="Your project English name here">Project Name ${String(i + 1).padStart(2, "0")}</h3></a>`; };
  const projectGrid = (box) => {
    const rows = +(box.dataset.projectGrid || 3);
    let k = +(box.dataset.start ?? 0), html = "";
    for (let r = 0; r < rows; r++) {
      const kind = r % 3;
      const cells = kind === 0 ? [true, false] : kind === 1 ? [false, false, false] : [false, true];
      html += `<div class="tw-pgrid__row">${cells.map((big) => pcard(k++, big)).join("")}</div>`;
    }
    box.innerHTML = html;
  };

  // ── Dropdown (filter·sort): opens on press, closes when an option is picked or the outside is pressed ──
  const dropSet = (d, v) => {
    const btn = d.querySelector(".tw-drop__btn"), list = d.querySelector(".tw-drop__list");
    d.classList.toggle("is-open", v);
    btn.setAttribute("aria-expanded", String(v));
    list.style.height = v ? `${list.scrollHeight}px` : "0px";
  };
  const drops = () => document.querySelectorAll(".tw-drop");
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".tw-drop__btn"), pick = e.target.closest(".tw-drop__list button");
    drops().forEach((d) => {
      if (btn && d.contains(btn)) dropSet(d, !d.classList.contains("is-open"));
      else if (d.classList.contains("is-open")) dropSet(d, false);
    });
    if (pick) { const d = pick.closest(".tw-drop"), lab = d.querySelector("[data-drop-value]"); if (lab) lab.textContent = pick.textContent; }
  });

  const boot = () => {
    document.querySelectorAll("[data-team-slides]").forEach(teamSlides);
    document.querySelectorAll("[data-project-stack]").forEach(projectStack);
    document.querySelectorAll("[data-posts]").forEach(posts);
    document.querySelectorAll("[data-project-grid]").forEach(projectGrid);
    document.querySelectorAll(".tw-arrow:empty").forEach((a) => (a.innerHTML = ARROW + ARROW));
    document.dispatchEvent(new CustomEvent("tw:built"));
    window.twTeams();
    window.twProjects();
    document.dispatchEvent(new CustomEvent("tw:pinned"));
    window.twReveal();
    ScrollTrigger.refresh();
  };
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", boot) : boot();
  addEventListener("load", () => { ScrollTrigger.refresh(); meterUpdate(); scheme(); });
})();
