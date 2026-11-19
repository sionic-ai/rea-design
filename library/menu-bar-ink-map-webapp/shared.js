// App shell: open/close menu · branch menu · dialog · brightness toggle · document name · shortcuts.
// Drawing is handled by index.js, and the two talk only through APP.on/emit.
(() => {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const bus = {};
  const APP = (window.APP = {
    reduced,
    on: (ev, fn) => (bus[ev] ||= []).push(fn),
    emit: (ev, ...a) => (bus[ev] || []).forEach((fn) => fn(...a)),
  });
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const typing = () => document.activeElement?.matches("input, textarea");

  // ── Dropdown menu
  const menus = $$(".ap-menu");
  const closeMenus = (except) => menus.forEach((m) => {
    if (m === except) return;
    m.classList.remove("is-open");
    m.querySelector(".ap-btn").setAttribute("aria-expanded", "false");
    $$(".ap-sub", m).forEach((s) => s.classList.remove("is-open"));
  });
  const blur = () => requestAnimationFrame(() => document.activeElement?.blur());
  menus.forEach((m) => {
    const btn = m.querySelector(".ap-btn");
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const open = !m.classList.contains("is-open");
      closeMenus(m);
      m.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", String(open));
      if (open) keepIn(m);
    });
  });
  // Like the original menu, clamp within 12px of the screen edge — so the leftmost ”File” menu isn’t half cut off
  const keepIn = (m) => {
    const pop = m.querySelector(".ap-pop"), r = m.getBoundingClientRect(), w = pop.offsetWidth;
    const left = r.left + r.width / 2 - w / 2, shift = Math.max(0, 12 - left) + Math.min(0, innerWidth - 12 - (left + w));
    pop.style.translate = shift ? `calc(-50% + ${shift}px) 0` : "";
  };
  $$(".ap-sub").forEach((s) => {
    // If there is no room on the right (phone), it is pushed into the screen like the original and opens overlapping its parent
    const fit = () => {
      const pop = s.lastElementChild, r = s.getBoundingClientRect();
      pop.style.left = Math.max(12, Math.min(r.right, innerWidth - 12 - pop.offsetWidth)) - r.left + "px";
    };
    const open = () => { $$(".ap-sub", s.parentElement).forEach((o) => o !== s && o.classList.remove("is-open")); fit(); s.classList.add("is-open"); };
    s.addEventListener("mouseenter", open);
    s.addEventListener("mouseleave", () => s.classList.remove("is-open"));
    // On touch, a click arrives right after the hover opens, so a click only opens and never closes
    s.firstElementChild.addEventListener("click", (e) => { e.stopPropagation(); open(); });
  });
  document.addEventListener("click", (e) => { if (!e.target.closest(".ap-menu")) closeMenus(); });

  // ── Dialog: info fades (.3s), the rest grows from 0.9 (.225s in · .125s out). Backdrop fades .3s — the original transition curve as is
  gsap.registerPlugin(CustomEase);
  const EASE = { ui: CustomEase.create("ui", "0.4,0,0.2,1"), dIn: CustomEase.create("dIn", "0,0,0.2,1"), dOut: CustomEase.create("dOut", "0.4,0,1,1") };
  const dialogs = Object.fromEntries($$(".ap-dialog").map((d) => [d.dataset.dialog, d]));
  const openDialog = (name) => {
    const d = dialogs[name];
    if (!d) return;
    closeMenus();
    d.classList.add("is-open");
    const card = $(".ap-card", d), scrim = $(".ap-scrim", d);
    if (!reduced) {
      gsap.fromTo(scrim, { opacity: 0 }, { opacity: 0.32, duration: 0.3, ease: EASE.ui });
      if (name === "about") gsap.fromTo(card, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: EASE.ui });
      else gsap.fromTo(card, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.225, ease: EASE.dIn });
    }
    const field = $("input[type=text]", d);
    if (field) setTimeout(() => field.focus(), 50);
  };
  const closeDialog = (d) => {
    if (!d?.classList.contains("is-open")) return;
    const end = () => d.classList.remove("is-open");
    if (reduced) return end();
    const fade = d.dataset.dialog === "about";
    gsap.to($(".ap-scrim", d), { opacity: 0, duration: 0.3, ease: EASE.ui, onComplete: end });
    gsap.to($(".ap-card", d), fade ? { opacity: 0, duration: 0.3, ease: EASE.ui } : { opacity: 0, scale: 0.9, duration: 0.125, ease: EASE.dOut });
  };
  APP.openDialog = openDialog;
  APP.closeDialog = (name) => closeDialog(dialogs[name]);
  $$("[data-open]").forEach((b) => b.addEventListener("click", (e) => { e.stopPropagation(); openDialog(b.dataset.open); }));
  $$(".ap-dialog [data-close]").forEach((b) => b.addEventListener("click", () => closeDialog(b.closest(".ap-dialog"))));

  // ── Menu item → to the drawing section ──
  document.addEventListener("click", (e) => {
    const sw = e.target.closest(".ap-switch");
    if (sw) {
      e.stopPropagation();
      const on = sw.getAttribute("aria-checked") !== "true";
      sw.setAttribute("aria-checked", String(on));
      APP.emit("switch", sw.dataset.switch, on);
      return;
    }
    const tool = e.target.closest("[data-tool]");
    if (tool && tool.closest(".ap-pop")) {
      APP.emit("tool", tool.dataset.tool, tool.dataset.size || tool.dataset.kind || null);
      closeMenus();
      blur();
      return;
    }
    const act = e.target.closest("[data-act]");
    if (!act) return;
    const a = act.dataset.act;
    if (a === "new") openDialog("new");
    else if (a === "export") { $("[data-export-name]").value = APP.title(); openDialog("export"); }
    else if (a === "clear") { APP.emit("clear"); requestAnimationFrame(() => closeMenus()); }
    else if (a === "undo" || a === "redo") APP.emit(a);
    else if (a === "new-yes") { closeDialog(dialogs.new); APP.emit("new"); }
    else if (a === "export-go") {
      closeDialog(dialogs.export);
      APP.emit("export", $("[data-export-name]").value.trim() || "No title", $("input[name=paper]:checked").value);
    }
  });

  // ── Current Tool Icons
  const ICON = { select: "i-cursor", land: "i-globe", trees: "i-forest", mountains: "i-mountain", roads: "i-road", buildings: "i-castle" };
  APP.on("tool", (t) => {
    $(".ap-tool use").setAttribute("href", "#" + (ICON[t] || "i-cursor"));
    $$(".ap-switch").forEach((s) => (s.disabled = s.dataset.switch !== t));
    $$("[data-tool]").forEach((el) => el.classList.toggle("is-on", el.dataset.tool === t));
  });

  // ── Brightness transition
  $(".ap-theme").addEventListener("click", () => {
    const dark = document.documentElement.dataset.theme !== "dark";
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    $(".ap-theme use").setAttribute("href", dark ? "#i-moon" : "#i-sun");
    blur();
  });

  // ── Document name: append * if there is something to undo (unsaved mark)
  const titleIn = $(".ap-title__in");
  let title = "No title", dirty = false;
  const paint = () => { if (document.activeElement !== titleIn) titleIn.value = (title.replace(/\*/g, "") || "No title") + (dirty ? "*" : ""); };
  titleIn.addEventListener("input", () => { title = titleIn.value.replace(/\*/g, ""); });
  titleIn.addEventListener("blur", paint);
  APP.title = () => title.replace(/\*/g, "").trim() || "No title";
  APP.setTitle = (t) => { title = t; paint(); };
  APP.on("history", (undoN, redoN) => {
    dirty = undoN > 0;
    $("[data-act=undo]").disabled = undoN === 0;
    $("[data-act=redo]").disabled = redoN === 0;
    paint();
  });

  // ── Shortcuts
  addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeMenus();
      Object.values(dialogs).forEach(closeDialog);
      return;
    }
    const k = e.key.toLowerCase();
    if ((e.ctrlKey || e.metaKey) && (k === "n" || k === "p")) {
      e.preventDefault();
      k === "n" ? openDialog("new") : ($("[data-export-name]").value = APP.title(), openDialog("export"));
      return;
    }
    if (typing() || $(".ap-dialog.is-open")) return;
    if (k === "z" || k === "y") { e.preventDefault(); APP.emit(k === "z" ? "undo" : "redo"); closeMenus(); blur(); }
    if (e.key === "Backspace" || e.key === "Delete") { e.preventDefault(); APP.emit("delete"); }
  }, true);
})();
