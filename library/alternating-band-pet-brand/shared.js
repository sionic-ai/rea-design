// Shared by all brand — scroll reveal, header line color, phone menu, footer collapse, FAQ expand.
// The original uses jQuery fadeIn(swing = sine.inOut), CSS transitions and keyframes. The same length and curve are produced with GSAP and CSS.
(() => {
  const nav = document.querySelector(".yk-nav");

  gsap.matchMedia().add({ reduce: "(prefers-reduced-motion: reduce)", ok: "(prefers-reduced-motion: no-preference)" }, (ctx) => {
    const { reduce } = ctx.conditions;

    // Hero staged entrance (photo 1s → logo .8s → header line and bottom text lines .9s) is handled by the hero-cue-intro part (index.html body)

    // ---------- Scroll reveal ----------
    // The original measures only when scrolling happens — once the element top rises 60px above the screen bottom, scrollin fires (once). Items visible on first open stay faint until scrolling starts.
    const fades = [...document.querySelectorAll(".fadein")];
    const check = () => {
      const vh = innerHeight;
      for (const el of fades) if (!el.classList.contains("scrollin") && el.getBoundingClientRect().top < vh - 60) el.classList.add("scrollin");
    };
    if (reduce) fades.forEach((el) => el.classList.add("scrollin"));
    else addEventListener("scroll", check, { passive: true });

    // ---------- Header bar color — ink-black after scrolling more than one screen ----------
    const tone = () => nav && nav.classList.toggle("is-dark", scrollY > innerHeight);
    addEventListener("scroll", tone, { passive: true });
    tone();

    return () => { removeEventListener("scroll", check); removeEventListener("scroll", tone); };
  });

  // ---------- Phone menu — the backdrop and list switch on and off in 200ms linear ----------
  const menu = document.querySelector(".yk-mobmenu");
  const toggler = document.querySelector(".yk-toggler");
  if (menu && toggler) {
    let open = false;
    const set = (v) => {
      open = v;
      toggler.setAttribute("aria-expanded", String(v));
      gsap.killTweensOf(menu);
      if (v) gsap.fromTo(menu, { display: "block", opacity: 0 }, { opacity: 1, duration: 0.2, ease: "none" });
      else gsap.to(menu, { opacity: 0, duration: 0.2, ease: "none", onComplete: () => gsap.set(menu, { display: "none" }) });
    };
    toggler.addEventListener("click", () => set(!open));
    menu.addEventListener("click", (e) => { if (!e.target.closest("a")) set(false); });
    addEventListener("keydown", (e) => { if (e.key === "Escape" && open) set(false); });
  }

  // ---------- Footer fold (phone) — tapping a column title opens its list and ＋ becomes － ----------
  document.querySelectorAll(".yk-footer__col h4").forEach((h) => h.addEventListener("click", () => {
    const ul = h.parentElement.querySelector("ul");
    const plus = h.querySelector(".yk-plus");
    if (!ul || !plus) return;
    ul.classList.toggle("is-open");
    plus.textContent = ul.classList.contains("is-open") ? "−" : "+";
  }));

  // ---------- FAQ — pressing a question row expands the answer in .3s and the ＋ becomes － ----------
  document.querySelectorAll(".yk-qa__q").forEach((q) => q.addEventListener("click", () => {
    const item = q.closest(".yk-qa");
    item.querySelector(".yk-qa__a")?.classList.toggle("is-open");
    item.querySelector(".yk-qa__mark")?.classList.toggle("is-open");
    q.setAttribute("aria-expanded", String(item.querySelector(".yk-qa__a")?.classList.contains("is-open")));
  }));
})();
