(function () {
  // Original concept.js: on wide screens, one ScrollTrigger per text block (top center ~ block height) — when it enters, turn on that turn’s photo, picture and text,
  // Only on the second chunk, change the section background to white (1s ease)
  if (!matchMedia("(min-width: 768px)").matches) return;
  const blocks = [...document.querySelectorAll(".ej-cc__block")];
  const imgs = [...document.querySelectorAll(".ej-cc__img")];
  const ills = [...document.querySelectorAll(".ej-cc__ill")];
  const sec = document.querySelector(".ej-cc");
  const active = (i) => {
    [blocks, imgs, ills].forEach((list) => list.forEach((n, k) => n.classList.toggle("is-show", k === i)));
    sec.classList.toggle("is-white", i === 1);
  };
  active(0);
  const heights = blocks.map((b) => b.offsetHeight);
  blocks.forEach((b, i) => ScrollTrigger.create({ trigger: b, start: "top center", end: `+=${heights[i]}px`, onToggle: ({ isActive }) => { if (isActive) active(i); } }));
})();
