// Home — the photo card band continues endlessly, moving the target position with wheel (vertical and horizontal) and drag, and the current position follows 9% per frame.
// While flowing fast, card names get shuffled in uppercase (original scramble pulse) and resolve back to their own letters when stopped. Instead of the original GL bend, it tilts by the speed
(() => {
  const CARDS = [
    ["Client\nName 01", "Website", "Pile of overlapping green fruit · natural light · close up", 42],
    ["Client\nName 02", "Website", "Black horse running across a field with a person holding a flag · clear sky · from the side", 51],
    ["Client\nName 03", "Installation", "Sculpture under a blue beam of light in the dark · cool lighting · angled", 60],
    ["Client\nName 04", "Website", "Hand gripping a red tin can · bold primary colors · close-up", 38.6],
    ["Mr.\nClient 05", "Website", "Crouching figure in a red-lit hallway · solid red · wide", 44.4],
    ["Client Name\nProduction 06", "Website", "Person wearing a flower garland under a chandelier · warm interior · looking up", 50.6],
    ["Client Name\nStudio 07", "Installation", "Street glass display installation · Daytime · Front view", 56.6],
  ];
  const UP = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const rail = document.querySelector(".ax-rail");
  const track = rail.querySelector(".ax-rail__track");
  const reduce = ax.reduce;
  const cards = CARDS.map(([name, kind, photo, w]) => {
    const el = document.createElement("a");
    el.href = "works.html";
    el.className = "ax-card";
    el.dataset.cursorLabel = "View work";
    el.innerHTML = `<div class="ax-card__img"><div class="wf-img" data-label="${photo} · Slightly taller card"></div></div>
      <div class="ax-card__meta"><h2 class="ax-card__name" data-label="Client English name, two lines">${name}</h2><span class="ax-card__kind">${kind}</span></div>`;
    track.append(el);
    return { el, w, name, nameEl: el.querySelector(".ax-card__name"), img: el.querySelector(".ax-card__img .wf-img") };
  });
  // Card widths are all screen/3.45, photo height (vh) steps differently per card (39–60% measured on the original screen)
  let widths = [], total = 1;
  const measure = () => {
    widths = cards.map((c) => c.el.getBoundingClientRect().width);
    total = widths.reduce((a, b) => a + b, 0);
  };
  cards.forEach((c) => c.el.querySelector(".ax-card__img").style.setProperty("--h", `${c.w}vh`));
  measure();
  addEventListener("resize", measure);

  let x = 0, tx = 0, last = 0, speed = 0, mixing = false;
  const scramble = (on) => {
    cards.forEach((c) => {
      c.nameEl.textContent = on ? [...c.name].map((ch) => (/\s/.test(ch) ? ch : UP[Math.floor(Math.random() * UP.length)])).join("") : c.name;
    });
  };
  let tick = 0;
  const frame = (now) => {
    requestAnimationFrame(frame);
    const dt = Math.min(Math.max(1, now - (last || now)), 50) / 16.67;
    last = now;
    const prev = x;
    x += (tx - x) * (reduce ? 1 : 1 - Math.pow(1 - 0.09, dt));
    speed = x - prev;
    let off = 0;
    const skew = Math.max(-5, Math.min(5, speed * -0.25));
    cards.forEach((c, i) => {
      let p = ((off - x) % total + total) % total;
      if (p > innerWidth) p -= total;
      c.el.style.transform = `translate3d(${p.toFixed(2)}px, 0, 0)`;
      c.el.firstElementChild.style.transform = `skewX(${skew.toFixed(2)}deg)`;
      off += widths[i];
    });
    const fast = Math.abs(speed) > 4;
    if (fast && ++tick % 4 === 0) { scramble(true); mixing = true; }
    else if (!fast && mixing) { scramble(false); mixing = false; }
  };
  requestAnimationFrame(frame);

  rail.closest(".ax-home").addEventListener("wheel", (e) => {
    tx += Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
  }, { passive: true });
  let down = null, moved = false;
  rail.addEventListener("pointerdown", (e) => { down = { x: e.clientX, t: tx }; moved = false; });
  addEventListener("pointermove", (e) => {
    if (!down) return;
    const d = e.clientX - down.x;
    if (Math.abs(d) > 6) { moved = true; rail.classList.add("is-drag"); }
    tx = down.t - d * 1.4;
  });
  addEventListener("pointerup", () => { down = null; rail.classList.remove("is-drag"); });
  rail.addEventListener("click", (e) => { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);

  // Hovering a card zooms the photo 1.04x over .6s expo.out (original hoverZoom), and moving the cursor over the strip pushes the photo away from the cursor (within the 15% left/right margin of the original GL photo — up to 14% of card width).
  // The wordmark and about text below also shift slightly opposite the cursor (stands in for the original GL text reacting to the cursor — the copy uses parallax)
  let mx = innerWidth / 2, hx = 0;
  const hero = document.querySelector(".ax-hero");
  addEventListener("pointermove", (e) => { mx = e.clientX; });
  gsap.ticker.add(() => {
    hx += ((reduce ? 0 : (mx / innerWidth - 0.5) * -6) - hx) * 0.08;
    hero.style.translate = `${hx.toFixed(2)}px 0`;
  });
  const shift = cards.map(() => 0);
  gsap.ticker.add(() => {
    cards.forEach((c, i) => {
      const r = c.el.getBoundingClientRect();
      const lim = r.width * 0.14, want = reduce ? 0 : gsap.utils.clamp(-lim, lim, ((mx - (r.left + r.width / 2)) / innerWidth) * -320);
      shift[i] += (want - shift[i]) * 0.08;
      c.img.style.translate = `${shift[i].toFixed(2)}px 0`;
    });
  });
  // On entering a card the name scrambles in uppercase for .5s, then resolves from the front (original card-enter scramble)
  const pulse = (c) => {
    const t0 = performance.now();
    const run = (now) => {
      if (mixing) return;
      const p = Math.min(1, (now - t0) / 500), n = Math.floor(p * c.name.length);
      c.nameEl.textContent = c.name.slice(0, n) + [...c.name.slice(n)].map((ch) => (/\s/.test(ch) ? ch : UP[Math.floor(Math.random() * UP.length)])).join("");
      if (p < 1) requestAnimationFrame(run);
    };
    requestAnimationFrame(run);
  };
  let inside = null;
  rail.addEventListener("pointerover", (e) => {
    const c = cards.find((k) => k.el.contains(e.target));
    if (c === inside) return;
    if (inside) gsap.to(inside.img, { scale: 1, duration: 0.6, ease: "expo.out", overwrite: "auto" });
    inside = c || null;
    if (!c) return;
    gsap.to(c.img, { scale: 1.04, duration: 0.6, ease: "expo.out", overwrite: "auto" });
    pulse(c);
  });
  rail.addEventListener("pointerleave", () => { if (inside) gsap.to(inside.img, { scale: 1, duration: 0.6, ease: "expo.out", overwrite: "auto" }); inside = null; });

  document.addEventListener("ax:in", () => {
    document.querySelector(".ax-hero__about .ax-label").dispatchEvent(new CustomEvent("fx:play"));
  });
})();
