// Section-switch panel — advance one section at a time with wheel, up/down keys and finger swipe, and each time a glyph curtain (glyph-curtain-swap) covers then clears.
// Each section accepts interception so its inner stage (plate → card, display case → broken glass, card ring spin) can take the wheel first
(() => {
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const pager = document.querySelector("[data-pager]");
  const screens = pager ? [...pager.querySelectorAll("[data-screen]")] : [];
  const curtain = document.querySelector("[data-curtain-host]");
  const headLabel = document.querySelector("[data-head-label]");
  const bgs = [...document.querySelectorAll("[data-bg]")];
  const interceptors = new Map();
  const listeners = new Set();
  let index = 0, phase = "idle", locked = false;

  const keyOf = (i) => screens[i]?.dataset.screen;
  const playWords = (scr) => scr.querySelectorAll('[data-fx~="word-pop-shuffle"]').forEach((n) => {
    if (n.closest("[data-own-reveal]") && n.closest("[data-own-reveal]") !== scr) return;
    n.dispatchEvent(new CustomEvent(reduce ? "fx:show" : "fx:play"));
  });
  const hideWords = (scr) => scr.querySelectorAll('[data-fx~="word-pop-shuffle"]').forEach((n) => n.dispatchEvent(new CustomEvent("fx:reset")));

  function setCurrent(i) {
    screens.forEach((s, k) => { s.classList.toggle("is-current", k === i); s.inert = k !== i; });
    const scr = screens[i];
    const bg = scr.dataset.bgKey;
    bgs.forEach((b) => b.classList.toggle("is-on", b.dataset.bg === bg));
    if (headLabel && scr.dataset.head) headLabel.innerHTML = scr.dataset.head;
    document.querySelectorAll("[data-index-item]").forEach((b) => b.classList.toggle("is-current", b.dataset.indexItem === keyOf(i)));
    index = i;
    history.replaceState(null, "", i === 0 ? location.pathname + location.search : `#${keyOf(i)}`);
  }

  function emit(type, i) { listeners.forEach((fn) => fn(type, keyOf(i), screens[i])); }

  function goTo(i, opts = {}) {
    if (!screens.length || i < 0 || i >= screens.length || phase !== "idle" || (i === index && !opts.force)) return false;
    const from = index;
    phase = "cover";
    emit("leave", from);
    const swap = () => {
      hideWords(screens[i]);
      setCurrent(i);
      emit("enter", i);
      phase = "reveal";
      const done = () => { phase = "idle"; playWords(screens[i]); emit("shown", i); };
      if (curtain) curtain.dispatchEvent(new CustomEvent("fx:reveal", { detail: { done } }));
      else done();
    };
    if (curtain) curtain.dispatchEvent(new CustomEvent("fx:cover", { detail: { done: swap } }));
    else swap();
    return true;
  }

  // Wheel values accumulate and clear after resting 200ms — flip once when over 8 accumulates (as in the original)
  function step(delta) {
    if (locked || phase !== "idle" || !screens.length) return;
    const own = interceptors.get(keyOf(index));
    if (own && own(delta)) return;
    goTo(index + (delta > 0 ? 1 : -1));
  }
  let acc = 0, accTimer = 0;
  const onWheel = (e) => {
    if (e.target.closest?.("[data-own-scroll]")) return;
    e.preventDefault();
    const d = e.deltaMode === 1 ? e.deltaY * (100 / 6) : e.deltaMode === 2 ? e.deltaY * innerHeight : e.deltaY;
    acc += d;
    clearTimeout(accTimer);
    accTimer = setTimeout(() => { acc = 0; }, 200);
    if (Math.abs(acc) < 8) return;
    const v = acc; acc = 0;
    step(v);
  };
  const onKey = (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey || e.target.closest?.("input, textarea, select, [contenteditable='true'], [data-own-scroll]")) return;
    if (document.querySelector(".gv-index.is-open, .gv-drawer.is-open")) return;
    if (["ArrowDown", "PageDown", " "].includes(e.key)) { e.preventDefault(); step(9); }
    else if (["ArrowUp", "PageUp"].includes(e.key)) { e.preventDefault(); step(-9); }
    else if (e.key === "Home") { e.preventDefault(); goTo(0); }
    else if (e.key === "End") { e.preventDefault(); goTo(screens.length - 1); }
  };
  let ty = null, touchUntil = 0;
  const onTouchStart = (e) => { ty = e.target.closest?.("[data-own-scroll]") || e.touches.length !== 1 ? null : e.touches[0].clientY; };
  const onTouchEnd = (e) => {
    if (ty === null) return;
    const d = ty - (e.changedTouches[0]?.clientY ?? ty);
    ty = null;
    if (Math.abs(d) < 48 || performance.now() < touchUntil) return;
    touchUntil = performance.now() + 350;
    step(d);
  };

  window.GV = {
    reduce,
    get index() { return index; },
    get key() { return keyOf(index); },
    get phase() { return phase; },
    screens,
    goTo,
    goKey: (k) => goTo(screens.findIndex((s) => s.dataset.screen === k)),
    intercept: (k, fn) => interceptors.set(k, fn),
    lock: (v) => { locked = v; },
    on: (fn) => listeners.add(fn),
    playWords,
    hideWords,
  };

  if (pager && screens.length) {
    root.classList.add("gv-pager-on");
    document.addEventListener("wheel", onWheel, { passive: false });
    addEventListener("keydown", onKey);
    addEventListener("touchstart", onTouchStart, { passive: true });
    addEventListener("touchend", onTouchEnd, { passive: true });
    const start = Math.max(0, screens.findIndex((s) => `#${s.dataset.screen}` === location.hash));
    setCurrent(start);
    // When entering directly via a non-first-section URL, skip the intro video and show that section’s words first — parts attach after DOMContentLoaded, so on the next frame
    const kick = () => requestAnimationFrame(() => requestAnimationFrame(() => {
      emit("enter", start);
      if (start > 0 || !document.querySelector("[data-hero]")) { playWords(screens[start]); emit("shown", start); }
    }));
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", kick, { once: true });
    else kick();
    addEventListener("hashchange", () => {
      const k = screens.findIndex((s) => `#${s.dataset.screen}` === location.hash);
      if (k >= 0 && k !== index) goTo(k);
    });
  }

  // ── Index: while the text curtain covers the screen, open and close one binder sheet. The header line Index turns into Close ──
  const idx = document.querySelector("[data-index]");
  if (idx) {
    let open = false, busy = false;
    // Original Index button swaps its text in place (no text-swap flip). But if the cursor is over the button, the changed characters appear fresh under the cursor
    // Interaction response restarts from the beginning — new text slides up and out and a new one stands from below, with the left square leading (square + five texts, the last at .15 + .04×5 = .35s).
    // Removing the Interaction part restores the original text (undo), so text is changed after that restore (MutationObserver microtask), and Interaction is turned on after it is re-attached
    const relabel = (text) => document.querySelectorAll("[data-open-index]").forEach((b) => {
      const fx = b.getAttribute("data-fx") || "letter-pop-flip";
      const lit = !reduce && b.matches(":hover");
      b.removeAttribute("data-fx");
      queueMicrotask(() => {
        b.dataset.label = text; b.textContent = text;
        b.setAttribute("data-fx", fx);
        if (lit) queueMicrotask(() => b.dispatchEvent(new PointerEvent("pointerenter")));
      });
    });
    // Phone (767 and below) also opens straight with no text curtain, like the original — back curtain .6s straight, paper from below .7s expo.out
    const narrow = matchMedia("(max-width: 767px)");
    const sheet = idx.querySelector(".gv-index__sheet");
    // The back curtain is a separate layer — on phones, this layer’s opacity brings it in and out instead of the panel background
    const veil = document.createElement("div");
    veil.className = "gv-index__veil"; veil.setAttribute("aria-hidden", "true");
    idx.prepend(veil);
    const show = (v, then) => {
      if (open === v || busy) return;
      busy = true;
      const swap = () => {
        open = v;
        idx.classList.toggle("is-open", v);
        // Under the curtain the panel also rises and falls like the original — .45s to open, .3s power2.out to close
        if (!narrow.matches && !reduce) {
          gsap.killTweensOf(idx, "opacity");
          if (v) gsap.fromTo(idx, { opacity: 0 }, { opacity: 1, duration: 0.45, ease: "power2.out", clearProps: "opacity" });
          else { idx.classList.add("is-closing"); gsap.fromTo(idx, { opacity: 1 }, { opacity: 0, duration: 0.3, ease: "power2.out", onComplete: () => { idx.classList.remove("is-closing"); gsap.set(idx, { clearProps: "opacity" }); } }); }
        }
        // In the very frame the curtain fully covers, the original flips the text (starting in the next frame), and two frames later spreads the ink-colored band of the current section row from the left square spot to the right over 1.2s power2.out
        relabel(v ? "Close" : "Index");
        if (v) idx.querySelectorAll(".gv-index__item.is-current [data-index-bar]").forEach((bar) => gsap.fromTo(bar, { clipPath: "inset(0% 92.69% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: reduce ? 0 : 1.2, ease: "power2.out", delay: reduce || narrow.matches ? 0 : 0.05 }));
        if (headLabel) headLabel.innerHTML = v ? (headLabel.dataset.home || "") : (screens[index]?.dataset.head || headLabel.innerHTML);
        window.GV?.lock(v);
        then && then();
        const done = () => { busy = false; };
        if (curtain && !narrow.matches) curtain.dispatchEvent(new CustomEvent("fx:reveal", { detail: { done } })); else done();
      };
      if (narrow.matches && !reduce) {
        gsap.killTweensOf([veil, sheet]);
        swap();
        idx.classList.toggle("is-closing", !v);
        gsap.fromTo(veil, { opacity: v ? 0 : 1 }, { opacity: v ? 1 : 0, duration: 0.6, ease: "none" });
        sheet && gsap.fromTo(sheet, { yPercent: v ? 100 : 0 }, { yPercent: v ? 0 : 100, duration: 0.7, ease: "expo.out", onComplete: () => {
          idx.classList.remove("is-closing"); gsap.set([veil, sheet], { clearProps: "opacity,transform" });
        } });
        return;
      }
      if (curtain) curtain.dispatchEvent(new CustomEvent("fx:cover", { detail: { done: swap } })); else swap();
    };
    if (headLabel) headLabel.dataset.home = screens[0]?.dataset.head || headLabel.innerHTML;
    document.querySelectorAll("[data-open-index]").forEach((b) => {
      b.dataset.label = b.textContent.trim();
      const probe = document.createElement("span");
      probe.style.cssText = "position:absolute;visibility:hidden;white-space:nowrap";
      probe.textContent = "Close";
      b.append(probe);
      const w = Math.max(probe.offsetWidth, b.offsetWidth);
      probe.remove();
      if (w) b.style.minWidth = `${Math.ceil(w)}px`;
    });
    // Band of the current section line: layer the same text once more in white, then clip and spread it together with the band
    idx.querySelectorAll(".gv-index__item").forEach((a) => {
      const bar = document.createElement("span");
      bar.className = "gv-index__bar";
      bar.setAttribute("data-index-bar", "");
      bar.setAttribute("aria-hidden", "true");
      bar.innerHTML = a.innerHTML;
      a.append(bar);
    });
    document.querySelectorAll("[data-open-index]").forEach((b) => b.addEventListener("click", () => show(!open)));
    idx.querySelectorAll("[data-index-item]").forEach((b) => b.addEventListener("click", (e) => {
      if (!pager || !screens.some((s) => s.dataset.screen === b.dataset.indexItem)) return;
      e.preventDefault();
      const k = screens.findIndex((s) => s.dataset.screen === b.dataset.indexItem);
      show(false, () => { if (k >= 0 && k !== index) { hideWords(screens[k]); setCurrent(k); emit("enter", k); setTimeout(() => { playWords(screens[k]); emit("shown", k); }, 760); } });
    }));
    addEventListener("keydown", (e) => { if (e.key === "Escape") show(false); });
  }
  document.querySelectorAll("[data-go]").forEach((b) => b.addEventListener("click", (e) => {
    e.preventDefault();
    if (pager && screens.some((s) => s.dataset.screen === b.dataset.go)) { window.GV.goKey(b.dataset.go); return; }
    // If the section isn’t in this document, goes to that section of the first page — after the text curtain covers it
    const go = () => { try { sessionStorage.setItem("fx-glyph-curtain", "1"); } catch {} location.href = `index.html#${b.dataset.go}`; };
    if (curtain) curtain.dispatchEvent(new CustomEvent("fx:cover", { detail: { done: go } })); else go();
  }));

  // ── Work detail drawer: opens from the left in .7s expo.out and the backdrop fades in .6s linear. Outside the drawer, the cursor turns into ‹Close› text ──
  const drawer = document.querySelector("[data-drawer]");
  if (drawer && !drawer.children.length) {
    const w = (delay, text, extra = "") => `<p data-fx="word-pop-shuffle" data-fx-word-pop-shuffle="on: event; delay: ${delay}"${extra}>${text}</p>`;
    const media = (delay, label, cls) => `<div class="gv-reveal-box" data-media="${delay}"><div data-media-inner><div class="wf-img ${cls}" data-label="${label}"></div></div></div>`;
    drawer.innerHTML = `
      <span class="wf-note">Work detail drawer · from the left .7s expo.out · back curtain .6s · photo rises from 105% below 1.2s power2.out (delayed .25~.6s) · cursor outside the drawer is Close</span>
      <div class="gv-drawer__veil" data-drawer-veil></div>
      <aside class="gv-drawer__panel" data-drawer-panel>
        <div class="gv-drawer__scroll" data-own-scroll>
          <div class="gv-drawer__in">
            <div class="gv-drawer__head">
              <h1 class="gv-drawer__title" data-fx="word-pop-shuffle" data-fx-word-pop-shuffle="on: event; delay: 0.1">Project Details_004</h1>
              <div class="gv-drawer__meta">
                <div class="gv-drawer__meta-row"><i></i>${w(0.2, "( Category )")}</div>
                ${w(0.22, "( 2026 Archived )", ' class="is-upper"')}
              </div>
            </div>
            <div class="gv-drawer__rule"></div>
            <div>
              <div class="gv-reveal-box" data-media="0.25"><ul class="gv-tags" data-media-inner><li>Design observation</li><li>Tools and design</li><li>Judgment</li><li>Work and Practice</li></ul></div>
              <div style="margin-top:20px">${media(0.28, "Work cover · white title text at the center of a dark rounded ceiling ornament · monochrome · landscape 16:9", "gv-drawer__cover")}</div>
              <div class="gv-drawer__copy">${w(0.35, "Your one sentence on what this work deals with goes here.")}${w(0.38, "Your two lines here on the background of the work. Cover what changed and why this record is being made now.")}</div>
              ${media(0.5, "Black-and-white drawing of a figure from a classical sculpture reaching out · two-column comparison table on the right · landscape 16:10", "gv-drawer__fig")}
              <div class="gv-drawer__sec">${w(0, "Your subheading line here", ' class="gv-drawer__h2"')}<div class="gv-drawer__copy" style="margin-top:0">${w(0, "Your body paragraph of two or three lines goes here. List in order what was seen while working and how your judgment changed.")}${w(0, "Your second paragraph goes here. Write what was chosen rather than the numbers.")}</div></div>
              ${media(0.55, "Diagram · flow chart showing a person’s role moving from making to choosing · black lines on white · landscape 16:10", "gv-drawer__fig")}
              <div class="gv-drawer__sec">${w(0, "Second subheading here", ' class="gv-drawer__h2"')}<div class="gv-drawer__copy" style="margin-top:0">${w(0, "Your closing paragraph goes here, about two lines.")}</div></div>
            </div>
          </div>
        </div>
      </aside>`;
  }
  if (drawer) {
    const panel = drawer.querySelector("[data-drawer-panel]"), veil = drawer.querySelector("[data-drawer-veil]");
    const scroller = drawer.querySelector("[data-own-scroll]");
    const cursor = document.querySelector("[data-drawer-cursor]");
    const medias = [...drawer.querySelectorAll("[data-media-inner]")];
    let open = false;
    gsap.set(panel, { xPercent: -100 });
    const toggle = (v) => {
      if (open === v) return;
      open = v;
      gsap.killTweensOf([panel, veil, ...medias]);
      if (v) {
        drawer.classList.add("is-open");
        scroller.scrollTop = 0;
        gsap.fromTo(veil, { opacity: 0 }, { opacity: 1, duration: reduce ? 0 : 0.6, ease: "none" });
        gsap.fromTo(panel, { xPercent: -100 }, { xPercent: 0, duration: reduce ? 0 : 0.7, ease: "expo.out" });
        drawer.querySelectorAll('[data-fx~="word-pop-shuffle"]').forEach((n) => n.dispatchEvent(new CustomEvent(reduce ? "fx:show" : "fx:play")));
        medias.forEach((m) => {
          const d = +(m.closest("[data-media]")?.dataset.media || 0);
          if (reduce) gsap.set(m, { yPercent: 0 });
          else gsap.fromTo(m, { yPercent: 105 }, { yPercent: 0, duration: 1.2, ease: "power2.out", delay: d });
        });
      } else {
        gsap.to(veil, { opacity: 0, duration: reduce ? 0 : 0.6, ease: "none" });
        gsap.to(panel, { xPercent: -100, duration: reduce ? 0 : 0.7, ease: "expo.out", onComplete: () => drawer.classList.remove("is-open") });
        if (cursor) gsap.to(cursor, { opacity: 0, duration: 0.2 });
      }
      window.GV.lock(v);
      drawer.dispatchEvent(new CustomEvent(v ? "gv:drawer-open" : "gv:drawer-close"));
    };
    window.GV.drawer = { open: () => toggle(true), close: () => toggle(false), get isOpen() { return open; } };
    veil.addEventListener("click", () => toggle(false));
    addEventListener("keydown", (e) => { if (e.key === "Escape") toggle(false); });
    if (cursor && matchMedia("(hover: hover)").matches) {
      // Original cursor outside the drawer: follows the spot +12px from the cursor at .18s power2.out, and hides over the press-to-write area (work list)
      const xTo = gsap.quickTo(cursor, "x", { duration: 0.18, ease: "power2.out" });
      const yTo = gsap.quickTo(cursor, "y", { duration: 0.18, ease: "power2.out" });
      drawer.addEventListener("pointermove", (e) => {
        xTo(e.clientX + 12); yTo(e.clientY + 12);
        const list = document.querySelector("[data-works-index]")?.getBoundingClientRect();
        const onList = list && list.width > 0 && e.clientX >= list.left && e.clientX <= list.right && e.clientY >= list.top && e.clientY <= list.bottom;
        const out = !e.target.closest("[data-drawer-panel]") && !onList;
        gsap.to(cursor, { opacity: open && out ? 1 : 0, duration: 0.2, overwrite: "auto" });
      });
      drawer.addEventListener("pointerleave", () => gsap.to(cursor, { opacity: 0, duration: 0.2 }));
    }
  }
})();
