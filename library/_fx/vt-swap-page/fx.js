// Works like a single-page app — clicking a same-site link fetches the next document (prefetched) and swaps only this wrapper for the new one, keeping everything outside it (head scripts, menu, fixed panels).
// Wraps the moment of change in document.startViewTransition and transitions old and new screens with css (::view-transition-*) — the original Next router + View Transition as is.
// CSS in the head and scripts outside the wrapper that exist only in the new document are loaded in order before the swap, and scripts inside the new wrapper are re-run after the swap. Motion parts are re-attached to the new elements by fx-core.
(() => {
  let owner = null;
  const cache = new Map();
  const get = (url) => {
    if (!cache.has(url)) cache.set(url, fetch(url, { credentials: "same-origin" }).then((r) => (r.ok ? r.text() : Promise.reject(r.status))).catch((e) => { cache.delete(url); throw e; }));
    return cache.get(url);
  };
  const wait = (s) => new Promise((r) => setTimeout(r, s * 1000));
  const loadEl = (node) => new Promise((res) => { node.addEventListener("load", res, { once: true }); node.addEventListener("error", res, { once: true }); });
  // Only pages from the same folder (one site set) — outside links like the folder list above go through as normal links
  const dir = () => location.pathname.replace(/[^/]*$/, "");
  const same = (a) => a && a.origin === location.origin && a.pathname.startsWith(dir()) && !a.pathname.slice(dir().length).includes("/") && !a.hasAttribute("download") && (!a.target || a.target === "_self") && !(a.getAttribute("href") || "").startsWith("#");
  const pageOf = (u) => u.split("#")[0];

  kfFx.register("vt-swap-page", (el, { options, reduce }) => {
    // Pages opened as files have fetch blocked — hook nothing so it navigates by normal link
    if (location.protocol === "file:") return;
    if (owner && owner.isConnected && owner !== el) return;
    owner = el;
    const vt = options.vt !== "0" && !reduce && "startViewTransition" in document;
    const lag = reduce ? 0 : +(options.lag ?? 0);
    const ac = new AbortController(), sig = { signal: ac.signal };
    let busy = false;
    const go = async (url, push) => {
      if (busy) return;
      busy = true;
      let html;
      try { [html] = await Promise.all([get(url), wait(lag)]); } catch (e) { location.href = url; return; }
      const doc = new DOMParser().parseFromString(html, "text/html");
      const next = doc.querySelector('[data-fx~="vt-swap-page"]');
      if (!next) { location.href = url; return; }
      const abs = (n, k) => new URL(n.getAttribute(k), url).href;
      const haveCss = new Set([...document.querySelectorAll('link[rel="stylesheet"]')].map((l) => l.href));
      await Promise.all([...doc.querySelectorAll('head link[rel="stylesheet"]')].filter((l) => !haveCss.has(abs(l, "href"))).map((l) => {
        const n = document.createElement("link"); n.rel = "stylesheet"; n.href = abs(l, "href"); document.head.append(n); return loadEl(n);
      }));
      const haveJs = new Set([...document.querySelectorAll("script[src]")].map((s) => s.src));
      for (const s of doc.querySelectorAll("script[src]")) {
        if (next.contains(s) || haveJs.has(abs(s, "src"))) continue;
        const n = document.createElement("script"); n.src = abs(s, "src"); n.async = false; document.body.append(n); await loadEl(n);
      }
      const fresh = document.importNode(next, true);
      // Announced just before switching so the leaving page’s script can withdraw the motion it set up
      document.dispatchEvent(new CustomEvent("fx:page-leave", { detail: { url } }));
      const update = () => {
        document.title = doc.title;
        for (const { name, value } of [...doc.body.attributes]) document.body.setAttribute(name, value);
        for (const { name } of [...document.body.attributes]) if (!doc.body.hasAttribute(name)) document.body.removeAttribute(name);
        if (push) history.pushState({ fxSwap: 1 }, "", url);
        document.documentElement.classList.add("is-fx-arrived");
        el.replaceWith(fresh);
        scrollTo(0, 0);
      };
      if (vt) { try { await document.startViewTransition(update).updateCallbackDone; } catch (e) { if (el.isConnected) update(); } } else update();
      // Scripts inside the new wrapper come in via innerHTML and don’t run, so recreate and run them (in order)
      for (const s of [...fresh.querySelectorAll("script")]) {
        const n = document.createElement("script");
        for (const { name, value } of [...s.attributes]) n.setAttribute(name, value);
        if (!s.src) n.textContent = s.textContent;
        s.replaceWith(n);
        if (n.src) await loadEl(n);
      }
      document.dispatchEvent(new CustomEvent("fx:page-enter", { detail: { url } }));
      busy = false;
    };
    // Prefetch — right after attaching, in an idle moment, fetch this page’s same-site links (original next/link prefetch)
    const warm = () => document.querySelectorAll("a[href]").forEach((a) => { if (same(a) && pageOf(a.href) !== pageOf(location.href)) get(pageOf(a.href)).catch(() => {}); });
    const idle = window.requestIdleCallback ? requestIdleCallback(warm, { timeout: 1500 }) : setTimeout(warm, 300);
    document.addEventListener("click", (e) => {
      const a = e.target.closest?.("a[href]");
      if (!same(a) || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || el !== owner) return;
      e.preventDefault();
      if (pageOf(a.href) === pageOf(location.href)) return;
      go(pageOf(a.href), true);
    }, sig);
    addEventListener("popstate", () => { if (el === owner) go(pageOf(location.href), false); }, sig);
    return () => {
      ac.abort();
      if (window.cancelIdleCallback && typeof idle === "number") cancelIdleCallback(idle); else clearTimeout(idle);
      if (owner === el) owner = null;
    };
  });
})();
