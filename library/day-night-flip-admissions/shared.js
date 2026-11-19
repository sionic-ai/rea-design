// Panel (dialog) · menu drawer · anchor scrolling — original main.js·header.js behavior as is. At 768 and up the center column (#contents) is the scroll panel
(() => {
  const body = document.body;
  const pc = matchMedia("(min-width: 768px)");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const contents = document.getElementById("contents");

  // Once the center cell goes down more than 800px, is-scrolled is set — the mosaic flip and the SCROLL arrow rest
  const onInner = () => body.classList.toggle("is-scrolled", contents.scrollTop > 800);
  const mode = () => {
    body.classList.toggle("is-pc", pc.matches);
    body.classList.toggle("is-sp", !pc.matches);
    if (!contents) return;
    if (pc.matches) contents.addEventListener("scroll", onInner, { passive: true });
    else { contents.removeEventListener("scroll", onInner); body.classList.remove("is-scrolled"); }
  };
  pc.addEventListener("change", mode);
  mode();

  // Anchors scroll smoothly — on phones, scroll less by the height of the fixed header
  document.querySelectorAll('a[href^="#"]').forEach((a) => a.addEventListener("click", (e) => {
    const id = a.getAttribute("href");
    if (!id || id === "#") return;
    const to = document.querySelector(id);
    if (!to) return;
    e.preventDefault();
    const behavior = reduce ? "auto" : "smooth";
    if (body.classList.contains("is-sp")) {
      const head = document.querySelector(".dd-sp-bar");
      window.scrollTo({ top: scrollY + to.getBoundingClientRect().top - (head ? head.offsetHeight : 0), behavior });
    } else to.scrollIntoView({ behavior });
  }));

  // Panel: lay down a scrim (.7, .5s) and showModal, pressing outside the inner area, Esc or Close dismisses it and returns focus to the link that opened it
  const scrim = document.createElement("div");
  scrim.className = "dd-scrim";
  body.append(scrim);
  let open = null, opener = null;
  const close = () => {
    if (!open) return;
    open.close();
    scrim.classList.remove("is-open");
    opener?.focus();
    open = null;
  };
  window.ddOpenModal = (id, from) => {
    const d = document.getElementById(id);
    if (!d) return;
    open = d;
    opener = from;
    d.showModal();
    scrim.classList.add("is-open");
  };
  document.querySelectorAll("[data-modal]").forEach((a) => a.addEventListener("click", (e) => {
    e.preventDefault();
    window.ddOpenModal(a.dataset.modal, a);
  }));
  document.querySelectorAll("dialog.dd-dialog").forEach((d) => {
    d.addEventListener("click", (e) => { if (!e.target.closest(".dd-dialog__inner")) close(); });
    d.addEventListener("cancel", (e) => { e.preventDefault(); close(); });
  });
  document.querySelectorAll("[data-modal-close]").forEach((b) => b.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); close(); }));
  scrim.addEventListener("click", close);

  // Menu drawer (1140 and below · phone) — slides in from the right in .5s, tapping an anchor in the menu closes it
  const nav = document.querySelector(".dd-side nav");
  const toggle = () => nav?.classList.toggle("is-open");
  document.querySelectorAll("[data-menu-open], [data-menu-close]").forEach((b) => b.addEventListener("click", toggle));
  nav?.querySelectorAll('a[href^="#"]').forEach((a) => a.addEventListener("click", () => nav.classList.remove("is-open")));
  pc.addEventListener("change", (m) => { if (m.matches) { nav?.classList.remove("is-open"); document.querySelector(".dd-side")?.classList.remove("is-in"); } });

  // Phone: after the hero mosaic, the header bar drops from the top in .3s
  const side = document.querySelector(".dd-side");
  const mv = document.getElementById("mv");
  addEventListener("scroll", () => {
    if (!body.classList.contains("is-sp") || !side || !mv) return;
    side.classList.toggle("is-in", scrollY > mv.offsetHeight);
  }, { passive: true });
})();
