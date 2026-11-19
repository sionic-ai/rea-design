(() => {
  // A rounded box hole in the center of a solid curtain — at size e (screen ratio, 0 closed ~ 1 twice the screen) the hole’s half-width is e·W, half-height e·H, and the corner radius is e·W/2 on landscape screens and e·W on portrait.
  // Open 0→1 .5s expo.in, when passing 1→mid .65s expo.inOut → 0 .4s expo.in, then waits and goes. The chosen color is handed to the next page’s curtain.
  const KEY = "fx-roundbox-curtain-nav";
  const resolve = (el, expr) => {
    const s = document.createElement("i");
    s.style.cssText = `display:none;color:${expr}`;
    el.append(s);
    const c = getComputedStyle(s).color;
    s.remove();
    return c;
  };

  kfFx.register("roundbox-curtain-nav", (el, { options, reduce }) => {
    const num = (k, d) => { const v = parseFloat(options[k]); return Number.isFinite(v) ? v : d; };
    const openDur = num("open", 0.5), shrink = num("shrink", 0.65), closeDur = num("close", 0.4), hold = num("hold", 0.25), mid = num("mid", 0.475);
    const names = (options.colors || "--kf-accent,--kf-accent-soft,--kf-ink").split(",").map((s) => s.trim()).filter(Boolean);
    const cv = document.createElement("canvas");
    cv.className = "fx-roundbox-curtain-nav__veil";
    cv.setAttribute("aria-hidden", "true");
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    document.body.append(cv);
    const dpr = Math.min(devicePixelRatio || 1, 2);
    let color = resolve(el, "var(--kf-ink)"), e = 1, tween = null, timer = 0;
    try {
      const passed = sessionStorage.getItem(KEY);
      if (passed) { color = passed; sessionStorage.removeItem(KEY); }
    } catch (err) { /* If storage is unavailable, opens on the text-color overlay */ }

    const draw = () => {
      const W = innerWidth, H = innerHeight;
      if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      if (e >= 1) { cv.style.visibility = "hidden"; return; }
      cv.style.visibility = "visible";
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, W, H);
      if (e <= 0) return;
      const hw = e * W, hh = e * H, r = Math.min(H / W < 1 ? hw * 0.5 : hw, hw, hh);
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.roundRect(W / 2 - hw, H / 2 - hh, hw * 2, hh * 2, r);
      ctx.fill();
    };
    const to = (v, dur, ease) => new Promise((done) => {
      tween?.kill();
      if (dur <= 0 || !window.gsap) { e = v; draw(); done(); return; }
      const s = { e };
      tween = gsap.to(s, { e: v, duration: dur, ease, onUpdate: () => { e = s.e; draw(); }, onComplete: done });
    });

    const announce = () => el.dispatchEvent(new CustomEvent("fx:curtain-open", { bubbles: true }));
    if (reduce || openDur <= 0) { e = 1; draw(); announce(); }
    else { e = 0; draw(); to(1, openDur, "expo.in").then(announce); }

    const onClick = (ev) => {
      const a = ev.target.closest?.("a[href]");
      if (!a || !el.contains(a) || ev.defaultPrevented || ev.button || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
      if (a.target && a.target !== "_self") return;
      if (a.closest('[data-fx-part="plain"]')) return;
      const href = a.getAttribute("href") || "";
      if (href.startsWith("#") || /^(mailto:|tel:|javascript:)/i.test(href)) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname && url.search === location.search && url.hash) return;
      ev.preventDefault();
      if (reduce) { location.href = url.href; return; }
      color = resolve(el, `var(${names[Math.floor(Math.random() * names.length)]})`);
      try { sessionStorage.setItem(KEY, color); } catch (err) { /* The next page opens from a text-color curtain */ }
      el.classList.add("fx-roundbox-curtain-nav--busy");
      e = 1;
      to(mid, shrink, "expo.inOut").then(() => to(0, closeDur, "expo.in")).then(() => { timer = setTimeout(() => { location.href = url.href; }, hold * 1000); });
    };
    const onShow = (ev) => { if (ev.persisted) { tween?.kill(); e = 1; draw(); el.classList.remove("fx-roundbox-curtain-nav--busy"); } };
    const onResize = () => draw();
    document.addEventListener("click", onClick);
    addEventListener("pageshow", onShow);
    addEventListener("resize", onResize);
    return () => {
      tween?.kill();
      clearTimeout(timer);
      document.removeEventListener("click", onClick);
      removeEventListener("pageshow", onShow);
      removeEventListener("resize", onResize);
      el.classList.remove("fx-roundbox-curtain-nav--busy");
      cv.remove();
    };
  });
})();
