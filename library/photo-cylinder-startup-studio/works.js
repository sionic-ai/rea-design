// Work list: filter pill (the list panel fades out in .14s while rising 6px → height moves to the new height in .35s power3.out → visible tiles come up from 10px below in a .03s sequence),
// Hovering a tile switches on the next photo overlaid every .9s and the dot moves along, Surprise me rolls through names at 60·80·110·150·200ms intervals, then goes to the chosen case
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const tabs = document.querySelector(".bk-tabs");
  const box = document.querySelector("[data-tabs-box]");
  const items = [...(box?.querySelectorAll(".bk-it") || [])];
  if (tabs && box) {
    const btns = [...tabs.querySelectorAll(".bk-tb")];
    const live = tabs.querySelector(".bk-tlive");
    let cur = null, tl = null, told = false;
    const apply = (k) => {
      items.forEach((it) => (it.hidden = k !== "all" && !it.dataset.f.split(" ").includes(k)));
      if (live && told) live.textContent = `${btns.find((b) => b.dataset.t === k)?.querySelector("span")?.textContent ?? ""}: ${items.filter((i) => !i.hidden).length} shown`;
    };
    const pick = (k, animate = true) => {
      if (!btns.some((b) => b.dataset.t === k)) k = "all";
      btns.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.t === k)));
      if (k === cur) return;
      cur = k;
      if (!animate || reduce) return apply(k);
      tl?.kill();
      const h0 = box.offsetHeight;
      tl = gsap.timeline({ defaults: { overwrite: "auto" } })
        .to(box, { opacity: 0, y: 6, duration: 0.14, ease: "power1.in" })
        .add(() => {
          apply(k);
          const h1 = box.offsetHeight;
          gsap.fromTo(box, { height: h0, overflow: "hidden" }, { height: h1, duration: 0.35, ease: "power3.out", clearProps: "height,overflow" });
          const shown = items.filter((i) => !i.hidden && i.getBoundingClientRect().top < innerHeight);
          if (shown.length) gsap.fromTo(shown, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.35, ease: "power3.out", stagger: 0.03, clearProps: "opacity,transform" });
        })
        .to(box, { opacity: 1, y: 0, duration: 0.01, clearProps: "opacity,transform" });
    };
    btns.forEach((b) => b.addEventListener("click", (e) => {
      e.preventDefault();
      told = true;
      const k = b.dataset.t;
      history.replaceState(null, "", k === "all" ? location.pathname : `#${k}`);
      b.scrollIntoView({ block: "nearest", inline: "center", behavior: reduce ? "auto" : "smooth" });
      if (box.getBoundingClientRect().top < tabs.offsetHeight) tabs.scrollIntoView({ block: "start", behavior: "auto" });
      pick(k);
    }));
    pick(location.hash.slice(1) || "all", false);
  }

  // On hover, flip through photos
  document.querySelectorAll(".bk-tframe[data-more]").forEach((frame) => {
    const more = +frame.dataset.more || 0, dots = [...frame.querySelectorAll(".bk-dots i")], label = frame.querySelector(".wf-img")?.dataset.label || "";
    let timer = 0, at = 0, top = null;
    const mark = (i) => dots.forEach((d, j) => d.classList.toggle("on", j === i));
    const next = () => {
      at = (at + 1) % (more + 1);
      mark(at);
      if (at === 0) { top?.classList.remove("on"); return; }
      const ph = document.createElement("span");
      ph.className = "wf-img bk-tnext";
      ph.dataset.label = `${label.split(" · ")[0]} · Other Scene ${at}`;
      frame.append(ph);
      requestAnimationFrame(() => ph.classList.add("on"));
      if (top) { const old = top; setTimeout(() => old.remove(), 400); }
      top = ph;
    };
    const on = () => { if (timer || reduce) return; mark(0); timer = setInterval(next, 900); next(); };
    const off = () => {
      clearInterval(timer); timer = 0; at = 0; mark(0);
      if (top) { const old = top; old.classList.remove("on"); setTimeout(() => old.remove(), 400); top = null; }
    };
    const tile = frame.closest(".bk-tile");
    tile.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") on(); });
    tile.addEventListener("pointerleave", off);
    tile.addEventListener("focus", on);
    tile.addEventListener("blur", off);
    mark(0);
  });

  // Surprise me
  const sp = document.querySelector("[data-surprise]");
  if (sp) {
    let list = [];
    try { list = JSON.parse(sp.dataset.surprise || "[]"); } catch {}
    const lbl = sp.querySelector(".bk-lbl");
    let busy = false;
    sp.addEventListener("click", (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || !list.length) return;
      e.preventDefault();
      if (busy) return;
      const pickOne = list[Math.floor(Math.random() * list.length)];
      if (reduce) { location.href = `${pickOne[0]}.html`; return; }
      busy = true;
      let at = 0;
      [60, 80, 110, 150, 200].forEach((d, i) => { at += d; setTimeout(() => (lbl.textContent = list[(Math.floor(Math.random() * list.length) + i) % list.length][1]), at); });
      setTimeout(() => { lbl.textContent = pickOne[1]; sp.setAttribute("aria-label", `Opening ${pickOne[1]}`); }, at + 240);
      setTimeout(() => (location.href = `${pickOne[0]}.html`), at + 700);
    });
    addEventListener("pageshow", () => { busy = false; lbl.textContent = "Surprise me"; sp.removeAttribute("aria-label"); });
  }
})();
