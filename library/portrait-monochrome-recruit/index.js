// Home page horizontal swipe — moves sections using the same state as the original scrollSlide (current·prev·next·count·currentHistory).
// One wheel tick moves one person, and the next input is ignored during the 1s transition. On phones, horizontal swipe 40px.
(() => {
  const root = document.querySelector(".hs");
  const total = Number(root.dataset.total);
  const slidesEl = root.querySelector("[data-hs-slides]");
  const textsEl = root.querySelector("[data-hs-texts]");
  const navEl = root.querySelector("[data-hs-nav]");
  const dive = root.querySelector("[data-hs-dive]");

  root.querySelector(".hs__city-img").style.setProperty("--city", ct.city());

  const people = Array.from({ length: total }, (_, i) => ({
    n: String(i + 1).padStart(2, "0"),
    role: ["Team Name", "Department", "Team Name", "Back Office", "Department", "Team Name", "Department", "Team Name"][i],
  }));

  slidesEl.innerHTML = people.map((p, i) => `
    <div class="hs__slide" data-slot="person-slide">
      <div class="hs__image">
        <div class="hs__human">${ct.human(i)}</div>
        <div class="hs__bg">
          <div class="hs__bg-inner">
            <a href="list.html" data-hs-go aria-label="Interview ${p.n}"><div class="ct-dream" style="${ct.dreamStyle(i)}"></div></a>
            <span class="ct-chip">Dream scene color photo · 1:1</span>
          </div>
        </div>
        <span class="ct-chip hs__fig-chip">Person cutout · black-and-white suit · upper body pulling shirt open with both hands · transparent gap at the chest</span>
      </div>
    </div>`).join("");

  const side = (i) => (i % 2 ? "is-odd" : "is-even");
  const titles = document.createElement("div");
  titles.className = "hs__titles";
  titles.dataset.slot = "slide-titles";
  titles.innerHTML = people.map((p, i) => `
    <div class="hs__title ${side(i)}"><div class="hs__title-in">
      <p class="hs__big">Title line of<br><span class="ct-serif">Wording,</span></p>
      <p class="hs__title-num">${p.n}</p>
    </div></div>`).join("");
  slidesEl.before(titles);

  textsEl.innerHTML = people.map((p, i) => `
    <div class="hs__name ${side(i)}"><p>Interview by</p><p>${p.role}</p><p>Full Name</p></div>
    <div class="hs__quote ${side(i)}"><div class="hs__quote-in"><p>Your one-line dream here,<br>Set in two lines.</p></div></div>
    <div class="hs__bottom ${side(i)}"><div class="hs__bottom-in">
      <p class="hs__big">Second line<br><span class="ct-serif">Wording.</span> <span class="hs__num-sp">${p.n}</span></p>
      <p class="hs__cap">A short caption line<br>in two lines here.</p>
    </div></div>`).join("");

  navEl.innerHTML = people.map((p) => `
    <li><span class="hs__dot"><i></i></span><span class="hs__nav-g"><b>${p.n}</b><span class="hs__nav-name"><span>Full Name</span></span></span></li>`).join("");

  const slides = [...slidesEl.children];
  const groups = [slides, [...titles.children], [...textsEl.querySelectorAll(".hs__name")], [...textsEl.querySelectorAll(".hs__quote")], [...textsEl.querySelectorAll(".hs__bottom")], [...navEl.children]];

  const st = { current: 0, prev: total - 1, next: 1, count: 0, history: 0, action: false, loaded: false };
  const render = () => {
    const { current, prev, next, history } = st;
    slides.forEach((el, i) => {
      const s = i === current ? 0 : i === next || (current < i && prev !== i) ? 1 : -1;
      el.style.setProperty("--side", s);
      el.classList.toggle("is-move", st.loaded && (i === current || i === history));
    });
    groups.forEach((list) => list.forEach((el, i) => el.classList.toggle("is-current", i === current)));
    dive.classList.toggle("is-odd", current % 2 === 1);
    root.style.setProperty("--current", st.count);
    root.style.setProperty("--total", total - 1);
  };
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const setScroll = (on) => { if (ct.cursor) { ct.cursor.isScroll = on; ct.cursor.paint(); } };

  const goNext = async () => {
    if (st.action) return;
    st.action = true;
    st.count++;
    st.history = st.current;
    st.prev = st.current;
    st.current = (st.current + 1) % total;
    st.next = (st.current + 1) % total;
    render();
    await wait(1000);
    st.action = false;
  };
  const goPrev = async () => {
    if (st.action) return;
    st.action = true;
    st.count--;
    st.history = st.current;
    st.next = st.current;
    st.current = (st.current - 1 + total) % total;
    st.prev = (st.current - 1 + total) % total;
    render();
    await wait(1000);
    st.action = false;
  };
  // Like the original _goTo, even pressing the current cell reduces count, so the city background drifts one cell
  const goTo = (t) => {
    st.current >= t ? st.count-- : st.count++;
    st.history = st.current;
    st.current = t;
    st.prev = (t - 1 + total) % total;
    st.next = (t + 1) % total;
    render();
  };

  root.addEventListener("wheel", async (e) => {
    e.preventDefault();
    if (st.action || document.body.classList.contains("is-diving")) return;
    setScroll(false);
    await (e.deltaY > 0 ? goNext() : goPrev());
    setScroll(true);
  }, { passive: false });

  let sx = 0, sy = 0, touching = false, axis = null, swiped = false;
  root.addEventListener("touchstart", (e) => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; touching = true; axis = null; swiped = false; }, { passive: true });
  root.addEventListener("touchmove", (e) => {
    if (!touching || swiped || st.action) return;
    const dx = e.touches[0].clientX - sx, dy = e.touches[0].clientY - sy;
    if (!axis) axis = Math.abs(dx) > Math.abs(dy) + 10 ? "x" : Math.abs(dy) > Math.abs(dx) + 10 ? "y" : null;
    if (axis === "x" && Math.abs(dx) >= 40) { swiped = true; dx < 0 ? goNext() : goPrev(); }
  }, { passive: true });
  root.addEventListener("touchend", () => { touching = false; axis = null; swiped = false; });

  navEl.querySelectorAll("li").forEach((li, i) => li.addEventListener("click", () => goTo(i)));
  root.querySelector("[data-hs-next]").addEventListener("click", goNext);

  // Zoom factor at which the chest-gap photo covers the screen’s long side (width · 100lvh) — original _updateZoom
  const lvh = () => {
    const probe = document.createElement("div");
    probe.style.cssText = "position:fixed;top:0;left:0;width:0;height:100lvh;visibility:hidden;pointer-events:none";
    document.body.append(probe);
    const h = probe.getBoundingClientRect().height;
    probe.remove();
    return h || innerHeight;
  };
  const updateZoom = () => {
    const bg = root.querySelector(".hs__bg");
    if (bg?.offsetWidth) root.style.setProperty("--pt-zoom", String(Math.max(innerWidth, lvh()) / bg.offsetWidth));
  };
  addEventListener("resize", updateZoom);

  root.addEventListener("click", (e) => {
    const a = e.target.closest("[data-hs-go]");
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    if (ct.reduce) { location.href = a.getAttribute("href"); return; }
    updateZoom();
    document.body.classList.add("is-diving");
    setTimeout(() => (location.href = a.getAttribute("href")), 1800);
  });
  // Returning with the back button leaves the dived-in state behind — the original also reverts it on pageshow
  addEventListener("pageshow", (e) => { if (e.persisted) document.body.classList.remove("is-diving"); });

  render();
  addEventListener("ct:loaded", () => { st.loaded = true; updateZoom(); render(); });
})();
