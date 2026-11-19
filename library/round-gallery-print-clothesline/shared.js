// Interaction shared by all pages — skin (light · dark) button, help drawer, search field, phone menu panel, newsletter paper card (6 seconds after boot ends),
// And the ”walk” shared with the 3D scene (drag · wheel · arrows move the target cell and it follows by .1, snapping to the nearest cell after .2s of rest).
(() => {
  const root = document.documentElement;
  const SB = (window.SB = window.SB || {});
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  SB.reduce = () => reduce.matches;

  // Resolve skin variables (including color mixes) to real colors and pass them to three.js — painting on a canvas and reading it back yields rgb even for color-mix and oklch
  const probe = document.createElement("canvas");
  probe.width = probe.height = 1;
  const pctx = probe.getContext("2d", { willReadFrequently: true });
  const swatch = document.createElement("i");
  swatch.style.cssText = "position:absolute;width:0;height:0;visibility:hidden";
  SB.rgb = (expr) => {
    if (!swatch.isConnected) document.body.append(swatch);
    swatch.style.color = "";
    swatch.style.color = expr;
    pctx.clearRect(0, 0, 1, 1);
    pctx.fillStyle = getComputedStyle(swatch).color;
    pctx.fillRect(0, 0, 1, 1);
    const [r, g, b] = pctx.getImageData(0, 0, 1, 1).data;
    return [r / 255, g / 255, b / 255];
  };
  SB.css = (expr) => { const [r, g, b] = SB.rgb(expr); return `rgb(${Math.round(r * 255)} ${Math.round(g * 255)} ${Math.round(b * 255)})`; };

  // ── Walk ── the hand shared by the original scenes: moves the target by drag px×perPx · wheel ×.8 · on release last velocity×fling,
  // Position (pos) chases the target each frame by (1−(1−ease)^(dt/16.7)). After release, once snap seconds pass, the target rounds to the nearest slot
  SB.walk = (stage, { perPx = 1 / 240, fling = 7, ease = 0.1, snap = 0.2, onOpen, under } = {}) => {
    const run = { pos: 0, vel: 0 }, st = { target: 0, opening: false };
    let snapTimer = 0, last = performance.now(), raf = 0;
    const tick = (now) => {
      const dt = Math.max(1, now - last);
      last = now;
      const k = st.opening ? Math.min(0.3, 1.8 * ease) : ease;
      const n = 1 - (1 - k) ** Math.min(dt / 16.667, 4);
      const next = run.pos + (st.target - run.pos) * n;
      run.vel = next - run.pos;
      run.pos = next;
      if (st.opening && Math.abs(st.target - run.pos) < 0.04) { st.opening = false; onOpen?.(); }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const snapLater = () => { clearTimeout(snapTimer); snapTimer = setTimeout(() => (st.target = Math.round(st.target)), snap * 1000); };
    const drag = { on: false, x: 0, v: 0, moved: 0, id: -1 };
    const down = (e) => {
      clearTimeout(snapTimer); st.opening = false;
      Object.assign(drag, { on: true, x: e.clientX, v: 0, moved: 0, id: e.pointerId });
      stage.setPointerCapture?.(e.pointerId);
      stage.classList.add("dragging");
    };
    const move = (e) => {
      if (!drag.on) return;
      const dx = e.clientX - drag.x;
      drag.x = e.clientX; drag.v = dx; drag.moved += Math.abs(dx);
      st.target -= dx * perPx;
    };
    const up = (e) => {
      if (!drag.on) return;
      drag.on = false;
      stage.releasePointerCapture?.(drag.id);
      stage.classList.remove("dragging");
      if (drag.moved < 6) {
        const off = under?.((e.clientX / innerWidth) * 2 - 1);
        if (off == null) return;
        if (off === 0) { onOpen?.(); return; }
        st.target = Math.round(st.target) + off;
        st.opening = !!onOpen;
        return;
      }
      st.target -= drag.v * perPx * fling;
      snapLater();
    };
    const wheel = (e) => {
      e.preventDefault();
      st.opening = false;
      const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      st.target += d * perPx * 0.8;
      snapLater();
    };
    const key = (e) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
      if (e.target instanceof Element && e.target.closest("a[href],button,input,select,textarea,[role=dialog]")) return;
      if (e.key === "Enter") { onOpen?.(); return; }
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") { e.preventDefault(); st.opening = false; st.target = Math.round(st.target) + (e.key === "ArrowRight" ? 1 : -1); }
    };
    stage.addEventListener("pointerdown", down);
    stage.addEventListener("pointermove", move);
    stage.addEventListener("pointerup", up);
    stage.addEventListener("pointercancel", up);
    stage.addEventListener("wheel", wheel, { passive: false });
    addEventListener("keydown", key);
    return {
      run, st,
      stop() {
        cancelAnimationFrame(raf); clearTimeout(snapTimer);
        stage.removeEventListener("pointerdown", down); stage.removeEventListener("pointermove", move);
        stage.removeEventListener("pointerup", up); stage.removeEventListener("pointercancel", up);
        stage.removeEventListener("wheel", wheel); removeEventListener("keydown", key);
      },
    };
  };

  // ── Skin button: when set to dark, the sun circle morphs into a crescent moon while scaling 1.45×, the rays shrink to .55× and vanish (.55s power2.inOut, instantly on first draw) ──
  const DISC = "M10 6.2a3.8 3.8 0 1 1 0 7.6a3.8 3.8 0 1 1 0-7.6z";
  const MOON = "M11.4 6.5a3.6 3.6 0 1 0 2.3 5.9a2.9 2.9 0 1 1 -2.3 -5.9z";
  if (window.gsap && window.MorphSVGPlugin) gsap.registerPlugin(MorphSVGPlugin);
  let themeDrawn = false;
  const syncTheme = () => document.querySelectorAll("[data-theme-toggle]").forEach((b) => {
    const dark = root.dataset.theme === "dark";
    b.setAttribute("aria-pressed", String(dark));
    b.setAttribute("aria-label", dark ? "View brighter" : "View in dark");
    const disc = b.querySelector(".theme-disc"), rays = b.querySelector(".theme-rays");
    if (!window.gsap || !disc || !rays) return;
    const dur = themeDrawn && !SB.reduce() ? 0.55 : 0;
    gsap.to(disc, { duration: dur, ease: "power2.inOut", morphSVG: window.MorphSVGPlugin ? (dark ? MOON : DISC) : undefined, scale: dark ? 1.45 : 1, svgOrigin: "10 10" });
    gsap.to(rays, { duration: dur, ease: "power2.inOut", opacity: dark ? 0 : 1, scale: dark ? 0.55 : 1, transformOrigin: "center" });
  });

  // ── Help drawer ──
  const closeHelp = (except) => document.querySelectorAll(".help-toggle[aria-expanded=true]").forEach((t) => {
    if (t === except) return;
    t.setAttribute("aria-expanded", "false");
    document.getElementById(t.getAttribute("aria-controls"))?.setAttribute("hidden", "");
  });

  // ── Phone Menu Panel ──
  const sheet = () => document.querySelector(".sheet");
  const openSheet = (on) => {
    const s = sheet();
    if (!s) return;
    s.toggleAttribute("data-open", on);
    s.inert = !on;
    document.querySelectorAll(".top-menu").forEach((b) => b.setAttribute("aria-expanded", String(on)));
  };

  // ── Bag drawer ──
  const openCart = (on) => {
    const c = document.querySelector(".cart");
    if (!c) return;
    c.toggleAttribute("data-open", on);
    c.inert = !on;
    document.querySelectorAll(".top-bag").forEach((b) => b.setAttribute("aria-expanded", String(on)));
    if (on) c.querySelector(".cart-close")?.focus({ preventScroll: true });
  };

  document.addEventListener("click", (e) => {
    const t = e.target instanceof Element ? e.target : null;
    if (!t) return;
    if (t.closest("[data-theme-toggle]")) {
      root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
      try { localStorage.setItem("sb-theme", root.dataset.theme); } catch {}
      syncTheme();
      dispatchEvent(new Event("theme-change"));
      return;
    }
    const help = t.closest(".help-toggle");
    if (help) {
      const open = help.getAttribute("aria-expanded") !== "true";
      closeHelp(help);
      help.setAttribute("aria-expanded", String(open));
      document.getElementById(help.getAttribute("aria-controls"))?.toggleAttribute("hidden", !open);
      return;
    }
    if (!t.closest(".help-panel")) closeHelp();
    if (t.closest(".top-menu")) { openSheet(!sheet()?.hasAttribute("data-open")); return; }
    if (t.closest(".top-bag")) { openCart(true); return; }
    if (t.closest(".cart-close, .cart-veil")) { openCart(false); return; }
    if (t.closest(".sheet-close, .sheet-veil")) { openSheet(false); return; }
    if (!t.closest(".search")) blurSearch();
  });
  addEventListener("keydown", (e) => {
    if (e.key === "Escape") { closeHelp(); openSheet(false); openCart(false); blurSearch(); }
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); document.querySelector(".search input")?.focus(); }
  });

  // ── Search field: widens on press and a panel of collection chips drops down ──
  function blurSearch() {
    document.querySelectorAll(".search[data-focused], .search[data-open]").forEach((s) => {
      s.removeAttribute("data-focused");
      s.removeAttribute("data-open");
      s.querySelector(".search-panel")?.setAttribute("hidden", "");
      s.querySelector("input")?.setAttribute("aria-expanded", "false");
    });
  }
  document.addEventListener("focusin", (e) => {
    const s = e.target instanceof Element ? e.target.closest(".search") : null;
    if (!s || !e.target.matches("input")) return;
    s.setAttribute("data-focused", "");
    s.querySelector(".search-panel")?.removeAttribute("hidden");
    e.target.setAttribute("aria-expanded", "true");
  });
  document.addEventListener("click", (e) => {
    const t = e.target instanceof Element ? e.target : null;
    const open = t?.closest(".search-trigger");
    if (open) { const s = open.closest(".search"); s.setAttribute("data-open", ""); s.querySelector("input")?.focus(); return; }
    if (t?.closest(".search-dismiss")) { blurSearch(); return; }
    const field = t?.closest(".search-field");
    if (field) field.querySelector("input")?.focus();
  });

  // ── Newsletter paper card: shows once, 6s after boot finishes. Closing folds it away and it never shows again ──
  const NL = "sb-newsletter";
  const seen = () => { try { return !!localStorage.getItem(NL); } catch { return false; } };
  const remember = (how) => { try { localStorage.setItem(NL, JSON.stringify({ at: Date.now(), how })); } catch {} };
  function postcard() {
    const tpl = document.getElementById("postcard-tpl");
    if (!tpl || seen()) return;
    let timer = 0;
    const show = () => {
      if (seen() || document.querySelector(".postcard")) return;
      const card = tpl.content.firstElementChild.cloneNode(true);
      document.body.append(card);
      const exit = (how = "dismissed") => {
        if (card.dataset.exit) return;
        remember(how);
        card.dataset.exit = how;
        setTimeout(() => card.remove(), 1560);
      };
      card.querySelector(".postcard-close")?.addEventListener("click", () => exit());
      card.addEventListener("keydown", (e) => e.key === "Escape" && exit());
      card.querySelector("form")?.addEventListener("submit", (e) => {
        e.preventDefault();
        const input = card.querySelector("input");
        const note = card.querySelector(".postcard-note");
        if (!input.checkValidity() || !input.value.trim()) { card.querySelector(".postcard-field")?.setAttribute("data-invalid", ""); if (note) note.textContent = "Please double-check your email address."; return; }
        exit("subscribed");
      });
    };
    const arm = () => { clearTimeout(timer); timer = setTimeout(show, 6000); };
    if (!root.hasAttribute("data-booting")) { arm(); return; }
    const mo = new MutationObserver(() => { if (!root.hasAttribute("data-booting")) { mo.disconnect(); arm(); } });
    mo.observe(root, { attributes: true, attributeFilter: ["data-booting"] });
  }

  const boot = () => {
    syncTheme();
    themeDrawn = true;
    sheet() && (sheet().inert = true);
    const cart = document.querySelector(".cart");
    if (cart) cart.inert = true;
    postcard();
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
})();
