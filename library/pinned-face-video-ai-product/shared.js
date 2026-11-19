// Shared by all pages — opening and closing the phone menu panel. The panel opens as an ink panel when the header bar sits over an ink section (original bg-ink-elevated)
(() => {
  const sheet = document.querySelector("[data-sheet]");
  const head = document.querySelector(".or-head");
  const openBtn = document.querySelector("[data-sheet-open]");
  if (!sheet || !openBtn) return;
  const set = (on) => {
    sheet.classList.toggle("is-dark", on && head && !head.classList.contains("is-ink"));
    sheet.classList.toggle("is-open", on);
    sheet.setAttribute("aria-hidden", String(!on));
    openBtn.setAttribute("aria-expanded", String(on));
    document.documentElement.style.overflow = on ? "hidden" : "";
  };
  openBtn.addEventListener("click", () => set(true));
  sheet.querySelector("[data-sheet-close]")?.addEventListener("click", () => set(false));
  sheet.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => set(false)));
  addEventListener("keydown", (e) => { if (e.key === "Escape") set(false); });
  matchMedia("(min-width: 640px)").addEventListener("change", (e) => { if (e.matches) set(false); });
})();

// On first open on a phone, an app prompt curtain covers the screen (original IOSAppInterstitial — once per session, closed with ‹Continue on web› or ×).
// Inner text floats up from 16px below over .5s with cubic-bezier(.22,1,.36,1), and the logo mark keeps spinning once every 9 seconds
(() => {
  const KEY = "or-app-interstitial-dismissed";
  if (!/iPhone|iPad|iPod/.test(navigator.userAgent) || navigator.standalone) return;
  try { if (sessionStorage.getItem(KEY)) return; } catch (e) { /* Storage blocked — just shows */ }
  const box = document.createElement("div");
  box.className = "or-gate";
  box.setAttribute("data-slot", "app-interstitial");
  box.innerHTML = `<div class="or-gate__top"><button type="button" aria-label="Close"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg></button></div>
    <div class="or-gate__in"><svg class="or-gate__mark" aria-hidden="true"><use href="#or-mark"/></svg>
    <h1 data-label="Two-line title (English)">Our app always<br>in your pocket</h1><p>Your app notice goes here, about two lines.</p>
    <a class="or-store" href="#"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm3 15h4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg><span><small>Download on the</small>App Market</span></a>
    <button type="button" class="or-gate__web">Continue on web</button></div>`;
  const close = () => { try { sessionStorage.setItem(KEY, "1"); } catch (e) { /* Close even if saving fails */ } box.remove(); };
  box.querySelectorAll("button").forEach((b) => b.addEventListener("click", close));
  document.body.append(box);
})();

// Sign-up window — integrates the original motion spring (stiffness 300 · damping 28 · mass .85) as it is to raise the card (opacity, y 20→0, scale .96→1).
// On close, the same spring with y 12 and scale .97. The whole window turns on and off in .2s easeOut (original motion.div)
(() => {
  const box = document.querySelector("[data-auth]");
  if (!box) return;
  const card = box.querySelector(".or-auth__card"), veil = box.querySelector(".or-auth__veil");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  let raf = 0, x = 0, v = 0, target = 0, last = 0, hideT = 0, from = { y: 20, s: 0.96 };
  const paint = () => {
    card.style.opacity = Math.min(1, Math.max(0, x));
    card.style.transform = `translateY(${from.y * (1 - x)}px) scale(${from.s + (1 - from.s) * x})`;
  };
  const step = (now) => {
    let dt = Math.max(1, Math.min(64, now - (last || now))); last = now;
    for (; dt > 0; dt -= 1) { const a = (300 * (target - x) - 28 * v) / 0.85; v += a * 0.001; x += v * 0.001; }
    paint();
    if (Math.abs(target - x) < 0.001 && Math.abs(v) < 0.01) { x = target; paint(); raf = 0; last = 0; return; }
    raf = requestAnimationFrame(step);
  };
  const run = (to) => {
    target = to;
    if (reduce.matches) { x = to; paint(); return; }
    if (!raf) { last = 0; raf = requestAnimationFrame(step); }
  };
  const open = () => {
    from = { y: 20, s: 0.96 }; x = 0; v = 0;
    clearTimeout(hideT);
    box.hidden = false; paint();
    box.getBoundingClientRect();
    box.classList.add("is-open");
    run(1);
    card.focus({ preventScroll: true });
  };
  const close = () => {
    if (box.hidden) return;
    from = { y: 12, s: 0.97 };
    box.classList.remove("is-open");
    run(0);
    hideT = setTimeout(() => { if (!box.classList.contains("is-open")) box.hidden = true; }, reduce.matches ? 0 : 350);
  };
  document.querySelectorAll("[data-auth-open]").forEach((b) => b.addEventListener("click", open));
  veil.addEventListener("click", close);
  addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
})();

// When the header line moves between ink and paper, the pill’s own shape changes too (original Button variant ink ↔ paper, transition-all .15s)
(() => {
  const head = document.querySelector(".or-head");
  const pill = head?.querySelector(":scope > .or-pill");
  if (!head || !pill) return;
  const sync = () => pill.classList.toggle("is-paper", !head.classList.contains("is-ink"));
  sync();
  new MutationObserver(sync).observe(head, { attributes: true, attributeFilter: ["class"] });
})();
