// Sequencer — 7 rows × 16 cells. Click a cell to turn it on, and on play a blue outline passes the current cell at 145bpm sixteenth notes while active cells flash and sound (placeholder synth sound).
// Pressing a row name plays only that sound once. Swap four patterns, copy · paste · reset · clear all. With follow on, the grid pages along so the current cell never leaves the screen.
(() => {
  const A = (window.PG ||= {});
  const S = A.sound, grid = A.q("[data-grid]");
  if (!S || !grid) return;
  const rows = A.qa(".s-row[data-row]", grid);
  const cells = rows.map((r) => A.qa(".s-cell", r));
  const pats = [S.default.map((r) => r.slice()), ...[1, 2, 3].map((k) => S.default.map((r, i) => r.map((v, c) => ((c + k * 3 + i) % (k + 3) === 0 ? 1 : 0))))];
  let pat = 0, clip = null;
  const paint = () => cells.forEach((row, r) => row.forEach((c, i) => c.classList.toggle("is-on", !!S.grid[r][i])));
  const use = (i) => { pat = i; S.grid = pats[i]; A.qa("[data-pat]").forEach((b, n) => b.classList.toggle("is-on", n === i)); paint(); };
  cells.forEach((row, r) => row.forEach((c, i) => c.addEventListener("click", () => { S.grid[r][i] = S.grid[r][i] ? 0 : 1; paint(); if (S.grid[r][i]) S.audition(r); })));
  A.qa("[data-audition]").forEach((b) => b.addEventListener("click", () => S.audition(+b.dataset.audition)));
  A.qa("[data-pat]").forEach((b) => b.addEventListener("click", () => use(+b.dataset.pat)));
  A.qa("[data-kit]").forEach((b) => b.addEventListener("click", () => { A.qa("[data-kit]").forEach((x) => x.classList.toggle("is-on", x === b)); use(+b.dataset.kit % 4); }));
  A.q("[data-seq-play]").addEventListener("click", () => S.play());
  A.q("[data-seq-stop]").addEventListener("click", () => S.stop());
  A.q("[data-seq-clear]").addEventListener("click", () => { S.grid.forEach((r) => r.fill(0)); paint(); });
  A.q("[data-seq-reset]").addEventListener("click", () => { pats[0] = S.default.map((r) => r.slice()); use(0); });
  A.q("[data-seq-copy]").addEventListener("click", () => { clip = S.grid.map((r) => r.slice()); A.q("[data-seq-paste]").disabled = false; });
  A.q("[data-seq-paste]").addEventListener("click", () => { if (!clip) return; clip.forEach((r, i) => (S.grid[i] = r.slice())); pats[pat] = S.grid; paint(); });
  const follow = A.q("[data-seq-follow]");
  follow.addEventListener("click", () => follow.classList.toggle("is-on"));
  let last = -1;
  S.listeners.add((st) => {
    if (last >= 0) cells.forEach((row) => row[last].classList.remove("is-head", "is-hit"));
    if (st < 0) { last = -1; return; }
    cells.forEach((row, r) => { row[st].classList.add("is-head"); if (S.grid[r][st]) row[st].classList.add("is-hit"); });
    last = st;
    if (follow.classList.contains("is-on")) cells[0][st].scrollIntoView?.({ block: "nearest", inline: "nearest" });
  });
  use(0);
})();
