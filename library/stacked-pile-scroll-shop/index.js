// Three material cells — on PC the three open together in one inner scroll board (its own Lenis), on phone each cell opens separately by window scroll.
// The pile spread is done by the _fx/stack-explode part, here we switch its options and the scroll panel by width, place the sub rows and receive presses.
(() => {
  const site = window.site;
  const root = document.documentElement;
  const cols = document.querySelector(".s-cols");
  if (!cols) return;
  const walls = [...document.querySelectorAll(".s-wall")];
  const accRows = [...document.querySelectorAll(".s-acc")];
  const DESKTOP = matchMedia("(min-width: 992px)");
  const isDesktop = () => DESKTOP.matches;
  // Same number as the part default — sub rows also pause for the same tempo as the fully opened dummy
  const HOLD = 1.15;
  const OPEN = 0.714;

  // ---- Page ↔ inner panel handoff: until the panel’s top edge reaches the top of the screen the wheel belongs to the page, after that to the panel, and at the panel’s end back to the page ----
  let gridLenis = null;
  let gridTick = null;
  const gridAligned = () => cols.getBoundingClientRect().top <= 4;
  const gridAtEdge = () => !gridLenis || gridLenis.animatedScroll <= 0 || gridLenis.animatedScroll >= gridLenis.limit;
  site.preventPage = (node) => !!(node && node.closest && node.closest(".s-cols")) && isDesktop() && gridAligned() && !gridAtEdge();
  // When approaching from above, the page stops at the shop — so leftover inertia doesn’t overshoot and the unfolding begins with the board head cut off
  site.onPageScroll = (lenis) => {
    if (!isDesktop()) return;
    const gridDocY = cols.getBoundingClientRect().top + scrollY;
    if (lenis.animatedScroll < gridDocY - 1 && lenis.targetScroll > gridDocY) lenis.scrollTo(gridDocY);
  };

  function setGridLenis(on) {
    if (on && !gridLenis && site.lenis && window.Lenis) {
      gridLenis = new Lenis({
        wrapper: cols,
        content: cols,
        overscroll: true,
        virtualScroll: site.speedLimit(() => gridLenis),
        prevent: () => !(isDesktop() && gridAligned()),
      });
      gridLenis.on("scroll", ScrollTrigger.update);
      gridTick = (time) => gridLenis.raf(time * 1000);
      gsap.ticker.add(gridTick);
    } else if (!on && gridLenis) {
      gsap.ticker.remove(gridTick);
      gridLenis.destroy();
      gridLenis = null;
    }
  }

  // ---- Sub row: on PC under its own material cell, on phone after viewing all three piles, in one row by size ----
  const homes = new Map();
  const markHome = (el) => {
    if (homes.has(el)) return;
    const m = document.createComment("home");
    el.before(m);
    homes.set(el, m);
  };
  function placeAccessories() {
    if (!accRows.length) return;
    if (isDesktop()) {
      homes.forEach((m, el) => m.after(el));
      accRows.forEach((r) => r.classList.remove("is-emptied"));
      return;
    }
    const host = accRows[0];
    const grid = host.querySelector(".s-acc__grid");
    const cells = accRows.flatMap((r) => [...r.querySelectorAll(".s-acc__cell")]);
    cells.forEach(markHome);
    cells.sort((a, b) => parseInt(a.dataset.size, 10) - parseInt(b.dataset.size, 10)).forEach((c) => grid.appendChild(c));
    markHome(host);
    cols.appendChild(host);
    accRows.slice(1).forEach((r) => r.classList.add("is-emptied"));
  }

  // Sub rows are also pinned for the panel height and pause and move on at the same tempo as the stack — PC 1.2rem below the header row, phone at screen center
  function parkAccessories() {
    const rows = accRows.filter((r) => !r.classList.contains("is-emptied"));
    if (!rows.length) return;
    const d = isDesktop();
    const css = getComputedStyle(root);
    const head = d ? document.querySelector(".s-col__head")?.offsetHeight || 0 : 0;
    const frame = (d ? cols.clientHeight : innerHeight - (parseFloat(css.getPropertyValue("--bar-h")) || 0)) - head;
    const hold = frame * OPEN * HOLD;
    const heights = rows.map((r) => r.querySelector(".s-acc__inner").getBoundingClientRect().height);
    const tallest = Math.max(...heights);
    const rem = parseFloat(css.fontSize) || 10;
    const park = d ? Math.round(head + 1.2 * rem) : Math.max(0, Math.round((frame - tallest) / 2));
    rows.forEach((r, i) => {
      r.style.setProperty("--acc-park", park + "px");
      const padB = parseFloat(getComputedStyle(r).paddingBottom) || 0;
      r.querySelector(".s-acc__wall").style.height = Math.max(0, Math.round(hold + frame + head - park - heights[i] - padB)) + "px";
    });
    ScrollTrigger.refresh();
  }

  // ---- When the width crosses 992, swap scroll panels·groups·fit and reattach the parts ----
  let mode = null;
  const optionsFor = (d) => (d ? "group: shop; snap: on; wall: css" : "");
  function setMode(first) {
    const d = isDesktop();
    if (d === mode) return;
    mode = d;
    placeAccessories();
    cols.toggleAttribute("data-fx-scroller", d);
    walls.forEach((w) => w.setAttribute("data-fx-stack-explode", optionsFor(d)));
    if (!first) {
      walls.forEach((w) => w.setAttribute("data-fx", ""));
      requestAnimationFrame(() => walls.forEach((w) => w.setAttribute("data-fx", "stack-explode")));
    }
    setGridLenis(d);
    requestAnimationFrame(() => requestAnimationFrame(parkAccessories));
  }
  setMode(true);
  DESKTOP.addEventListener("change", () => setMode(false));
  let parkTimer = 0;
  addEventListener("resize", () => {
    clearTimeout(parkTimer);
    parkTimer = setTimeout(parkAccessories, 150);
  });
  if (document.fonts) document.fonts.ready.then(() => requestAnimationFrame(parkAccessories));

  // ---- Press: a closed pile is taken as a whole, open pieces are taken one at a time (a press on the button cell goes to the button) ----
  document.querySelectorAll(".s-piece[data-sku]").forEach((row) => {
    row.addEventListener("click", (e) => {
      if (e.target.closest(".s-piece__side")) return;
      if (row.closest(".s-wall").dataset.state !== "open") return;
      site.setQty(row.dataset.sku, site.qty(row.dataset.sku) + 1);
      site.pulse(row.querySelector(".s-piece__pic"));
    });
  });
  document.querySelectorAll(".s-acc__cell[data-sku]").forEach((cell) => {
    cell.addEventListener("click", (e) => {
      if (e.target.closest(".s-piece__side")) return;
      site.setQty(cell.dataset.sku, site.qty(cell.dataset.sku) + 1);
      site.pulse(cell.querySelector(".s-acc__pic"));
    });
  });
  document.querySelectorAll(".s-stack").forEach((stack) => {
    stack.addEventListener("click", (e) => {
      if (stack.closest(".s-wall").dataset.state !== "closed") return;
      if (e.target.closest(".s-buy")) return;
      if (stack.dataset.sku) {
        site.setQty(stack.dataset.sku, site.qty(stack.dataset.sku) + 1);
        site.pulse(stack);
      } else if (stack.dataset.waitlist && site.openWaitlist) {
        site.openWaitlist(stack.dataset.waitlist);
      }
    });
  });
  site.syncHint();
})();
