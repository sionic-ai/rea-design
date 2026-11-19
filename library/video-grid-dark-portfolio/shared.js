// Shared by the whole Studio set — Lenis · ⌘K shortcut panel (S sound · T light/dark theme · L list view · E explore · H Home) ·
// Video blur-up loading and pause button. Page-to-page moves in the original Next app are usually plain links
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const root = document.documentElement;
  const KEY = "wp-theme";
  if (localStorage.getItem(KEY) === "light") root.dataset.theme = "light";

  if (!reduce && window.Lenis && !document.body.dataset.noLenis) {
    const lenis = new Lenis();
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    window.wpLenis = lenis;
  }

  // Shortcut panel
  const panel = document.querySelector(".wp-keys");
  const toggleBtn = document.querySelector("[data-keys-toggle]");
  const setKeys = (on) => {
    if (!panel) return;
    panel.classList.toggle("is-open", on);
    toggleBtn?.setAttribute("aria-expanded", String(on));
  };
  toggleBtn?.addEventListener("click", () => setKeys(!panel.classList.contains("is-open")));
  document.addEventListener("click", (e) => { if (panel?.classList.contains("is-open") && !e.target.closest(".wp-keys, [data-keys-toggle]")) setKeys(false); });

  const sound = document.querySelector("[data-sound-toggle]");
  const act = {
    sound: () => { if (!sound) return; const on = sound.dataset.sound !== "on"; sound.dataset.sound = on ? "on" : "off"; sound.setAttribute("aria-pressed", String(on)); },
    theme: () => { const light = root.dataset.theme !== "light"; if (light) root.dataset.theme = "light"; else delete root.dataset.theme; localStorage.setItem(KEY, light ? "light" : "dark"); },
    home: () => { location.href = "index.html"; },
    contact: () => { location.href = "mailto:hello@studio.example"; },
    c: () => { location.href = "mailto:hello@studio.example"; },
    keys: () => setKeys(!panel?.classList.contains("is-open")),
  };
  window.wpAct = act;
  sound?.addEventListener("click", act.sound);
  panel?.addEventListener("click", (e) => { const b = e.target.closest("[data-act]"); if (b) { act[b.dataset.act]?.(); if (b.dataset.act !== "keys") setKeys(false); } });
  document.addEventListener("keydown", (e) => {
    if (e.target.closest?.("input, textarea, [contenteditable]")) return;
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); act.keys(); return; }
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const k = e.key.toLowerCase();
    if (k === "escape") setKeys(false);
    else if (k === "s") act.sound();
    else if (k === "t") act.theme();
    else if (k === "h") act.home();
    else if (act[k]) act[k]();
  });

  // Video — blurred before loading, sharpens in .6s once loaded. Pauses when off screen
  const seen = new IntersectionObserver((ents) => ents.forEach((e) => {
    const v = e.target;
    if (v.dataset.paused === "1" || reduce) return;
    if (e.isIntersecting) v.play().catch(() => {}); else v.pause();
  }), { rootMargin: "100px" });
  document.querySelectorAll("video").forEach((v) => {
    const ready = () => v.classList.add("is-ready");
    if (v.readyState >= 2) ready(); else v.addEventListener("loadeddata", ready, { once: true });
    if (reduce) { v.removeAttribute("autoplay"); v.pause(); return; }
    seen.observe(v);
  });
  document.addEventListener("click", (e) => {
    const b = e.target.closest(".wp-pause");
    if (!b) return;
    e.preventDefault();
    e.stopPropagation();
    const v = b.parentElement.querySelector("video");
    if (!v) return;
    const paused = b.getAttribute("aria-pressed") !== "true";
    b.setAttribute("aria-pressed", String(paused));
    b.setAttribute("aria-label", paused ? "Video playback" : "Video paused");
    v.dataset.paused = paused ? "1" : "";
    if (paused) v.pause(); else v.play().catch(() => {});
  }, true);
})();
