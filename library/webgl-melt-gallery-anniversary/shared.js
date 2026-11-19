// Side parts of the main screen: building image-slot textures (skin-variable colors), sliding the left list in sync with page turns, Archive drawer, enlarge view and schedule windows, schedule accordion.
// The transition itself (WebGL) and the opening are handled by the parts (noise-dissolve-slides, sky-open-intro)
(() => {
  gsap.registerPlugin(ScrollToPlugin);
  const root = document.documentElement;
  const view = document.querySelector(".t-view");
  const list = document.querySelector(".t-list");
  const ul = list.querySelector(".t-list__ul");
  const items = [...ul.querySelectorAll('.t-list__item:not([data-spacer="1"])')];

  // Turn skin variables into actual color strings — canvas can’t read var()
  const probe = document.createElement("i");
  probe.style.display = "none";
  document.body.append(probe);
  const colorOf = (css) => { probe.style.color = css; return getComputedStyle(probe).color; };

  // Image spot — the original is one person illustration each. Paint a same-ratio sky·ground·figure silhouette placeholder and write a label saying what the picture is
  const narrow = matchMedia("(max-width: 834px)").matches;
  const [W, H] = narrow ? [1024, 1920] : [2048, 1152];
  const font = getComputedStyle(root).getPropertyValue("--kf-font-sans").trim();
  items.forEach((it, i) => {
    const turn = i * 67;
    const top = colorOf(`oklch(from var(--kf-accent-soft) calc(l + 0.45) calc(c * 1.2) calc(h + ${turn}))`);
    const low = colorOf(`oklch(from var(--kf-accent) calc(l - 0.1) calc(c * 0.6) calc(h + ${turn + 120}))`);
    const land = colorOf(`oklch(from var(--kf-contrast-bg) calc(l + 0.12) c calc(h + ${turn}))`);
    const body = colorOf(`color-mix(in oklab, var(--kf-contrast-bg) 70%, var(--kf-accent-soft))`);
    const cv = document.createElement("canvas");
    cv.width = W; cv.height = H;
    cv.setAttribute("data-fx-part", "slide");
    const g = cv.getContext("2d");
    const sky = g.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, top); sky.addColorStop(1, low);
    g.fillStyle = sky; g.fillRect(0, 0, W, H);
    g.fillStyle = land;
    g.beginPath(); g.moveTo(0, H * 0.78);
    for (let x = 0; x <= W; x += W / 12) g.lineTo(x, H * (0.74 + 0.05 * Math.sin(i + x / 260)));
    g.lineTo(W, H); g.lineTo(0, H); g.fill();
    const cx = W * (0.55 + 0.12 * ((i % 3) - 1)), s = Math.min(W, H) * 0.32;
    g.fillStyle = body;
    g.beginPath(); g.arc(cx, H - s * 1.9, s * 0.28, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.ellipse(cx, H - s * 0.7, s * 0.55, s * 1.05, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = colorOf("var(--kf-ink)");
    g.font = `500 ${Math.round(W / 70)}px ${font}`;
    g.fillText(it.dataset.label || "Person illustration slot", W * 0.3, H * 0.1);
    view.append(cv);
  });

  // Left list — slides one cell (power2.out) over .5x length starting after .5x length from the transition start, and the current row dims while the next row brightens.
  // The current row stands in the second cell and the previous row stays dimmed in the first. To make it loop, the last row is added at the front and the first row at the end
  const n = items.length;
  const pre = items[n - 1].cloneNode(true), post = items[0].cloneNode(true);
  [pre, post].forEach((c) => { c.setAttribute("aria-hidden", "true"); c.dataset.active = "0"; c.querySelector(".t-list__hit")?.setAttribute("tabindex", "-1"); });
  items[0].before(pre);
  ul.append(post);
  let at = 0, rowH = 95;
  const yOf = (i) => -i * rowH;
  const measure = () => { rowH = items[0]?.offsetHeight || rowH; gsap.set(ul, { y: yOf(at) }); };
  addEventListener("resize", measure);
  measure();
  const setActive = (i) => { items.forEach((it, k) => { it.dataset.active = k === i ? "1" : "0"; gsap.set(it, { opacity: k === i ? 1 : 0.4 }); }); gsap.set([pre, post], { opacity: 0.4 }); };
  setActive(0);
  const prog = { p: 0 };
  view.addEventListener("fx:slide-start", (e) => {
    const { from, to, dir, dur } = e.detail;
    const incoming = from === n - 1 && dir > 0 ? post : from === 0 && dir < 0 ? pre : items[to];
    gsap.killTweensOf(prog);
    prog.p = 0;
    gsap.to(prog, {
      p: 1, duration: 0.5 * dur, delay: 0.5 * dur, ease: "power2.out",
      onUpdate: () => {
        const p = prog.p;
        gsap.set(ul, { y: yOf(from) - dir * p * rowH });
        gsap.set(items[from], { opacity: 1 - 0.6 * p });
        gsap.set(incoming, { opacity: 0.4 + 0.6 * p });
      },
    });
  });
  view.addEventListener("fx:slide-end", (e) => {
    at = e.detail.index;
    setActive(at);
    list.dataset.lightreselect = "1";
    gsap.set(ul, { y: yOf(at) });
  });
  document.addEventListener("fx:open", () => { list.dataset.viewstart = "1"; });

  // Drawer and window — opening locks the body
  const side = document.querySelector(".t-side");
  const detail = document.querySelector(".t-modal--detail");
  const schedule = document.querySelector(".t-modal--schedule");
  const open = (el) => { el.dataset.active = "1"; document.body.dataset.lock = "1"; };
  const close = (el) => { el.dataset.active = "0"; if (![side, detail, schedule].some((x) => x.dataset.active === "1")) delete document.body.dataset.lock; };
  // Like the original it is a div button, so it also accepts the keyboard (Enter·Space)
  const pressable = (el, fn) => { el.addEventListener("click", fn); el.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fn(); } }); };
  pressable(document.querySelector(".t-archive-btn"), () => open(side));
  side.querySelector(".t-close").addEventListener("click", () => close(side));
  document.querySelector(".t-logo").addEventListener("click", () => open(schedule));
  detail.querySelector(".t-close").addEventListener("click", () => close(detail));
  schedule.querySelector(".t-close").addEventListener("click", () => close(schedule));
  items.forEach((it) => it.querySelector(".t-list__hit").addEventListener("click", () => { if (it.dataset.active === "1") open(detail); }));
  side.querySelectorAll(".t-adetail__thumb, .t-ablock__item").forEach((b) => b.addEventListener("click", () => open(detail)));
  addEventListener("keydown", (e) => { if (e.key === "Escape") [detail, schedule, side].find((x) => x.dataset.active === "1") && close([detail, schedule, side].find((x) => x.dataset.active === "1")); });

  // Drawer region tabs — roll to that group in .5s circ.inOut (15px less), and move the tab underline to match the rolled position
  const scroller = side.querySelector(".t-area__scroll");
  const tabs = [...side.querySelectorAll(".t-anav li")];
  tabs.forEach((li) => li.querySelector("a").addEventListener("click", (e) => {
    e.preventDefault();
    gsap.to(scroller, { duration: 0.5, scrollTo: { y: li.querySelector("a").getAttribute("href"), offsetY: -15 }, ease: "circ.inOut" });
  }));
  const blocks = [...side.querySelectorAll(".t-area__wrap")];
  scroller.addEventListener("scroll", () => {
    const y = scroller.scrollTop + 20;
    let k = 0;
    blocks.forEach((b, i) => { if (b.offsetTop <= y) k = i; });
    tabs.forEach((t, i) => (t.dataset.active = i === k ? "1" : "0"));
  }, { passive: true });

  // Schedule accordion — a date button opens and closes its row in .4s (grid-template-rows 0fr → 1fr)
  schedule.querySelectorAll(".t-schedule__item").forEach((li) => {
    li.querySelector(".t-schedule__date").addEventListener("click", () => { li.dataset.accactive = li.dataset.accactive === "1" ? "0" : "1"; });
  });
})();
