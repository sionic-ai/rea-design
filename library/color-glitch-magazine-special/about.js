// About page — pinned panel lerp scroll (.3, phone .4), blurred X and dot pattern revealed behind the hero, yellow X visible only through the past-issue panel window, video dialog
(() => {
  const { cl, val } = kk;
  const tpl = document.getElementById("kk-x-tpl");
  document.querySelectorAll(".ab-open__logo, .kk-footbg__logo").forEach((n) => n.append(tpl.content.cloneNode(true)));

  const subs = document.querySelector(".ab-subs");
  document.querySelectorAll(".ab-block > .ab-block__sub").forEach((s) => subs.append(s.cloneNode(true)));

  const main = document.querySelector(".ab-main");
  const spacer = document.createElement("div");
  spacer.className = "ab-spacer";
  document.body.append(spacer);
  const fit = () => { spacer.style.height = main.offsetHeight + "px"; };
  fit();
  new ResizeObserver(fit).observe(main);
  let pos = scrollY;
  kk.smoothY = pos;

  const bg = document.querySelector(".ab-bg"), tile = bg.querySelector(".ab-bg__tile");
  let tileId = 0, tx = 0, ty = 0, vx = 1, vy = 1;
  const setTile = () => {
    tile.dataset.i = tileId;
    gsap.set(tile, { x: 0, y: 0 });
    tx = ty = 0;
    const sp = () => Math.floor(1 + Math.random() * 2) * (Math.random() < 0.5 ? -1 : 1);
    vx = sp(); vy = sp();
    tileId = (tileId + 1) % 8;
    bg.classList.toggle("is-line", kk.hit(4));
  };
  setTile();

  const opens = [...document.querySelectorAll(".ab-open")].map((layer, i) => ({ layer, sec: document.querySelectorAll(".ab-open-sec")[i] }));
  const arrow = document.querySelector(".kk-scroll");
  let c = 0;
  kk.loop(() => {
    c++;
    const lerp = kk.reduce ? 1 : val(0.4, 0.3);
    pos += (scrollY - pos) * lerp;
    if (Math.abs(scrollY - pos) < 0.05) pos = scrollY;
    kk.smoothY = pos;
    gsap.set(main, { y: -pos });
    const lvh = innerHeight;
    bg.style.clipPath = `inset(${(kk.narrow.matches ? 0 : cl(pos, 1, 0, 0, lvh)) * 100}% 0 0 0)`;
    if (!kk.reduce && c % 4 === 0) { tx += vx; ty += vy; gsap.set(tile, { x: tx, y: ty }); }
    if (!kk.reduce && c % 120 === 0) setTile();
    opens.forEach(({ layer, sec }) => {
      if (!sec) return;
      const top = sec.offsetTop;
      const n = cl(Math.max(0, top - pos), 0, 1, 0, lvh), s = cl(Math.max(0, top + lvh - pos), 1, 0, 0, lvh);
      layer.style.clipPath = `inset(${n * 100}% 0 ${s * 100}% 0)`;
    });
    arrow.classList.toggle("is-gone", pos > lvh * 0.1);
  });

  const modal = document.querySelector(".ab-modal");
  const open = () => { if (!modal.open) modal.showModal(); };
  const close = () => { if (modal.open) modal.close(); };
  document.querySelector(".ab-fv").addEventListener("click", open);
  modal.querySelector(".ab-modal__bg").addEventListener("click", close);
  modal.querySelector(".ab-modal__close").addEventListener("click", close);
})();
