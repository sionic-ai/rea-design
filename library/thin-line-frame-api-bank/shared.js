// Common to all four pages — the header-row expand panel is handled by the slide-popover-nav part, so here only the scroll indicator, closing the phone drawer and marking the current page are done.
(() => {
  const nav = document.querySelector("[data-navigation]");
  if (nav) {
    const mark = () => { if (scrollY > 50) nav.dataset.scrolled = "true"; else delete nav.dataset.scrolled; };
    mark();
    addEventListener("scroll", mark, { passive: true });
  }

  // Like the original, pressing outside the drawer or a link inside it closes it
  const close = (d) => { d.removeAttribute("open"); d.querySelectorAll("details").forEach((x) => x.removeAttribute("open")); };
  document.addEventListener("click", (e) => {
    const d = document.querySelector("[data-mobile-drawer]");
    if (!d || !d.open) return;
    const t = e.target instanceof Element ? e.target : null;
    if (t && d.contains(t)) {
      if (t.closest("[data-mobile-drawer-backdrop]")) close(d);
      else if (t.closest("a[href]")) close(d);
    } else {
      e.preventDefault();
      e.stopPropagation();
      close(d);
    }
  }, { capture: true });

  const mark = () => {
    const here = location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".i-nav a[href], .i-foot a[href]").forEach((a) => {
      if (a.getAttribute("href") === here) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
  };
  mark();

  // Original is Astro ClientRouter — clicking an internal link fetches the next document, keeps the header row (persist) as is and swaps in the rest.
  // View transition animation is turned off with none by the original css so it switches instantly, and only the newly entering white wipe curtain runs again. When opened as a file (file:) it can’t be received, so it’s skipped.
  if (location.protocol === "file:" || !window.fetch || !window.DOMParser) return;
  const loaded = () => new Set([...document.scripts].map((s) => s.src).filter(Boolean));
  const swap = async (url, push) => {
    let html;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(res.status);
      html = await res.text();
    } catch {
      location.href = url;
      return;
    }
    const doc = new DOMParser().parseFromString(html, "text/html");
    const abs = (n, a) => new URL(n.getAttribute(a), url).href;
    const want = [...doc.querySelectorAll('link[rel="stylesheet"]')].map((l) => abs(l, "href"));
    const have = [...document.querySelectorAll('link[rel="stylesheet"]')];
    await Promise.all(want.filter((h) => !have.some((l) => l.href === h)).map((h) => new Promise((done) => {
      const l = document.createElement("link");
      l.rel = "stylesheet";
      l.href = h;
      l.onload = l.onerror = done;
      document.head.append(l);
    })));
    have.forEach((l) => { if (!want.includes(l.href)) l.remove(); });
    document.title = doc.title;
    const keep = (n) => n.matches?.("[data-navigation], .wf-ui, script");
    [...document.body.children].forEach((n) => { if (!keep(n)) n.remove(); });
    const anchor = document.body.querySelector("script");
    [...doc.body.children].forEach((n) => { if (!keep(n)) document.body.insertBefore(document.importNode(n, true), anchor); });
    if (push) history.pushState({ swap: true }, "", url);
    scrollTo(0, 0);
    mark();
    // Loads only scripts seen for the first time (parts·page scripts) in order — page scripts run fresh on every page
    const have2 = loaded();
    for (const s of doc.querySelectorAll("script[src]")) {
      const src = abs(s, "src");
      const page = /\/library\/[^/]+\/(?!shared)[^/]+\.js$/.test(src);
      if (have2.has(src) && !page) continue;
      [...document.scripts].filter((x) => x.src === src && page).forEach((x) => x.remove());
      await new Promise((done) => {
        const n = document.createElement("script");
        n.src = src;
        n.onload = n.onerror = done;
        document.body.append(n);
      });
    }
  };
  document.addEventListener("click", (e) => {
    const a = e.target instanceof Element ? e.target.closest("a[href]") : null;
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || !/\.html$/.test(url.pathname) || (url.pathname === location.pathname && url.hash)) return;
    e.preventDefault();
    swap(url.href, true);
  });
  addEventListener("popstate", () => swap(location.href, false));
})();
