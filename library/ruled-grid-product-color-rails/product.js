/* Product detail — pressing a photo cell grows it to 2×2 (moved to an even slot so it uses both columns) and smooth-scrolls to the panel center, pressing again returns it. 
   Tapping the video tile enlarges it and plays, tapping again pauses. Every two panels, an accent-color scroll bar sits on the right edge of that panel (original fkZoom · fk-sb) */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const sp = matchMedia("(max-width: 749px)");
  const grid = $(".k-pg");
  if (grid) {
    const order = [...grid.children];
    const restore = () => order.forEach((el) => grid.append(el));
    const clear = () => { $$(".k-pcell.zoom", grid).forEach((z) => z.classList.remove("zoom")); $$("video", grid).forEach((v) => v.pause()); restore(); };
    const zoom = (c) => {
      clear();
      c.classList.add("zoom");
      const flow = [...grid.children].filter((x) => !x.classList.contains("full"));
      if (flow.indexOf(c) % 2 === 1) {
        const p = c.previousElementSibling;
        if (p && !p.classList.contains("full") && !p.classList.contains("zoom")) grid.insertBefore(c, p);
      }
      const col = c.closest(".k-pcol");
      if (col && !sp.matches) requestAnimationFrame(() => {
        const cr = c.getBoundingClientRect(), kr = col.getBoundingClientRect();
        col.scrollTo({ top: col.scrollTop + (cr.top - kr.top) - (col.clientHeight - cr.height) / 2, behavior: "smooth" });
      });
    };
    $$(".k-pcell:not(.full) .k-im:not(.k-pvid)", grid).forEach((im) => im.addEventListener("click", () => {
      const c = im.closest(".k-pcell");
      if (c.classList.contains("zoom")) { c.classList.remove("zoom"); restore(); return; }
      zoom(c);
    }));
    $$(".k-pvid", grid).forEach((im) => {
      const c = im.closest(".k-pcell"), vid = $("video", im);
      im.addEventListener("click", () => {
        const on = !c.classList.contains("playing");
        c.classList.toggle("playing", on);
        if (on) { zoom(c); vid?.play().catch(() => {}); }
        else { vid?.pause(); c.classList.remove("zoom"); restore(); }
      });
    });
  }

  const pdp = $(".k-pdp");
  if (pdp) $$(".k-pcol", pdp).forEach((pane) => {
    const bar = document.createElement("div"), thumb = document.createElement("div");
    bar.className = "k-sb";
    thumb.className = "k-sbt";
    bar.append(thumb);
    pdp.append(bar);
    const place = () => {
      const sh = pane.scrollHeight, ch = pane.clientHeight;
      if (sp.matches || sh <= ch + 2) { bar.style.display = "none"; return; }
      const pr = pane.getBoundingClientRect(), dr = pdp.getBoundingClientRect();
      bar.style.display = "block";
      bar.style.top = `${pr.top - dr.top}px`;
      bar.style.left = `${pr.right - dr.left - 9}px`;
      bar.style.height = `${ch}px`;
      const h = Math.max(40, (ch * ch) / sh);
      thumb.style.height = `${h}px`;
      thumb.style.transform = `translateY(${(pane.scrollTop / (sh - ch)) * (ch - h)}px)`;
    };
    pane.addEventListener("scroll", place, { passive: true });
    addEventListener("resize", place);
    new ResizeObserver(place).observe(pane.firstElementChild || pane);
    let drag = null;
    thumb.addEventListener("pointerdown", (e) => { drag = { y: e.clientY, top: pane.scrollTop }; thumb.setPointerCapture(e.pointerId); });
    thumb.addEventListener("pointermove", (e) => {
      if (!drag) return;
      const ch = pane.clientHeight, sh = pane.scrollHeight, h = thumb.offsetHeight;
      pane.scrollTop = drag.top + ((e.clientY - drag.y) * (sh - ch)) / (ch - h);
    });
    thumb.addEventListener("pointerup", () => (drag = null));
    place();
  });

  $$(".k-vbtn:not(:disabled)").forEach((b) => b.addEventListener("click", () => { $$(".k-vbtn").forEach((x) => x.classList.toggle("act", x === b)); }));
  $$(".k-lbtn").forEach((b) => b.addEventListener("click", () => { $$(".k-lbtn").forEach((x) => x.classList.toggle("act", x === b)); }));
  const q = $(".k-qty input");
  $$(".k-qty button").forEach((b) => b.addEventListener("click", () => {
    q.value = Math.min(9, Math.max(1, (parseInt(q.value, 10) || 1) + +b.dataset.q));
    $$(".k-qty button").forEach((x) => (x.disabled = (+x.dataset.q < 0 && +q.value <= 1) || (+x.dataset.q > 0 && +q.value >= 9)));
  }));
})();
