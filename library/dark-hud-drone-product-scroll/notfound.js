// Missing address (404) — the original is a single static image of jagged, tape-stuck lettering, so for each strip we pick one offset within ±0.9vw and render that texture with our own text
(() => {
  const bands = [...document.querySelectorAll(".zk-404__band")];
  let seed = 11;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  bands.forEach((b, i) => { b.style.setProperty("--i", i); b.style.transform = `translateX(${((rnd() - 0.5) * 1.8).toFixed(2)}vw)`; });
  const bars = document.querySelector(".zk-404__bars");
  for (let i = 0; i < 18; i++) { const s = document.createElement("i"); s.style.width = `${(0.2 + rnd() * 1.6).toFixed(2)}rem`; bars.appendChild(s); }
})();
