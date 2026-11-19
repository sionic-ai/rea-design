// Common to all pages: draws the + button and menu screen, loader state (has--loaded → has--finished after 1s), slow fixed-panel scroll (lerp .03) ·
// Wires up menu open and close (.5s), page transition (covers with a blur curtain in .49s and moves after .7s) and line splitting. The original is hand-written code without libraries.
(() => {
  const root = document.documentElement, body = document.body;
  const page = body.dataset.page || "home";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const GC = (window.GC = { reduce, page, scrollStart: 0 });

  // Head + menu screen
  const cur = (p) => (p === page ? ' aria-current="page"' : "");
  body.insertAdjacentHTML("afterbegin", `
    <header class="gc-head" data-slot="header"><button class="gc-opener" type="button" aria-label="Menu" data-nav-opener><i class="is-open"></i><i class="is-close"></i></button></header>
    <div class="gc-nav" data-slot="nav-screen">
      <div class="gc-nav__in">
        <div class="gc-nav__top">
          <ul class="gc-nav__menu">
            <li style="--i:0"><a href="index.html"${cur("home")}>At a glance</a></li>
            <li style="--i:1"><a href="works.html"${cur("works")}>Split View</a></li>
          </ul>
        </div>
        <div class="gc-nav__bottom">
          <p class="gc-nav__about gc-lines" data-lines>Your greeting here.<br><br>Introduce who you are and where and what you shoot in two or three lines. Follow with a sentence listing the fields you work in.<br><br>Your one line about being together anywhere here.<br><br>Your invitation to see the work here.</p>
          <div class="gc-nav__foot">
            <span class="gc-flip"><a href="#">Get in touch</a></span>
            <span class="is-right"><span class="gc-flip"><a href="#">Channel 1</a></span><span class="gc-flip"><a href="#">Channel 2</a></span></span>
            <div class="gc-copy">© 0000 Name · All rights reserved</div>
          </div>
        </div>
      </div>
    </div>`);

  // Loader — when both 300ms and load have passed, has--loaded, 1s later has--finished (+ html.has--landed). Forced after 5s.
  let loaded = false, minDone = false, landed = false;
  const go = () => {
    if (!loaded || !minDone || landed) return;
    landed = true;
    body.classList.add("has--loaded");
    setTimeout(() => { body.classList.add("has--finished"); root.classList.add("has--landed"); document.dispatchEvent(new Event("gc:finished")); }, 1000);
    document.dispatchEvent(new Event("gc:loaded"));
  };
  setTimeout(() => { minDone = true; go(); }, 300);
  if (document.readyState === "complete") { loaded = true; go(); } else addEventListener("load", () => { loaded = true; go(); });
  setTimeout(() => { loaded = minDone = true; go(); }, 5000);

  // Menu open and close — opening .5s → open, closing .5s → closed
  const opener = document.querySelector("[data-nav-opener]");
  opener.addEventListener("click", () => {
    const L = body.classList;
    if (L.contains("js-nav--isopen")) {
      L.add("js-nav--isclosing");
      setTimeout(() => L.remove("js-nav--isopen", "js-nav--isclosing"), 500);
    } else if (!L.contains("js-nav--isclosing")) {
      L.add("js-nav--isopening");
      setTimeout(() => { L.remove("js-nav--isopening"); L.add("js-nav--isopen"); }, 500);
    }
  });

  // Page transition — a blur curtain covers in .49s and navigation happens .7s later (the original swaps in prefetched page content, here it really navigates and the new page lifts the curtain)
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || a.target || e.metaKey || e.ctrlKey) return;
    const href = a.getAttribute("href");
    if (!href || href.startsWith("#") || /^(mailto|tel|https?):/.test(href)) return;
    e.preventDefault();
    if (body.classList.contains("js-nav--isopen")) opener.click();
    root.classList.add("js-transition--start");
    setTimeout(() => { location.href = a.href; }, reduce ? 0 : 700);
  });
  addEventListener("pageshow", (e) => { if (e.persisted) root.classList.remove("js-transition--start"); });

  // Line splitting — measure words and wrap each line in .line > Wrap in .line__inner (.015s stagger per line)
  GC.splitLines = (el) => {
    if (!el.dataset.html) el.dataset.html = el.innerHTML;
    const parts = el.dataset.html.split(/<br\s*\/?>/i);
    const probe = el.cloneNode(false);
    probe.style.cssText = `position:absolute;visibility:hidden;width:${el.offsetWidth}px;`;
    el.parentNode.append(probe);
    const lines = [];
    parts.forEach((txt, pi) => {
      const words = txt.trim().split(/(\s+)/).filter(Boolean);
      if (!words.length) { if (pi < parts.length - 1) lines.push(""); return; }
      probe.innerHTML = words.map((w) => `<span>${w}</span>`).join("");
      let line = "", top = null;
      [...probe.children].forEach((s) => {
        const t = Math.round(s.getBoundingClientRect().top);
        if (top !== null && t > top) { if (line.trim()) lines.push(line.trim()); line = s.textContent; } else line += s.textContent;
        top = t;
      });
      if (line.trim()) lines.push(line.trim());
    });
    probe.remove();
    el.innerHTML = lines.map((l, i) => (l ? `<span class="line"><span class="line__inner" style="--i:${i}">${l}</span></span>` : "<br>")).join("");
  };
  const splitAll = () => document.querySelectorAll("[data-lines]").forEach(GC.splitLines);
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(splitAll);
  let rt;
  addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(splitAll, 250); });

  // Slow pinned panel — at 769px and up the body height is set to the panel height, panel top = −(scroll followed with lerp .03). If js-phat--disable is set, it attaches immediately
  const phat = document.getElementById("phatscroll");
  const lerp = (a, b, t) => (1 - t) * a + t * b;
  const place = () => {
    if (!phat) return;
    if (innerWidth > 768) { body.style.height = phat.offsetHeight + "px"; phat.style.top = -GC.scrollStart + "px"; }
    else { body.style.removeProperty("height"); phat.style.removeProperty("top"); }
  };
  // Right before measuring positions (Flip etc.), snap the plate to the current scroll
  GC.syncPhat = () => { GC.scrollStart = scrollY; place(); };
  const tick = () => {
    const y = scrollY;
    GC.scrollStart = reduce || body.classList.contains("js-phat--disable") ? y : lerp(GC.scrollStart, y, 0.03);
    if (Math.abs(GC.scrollStart - y) < 0.05) GC.scrollStart = y;
    place();
    requestAnimationFrame(tick);
  };
  history.scrollRestoration = "manual";
  requestAnimationFrame(tick);

  // Block wheel and touch scrolling until everything has loaded and while the menu is open (original isUserScrollAllowed)
  const allowed = () => body.classList.contains("has--finished") && !root.classList.contains("js-transition--start") && !body.classList.contains("js-nav--isopen") && !body.classList.contains("js-nav--isopening");
  const block = (e) => { if (!allowed() && !e.target.closest(".gc-nav")) e.preventDefault(); };
  addEventListener("wheel", block, { passive: false });
  addEventListener("touchmove", block, { passive: false });
})();
