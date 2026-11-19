// Desktop OS shell — boot (first visit only), menu bar, clock, window opening, shortcuts and page transitions are shared by all pages.
// The original is an app that switches screens within one document, so boot happens only once — here pages are separate, so we record ”booted” in the session and skip from the second page
(() => {
  const body = document.body, BOOTED = "eddy-booted", WIPED = "eddy-wipe";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const say = (name) => document.dispatchEvent(new CustomEvent(name));

  // Boot — if the session is already on, clear the plate and go straight in
  const boot = document.querySelector(".e-boot");
  const enter = () => { body.classList.remove("is-booting"); sessionStorage.setItem(BOOTED, "1"); say("site:enter"); };
  if (boot && !sessionStorage.getItem(BOOTED)) {
    body.classList.add("is-booting");
    boot.addEventListener("fx:booted", () => { boot.remove(); enter(); }, { once: true });
    boot.querySelector(".e-boot__sound")?.addEventListener("click", (e) => {
      e.stopPropagation();
      const b = e.currentTarget, on = b.getAttribute("aria-pressed") !== "true";
      b.setAttribute("aria-pressed", String(on));
      b.textContent = on ? "[S] Sound: ON" : "[S] Sound : OFF";
    });
  } else {
    boot?.remove();
    // Announced after the part (fx-core) attaches on DOMContentLoaded — parts that wait for site:enter must already be listening
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", enter, { once: true });
    else setTimeout(enter, 0);
  }

  // Clock — weekday·date · hour:minute, every 30 seconds
  const clock = document.querySelector("[data-clock]");
  const tick = () => {
    if (!clock) return;
    const d = new Date();
    clock.textContent = `${d.toLocaleDateString("ko-KR", { weekday: "short", day: "2-digit" })} · ${d.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", hour12: false })}`;
  };
  tick();
  setInterval(tick, 30000);

  // Menu bar — click to open, and once one is open, merely hovering another menu switches the opening over
  const menus = [...document.querySelectorAll(".e-menu")];
  let openMenu = null;
  const shut = () => { if (!openMenu) return; openMenu.classList.remove("is-open"); openMenu.querySelector(".e-mbtn").setAttribute("aria-expanded", "false"); openMenu = null; };
  const show = (m) => { if (openMenu === m) return; shut(); m.classList.add("is-open"); m.querySelector(".e-mbtn").setAttribute("aria-expanded", "true"); openMenu = m; };
  menus.forEach((m) => {
    const btn = m.querySelector(".e-mbtn");
    btn.addEventListener("click", (e) => { e.stopPropagation(); openMenu === m ? shut() : show(m); });
    btn.addEventListener("pointerenter", () => { if (openMenu && openMenu !== m) show(m); });
  });
  document.addEventListener("click", (e) => { if (openMenu && !e.target.closest(".e-menu")) shut(); });

  // Page transition. A light line steps down from top to bottom in 8 steps (30fps) covering with a curtain, and after navigating, the same line steps down again on the arrived page to clear it (same count as the boot screen’s light line)
  const wipe = document.createElement("div");
  wipe.className = "e-wipe";
  wipe.innerHTML = '<i class="e-wipe__beam"></i>';
  body.append(wipe);
  const beam = wipe.firstElementChild;
  const run = (cover, done) => {
    if (reduce) { wipe.style.clipPath = cover ? "inset(0 0 0 0)" : "inset(0 0 100% 0)"; done?.(); return; }
    let n = 0;
    beam.style.opacity = "1";
    const step = () => {
      n++;
      const p = n / 8;
      beam.style.top = `${p * 100}%`;
      wipe.style.clipPath = cover ? `inset(0 0 ${(1 - p) * 100}% 0)` : `inset(${p * 100}% 0 0 0)`;
      if (n < 8) setTimeout(step, 1000 / 30);
      else { beam.style.opacity = "0"; done?.(); }
    };
    step();
  };
  const go = (href) => {
    if (!href) return;
    sessionStorage.setItem(WIPED, "1");
    wipe.classList.add("is-cover");
    run(true, () => (location.href = href));
  };
  if (sessionStorage.getItem(WIPED)) {
    sessionStorage.removeItem(WIPED);
    wipe.style.clipPath = "inset(0 0 0 0)";
    document.addEventListener("site:enter", () => requestAnimationFrame(() => run(false)), { once: true });
  }
  addEventListener("pageshow", (e) => { if (e.persisted) { wipe.classList.remove("is-cover"); wipe.style.clipPath = ""; } });
  window.eddyGo = go;
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || a.target === "_blank") return;
    const href = a.getAttribute("href");
    if (!/^[\w-]+\.html(#.*)?$/.test(href)) return;
    e.preventDefault();
    shut();
    go(href);
  });

  // Menu items — data-go goes to another screen, data-open opens a window on this page (if there is none, it goes to the first page and opens it)
  const openWin = (name) => {
    if (window.eddyPageOpen?.(name)) return;
    const w = document.querySelector(`[data-win="${name}"]`);
    if (!w) { go(`index.html#${name}`); return; }
    w.dispatchEvent(new Event("fx:open"));
    say("site:window");
  };
  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-go],[data-open]");
    if (!t) return;
    e.preventDefault();
    shut();
    if (t.dataset.go) go(t.dataset.go); else openWin(t.dataset.open);
  });

  // Shortcuts — 1 to 4 are file menu items, Esc goes from open menu → open window (desk-window) → one screen up
  const keys = { 1: "works.html", 2: "index.html#parcours", 3: "index.html#profil", 4: "contact" };
  document.addEventListener("keydown", (e) => {
    if (body.classList.contains("is-booting") || e.metaKey || e.ctrlKey || e.altKey || e.target.closest("input,textarea,select")) return;
    if (e.key === "Escape") {
      if (openMenu) { shut(); return; }
      if (document.querySelector(".e-win.fx-open")) return;
      const up = body.dataset.up;
      if (up === "home") say("site:home"); else if (up) go(up);
      return;
    }
    const k = keys[e.key];
    if (!k) return;
    if (k === "contact") openWin("contact");
    else if (k.startsWith("index.html#") && document.querySelector(`[data-view="${k.slice(11)}"]`)) location.hash = k.slice(11);
    else go(k);
  });
})();
