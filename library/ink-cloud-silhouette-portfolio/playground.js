/* Playground: glass letters over ink (word panel of DG.ink), a drag panel pinned to the screen — cards drag or scroll across an endlessly continuing panel */
(() => {
  DG.page("playground", {
    mount(root) {
      const offs = [];
      const ink = DG.ink(root.querySelector(".pg__fluid"), { layout: 1, word: root.querySelector("[data-glass]") });
      if (ink) {
        if (DG.reduce) ink.st.reveal = 1;
        // In the original, the playground’s ink and text are all up within about .8s of opening
        else gsap.fromTo(ink.st, { reveal: 0.35 }, { reveal: 1, duration: 1, ease: "power1.inOut" });
        offs.push(() => ink.destroy());
      }
      DG.footer?.(root);
      const desc = root.querySelector(".pg__d");
      if (!DG.reduce) gsap.fromTo(desc, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.55, ease: "power1.inOut", delay: 0.25 });

      // Drag panel: lays several copies of the cards from the grid below, tiled like a checkerboard, and wraps to the opposite side past the end
      const sec = root.querySelector("[data-playground-drag]"), field = sec.querySelector("[data-playground-drag-canvas]"), pin = root.querySelector("#pgd-pin");
      const src = [...root.querySelectorAll(".pw__c")];
      const tiles = [];
      const COLS = 5, ROWS = 4;
      for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
        const s = src[(r * COLS + c + r) % src.length], t = document.createElement("div");
        t.className = "pgd__tile"; t.dataset.tone = s.dataset.tone; t.append(s.firstElementChild.cloneNode(true)); field.append(t); tiles.push({ el: t, c, r });
      }
      let tw = 1, th = 1, gap = 16;
      const layout = () => { const w = sec.clientWidth; tw = Math.max(220, w * 0.3); th = tw * 0.66; gap = Math.max(10, w * 0.012); tiles.forEach((t) => { t.el.style.width = `${tw}px`; t.el.style.height = `${th}px`; }); };
      layout(); const ro = new ResizeObserver(layout); ro.observe(sec); offs.push(() => ro.disconnect());
      const st = { x: 0, y: 0, vx: 0, vy: 0, drag: false, lx: 0, ly: 0, scroll: 0 };
      const down = (e) => { if (e.pointerType === "touch") return; st.drag = true; st.lx = e.clientX; st.ly = e.clientY; st.vx = st.vy = 0; sec.classList.add("is-drag"); sec.setPointerCapture(e.pointerId); };
      const move = (e) => { if (!st.drag) return; const dx = e.clientX - st.lx, dy = e.clientY - st.ly; st.lx = e.clientX; st.ly = e.clientY; st.x += dx; st.y += dy; st.vx = dx; st.vy = dy; };
      const up = () => { st.drag = false; sec.classList.remove("is-drag"); };
      sec.addEventListener("pointerdown", down); sec.addEventListener("pointermove", move); sec.addEventListener("pointerup", up); sec.addEventListener("pointercancel", up);
      offs.push(() => { sec.removeEventListener("pointerdown", down); sec.removeEventListener("pointermove", move); sec.removeEventListener("pointerup", up); sec.removeEventListener("pointercancel", up); });
      // Drag cursor: a single one attached to the document, follows the pointer anywhere on screen in .35s (power3), and grows only over the drag panel (.4s in · .25s out)
      if (matchMedia("(hover: hover) and (pointer: fine)").matches) {
        const cur = document.createElement("div"); cur.className = "drag-cursor"; cur.setAttribute("aria-hidden", "true");
        cur.innerHTML = `<span class="drag-cursor__inner">${sec.querySelector("[data-playground-drag-hint]")?.textContent.trim() || ""}</span>`;
        document.body.append(cur); gsap.set(cur, { scale: 0 });
        const qx = gsap.quickTo(cur, "x", { duration: 0.35, ease: "power3" }), qy = gsap.quickTo(cur, "y", { duration: 0.35, ease: "power3" });
        let shown = false;
        const follow = (e) => {
          qx(e.clientX); qy(e.clientY);
          const r = sec.getBoundingClientRect(), on = e.clientY >= r.top && e.clientY <= r.bottom && !e.target.closest("a, button, input, textarea, select");
          if (on !== shown) { shown = on; gsap.to(cur, { scale: on ? 1 : 0, duration: DG.reduce ? 0 : on ? 0.4 : 0.25, ease: on ? "power3.out" : "power2.in", overwrite: "auto" }); }
        };
        addEventListener("pointermove", follow);
        offs.push(() => { removeEventListener("pointermove", follow); cur.remove(); });
      }

      let raf = 0;
      const tick = () => {
        raf = requestAnimationFrame(tick);
        if (!st.drag && !DG.reduce) { st.x += st.vx; st.y += st.vy; st.vx *= 0.92; st.vy *= 0.92; }
        const p = Math.min(1, Math.max(0, (DG.y() - DG.top(pin)) / Math.max(1, pin.offsetHeight - innerHeight)));
        st.scroll += (p * th * 3 - st.scroll) * 0.1;
        const cw = tw + gap, chh = th + gap, spanX = COLS * cw, spanY = ROWS * chh;
        tiles.forEach((t) => {
          const off = t.r % 2 ? cw * 0.5 : 0;
          let x = (t.c * cw + off + st.x) % spanX, y = (t.r * chh + st.y - st.scroll) % spanY;
          if (x < -cw) x += spanX; if (y < -chh) y += spanY;
          t.el.style.transform = `translate3d(${x - cw * 0.5}px, ${y - chh * 0.5}px, 0)`;
        });
      };
      raf = requestAnimationFrame(tick);
      offs.push(() => cancelAnimationFrame(raf));
      return () => offs.forEach((f) => f());
    },
  });
})();
