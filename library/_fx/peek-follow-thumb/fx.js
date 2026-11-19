(() => {
  // With the pointer over the list, a small preview cell follows the cursor .4s late, and each time the row changes a new picture slides up from below at a slant (skewY -10) and straightens as it settles
  // The front image slides out upward. Two images are used alternately. If the row has no data-label (image description) or data-thumb (image address), a ”no image” board shows.
  kfFx.register("peek-follow-thumb", (el, { options, reduce, hover }) => {
    const rows = () => [...el.querySelectorAll('[data-fx-part="row"]')];
    if (!hover || reduce || !rows().length) return;
    const follow = +(options.follow ?? 0.4), dur = +(options.dur ?? 1), skew = +(options.skew ?? -10);
    const peek = document.createElement("div");
    peek.className = "fx-pft";
    peek.setAttribute("aria-hidden", "true");
    peek.innerHTML = '<div class="fx-pft__screen"><div class="fx-pft__card"></div><div class="fx-pft__card"></div></div>';
    // Like the original, keep it inside the list (fixed, so position is relative to the screen) — it leaves along with the list
    el.prepend(peek);
    const cards = [...peek.querySelectorAll(".fx-pft__card")];
    let turn = 0, fade = null, a = null, b = null;
    const qx = gsap.quickTo(peek, "x", { duration: follow, ease: "power3.out" }), qy = gsap.quickTo(peek, "y", { duration: follow, ease: "power3.out" });
    const ac = new AbortController(), on = { signal: ac.signal };
    // Like the original, the position is not fixed on entry. It follows from the last position (at first the top left of the screen) to the cursor in .4s.
    el.addEventListener("pointerenter", (e) => { if (e.pointerType !== "mouse") return; fade?.kill(); fade = gsap.to(peek, { opacity: 1, duration: 0.5 }); }, on);
    el.addEventListener("pointerleave", () => {
      fade?.kill();
      fade = gsap.to(peek, { opacity: 0, duration: 0.5, onComplete: () => cards.forEach((c) => { c.className = "fx-pft__card"; c.textContent = ""; c.style.backgroundImage = ""; gsap.set(c, { clearProps: "transform" }); }) });
    }, on);
    el.addEventListener("pointermove", (e) => { if (e.pointerType === "mouse") { qx(e.clientX); qy(e.clientY); } }, on);
    const enterRow = (row) => {
      const inCard = cards[turn], outCard = cards[1 - turn];
      turn = 1 - turn;
      const src = row.dataset.thumb, label = row.dataset.label;
      inCard.className = "fx-pft__card" + (src ? "" : label ? " is-label" : " is-empty");
      inCard.style.backgroundImage = src ? `url("${src}")` : "";
      inCard.textContent = src ? "" : label || "no image";
      a?.kill(); b?.kill();
      a = gsap.timeline().set(inCard, { yPercent: 20, skewY: skew }).to(inCard, { yPercent: -100, duration: dur, ease: "power4.out" }).to(inCard, { skewY: 0, duration: dur, ease: "power2.out" }, `-=${dur}`);
      b = gsap.timeline().to(outCard, { yPercent: -220, duration: dur, ease: "power4.out" }).to(outCard, { skewY: skew, duration: dur, ease: "power2.out" }).set(outCard, { yPercent: 20 });
    };
    el.addEventListener("pointerover", (e) => {
      const row = e.target.closest('[data-fx-part="row"]');
      if (!row || !el.contains(row) || (e.relatedTarget && row.contains(e.relatedTarget))) return;
      enterRow(row);
    }, on);
    return () => { ac.abort(); fade?.kill(); a?.kill(); b?.kill(); gsap.killTweensOf(peek); peek.remove(); };
  });
})();
