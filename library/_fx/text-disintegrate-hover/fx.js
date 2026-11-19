// On hover the text is erased from one end and powder grains scatter from the erasing line, and when fully erased it re-forms from a blur.
// The wipe pushes the window (outer) and the text (inner) in opposite directions by the same amount, keeping the text in place while only the window edge passes over it.
(() => {
  const inOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  kfFx.register("text-disintegrate-hover", (el, { options, reduce, hover }) => {
    const text = el.querySelector('[data-fx-part="text"]');
    if (!text || reduce || !hover) return;
    const num = (k, d) => (options[k] === undefined || options[k] === "" ? d : +options[k]);
    const dir = ["left", "right", "top", "bottom"].includes(options.direction) ? options.direction : "left";
    const duration = num("duration", 500) || 1, amount = num("amount", 3), swing = num("swing", 50), pad = num("pad", 60), rest = num("rest", 1000);
    const flat = dir === "left" || dir === "right", lead = dir === "left" || dir === "top";

    const holder = document.createElement("span"), win = document.createElement("span"), dust = document.createElement("canvas");
    holder.dataset.fxPart = "holder";
    win.dataset.fxPart = "window";
    dust.dataset.fxPart = "dust";
    dust.setAttribute("aria-hidden", "true");
    text.replaceWith(holder);
    win.appendChild(text);
    holder.append(win, dust);
    const ctx = dust.getContext("2d");

    const shift = (p) => {
      const axis = flat ? "translateX" : "translateY", s = lead ? p : -p;
      win.style.transform = p === 0 ? "" : `${axis}(${s}%)`;
      text.style.transform = p === 0 ? "" : `${axis}(${-s}%)`;
    };
    let raf = 0, busy = false, doneAt = 0, timer = 0;
    const run = () => {
      if (busy || Date.now() - doneAt < rest || !ctx) return;
      busy = true;
      const box = win.getBoundingClientRect();
      dust.width = box.width + pad * 2;
      dust.height = box.height + pad * 2;
      const color = getComputedStyle(text).color;
      const life = (60 * duration) / 1000;
      const bits = [];
      let prev = 0, ended = false;
      const t0 = performance.now();
      const frame = (now) => {
        const k = Math.min((now - t0) / duration, 1);
        const p = 101 * inOutCubic(k);
        if (!ended) shift(p);
        if (k < 1) {
          const f = p / 100, df = f - prev;
          prev = f;
          const edge = (flat ? box.width : box.height) * f + 100 * df;
          let x = pad, y = pad;
          if (flat) x += lead ? edge : box.width - edge;
          else y += lead ? edge : box.height - edge;
          for (let c = Math.floor(amount * (100 * df + 1)); c > 0; c--) {
            bits.push({
              sx: x + (flat ? 0 : box.width * Math.random()), sy: y + (flat ? box.height * Math.random() : 0),
              x: 0, y: 0, ang: Math.random() * 360 - 180, n: 0, life: 0, death: life - 20 + 40 * Math.random(),
              v: Math.random() * 4 - 2, r: Math.floor(Math.random() * 3) + 1,
            });
          }
        }
        ctx.clearRect(0, 0, dust.width, dust.height);
        ctx.fillStyle = color;
        for (let i = bits.length - 1; i >= 0; i--) {
          const b = bits[i];
          if (b.life > b.death) { bits.splice(i, 1); continue; }
          b.x += b.v;
          b.y = swing * Math.sin((b.n * Math.PI * 2) / 100);
          b.life++;
          b.n++;
          ctx.save();
          ctx.translate(b.sx, b.sy);
          ctx.rotate((b.ang * Math.PI) / 180);
          ctx.globalAlpha = Math.max(0, 1 - b.life / b.death);
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
        if (k >= 1 && !ended) {
          ended = true;
          win.style.transition = "none";
          shift(0);
          win.style.opacity = "0";
          win.style.filter = "blur(10px)";
          void win.offsetWidth;
          win.style.transition = "";
          win.style.opacity = "";
          win.style.filter = "";
          timer = setTimeout(() => { doneAt = Date.now(); }, 400);
        }
        if (k < 1 || bits.length) raf = requestAnimationFrame(frame);
        else { raf = 0; busy = false; }
      };
      raf = requestAnimationFrame(frame);
    };
    el.addEventListener("pointerenter", run);

    return () => {
      el.removeEventListener("pointerenter", run);
      cancelAnimationFrame(raf);
      clearTimeout(timer);
      shift(0);
      win.style.cssText = "";
      holder.replaceWith(text);
    };
  });
})();
