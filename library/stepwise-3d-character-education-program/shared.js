// Frame and interaction used by all pages — fills in the header, menu panel, notice band and footer, plus Lenis scroll, loader, menu panel open/close, flowing outline band,
// Float-up on view, sequential emphasis, accordion, pill button width, and a pinned hero that pages one slot at a time (shared by index and about)
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hover = matchMedia("(hover: hover)").matches;
  const page = document.body.dataset.page || "home";
  const ARROW = '<svg viewBox="0 0 11 11"><path d="M6.2 1 10.5 5.5 6.2 10 5.1 8.9 7.7 6.3H.5V4.7h7.2L5.1 2.1z"/></svg>';
  const BLANK = '<svg viewBox="0 0 10 10"><path d="M3 1h6v6H7.6V3.4L2 9 1 8l5.6-5.6H3z"/></svg>';
  const NAV = [
    ["about.html", "Menu First", "Menu One"],
    ["program.html", "Menu Two", "Menu Two"],
    ["lesson.html", "Menu Three", "Menu Three"],
    ["#", "Menu Four", "Menu Four"],
  ];
  const NAV2 = [["index.html#info", "Menu Fifth", "Menu Five"], ["#", "Menu Sixth", "Menu Six"], ["#", "Menu Seventh", "Menu Seven"]];
  const SUB = ["External link one", "External organization name<br>Two-line link", "External organization name<br>Two-line link set"];
  const logo = (fixed) => `<p class="ht-logo${fixed ? " is-fixed" : ""}"><a href="index.html" aria-label="Back to start"><span class="ht-logo__mark"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM15.5 13h2v2.5H20v2h-2.5V20h-2v-2.5H13v-2h2.5z"/></svg></span><span class="ht-logo__txt"><small>Your three institution names in one line here</small><b>Your program name here</b></span></a></p>`;
  const btn = (txt, href = "#", icon = "arrow") =>
    `<p class="ht-btn"><a href="${href}"><span class="ht-btn__txt">${txt}</span><i class="ht-arrow${icon === "blank" ? " ht-blank-in" : ""}">${icon === "blank" ? BLANK : ARROW}</i></a></p>`;
  window.htTpl = { ARROW, BLANK, btn };

  const fill = (sel, html) => document.querySelectorAll(sel).forEach((el) => (el.innerHTML = html));
  fill('[data-slot="header"]', `${logo(document.body.dataset.logo === "fixed")}
    <nav class="ht-sitemap" id="ht-sitemap" aria-hidden="true"><div class="ht-sitemap__inner">${logo(false)}
      <div class="ht-sitemap__contents ht-ups"><h2 class="ht-label">Navigation</h2>
        <div class="ht-sitemap__flex">
          ${[NAV, NAV2].map((list) => `<div class="ht-sitemap__cell"><ul class="ht-sitemap__main">${list.map(([h, ja, en]) => `<li><a href="${h}"><span>${ja}</span><span class="ht-label">${en}</span></a></li>`).join("")}</ul></div>`).join("")}
        </div>
        <div class="ht-sitemap__other"><ul class="ht-sitemap__sub">${SUB.map((t) => `<li><a href="#"><span>${t}</span><i class="ht-blank">${BLANK}</i></a></li>`).join("")}</ul>
          <div class="ht-sitemap__btn">${btn("Inquire by email", "#", "blank")}</div></div>
      </div>
      <div class="ht-sitemap__illust"><div class="wf-img" data-label="3D illustration · researcher at a desk with a city model · attached bottom left · landscape 4:3"></div></div>
    </div></nav>
    <button class="ht-menu-btn" type="button" aria-label="Open and close menu" aria-controls="ht-sitemap" aria-expanded="false"><span class="ht-menu-btn__txt"><span>MENU</span><span>CLOSE</span></span><span class="ht-plus"></span></button>`);
  fill('[data-slot="loader"]:empty', `<div class="ht-loading"><div class="ht-loading__icon"><svg viewBox="0 0 144 60" fill="currentColor">
      <rect data-part="bg" x="0" y="0" width="60" height="60" rx="4" style="fill: var(--kf-accent)"/>
      <path data-part="main" d="M12 12h16v16H12zM32 12h16v16H32zM12 32h16v16H12zM36 32h4v6h6v4h-6v6h-4v-6h-6v-4h6z" style="fill: var(--kf-on-accent)"/>
      <rect data-part="t1" x="70" y="10" width="70" height="8" rx="2"/><rect data-part="t2" x="70" y="26" width="58" height="8" rx="2"/><rect data-part="t3" x="70" y="42" width="66" height="8" rx="2"/>
    </svg></div></div>`);
  const RING = (txt) => `<svg class="ht-how__ring" viewBox="0 0 165 165"><defs><path id="ht-ring-${txt.length}" d="M82.5 82.5m-70 0a70 70 0 1 1 140 0a70 70 0 1 1 -140 0"/></defs><text font-size="11" letter-spacing="3"><textPath href="#ht-ring-${txt.length}">${txt}</textPath></text></svg>`;
  fill('[data-slot="how"]', `<div class="ht-how__bg"></div>
    <div class="ht-how__en ht-loop" data-loop="text" data-speed="30"><div class="ht-loop__track"><p class="ht-stroke">The future of medicine is here. The future of medicine is here.</p></div></div>
    <div class="ht-how__main ht-inner"><a href="#">
      <div class="ht-how__arrow ht-dash" data-dash-rx="20"><div class="ht-how__circle">${RING("TAKE A LESSON · TAKE A LESSON · TAKE A LESSON · ")}<i class="ht-arrow2">${ARROW}</i></div></div>
      <div class="ht-how__contents ht-dash" data-dash-rx="20"><h2 class="ht-how__title ht-display">Your guide title here<br>Add two lines</h2>
        <div class="ht-how__txt"><p>Your one-line body text goes here. Apply this way.</p><p class="ht-label">Take the Course</p></div></div>
      <div class="ht-how__figure ht-pc"><div class="wf-img ht-img" data-label="Isometric campus city model · bright daytime · sticking out at the bottom right"></div></div>
    </a></div>`);
  fill('[data-slot="footer"]', `<div class="ht-foot__inner ht-inner"><div class="ht-foot__flex">
      <p class="ht-foot__catch ht-display">Your catchphrase here<br>Insert two lines.</p>
      <nav class="ht-foot__nav"><div class="ht-foot__main">
        <ul>${NAV.slice(0, 3).map(([h, ja]) => `<li><a href="${h}">${ja}</a></li>`).join("")}<li><a href="#">${NAV[3][1]}</a></li></ul>
        <ul>${NAV2.map(([h, ja]) => `<li><a href="${h}">${ja}</a></li>`).join("")}</ul></div>
        <ul class="ht-foot__sub">${SUB.map((t) => `<li><a href="#"><span>${t}</span><i class="ht-blank">${BLANK}</i></a></li>`).join("")}</ul>
      </nav></div>
      <div class="ht-foot__btn">${btn("Inquire by email", "#", "blank")}</div>
      <div class="ht-foot__logo">${logo(false)}</div></div>`);

  // Lenis — original values as is (lerp .2 · wheel .85, mouse devices only)
  document.querySelectorAll("[data-btn]").forEach((el) => {
    const [txt, href, icon] = el.dataset.btn.split("|");
    el.innerHTML = btn(txt, href, icon);
  });
  document.querySelectorAll(".ht-arrow2:empty, .ht-arrow:empty").forEach((i) => (i.innerHTML = ARROW));
  // Video slot — original KV order: on phones (UA) a vertical clip (-sp), actually decode a transparent webm, and if alpha survives use the webm, otherwise the backdrop mp4.
  // Before detection, body.not-webm applies (the hero layout changes). On devices where autoplay is blocked, removes the video and lays down a last-scene poster for each section
  const vids = [...document.querySelectorAll("video[data-src]")];
  const sp = /(iPhone|Android)/.test(navigator.userAgent) ? "-sp" : "";
  const alpha = new Promise((ok) => {
    if (!vids.length || !document.createElement("video").canPlayType('video/webm; codecs="vp9"')) return ok(false);
    const t = Object.assign(document.createElement("video"), { muted: true, playsInline: true, src: "media/alpha-test.webm" });
    t.style.display = "none";
    const no = () => { t.remove(); ok(false); };
    ["error", "stalled", "abort"].forEach((e) => t.addEventListener(e, no, { once: true }));
    t.addEventListener("loadeddata", () => {
      const c = Object.assign(document.createElement("canvas"), { width: 1, height: 1 }).getContext("2d");
      c.drawImage(t, 0, 0, 1, 1);
      const a = c.getImageData(0, 0, 1, 1).data[3];
      t.remove(); ok(a === 0);
    }, { once: true });
    document.body.append(t);
  });
  window.htVideos = vids.length ? new Promise((done) => {
    document.body.classList.add("not-webm");
    let webm = false;
    alpha.then((w) => { webm = w; if (w) document.body.classList.replace("not-webm", "use-webm"); });
    const dummy = Object.assign(document.createElement("video"), { muted: true, playsInline: true, loop: true, preload: "auto", src: `${vids[0].dataset.src}-sp.mp4` });
    dummy.style.cssText = "position:fixed;top:0;left:0;z-index:-1;opacity:0;visibility:hidden";
    document.body.append(dummy);
    dummy.play().then(() => alpha).then(() => {
      dummy.remove();
      vids.forEach((v) => { v.src = `${v.dataset.src}${sp}.${webm ? "webm" : "mp4"}`; v.load(); });
      done(true);
    }).catch(() => {
      dummy.remove();
      document.querySelectorAll(".ht-kv__video li[data-poster]").forEach((li) => li.insertAdjacentHTML("beforeend", `<img src="${li.dataset.poster}${sp}.webp" alt="" decoding="async">`));
      vids.forEach((v) => v.remove());
      done(false);
    });
  }) : Promise.resolve(false);

  let lenis = null;
  if (hover && !reduce && window.Lenis) {
    lenis = new Lenis({ lerp: 0.2, wheelMultiplier: 0.85, smoothWheel: true, syncTouch: false });
    window.lenis = lenis;
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    new ResizeObserver(() => lenis.resize()).observe(document.body);
  }
  const expo = (t) => (t === 0 ? 0 : t === 1 ? 1 : t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2);
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.getAttribute("href") === "#") return;
    const t = document.querySelector(a.getAttribute("href"));
    if (!t) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(t, { duration: 0.8, easing: expo });
    else t.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  });
  document.addEventListener("click", (e) => { if (e.target.closest('a[href="#"]')) e.preventDefault(); });

  // Loader — starts drawing after 0.3s, waits for both 2.6s of drawing and load before lifting, then fades the backdrop 1s later. For pages without a loader, 0.5s after load
  const loaded = () => { document.body.classList.add("is-loaded"); window.dispatchEvent(new CustomEvent("loaded")); };
  const loader = document.querySelector(".ht-loading");
  if (loader && !reduce) {
    let win = document.readyState === "complete", drawn = false, done = false;
    const end = () => {
      if (done) return;
      done = true;
      loader.classList.add("is-end");
      setTimeout(() => { loader.classList.add("is-load"); loaded(); }, 1000);
    };
    setTimeout(() => { loader.classList.add("is-animation"); setTimeout(() => { drawn = true; if (win) end(); }, 2600); }, 300);
    if (!win) addEventListener("load", () => { win = true; if (drawn) end(); });
  } else {
    loader?.classList.add("is-load");
    const go = () => setTimeout(loaded, reduce ? 0 : 500);
    document.readyState === "complete" ? go() : addEventListener("load", go);
  }

  // Menu panel — the button opens and closes it. Menu links navigate 0.3s after it closes
  const menuBtn = document.querySelector(".ht-menu-btn"), sitemap = document.querySelector(".ht-sitemap");
  const setMenu = (open) => {
    menuBtn.classList.toggle("is-open", open);
    sitemap.classList.toggle("is-open", open);
    document.body.classList.toggle("is-sitemap-open", open);
    menuBtn.setAttribute("aria-expanded", open);
    sitemap.setAttribute("aria-hidden", !open);
    if (lenis) open ? lenis.stop() : lenis.start();
  };
  menuBtn?.addEventListener("click", () => setMenu(!sitemap.classList.contains("is-open")));
  addEventListener("keydown", (e) => { if (e.key === "Escape" && sitemap?.classList.contains("is-open")) setMenu(false); });
  sitemap?.querySelectorAll('a:not([href^="#"])').forEach((a) => a.addEventListener("click", (e) => {
    e.preventDefault();
    setMenu(false);
    setTimeout(() => (location.href = a.href), 300);
  }));

  // Dashed border — insert an SVG rect and set the corner radius to half the element height (pill) or to data-dash-rx
  document.querySelectorAll(".ht-dash").forEach((el) => {
    el.insertAdjacentHTML("afterbegin", '<svg class="ht-dash__svg" aria-hidden="true"><rect/></svg>');
    const rect = el.querySelector("rect");
    const size = () => { const r = el.dataset.dashRx ? +el.dataset.dashRx * parseFloat(getComputedStyle(document.documentElement).fontSize) / 10 : el.offsetHeight / 2; rect.setAttribute("rx", r); rect.setAttribute("ry", r); };
    size();
    new ResizeObserver(size).observe(el);
  });

  // Pill button — measures the distance the arrow circle travels on hover by the button width
  document.querySelectorAll(".ht-btn").forEach((el) => {
    const set = () => el.style.setProperty("--width", `${el.offsetWidth}px`);
    set();
    new ResizeObserver(set).observe(el);
  });

  // Flowing outline band — original loopslider: 5 clones, speed px per second, turning the wheel speeds it up to max boost times, then returns by 0.1 steps
  document.querySelectorAll("[data-loop]").forEach((box) => {
    const track = box.querySelector(".ht-loop__track");
    if (!track || reduce) return;
    const kids = [...track.children];
    for (let i = 0; i < 5; i++) kids.forEach((k) => track.append(Object.assign(k.cloneNode(true), { ariaHidden: "true" })));
    const speed = +(box.dataset.speed ?? 50), boost = +(box.dataset.boost ?? 1);
    let len = 0, off = 0, rate = 1, target = 1, lastWheel = 0, last = performance.now();
    const measure = () => { len = kids.reduce((s, k) => s + k.offsetWidth, 0); };
    measure();
    new ResizeObserver(measure).observe(track);
    if (boost > 1) addEventListener("wheel", (e) => { target = 1 + (Math.min(Math.abs(e.deltaY || 0), 300) / 300) * (boost - 1); lastWheel = performance.now(); }, { passive: true });
    const tick = (now) => {
      const dt = Math.min(Math.max(0, now - last) / 1000, 0.05);
      last = now;
      if (now - lastWheel > 200) target = 1;
      rate += (target - rate) * 0.1;
      off -= speed * rate * dt;
      if (len && off <= -len) off += len;
      track.style.transform = `translate3d(${off}px,0,0)`;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });

  // Rise when visible — original scrollClass (rootMargin 0)
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-shown"); io.unobserve(e.target); } }), { rootMargin: "0% 0px 0%" });
  document.querySelectorAll(".js-trigger").forEach((el) => (reduce ? el.classList.add("is-shown") : io.observe(el)));
  addEventListener("loaded", () => document.querySelectorAll(".js-load-trigger").forEach((el) => el.classList.add("is-shown")));

  // Phone table swipe hint — original c-flick: hide once after the table is pushed over 30px
  document.querySelectorAll(".ht-table").forEach((wrap) => {
    wrap.insertAdjacentHTML("beforeend", '<p class="ht-flick" aria-hidden="true"><span class="ht-flick__box"><svg viewBox="0 0 80 34" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"><path d="M17 5 5 17l12 12M5 17h22M63 5l12 12-12 12M75 17H53"/></svg><span>Swipe sideways to view</span></span></p>');
    const flick = wrap.lastElementChild;
    const on = () => { if (wrap.scrollLeft > 30) { flick.classList.add("is-hidden"); wrap.removeEventListener("scroll", on); } };
    wrap.addEventListener("scroll", on, { passive: true });
  });

  // Pinned index — height set by --height to pin it at screen center. Puts a white cloned index in each blue band (.js-fixed-white) so
  // Cut to a band shape (top and bottom wave SVG + middle fill), and the original order and the clone share hover with each other
  const flexNav = document.querySelector(".ht-flex__nav");
  if (flexNav) {
    const svgUrl = (s) => `url("data:image/svg+xml,${encodeURIComponent(s.outerHTML.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"'))}")`;
    const clones = [...document.querySelectorAll(".js-fixed-white")].map((bg) => {
      const clip = Object.assign(document.createElement("div"), { className: "ht-white-clip" });
      const [top, bottom] = bg.querySelectorAll(":scope > svg");
      clip.style.setProperty("--wave-top", svgUrl(top));
      clip.style.setProperty("--wave-bottom", svgUrl(bottom));
      const c = flexNav.cloneNode(true);
      c.classList.add("is-clone");
      c.setAttribute("aria-hidden", "true");
      c.querySelectorAll("[data-slot]").forEach((el) => el.removeAttribute("data-slot"));
      c.querySelectorAll("a").forEach((a) => (a.tabIndex = -1));
      clip.append(c);
      bg.append(clip);
      const fit = () => {
        clip.style.setProperty("--wave-h", `${top.getBoundingClientRect().height}px`);
        c.style.setProperty("--clone-left", `${flexNav.getBoundingClientRect().left - bg.getBoundingClientRect().left}px`);
      };
      new ResizeObserver(fit).observe(bg);
      return c;
    });
    const navs = [flexNav, ...clones].map((n) => n.querySelector(".ht-localnav"));
    new ResizeObserver(() => navs.forEach((n) => n.style.setProperty("--height", `${navs[0].offsetHeight}px`))).observe(navs[0]);
    const lists = [flexNav, ...clones].map((n) => [...n.querySelectorAll(".ht-localnav a")]);
    lists.forEach((links) => links.forEach((a, i) => {
      a.addEventListener("mouseenter", () => lists.forEach((l) => l !== links && l[i]?.classList.add("is-hover")));
      a.addEventListener("mouseleave", () => lists.forEach((l) => l !== links && l[i]?.classList.remove("is-hover")));
    }));
  }

  // Index highlight — is-current goes on the link of the section passing the screen center
  document.querySelectorAll("[data-localnav]").forEach((nav) => {
    const links = [...nav.querySelectorAll("a[href^='#']")];
    const secs = links.map((a) => document.querySelector(a.getAttribute("href"))?.closest("section"));
    const check = () => {
      const mid = innerHeight / 2;
      let cur = -1;
      secs.forEach((s, i) => { if (s) { const r = s.getBoundingClientRect(); if (r.top <= mid && r.bottom > mid) cur = i; } });
      links.forEach((a, i) => a.classList.toggle("is-current", i === cur));
    };
    addEventListener("scroll", check, { passive: true });
    check();
  });

  // Accordion — opens and closes height in 500ms. After opening, released to auto so growing text isn’t clipped
  document.querySelectorAll(".ht-acc").forEach((acc) => {
    const sw = acc.querySelector(".ht-acc__switch"), panel = acc.querySelector(".ht-acc__panel");
    if (!sw || !panel) return;
    sw.setAttribute("aria-expanded", "false");
    sw.addEventListener("click", () => {
      const open = !acc.classList.contains("is-open");
      acc.classList.toggle("is-open", open);
      sw.setAttribute("aria-expanded", open);
      panel.style.height = `${open ? 0 : panel.scrollHeight}px`;
      requestAnimationFrame(() => { panel.style.height = `${open ? panel.scrollHeight : 0}px`; });
      clearTimeout(panel._t);
      panel._t = setTimeout(() => { if (open) panel.style.height = "auto"; lenis?.resize(); }, 500);
    });
  });

  // Pinned hero advancing one box at a time — the original KV: one section per scroll areaHeight, and when the section changes the video set is swapped,
  // Going down plays the transition clip (then the loop clip once it ends), going up plays the reversed clip. Past the end it gets is-end
  class StepKV {
    constructor(o) {
      this.kv = document.querySelector(o.kv);
      if (!this.kv) return;
      this.o = o;
      this.items = this.kv.querySelectorAll(o.page);
      this.cells = this.kv.querySelectorAll(".ht-kv__video li");
      this.nav = o.nav ? this.kv.querySelector(o.nav) : null;
      this.navCell = this.nav ? this.nav.querySelectorAll("li") : [];
      this.navProgress = this.nav ? this.nav.querySelector("[data-progress]") : null;
      this.len = this.items.length;
      this.wasEnd = false;
      this.timers = new Map();
      this.size();
      this.init();
      addEventListener("resize", () => { this.size(); this.change(); }, { passive: true });
      addEventListener("scroll", () => { if (!this.ticking) { this.ticking = true; requestAnimationFrame(() => this.change()); } }, { passive: true });
      this.kv.querySelector(".ht-kv__scroll button")?.addEventListener("click", (e) => this.go(e, 1));
      this.nav?.querySelectorAll("button").forEach((b, i) => b.addEventListener("click", (e) => this.go(e, i + 1)));
    }
    size() {
      this.wh = innerHeight;
      this.top = this.kv.getBoundingClientRect().top + scrollY;
      this.area = this.o.mode === "vh" ? this.wh * this.o.ratio : this.o.fixed;
      if (this.o.mode === "vh") this.kv.style.setProperty("--area-height", `${this.area}px`);
    }
    calc() {
      const sy = scrollY, a = sy - this.top;
      let i = Math.max(-1, Math.min(Math.floor(a / this.area), this.len - 1));
      if (i < 0) i = 0;
      return { sy, a, i };
    }
    vids(i, dir) {
      const li = this.cells[i];
      if (!li) return {};
      const tr = li.querySelector('video[data-type="translate"]'), lp = li.querySelector('video[data-type="loop"]'), rv = li.querySelector('video[data-type="reverse"]');
      if (!lp) return {};
      if (tr && rv) return dir === -1 ? { main: rv, loop: lp, other: tr } : { main: tr, loop: lp, other: rv };
      if (rv) return { main: dir === -1 ? rv : lp, loop: lp };
      if (tr) return { main: dir === 1 ? tr : lp, loop: lp };
      return { main: lp, loop: lp };
    }
    play(v, delay) {
      if (!v) return;
      const go = () => { v.currentTime = 0; v.play()?.catch(() => {}); };
      window.htVideos.then(() => { if (v.isConnected) delay ? setTimeout(go, delay) : go(); });
    }
    hideLater(v) {
      if (!v) return;
      clearTimeout(this.timers.get(v));
      this.timers.set(v, setTimeout(() => { if (v !== this.main && v !== this.loop) { v.style.opacity = 0; v.currentTime = 0; } }, 300));
    }
    pair(main, loop, delay) {
      clearTimeout(this.timers.get(main)); clearTimeout(this.timers.get(loop));
      if (main === loop) { loop.loop = true; loop.style.opacity = 1; this.play(loop, delay); return; }
      main.style.opacity = 1; loop.style.opacity = 0; loop.loop = true;
      this.play(main, delay);
      main.addEventListener("ended", () => {
        this.play(loop);
        const swap = () => { loop.style.opacity = 1; setTimeout(() => (main.style.opacity = 0), 0); };
        "requestVideoFrameCallback" in loop ? loop.requestVideoFrameCallback(swap) : loop.addEventListener("timeupdate", swap, { once: true });
      }, { once: true });
    }
    state(i) {
      document.body.dataset.areaIndex = i;
      this.cur?.classList.remove("is-shown", "is-not-delay");
      this.cur = this.items[i];
      this.cur.classList.add("is-shown");
      this.cells.forEach((c, k) => c.classList.toggle("is-active", k <= i));
      this.navCell.forEach((c) => c.classList.remove("is-current", "is-past"));
      if (this.nav) {
        this.nav.classList.toggle("is-shown", i > 0);
        for (let k = 0; k < i - 1; k++) this.navCell[k]?.classList.add("is-past");
        if (i > 0) this.navCell[i - 1]?.classList.add("is-current");
      }
    }
    init() {
      const c = this.calc();
      this.i = this.prev = c.i;
      this.a = c.a; this.sy = c.sy;
      this.dir = 1;
      this.state(this.i);
      this.cells[this.i]?.classList.add("is-visible");
      const v = this.vids(this.i, 1);
      this.main = v.main; this.loop = v.loop;
      if (this.i === 0) this.kv.classList.add("start-top");
      if (this.main) {
        this.pair(this.main, this.loop, this.i === 0 ? 200 : 0);
        this.main.addEventListener("play", () => this.kv.classList.add("is-playing"), { once: true });
      } else this.kv.classList.add("is-playing");
      this.progress(); this.end();
    }
    change() {
      const c = this.calc();
      this.sy = c.sy; this.a = c.a;
      if (c.i !== this.prev) {
        this.dir = c.i > this.prev ? 1 : -1;
        this.i = c.i;
        if (this.loop) this.loop.loop = false;
        this.swap();
      }
      this.prev = this.i;
      this.ticking = false;
      this.progress(); this.end();
    }
    swap() {
      this.kv.classList.remove("start-top");
      this.state(this.i);
      this.cells.forEach((c) => c.classList.remove("is-visible"));
      const om = this.main, ol = this.loop, v = this.vids(this.i, this.dir);
      this.main = v.main; this.loop = v.loop;
      if (v.other) v.other.style.opacity = 0;
      om?.pause(); ol?.pause();
      this.hideLater(om); if (ol !== om) this.hideLater(ol);
      if (this.main) this.pair(this.main, this.loop, 0);
      this.cells[this.i]?.classList.add("is-visible");
    }
    progress() {
      if (!this.navProgress || this.navCell.length < 2) return;
      const n = this.navCell.length - 1;
      const t = Math.max(0, Math.min(this.a / this.area - 1, n));
      this.navProgress.style.height = `${(t / n) * 100}%`;
    }
    end() {
      const at = this.top + this.area * this.len + 0.65 * this.wh;
      if (this.sy > at) {
        if (!this.wasEnd) { this.kv.classList.add("is-end"); this.items[this.len - 1].classList.remove("is-shown"); }
        this.wasEnd = true;
      } else {
        if (this.wasEnd) { this.kv.classList.remove("is-end"); if (this.i === this.len - 1) this.items[this.len - 1].classList.add("is-shown", "is-not-delay"); }
        this.wasEnd = false;
      }
    }
    go(e, n) {
      e.preventDefault();
      scrollTo(0, this.area * n);
    }
  }
  window.HtStepKV = StepKV;
  if (!document.querySelector(".ht-kv")) document.body.dataset.areaIndex = "0";
})();
