// Shared motion for one Brand set — barba 2.10.3 five transitions (card cell zoom in·out, detail push up·down, plain), white circle·text cursor, clipped header,
// Masonry grid (masonry 4.2.2), detail photo slider (embla 8.6), archive row photo follow, phone filter drawer, Hero loading.
// Values are straight from the original — transition 1s bazz-in(.54,.15,.15,1) · bazz-out(.85,0,.45,.85), push waits 1050ms, archive photo y .5s power3, card 1s after the hero.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const lg = () => matchMedia("(min-width: 1024px)").matches;
  const body = document.body;
  gsap.registerPlugin(CustomEase);
  CustomEase.create("bazz-in", ".54,.15,.15,1");
  CustomEase.create("bazz-out", ".85,0,.45,.85");
  const D = reduce ? 0 : 1;

  // Scrollbar width — subtracted so an enlarged card doesn’t go under the bar
  const scrollGap = () => window.innerWidth - document.documentElement.clientWidth;

  // Cursor — white circle over slots, label (data-cursor="Text") Over it, that text. Sticks to the mouse position with no delay
  const cursor = document.createElement("div");
  cursor.className = "cursor";
  cursor.innerHTML = "<div></div>";
  body.appendChild(cursor);
  const pin = cursor.firstElementChild;
  const setX = gsap.quickSetter(pin, "x", "px"), setY = gsap.quickSetter(pin, "y", "px");
  setX(-100); setY(-100);
  addEventListener("mousemove", (e) => { setX(e.clientX); setY(e.clientY); });
  const cursorOff = () => cursor.classList.remove("on");
  function bindCursor(root) {
    $$("[data-cursor]", root).forEach((el) => {
      el.addEventListener("mouseenter", () => {
        if (body.classList.contains("is-busy")) return;
        const t = el.getAttribute("data-cursor");
        pin.innerHTML = t === "circle" ? '<div class="circle"></div>' : `<div class="button">${t}</div>`;
        cursor.classList.add("on");
      });
      el.addEventListener("mouseleave", cursorOff);
    });
  }

  // Header — crops the fixed 16vw title to the bottom of the empty space below, so scrolling down leaves only a 9.3vw band (per frame)
  let headers = [];
  const cropOne = (h) => {
    const b = h.back ? h.back.getBoundingClientRect().bottom : 0;
    h.crop.style.setProperty("--header-height", b > 0 ? `${b}px` : "inherit");
  };
  function bindHeaders(root) {
    headers = $$(".header-comp", root).filter((h) => !h.closest(".the-menu")).map((h) => ({
      crop: $(".header-crop", h), back: $('[data-el="back"]', h), collapsed: h.hasAttribute("data-collapsed"),
    }));
    headers.forEach(cropOne);
  }
  gsap.ticker.add(() => { if (!body.classList.contains("is-busy")) headers.forEach((h) => !h.collapsed && cropOne(h)); });

  // Scroll indicator — passes at 200px·600px, while scrolling down (on the way up, from the fifth event)
  let lastY = 0, ups = 0;
  addEventListener("scroll", () => {
    const y = window.scrollY, c = body.classList;
    if (y > lastY) { ups = 0; c.add("is-scrolling-down"); c.remove("is-scrolling-up"); }
    else if (y < lastY && ++ups > 4) { c.remove("is-scrolling-down"); c.add("is-scrolling-up"); }
    lastY = Math.max(0, y);
    c.toggle("is-scrolled-bit", lastY > 200);
    c.toggle("is-scrolled", lastY > 600);
    if (archiveOff) archiveOff();
  }, { passive: true });

  // Brick grid — original settings as is (percentPosition, horizontal order, 0 offset)
  let live = [];
  function bindMasonry(root) {
    $$("[data-masonry]", root).forEach((el) => {
      const m = new Masonry(el, { itemSelector: ".item", percentPosition: true, transitionDuration: 0, horizontalOrder: true, resize: false });
      const ro = new ResizeObserver(() => m.layout());
      ro.observe(el);
      live.push(() => { ro.disconnect(); m.destroy(); });
    });
  }

  // Detail photo slider — embla loop · initial alignment, left and right halves act as previous and next buttons, number dots below
  function bindGalleries(root) {
    $$("[data-gallery]", root).forEach((g) => {
      if (g.hasAttribute("data-disabled") || g.closest(".the-menu")) return;
      const embla = EmblaCarousel($(".embla__viewport", g), { loop: true, align: "start" }, [EmblaCarouselClassNames()]);
      $(".embla-prev", g)?.addEventListener("click", () => embla.scrollPrev());
      $(".embla-next", g)?.addEventListener("click", () => embla.scrollNext());
      const dots = $(".embla-pagination", g);
      if (dots) {
        dots.innerHTML = embla.scrollSnapList().map((_, i) => `<button type="button" class="embla__dot">${String(i + 1).padStart(2, "0")}</button>`).join("");
        const btns = [...dots.children];
        btns.forEach((b, i) => b.addEventListener("click", () => embla.scrollTo(i)));
        const mark = () => btns.forEach((b, i) => b.classList.toggle("embla__dot--selected", i === embla.selectedScrollSnap()));
        embla.on("select", mark); mark();
      }
      live.push(() => embla.destroy());
    });
  }

  // Archive — hovering a row makes that row’s photo follow the cursor height in .5s power3. Turns off when leaving the list or scrolling
  let archiveOff = null;
  function bindArchive(root) {
    const list = $("[data-archive]", root);
    if (!list || list.closest(".the-menu")) return;
    const hover = $(".archive-hover", list), slot = $(".frame > div", hover), frame = $(".frame", hover);
    const toY = gsap.quickTo(frame, "y", { duration: 0.5, ease: "power3" });
    const vis = (on) => hover.classList.toggle("on", on);
    const move = (e) => { if (hover.classList.contains("on")) toY(e.clientY); };
    addEventListener("mousemove", move);
    list.addEventListener("mouseleave", () => vis(false));
    $$("[data-hover]", list).forEach((row) => {
      const photo = $(".row-photo", row);
      row.addEventListener("mouseenter", (e) => {
        if (!hover.classList.contains("on")) gsap.set(frame, { y: e.clientY });
        vis(true);
        slot.replaceChildren(photo.cloneNode(true));
      });
    });
    archiveOff = () => vis(false);
    live.push(() => { removeEventListener("mousemove", move); archiveOff = null; });
  }

  // Collapsed big link — measure the inner height on the next frame and set it as --height, then release the collapse and CSS expands it in .5s
  function bindHeights(root) {
    $$(".big-links[data-collapsed]", root).forEach((el) => {
      if (el.closest(".the-menu")) return;
      requestAnimationFrame(() => {
        el.style.setProperty("--height", `${[...el.children].reduce((h, c) => h + c.getBoundingClientRect().height, 0)}px`);
        el.removeAttribute("data-collapsed");
      });
    });
  }

  // Phone filter drawer — tap and it opens to its inner height in .5s
  function bindDrawers(root) {
    $$(".work-cats .trigger", root).forEach((t) => {
      const box = t.closest(".work-cats"), drawer = $(".drawer", box);
      t.addEventListener("click", () => {
        box.style.setProperty("--drawer-h", `${drawer.scrollHeight}px`);
        box.classList.toggle("open");
      });
    });
  }

  // Hero — pick one background photo (the same one for two days), and 1s after the photo arrives the logo slides up and the card rises
  function bindHome(root, back) {
    const home = $(".homepage-menu", root);
    if (!home) return;
    const covers = $$('[data-el="cover-images"]', home);
    let pick = Number(localStorage.getItem("kf-brand-cover") ?? -1);
    if (!(pick >= 0 && pick < covers.length)) { pick = Math.floor(Math.random() * covers.length); localStorage.setItem("kf-brand-cover", pick); }
    covers.forEach((c, i) => { c.hidden = i !== pick; });
    home.classList.toggle("is-dark", covers[pick]?.getAttribute("data-dark") === "true");
    if (back) { home.classList.add("all-loaded"); return; }
    requestAnimationFrame(() => {
      home.classList.add("images-loaded");
      setTimeout(() => home.classList.add("menu-loaded"), reduce ? 0 : 1000);
    });
  }

  function bind(root, back = false) {
    live.forEach((off) => off());
    live = [];
    bindCursor(root);
    bindHeaders(root);
    bindMasonry(root);
    bindGalleries(root);
    bindArchive(root);
    bindDrawers(root);
    if (!body.classList.contains("is-busy")) bindHeights(root);
    bindHome(root, back);
  }

  const setTransition = (names) => {
    body.className = body.className.split(" ").filter((c) => !c.startsWith("transition-")).join(" ");
    if (names) body.classList.add(...[].concat(names).map((n) => `transition-${n}`));
  };
  const setPage = (ns) => {
    body.className = body.className.split(" ").filter((c) => !c.startsWith("page-")).join(" ");
    body.classList.add(`page-${ns}`);
  };
  const busy = (on) => body.classList.toggle("is-busy", on);
  const COLS = ["43%", "33%", "24%"];
  const shift = (ns) => (ns === "brand" ? "100%" : ns === "page" ? "-100%" : "0%");
  const mobileY = (ns, top) => (ns === "page" ? -(top * 3 + innerHeight * 2 * 3) : ns === "works-list" ? -(top * 3 + innerHeight * 3) : -top * 3);

  // Card cell zoom — scale the card (a triple-size plate shrunk to 1/3) up threefold so the pressed cell fills the screen. Cell width 43·33·24% → 33.33%
  const zoomIn = {
    name: "zoom-in", sync: true,
    from: { namespace: ["menu"] }, to: { namespace: ["page", "works-list", "brand"] },
    leave({ current, next }) {
      const c = current.container, ns = next.namespace;
      const inner = $(".the-menu-inner", c), str = $(".the-menu-stretcher", c), cols = $$(".menu-column", inner);
      const ref = $(".reference-menu > div", c).getBoundingClientRect();
      const tl = gsap.timeline(), ease = "bazz-in";
      tl.to(inner, { "--progress": 0, duration: D, ease }, 0);
      if (lg()) {
        if (ns === "brand") {
          const top = $(".brand-top", c);
          gsap.set(top, { height: ref.height * 3, minHeight: 0 });
          tl.to(top, { height: innerHeight, duration: D, ease }, 0);
        }
        tl.to(str, { width: (innerWidth - scrollGap()) * 3, y: -ref.top * 3, scale: 3, x: shift(ns), duration: D, ease }, 0);
        cols.forEach((col, i) => { gsap.set(col, { width: COLS[i] }); tl.to(col, { width: "33.3332%", duration: D, ease }, 0); });
      } else {
        tl.to(str, { height: innerHeight * 3, width: innerWidth, scale: 3, y: mobileY(ns, ref.top), duration: D, ease }, 0);
        cols.forEach((col) => {
          if (col.classList.contains("menu-brand") && ns === "brand") {
            const top = $(".brand-top", col), contacts = $(".brand-contacts", col);
            const h = top.getBoundingClientRect().height, real = $(".brand-top", next.container)?.getBoundingClientRect().height || innerHeight;
            gsap.set(top, { height: h * 3, minHeight: 0 });
            tl.to(top, { height: Math.round(h) < Math.round(col.getBoundingClientRect().height) ? real : innerHeight * 3, duration: D, ease }, 0);
            gsap.set(contacts, { y: 0 });
            tl.to(contacts, { y: "-17vw", duration: D, ease }, 0);
          }
          gsap.set(col, { height: "32%" });
          tl.to(col, { padding: 0, height: "33.3332%", marginBottom: 0, duration: D, ease }, 0);
        });
      }
      setTransition(["zoom-in", ns]);
      return tl;
    },
    enter() { window.scrollTo(0, 0); },
  };

  // Card cell shrink — move the page being viewed into that cell, shrink the triple-size panel to 1/3, and turn it back into a card
  const zoomOut = {
    name: "zoom-out", sync: true,
    from: { namespace: ["page", "works-list", "brand"] }, to: { namespace: ["menu"] },
    leave({ current, next }) {
      const n = next.container, ns = current.namespace, ease = "bazz-out";
      const tl = gsap.timeline({ delay: 0.02 });
      const inner = $(".the-menu-inner", n), cols = $$(".menu-column", inner), str = $(".the-menu-stretcher", n);
      const ref = $(".reference-menu > div", n).getBoundingClientRect();
      const wrap = $(`.menu-page-wrap[data-page="${ns}"]`, n);
      let topH = 0;
      if (ns === "brand") topH = $(".brand-top", current.container)?.clientHeight || 0;
      if (wrap) {
        wrap.innerHTML = current.container.innerHTML;
        wrap.classList.add("in-transition");
        setTimeout(() => { current.container.innerHTML = ""; }, 50);
      }
      gsap.set(body, { "--progress": 0 });
      tl.to(body, { "--progress": 1, duration: D, ease }, 0);
      if (lg()) {
        requestAnimationFrame(() => {
          if (ns !== "brand") return;
          const top = $(".brand-top", wrap || n), h = top.getBoundingClientRect().height;
          gsap.set(top, { height: h < innerHeight ? h : innerHeight });
          tl.to(top, { height: ref.height * 3, duration: D, clearProps: "all", ease }, 0);
        });
        gsap.set(str, { width: (innerWidth - scrollGap()) * 3, y: -ref.top * 3, scale: 3, x: shift(ns) });
        tl.to(str, { width: ref.width * 3, y: 0, x: 0, scale: 1, duration: D, clearProps: "all", ease }, 0);
        cols.forEach((col, i) => { gsap.set(col, { width: "33.3332%" }); tl.to(col, { width: COLS[i], clearProps: "all", duration: D, ease }, 0); });
      } else {
        gsap.set(str, { height: innerHeight * 3, width: innerWidth, scale: 3, y: mobileY(ns, ref.top) });
        tl.to(str, { width: ref.width * 3, height: ref.height * 3, y: 0, x: 0, scale: 1, duration: D, clearProps: "all", ease }, 0);
        cols.forEach((col) => {
          if (col.classList.contains("menu-brand") && ns === "brand") {
            const top = $(".brand-top", col), contacts = $(".brand-contacts", col);
            gsap.set(top, { height: topH, minHeight: 0 });
            tl.to(top, { height: ref.height - 60, duration: D, ease }, 0);
            gsap.set(contacts, { y: "-17vw", position: "absolute" });
            tl.to(contacts, { y: "0vw", duration: D, ease, clearProps: "all" }, 0);
          }
          gsap.set(col, { height: "33.3332%", padding: 0, marginBottom: 0 });
          tl.to(col, { padding: "20px", height: "32%", marginBottom: "42px", clearProps: "all", duration: D, ease }, 0);
        });
      }
      current.container.classList.add("in-transition");
      setTransition(["zoom-out", ns]);
      window.scrollTo(0, 0);
      return tl;
    },
  };

  // Detail — the new panel slides up from 100vh below in 1s (css), and on close the panel being viewed slides down in 1s
  const wait = (ms) => new Promise((r) => setTimeout(r, reduce ? 0 : ms));
  const slideIn = { name: "slide-in", sync: true, to: { namespace: ["work"] }, leave() { setTransition("slide-in"); return wait(1050).then(() => window.scrollTo(0, 0)); } };
  const slideOut = { name: "slide-out", sync: true, from: { namespace: ["work"] }, leave() { setTransition("slide-out"); return wait(1050); } };
  const base = { name: "base", sync: false, enter() { window.scrollTo(0, 0); return Promise.resolve(); } };

  const first = $('[data-barba="container"]');
  first.classList.remove("to-load");
  setPage(first.getAttribute("data-barba-namespace"));
  bind(document);
  if (!window.barba) return;
  barba.init({
    timeout: 4000,
    preventRunning: true,
    requestError: () => true,
    prevent: ({ href }) => !href || href.startsWith("#") || /\.(pdf|zip)$/.test(href),
    transitions: [zoomIn, zoomOut, slideIn, slideOut, base],
  });
  barba.hooks.before(() => {
    busy(true);
    cursorOff();
    body.style.setProperty("--scroll-y", `-${window.scrollY}px`);
  });
  barba.hooks.enter(({ next }) => {
    setPage(next.namespace);
    bind(next.container, next.namespace === "menu");
    body.classList.remove("is-scrolled-bit", "is-scrolling-down", "is-scrolled");
  });
  barba.hooks.after(({ next }) => {
    busy(false);
    setTransition(null);
    next.container.classList.remove("to-load");
    body.style.removeProperty("--scroll-y");
    bindHeaders(next.container);
    bindHeights(next.container);
    cursorOff();
  });
})();
