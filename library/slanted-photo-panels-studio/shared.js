(() => {
  const html = document.documentElement;
  const head = document.querySelector(".uv-head");
  const views = document.querySelector(".uv-views");
  const contact = document.querySelector(".uv-contact");
  const blur = document.querySelector(".uv-contact__blur");
  const contactBtn = document.querySelector("[data-contact]");
  const isHome = document.body.dataset.page === "home";
  let dur = { head: 0.75, view: 0.75, stagger: 0.15 };
  gsap.matchMedia().add("(prefers-reduced-motion: reduce)", () => {
    const keep = dur;
    dur = { head: 0, view: 0, stagger: 0 };
    return () => { dur = keep; };
  });

  // Header and view switch — on the hero it turns on after loading finishes (uv:ready), on subpages right away in .75s power1.inOut
  function showChrome() {
    if (head) gsap.to(head, { opacity: 1, ease: "power1.inOut", duration: dur.head });
    if (views && views.dataset.show !== undefined) {
      gsap.set(views, { pointerEvents: "all" });
      gsap.to(views, { opacity: 1, ease: "power1.inOut", duration: dur.view, stagger: 0.075 });
    }
  }
  if (isHome) document.addEventListener("uv:ready", showChrome, { once: true });
  else showChrome();
  // The original skips the loading number when entering a subpage first — even if you reach the Hero afterward, only panel lines flow in without the number
  if (!isHome) try { sessionStorage.setItem("uv-loaded", "1"); } catch (e) {}

  // Page transition — in the original, the new page panel (background color) rises over the old screen in .75s power1.inOut.
  // Here, split across multiple documents, a View Transition between documents holds the old screen and swaps by overlapping with the same length and curve (@view-transition in shared.css)
  // Only when going to the hero, as in the original, the background-color veil covers as soon as it is pressed, and the hero lifts that veil after .25s over .75s (index.js)
  const toHome = (href) => /(^|\/)index\.html(?:[?#]|$)/.test(href);
  function go(href) {
    if (toHome(href) && !isHome) {
      // The original counts .25s from when the transition starts and then lifts the curtain — it also passes along the press time so that the time the Hero document loads falls within that .25s (index.js)
      try { sessionStorage.setItem("uv-nav-at", String(Date.now())); } catch (e) {}
      // In the original the curtain covers about three frames (≈.05s) after pressing. The curtain is painted once, then it navigates — navigating immediately makes the browser hold the old screen so the curtain isn’t seen
      const frames = (n, fn) => (n ? requestAnimationFrame(() => frames(n - 1, fn)) : fn());
      frames(3, () => {
        const cover = document.createElement("div");
        cover.className = "uv-cover is-leaving";
        document.body.append(cover);
        frames(2, () => { location.href = href; });
      });
    } else location.href = href;
  }
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || a.target === "_blank" || e.metaKey || e.ctrlKey || e.shiftKey || e.defaultPrevented) return;
    if (a.closest(".uv-contact")) setContact(false);
    const href = a.getAttribute("href");
    if (!href || href.startsWith("#") || /^[a-z]+:/i.test(href) || !toHome(href) || isHome) return;
    e.preventDefault();
    go(href);
  });
  window.uvGo = go;
  // When going to the hero the curtain already covers the old screen, so nothing needs cross-swapping — skip the document transition so the curtain lift isn’t delayed by that much
  addEventListener("pageswap", (e) => {
    const to = e.activation?.entry?.url;
    if (e.viewTransition && !isHome && to && toHome(new URL(to).pathname)) e.viewTransition.skipTransition();
  });
  addEventListener("pageshow", (e) => { if (e.persisted) document.querySelectorAll(".uv-cover.is-leaving").forEach((c) => c.remove()); });

  // Contact panel — button rows turn on at .15s intervals over .75s (all at once in .25s when closing) and the back blurs. Closes with Esc or an outside click
  const items = contact ? [...contact.querySelectorAll("li"), contact.querySelector(".uv-contact__pages")].filter(Boolean) : [];
  let open = false;
  function setContact(v) {
    if (!contact || v === open) return;
    open = v;
    html.classList.toggle("uv-contact-open", v);
    contactBtn?.classList.toggle("is-active", v);
    document.querySelectorAll(".uv-head .uv-btn[data-here]").forEach((b) => b.classList.toggle("is-active", !v));
    gsap.killTweensOf(items); gsap.killTweensOf(blur);
    gsap.set([contact, ...items, blur], { pointerEvents: v ? "all" : "none" });
    gsap.to(items, { opacity: v ? 1 : 0, ease: "power1.inOut", duration: v ? dur.view : dur.view && 0.25, stagger: v ? dur.stagger : 0 });
    if (blur) gsap.to(blur, { opacity: v ? 1 : 0, ease: "power1.inOut", duration: dur.view });
    document.dispatchEvent(new CustomEvent("uv:contact", { detail: { open: v } }));
  }
  contactBtn?.addEventListener("click", (e) => { e.stopPropagation(); setContact(!open); });
  contact?.addEventListener("click", (e) => { if (!e.target.closest("a")) setContact(false); });
  addEventListener("keydown", (e) => { if (e.key === "Escape") setContact(false); });
})();
