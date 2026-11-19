// Shared by the whole site — the original’s motion is only css transitions (.15~.3s) and photo band keyframes, so js only handles open and close:
// Phone menu panel, opening a video in place when a thumbnail is pressed, and the article page contents following the section being read
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  const toggle = $("[data-menu-toggle]"), menu = $("[data-menu]");
  if (toggle && menu) {
    const set = (open) => {
      menu.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      document.documentElement.style.overflow = open ? "hidden" : "";
    };
    toggle.addEventListener("click", () => set(!menu.classList.contains("is-open")));
    menu.addEventListener("click", (e) => e.target.closest("a") && set(false));
    $$("[data-menu-close]").forEach((v) => v.addEventListener("click", () => set(false)));
    addEventListener("keydown", (e) => e.key === "Escape" && set(false));
    matchMedia("(min-width: 1280px)").addEventListener("change", (m) => m.matches && set(false));
  }

  $$("[data-video]").forEach((box) => {
    // As in the original, swap the thumbnail slot for a video panel — lay the video panel on top, then 50ms later (the time the original takes to redraw) remove the thumbnail and play button
    // (Meanwhile the play button shifts to its pressed color)
    const tpl = $("template[data-player]", box);
    const play = () => {
      if (!tpl || $(".nx-video__player", box)) return;
      box.append(tpl.content.firstElementChild.cloneNode(true));
      setTimeout(() => $$(".nx-thumb, .nx-play", box).forEach((el) => el.remove()), 50);
    };
    box.addEventListener("click", play);
    box.addEventListener("keydown", (e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), play()));
  });

  // Article page header — once scrolled even slightly, the bottom-line shadow turns on
  const blogHead = $("[data-blog-header]");
  if (blogHead) {
    const shade = () => blogHead.classList.toggle("is-scrolled", scrollY > 0);
    addEventListener("scroll", shade, { passive: true });
    shade();
  }

  // Code box copy — on click it turns into a check mark and returns after 2 seconds
  $$("[data-copy]").forEach((b) => b.addEventListener("click", () => {
    const pre = b.closest(".bx-code")?.querySelector("pre");
    if (pre && navigator.clipboard) navigator.clipboard.writeText(pre.textContent).catch(() => {});
    b.classList.add("is-copied");
    setTimeout(() => b.classList.remove("is-copied"), 2000);
  }));

  // Product menu — opens right on hover, and on leave lingers briefly (170ms) then closes like the original radix menu. Pressing toggles it
  $$("[data-prod]").forEach((menu) => {
    const btn = $("button", menu);
    let timer = 0;
    const set = (open) => { clearTimeout(timer); menu.classList.toggle("is-open", open); btn.setAttribute("aria-expanded", String(open)); };
    menu.addEventListener("pointerenter", () => set(true));
    menu.addEventListener("pointerleave", () => { clearTimeout(timer); timer = setTimeout(() => set(false), 170); });
    btn.addEventListener("click", () => set(!menu.classList.contains("is-open")));
    menu.addEventListener("focusout", (e) => { if (!menu.contains(e.relatedTarget)) set(false); });
  });

  // Search dialog — opens on click or ⌘K, closes on backdrop click or Esc (hidden after the .3s closing keyframes finish)
  const search = $("[data-search]");
  if (search) {
    const open = () => { search.classList.remove("is-closing"); search.classList.add("is-open"); $("input", search)?.focus(); };
    const close = () => {
      if (!search.classList.contains("is-open") || search.classList.contains("is-closing")) return;
      search.classList.add("is-closing");
      setTimeout(() => search.classList.remove("is-open", "is-closing"), 300);
    };
    $$("[data-search-open]").forEach((b) => b.addEventListener("click", open));
    $$("[data-search-close]").forEach((b) => b.addEventListener("click", close));
    addEventListener("keydown", (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); open(); }
      else if (e.key === "Escape") close();
    });
  }

  // AI panel — enters from the right and the body shifts aside by the panel width
  const ai = $("[data-ai]");
  if (ai) $$("[data-ai-toggle]").forEach((b) => b.addEventListener("click", () => {
    const on = !ai.classList.contains("is-open");
    ai.classList.toggle("is-open", on);
    document.documentElement.classList.toggle("is-ai-open", on);
    // Focus the input .12s after the board enters — in the original too the field border darkens after the board settles
    if (on) setTimeout(() => $("input", ai)?.focus({ preventScroll: true }), 120);
  }));

  // Article page table of contents — lights the TOC row of the last section past the upper-third line of the screen
  const toc = $("[data-toc]");
  if (toc) {
    const links = $$("a[href^='#']", toc);
    const heads = links.map((a) => document.getElementById(a.getAttribute("href").slice(1))).filter(Boolean);
    let ticking = false;
    const mark = () => {
      ticking = false;
      const line = innerHeight / 3;
      let cur = null;
      for (const h of heads) if (h.getBoundingClientRect().top <= line) cur = h;
      links.forEach((a) => a.classList.toggle("is-on", cur && a.getAttribute("href") === `#${cur.id}`));
    };
    addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(mark); } }, { passive: true });
    mark();
  }
})();
