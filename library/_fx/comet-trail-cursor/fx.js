// A glowing dot cursor follows with a delay, trailing a comet tail that thins behind it — the tail is a ribbon that remembers the path only briefly, so when it stops it quickly shrinks to a single dot.
(() => {
  kfFx.register("comet-trail-cursor", (el, { options, reduce, hover }) => {
    if (reduce || !hover) return;
    const num = (k, d) => (options[k] === undefined || options[k] === "" ? d : +options[k]);
    const follow = num("lerp", 0.28), life = num("life", 150) || 1, width = num("width", 7.5), min = num("min", 1.5), blur = num("blur", 10);
    const canvas = document.createElement("canvas"), head = document.createElement("span");
    canvas.dataset.fxPart = "trail";
    head.dataset.fxPart = "head";
    el.append(canvas, head);
    const ctx = canvas.getContext("2d");
    if (!ctx) { canvas.remove(); head.remove(); return; }
    document.documentElement.classList.add("has-fx-cursor");

    let pr = 1;
    const size = () => {
      pr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = innerWidth * pr;
      canvas.height = innerHeight * pr;
      canvas.style.width = `${innerWidth}px`;
      canvas.style.height = `${innerHeight}px`;
    };
    size();
    addEventListener("resize", size);

    // The transparent at the tail end must be the head color made transparent — blending with plain transparent (transparent black) muddies the middle of the bright tail
    let solid = "", clear = "";
    const readInk = () => {
      const c = getComputedStyle(head).backgroundColor.match(/[\d.]+/g) || ["255", "255", "255"];
      solid = `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
      clear = `rgba(${c[0]}, ${c[1]}, ${c[2]}, 0)`;
    };
    readInk();

    const pts = [], target = { x: 0, y: 0 }, cur = { x: 0, y: 0 };
    let seen = false, raf = 0;
    const onMove = (e) => {
      target.x = e.clientX;
      target.y = e.clientY;
      if (!seen) { seen = true; cur.x = target.x; cur.y = target.y; pts.length = 0; readInk(); }
      el.classList.add("is-on");
    };
    const onOver = (e) => el.classList.toggle("is-hover", !!e.target?.closest?.("a, button, [data-cursor], label, summary"));
    const onLeave = () => el.classList.remove("is-on");

    const draw = (now) => {
      raf = requestAnimationFrame(draw);
      cur.x += (target.x - cur.x) * follow;
      cur.y += (target.y - cur.y) * follow;
      head.style.transform = `translate3d(${cur.x}px, ${cur.y}px, 0)`;
      const lastPt = pts[pts.length - 1];
      if (seen && (!lastPt || Math.hypot(cur.x - lastPt.x, cur.y - lastPt.y) >= min)) pts.push({ x: cur.x, y: cur.y, t: now });
      while (pts.length && now - pts[0].t > life) pts.shift();
      ctx.setTransform(pr, 0, 0, pr, 0, 0);
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      if (pts.length < 3) return;
      const n = pts.length, left = [], right = [];
      for (let i = 0; i < n; i++) {
        const p = pts[i], a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
        let dx = b.x - a.x, dy = b.y - a.y;
        const d = Math.hypot(dx, dy) || 1;
        dx /= d; dy /= d;
        const half = (min + width * Math.min(1, Math.max(0, 1 - (now - p.t) / life))) / 2;
        left.push([p.x - dy * half, p.y + dx * half]);
        right.push([p.x + dy * half, p.y - dx * half]);
      }
      const g = ctx.createLinearGradient(pts[0].x, pts[0].y, pts[n - 1].x, pts[n - 1].y);
      g.addColorStop(0, clear);
      g.addColorStop(1, solid);
      ctx.beginPath();
      ctx.moveTo(left[0][0], left[0][1]);
      for (let i = 1; i < n; i++) ctx.lineTo(left[i][0], left[i][1]);
      for (let i = n - 1; i >= 0; i--) ctx.lineTo(right[i][0], right[i][1]);
      ctx.closePath();
      ctx.fillStyle = g;
      ctx.shadowColor = solid;
      ctx.shadowBlur = blur;
      ctx.fill();
      ctx.shadowBlur = 0;
    };
    addEventListener("pointermove", onMove, { passive: true });
    addEventListener("pointerover", onOver, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("resize", size);
      removeEventListener("pointermove", onMove);
      removeEventListener("pointerover", onOver);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      el.classList.remove("is-on", "is-hover");
      canvas.remove();
      head.remove();
      if (!document.querySelector('[data-fx~="comet-trail-cursor"] > [data-fx-part="head"]')) document.documentElement.classList.remove("has-fx-cursor");
    };
  });
})();
