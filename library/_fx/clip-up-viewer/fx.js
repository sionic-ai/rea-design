// Clicking a link opens that page in a panel (iframe) that covers the current page from the bottom up — the site stays where you were viewing,
// The cover peels away downward via ”Back”, Esc, or the browser back button. Only one panel is built per page and all links share it.
(() => {
  let view = null, users = 0, opener = null, pushed = false, hashNow = "";
  const lenis = () => window.lenis || window.__lenis;
  const ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function build() {
    const v = document.createElement("div");
    v.className = "fx-cuv";
    v.setAttribute("role", "dialog");
    v.setAttribute("aria-modal", "true");
    v.innerHTML = `<div class="fx-cuv__bar"><button class="fx-cuv__back" type="button">${ICON}<span></span></button><span class="fx-cuv__title"></span></div><div class="fx-cuv__body"><div class="fx-cuv__load" aria-hidden="true"><i></i></div><iframe class="fx-cuv__frame"></iframe></div>`;
    document.body.appendChild(v);
    const frame = v.querySelector("iframe"), back = v.querySelector(".fx-cuv__back");
    const ready = () => { v.classList.add("is-ready"); };
    const onLoad = () => {
      if (!frame.dataset.url) return;
      ready();
      try { frame.contentWindow.addEventListener("keydown", (e) => { if (e.key === "Escape") leave(); }); } catch (_) {}
    };
    const onKey = (e) => { if (e.key === "Escape" && v.classList.contains("is-open")) leave(); };
    const onPop = () => { if (v.classList.contains("is-open") && location.hash !== hashNow) { pushed = false; close(); } };
    frame.addEventListener("load", onLoad);
    back.addEventListener("click", leave);
    document.addEventListener("keydown", onKey);
    addEventListener("popstate", onPop);
    return { v, frame, back, title: v.querySelector(".fx-cuv__title"), label: back.querySelector("span"), off: () => { document.removeEventListener("keydown", onKey); removeEventListener("popstate", onPop); v.remove(); } };
  }

  function open(el, options) {
    const url = el.getAttribute("href");
    opener = el;
    view.title.textContent = options.title || el.textContent.trim().split("\n")[0];
    view.frame.title = view.title.textContent;
    view.label.textContent = options.back || "Back";
    view.v.style.setProperty("--fx-dur", `${+(options.dur ?? 0.7)}s`);
    if (options.ease) view.v.style.setProperty("--fx-ease", `cubic-bezier(${options.ease})`);
    else view.v.style.removeProperty("--fx-ease");
    if (view.frame.dataset.url !== url) {
      view.v.classList.remove("is-ready");
      if (view.frame.dataset.url) { try { view.frame.contentWindow.location.replace(new URL(url, location.href).href); } catch (_) { view.frame.src = url; } }
      else view.frame.src = url;
      view.frame.dataset.url = url;
      setTimeout(() => view && view.v.classList.add("is-ready"), 6000);
    }
    view.v.classList.add("is-open");
    document.documentElement.classList.add("fx-cuv-lock");
    lenis()?.stop?.();
    if (options.hash) {
      try { history.pushState({ fxCuv: 1 }, "", `#${options.hash}`); pushed = true; hashNow = location.hash; } catch (_) { pushed = false; }
    }
    view.back.focus({ preventScroll: true });
    el.dispatchEvent(new CustomEvent("fx:open", { bubbles: true }));
  }
  function close() {
    if (!view || !view.v.classList.contains("is-open")) return;
    view.v.classList.remove("is-open");
    document.documentElement.classList.remove("fx-cuv-lock");
    lenis()?.start?.();
    hashNow = "";
    if (opener) { opener.focus({ preventScroll: true }); opener.dispatchEvent(new CustomEvent("fx:close", { bubbles: true })); }
  }
  function leave() {
    if (pushed) { pushed = false; history.back(); }
    else close();
  }

  kfFx.register("clip-up-viewer", (el, { options }) => {
    if (!el.getAttribute("href")) return;
    users++;
    if (!view) view = build();
    let warmed = false;
    const warm = () => {
      if (warmed) return;
      warmed = true;
      const l = document.createElement("link");
      l.rel = "prefetch";
      l.href = el.getAttribute("href");
      document.head.appendChild(l);
    };
    const click = (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      open(el, options);
    };
    el.addEventListener("click", click);
    el.addEventListener("pointerenter", warm);
    el.addEventListener("focus", warm);
    return () => {
      el.removeEventListener("click", click);
      el.removeEventListener("pointerenter", warm);
      el.removeEventListener("focus", warm);
      if (opener === el) { close(); opener = null; }
      users--;
      if (!users && view) { view.off(); view = null; document.documentElement.classList.remove("fx-cuv-lock"); }
    };
  });
})();
