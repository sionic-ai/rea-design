// Home page: opening, Hero sequential entrance, card hover text typing, illustration slot filling, filtering cards with category pills (the original moves to a per-category URL, but the result looks the same so it filters in place).
(() => {
  // After the opening, the Hero rises 16px from below over .5s in the original order — category bar .75 · wordmark .8 · featured post .9 · left column 1 · progress number 1.1
  // Like the original, the opening plays once per session — reopening shows only the hero rising without the curtain
  const opening = document.querySelector(".nt-opening");
  let seen = false;
  try { seen = sessionStorage.getItem("nt-opening") === "1"; sessionStorage.setItem("nt-opening", "1"); } catch (e) {}
  if (opening && seen) opening.remove();
  const mm = gsap.matchMedia();
  // The original runs appear on window load (after photos and fonts are all downloaded) — before that the curtain and hero wait in their initial form
  mm.add({ motion: "(prefers-reduced-motion: no-preference)" }, () => {
    const tl = gsap.timeline({ paused: document.readyState !== "complete" });
    if (tl.paused()) addEventListener("load", () => tl.play(), { once: true });
    if (opening?.isConnected) {
      tl.to(opening.firstElementChild, { height: 0, duration: 1, ease: "ntSwing" }, 0.2)
        .to(opening, { opacity: 0, height: 0, duration: 0.6, ease: "ntSwing", onComplete: () => gsap.set(opening, { display: "none" }) }, 0.7);
    }
    [[".nt-cats", 0.75], [".hero__mark", 0.8], [".hero__pick", 0.9], [".hero__l", 1], [".hero__prog", 1.1]].forEach(([sel, at]) => {
      const el = document.querySelector(sel);
      if (el) tl.fromTo(el, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, ease: "ntSwing" }, at);
    });
  });
  if (NT.reduced && opening) opening.style.display = "none";

  // Card hover text (original hover-text-*): every 100ms checks whether the text plate is visible (opacity .1 or more), and the moment it becomes visible, erases the text and types it one character per 40ms.
  // When typing finishes, READ MORE lights up with .4s ease, and when the board hides again the text is restored
  if (!NT.reduced) {
    const items = [...document.querySelectorAll(".tile__over")].map((over) => {
      const p = over.querySelector("p"), more = over.querySelector(".tile__more");
      if (more) { more.style.opacity = "0"; more.style.transition = "opacity 0.4s ease"; }
      const text = p ? p.textContent.trim() : "";
      // At rest the text is left empty so the group shrinks to 225px (original _c71) — only the height is reserved in advance
      if (p && text) { p.style.minHeight = p.offsetHeight + "px"; p.textContent = ""; }
      return { over, p, more, text, timers: [], busy: false, was: false };
    }).filter((it) => it.p && it.text);
    const visible = (it) => parseFloat(getComputedStyle(it.over).opacity) >= 0.1;
    const type = (it) => {
      it.busy = true;
      it.p.textContent = "";
      it.p.style.opacity = "1";
      if (it.more) it.more.style.opacity = "0";
      let i = 0;
      const step = () => {
        if (i < it.text.length) { it.p.textContent += it.text.charAt(i++); it.timers.push(setTimeout(step, 40)); }
        else { it.busy = false; if (it.more) it.more.style.opacity = "1"; }
      };
      step();
    };
    const reset = (it) => { it.timers.forEach(clearTimeout); it.timers = []; it.busy = false; it.p.style.opacity = "0"; it.p.textContent = ""; if (it.more) it.more.style.opacity = "0"; };
    if (items.length) setInterval(() => items.forEach((it) => {
      const now = visible(it);
      if (now && !it.was && !it.busy) type(it);
      else if (!now && it.was) reset(it);
      it.was = now;
    }), 100);
  }

  document.querySelectorAll("[data-people]").forEach((el) => (el.innerHTML = NT.people(el.dataset.people)));

  const pills = [...document.querySelectorAll(".nt-cats [data-filter]")];
  const cards = [...document.querySelectorAll(".grid .card")];
  pills.forEach((p) =>
    p.addEventListener("click", () => {
      pills.forEach((q) => q.classList.toggle("is-on", q === p));
      const f = p.dataset.filter;
      cards.forEach((c) => c.classList.toggle("is-hidden", f !== "all" && c.dataset.cat !== f && c.dataset.cat !== "Category"));
      ScrollTrigger.refresh();
    })
  );
})();
