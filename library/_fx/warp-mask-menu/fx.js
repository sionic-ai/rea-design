// Pressing the menu button makes the panel spread from one corner and cover the screen with a brush-edge mask, and the text inside uses SVG turbulence (feTurbulence) displacement
// Wobbles like a heat haze, then settles in 1s. The three burger lines slide out to the right at 0.15s intervals, the X lines come in 0.5s later, and the MENU letters rise one by one
// Disappears and CLOSE rises from below. On closing, the X slips out crossed and the three lines return, and the cell drops 3vh while the panel fades in 0.5s
(() => {
  // Curtain — uses a brush-edge panel with only one corner empty (the original image file is not used). Laid at 200% size, sliding the position from -100% → 100% makes it spread from the opposite corner
  const paintMask = (n = 600) => {
    const c = document.createElement("canvas");
    c.width = c.height = n;
    const g = c.getContext("2d");
    g.fillStyle = "#000"; /* Not skin: the scrim reads only alpha */
    g.fillRect(0, 0, n, n);
    g.globalCompositeOperation = "destination-out";
    g.filter = `blur(${n / 60}px)`;
    g.beginPath();
    g.moveTo(-n * 0.1, -n * 0.1);
    for (let i = 0; i <= 40; i++) {
      const a = (i / 40) * (Math.PI / 2);
      const r = n * (0.24 + 0.035 * Math.sin(a * 9) + 0.02 * Math.sin(a * 23 + 1.3));
      g.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    g.closePath();
    g.fill();
    return c.toDataURL("image/png");
  };
  let maskUrl = "";
  let uid = 0;

  const split = (node) => {
    if (!node) return [];
    if (node.querySelector("[data-char]")) return [...node.querySelectorAll("[data-char]")];
    const text = node.textContent;
    node.textContent = "";
    return [...text].map((ch) => {
      if (/\s/.test(ch)) { node.append(ch); return null; }
      const s = document.createElement("span");
      s.setAttribute("data-char", "");
      s.style.display = "inline-block";
      s.textContent = ch;
      node.append(s);
      return s;
    }).filter(Boolean);
  };

  kfFx.register("warp-mask-menu", (el, { options, reduce }) => {
    const toggle = el.querySelector('[data-fx-part="toggle"]'), panel = el.querySelector('[data-fx-part="panel"]');
    if (!toggle || !panel) return;
    const warp = el.querySelector('[data-fx-part="warp"]');
    const lines = [...el.querySelectorAll('[data-fx-part="line"]')], cross = [...el.querySelectorAll('[data-fx-part="cross"]')];
    const openText = el.querySelector('[data-fx-part="open-label"]'), closeText = el.querySelector('[data-fx-part="close-label"]');
    const openChars = split(openText), closeChars = split(closeText);
    const dur = +(options.dur ?? 1), back = +(options.back ?? 0.2), freq = options.freq || "0.005, 0.05", scale = +(options.scale ?? 50);
    const wide = matchMedia(`(min-width: ${+options.from || 814}px)`);
    const columns = warp ? [...warp.children] : [];

    const id = `fx-warp-${++uid}`;
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("width", "0"); svg.setAttribute("height", "0");
    Object.assign(svg.style, { position: "absolute", width: "0", height: "0", overflow: "hidden", visibility: "hidden" });
    svg.innerHTML = `<filter id="${id}"><feTurbulence type="turbulence" baseFrequency="0 0" numOctaves="1" seed="53" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="0" xChannelSelector="R" yChannelSelector="B"/></filter>`;
    el.append(svg);
    const turb = svg.querySelector("feTurbulence"), disp = svg.querySelector("feDisplacementMap");
    const setFilter = () => warp && (warp.style.filter = wide.matches && !reduce ? `url(#${id})` : "");
    setFilter();
    wide.addEventListener("change", setFilter);

    if (!maskUrl) maskUrl = paintMask();
    const masked = CSS.supports("mask-image", "url(x.png)") || CSS.supports("-webkit-mask-image", "url(x.png)");
    if (masked && !reduce) {
      for (const p of ["maskImage", "webkitMaskImage"]) panel.style[p] = `url(${maskUrl})`;
      for (const [p, v] of [["maskSize", "200% 200%"], ["maskRepeat", "no-repeat"], ["maskPosition", "var(--fx-mask) var(--fx-mask)"]]) {
        panel.style[p] = v;
        panel.style["webkit" + p[0].toUpperCase() + p.slice(1)] = v;
      }
      panel.style.setProperty("--fx-mask", "-100%");
    }
    if (closeChars.length) gsap.set(closeChars, { opacity: 0, yPercent: 30 });
    if (closeText) closeText.style.visibility = "visible";
    const park = () => {
      if (cross[0]) gsap.set(cross[0], { xPercent: -100, yPercent: -100 });
      if (cross[1]) gsap.set(cross[1], { xPercent: 100, yPercent: -100 });
    };
    park();

    let busy = false, tl = null;
    const tell = (open) => el.dispatchEvent(new CustomEvent("fx:menu", { bubbles: true, detail: { open } }));
    const isOpen = () => el.dataset.state === "open";

    const open = () => {
      el.dataset.state = "open";
      toggle.setAttribute("aria-expanded", "true");
      tell(true);
      if (reduce) return;
      busy = true;
      tl = gsap.timeline({ defaults: { duration: dur }, onComplete: () => { if (lines.length) gsap.set(lines, { xPercent: -100 }); busy = false; } })
        .addLabel("start")
        .fromTo(turb, { attr: { baseFrequency: freq } }, { attr: { baseFrequency: "0, 0" } }, "start")
        .fromTo(disp, { attr: { scale } }, { attr: { scale: 0 } }, "start")
        .fromTo(panel, { "--fx-mask": "-100%", opacity: 1 }, { "--fx-mask": "100%" }, "start");
      if (lines.length) tl.to(lines, { xPercent: 100, duration: 0.3, stagger: 0.15 }, "start");
      if (cross.length) tl.to(cross, { xPercent: 0, yPercent: 0, duration: 0.3, stagger: 0.15 }, "start+=0.5");
      if (openChars.length) tl.to(openChars, { opacity: 0, yPercent: -30, duration: 0.2, stagger: 0.1 }, "start");
      if (closeChars.length) tl.fromTo(closeChars, { opacity: 0, yPercent: 30 }, { opacity: 1, yPercent: 0, duration: 0.2, stagger: 0.1 }, "start+=0.3");
    };
    const finishClose = () => {
      delete el.dataset.state;
      toggle.setAttribute("aria-expanded", "false");
      park();
      gsap.set(panel, { opacity: 1 });
      if (columns.length) gsap.set(columns, { y: 0 });
      busy = false;
      tell(false);
    };
    const close = () => {
      if (reduce) return finishClose();
      busy = true;
      tl = gsap.timeline({ defaults: { duration: back }, onComplete: finishClose }).addLabel("start");
      if (cross[0]) tl.to(cross[0], { xPercent: 100, yPercent: 100 }, "start");
      if (cross[1]) tl.to(cross[1], { xPercent: -100, yPercent: 100 }, "start+=0.15");
      if (lines.length) tl.to(lines, { xPercent: 0, stagger: 0.15 }, "start+=0.45");
      if (columns.length) tl.to(columns, { y: () => 0.03 * innerHeight, duration: 0.5, stagger: 0.15 }, "start");
      tl.to(panel, { opacity: 0, duration: 0.5 }, "start+=0.15");
      if (closeChars.length) tl.to(closeChars, { opacity: 0, yPercent: -30, duration: 0.2, stagger: 0.1 }, "start");
      if (openChars.length) tl.fromTo(openChars, { opacity: 0, yPercent: 30 }, { opacity: 1, yPercent: 0, duration: 0.2, stagger: 0.1 }, "start+=0.3");
    };
    const click = () => { if (busy) return; isOpen() ? close() : open(); };
    const key = (e) => { if (e.key === "Escape" && isOpen() && !busy) close(); };
    toggle.setAttribute("aria-expanded", "false");
    toggle.addEventListener("click", click);
    document.addEventListener("keydown", key);

    return () => {
      tl?.kill();
      toggle.removeEventListener("click", click);
      document.removeEventListener("keydown", key);
      wide.removeEventListener("change", setFilter);
      gsap.set([...lines, ...cross, ...openChars, ...closeChars, panel, ...columns], { clearProps: "all" });
      for (const p of ["maskImage", "webkitMaskImage", "maskSize", "webkitMaskSize", "maskRepeat", "webkitMaskRepeat", "maskPosition", "webkitMaskPosition"]) panel.style[p] = "";
      panel.style.removeProperty("--fx-mask");
      if (warp) warp.style.filter = "";
      if (closeText) closeText.style.visibility = "";
      svg.remove();
      if (isOpen()) tell(false);
      delete el.dataset.state;
    };
  });
})();
