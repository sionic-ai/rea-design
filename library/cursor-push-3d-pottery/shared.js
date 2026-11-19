(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;

  // Draws header·loader·cursor·series window in the same frame on every page — only the current series name (data-series) is set by the page
  const SERIES = [
    { key: "a", en: "Figures", ja: "Doll collection", enter: "Enter figures" },
    { key: "b", en: "Faces", ja: "Mask", enter: "Enter faces" },
  ];
  window.cgSeries = SERIES;
  // One symbol per series — our own shapes in the same spot · size as the original symbols (standing doll · octagonal mask)
  window.cgIcons = {
    a: '<svg viewBox="0 0 72 74"><path fill-rule="evenodd" d="M6 4h60L44 38l16 32-24-17-24 17 16-32Zm30 6a7 7 0 1 0 0 14a7 7 0 1 0 0-14Z"/></svg>',
    b: '<svg viewBox="0 0 68 67"><path fill-rule="evenodd" d="M20 1h28l19 19v27L48 66H20L1 47V20Zm14 12L13 33.5 34 54l21-20.5Z"/></svg>',
  };
  const fromUrl = new URLSearchParams(location.search).get("series");
  if (SERIES.some((s) => s.key === fromUrl)) document.body.dataset.series = fromUrl;
  const body = document.body;
  const here = body.dataset.series || "";
  const chevron = '<svg viewBox="0 0 10 6" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><path d="M1 1l4 4 4-4"/></svg>';

  const top = document.querySelector(".cg-top");
  if (top) {
    const now = body.dataset.page === "home" ? null : SERIES.find((s) => s.key === here);
    top.innerHTML =
      '<nav><ul class="cg-crumbs">' +
      `<li><a class="cg-pill" href="index.html"${body.dataset.page === "home" ? ' aria-current="page"' : ""} data-label="Project name (original is two Chinese characters)">Gap</a></li>` +
      `<li><button class="cg-pill${now ? " is-active" : ""}" type="button" aria-haspopup="dialog" aria-expanded="false" data-dialog-open data-label="Pick a series / current series English name">${now ? now.en : "Select a series"}${chevron}</button></li>` +
      "</ul></nav>" +
      '<a class="cg-pill" href="index.html" data-label="Button linking to the project About (in the original it also returns to the Hero)"><span class="cg-pill__wide">About the project</span><span class="cg-pill__narrow">About</span></a>';
  }

  const dialog = document.createElement("div");
  dialog.className = "cg-dialog";
  dialog.hidden = true;
  dialog.setAttribute("role", "dialog");
  dialog.setAttribute("aria-modal", "true");
  dialog.setAttribute("aria-label", "Choose a Series");
  dialog.dataset.slot = "series-dialog";
  dialog.innerHTML =
    '<div class="cg-dialog__box"><ul class="cg-dialog__list">' +
    SERIES.map((s) => `<li class="cg-dialog__item"><a class="cg-dialog__link" href="list.html?series=${s.key}" data-series="${s.key}"><span class="cg-dialog__en">${s.en}</span><span class="cg-dialog__ja">${s.ja}</span></a></li>`).join("") +
    "</ul></div>";
  body.append(dialog);
  const opener = () => document.querySelector("[data-dialog-open]");
  const mark = (key) => dialog.querySelectorAll(".cg-dialog__link").forEach((a) => (a.dataset.series === key ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current")));
  mark(here);
  window.cgMarkSeries = mark;
  const open = () => { dialog.hidden = false; opener()?.setAttribute("aria-expanded", "true"); dialog.querySelector("a")?.focus({ preventScroll: true }); };
  const close = () => { dialog.hidden = true; opener()?.setAttribute("aria-expanded", "false"); };
  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-dialog-open]")) { dialog.hidden ? open() : close(); return; }
    if (!dialog.hidden && !e.target.closest(".cg-dialog__box")) close();
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !dialog.hidden) close(); });
  // The first page closes the window and only switches the series — other pages go to that series list
  dialog.addEventListener("click", (e) => {
    const a = e.target.closest(".cg-dialog__link");
    if (!a || body.dataset.page !== "home") return;
    e.preventDefault();
    close();
    document.dispatchEvent(new CustomEvent("cg:series", { detail: { key: a.dataset.series } }));
  });

  // Loader — cells fill while the page gets ready (cgReady), and when full the curtain lifts
  const loader = document.createElement("div");
  loader.className = "cg-loader";
  loader.dataset.slot = "loader";
  loader.innerHTML = '<div class="cg-loader__track"><div class="cg-loader__bar"></div></div><div class="cg-loader__text">Loading 0%</div>';
  body.append(loader);
  const bar = loader.querySelector(".cg-loader__bar"), text = loader.querySelector(".cg-loader__text");
  // The page script loads after this file, so check cgReady after the document is fully read
  const parsed = new Promise((r) => (document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", r, { once: true }) : r()));
  // Like the original (drei useProgress), cells fill immediately by the share received — no faked fill, and the curtain lifts right there once everything has arrived
  const paint = (p) => { bar.style.width = `${p}%`; text.textContent = `Loading ${Math.round(p)}%`; };
  parsed.then(() => {
    const tasks = [window.cgReady || Promise.resolve(), document.fonts ? document.fonts.ready : Promise.resolve()];
    let done = 0;
    tasks.forEach((t) => t.then(() => paint((++done / tasks.length) * 100)));
    return Promise.all(tasks);
  }).then(() => loader.classList.add("is-loaded"));
  loader.addEventListener("transitionend", () => loader.classList.contains("is-loaded") && loader.remove(), { once: false });

  // Cursor
  if (fine) {
    const cursor = document.createElement("div");
    cursor.className = "cg-cursor is-dot";
    cursor.innerHTML = '<div class="cg-cursor__dot"></div>';
    body.append(cursor);
    gsap.set(cursor, { xPercent: -50, yPercent: -50, x: innerWidth * 0.5, y: innerHeight * 0.5 });
    const qx = gsap.quickTo(cursor, "x", { duration: reduce ? 0 : 0.5, ease: "power3" });
    const qy = gsap.quickTo(cursor, "y", { duration: reduce ? 0 : 0.5, ease: "power3" });
    addEventListener("mousemove", (e) => { qx(e.clientX); qy(e.clientY); }, { passive: true });
    // The original folds dots only over the header pill button (since the button flips to a white background) — over center links and prev/next buttons the dots stay as they are
    document.addEventListener("pointerover", (e) => {
      const t = e.target.closest ? e.target : document.body;
      cursor.classList.toggle("is-dot", !t.closest(".cg-pill"));
    });
  }

  // Page transition — for internal links, blur the body in .3s then navigate
  const page = document.querySelector(".cg-page");
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank") return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || (url.pathname === location.pathname && url.search === location.search)) return;
    e.preventDefault();
    if (!page || reduce) { location.href = url.href; return; }
    page.classList.add("is-leaving");
    setTimeout(() => { location.href = url.href; }, 300);
  });
  addEventListener("pageshow", (e) => { if (e.persisted && page) page.classList.remove("is-leaving"); });
})();
