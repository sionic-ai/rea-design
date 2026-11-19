// Brand — shared by the four pages that use the header and footer. When the entrance gate (ink-sink-gate) starts to lift (fx:open) the header turns on in order, and only then the section reveal is applied.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Same Lenis 1.3.3 defaults as the original (lerp .1), and boxes that scroll inside are left as they are
  if (window.Lenis && !reduce) {
    const lenis = new Lenis({ prevent: (node) => !!(node.closest && node.closest(".ft-scrollbox")) });
    window.lenis = lenis;
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }

  const page = document.body.dataset.page;
  document.querySelectorAll(".ft-menu nav li").forEach((li) => {
    if (li.dataset.page && li.dataset.page === page) li.classList.add("is-on");
  });

  const opened = [];
  const afterGate = (fn) => opened.push(fn);
  let isOpen = false;
  const open = () => {
    if (isOpen) return;
    isOpen = true;
    opened.forEach((fn) => fn());
  };
  const gate = document.querySelector('[data-fx~="ink-sink-gate"]');
  if (gate && !reduce) document.addEventListener("fx:open", open, { once: true });
  else requestAnimationFrame(open);

  // Header: wordmark .2s · info group .5s · large menu 1s + .1s stagger · small menu 1.1s + .1s stagger (original setTimeout values as is)
  afterGate(() => {
    const head = document.querySelector("header.ft-menu");
    if (!head) return;
    const at = (el, ms) => el && setTimeout(() => el.classList.add("is-in"), reduce ? 0 : ms);
    at(head.querySelector(".ft-menu__mark"), 200);
    at(head.querySelector(".ft-menu__wrap"), 500);
    head.querySelectorAll(".ft-nav1 li").forEach((li, i) => at(li, 1000 + i * 100));
    head.querySelectorAll(".ft-nav2 li").forEach((li, i) => at(li, 1100 + i * 100));
  });

  // Section title and copy: once at 40% visible, 1.5s from 20px below
  afterGate(() => {
    const els = document.querySelectorAll(".ft-fade");
    if (reduce) return els.forEach((el) => el.classList.add("is-show"));
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("is-show");
      io.unobserve(e.target);
    }), { threshold: 0.4 });
    els.forEach((el) => io.observe(el));
  });

  // Language switch panel — panels within one group (.ft-switch-area) change together. While hovered, a pill for the language to switch to appears beside the cursor (+10, −10)
  const icon = document.createElement("div");
  icon.className = "ft-lang-icon";
  icon.setAttribute("aria-hidden", "true");
  icon.innerHTML = '<svg viewBox="0 0 34 19"><rect x=".5" y=".5" width="33" height="18" rx="9"/><text x="17" y="13" text-anchor="middle"></text></svg>';
  document.body.append(icon);
  const label = icon.querySelector("text");
  const setIcon = (lang) => { label.textContent = lang === "ko" ? "EN" : "KO"; };
  let mx = 0, my = 0, pending = false;
  const place = () => { pending = false; icon.style.left = `${mx + 10}px`; icon.style.top = `${my - 10}px`; };
  document.querySelectorAll(".ft-switch").forEach((sw) => {
    if (!sw.dataset.lang) sw.dataset.lang = "ko";
    sw.addEventListener("click", () => {
      const next = sw.dataset.lang === "ko" ? "en" : "ko";
      const area = sw.closest(".ft-switch-area");
      (area ? area.querySelectorAll(".ft-switch") : [sw]).forEach((el) => { el.dataset.lang = next; });
      if (icon.style.display === "block") setIcon(next);
    });
    sw.addEventListener("mouseenter", () => { setIcon(sw.dataset.lang); icon.style.display = "block"; });
    sw.addEventListener("mousemove", (e) => {
      mx = e.clientX; my = e.clientY;
      if (!pending) { pending = true; requestAnimationFrame(place); }
    });
    sw.addEventListener("mouseleave", () => { icon.style.display = "none"; });
  });

  window.ftAfterGate = (fn) => (isOpen ? fn() : afterGate(fn));
})();
