(() => {
  // Splits a scene (a front and back image pair) into several cells, flips each cell half a turn around the Y axis in sequence, then after a rest each cell folds 90° and the next scene unfolds.
  // Only the hovered cell flips and returns shortly after. Each cell holds the same whole image, shifted by its own position to show its part.
  kfFx.register("tile-flip-grid", (el, { options, reduce, hover }) => {
    const scenes = [...el.children].filter((c) => c.getAttribute("data-fx-part") === "scene");
    if (!scenes.length) return;
    const cols = Math.max(1, +options.cols || 5), rows = Math.max(1, +options.rows || 4);
    const wait = +(options.wait ?? 5) * 1000, hold = +(options.hold ?? 5) * 1000;
    const flip = +(options.flip ?? 0.8), each = +(options.each ?? 0.1), turn = +(options.turn ?? 0.34), step = +(options.step ?? 0.04), back = +(options.back ?? 0.125) * 1000;
    const face = (scene, part) => [...scene.children].find((c) => c.getAttribute("data-fx-part") === part);
    const built = scenes.map((scene) => {
      const grid = document.createElement("div");
      grid.setAttribute("data-fx-part", "grid");
      grid.style.setProperty("--fx-cols", cols);
      grid.style.setProperty("--fx-rows", rows);
      const tiles = [];
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        const tile = document.createElement("div");
        tile.setAttribute("data-fx-part", "tile");
        for (const side of ["front", "back"]) {
          const src = face(scene, side) || face(scene, "front");
          const f = document.createElement("div");
          f.setAttribute("data-fx-part", side === "front" ? "face-front" : "face-back");
          if (src) {
            const copy = src.cloneNode(true);
            copy.removeAttribute("data-fx-part");
            copy.setAttribute("data-fx-part", "slice");
            copy.style.cssText += `;width:${cols * 100}%;height:${rows * 100}%;left:${-c * 100}%;top:${-r * 100}%`;
            f.append(copy);
          }
          tile.append(f);
        }
        grid.append(tile);
        tiles.push(tile);
      }
      scene.append(grid);
      return { scene, grid, tiles };
    });
    const faces = (t) => [t.children[0], t.children[1]];
    let cur = 0, flipT = 0, slideT = 0, busy = false, flipping = false;
    const hovering = new Set();
    built.forEach((b, i) => b.scene.toggleAttribute("data-on", i === 0));
    const reset = (b) => b.tiles.forEach((t) => { const [f, k] = faces(t); gsap.killTweensOf([f, k, t]); gsap.set(f, { rotationY: 0 }); gsap.set(k, { rotationY: 180 }); gsap.set(t, { rotationY: 0 }); t.removeAttribute("data-flipped"); });
    built.forEach(reset);
    if (reduce) return () => { built.forEach((b) => b.grid.remove()); scenes.forEach((s) => s.removeAttribute("data-on")); };

    function flipAll() {
      const b = built[cur];
      flipping = true;
      let done = 0;
      b.tiles.forEach((t, i) => {
        const [f, k] = faces(t);
        gsap.killTweensOf([f, k]);
        hovering.delete(t);
        gsap.to(f, { rotationY: 180, duration: flip, delay: i * each, ease: "power2.inOut" });
        gsap.to(k, { rotationY: 0, duration: flip, delay: i * each, ease: "power2.inOut", onComplete: () => { if (++done === b.tiles.length) { flipping = false; slideT = setTimeout(() => go(cur + 1), hold); } } });
        t.setAttribute("data-flipped", "");
      });
    }
    function go(n) {
      const next = (n + built.length) % built.length;
      if (next === cur || busy || built.length < 2) return;
      clearTimeout(flipT); clearTimeout(slideT);
      busy = true;
      const A = built[cur], B = built[next];
      reset(B);
      B.scene.setAttribute("data-next", "");
      gsap.set(B.tiles, { rotationY: -90 });
      const tl = gsap.timeline({ onComplete: () => {
        A.scene.removeAttribute("data-on"); B.scene.removeAttribute("data-next"); B.scene.setAttribute("data-on", "");
        reset(A); cur = next; busy = false;
        el.dispatchEvent(new CustomEvent("fx:scene", { detail: { index: cur } }));
        flipT = setTimeout(flipAll, wait);
      } });
      A.tiles.forEach((t, i) => {
        tl.to(t, { rotationY: 90, duration: turn, ease: "power2.in" }, step * i);
        if (B.tiles[i]) tl.to(B.tiles[i], { rotationY: 0, duration: turn, ease: "power2.out" }, step * i + turn);
      });
    }
    const onGo = (e) => go(e.detail?.index ?? cur + 1);
    el.addEventListener("fx:go", onGo);
    flipT = setTimeout(flipAll, wait);

    const offs = [];
    if (hover) built.forEach((b) => b.tiles.forEach((t) => {
      const on = () => {
        if (busy || flipping || hovering.has(t) || !b.scene.hasAttribute("data-on")) return;
        hovering.add(t);
        const [f, k] = faces(t), was = t.hasAttribute("data-flipped");
        const there = was ? [0, -180] : [180, 0], home = was ? [180, 0] : [0, -180];
        gsap.to(f, { rotationY: there[0], duration: flip, ease: "power2.inOut" });
        gsap.to(k, { rotationY: there[1], duration: flip, ease: "power2.inOut", onComplete: () => {
          setTimeout(() => {
            if (busy || flipping) { hovering.delete(t); return; }
            gsap.to(f, { rotationY: home[0], duration: flip, ease: "power2.inOut" });
            gsap.to(k, { rotationY: home[1], duration: flip, ease: "power2.inOut", onComplete: () => hovering.delete(t) });
          }, back);
        } });
      };
      t.addEventListener("pointerenter", on);
      offs.push(() => t.removeEventListener("pointerenter", on));
    }));
    return () => {
      clearTimeout(flipT); clearTimeout(slideT);
      el.removeEventListener("fx:go", onGo);
      offs.forEach((f) => f());
      built.forEach((b) => { b.tiles.forEach((t) => gsap.killTweensOf([t, ...faces(t)])); b.grid.remove(); b.scene.removeAttribute("data-on"); b.scene.removeAttribute("data-next"); });
    };
  });
})();
