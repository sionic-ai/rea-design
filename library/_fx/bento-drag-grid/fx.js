// As in the original, layout is left to react-grid-layout (MIT) — imitating the feel of the placeholder while dragging, pushing away and filling upward (vertical compaction) by hand would feel different.
// Cards keep the author’s HTML as-is and are only moved into the cells RGL creates. React doesn’t touch children it doesn’t know.
(() => {
  kfFx.register("bento-drag-grid", (el, { options, reduce, hover }) => {
    const R = window.React, RD = window.ReactDOM, RGL = window.ReactGridLayout;
    const items = [...el.children].filter((n) => n.getAttribute("data-fx-part") === "item" && n.dataset.key);
    const src = [...el.children].find((n) => n.getAttribute("data-fx-part") === "layouts");
    if (!R || !RD || !RGL || !items.length || !src) return;
    let layouts;
    try { layouts = JSON.parse(src.textContent); } catch { return; }

    const list = (v, d) => String(v ?? d).split(",").map((x) => +x);
    const names = ["lg", "md", "sm", "xs"];
    const breaks = list(options.breaks, "1199,799,374,319");
    const cols = list(options.cols, "4,4,2,2");
    const rows = list(options.rows, "280,180,164,136");
    const gap = +(options.gap ?? 16);
    const dur = +(options.dur ?? 0.5);
    const dim = +(options.dim ?? 0.25);
    const bp = {}, cl = {}, rh = {};
    names.forEach((n, i) => {
      bp[n] = breaks[i] ?? 0;
      cl[n] = cols[i] || cols[cols.length - 1] || 1;
      rh[n] = rows[i] || rows[rows.length - 1] || 100;
    });

    const Grid = RGL.WidthProvider(RGL.Responsive);
    const stage = document.createElement("div");
    stage.className = "fx-bento-stage";
    el.append(stage);
    el.classList.add("is-fx-bento");
    // On the first draw (WidthProvider draws once at 1280 then redraws at the real width) set 0 so the shift isn’t visible — the original also turned it on after .5s
    el.style.setProperty("--fx-dur", "0ms");
    const on = reduce ? null : setTimeout(() => el.style.setProperty("--fx-dur", `${dur}s`), 500);

    const refs = new Map(items.map((it) => [it.dataset.key, (node) => { if (node && it.parentNode !== node) node.append(it); }]));
    let filter = el.dataset.filter || options.filter || "all";
    let now = null;
    const tagged = (it) => filter === "all" || (it.dataset.tags || "").split(/\s+/).includes(filter);

    let alive = true;
    const render = () => {
      if (!alive) return;
      const lay = layouts[filter] || layouts.all || Object.values(layouts)[0];
      RD.render(
        R.createElement(Grid, {
          className: "layout",
          layouts: lay,
          breakpoints: bp,
          cols: cl,
          rowHeight: rh[now || "lg"],
          margin: [gap, gap],
          isBounded: true,
          isResizable: false,
          isDraggable: hover && options.drag !== "off",
          draggableCancel: options.cancel || undefined,
          useCSSTransforms: false,
          // Called while RGL is finishing its update (componentDidUpdate) — don’t redraw inside it, defer by one tick
          onBreakpointChange: (n) => { now = n; queueMicrotask(render); el.dispatchEvent(new CustomEvent("fx:breakpoint", { detail: { name: n } })); },
        }, items.map((it) => R.createElement("div", {
          key: it.dataset.key,
          ref: refs.get(it.dataset.key),
          className: tagged(it) ? "is-fx-on" : "is-fx-dim",
          style: { opacity: tagged(it) ? 1 : dim },
        }))),
        stage,
      );
    };
    render();

    const pick = (name) => {
      if (!name || name === filter) return;
      filter = name;
      render();
    };
    const onFilter = (e) => pick(String(e.detail?.name ?? e.detail ?? "all").toLowerCase());
    el.addEventListener("fx:filter", onFilter);
    const mo = new MutationObserver(() => pick(el.dataset.filter || "all"));
    mo.observe(el, { attributes: true, attributeFilter: ["data-filter"] });

    return () => {
      alive = false;
      clearTimeout(on);
      mo.disconnect();
      el.removeEventListener("fx:filter", onFilter);
      items.forEach((it) => el.insertBefore(it, stage));
      RD.unmountComponentAtNode(stage);
      stage.remove();
      el.classList.remove("is-fx-bento");
      el.style.removeProperty("--fx-dur");
    };
  });
})();
