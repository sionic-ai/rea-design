// Spirit board — draws two arcs of letters (A–M, N–Z), a number row, yes/no and eyes, goodbye, a four-cornered skull and star
(() => {
  const svg = document.querySelector(".d-board__art");
  if (!svg) return;
  const NS = "http://www.w3.org/2000/svg";
  const el = (tag, attrs, text) => {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (text != null) n.textContent = text;
    svg.append(n);
    return n;
  };
  el("rect", { class: "db-frame", x: 10, y: 10, width: 880, height: 500, rx: 26 });
  el("rect", { class: "db-frame db-frame--in", x: 24, y: 24, width: 852, height: 472, rx: 18 });
  const arc = (letters, cx, cy, r, from, to) => {
    [...letters].forEach((ch, i) => {
      const a = from + ((to - from) * i) / (letters.length - 1);
      const x = cx + r * Math.cos(a), y = cy + r * Math.sin(a);
      el("text", { class: "db-glyph", x: x.toFixed(1), y: y.toFixed(1), "text-anchor": "middle", "dominant-baseline": "middle", transform: `rotate(${((a * 180) / Math.PI + 90).toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)})` }, ch);
    });
  };
  arc("ABCDEFGHIJKLM", 450, 470, 300, Math.PI * 1.13, Math.PI * 1.87);
  arc("NOPQRSTUVWXYZ", 450, 470, 220, Math.PI * 1.12, Math.PI * 1.88);
  el("text", { class: "db-glyph", x: 450, y: 368, "text-anchor": "middle" }, "1234567890");
  el("text", { class: "db-small", x: 450, y: 420, "text-anchor": "middle" }, "Hello");
  el("text", { class: "db-small", x: 360, y: 84, "text-anchor": "middle" }, "Example");
  el("text", { class: "db-small", x: 540, y: 84, "text-anchor": "middle" }, "No");
  el("path", { class: "db-mark", d: "M420 78 Q450 58 480 78 Q450 98 420 78Z" });
  el("circle", { class: "db-fill", cx: 450, cy: 78, r: 7 });
  const skull = (x, y) => {
    el("path", { class: "db-mark", d: `M${x} ${y - 26} c-18 0 -26 12 -26 26 c0 10 6 16 10 18 v12 h32 v-12 c4 -2 10 -8 10 -18 c0 -14 -8 -26 -26 -26z` });
    el("circle", { class: "db-fill", cx: x - 9, cy: y, r: 5 });
    el("circle", { class: "db-fill", cx: x + 9, cy: y, r: 5 });
  };
  skull(80, 80); skull(820, 80);
  const pent = (x, y, r) => {
    let d = "";
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI / 2 + (i * 4 * Math.PI) / 5;
      d += (i ? "L" : "M") + (x + r * Math.cos(a)).toFixed(1) + "," + (y + r * Math.sin(a)).toFixed(1);
    }
    el("circle", { class: "db-mark", cx: x, cy: y, r: r + 3 });
    el("path", { class: "db-mark", d: d + "Z" });
  };
  pent(70, 450, 16); pent(830, 450, 16);
})();
