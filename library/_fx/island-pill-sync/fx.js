// Bottom island pill — rises from below once the document is scrolled a little, pressing it opens the panel, and while scrolling inside it, the item that passes the screen center
// The pill changes by title, icon and width (the See work button on the reference site). The original framer-motion spring (length + bounce) is solved with the same formula and used as a GSAP curve
(() => {
  const springEase = (d, bounce) => {
    const z = Math.min(1, Math.max(0.05, 1 - bounce));
    const env = (w) => (z < 1 ? 0.001 - (z / Math.sqrt(1 - z * z)) * Math.exp(-w * z * d) : -0.001 + Math.exp(-w * d) * (w * d + 1));
    let lo = 0.1, hi = 400;
    for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; if (env(m) < 0) lo = m; else hi = m; }
    const w = (lo + hi) / 2;
    if (z >= 1) return (p) => (p >= 1 ? 1 : 1 - Math.exp(-w * p * d) * (1 + w * p * d));
    const wd = w * Math.sqrt(1 - z * z);
    return (p) => (p >= 1 ? 1 : 1 - Math.exp(-z * w * p * d) * (Math.cos(wd * p * d) + ((z * w) / wd) * Math.sin(wd * p * d)));
  };

  kfFx.register("island-pill-sync", (el, { options, reduce }) => {
    const pill = el.querySelector('[data-fx-part="pill"]');
    const titles = el.querySelector('[data-fx-part="title"]');
    if (!window.gsap || !pill || !titles) return;
    const icon = el.querySelector('[data-fx-part="icon"]');
    const toggle = el.querySelector('[data-fx-part="toggle"]');
    const panel = options.panel ? document.querySelector(options.panel) : null;
    const at = +(options.at ?? 0.17);
    const rise = { d: +(options.rise ?? 0.4), b: +(options.bounce ?? 0.2) };
    const size = { d: +(options.size ?? 0.5), b: +(options["size-bounce"] ?? 0.3) };
    const swap = +(options.swap ?? 0.15), lag = +(options.lag ?? 0.1);
    const up = +(options.up ?? 40), down = +(options.down ?? -40);
    const idle = { title: titles.textContent.trim(), width: +(options.width ?? pill.offsetWidth) || 148, icon: icon ? icon.innerHTML : "" };
    const riseEase = springEase(rise.d, rise.b), sizeEase = springEase(size.d, size.b);
    let open = false, shown = null, cur = -1, timer = 0, tops = [];
    const tweens = [];
    const T = (v) => { tweens.push(v); return v; };

    const setTitle = (text) => {
      const old = titles.querySelector(".fx-island-pill-sync__title:not(.is-fx-out)");
      const enter = () => {
        if (text == null || !el.isConnected) return;
        const p = document.createElement("span");
        p.className = "fx-island-pill-sync__title";
        p.textContent = text;
        titles.append(p);
        if (!reduce && swap) T(gsap.fromTo(p, { opacity: 0, filter: "blur(4px)" }, { opacity: 1, filter: "blur(0px)", duration: swap, ease: "power1.out" }));
      };
      if (!old) { titles.querySelectorAll(".fx-island-pill-sync__title").forEach((n) => n.remove()); return enter(); }
      old.classList.add("is-fx-out");
      if (reduce || !swap) { old.remove(); return enter(); }
      T(gsap.to(old, { opacity: 0, filter: "blur(4px)", duration: swap, ease: "power1.out", onComplete: () => { old.remove(); enter(); } }));
    };
    const setData = (d) => {
      if (icon && d.icon != null) icon.innerHTML = d.icon;
      T(gsap.to(pill, { width: d.width, duration: reduce ? 0 : size.d, ease: sizeEase, overwrite: "auto" }));
      setTitle(null);
      clearTimeout(timer);
      timer = setTimeout(() => setTitle(d.title), reduce ? 0 : lag * 1000);
    };
    const show = (on) => {
      if (on === shown) return;
      shown = on;
      T(gsap.to(el, { bottom: on ? up : down, duration: reduce ? 0 : rise.d, ease: riseEase, overwrite: "auto" }));
    };
    const items = () => (panel ? [...panel.querySelectorAll('[data-fx-part="item"]')] : []);
    const dataOf = (n) => ({ title: n.dataset.title, width: +n.dataset.width || idle.width, icon: n.dataset.icon ? (document.getElementById(n.dataset.icon)?.innerHTML ?? "") : null });
    const measure = () => { if (panel) tops = items().map((n) => n.getBoundingClientRect().top + panel.scrollTop).reverse(); };
    const onPanel = () => {
      const t = tops.findIndex((top) => top < panel.scrollTop + innerHeight / 2);
      const i = tops.length - 1 - t;
      if (t < 0 || i === cur) return;
      cur = i;
      const n = items()[i];
      if (n) { setData(dataOf(n)); el.dispatchEvent(new CustomEvent("fx:item", { bubbles: true, detail: { index: i, item: n } })); }
    };
    const onPage = () => {
      if (open) return;
      const max = document.documentElement.scrollHeight - innerHeight;
      show(max <= 0 || scrollY / max > at);
    };
    const setOpen = (on) => {
      if (!panel || on === open) return;
      open = on;
      el.classList.toggle("is-fx-open", on);
      panel.classList.toggle("is-fx-open", on);
      toggle?.setAttribute("aria-expanded", String(on));
      if (on) {
        show(true);
        panel.scrollTop = 0;
        cur = 0;
        measure();
        const first = items()[0];
        if (first) setData(dataOf(first));
      } else {
        cur = -1;
        setData(idle);
        onPage();
      }
      el.dispatchEvent(new CustomEvent(on ? "fx:open" : "fx:close", { bubbles: true }));
    };
    const onToggle = () => setOpen(!open);
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };

    gsap.set(el, { bottom: down });
    T(gsap.fromTo(pill, { width: +(options.from ?? idle.width + 32) }, { width: idle.width, duration: reduce ? 0 : size.d, ease: sizeEase }));
    const firstTitle = titles.textContent.trim();
    titles.textContent = "";
    setTitle(firstTitle);
    toggle?.addEventListener("click", onToggle);
    addEventListener("keydown", onKey);
    addEventListener("scroll", onPage, { passive: true });
    addEventListener("resize", measure);
    panel?.addEventListener("scroll", onPanel, { passive: true });
    onPage();
    return () => {
      clearTimeout(timer);
      tweens.forEach((t) => t.kill());
      toggle?.removeEventListener("click", onToggle);
      removeEventListener("keydown", onKey);
      removeEventListener("scroll", onPage);
      removeEventListener("resize", measure);
      panel?.removeEventListener("scroll", onPanel);
      gsap.set([el, pill], { clearProps: "bottom,width" });
      titles.textContent = idle.title;
      el.classList.remove("is-fx-open");
    };
  });
})();
