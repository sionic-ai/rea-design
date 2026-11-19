// Shared: header, veggie dropdown, phone menu, left ruler, loading curtain, page transition (barba 2.10.3 cream curtain), cream footer and soil 3D.
// Header text color is set by the scene as white · black · blend and changes in .2s.
(() => {
  const STAR = '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M20 0l2.2 13.4L30 2.7l-4.5 12.8L38 9.6 28.2 19 40 21.3l-12.9 2.8 9.7 9.2-12.6-5.2L26 40l-6-11.8L14 40l1.8-11.9-12.6 5.2 9.7-9.2L0 21.3 11.8 19 2 9.6l12.5 5.9L10 2.7l7.8 10.7z"/></svg>';
  const ARROW = '<svg viewBox="0 0 10 10"><path d="M2 5h6M5.5 2.5 8 5 5.5 7.5"/></svg>';
  window.vIcon = { star: STAR, arrow: ARROW };
  const capsule = (label, href, cls = "") => `<a class="v-capsule ${cls}" href="${href}"><span>${label}</span><span class="v-capsule__dot">${ARROW}</span></a>`;
  window.vCapsule = capsule;

  // Convert CSS variable colors to rgb for the 3D side — the canvas resolves color-mix · oklch too
  const probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  window.vColor = (name) => {
    const el = document.createElement("i");
    el.style.color = `var(${name})`;
    document.body.append(el);
    probe.fillStyle = getComputedStyle(el).color;
    el.remove();
    probe.fillRect(0, 0, 1, 1);
    const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;
    return `rgb(${r}, ${g}, ${b})`;
  };

  const vegs = ["One vegetable name", "Vegetable name 2", "Vegetable name 3", "Vegetable name 4", "Five vegetable names"];
  const navItems = [
    ["index.html", "Home", "home"], ["index.html#about", "About this job", "about"], [null, "Endangered vegetables", "vegetables"],
    ["index.html#map", "Custom guidance", "map"], ["index.html#partners", "Partners", "partners"],
  ];
  const link = ([href, label, key]) => {
    const inner = `<span class="is-def">${label}</span><span class="is-cur">${label}</span>`;
    return href
      ? `<li><a class="v-nav__link" href="${href}" data-nav="${key}">${inner}</a></li>`
      : `<li><button class="v-nav__link" type="button" data-nav="${key}" data-mega-toggle aria-expanded="false">${inner}</button></li>`;
  };

  const head = document.querySelector('[data-slot="header"]');
  head.className = "v-header";
  head.innerHTML = `
    <div class="v-header__bar">
      <a class="v-logo" href="index.html">${STAR}<span>BRAND</span></a>
      <nav class="v-nav" aria-label="Main menu"><ul class="v-nav__list">${navItems.map(link).join("")}<li class="v-nav__sep" aria-hidden="true"></li>${link(["about.html", "About Materials", "about-page"])}</ul></nav>
      <div class="v-header__ctl">
        <div class="v-lang"><span class="is-on">KO</span><a href="#">EN</a></div>
        ${capsule("Become a Partner", "#")}
        <button class="v-menu-btn" type="button" data-sp-open><i></i>MENU</button>
      </div>
    </div>
    <div class="v-mega__overlay" data-mega-overlay></div>
    <div class="v-mega" data-slot="vegetable-dropdown"><div class="v-mega__inner">
      <p class="v-mega__desc">Your one line here introducing five vegetables.</p>
      <div class="v-mega__list">${vegs.map((v, i) => `<a class="v-mega__item" style="--i: ${i}" href="index.html#veg-${i}"><span class="wf-img" data-label="Vegetables ${i + 1} Cutout · black background · square"></span>${v}<small>Vegetable name ${i + 1}</small></a>`).join("")}
        <div class="v-mega__more" style="--i: ${vegs.length}"><span>• • •</span>Your line about it growing further here<br>Guide two lines</div></div>
    </div></div>`;

  const sp = document.createElement("div");
  sp.className = "v-sp";
  sp.dataset.slot = "mobile-menu";
  sp.innerHTML = `
    <button class="v-sp__close" type="button" data-sp-close>✕ CLOSE</button>
    <div class="v-sp__head"><a class="v-logo" href="index.html">${STAR}<span>BRAND</span></a><div class="v-lang"><span class="is-on">KO</span><a href="#">EN</a></div></div>
    <nav class="v-sp__nav">
      <a href="index.html">Home</a><a href="index.html#about">About this job</a><a href="index.html#vegetables">Endangered vegetables</a>
      <div class="v-sp__vegs">${vegs.map((v, i) => `<a href="index.html#veg-${i}"><span class="wf-img" data-label="Vegetables ${i + 1}"></span>${v}</a>`).join("")}</div>
      <a href="index.html#map">Custom guidance</a><a href="index.html#partners">Partners</a><a href="about.html">About Materials</a>
    </nav>
    <div class="v-sp__cta">${capsule("Become a Partner", "#", "v-capsule--lg")}</div>
    <div class="v-sp__sns"><span>Share</span><a href="#">SNS 1</a><a href="#">SNS 2</a><a href="#">SNS 3</a></div>`;
  const spBg = document.createElement("div");
  spBg.className = "v-sp__overlay";
  spBg.dataset.spClose = "";
  document.body.append(sp, spBg);

  const ruler = document.createElement("div");
  ruler.className = "v-ruler";
  ruler.innerHTML = '<span class="v-ruler__ticks"></span><span class="v-ruler__dot" data-ruler-dot></span>';
  document.body.append(ruler);

  // Vegetable dropdown — like the original, it opens when the mouse is over the button and closes when the mouse leaves the panel. Pressing toggles it, and pressing the backdrop closes it
  const mega = head.querySelector(".v-mega");
  const megaBtn = head.querySelector("[data-mega-toggle]");
  const setMega = (on) => {
    mega.classList.toggle("is-open", on);
    megaBtn.setAttribute("aria-expanded", on);
    document.documentElement.classList.toggle("v-lock", on);
    const main = document.querySelector('[data-barba="container"]');
    if (main) main.inert = on;
  };
  window.vMega = setMega;
  if (matchMedia("(hover: hover)").matches) megaBtn.addEventListener("mouseenter", () => setMega(true));
  mega.addEventListener("mouseleave", () => setMega(false));
  megaBtn.addEventListener("click", () => setMega(!mega.classList.contains("is-open")));
  // Mouse moving past the panel (onto the back veil) counts as leaving the panel — it closes even if the pointer jumps across without touching the panel
  const megaBg = head.querySelector("[data-mega-overlay]");
  megaBg.addEventListener("click", () => setMega(false));
  if (matchMedia("(hover: hover)").matches) megaBg.addEventListener("pointerenter", () => setMega(false));
  document.addEventListener("click", (e) => {
    if (e.target.closest(".v-mega a")) setMega(false);
    if (e.target.closest("[data-sp-open]")) sp.classList.add("is-open");
    if (e.target.closest("[data-sp-close]") || e.target.closest(".v-sp a")) sp.classList.remove("is-open");
  });
  addEventListener("keydown", (e) => e.key === "Escape" && (sp.classList.remove("is-open"), setMega(false)));

  // Header and ruler colors are set by the scene as in the original — white (black stage), black (cream surface), blend (difference inverts the background)
  const setHeader = (t) => { head.dataset.theme = t; ruler.dataset.theme = t; };
  window.vHeader = setHeader;
  const dot = ruler.querySelector("[data-ruler-dot]");
  const progress = () => { const max = document.documentElement.scrollHeight - innerHeight; dot.style.top = `calc(80 * var(--u) + (100% - 160 * var(--u)) * ${max > 0 ? scrollY / max : 0})`; };
  addEventListener("scroll", progress, { passive: true });

  // Loading curtain — original T2: the bar fills by done ÷ total over .4s expo.out, rests .2s once full, then lifts away over .2s (the original gif slot is a spinning star glyph)
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const loading = document.createElement("div");
  loading.className = "v-loading";
  loading.dataset.slot = "loader";
  loading.innerHTML = `<span class="v-loading__mark">${STAR}</span><div class="v-loading__bar"><i></i></div><p class="v-loading__credit">Your 3D production help line here</p>`;
  const mask = document.createElement("div");
  mask.className = "v-mask";
  mask.setAttribute("aria-hidden", "true");
  document.body.append(loading, mask);
  const fill = loading.querySelector("i");
  const load = { total: 0, done: 0, bar: { v: 0 } };
  let loaded;
  const loadedP = new Promise((r) => (loaded = r));
  const task = (p) => {
    load.total++;
    Promise.resolve(p).catch(() => {}).then(() => {
      load.done++;
      gsap.to(load.bar, { v: load.done / load.total, duration: reduce ? 0 : 0.4, ease: "expo.out", overwrite: true,
        onUpdate: () => (fill.style.transform = `scaleX(${load.bar.v})`),
        onComplete: () => load.done >= load.total && loaded() });
    });
  };
  window.vLoadTask = task;
  task(document.fonts?.ready);
  task(new Promise((r) => (document.readyState === "complete" ? r() : addEventListener("load", r, { once: true }))));
  window.vStarted = loadedP.then(() => {
    loading.dataset.isLoaded = "true";
    progress();
    return new Promise((r) => setTimeout(() => { loading.remove(); r(); }, reduce ? 0 : 400));
  });

  // Page transition curtain — original barba mask: a cream curtain covers from below in .6s power4.inOut, and once the new page is set it slides up after .1s in .6s
  const slide = (from, to) => (reduce ? (gsap.set(mask, { yPercent: to }), Promise.resolve())
    : new Promise((r) => gsap.fromTo(mask, { yPercent: from }, { yPercent: to, duration: 0.6, ease: "power4.inOut", onComplete: r })));
  gsap.set(mask, { yPercent: 100, visibility: "visible" });
  window.vMask = { cover: () => slide(100, 0), reveal: async () => { await new Promise((r) => setTimeout(r, 100)); await slide(0, -100); gsap.set(mask, { yPercent: 100 }); } };

  // ---------- Footer ----------
  const foot = document.querySelector('[data-slot="footer"]');
  foot.className = "v-footer";
  foot.dataset.theme = "ink";
  foot.innerHTML = `
    <div class="v-footer__inner">
      <div class="v-footer__content">
        <h2 class="v-footer__title">Making thrifty use of nearby fields,<br>Together, protect endangered vegetables<br>Won’t you help protect it?</h2>
        <p class="v-footer__text">Your three-line notice here saying you are looking for partners.<br>Words saying a small start is okay.<br>Closing line inviting easy contact.</p>
        <div class="v-footer__btn">${capsule("Contact Us", "#", "v-capsule--fill v-capsule--lg")}</div>
      </div>
      <div class="v-footer__links">
        <a class="v-footer__logo" href="index.html">${STAR}BRAND</a>
        <div class="v-footer__icons"><a href="#" aria-label="SNS 1"><svg viewBox="0 0 20 20"><path d="M10 1.8c2.7 0 3 0 4 .1 2.7.1 4 1.4 4.1 4.1.1 1 .1 1.4.1 4s0 3-.1 4c-.1 2.7-1.4 4-4.1 4.1-1 .1-1.3.1-4 .1s-3 0-4-.1C3.3 17.9 2 16.6 1.9 14 1.8 13 1.8 12.6 1.8 10s0-3 .1-4C2 3.3 3.3 2 6 1.9c1-.1 1.3-.1 4-.1zM10 0C7.3 0 6.9 0 5.9.1 2.2.2.2 2.2.1 5.9 0 6.9 0 7.3 0 10s0 3.1.1 4.1c.1 3.7 2.1 5.7 5.8 5.8 1 .1 1.4.1 4.1.1s3.1 0 4.1-.1c3.7-.1 5.7-2.1 5.8-5.8.1-1 .1-1.4.1-4.1s0-3.1-.1-4.1C19.8 2.2 17.8.2 14.1.1 13.1 0 12.7 0 10 0zm0 4.9a5.1 5.1 0 1 0 0 10.2 5.1 5.1 0 0 0 0-10.2zm0 8.4a3.3 3.3 0 1 1 0-6.6 3.3 3.3 0 0 1 0 6.6zm5.3-9.8a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4z"/></svg></a><a href="#" aria-label="SNS 2"><svg viewBox="0 0 20 20"><path d="M18.5 0h-17C.7 0 0 .6 0 1.4v17.2c0 .8.7 1.4 1.5 1.4h17c.8 0 1.5-.6 1.5-1.4V1.4C20 .6 19.3 0 18.5 0zM5.9 17H3V7.5h3V17zM4.5 6.2a1.7 1.7 0 1 1 0-3.4 1.7 1.7 0 0 1 0 3.4zM17 17h-3v-4.6c0-1.1 0-2.5-1.5-2.5S10.8 11 10.8 12.3V17h-3V7.5h2.8v1.3c.4-.7 1.4-1.5 2.9-1.5 3 0 3.6 2 3.6 4.6V17z"/></svg></a></div>
        <div class="v-footer__share"><p>Share on</p><button class="v-footer__chip" type="button" aria-expanded="false" data-share>SNS list</button>
          <div class="v-footer__share-btns" data-share-btns>${["SNS 1", "SNS 2", "SNS 3"].map((n) => `<a href="#" aria-label="${n}"><svg viewBox="0 0 12 12"><circle cx="6" cy="6" r="3"/></svg></a>`).join("")}</div></div>
        <div class="v-footer__sup"><p class="v-footer__h">Collaboration · Supervision</p><p>Your partner name here<br>Your reviewer name here</p></div>
        <div class="v-footer__sup"><p class="v-footer__h">Material Supply</p><p>Your provider name here</p></div>
      </div>
    </div>
    <div class="v-soil" data-soil></div>
    <small class="v-footer__copy">© 0000 Company name Co., Ltd.</small>`;

  // Share button — pressing it spreads the SNS button row in .6s expo and pushes the group below by 30px (original footer__share)
  const share = foot.querySelector("[data-share]");
  share.addEventListener("click", () => {
    const on = share.getAttribute("aria-expanded") !== "true";
    share.setAttribute("aria-expanded", on);
    foot.querySelector("[data-share-btns]").classList.toggle("is-open", on);
  });

  // Soil 3D — the original footer scene (S2): camera fov 45 at (0, 5, 10) looking at the center, with fog 10 to 20 covering everything in the background color.
  // On Home, when the footer shows, the seed falls 2.6 → −1.67 over 2s quart.in (clouds in randomly from .2s later) and a sprout appears at 2.2s
  // Grows over 2s cubic.out and makes a half turn with back.out. On the About page it is fully grown. Appears in .4s when visible, and
  // The lower the footer top edge is on screen, the more the scene is pushed down, up to half the footer height, then follows back up with 2.4s expo.out.
  const soil = { mode: "top", done: false };
  window.vSoil = soil;
  addEventListener("DOMContentLoaded", () => {
    const box = document.querySelector("[data-soil]");
    if (!box || !window.THREE) return;
    const T = window.THREE;
    const renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    box.prepend(renderer.domElement);
    const scene = new T.Scene();
    const bg = new T.Color(window.vColor("--kf-bg"));
    scene.fog = new T.Fog(bg, 10, 20);
    const camera = new T.PerspectiveCamera(45, 1, 0.1, 500);
    const geo = new T.PlaneGeometry(30, 14, 180, 90);
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i);
      const h = Math.sin(x * 0.5) * 0.35 + Math.sin(y * 0.9 + x * 0.3) * 0.28 + Math.sin(x * 2.3 + y * 1.7) * 0.08;
      p.setZ(i, h + (y > 2 ? (y - 2) * 0.25 : 0));
    }
    geo.computeVertexNormals();
    const fade = [];
    const mat = (o) => { const m = new T.MeshStandardMaterial({ transparent: true, opacity: 0, ...o }); fade.push(m); return m; };
    const ground = new T.Mesh(geo, mat({ color: new T.Color(window.vColor("--kf-surface")), roughness: 1 }));
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -2.4;
    ground.receiveShadow = true;
    scene.add(ground);
    const SEED = { y: -1.67, z: 0.4, from: 2.6 };
    const C = { seed: 0x6b4a2e, leaf: 0x7fa23a, stem: 0x9fb06a }; // Not Skin: the seed and sprout’s own colors, so they stay the same when the Skin changes
    const seed = new T.Mesh(new T.SphereGeometry(0.2, 24, 16), mat({ color: C.seed, roughness: 0.7 }));
    seed.scale.set(1, 0.7, 0.8);
    seed.castShadow = true;
    const sprout = new T.Group();
    const stem = new T.Mesh(new T.CylinderGeometry(0.025, 0.035, 0.7, 8), mat({ color: C.stem, roughness: 0.8 }));
    stem.position.y = 0.35;
    sprout.add(stem);
    [-1, 1].forEach((s) => {
      const leaf = new T.Mesh(new T.SphereGeometry(1, 20, 12), mat({ color: C.leaf, roughness: 0.6 }));
      leaf.scale.set(0.26, 0.02, 0.13);
      leaf.position.set(s * 0.24, 0.72, 0);
      leaf.rotation.z = s * 0.35;
      leaf.castShadow = true;
      sprout.add(leaf);
    });
    sprout.position.set(0, SEED.y, SEED.z);
    scene.add(seed, sprout);
    scene.add(new T.AmbientLight(0xffffff, 3.5)); // Not a skin: white light (original lighting value)
    const sun = new T.PointLight(0xffffff, 4.3, 18, 0); // Not a skin: white light (original lighting value)
    sun.position.set(2, 4, -1);
    sun.castShadow = true;
    scene.add(sun);

    let tl = null;
    const opacity = { v: 0 };
    const reset = () => {
      tl?.kill();
      soil.done = false;
      if (soil.mode !== "top") return complete();
      seed.position.set(0, SEED.from, SEED.z);
      seed.rotation.set(0, 0, 0);
      sprout.scale.setScalar(0);
      sprout.rotation.y = -Math.PI;
    };
    const complete = () => { seed.position.set(0, SEED.y, SEED.z); sprout.scale.setScalar(1); sprout.rotation.y = 0; };
    const play = () => {
      if (soil.done) return;
      soil.done = true;
      if (soil.mode !== "top" || reduce) return complete();
      const r = () => Math.PI * (Math.random() * 2 - 1);
      tl = gsap.timeline()
        .to(seed.position, { y: SEED.y, duration: 2, ease: "quart.in" })
        .to(seed.rotation, { x: r(), y: r(), z: r(), duration: 2, ease: "quart.in" }, 0.2)
        .to(sprout.scale, { x: 1, y: 1, z: 1, duration: 2, ease: "cubic.out" }, 2.2)
        .fromTo(sprout.rotation, { y: -Math.PI }, { y: 0, duration: 2, ease: "back.out" }, 2.2);
    };
    soil.reset = reset;
    reset();

    const view = { y: 0 };
    const offset = () => camera.setViewOffset(w, h, 0, -view.y, w, h);
    const follow = (now) => {
      const top = box.getBoundingClientRect().top;
      const y = Math.max(0, Math.min(1, top / innerHeight)) * box.offsetHeight * 0.5;
      if (now || reduce) { gsap.killTweensOf(view); view.y = y; offset(); }
      else gsap.to(view, { y, duration: 2.4, ease: "expo.out", overwrite: true, onUpdate: offset });
    };
    let w = 1, h = 1;
    const size = () => {
      w = box.clientWidth; h = box.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.position.set(0, 5, 10);
      camera.lookAt(0, 0, 0);
      // Like the original, sets the view by screen width (max 1600) — phones get twice as wide
      const a = (Math.min(w, 1600) * (innerWidth < 768 ? 2 : 1)) / h;
      camera.fov = (2 * Math.atan(Math.tan((45 * Math.PI) / 360) / a) * 180) / Math.PI;
      camera.updateProjectionMatrix();
      follow(true);
    };
    size();
    new ResizeObserver(size).observe(box);
    addEventListener("scroll", () => follow(false), { passive: true });
    let visible = false;
    new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      gsap.to(opacity, { v: visible ? 1 : 0, duration: reduce ? 0 : 0.4, ease: "none", overwrite: true, onUpdate: () => fade.forEach((m) => (m.opacity = opacity.v)) });
      if (visible) play();
    }).observe(box);
    const tick = () => {
      if (visible || opacity.v > 0) renderer.render(scene, camera);
      requestAnimationFrame(tick);
    };
    tick();
  });

  // ---------- Page attach/detach and barba handoff ----------
  // Page scripts live in window.vPages[namespace] = (container) => Registers itself with the release function
  window.vPages = window.vPages || {};
  let unmount = null;
  const mount = (root) => {
    const ns = root.dataset.barbaNamespace;
    document.body.dataset.page = ns === "top" ? "home" : ns;
    head.querySelectorAll("[aria-current]").forEach((n) => n.removeAttribute("aria-current"));
    head.querySelector(`[data-nav="${ns === "about" ? "about-page" : "home"}"]`)?.setAttribute("aria-current", "true");
    setHeader(ns === "top" ? "white" : "blend");
    soil.mode = ns;
    soil.reset?.();
    unmount = window.vPages[ns]?.(root) || null;
    progress();
  };
  const abs = (h) => new URL(h, location.href).href;
  // Brings the next page’s css and js into the current document: unnecessary in the original, which shared css
  const bring = async (html) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    document.title = doc.title;
    const want = [...doc.querySelectorAll('link[rel="stylesheet"]')].map((l) => abs(l.getAttribute("href")));
    const have = [...document.querySelectorAll('link[rel="stylesheet"]')].map((l) => l.href);
    await Promise.all(want.filter((u) => !have.includes(u)).map((href) => new Promise((r) => {
      document.head.append(Object.assign(document.createElement("link"), { rel: "stylesheet", href, onload: r, onerror: r }));
    })));
    const loadedJs = [...document.querySelectorAll("script[src]")].map((s) => s.src);
    for (const s of doc.querySelectorAll("script[src]")) {
      const src = abs(s.getAttribute("src"));
      if (loadedJs.includes(src)) continue;
      await new Promise((r) => document.body.append(Object.assign(document.createElement("script"), { src, onload: r, onerror: r })));
    }
    return () => document.querySelectorAll('link[rel="stylesheet"]').forEach((l) => want.includes(l.href) || l.remove());
  };
  const stop = (e) => e.preventDefault();
  const lock = (on) => ["wheel", "touchmove"].forEach((t) => (on ? addEventListener(t, stop, { passive: false }) : removeEventListener(t, stop)));
  addEventListener("DOMContentLoaded", () => {
    mount(document.querySelector('[data-barba="container"]'));
    if (!window.barba || !/^https?:$/.test(location.protocol)) {
      // file:// — barba can’t load the next page, so only cover with the curtain and navigate normally
      document.addEventListener("click", async (e) => {
        const a = e.target.closest("a[href]");
        if (!a || a.target || e.metaKey || e.ctrlKey || a.getAttribute("href").startsWith("#")) return;
        const url = new URL(a.href, location.href);
        if (url.pathname === location.pathname || a.href.includes("../../")) return;
        e.preventDefault();
        await window.vMask.cover();
        location.href = a.href;
      });
      return;
    }
    let dropOld = null, hash = "";
    history.scrollRestoration = "manual";
    barba.hooks.before(({ trigger }) => {
      lock(true);
      hash = trigger instanceof HTMLElement ? new URL(trigger.href, location.href).hash : "";
      setMega(false);
      sp.classList.remove("is-open");
    });
    barba.hooks.afterLeave(() => {
      try { unmount?.(); } catch (err) { /* Even if detaching fails, the next page still gets attached */ }
      unmount = null;
      ScrollTrigger.getAll().forEach((t) => t.kill());
      // The old body is removed by barba — if removed first, barba can’t remember the before and after positions and attaches the new body after the footer
    });
    // barba also calls beforeEnter once on first open — like the original, skip that first call (already attached)
    let first = true;
    barba.hooks.beforeEnter(async ({ next }) => {
      if (first) { first = false; return; }
      next.container.style.visibility = "hidden";
      dropOld = await bring(next.html);
      scrollTo(0, 0);
      mount(next.container);
      ScrollTrigger.refresh();
      if (hash) window.vJump?.(hash);
      await new Promise((r) => setTimeout(r, 200));
    });
    barba.hooks.after(() => { dropOld?.(); lock(false); });
    barba.init({
      preventRunning: true,
      transitions: [{
        name: "mask",
        sync: false,
        leave: () => window.vMask.cover(),
        enter: ({ next }) => { next.container.style.visibility = "visible"; return window.vMask.reveal(); },
      }],
      prevent: ({ el, href }) => {
        if (!el || el.target === "_blank" || el.hasAttribute("data-barba-prevent") || el.hasAttribute("download")) return true;
        const raw = el.getAttribute("href") || "";
        if (!raw || raw.startsWith("#") || /^(mailto:|tel:|javascript:)/.test(raw) || raw.includes("../../")) return true;
        try {
          const u = new URL(href, location.href);
          if (u.origin !== location.origin) return true;
          if (u.pathname === location.pathname && u.hash) return true;
        } catch (err) { return true; }
        return false;
      },
    });
  });
})();
