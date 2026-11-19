// First-visit loading — on a white board a line-drawn bird flaps (two poses every 140ms) and flies in an arc from bottom left to top right, with the name written below one character at a time.
// The original showed a GIF of the same tempo (5.18s) and cleared the panel in 1s after 5s. From the second visit in the same tab the panel isn’t shown at all (sessionStorage)
(() => {
  const NS = "http://www.w3.org/2000/svg";
  const UP = "M0 0c8-4 14-12 22-26 6-10 16-16 30-20-8 8-14 18-20 30-6 10-14 16-26 18M4 2c6 2 12 2 18-1M22-26c4 0 8 2 10 4M30-8c4-1 8 0 11 2";
  const DOWN = "M0 0c10 2 22 0 34-6 10-5 22-6 34-2-12 2-22 6-30 12-10 7-24 8-38 2M-8-2c-4-2-8-6-10-10M40-4c4 2 10 2 14 0";
  const BODY = "M-14-4c6-2 12-2 18 0 6 2 12 2 16-2-2 6-8 9-16 9-6 0-12-3-18-7zM-14-4l-6-2 5 5";
  kfFx.register("bird-type-loader", (el, { options, reduce }) => {
    const name = String(options.text ?? el.getAttribute("aria-label") ?? "").trim();
    const key = options.key || "fx-bird-type-loader";
    const once = options.once !== "always";
    const done = () => el.dispatchEvent(new CustomEvent("fx:done", { bubbles: true }));
    // file:// has separate sessionStorage per document, so also write to window.name, which remembers the same tab
    const seen = sessionStorage.getItem(key) || window.name.split(" ").includes(key);
    if (reduce || (once && seen)) { el.classList.add("fx-none"); done(); return () => el.classList.remove("fx-none"); }
    if (once) { sessionStorage.setItem(key, "1"); window.name = `${window.name} ${key}`.trim(); }
    const anim = +(options.dur ?? 5.18) * 1000, hold = +(options.hold ?? 5) * 1000, fade = +(options.fade ?? 1);
    el.style.setProperty("--fx-fade", `${fade}s`);
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 457 407");
    svg.setAttribute("class", "fx-btl-svg");
    svg.setAttribute("aria-hidden", "true");
    svg.innerHTML = `<g class="fx-btl-fly"><g class="fx-btl-bird"><path class="fx-btl-up" d="${UP}"/><path class="fx-btl-down" d="${DOWN}"/><path d="${BODY}"/></g></g><text class="fx-btl-name" x="40" y="370"></text>`;
    el.append(svg);
    const fly = svg.querySelector(".fx-btl-fly"), text = svg.querySelector(".fx-btl-name");
    el.classList.add("fx-show");
    const t0 = performance.now();
    let raf = 0;
    const step = (now) => {
      const t = Math.min(1, (now - t0) / anim);
      const x = 70 + t * 330, y = 250 - Math.sin(t * Math.PI * 1.6) * 110 - t * 60;
      fly.setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${(1.4 + t * 0.6).toFixed(2)})`);
      el.classList.toggle("fx-flap", Math.floor(now / 140) % 2 === 0);
      text.textContent = name.slice(0, Math.min(name.length, Math.floor(t * 1.35 * name.length)));
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    const timer = setTimeout(() => { el.classList.remove("fx-show"); setTimeout(done, fade * 1000); }, hold);
    return () => { cancelAnimationFrame(raf); clearTimeout(timer); svg.remove(); el.classList.remove("fx-show", "fx-flap", "fx-none"); };
  });
})();
