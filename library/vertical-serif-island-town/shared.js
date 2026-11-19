// Shared by all pages: measure the original grid variable (rem that only scales up above 1800, phones based on 390) · fill header columns, menu panels and footer · open and close the menu (scroll lock) ·
// Hero four menus (html.is-first) · vertical title turns white over dark photos (.is-on) · splitting text into characters (so the part drift-chars-in does not erase line breaks)
(() => {
  const root = document.documentElement;
  const narrow = matchMedia("(max-width: 767px)");
  const GRID = {
    S: { fix: [10, 20, 0], flex: [7, 3.73, 2] },
    M: { fix: [10, 70, 0], flex: [10, 4, 2] },
    L: { fix: [15, 100, 35], flex: [15.5, 6, 3] },
  };
  // Original grid_guide: fixed columns = type1·type2·type1 on both sides + three type1 in the middle, flexible cell = Remaining width (1800 max, phone 390) ÷ ratio
  const measure = () => {
    const cw = root.clientWidth;
    let ratio = 1;
    if (narrow.matches) ratio = cw / 390;
    else if (cw > 1800) ratio = cw / 1800;
    root.style.setProperty("--view-ratio", ratio.toFixed(4));
    const g = narrow.matches ? GRID.S : innerWidth > 1024 ? GRID.L : GRID.M;
    const fixed = 2 * (g.fix[0] * 2 + g.fix[1]) + g.fix[0] * 3;
    const base = (narrow.matches ? 390 : Math.min(cw, 1800)) - fixed;
    g.fix.forEach((v, i) => root.style.setProperty(`--fix-type${i + 1}`, `${(v * 0.1).toFixed(2)}rem`));
    g.flex.forEach((v, i) => root.style.setProperty(`--flex-type${i + 1}`, `${((base / v) * 0.1).toFixed(2)}rem`));
  };
  measure();
  addEventListener("resize", measure);

  // ── Page transition curtain (screen change of the original Next routing: after a press it covers in .33s sine.inOut, and the new page is revealed in .7s power4.out) ──
  const veil = document.createElement("i");
  veil.className = "mk-veil";
  veil.setAttribute("aria-hidden", "true");
  document.body.append(veil);
  const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
  // The original is a single-page app so the opening screen plays only on first open — when arriving from within the site, skip it and open the Hero directly
  const loader = document.querySelector("[data-fx~='distance-zoom-loader']");
  if (loader && sessionStorage.getItem("mk-inside")) {
    loader.remove();
    addEventListener("DOMContentLoaded", () => document.dispatchEvent(new CustomEvent("fx:end", { bubbles: true })));
  }
  // When arriving via in-site navigation, the new page stands immediately like the original (the reveal happens only on first load)
  const viaNav = sessionStorage.getItem("mk-nav");
  sessionStorage.removeItem("mk-nav");
  if (!calm && !viaNav && !document.querySelector("[data-fx~='distance-zoom-loader']") && window.gsap) {
    gsap.set(veil, { opacity: 1 });
    // Reveal after the new page has fully loaded (load) — the original also does .7s power4.out after routing finishes
    const lift = () => requestAnimationFrame(() => gsap.to(veil, { opacity: 0, duration: 0.7, ease: "power4.out" }));
    if (document.readyState === "complete") lift(); else addEventListener("load", lift, { once: true });
  }
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || calm || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank") return;
    const href = a.getAttribute("href");
    if (!/\.html(?:$|[?#])/.test(href) || href.startsWith("http")) return;
    e.preventDefault();
    sessionStorage.setItem("mk-inside", "1");
    sessionStorage.setItem("mk-nav", "1");
    gsap.to(veil, { opacity: 1, duration: 0.33, ease: "sine.inOut", onComplete: () => { location.href = a.href; } });
  });
  addEventListener("pageshow", (e) => { if (e.persisted) gsap.set(veil, { opacity: 0 }); });

  // ── Header pillar · menu panel · Footer ──
  const MENU = [
    ["Get to know the island", [["about.html", "About the island"], ["index.html", "It’s an island, a city"], ["news.html", "Island Festival"], ["about.html", "To live"], ["work.html", "To work"], ["about.html", "To Grow"], ["news.html", "Island News"]]],
    ["People of the island", [["work.html", "The ‹purpose› of 300 people being here"]]],
    ["Connect with the island", [["about.html", "I want to see"], ["work.html", "I want to live there"], ["news.html", "I want to help"], ["article.html", "I want to ask"]]],
  ];
  const sitemap = `<div class="mk-sitemap">${MENU.map(([t, items]) => `<div class="mk-sitemap__cat"><p>${t}</p><ul>${items.map(([h, l]) => `<li><a href="${h}">${l}</a></li>`).join("")}</ul></div>`).join("")}</div>`;
  const head = document.querySelector('header[data-slot="header"]');
  if (head) {
    head.className = "mk-head";
    head.innerHTML = `<a class="mk-head__title" href="index.html" data-label="Island name vertical logo (brush-feel serif)">Island name</a>`;
    head.insertAdjacentHTML("afterend", `<nav class="mk-top-menu" aria-label="Hero menu"><a href="about.html">About the island</a><a href="work.html">To work</a><a href="news.html">Island News</a><a href="article.html">I want to ask</a></nav><button class="mk-burger" type="button" aria-label="Menu"><i></i><i></i></button><div class="mk-menu" aria-hidden="true"><div class="mk-menu__in">${sitemap}</div></div>`);
    const burger = document.querySelector(".mk-burger");
    burger.addEventListener("click", () => {
      const open = !root.classList.contains("is-menu");
      root.classList.toggle("is-menu", open);
      root.classList.toggle("is-lock", open);
      document.querySelector(".mk-menu").setAttribute("aria-hidden", String(!open));
    });
  }
  const foot = document.querySelector('footer[data-slot="footer"]');
  if (foot) {
    foot.className = "mk-foot";
    foot.innerHTML = `<div class="mk-foot__body"><nav class="mk-sitemap-wrap" aria-label="Sitemap"><div style="display:flex;flex-direction:row-reverse"><p class="mk-foot__mark">Island name</p>${sitemap}</div></nav>
      <div class="mk-foot__info"><p>Island village office</p><p>Postal code 000-0000 · Your address on one line</p><p class="mk-latin">00-0000-0000</p><a class="mk-foot__insta" href="#" aria-label="Social Media"></a><p class="mk-foot__copy">Copyright 2024 Island Name All Rights Reserved.</p></div></div>
      <div class="mk-foot__photo" data-on><figure class="mk-ph is-dark" data-label="Two people sitting on a wall · summer sunlight · tall portrait full screen"></figure>
        <div class="mk-foot__wish"><a href="about.html">I want to see</a><a href="work.html">I want to live there</a><a href="article.html">I want to hear the story</a><a href="news.html">I want to help</a></div>
        <a class="mk-pagetop" href="#top"><span class="mk-pagetop__label">Back to top</span><span class="mk-more__arrow"></span></a></div>`;
  }

  // When a dark photo section ([data-on]) passes the middle height of the column, the vertical title turns white (original is_on, fill .8s)
  const headEl = document.querySelector(".mk-head");
  const ons = [...document.querySelectorAll("[data-on]")];
  const tick = () => {
    if (!headEl) return;
    const mid = innerHeight / 2;
    headEl.classList.toggle("is-on", ons.some((s) => { const r = s.getBoundingClientRect(); return r.top <= mid && r.bottom >= mid; }));
    const first = document.querySelector("[data-first]");
    root.classList.toggle("is-first", !!first && first.getBoundingClientRect().bottom > innerHeight * 0.5 && !root.classList.contains("is-loading"));
  };
  addEventListener("scroll", tick, { passive: true });
  addEventListener("load", tick);
  root.addEventListener("mk:opened", tick);
  tick();

  // Split text into letter spans — <br> Kept because it splits vertical lines (original .char)
  document.querySelectorAll("[data-split]").forEach((el) => {
    const walk = (node) => [...node.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        [...n.textContent].forEach((ch) => {
          if (!ch.trim()) { frag.append(ch); return; }
          const s = document.createElement("span");
          s.className = "char";
          s.dataset.fxPart = "char";
          s.textContent = ch;
          frag.append(s);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1 && n.tagName !== "BR") walk(n);
    });
    walk(el);
  });

  // News row hover (cover turns on at .6s power3.out and photo 1 → 1.05 1s, release .3s · .6s) and drag strip (one step .8s expo.out) — shared by Home and Work
  addEventListener("DOMContentLoaded", () => {
  if (matchMedia("(hover: hover)").matches) document.querySelectorAll(".mk-news__list a").forEach((a) => {
    const box = a.querySelector("[data-hover]");
    if (!box) return;
    const pic = box.firstElementChild;
    a.addEventListener("mouseenter", () => { gsap.to(box, { overwrite: true, opacity: 1, duration: 0.6, ease: "power3.out" }); gsap.set(pic, { scale: 1 }); gsap.to(pic, { overwrite: true, scale: 1.05, duration: 1, ease: "power3.out" }); });
    a.addEventListener("mouseleave", () => { gsap.to(box, { overwrite: true, opacity: 0, duration: 0.3, ease: "power3.out" }); gsap.to(pic, { overwrite: true, scale: 1, duration: 0.6, ease: "power3.out" }); });
  });
  document.querySelectorAll(".mk-banner__wrap").forEach((wrap) => {
    const list = wrap.querySelector(".mk-banner__list");
    const ind = wrap.nextElementSibling;
    const prev = ind?.querySelector(".mk-banner__prev"), next = ind?.querySelector(".mk-banner__next");
    let x = 0, sx = 0, start = 0, drag = false, moved = false;
    const limit = () => Math.min(0, wrap.clientWidth - list.scrollWidth - parseFloat(getComputedStyle(wrap).paddingLeft) * 2);
    const sync = () => { if (prev) prev.disabled = x >= 0; if (next) next.disabled = x <= limit(); };
    const go = (v, d = 0.8) => { x = Math.max(limit(), Math.min(0, v)); gsap.to(list, { x, duration: d, ease: "expo.out", overwrite: true }); sync(); };
    const step = () => (list.firstElementChild?.getBoundingClientRect().width || 300) + 15;
    prev?.addEventListener("click", () => go(x + step()));
    next?.addEventListener("click", () => go(x - step()));
    wrap.addEventListener("pointerdown", (e) => { if (e.pointerType !== "mouse") return; drag = true; moved = false; sx = e.clientX; start = x; });
    addEventListener("pointermove", (e) => { if (!drag) return; const d = e.clientX - sx; if (Math.abs(d) > 4) { moved = true; wrap.classList.add("is-drag"); } go(start + d, 0.4); });
    addEventListener("pointerup", () => { if (!drag) return; drag = false; setTimeout(() => wrap.classList.remove("is-drag"), 0); });
    wrap.addEventListener("click", (e) => { if (moved) e.preventDefault(); }, true);
    sync();
  });
  });
})();
