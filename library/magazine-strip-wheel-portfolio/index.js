// Hero — a ribbon of loose sheets (part magazine-ribbon) flows in after the loader, and each time the center sheet changes, the surrounding info (number, role, release, award, color swatch, card list) updates.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ribbon = document.querySelector(".ribbon");
  const figs = [...ribbon.querySelectorAll('[data-fx-part="card"]')];
  const n = figs.length;
  const track = document.querySelector(".cards__track");
  const GAP = innerWidth < 1100 ? 0 : 173;

  // Right card list
  track.innerHTML = figs.map((f, k) => `<div class="card" data-k="${k}"><span class="card__cat t-s">${f.dataset.cat}</span><span class="card__title" data-label="Your work English name here">${f.dataset.title}</span><i class="card__line"></i><span class="card__desc t-xs">${f.dataset.desc}</span></div>`).join("");
  const cards = [...track.children];
  const place = (prog) => {
    cards.forEach((c, k) => {
      let d = k - prog;
      d -= Math.round(d / n) * n;
      c.style.transform = `translateY(${d * GAP - c.offsetHeight / 2}px)`;
    });
  };
  place(0);
  ribbon.addEventListener("fx:progress", (e) => place(e.detail.value));

  // When the center changes — the number and info text blur and sharpen as they change (measured from the original: 250ms blur), and the color swatch tints over 520ms
  const count = document.querySelector(".count"), roll = document.querySelector(".count__roll"), info = document.querySelector(".hero-info"), sw = [...document.querySelectorAll(".swatch i")];
  const role = info.querySelector('[data-i="role"]'), launch = info.querySelector('[data-i="launch"]');
  let cur = -1, swapT = 0;
  const pad = (i) => String(i + 1).padStart(2, "0");
  const setCenter = (k, first) => {
    if (k === cur) return;
    cur = k;
    cards.forEach((c, j) => c.classList.toggle("is-center", j === k));
    sw.forEach((s, j) => (s.style.background = `oklch(from var(--kf-accent) calc(l * ${[1, 0.55, 1.25][j]}) calc(c * ${[1, 0.6, 0.35][j]}) calc(h + ${k * 37}))`));
    if (first || reduce) { roll.textContent = pad(k); launch.textContent = figs[k].dataset.launch; return; }
    info.classList.add("is-swapping");
    count.classList.add("is-swapping");
    clearTimeout(swapT);
    swapT = setTimeout(() => { launch.textContent = figs[k].dataset.launch; role.innerHTML = ["Art Director<br>Website design<br>Showcase", "Design Lead<br>Interaction", "Website design"][k % 3]; roll.textContent = pad(k); info.classList.remove("is-swapping"); count.classList.remove("is-swapping"); }, 360);
  };
  setCenter(0, true);
  ribbon.addEventListener("fx:center", (e) => setCenter(e.detail.index));
  ribbon.addEventListener("fx:pick", () => window.HY.go("detail.html"));

  // Loader — a drawn figure pushes the black wall away from the left to reveal the red name (wall edge measured from the original: 1.2s 30px · 2.8s 432px · 3.6s 860px · 4.6s 903px · 6s off screen),
  // When the name slides up, the strip flows in. If coming from inside, it appears immediately
  const loader = document.querySelector(".loader");
  const play = () => ribbon.dispatchEvent(new CustomEvent("fx:play"));
  const arriving = document.documentElement.classList.contains("is-arriving");
  if (!loader || arriving || reduce) { loader?.remove(); requestAnimationFrame(() => requestAnimationFrame(play)); return; }
  const wall = loader.querySelector(".loader__wall"), pusher = loader.querySelector(".loader__pusher");
  const W = innerWidth, k = W / 1440;
  const edge = { x: 0 };
  const put = () => { wall.style.transform = `translateX(${edge.x}px)`; pusher.style.transform = `translateX(${edge.x - pusher.offsetWidth + 14}px)`; };
  put();
  gsap.timeline({ onUpdate: put })
    .to(edge, { x: 30 * k, duration: 1.2, ease: "power1.out" })
    .to(edge, { x: 432 * k, duration: 1.6, ease: "power1.inOut" })
    .to(edge, { x: 860 * k, duration: 0.8, ease: "power2.out" })
    .to(edge, { x: 903 * k, duration: 0.8, ease: "power1.out" })
    .to(edge, { x: W + pusher.offsetWidth + 40, duration: 0.6, ease: "power2.in" })
    .add(() => loader.classList.add("is-leaving"), "+=0.2")
    .add(() => { loader.classList.add("is-done"); play(); }, "+=0.35")
    .add(() => loader.remove(), "+=0.7");
})();
