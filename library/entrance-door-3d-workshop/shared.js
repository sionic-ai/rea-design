// Shared across pages: reading skin variable colors (for 3D and canvas), transition curtain (cover → move on → lift).
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  const EASE = "cubic-bezier(.76,0,.24,1)";
  const KEY = "brand-curtain";

  // Relative color (oklch from) can’t be resolved with getPropertyValue, so resolve it via a hidden element’s color, paint it on one canvas pixel and read it back as sRGB
  const probe = document.createElement("i");
  probe.hidden = true;
  document.documentElement.appendChild(probe);
  const dot = document.createElement("canvas");
  dot.width = dot.height = 1;
  const dx = dot.getContext("2d", { willReadFrequently: true });
  const css = (name) => {
    probe.style.color = `var(${name})`;
    const c = getComputedStyle(probe).color;
    probe.style.color = "";
    return c;
  };
  const rgb = (name) => {
    dx.clearRect(0, 0, 1, 1);
    dx.fillStyle = css(name);
    dx.fillRect(0, 0, 1, 1);
    const d = dx.getImageData(0, 0, 1, 1).data;
    return [d[0] / 255, d[1] / 255, d[2] / 255];
  };
  const font = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

  const curtain = document.createElement("div");
  curtain.className = "page-curtain";
  curtain.dataset.phase = "idle";
  curtain.setAttribute("aria-hidden", "true");
  document.body.appendChild(curtain);
  const status = document.createElement("span");
  status.className = "sr-only";
  status.setAttribute("role", "status");
  document.body.appendChild(status);
  const content = document.querySelector(".page-content");

  let anim = null;
  const setPhase = (p) => {
    curtain.dataset.phase = p;
    const busy = p !== "idle";
    if (content) { content.inert = busy; content.setAttribute("aria-busy", String(busy)); }
    status.textContent = busy ? "Opening…" : "";
  };

  // The original picks randomly from a CMS curtain-color list, but the list isn’t in the archive — only the first confirmed value (cobalt) is kept. To add colors, put the data-tint name in this list
  const TINTS = [""];
  function go(href) {
    const url = new URL(href, location.href);
    if (url.pathname === location.pathname) { location.hash = url.hash; return; }
    const tint = TINTS[Math.floor(Math.random() * TINTS.length)];
    curtain.dataset.tint = tint;
    setPhase("covering");
    anim?.cancel();
    anim = curtain.animate([{ transform: "translate3d(0, 101%, 0)" }, { transform: "translate3d(0, 0, 0)" }],
      { duration: document.hidden || reduce.matches ? 0 : 550, easing: EASE, fill: "forwards" });
    anim.finished.then(() => {
      setPhase("waiting");
      sessionStorage.setItem(KEY, JSON.stringify({ tint, to: url.pathname.split("/").pop() || "index.html" }));
      location.href = url.href;
    }).catch(() => {});
  }

  // Page entered under the curtain — lifts up over .85s when the page calls reveal() (or after 10 seconds)
  let arrived = null;
  try { arrived = JSON.parse(sessionStorage.getItem(KEY) || "null"); } catch {}
  sessionStorage.removeItem(KEY);
  let revealed = false;
  function reveal() {
    if (!arrived || revealed) return;
    revealed = true;
    setPhase("revealing");
    anim?.cancel();
    anim = curtain.animate([{ transform: "translate3d(0, 0, 0)" }, { transform: "translate3d(0, -101%, 0)" }],
      { duration: document.hidden || reduce.matches ? 0 : 850, easing: EASE, fill: "forwards" });
    anim.finished.then(() => { setPhase("idle"); anim.cancel(); curtain.style.transform = ""; }).catch(() => {});
  }
  if (arrived) {
    curtain.dataset.tint = arrived.tint || "";
    anim = curtain.animate([{ transform: "translate3d(0, 0, 0)" }, { transform: "translate3d(0, 0, 0)" }], { duration: 0, fill: "forwards" });
    setPhase("waiting");
    setTimeout(reveal, 10000);
  }

  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[data-curtain]");
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    go(a.getAttribute("href"));
  });
  addEventListener("pageshow", (e) => { if (e.persisted && curtain.dataset.phase !== "idle") { anim?.cancel(); setPhase("idle"); } });

  window.CL = { css, rgb, font, reduce, go, reveal, returning: !!arrived && /index|^$/.test(arrived.to) };
})();
