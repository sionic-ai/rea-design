// All pages — phone hamburger menu, adding is-on to pieces past screen center, toggling per-page motion, and the original’s own pjax transition:
// Fetch the next page, swap only main, and overlap old main 1→0 · new main 0→1 over .5s with no curve (original fadeOut/fadeIn 500ms).
(() => {
  const pages = (window.vnPages = window.vnPages || {});
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  let cleanup = null;

  // Phone menu — as in the original, the off state also gets a class so closing plays the transition in reverse
  const burger = document.querySelector(".vn-burger");
  const menu = document.querySelector(".vn-menu");
  const setMenu = (open) => {
    if (!burger || !menu) return;
    burger.classList.toggle("is-on", open);
    burger.classList.toggle("is-off", !open);
    menu.classList.toggle("is-on", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Close Menu" : "Open Menu");
  };
  setMenu(false);
  burger?.addEventListener("click", () => setMenu(!burger.classList.contains("is-on")));
  addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

  // Original scrollin — turn on when the top edge passes half of the screen device height (.5 × screen.height, not the window height), and turn off when it goes back below that
  let ins = [];
  const scan = () => { ins = [...document.querySelectorAll(".vn-main:not(.is-leaving) [data-in]")]; check(); };
  const check = () => {
    const line = screen.height * 0.5;
    for (const el of ins) el.classList.toggle("is-on", el.getBoundingClientRect().top <= line);
  };
  let raf = 0;
  addEventListener("scroll", () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; check(); }); }, { passive: true });
  addEventListener("resize", check);
  window.vnScan = scan;

  const run = () => {
    cleanup?.();
    cleanup = null;
    const main = document.querySelector(".vn-main:not(.is-leaving)");
    const fn = pages[document.body.dataset.page];
    if (main && fn) cleanup = fn(main) || null;
    scan();
    window.ScrollTrigger?.refresh();
  };
  // The original sets up the page device (MyBrowse) after window load — card entrances also start only after all images have arrived
  if (document.readyState === "complete") run();
  else addEventListener("load", run, { once: true });

  // pjax
  const here = (url) => url.origin === location.origin && url.pathname.split("/").slice(0, -1).join("/") === location.pathname.split("/").slice(0, -1).join("/");
  const load = (tag, attr, url) => new Promise((res) => {
    const n = document.createElement(tag);
    if (tag === "link") n.rel = "stylesheet";
    n[attr] = url;
    n.onload = n.onerror = () => res();
    (tag === "link" ? document.head : document.body).append(n);
  });
  const have = (sel, attr, url) => [...document.querySelectorAll(sel)].some((n) => n[attr] === url);
  let busy = false;
  const go = async (url, push) => {
    if (busy) return;
    busy = true;
    setMenu(false);
    try {
      const res = await fetch(url.href);
      if (!res.ok) throw new Error(String(res.status));
      const doc = new DOMParser().parseFromString(await res.text(), "text/html");
      const base = new URL(url.href);
      const nextMain = doc.querySelector(".vn-main");
      if (!nextMain) throw new Error("No main");
      for (const l of doc.querySelectorAll('link[rel="stylesheet"]')) {
        const href = new URL(l.getAttribute("href"), base).href;
        if (!have('link[rel="stylesheet"]', "href", href)) await load("link", "href", href);
      }
      for (const s of doc.querySelectorAll("script[src]")) {
        const src = new URL(s.getAttribute("src"), base).href;
        if (!have("script[src]", "src", src)) await load("script", "src", src);
      }
      const oldMain = document.querySelector(".vn-main:not(.is-leaving)");
      const fresh = document.importNode(nextMain, true);
      cleanup?.();
      cleanup = null;
      document.title = doc.title;
      document.body.className = doc.body.className;
      document.body.dataset.page = doc.body.dataset.page || "";
      if (push) history.pushState({ vn: 1 }, "", url.href);
      oldMain.classList.add("is-leaving");
      oldMain.removeAttribute("id");
      // A page arrived at via transition stands in its end state with no entrance animation — the original also switches in one go on the frame the transition ends (cards float up only on first load)
      fresh.classList.add("is-arriving");
      oldMain.after(fresh);
      scrollTo(0, 0);
      run();
      if (reduce.matches) { oldMain.remove(); fresh.classList.remove("is-arriving"); return; }
      gsap.fromTo(oldMain, { opacity: 1 }, { opacity: 0, duration: 0.5, ease: "none", onComplete: () => oldMain.remove() });
      gsap.fromTo(fresh, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: "none", clearProps: "opacity", onComplete: () => fresh.classList.remove("is-arriving") });
    } catch {
      location.href = url.href;
    } finally {
      busy = false;
    }
  };
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target) return;
    const href = a.getAttribute("href");
    if (!href || href.startsWith("#")) return;
    const url = new URL(a.href);
    if (!here(url) || !/\.html$/.test(url.pathname)) return;
    e.preventDefault();
    if (url.hash && url.pathname === location.pathname) return;
    go(url, true);
  });
  addEventListener("popstate", () => go(new URL(location.href), false));
})();
