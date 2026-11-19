(() => {
  const html = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const stage = document.querySelector(".tg-stage");
  const loader = document.querySelector(".tg-loader");
  const seen = sessionStorage.getItem("tg-seen") === "1";

  // The loader runs once per window (session) — subsequent pages come in with only the polaroids dropping
  if (loader && seen) loader.remove();
  const firstVisit = !!(loader && loader.isConnected);
  if (stage) {
    const key = "data-fx-polaroid-desk-gl", opts = stage.getAttribute(key) || "";
    stage.setAttribute(key, `${opts}${opts ? "; " : ""}intro: ${firstVisit ? "wait" : "short"}`);
  }
  const reveal = (delay) => setTimeout(() => html.classList.add("tg-in"), delay * 1000);
  // Original opening order: the camera settles down (2.1s) and the polaroid drops, then the HUD is revealed at .08s with each line .36s later
  // (Matched to the original first-screen loader timing of 7.1s)
  // On first entering a subpage, the original has a short loader (flash about 1.7s) and the scene stands immediately without camera zoom, then
  // Text, screen strip and work name are revealed much later (5.4s) — matches the original subpage timing (8.3~8.9s, with one more big change at the end)
  // The lab is different — in the original timing it ends right after the flash (around 2.3s). The loader fills .45s later and the text is revealed together with the flash
  const page = document.body.dataset.page, home = page === "home", late = page !== "home" && page !== "lab";
  if (firstVisit && !home) {
    const key = "data-fx-bracket-odometer-loader";
    loader.setAttribute(key, `${loader.getAttribute(key) || ""}; auto: false`);
    const send = (v) => loader.dispatchEvent(new CustomEvent("fx:progress", { detail: v }));
    document.addEventListener("DOMContentLoaded", () => setTimeout(() => send(1), late ? 0 : 450), { once: true });
  }
  if (firstVisit) {
    loader.addEventListener("fx:done", () => {
      sessionStorage.setItem("tg-seen", "1");
      if (home) stage?.dispatchEvent(new CustomEvent("fx:intro", { detail: { full: true } }));
      else {
        stage?.dispatchEvent(new CustomEvent("fx:intro", { detail: { instant: true, hold: late } }));
        if (late) setTimeout(() => stage?.dispatchEvent(new CustomEvent("fx:reveal")), reduce ? 0 : 5400);
      }
      reveal(reduce ? 0 : home ? 2.9 : late ? 5.4 : 0.05);
    }, { once: true });
  } else reveal(0.05);

  // Page transition — the floor letters clear, a polaroid floats up and drops away, then the page changes
  let leaving = false;
  const leave = (href) => {
    if (leaving) return;
    leaving = true;
    html.classList.remove("tg-in");
    html.classList.add("tg-out");
    if (reduce || !stage?.kfDesk) { location.href = href; return; }
    let gone = false;
    const go = () => { if (!gone) { gone = true; location.href = href; } };
    stage.addEventListener("fx:left", () => setTimeout(go, 60), { once: true });
    stage.dispatchEvent(new CustomEvent("fx:leave"));
    setTimeout(go, 1600);
  };
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank") return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || !/\.html$/.test(url.pathname) || url.href === location.href) return;
    e.preventDefault();
    leave(url.href);
  });
  stage?.addEventListener("fx:open", (e) => {
    if (!e.detail?.href) return;
    e.preventDefault();
    leave(new URL(e.detail.href, location.href).href);
  });
  addEventListener("pageshow", (e) => { if (e.persisted) { leaving = false; html.classList.remove("tg-out"); html.classList.add("tg-in"); } });

  // X · Esc on subpages goes back to the Hero
  addEventListener("keydown", (e) => {
    const close = document.querySelector(".tg-close");
    if (e.key === "Escape" && close) leave(close.href);
  });

  // City clock — the original counts that city’s local time down to the second
  const clocks = document.querySelectorAll("[data-clock]");
  const pad = (n) => String(n).padStart(2, "0");
  const tick = () => { const d = new Date(); clocks.forEach((c) => { c.textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`; }); };
  if (clocks.length) { tick(); setInterval(tick, 1000); }

  // Sound button — when on, a wave flows once and settles, when off, it flattens in .36s
  const sound = document.querySelector(".tg-sound");
  if (sound) {
    const path = sound.querySelector("path");
    const wave = { a: sound.getAttribute("aria-pressed") === "true" ? 1 : 0.15, t: 0 };
    const draw = () => {
      let d = "";
      for (let i = 0; i <= 24; i++) {
        const x = (i / 24) * 36 + 1, env = Math.sin((i / 24) * Math.PI);
        const y = 9 + Math.sin((i / 24) * Math.PI * 3 + wave.t) * 5.2 * env * wave.a;
        d += `${i ? "L" : "M"}${x.toFixed(2)},${y.toFixed(2)}`;
      }
      path.setAttribute("d", d);
    };
    draw();
    sound.addEventListener("click", () => {
      const on = sound.getAttribute("aria-pressed") !== "true";
      sound.setAttribute("aria-pressed", String(on));
      if (!window.gsap || reduce) { wave.a = on ? 1 : 0.15; draw(); return; }
      gsap.to(wave, { a: on ? 1 : 0.15, t: wave.t + Math.PI * 2, duration: on ? 0.72 : 0.36, ease: "power2.out", onUpdate: draw, overwrite: true });
    });
  }
})();
