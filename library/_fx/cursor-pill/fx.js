// One dot always follows the cursor (.4s power3), and over a child with a label it expands into a pill holding that text.
// Pills blend with difference, so each takes a different color from the photo below. One cursor per panel, hidden outside the panel
(() => {
  kfFx.register("cursor-pill", (el, { options, reduce, hover }) => {
    if (!hover) return;
    const ac = new AbortController(), signal = ac.signal;
    const follow = +(options.follow ?? 0.4), ease = options.ease || "power3";
    // look: plain — no dots or difference blending, only a pale pill lights up over the name tag in .2s (Brand Read the article)
    const plain = options.look === "plain";
    const cur = document.createElement("div");
    cur.className = plain ? "fx-cpill is-plain" : "fx-cpill";
    cur.setAttribute("aria-hidden", "true");
    cur.innerHTML = '<div class="fx-cpill__card"><span class="fx-cpill__text"></span></div>';
    document.body.append(cur);
    const text = cur.querySelector(".fx-cpill__text");
    const qx = gsap.quickTo(cur, "x", { duration: reduce ? 0 : follow, ease });
    const qy = gsap.quickTo(cur, "y", { duration: reduce ? 0 : follow, ease });
    let lx = 0, ly = 0, active = null;
    // Re-find by coordinates so the pill updates even when scrolling changes what is under the cursor
    const check = () => {
      const under = document.elementFromPoint(lx, ly);
      const inside = !!under && el.contains(under);
      if (!plain) cur.classList.toggle("is-out", !inside);
      const hit = inside ? under.closest("[data-fx-part=target]") : null;
      if (hit === active) return;
      if (active) cur.dataset.status = "not-active";
      active = null;
      if (hit && el.contains(hit)) {
        if (!reduce && !plain) gsap.fromTo(cur, { scale: 0.85 }, { scale: 1, duration: 0.7, ease: "back.out(2)" });
        text.textContent = hit.getAttribute("data-label") || options.text || "View";
        cur.dataset.status = "active";
        active = hit;
        if (plain) { const card = cur.firstElementChild; half = [card.offsetWidth / 2, card.offsetHeight / 2]; }
      }
    };
    let half = [0, 0];
    const follow2 = () => { if (!plain) { qx(lx); qy(ly); } else if (active) { qx(lx - half[0]); qy(ly - half[1]); } };
    addEventListener("pointermove", (e) => { lx = e.clientX; ly = e.clientY; check(); follow2(); }, { passive: true, signal });
    addEventListener("scroll", () => { check(); follow2(); }, { passive: true, signal });
    // Also re-detect on the enter event the browser fires when the cursor is still but the element below changes (window closes and the card is revealed)
    addEventListener("pointerover", (e) => { lx = e.clientX; ly = e.clientY; check(); follow2(); }, { passive: true, signal });
    const t = setTimeout(() => { if (!cur.dataset.status) cur.dataset.status = "not-active"; }, 500);
    if (!plain) el.classList.add("fx-cpill-zone");
    return () => { ac.abort(); clearTimeout(t); cur.remove(); el.classList.remove("fx-cpill-zone"); };
  });
})();
