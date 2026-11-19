// Work list: filter by type and category (URL ?type=&category= left in) · fill-in blanks · work window.
// The work window opens at the clicked card’s position (±10px jitter), .8x→1 in .12s power4.out, and its head can be dragged. Closing returns to the list address with a swup piece transition.
(() => {
  const IC = window.IC;
  // Original empty cell positions — which cell in every ten is left blank (per width)
  const SPACE = { pc: [1, 4, 8], w1280: [1, 3, 8], w1024: [1, 2, 6], w768: [1, 4, 8] };

  const mount = ({ initial, scope }) => {
    const off = [];
    const list = scope.querySelector(".ic-works__list");
    const items = [...scope.querySelectorAll(".ic-works__item")];
    const count = scope.querySelector(".ic-works__count");
    const spacers = [...scope.querySelectorAll(".ic-works__spacer")];
    const q = new URLSearchParams(location.search);
    const state = { type: q.get("type") || "all", category: q.get("category") || "all" };
    const apply = () => {
      let n = 0;
      items.forEach((it) => {
        const ok = (state.type === "all" || it.dataset.type === state.type) && (state.category === "all" || it.dataset.category === state.category);
        it.hidden = !ok; if (ok) n++;
      });
      count.textContent = `(${String(n).padStart(2, "0")} Works)`;
      list.dataset.filtered = String(!(state.type === "all" && state.category === "all"));
      [`#type-${state.type}`, `#category-${state.category}`].forEach((s) => { const r = scope.querySelector(s); if (r) r.checked = true; });
    };
    const choose = (e) => {
      const t = e.target;
      if (t.name !== "type" && t.name !== "category") return;
      state[t.name] = t.value;
      const p = new URLSearchParams(location.search);
      state.type === "all" ? p.delete("type") : p.set("type", state.type);
      state.category === "all" ? p.delete("category") : p.set("category", state.category);
      history.replaceState(history.state, "", `${location.pathname}${p.toString() ? `?${p}` : ""}`);
      apply();
    };
    scope.addEventListener("change", choose);
    off.push(() => scope.removeEventListener("change", choose));
    apply();
    const space = () => {
      const w = innerWidth;
      if (w <= 576) return spacers.forEach((s) => (s.dataset.active = "false"));
      const pick = w <= 768 ? SPACE.w768 : w <= 1024 ? SPACE.w1024 : w <= 1280 ? SPACE.w1280 : SPACE.pc;
      spacers.forEach((s, i) => (s.dataset.active = String(pick.includes(i % 10))));
    };
    space(); addEventListener("resize", space); off.push(() => removeEventListener("resize", space));

    // ───── Work window ─────
    const posts = scope.querySelector("#ic-posts");
    const post = posts.querySelector("[data-post]");
    let dragOff = null;
    const place = (card) => {
      if (IC.isSp()) { post.style.top = ""; post.style.left = ""; return; }
      const r = post.getBoundingClientRect();
      const top = scrollY + (innerHeight - r.height) * 0.5;
      if (card) {
        const c = card.getBoundingClientRect();
        const left = gsap.utils.mapRange(-r.width / 2, innerWidth - r.width / 2, 0, innerWidth - r.width, c.left - r.width / 2 + c.width / 2);
        post.style.top = `${top + Math.floor(Math.random() * 20) - 10}px`;
        post.style.left = `${left}px`;
      } else { post.style.top = `${top}px`; post.style.left = `${(innerWidth - r.width) / 2}px`; }
    };
    const open = (card, animate = true) => {
      const title = card?.querySelector(".ic-works__title")?.textContent;
      if (title) post.querySelectorAll("[data-post-title]").forEach((t) => (t.textContent = title));
      post.style.transform = "";
      place(card);
      dragOff?.(); dragOff = IC.drag(post, { handle: post.querySelector(".ic-win__head"), group: "works", dynamic: true });
      post.setAttribute("aria-hidden", "false");
      posts.dataset.open = "post-01";
      post.querySelector(".ic-post__body").scrollTo(0, 0);
      if (animate && !IC.reduced) gsap.fromTo(post, { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.12, ease: "power4.out" });
    };
    const close = () => {
      post.setAttribute("aria-hidden", "true");
      posts.dataset.open = "";
      dragOff?.(); dragOff = null;
      if (IC.swup && /detail\.html$/.test(location.pathname)) IC.swup.navigate(`works.html${location.search}`);
      else if (/detail\.html$/.test(location.pathname)) history.replaceState(history.state, "", `works.html${location.search}`);
    };
    const onCard = (e) => {
      const a = e.target.closest("[data-card]");
      if (!a) return;
      e.preventDefault();
      open(a);
      if (!/detail\.html$/.test(location.pathname)) history.pushState(history.state, "", `detail.html${location.search}`);
    };
    scope.querySelectorAll("[data-card]").forEach((a) => a.setAttribute("data-no-swup", ""));
    scope.addEventListener("click", onCard);
    const closers = [post.querySelector(".ic-win__close"), post.querySelector("[data-post-close]"), posts.querySelector("[data-post-overlay]")];
    closers.forEach((b) => b.addEventListener("click", close));
    const outside = (e) => { if (posts.dataset.open && !e.target.closest("[data-post]") && !e.target.closest("[data-card]")) close(); };
    const esc = (e) => { if (e.key === "Escape" && posts.dataset.open && !full.open) close(); };
    document.addEventListener("click", outside); document.addEventListener("keydown", esc);
    off.push(() => { scope.removeEventListener("click", onCard); closers.forEach((b) => b.removeEventListener("click", close)); document.removeEventListener("click", outside); document.removeEventListener("keydown", esc); dragOff?.(); });

    // Enlarged view — full-screen dialog, .15s opacity
    const full = post.querySelector(".ic-full");
    // Like the original, on open pins the body in place (position: fixed) so the page behind does not scroll, and on close releases it back to where it was
    const content = document.querySelector(".ic-content");
    let held = 0;
    const lock = () => { held = scrollY; Object.assign(content.style, { position: "fixed", top: `${-held}px`, left: "0px" }); };
    const unlock = () => { Object.assign(content.style, { position: "", top: "", left: "" }); scrollTo(0, held); };
    const showFull = () => { full.showModal(); full.scrollTo(0, 0); lock(); requestAnimationFrame(() => full.setAttribute("data-active", "true")); };
    const hideFull = () => { unlock(); full.setAttribute("data-active", "false"); setTimeout(() => full.close(), 150); };
    post.querySelector(".ic-post__full").addEventListener("click", showFull);
    full.querySelector(".ic-full__close").addEventListener("click", hideFull);
    full.querySelector(".ic-full__overlay").addEventListener("click", hideFull);
    full.addEventListener("cancel", (e) => { e.preventDefault(); hideFull(); });

    if (posts.dataset.open) {
      const card = scope.querySelector(`[data-card="${posts.dataset.open}"]`);
      if (initial) IC.onOpenEnd(() => open(null)); else open(card);
    }
    return () => off.forEach((f) => f());
  };
  IC.page("works", mount);
  IC.page("detail", mount);
})();
