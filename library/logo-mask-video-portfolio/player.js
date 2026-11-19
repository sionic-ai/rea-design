// Video player plate — mimics the playback clock of a placeholder video (length data-length seconds). Click to play/pause, click the bar to jump to that spot, time reads 0:00 / 1:17.
// The cursor shows a play/pause icon over video (the original mouse-follower icon morph done as an icon swap).
window.RWPlayer = (root) => {
  const { $ } = RW;
  const p = $(".player", root);
  if (!p) return () => {};
  const len = Number(p.dataset.length || 77), media = $(".player__media", p), fill = $(".player__line i", p), time = $(".player__time", p), play = $("[data-play]", p);
  let t = 0, playing = !RW.reduce, raf = 0, last = 0;
  const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  const ICON = { play: "M5 3l9 5-9 5z", pause: "M4 3h3v10H4zM9 3h3v10H9z" };
  const paint = () => { fill.style.transform = `scaleX(${(t / len).toFixed(4)})`; time.textContent = `${fmt(t)} / ${fmt(len)}`; play.querySelector("path").setAttribute("d", playing ? ICON.pause : ICON.play); media.dataset.cursorIcon = playing ? "pause" : "play"; };
  const loop = (now) => { if (!last) last = now; t = (t + Math.max(1, now - last) / 1000) % len; last = now; paint(); raf = playing ? requestAnimationFrame(loop) : 0; };
  const toggle = () => { playing = !playing; last = 0; if (playing && !raf) raf = requestAnimationFrame(loop); paint(); RW.cursor?.setIcon(playing ? "pause" : "play"); };
  media.addEventListener("click", toggle);
  play.addEventListener("click", toggle);
  $(".player__line", p).addEventListener("click", (e) => { const r = e.currentTarget.getBoundingClientRect(); t = ((e.clientX - r.left) / r.width) * len; paint(); });
  $("[data-mute]", p)?.addEventListener("click", (e) => e.currentTarget.classList.toggle("is-on"));
  $("[data-full]", p)?.addEventListener("click", () => p.requestFullscreen?.().catch(() => {}));
  paint();
  if (playing) raf = requestAnimationFrame(loop);
  return () => cancelAnimationFrame(raf);
};
