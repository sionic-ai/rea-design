// Builds a table of contents from the article headings, and like a calendar’s ”now” line, a red line moves down the TOC row of the section being read by that section’s progress.
// The contents panel scrolls along so the line stays centered, and when the text ends the line drops 6px and vanishes (.2s).
(() => {
  kfFx.register("toc-now-line", (el, { options }) => {
    const box = el.querySelector('[data-fx-part="scroll"]');
    const line = el.querySelector('[data-fx-part="line"]');
    const list = el.querySelector('[data-fx-part="list"]');
    const body = (options.body && el.querySelector(options.body)) || el;
    const heads = [...body.querySelectorAll(options.heads || "h2")];
    if (!box || !list || !heads.length) return;
    const at = +(options.at ?? 0);
    list.innerHTML = "";
    const items = heads.map((h, i) => {
      const it = document.createElement("div");
      it.setAttribute("data-fx-part", "item");
      it.setAttribute("role", "button");
      it.tabIndex = 0;
      it.textContent = h.textContent;
      const go = () => window.scrollTo({ top: h.getBoundingClientRect().top + scrollY - at + 1, behavior: "smooth" });
      it.addEventListener("click", go);
      it.addEventListener("keydown", (e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), go()));
      list.append(it);
      return it;
    });
    let raf = 0, last = -1;
    const update = () => {
      raf = 0;
      const tops = heads.map((h) => h.getBoundingClientRect().top - at);
      let idx = -1;
      tops.forEach((t, i) => { if (t <= 0) idx = i; });
      const endRect = body.getBoundingClientRect();
      const end = endRect.bottom - at;
      let prog = 0;
      if (idx >= 0) {
        const next = idx + 1 < tops.length ? tops[idx + 1] : end;
        const span = next - tops[idx];
        prog = span > 0 ? Math.min(1, Math.max(0, -tops[idx] / span)) : 0;
      }
      const done = endRect.bottom < innerHeight;
      const total = idx < 0 ? 0 : (idx + prog) / heads.length;
      const cur = Math.max(0, idx);
      if (cur !== last) {
        items.forEach((x, i) => x.classList.toggle("is-fx-on", i === cur && idx >= 0));
        last = cur;
      }
      if (line) {
        const it = items[cur];
        const y = it.offsetTop + it.clientHeight * (idx < 0 ? 0 : prog);
        line.style.top = y + "px";
        line.style.opacity = done || total === 0 ? "0" : "1";
        line.style.transform = done ? "translateY(6px)" : "translateY(0px)";
        box.scrollTo({ top: y - box.clientHeight / 2 });
      }
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    update();
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
      list.innerHTML = "";
    };
  });
})();
