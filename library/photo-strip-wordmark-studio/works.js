// Work list — every 100px of wheel moves the target one row, and the current position follows by distance in .9~1.8s expo.out (original c = clamp(.9, 1.8, .9 + .0009 × distance)).
// Rows are spaced 58px by distance from center, and the center row opens a gap equal to the photo height. The black band behind is a striped shape with rounded top and bottom, flowing .18 of the screen per row.
(() => {
  const WORKS = [
    ["Client\nName", "Website", "Pile of green fruit with overlapping leaves · natural light"],
    ["Client\nStudio", "Website", "Black horse running through a field and a person holding a flag · clear sky"],
    ["Client 40\nNorth", "Installation", "Sculpture under a blue beam of light in the dark · cool lighting"],
    ["Client\nFoods", "Website", "Hand holding a red tin can · strong primary colors"],
    ["Mr.\nClient", "Website", "Crouching figure in a red-lit corridor · solid red"],
    ["Client Name\nProduction", "Website", "Person wearing a flower garland under a chandelier · warm interior"],
    ["Client Name\nStudio", "Installation", "Street glass display installation · daytime"],
  ];
  const N = WORKS.length, LAPS = 3, STEP = 58, BAND = 0.18;
  const root = document.querySelector(".ax-works");
  const rowsBox = root.querySelector(".ax-works__rows"), thumbs = root.querySelector(".ax-works__thumbs");
  const photo = root.querySelector(".ax-works__photo");
  const bands = [0, 1, 2].map(() => { const b = document.createElement("div"); b.className = "ax-works__band"; b.setAttribute("aria-hidden", "true"); root.prepend(b); return b; });
  const reduce = ax.reduce;
  const rows = [], ths = [];
  for (let k = 0; k < N * LAPS; k++) {
    const [name, kind] = WORKS[k % N];
    const li = document.createElement("li");
    li.className = "ax-row";
    li.innerHTML = `<span class="ax-row__n">(${String((k % N) + 1).padStart(3, "0")})</span><div><h2 class="ax-row__name" data-label="Client English name, two lines">${name}</h2><span class="ax-row__kind">${kind}</span></div>`;
    rowsBox.append(li);
    rows.push(li);
    const t = document.createElement("div");
    t.className = "ax-thumb wf-img";
    thumbs.append(t);
    ths.push(t);
  }
  const shots = WORKS.map(([, , label]) => {
    const p = document.createElement("div");
    p.className = "wf-img";
    p.dataset.label = `${label} · 16:10`;
    photo.append(p);
    return p;
  });
  const state = { pos: 0 };
  let target = 0, acc = 0, shown = -1;
  const gapFor = () => photo.getBoundingClientRect().height / 2 + 24;
  const place = () => {
    const H = innerHeight, mid = H / 2, gap = gapFor(), pos = state.pos;
    rows.forEach((li, k) => {
      let d = k - pos;
      const wrap = N * LAPS;
      d = ((d % wrap) + wrap * 1.5) % wrap - wrap / 2;
      const push = Math.sign(d) * Math.min(1, Math.abs(d)) * gap;
      li.style.transform = `translate3d(0, ${(mid + d * STEP + push).toFixed(1)}px, 0)`;
      li.classList.toggle("is-on", Math.abs(d) < 0.5);
      ths[k].style.transform = `translate3d(0, ${(mid + d * 30 - 12).toFixed(1)}px, 0)`;
      ths[k].classList.toggle("is-on", Math.abs(d) < 0.5);
    });
    const i = ((Math.round(pos) % N) + N) % N;
    if (i !== shown) { shots.forEach((s, j) => s.classList.toggle("is-on", j === i)); shown = i; }
    // Band — separate from the list, stripes that flow up by .18 of screen height per line scrolled (black 1.3 screens + cream 1.3 screens).
    // At first it sits just below the screen so it starts cream, and after about five rows it is fully covered, then cream rises again from below (flow measured on the original screen)
    const S = H * BAND, period = H * 2.6, off = (((H - pos * S) % period) + period) % period;
    bands.forEach((b, k) => {
      b.style.height = `${H * 1.3}px`;
      b.style.transform = `translate3d(0, ${(off + (k - 1) * period).toFixed(1)}px, 0)`;
    });
  };
  let tween = null;
  const go = () => {
    tween?.kill();
    const dist = Math.abs(target - state.pos) * STEP;
    tween = gsap.to(state, { pos: target, duration: reduce ? 0 : gsap.utils.clamp(0.9, 1.8, 0.9 + 9e-4 * dist), ease: "expo.out", onUpdate: place });
  };
  place();
  addEventListener("resize", place);
  root.addEventListener("wheel", (e) => {
    acc += e.deltaY;
    let moved = false;
    while (Math.abs(acc) >= 100) { const s = Math.sign(acc); target += s; acc -= s * 100; moved = true; }
    if (moved) go();
  }, { passive: true });
  let y0 = null;
  root.addEventListener("pointerdown", (e) => { y0 = e.clientY; });
  addEventListener("pointerup", (e) => {
    if (y0 == null) return;
    const d = y0 - e.clientY;
    y0 = null;
    if (Math.abs(d) > 30) { target += Math.sign(d) * Math.max(1, Math.round(Math.abs(d) / STEP)); go(); }
  });
  addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") { target += 1; go(); }
    if (e.key === "ArrowUp") { target -= 1; go(); }
  });
})();
