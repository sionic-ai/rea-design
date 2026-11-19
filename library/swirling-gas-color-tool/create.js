// Create — the list/grid pill slides in .28s, the drag-and-drop panel brightens when a file is over it, and the panel text lines rise in turn on entry
(() => {
  const { E, on, reduce } = window.aSite;
  const seg = document.querySelector(".a-seg"), pill = seg?.querySelector(".a-seg__pill");
  const btns = seg ? [...seg.querySelectorAll("button")] : [];
  const put = (b, dur) => gsap.to(pill, { x: b.offsetLeft - 2, width: b.offsetWidth, duration: dur, ease: "a-entrance" });
  if (pill) {
    document.fonts.ready.then(() => put(btns.find((b) => b.classList.contains("is-on")), 0));
    btns.forEach((b) => b.addEventListener("click", () => {
      btns.forEach((x) => { x.classList.toggle("is-on", x === b); x.setAttribute("aria-selected", String(x === b)); });
      put(b, reduce ? 0 : 0.28);
    }));
  }
  // Pressing a row flips it to ink-black and selects it
  const rows = [...document.querySelectorAll(".a-row")];
  rows.forEach((r) => r.addEventListener("click", () => rows.forEach((x) => x.classList.toggle("is-on", x === r && !r.classList.contains("is-on")))));
  const drop = document.querySelector(".a-drop");
  if (drop) {
    ["dragenter", "dragover"].forEach((t) => drop.addEventListener(t, (e) => { e.preventDefault(); drop.classList.add("is-over"); }));
    ["dragleave", "drop"].forEach((t) => drop.addEventListener(t, (e) => { e.preventDefault(); drop.classList.remove("is-over"); }));
    on("arrive", () => {
      if (reduce) return;
      gsap.from(drop.querySelectorAll("[data-drop-line]"), { opacity: 0, y: 10, duration: 0.62, stagger: 0.04, ease: E.entrance });
      gsap.from(".a-row", { opacity: 0, y: 10, duration: 0.62, stagger: 0.04, ease: E.entrance, delay: 0.12 });
    });
  }
})();
