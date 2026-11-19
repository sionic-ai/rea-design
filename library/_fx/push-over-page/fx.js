(() => {
  // Original (a portfolio site, Next.js route transition): clicking a same-site link does not reload the document but fetches only the next page body,
  // The new body slides in from off-screen right (100%) over 1.2s cubic-bezier(.74,0,.07,1) and covers the old one (the inner content comes along from −24% and trails slightly behind, a parallax lag),
  // The old body is pushed halfway by −50% from where it was being viewed, fading to .2 so the dark stage behind (--kf-contrast-bg) shows through. Header and menu sit outside the wrapper and stay put.
  let owner = null;
  kfFx.register("push-over-page", (el, { options, reduce }) => {
    const first = el.querySelector('[data-fx-part="page"]');
    if (!first || owner) return;
    owner = el;
    const dur = reduce ? 0 : +(options.dur ?? 1.2);
    const ease = kfFx.ease(options.ease || "0.74,0,0.07,1", "expo.inOut");
    const shift = +(options.shift ?? -50), dim = +(options.dim ?? 0.2), lag = +(options.lag ?? -24);
    let current = first, busy = false;
    const emit = (type, page) => document.dispatchEvent(new CustomEvent(`fx:page-${type}`, { detail: { container: page, namespace: page?.dataset.page || "" } }));
    const sheets = async (doc) => {
      const have = new Set([...document.querySelectorAll('link[rel="stylesheet"]')].map((l) => l.href));
      await Promise.all([...doc.querySelectorAll('link[rel="stylesheet"]')].map((l) => new URL(l.getAttribute("href"), location.href).href)
        .filter((h) => !have.has(h))
        .map((h) => new Promise((r) => { const l = Object.assign(document.createElement("link"), { rel: "stylesheet", href: h }); l.onload = l.onerror = r; document.head.append(l); })));
    };
    const go = async (href, push) => {
      if (busy) return;
      busy = true;
      let doc;
      try { doc = new DOMParser().parseFromString(await (await fetch(href)).text(), "text/html"); } catch (e) { location.href = href; return; }
      const nextSrc = doc.querySelector('[data-fx~="push-over-page"] [data-fx-part="page"]') || doc.querySelector('[data-fx-part="page"]');
      if (!nextSrc) { location.href = href; return; }
      await sheets(doc);
      if (push) history.pushState({ fxPush: 1 }, "", href);
      document.title = doc.title;
      const old = current, y = scrollY, next = document.importNode(nextSrc, true);
      emit("leave", old);
      Object.assign(el.style, { height: `${innerHeight}px`, overflow: "hidden", position: "relative", background: "var(--kf-contrast-bg)" });
      Object.assign(next.style, { position: "absolute", left: 0, bottom: 0, width: "100%", height: `${innerHeight}px`, overflow: "hidden", zIndex: 2, background: "var(--kf-bg)" });
      el.append(next);
      scrollTo(0, 0);
      current = next;
      emit("enter", next);
      const inner = next.firstElementChild;
      const tl = gsap.timeline({
        onComplete: () => {
          old.remove();
          ["height", "overflow", "position", "background"].forEach((p) => el.style.removeProperty(p));
          next.removeAttribute("style");
          if (inner) gsap.set(inner, { clearProps: "transform" });
          busy = false;
        },
      });
      tl.fromTo(old, { x: 0, y: -y, opacity: 1 }, { xPercent: shift, opacity: dim, duration: dur, ease }, 0)
        .fromTo(next, { xPercent: 100 }, { xPercent: 0, duration: dur, ease }, 0);
      if (inner) tl.fromTo(inner, { xPercent: lag }, { xPercent: 0, duration: dur, ease }, 0);
    };
    const ac = new AbortController();
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target || a.hasAttribute("download")) return;
      const href = a.getAttribute("href");
      if (!href || href.startsWith("#") || a.origin !== location.origin || a.href.split("#")[0] === location.href.split("#")[0]) return;
      // The next body is fetched with fetch, so in a file:// build it usually does a plain navigation
      if (!/^https?:$/.test(location.protocol)) return;
      e.preventDefault();
      go(a.href, true);
    }, { signal: ac.signal });
    addEventListener("popstate", () => /^https?:$/.test(location.protocol) && go(location.href, false), { signal: ac.signal });
    return () => { ac.abort(); owner = null; };
  });
})();
