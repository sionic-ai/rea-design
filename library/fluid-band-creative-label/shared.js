// Motion spanning several pages plus per-section motion — swup swaps only the inside of #swup, so section motion is hooked here per section (gsap.context) and cleared on transition.
(() => {
  gsap.registerPlugin(ScrollTrigger, CustomEase, SplitText);
  CustomEase.create("hop", "0.9, 0, 0.1, 1");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const wide = () => innerWidth > 767;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const mark = (cls) => `<svg viewBox="0 0 330 104" class="${cls || ""}" aria-label="Brand wordmark" data-label="Brand wordmark — two English lines + three squares (original RGB squares)"><text x="0" y="44" font-size="54" font-weight="500" fill="currentColor" font-family="Inter Tight, sans-serif" letter-spacing="-1">lumenic</text><text x="0" y="98" font-size="54" font-weight="500" fill="currentColor" font-family="Inter Tight, sans-serif" letter-spacing="-1">laboratory</text><g fill="currentColor"><rect x="226" y="10" width="24" height="24"/><rect x="258" y="10" width="24" height="24"/><rect x="290" y="10" width="24" height="24"/></g></svg>`;
  const pages = [["index.html", "Home"], ["about.html", "About"], ["works.html", "Projects"], ["news.html", "News"], ["detail.html", "Detail"]];

  // ---------- Header, menu, footer, cursor (outside the page, swup does not swap them) ----------
  const here = () => (location.pathname.split("/").pop() || "index.html");
  const header = $('[data-slot="header"]');
  if (header) {
    header.className = "bf-header";
    header.innerHTML = `<p><a class="bf-logo" href="index.html">${mark()}</a></p>
      <nav class="bf-nav"><ul>${pages.slice(0, 4).map(([h, t]) => `<li><a href="${h}"><p>${t.toUpperCase()}</p></a></li>`).join("")}</ul></nav>
      <p class="bf-loc">Based in<br>City / Town / Place<br>— Country</p><p class="bf-time" data-clock></p>`;
  }
  // The original overlay menu puts is-active only on the current section’s link (detail pages count as Projects, like the original /projects/*) — links inside the closed overlay keep the same state
  const navMark = () => $$(".bf-nav a, .bf-menu__links a").forEach((a) => {
    const on = a.getAttribute("href") === (here() === "detail.html" ? "works.html" : here());
    a.toggleAttribute("aria-current", on);
    if (a.closest(".bf-menu__links")) a.classList.toggle("is-active", on);
  });
  const menuSlot = $('[data-slot="menu"]');
  if (menuSlot) {
    menuSlot.innerHTML = `<div class="bf-menunav"><button class="bf-toggle" type="button" aria-expanded="false" aria-label="Menu"><span class="bf-toggle__in"><p class="bf-open">Menu</p><p class="bf-close">Close</p></span></button></div>
      <div class="bf-menu" aria-hidden="true">
        <div class="bf-menu__links">${pages.slice(0, 4).map(([h, t]) => `<div class="bf-menu__link"><a href="${h}">${t}</a></div>`).join("")}<div class="bf-menu__link"><a href="#">Contact</a></div></div>
        <div class="bf-menu__img"><div class="wf-img wf-video" data-label="Menu video — loop of an on-site event · portrait 4:5 · autoplay, muted"></div></div>
        <div class="bf-menu__foot"><div class="bf-menu__col"><div><p>© Brand Name</p><p>Based in</p><p>City / Town / Place</p></div><div><p>Say Hello</p><a href="#">hello@example.com</a></div></div>
        <div class="bf-menu__col"><div><p>Social Media</p><a href="#">Instagram</a><a href="#">YouTube</a><a href="#">Journal</a></div></div></div>
      </div>`;
  }
  const foot = $('[data-slot="footer"]');
  if (foot) {
    foot.className = "bf-foot";
    foot.innerHTML = `<a class="bf-note" href="#"><div><small>Your activity log is published here</small><h3>Why you started this work, here<br>Two-line heading that asks</h3><span class="bf-pill">View</span></div><div class="wf-img" data-label="Archive post thumbnail — collapsed house and rubble · black and white · landscape 16:10"></div></a>
      <div class="bf-sitemenu"><p>Site Menu</p><ul>${pages.slice(0, 4).map(([h, t], i) => `<li><a href="${h}"><span>0${i + 1}</span>${t}</a></li>`).join("")}<li><a href="news.html"><span>05</span>Contact</a></li></ul></div>
      <a class="bf-join" href="#"><h3>Join our project.</h3><p>About three lines here looking for people to join us.<br>Add your second line here.<br>Your third line goes here.</p><figure class="bf-join__icon"><img src="icon-chat.svg" alt="" width="22" height="22"></figure></a>
      <div class="bf-info"><div><b>Services</b>Art & Culture<br>Social Design<br>Media & Creative<br>Branding / Consulting<br>Product / Circulation</div><div><b>Address</b>Your one-line address here<br>Your address second line here</div><div><b>Mail</b>hello@example.com</div><div><b>Representative</b>Name Name<br>Name Name</div><div>© 0000 Brand Name</div></div>
      <p class="bf-big"><span>lumenic<br>laboratory</span><svg viewBox="0 0 96 28"><g fill="currentColor"><rect x="0" y="0" width="28" height="28"/><rect x="34" y="0" width="28" height="28"/><rect x="68" y="0" width="28" height="28"/></g></svg></p>
      <div class="bf-bnrs"><a href="#"><svg viewBox="0 0 18 18" fill="none" stroke="currentColor"><rect x="2" y="2" width="14" height="14" rx="2"/><path d="M5 6h8M5 9h8M5 12h5"/></svg><span>Preparedness<br>Your preparation guide here</span></a><a href="#"><svg viewBox="0 0 18 18" fill="none" stroke="currentColor"><path d="M9 15S2 10.5 2 6.2A3.6 3.6 0 0 1 9 4.6a3.6 3.6 0 0 1 7 1.6C16 10.5 9 15 9 15Z"/></svg><span>Donation<br>Your donation guide here</span></a></div>
      <div class="bf-foot__mq" data-fx="marquee" data-fx-marquee="speed: 40; pause: none"><span>PROTECT YOURSELF AND LOVED ONES — Your slogan one here — SUPPORT EACH OTHER — Your slogan two here — STAY SAFE, STAY CONNECTED — TURNING LESSONS INTO ACTION</span></div>`;
  }
  const clock = () => { const t = new Date(), p = (n) => String(n).padStart(2, "0"); $$("[data-clock]").forEach((el) => (el.innerHTML = `${t.getFullYear()}.${p(t.getMonth() + 1)}.${p(t.getDate())}<br>${p(t.getHours())}:${p(t.getMinutes())}:${p(t.getSeconds())}<br>GMT+9`)); };
  navMark();

  // ---------- Smooth scroll — original lenis 1.3.15: only on screens wider than 1024px, duration 1.05s · curve min(1, 1.001 − 2^(−10t)).
  // The original is built after the loader ends, so while the loader runs it scrolls with default scroll ----------
  let lenis = null;
  const smooth = () => {
    if (reduce || !window.Lenis || innerWidth <= 1024) return;
    lenis = new Lenis({ duration: 1.05, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true, wheelMultiplier: 1, touchMultiplier: 2 });
    lenis.on("scroll", ScrollTrigger.update);
    // The original runs lenis on its own rAF and does not touch the GSAP tick — down to the first frame after the tick rests and wakes (lag smoothing 33ms), kept the same
    const loop = (t) => { lenis.raf(t); requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
  };

  // ---------- Scroll progress bar — the original attaches it 1s after start ----------
  const progress = () => {
    const bar = document.createElement("div");
    bar.className = "bf-progress"; bar.setAttribute("aria-hidden", "true");
    document.body.append(bar);
    let queued = false;
    const draw = () => { const room = document.documentElement.scrollHeight - innerHeight; bar.style.width = `${Math.min(room > 0 ? (scrollY / room) * 100 : 0, 100)}%`; queued = false; };
    const ask = () => { if (!queued) { queued = true; requestAnimationFrame(draw); } };
    addEventListener("scroll", ask, { passive: true });
    lenis?.on("scroll", ask);
    draw();
  };

  // ---------- Cover menu, original Kp(): open clip 1.25s expo.out · links .8s .1 stagger, .3s late · tail lines 1s .05 stagger, .5s late · Menu/Close 1s power3.out ----------
  const toggle = $(".bf-toggle"), overlay = $(".bf-menu");
  if (toggle && overlay) {
    const links = $$(".bf-menu__link", overlay), img = $(".bf-menu__img", overlay);
    const lines = $$(".bf-menu__col p, .bf-menu__col a", overlay).map((n) => { const w = document.createElement("span"); w.className = "bf-line"; n.replaceWith(w); w.append(n); return n; });
    let open = false, busy = false;
    const rest = () => { gsap.set(img, { y: 0, scale: 0.5, opacity: 0.25 }); gsap.set(links, { opacity: 0, y: 20 }); gsap.set(lines, { yPercent: 100 }); };
    rest();
    const d = reduce ? 0 : 1;
    toggle.addEventListener("click", () => {
      if (busy) return;
      busy = true;
      if (!open) {
        lenis?.stop(); document.body.classList.add("is-menu-open");
        gsap.to(".bf-open, .bf-close", { yPercent: -100, duration: 1 * d, ease: "power3.out" });
        gsap.to(overlay, { clipPath: "polygon(0% 100%, 100% 100%, 100% 0%, 0% 0%)", duration: 1.25 * d, ease: "expo.out", onComplete: () => { open = true; busy = false; } });
        gsap.to(img, { scale: 1, opacity: 1, duration: 1.5 * d, ease: "expo.out" });
        gsap.to(links, { opacity: 1, y: 0, duration: 0.8 * d, stagger: 0.1 * d, delay: 0.3 * d, ease: "expo.out" });
        gsap.to(lines, { yPercent: 0, duration: 1 * d, stagger: 0.05 * d, delay: 0.5 * d, ease: "expo.out" });
      } else {
        gsap.to(".bf-open, .bf-close", { yPercent: 0, duration: 1 * d, ease: "power3.out" });
        gsap.to(img, { y: "-25svh", opacity: 0.5, duration: 1.25 * d, ease: "expo.out" });
        gsap.to(lines, { yPercent: -100, duration: 1 * d, ease: "expo.out" });
        gsap.to(links, { opacity: 0, y: 20, duration: 0.5 * d, stagger: 0.05 * d, ease: "expo.in" });
        gsap.to(overlay, { clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)", duration: 1.25 * d, ease: "expo.out", onComplete: () => {
          gsap.set(overlay, { clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)" }); rest();
          open = false; busy = false; document.body.classList.remove("is-menu-open"); lenis?.start();
        } });
      }
      toggle.setAttribute("aria-expanded", String(!open));
      overlay.setAttribute("aria-hidden", String(open));
    });
    overlay.addEventListener("click", (e) => { if (e.target.closest("a") && open) toggle.click(); });
  }

  // ---------- Square cursor — original cursor.js: 16px white square (difference), follows by .15 of the remaining distance each frame. After the loader ends, interaction reactions are attached only to the elements present at that time ----------
  const cursor = () => {
    if (innerWidth <= 1024 || !matchMedia("(hover: hover)").matches) return;
    const c = document.createElement("div");
    c.className = "custom-cursor"; c.innerHTML = '<div class="cursor-dot"></div>'; c.setAttribute("aria-hidden", "true");
    document.body.append(c);
    let tx = innerWidth / 2, ty = innerHeight / 2, x = tx, y = ty;
    addEventListener("mousemove", (e) => { tx = e.clientX; ty = e.clientY; });
    const follow = () => { x += (tx - x) * 0.15; y += (ty - y) * 0.15; c.style.left = `${x}px`; c.style.top = `${y}px`; requestAnimationFrame(follow); };
    follow();
    $$("a, button, [role=button], .bf-proj, .bf-roll__item, input, textarea, select").forEach((t) => {
      t.addEventListener("mouseenter", () => { c.classList.add("is-hover"); if (t.matches(".bf-proj, .bf-roll__item") && !t.closest(".is-news")) c.classList.add("is-large"); });
      t.addEventListener("mouseleave", () => c.classList.remove("is-hover", "is-large"));
    });
    addEventListener("mousedown", () => c.classList.add("is-click"));
    addEventListener("mouseup", () => c.classList.remove("is-click"));
  };

  // The original hero canvas is drawn only after three loads — the copy sets data-fx when the loader is revealed (right away if the loader isn’t shown) so fx-core attaches
  const wake = () => $$("[data-fx-later]").forEach((el) => { el.dataset.fx = el.dataset.fxLater; el.removeAttribute("data-fx-later"); });

  // ---------- Per-section motion ----------
  let ctx = null;
  const initPage = () => {
    ctx?.revert();
    ctx = gsap.context(() => {
      const page = $("#swup [data-page]")?.dataset.page || "";
      const off = { home, about, detail, works: rollPage, news: rollPage }[page]?.();
      return () => off?.();
    });
    ScrollTrigger.refresh();
  };

  // First page — original Ad(): mask 45% → 49%, first title gone within 30%, the about section enters from the right and three texts float up, the video box grows to screen height then .3× and is cropped upward
  const home = () => {
    wake();
    const vh = innerHeight;
    if (wide() && !reduce) {
      const st = (trigger, start, end) => ({ trigger, start, end, scrub: true, invalidateOnRefresh: true });
      gsap.to(".bf-mask-up", { height: `${vh * 0.49}px`, ease: "none", scrollTrigger: st(".bf-about-trigger", "top bottom", "top top") });
      gsap.to(".bf-mask-down", { height: `${vh * 0.49}px`, ease: "none", scrollTrigger: st(".bf-about-trigger", "top bottom", "top top") });
      gsap.to(".bf-hero", { autoAlpha: 0, ease: "none", scrollTrigger: st(".bf-about-trigger", "top bottom", "top 70%") });
      gsap.to(".bf-about", { left: 0, ease: "none", scrollTrigger: st(".bf-about-trigger", "top 50%", "bottom 0%") });
      gsap.to(".bf-clip-1", { opacity: 1, y: 0, ease: "cubic-bezier(0.25, 0.46, 0.45, 0.94)", scrollTrigger: st(".bf-about-trigger", "top -10%", "top -50%") });
      gsap.to(".bf-clip-2", { opacity: 1, ease: "cubic-bezier(0.4, 0, 0.2, 1)", scrollTrigger: st(".bf-about-trigger", "top -10%", "top -50%") });
      gsap.to(".bf-clip-3", { opacity: 1, y: 0, ease: "cubic-bezier(0.25, 0.46, 0.45, 0.94)", scrollTrigger: st(".bf-about-trigger", "top -170%", "top -190%") });
      gsap.to(".bf-about__img", { height: "100vh", ease: "none", scrollTrigger: st(".bf-about-end", "top 0", "top -50%") });
      gsap.to(".bf-clip", { clipPath: "inset(0 0 100% 0)", ease: "none", scrollTrigger: st(".bf-about-end", "top -15%", "top -30%") });
      gsap.to(".bf-about__img", { scale: 0.3, ease: "none", scrollTrigger: st(".bf-about-end", "top -60%", "top -80%") });
      gsap.to(".bf-about__img", { clipPath: "inset(0 0 100% 0)", ease: "none", scrollTrigger: st(".bf-about-end", "top -85%", "top -100%") });
      // Photo column wall — shrinks to .4x while only the center column goes backward 5%, photos at brightness .2
      gsap.to(".bf-wall__in", { scale: 0.4, scrollTrigger: st(".bf-wall-h", "top 150%", "top 100%") });
      gsap.to(".bf-wall__col.is-a", { yPercent: 5, scrollTrigger: st(".bf-wall-h", "top 100%", "top 70%") });
      gsap.to(".bf-wall__col.is-b", { yPercent: -5, scrollTrigger: st(".bf-wall-h", "top 100%", "top 70%") });
      gsap.to(".bf-wall__col .wf-img", { filter: "brightness(0.2)", scrollTrigger: st(".bf-wall-h", "top 150%", "top 100%") });
    } else {
      gsap.set(".bf-about", { left: 0 }); gsap.set(".bf-clip-1, .bf-clip-3", { opacity: 1, y: 0 }); gsap.set(".bf-clip-2", { opacity: 1 }); gsap.set(".bf-wall__in", { scale: 0.4 });
    }
    // Pinned project photo — while it is pushed up, the rectangle is cropped into a skewed rectangle (original scrub .5)
    if (!reduce) $$(".bf-proj__img").forEach((a) => ScrollTrigger.create({ trigger: a.parentElement, start: "bottom bottom", end: "bottom top", scrub: 0.5,
      animation: gsap.fromTo(a, { clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)" }, { clipPath: "polygon(0% 0%, 100% 0%, 75% 60%, 25% 75%)", ease: "none" }) }));
    // On entering the project section, remove the horizontal curtain so the fluid shows only through vertical gaps (in the original the curtain turns into vertical strips).
    ScrollTrigger.create({ trigger: ".bf-slot", start: "top bottom", endTrigger: ".bf-wallwrap", end: "top top", onToggle: (s) => gsap.set(".bf-mask-up, .bf-mask-down", { autoAlpha: s.isActive ? 0 : 1 }) });
    const list = $('[data-roll="members"]');
    const offRoll = list ? roll(list, "members") : null;
    const offMo = memberOverlay();
    return () => { offRoll?.(); offMo?.(); };
  };

  // Member detail overlay — original Ed(): clicking a row opens the overlay and changes the URL to that member. Close with ×, outside the overlay, Esc or back.
  // Since #swup confines stacking with isolation, the cover is moved to body so it sits above header·footer, and is removed when the page changes
  const memberOverlay = () => {
    const mo = $(".bf-mo");
    if (!mo) return null;
    document.body.append(mo);
    const bg = $(".bf-mo__bg", mo), body = $(".bf-mo__body", mo), home = location.pathname + location.search;
    const kind = { core: "Core Member", sponsor: "Sponsor" };
    const open = (a) => {
      $(".bf-mo__role", mo).textContent = `${a.dataset.memberRole} / ${kind[a.dataset.memberType] || "Collaborator"}`;
      $(".bf-mo__name", mo).textContent = $(".bf-roll__name h2 span + span", a).textContent;
      $(".bf-mo__link", mo).style.display = a.dataset.memberType === "sponsor" ? "inline-flex" : "none";
      mo.classList.add("is-open"); mo.setAttribute("aria-hidden", "false");
      document.body.classList.add("is-overlay-open");
      gsap.fromTo(bg, { scale: 1.05, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: reduce ? 0 : 0.6, ease: "power3.out" });
      gsap.fromTo(body, { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: reduce ? 0 : 0.45, ease: "power3.out", delay: reduce ? 0 : 0.1 });
      history.pushState({ memberModal: true }, "", `#member-${a.dataset.member}`);
    };
    const close = () => {
      if (!mo.classList.contains("is-open")) return;
      gsap.timeline({ onComplete: () => { mo.classList.remove("is-open"); mo.setAttribute("aria-hidden", "true"); document.body.classList.remove("is-overlay-open"); } })
        .to(body, { autoAlpha: 0, y: 20, duration: reduce ? 0 : 0.3, ease: "power2.in" }, 0)
        .to(bg, { scale: 0.9, autoAlpha: 0, duration: reduce ? 0 : 0.4, ease: "power3.inOut" }, 0);
      history.pushState({}, "", home);
    };
    const onRow = (e) => { const a = e.target.closest('[data-roll="members"] .bf-roll__item'); if (a) { e.preventDefault(); open(a); } };
    const onKey = (e) => e.key === "Escape" && close();
    const onPop = () => close();
    document.addEventListener("click", onRow);
    $(".bf-mo__close", mo).addEventListener("click", close);
    mo.addEventListener("click", (e) => e.target === mo && close());
    document.addEventListener("keydown", onKey);
    addEventListener("popstate", onPop);
    return () => { document.removeEventListener("click", onRow); document.removeEventListener("keydown", onKey); removeEventListener("popstate", onPop); document.body.classList.remove("is-overlay-open"); mo.remove(); };
  };

  // Rolling rows — original project/news/member lists (80px cells · three rows 240px).
  // Desktop: on enter −80 (View More), on exit going up −160 · going down 0, .4s power2.out.
  //   Project and News rows roll only when entering from above or already at 0, and show a photo on the right panel / Member rows are −80 whichever side they enter from.
  // 1024 and below: the first name line is revealed from bottom to top (top 85% → bottom 40% scrub)
  const roll = (list, kind) => {
    const items = $$(".bf-roll__item", list), P = { BOTTOM: 0, MIDDLE: -80, TOP: -160 };
    const to = (w, y) => gsap.to(w, { y, duration: reduce ? 0 : 0.4, ease: "power2.out" });
    const half = (el, y) => { const r = el.getBoundingClientRect(); return y < r.top + r.height / 2; };
    const offs = [];
    if (innerWidth > 1024) {
      const peek = kind === "members" ? null : peekDesk(list);
      if (peek) offs.push(peek.off);
      let active = null;
      items.forEach((it) => {
        const w = $(".bf-roll__wrap", it);
        let pos = P.TOP;
        it.addEventListener("mouseenter", (e) => {
          if (kind === "members") {
            if (active && active !== it) to($(".bf-roll__wrap", active), half(active, e.clientY) ? P.TOP : P.BOTTOM);
            to(w, P.MIDDLE);
          } else if (half(it, e.clientY) || pos === P.BOTTOM) { pos = P.MIDDLE; to(w, P.MIDDLE); }
          active = it;
          peek?.enter(it);
        });
        it.addEventListener("mouseleave", (e) => { active = null; peek?.leave(); pos = half(it, e.clientY) ? P.TOP : P.BOTTOM; to(w, pos); });
      });
    } else {
      items.forEach((it) => {
        const name = $(".bf-roll__name", it);
        gsap.set(name, { clipPath: "inset(100% 0 0 0)" });
        ScrollTrigger.create({ trigger: it, start: "top 85%", end: "bottom 40%", scrub: true, animation: gsap.to(name, { clipPath: "inset(0% 0 0 0)", ease: "none" }) });
      });
      if (kind !== "members") peekMobile(list, $(".bf-peek-m"));
    }
    return () => offs.forEach((f) => f());
  };

  // Right preview panel (desktop) — each time a row is entered, a photo stacks in from 0 → 1× (.4s power2.out), and when the cursor rests 100ms only the top photo remains and the rest shrink to 0× in .3s.
  // If the cursor is outside the list everything drops out, if it rests on a row, one more is shown when that row has no photo
  const peekDesk = (list) => {
    const box = $(".bf-peek");
    if (!box) return null;
    let mx = -1, my = -1, moving = false, active = null, timer = 0, raf = 0, z = 1;
    const add = (it, once) => {
      const key = it.dataset.cover || "Preview photo";
      if (once && [...box.children].some((d) => d.dataset.label === key && !d.dataset.out)) return;
      const d = document.createElement("div");
      d.className = "wf-img"; d.dataset.label = key; d.style.zIndex = String(z++);
      box.append(d);
      gsap.fromTo(d, { scale: 0 }, { scale: 1, duration: reduce ? 0 : 0.4, ease: "power2.out" });
    };
    const drop = (d) => { if (d.dataset.out) return; d.dataset.out = "1"; gsap.to(d, { scale: 0, duration: reduce ? 0 : 0.3, ease: "power2.out", overwrite: true, onComplete: () => d.remove() }); };
    const tick = () => {
      raf = 0;
      const r = list.getBoundingClientRect();
      if (mx < r.left || mx > r.right || my < r.top || my > r.bottom) { [...box.children].forEach(drop); return; }
      if (active && !moving) add(active, true);
    };
    const mm = (e) => {
      mx = e.clientX; my = e.clientY; moving = true;
      clearTimeout(timer);
      timer = setTimeout(() => { moving = false; const live = [...box.children].filter((d) => !d.dataset.out); live.slice(0, -1).forEach(drop); }, 100);
      raf ||= requestAnimationFrame(tick);
    };
    document.addEventListener("mousemove", mm);
    return { enter: (it) => { active = it; add(it, false); }, leave: () => { active = null; }, off: () => { document.removeEventListener("mousemove", mm); clearTimeout(timer); cancelAnimationFrame(raf); } };
  };

  // Center (News: bottom right) preview panel (≤1024) — gathers each row’s top 85% → bottom 40% progress, among rows in progress, if the furthest-along row is past half show its photo, otherwise the previous row’s photo.
  // That line gets is-active (bar fills), past lines get is-past (bar exits to the right). After the last line has passed, it stays in that state
  const peekMobile = (list, box) => {
    if (!box) return;
    const items = $$(".bf-roll__item", list), last = items.length - 1, prog = new Map();
    box.replaceChildren(...items.map((it) => { const d = document.createElement("div"); d.className = "wf-img"; d.dataset.label = it.dataset.cover || "Preview photo"; return d; }));
    const imgs = [...box.children];
    const show = (k) => imgs.forEach((d, i) => { d.style.display = i === k ? "block" : "none"; d.style.opacity = i === k ? "1" : "0"; });
    const mark = (fn) => items.forEach((it, i) => { const [a, p] = fn(i); it.classList.toggle("is-active", a); it.classList.toggle("is-past", p); });
    const update = () => {
      if ((prog.get(last) || 0) >= 1) { show(last); mark((i) => [i === last, true]); return; }
      let active = 0, best = -1, bestIn = -1, activeIn = 0;
      prog.forEach((p, i) => { if (p > 0 && p < 1 && p > bestIn) { bestIn = p; activeIn = i; } if (p > best) { best = p; active = i; } });
      if (bestIn >= 0) active = activeIn; else if (!prog.size) active = 0;
      const cur = prog.get(active) || 0;
      show(!prog.size ? 0 : cur >= 0.5 ? active : Math.max(0, active - 1));
      mark((i) => { const p = prog.get(i) || 0; return [i === active && p >= 0.5, i < active || (i === active && p >= 1)]; });
    };
    items.forEach((it, i) => ScrollTrigger.create({ trigger: it, start: "top 85%", end: "bottom 40%", scrub: true,
      onUpdate: (s) => { prog.set(i, s.progress); update(); },
      onEnter: () => { prog.set(i, 0); update(); }, onEnterBack: () => { prog.set(i, 0); update(); },
      onLeave: () => { prog.set(i, 1); update(); }, onLeaveBack: () => { if (i !== last) prog.delete(i); update(); } }));
    show(0);
    mark(() => [false, false]);
  };

  const rollPage = () => { const list = $("[data-roll]"); return list ? roll(list, list.dataset.roll) : null; };

  // About, from the original about.js: the big text and body darken one character at a time from .2 → 1 (top 80% → top 20%), and the value cards, overlapped 60px each to the left and faded, spread out (top 80% → top 30%, .08 stagger),
  // The roadmap darkens from .3 year by year (top 90% → 70%), then fades when the next year moves up (top 20% → 0%) while the progress line grows (top 80% → bottom 20%), activity cards scale to .9x as they pass (top 0 → top −20%)
  const about = () => {
    const ink = getComputedStyle(document.documentElement).getPropertyValue("--kf-ink-soft").trim();
    const tint = (c, a) => { c.style.color = `color-mix(in oklab, ${ink} ${Math.round(a * 1000) / 10}%, transparent)`; };
    const splits = [];
    $$("[data-bf-chars]").forEach((el) => {
      const sp = SplitText.create(el, { type: "chars", charsClass: "bf-char" });
      splits.push(sp);
      sp.chars.forEach((c) => tint(c, 0.2));
      ScrollTrigger.create({ trigger: el, start: "top 80%", end: "top 20%", scrub: true, onUpdate: (s) => sp.chars.forEach((c, i) => tint(c, 0.2 + Math.max(0, Math.min(1, s.progress * sp.chars.length - i)) * 0.8)) });
    });
    const cards = $$(".bf-value");
    cards.forEach((c, i) => gsap.set(c, { x: i ? -60 * i : 0, opacity: i ? 0.3 : 0.5, zIndex: cards.length - i }));
    if (cards.length) ScrollTrigger.create({ trigger: ".bf-values", start: "top 80%", end: "top 30%", scrub: true, animation: gsap.to(cards, { x: 0, opacity: 1, duration: 1, stagger: 0.08, ease: "power2.out" }) });
    const years = $$(".bf-road__item"), line = $(".bf-road__line");
    if (years.length) {
      gsap.set(years, { opacity: 0.3 });
      const st = new Map(years.map((y) => [y, { in: 0, out: 0 }]));
      const paint = () => years.forEach((y, i) => {
        let floor = 0.3;
        years.forEach((o, j) => { if (o !== y) floor = Math.min(floor, 0.2 + 0.1 * (1 - st.get(o).out) + Math.max(0, 1 - Math.abs(j - i) * 0.15) * 0.1); });
        gsap.set(y, { opacity: Math.max(0.3 + st.get(y).in * 0.7, floor) });
      });
      years.forEach((y) => {
        ScrollTrigger.create({ trigger: y, start: "top 90%", end: "top 70%", scrub: true, onUpdate: (s) => { st.get(y).in = s.progress; paint(); } });
        ScrollTrigger.create({ trigger: y, start: "top 20%", end: "top 0%", scrub: true, onUpdate: (s) => { years.forEach((o) => { if (o !== y) st.get(o).out = Math.max(st.get(o).out, s.progress); }); paint(); } });
      });
      const bar = document.createElement("div");
      bar.className = "bf-road__progress";
      line.append(bar);
      ScrollTrigger.create({ trigger: line, start: "top 80%", end: "bottom 20%", scrub: true, onUpdate: (s) => gsap.set(bar, { height: line.offsetHeight * s.progress }) });
    }
    $$(".bf-act__item").forEach((c) => ScrollTrigger.create({ trigger: c, start: "top 0%", end: "top -20%", scrub: true, animation: gsap.to(c, { scale: 0.9, duration: 1, ease: "none" }) }));
    $(".bf-ab-down")?.addEventListener("click", (e) => { e.preventDefault(); lenis ? lenis.scrollTo("#philosophy") : $("#philosophy").scrollIntoView({ behavior: "smooth" }); });
    return () => { splits.forEach((s) => s.revert()); $(".bf-road__progress")?.remove(); };
  };

  // Project detail — original projects.js: on desktop the whole text column floats up from 24px below in .6s, the text group and main photo rise from 30px below at 80% of the screen → .8s (stagger .1),
  // Gallery photos go .95x → 1x in .6s at 85%. At 1024 and below photos scale to .9x as they pass, the number of the photo passing 60%~40% of the screen is written on the right, and a bar·button opens a half-width drawer
  const detail = () => {
    const sec = $(".bf-pd__desk");
    if (sec) {
      gsap.fromTo(sec, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: reduce ? 0 : 0.6, ease: "power3.out", onComplete: () => ScrollTrigger.refresh() });
      $$("[data-scrub-target]", sec).forEach((t, i) => gsap.fromTo(t, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: reduce ? 0 : 0.8, ease: "power3.out", delay: reduce ? 0 : i * 0.1, scrollTrigger: { trigger: t, start: "top 80%", end: "bottom 20%", toggleActions: "play none none none" } }));
      $$(".bf-pd__gallery figure", sec).forEach((f) => gsap.fromTo(f, { autoAlpha: 0, scale: 0.95 }, { autoAlpha: 1, scale: 1, duration: reduce ? 0 : 0.6, ease: "power3.out", scrollTrigger: { trigger: f, start: "top 85%", end: "bottom 15%", toggleActions: "play none none none" } }));
    }
    const modal = $("[data-pd-modal]"), btn = $(".bf-pd__toggle");
    if (!modal || !btn) return null;
    const setOpen = (on) => { modal.classList.toggle("is-open", on); btn.classList.toggle("is-open", on); document.body.style.overflow = on ? "hidden" : ""; on ? lenis?.stop() : lenis?.start(); };
    const flip = (e) => { e.preventDefault(); e.stopPropagation(); setOpen(!modal.classList.contains("is-open")); };
    $$("[data-pd-toggle]").forEach((t) => t.addEventListener("click", flip));
    $$("[data-pd-close]").forEach((t) => t.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); setOpen(false); }));
    const shots = $$(".bf-pd__mimgs > .bf-pd__mcover, .bf-pd__mgallery figure"), cur = $(".bf-pd__prog .cur"), tot = $(".bf-pd__prog .tot");
    if (tot) tot.textContent = String(shots.length).padStart(2, "0");
    shots.forEach((img, i) => {
      gsap.set(img, { scale: 1 });
      ScrollTrigger.create({ trigger: img, start: "top 0%", end: "top -20%", scrub: true, onUpdate: (s) => gsap.set(img, { scale: 1 - s.progress * 0.1 }) });
      const num = () => { if (cur) cur.textContent = String(i + 1).padStart(2, "0"); };
      ScrollTrigger.create({ trigger: img, start: "top 60%", end: "top 40%", onEnter: num, onEnterBack: num });
    });
    return () => setOpen(false);
  };

  // ---------- Loader — on first open of any section, only when 30 minutes have passed since it was last shown (original localStorage splash_last_shown) ----------
  // The original reveals the plate at DOMContentLoaded (right after the first paint when measured), waits for fonts (document.fonts.ready), pauses .1s and starts delayed by .25s.
  // Whether to show the splash is decided before first paint by a short check in head, which sets html.bf-splash. The original splash lifts about 6.7s after being revealed — in the copy, the moment scripts finish loading (DOMContentLoaded) wobbles with how busy the machine is, so the timeline start is tied to when the splash is painted (first-paint) + LEAD (the original timeline starts about .7s after the splash is revealed — in the copy the end-of-measurement check came .3 to 1.1s early per width, so three widths were measured and it was set to 1.0s)
  const SPLASH = "bf-splash-last";
  const LEAD = 1000;
  const preload = async (done) => {
    const pre = $(".bf-pre"), head = $(".bf-pre__head");
    const html = document.documentElement;
    if (!pre || !html.classList.contains("bf-splash")) { pre?.remove(); head?.remove(); done(); return; }
    try { localStorage.setItem(SPLASH, String(Date.now())); } catch { /* If storage is unavailable, it shows again next time */ }
    await document.fonts.ready.catch(() => null);
    await new Promise((r) => setTimeout(r, 100));
    gsap.set($("h1", head), { opacity: 1 });
    // The original header h1 holds a logo image, so letter splitting becomes an empty group — the two letter enter · leave segments move nothing and just take up 1s each
    const idle = {};
    const shown = performance.getEntriesByType("paint")[0]?.startTime ?? performance.now();
    const tl = gsap.timeline({ delay: Math.max(0, shown + LEAD - performance.now()) / 1000 });
    tl.to(".bf-pre__bar", { scaleX: 1, duration: 4, ease: "power3.inOut" }).set(".bf-pre__bar", { transformOrigin: "right" }).to(".bf-pre__bar", { scaleX: 0, duration: 1, ease: "power3.in" });
    $$(".bf-pre__imgs .img").forEach((p, i) => tl.to(p, { clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)", duration: 1, ease: "hop", delay: i * 0.75 }, "-=5"));
    $$(".bf-pre__imgs .wf-img").forEach((p, i) => tl.to(p, { scale: 1, duration: 1.5, ease: "hop", delay: i * 0.75 }, "-=5.25"));
    tl.to(idle, { duration: 1 }, "-=5")
      .to(".bf-pre__imgs", { clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)", duration: 1, ease: "hop" }, "-=1.5")
      .to(idle, { duration: 1 }, "-=2.5")
      .to([pre, head], { clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)", duration: 1.75, ease: "hop", onStart: () => gsap.set(pre, { pointerEvents: "none" }), onComplete: () => setTimeout(() => { pre.remove(); head.remove(); html.classList.remove("bf-splash"); done(); }, 100) }, "-=0.5");
  };

  // ---------- Start order — original: each section’s motion (about · list · news · detail module, hero canvas) starts right away without waiting for the loader,
  // After the loader ends, ia() hooks up lenis, clock and swup, and attaches the cursor and, 1 second later, the scroll progress bar ------
  // Swup transition — original Swup 4.8.2 (containers #swup, preload plugin). The section has no css transition so it swaps immediately,
  // While the new section comes in, hide #swup (is-scroll-restoring), scroll to the top two frames later and reveal it, and one frame later re-attach the section motion
  const afterSplash = () => {
    smooth();
    clock(); setInterval(clock, 1000);
    cursor();
    setTimeout(progress, 1000);
    if (window.Swup && location.protocol !== "file:") {
      const html = document.documentElement;
      const swup = new Swup({ containers: ["#swup"], animationSelector: false, cache: false, animateHistoryBrowsing: true, plugins: window.SwupPreloadPlugin ? [new SwupPreloadPlugin()] : [] });
      swup.hooks.on("page:view", navMark);
      swup.hooks.on("animation:in:start", () => html.classList.add("is-scroll-restoring"));
      swup.hooks.on("animation:in:end", () => requestAnimationFrame(() => requestAnimationFrame(() => {
        ScrollTrigger.refresh();
        lenis ? lenis.scrollTo(0, { immediate: true }) : scrollTo(0, 0);
        html.classList.remove("is-scroll-restoring");
        requestAnimationFrame(initPage);
      })));
    }
  };
  const boot = () => { wake(); initPage(); preload(afterSplash); };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
