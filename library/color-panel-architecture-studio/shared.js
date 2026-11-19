/* Interaction and paging for the whole site. Values are read from the original bundle (src/javascript/index.js). 
   - Transition: barba (2.10.3) without sync — the body fades to transparent in .5s (gsap default power1.out) → switch the body class to the page name and the panel fills via css transition (all .5s) while the color changes → the new body fades in over .5s
   - Slider: swiper 11.2.0 (loop · page fraction). The half-screen triangle cursor (half-arrow-cursor) fires fx:prev and fx:next to turn the slides
   - The Less/More list after it (drift-scroll-loop) flows only on Home and stays still on sub pages */
(() => {
  const html = document.documentElement, body = document.body;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const list = document.querySelector(".as-list");
  const PAGES = ["home", "work", "information", "index", "single-work"];

  /* ── Subscribe: pressing opens the input field, the next outside press closes it ── */
  const subForm = document.querySelector(".as-sub form"), subResp = document.querySelector(".as-sub-resp");
  const resetSub = () => { subForm?.removeAttribute("style"); subResp?.removeAttribute("style"); if (subResp) subResp.textContent = ""; subForm?.reset(); };
  const closeSub = (e) => {
    if (e.target.closest(".as-sub")) return;
    html.classList.remove("is-sub-open");
    resetSub();
    removeEventListener("click", closeSub);
    removeEventListener("touchstart", closeSub);
  };
  document.querySelector(".as-sub-btn")?.addEventListener("click", (e) => {
    e.preventDefault();
    html.classList.toggle("is-sub-open");
    setTimeout(() => { addEventListener("click", closeSub); addEventListener("touchstart", closeSub); });
  });
  subForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    subForm.style.display = "none";
    subResp.style.display = "block";
    subResp.textContent = "Thank you for subscribing";
    setTimeout(resetSub, 5000);
  });

  /* ── Phone menu: brown panel (css transform .5s) and contact accordion (height .3s → opacity .3s) ── */
  document.querySelector(".as-toggle")?.addEventListener("click", () => body.classList.toggle("is-menu-open"));
  const mc = document.querySelector(".as-mcontact");
  if (mc) {
    const head = mc.querySelector(".as-mcontact-toggle"), text = mc.querySelector(".as-mcontact-text");
    head.addEventListener("click", (e) => {
      e.preventDefault();
      const open = mc.classList.contains("is-open");
      const d = reduce ? 0 : 0.3;
      if (open) gsap.timeline().to(text, { opacity: 0, duration: d }).to(text, { height: 0, duration: d });
      else gsap.timeline().to(text, { height: "auto", duration: d }).to(text, { opacity: 1, duration: d });
      mc.classList.toggle("is-open", !open);
      head.textContent = open ? "Contact" : "Close";
    });
  }

  /* ── Attach to every page ── */
  // Settles in .3s after the photo loads — a placeholder has nothing to load so let it paint once and then settle into the frame (if it’s the same frame the transition doesn’t run)
  const loaded = (els) => requestAnimationFrame(() => requestAnimationFrame(() => els.forEach((e) => e.classList.add("is-loaded"))));
  const slider = (root, sel, opts = {}) => {
    const el = root.querySelector(sel);
    if (!el || !window.Swiper) return null;
    const sw = new Swiper(el, { loop: true, speed: reduce ? 0 : 300, pagination: { el: root.querySelector(".swiper-pagination"), type: "fraction" }, ...opts });
    loaded(el.querySelectorAll(".as-lazy"));
    el.addEventListener("fx:prev", () => sw.slidePrev());
    el.addEventListener("fx:next", () => sw.slideNext());
    return sw;
  };

  const views = {
    home() { list?.dispatchEvent(new CustomEvent("fx:play")); },
    work(root, from) {
      // Returning from the detail page goes to that work’s section — the original finds the section whose link matches the previous URL
      const slides = [...root.querySelectorAll(".as-work-slider .swiper-slide")];
      const at = Math.max(0, slides.findIndex((s) => from && s.querySelector("a")?.href === from));
      return slider(root, ".as-work-slider", { initialSlide: at });
    },
    information(root) {
      const sw = slider(root, ".as-info-slider");
      // Underlined body word → a panel-colored block slides out from the left to half width in .3s (the original clones the block, attaches it to the end of the body, and detaches it 300ms after closing)
      root.querySelectorAll(".as-popup").forEach((pop) => {
        const btn = root.querySelector(`a[href="#${pop.id}"]`);
        btn?.addEventListener("click", (e) => {
          e.preventDefault();
          btn.classList.add("is-active");
          const c = pop.cloneNode(true);
          c.removeAttribute("id");
          body.append(c);
          c.style.display = "block";
          setTimeout(() => c.classList.add("is-open"), 40);
          c.querySelectorAll(".as-popup-close").forEach((x) => x.addEventListener("click", (ev) => {
            ev.preventDefault();
            c.classList.remove("is-open");
            setTimeout(() => { btn.classList.remove("is-active"); c.remove(); }, 300);
          }));
        });
      });
      // Accordion — only one open at a time. Height uses the gsap default (.5s power1.out)
      root.querySelectorAll(".as-acc").forEach((acc) => {
        const text = acc.querySelector(".as-acc-text");
        acc.querySelector(".as-acc-head").addEventListener("click", () => {
          const d = reduce ? 0 : 0.5;
          if (acc.classList.contains("is-open")) {
            gsap.to(text, { height: 0, duration: d });
            acc.classList.remove("is-open");
            return;
          }
          const was = root.querySelector(".as-acc.is-open");
          if (was) { gsap.to(was.querySelector(".as-acc-text"), { height: 0, duration: d }); was.classList.remove("is-open"); }
          gsap.to(text, { height: "auto", duration: d });
          acc.classList.add("is-open");
        });
      });
      return sw;
    },
    index(root) {
      loaded(root.querySelectorAll(".as-fadein"));
    },
    "single-work"(root, from) {
      const close = root.querySelector(".as-close-project");
      if (close && from) close.href = from;
      const wrap = root.querySelector(".as-single"), views = root.querySelector(".as-views");
      if (views) {
        const [toImgs, toInfo] = views.querySelectorAll("a");
        toInfo.addEventListener("click", (e) => { e.preventDefault(); wrap.classList.add("is-info-open"); toImgs.classList.remove("is-active"); toInfo.classList.add("is-active"); });
        toImgs.addEventListener("click", (e) => { e.preventDefault(); wrap.classList.remove("is-info-open"); toImgs.classList.add("is-active"); toInfo.classList.remove("is-active"); });
      }
      // The original doesn’t pass the Pagination module to this slider, so the page-number slot is empty
      return slider(root, ".as-single-slider", { pagination: false });
    },
  };

  let mounted = null;
  const enter = (container, from) => {
    const ns = container.dataset.barbaNamespace;
    PAGES.forEach((p) => body.classList.toggle(`is-${p}`, p === ns));
    if (ns !== "home") list?.dispatchEvent(new CustomEvent("fx:pause"));
    document.querySelectorAll(".as-menu li").forEach((li) => li.classList.toggle("is-current", li.dataset.page === ns));
    mounted = views[ns]?.(container, from) || null;
  };
  // Body classes are removed and attached in a single frame at enter — so the board doesn’t drop and rise again while the next section’s css loads (the original runs afterLeave·beforeEnter back to back)
  const leave = () => {
    mounted?.destroy?.(true, false);
    mounted = null;
  };

  // Parts (drift-scroll-loop · half-arrow-cursor) are attached by fx-core on DOMContentLoaded — the first page must be attached after that so the pause signal reaches it
  const first = document.querySelector('[data-barba="container"]');
  const boot = () => {
    enter(first, document.referrer || "");
    if (window.barba && /^https?:$/.test(location.protocol)) startBarba();
    else plainNav();
  };
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", boot, { once: true }) : queueMicrotask(boot);

  // CSS found only on the next page is attached to the head before navigating, and unused ones are removed after
  const abs = (h) => new URL(h, location.href).href;
  const bring = async (htmlText) => {
    const doc = new DOMParser().parseFromString(htmlText, "text/html");
    const want = [...doc.querySelectorAll('link[rel="stylesheet"]')].map((l) => abs(l.getAttribute("href")));
    const have = [...document.querySelectorAll('link[rel="stylesheet"]')];
    await Promise.all(want.filter((h) => !have.some((l) => l.href === h)).map((href) => new Promise((r) => {
      document.head.append(Object.assign(document.createElement("link"), { rel: "stylesheet", href, onload: r, onerror: r }));
      setTimeout(r, 800);
    })));
    return () => document.querySelectorAll('link[rel="stylesheet"]').forEach((l) => want.includes(l.href) || l.remove());
  };

  function startBarba() {
    let drop = null;
    barba.init({
      prevent: ({ el }) => {
        const raw = el?.getAttribute?.("href") || "";
        return el.classList?.contains("prevent") || !raw || raw.startsWith("#") || el.target === "_blank" || /^(mailto|tel):/.test(raw);
      },
      transitions: [{
        name: "opacity-transition",
        sync: false,
        leave({ current }) {
          body.classList.remove("is-menu-open");
          return gsap.to(current.container, { opacity: 0, duration: reduce ? 0 : 0.5 });
        },
        afterLeave({ current }) {
          current.container.style.display = "none";
          leave();
        },
        async beforeEnter({ current, next }) {
          drop = await bring(next.html);
          enter(next.container, current.url.href);
        },
        enter({ next }) {
          scrollTo(0, 0);
          return gsap.from(next.container, { opacity: 0, duration: reduce ? 0 : 0.5 });
        },
        after() { drop?.(); drop = null; },
      }],
    });
  }

  // barba fetches the next document and cannot run on file:// — after clearing the body in the same .5s, move the address
  function plainNav() {
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || e.defaultPrevented || a.target === "_blank" || e.metaKey || e.ctrlKey || e.shiftKey) return;
      if (!/\.html(\?.*)?$/.test(a.getAttribute("href"))) return;
      e.preventDefault();
      body.classList.remove("is-menu-open");
      gsap.to(first, { opacity: 0, duration: reduce ? 0 : 0.5, onComplete: () => { location.href = a.href; } });
    });
    addEventListener("pageshow", (e) => e.persisted && gsap.set(first, { clearProps: "opacity" }));
  }
})();
