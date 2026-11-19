// Spans the whole shop — smooth page scroll (speed limited), checkout bar height measuring, add-to-cart mockup, added-items strip, notice line, waitlist window
(() => {
  const site = (window.site = window.site || {});
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Two-layer limit on wheel input — 100px at a time, and the target can’t get ahead of the following position by .3 screen or more.
  // In lerp the speed is proportional to how far ahead it is, so the second is the real ceiling (about two screens per second) — a single flick can’t spread the pile wide open
  const MAX_WHEEL_DELTA = 100;
  site.speedLimit = (getLenis) => (d) => {
    const l = getLenis();
    if (!l) return;
    if (Math.abs(d.deltaY) > MAX_WHEEL_DELTA) d.deltaY = Math.sign(d.deltaY) * MAX_WHEEL_DELTA;
    const cap = 0.3 * innerHeight;
    const lead = l.targetScroll - l.animatedScroll + d.deltaY;
    if (lead > cap) d.deltaY -= lead - cap;
    else if (lead < -cap) d.deltaY -= lead + cap;
  };
  site.preventPage = () => false;

  if (!reduce && window.Lenis) {
    const lenis = new Lenis({
      virtualScroll: site.speedLimit(() => lenis),
      prevent: (node) => site.preventPage(node),
    });
    site.lenis = lenis;
    lenis.on("scroll", () => {
      ScrollTrigger.update();
      if (site.onPageScroll) site.onPageScroll(lenis);
    });
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // Two checkout bar heights — the current height (--bar-h, read only by the PC scroll panel height) and the height as if the cart bar were open (--bar-room, read by panel and piece sizes).
  // Reserve the strip height from the start so the shop size doesn’t change when the first item is added and the strip opens
  function measureBar() {
    const bar = document.querySelector(".s-bar");
    if (bar && bar.offsetHeight > 0) {
      const strip = bar.querySelector(".s-strip");
      const rem = parseFloat(getComputedStyle(root).fontSize) || 10;
      root.style.setProperty("--bar-h", bar.offsetHeight + "px");
      root.style.setProperty("--bar-room", bar.offsetHeight - (strip ? strip.offsetHeight : 0) + 7.2 * rem + "px");
    }
    const head = document.querySelector(".s-col__head");
    if (head && head.offsetHeight > 0) root.style.setProperty("--head-h", head.offsetHeight + "px");
  }
  site.measureBar = measureBar;
  measureBar();
  addEventListener("resize", measureBar);
  if (document.fonts) document.fonts.ready.then(measureBar);

  // ---- Cart model: item number → count. Buttons·total·strip on screen are all drawn from here ----
  const qty = new Map();
  const items = () => [...document.querySelectorAll("[data-sku]")];
  const info = (sku) => document.querySelector(`[data-sku="${sku}"]`);
  site.qty = (sku) => qty.get(sku) || 0;
  site.setQty = (sku, n) => {
    qty.set(sku, Math.max(0, n));
    render();
  };

  function pulse(el) {
    if (!el) return;
    el.classList.remove("is-tapped");
    void el.offsetWidth;
    el.classList.add("is-tapped");
  }
  site.pulse = pulse;

  const strip = document.querySelector(".s-strip");
  const stripItems = strip && strip.querySelector(".s-strip__items");
  function render() {
    let total = 0;
    const lines = [];
    items().forEach((el) => {
      const sku = el.dataset.sku;
      const n = qty.get(sku) || 0;
      total += n * (+el.dataset.price || 0);
      if (n > 0) lines.push({ sku, n, el });
    });
    document.querySelectorAll("[data-for]").forEach((c) => {
      const n = qty.get(c.dataset.for) || 0;
      c.classList.toggle("is-empty", n === 0);
      const out = c.querySelector(".s-buy__n");
      if (out) out.textContent = n;
    });
    document.querySelectorAll("[data-total]").forEach((t) => (t.textContent = "$" + total.toLocaleString("en-US")));
    if (!stripItems) return;
    stripItems.innerHTML = lines
      .map(({ sku, n, el }) => {
        const name = el.dataset.name || "";
        const shape = el.dataset.shape === "plate" ? "s-plate-pic" : `s-cyl-pic is-${el.dataset.shape === "dish" ? "cup is-dish" : el.dataset.shape}`;
        return `<div class="s-strip__item" data-line="${sku}" role="button" tabindex="0" title="${name} Minus one" aria-label="${name} Minus one" style="--site-metal: var(--site-metal-${el.dataset.metal || 1})">` +
          `<div class="s-thumb" style="aspect-ratio: ${el.dataset.ar || "1"}"><div class="${shape}"><div class="s-cyl-pic__body"></div><div class="s-cyl-pic__rim"></div></div></div>` +
          (n > 1 ? `<span class="s-strip__n">${n}</span>` : "") +
          "</div>";
      })
      .join("");
    const filled = lines.length > 0;
    if (filled === strip.classList.contains("is-filled")) return;
    strip.classList.toggle("is-filled", filled);
    // Panels and pieces were measured at the height as if the strip were open, so only the PC scroll panel height changes — re-measure once after the strip is fully open
    setTimeout(() => {
      measureBar();
      ScrollTrigger.refresh();
    }, 320);
  }
  if (strip) {
    const take = (e) => {
      const item = e.target.closest(".s-strip__item");
      if (item) site.setQty(item.dataset.line, site.qty(item.dataset.line) - 1);
    };
    strip.addEventListener("click", take);
    strip.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      e.preventDefault();
      take(e);
    });
  }
  document.addEventListener("click", (e) => {
    const step = e.target.closest(".s-buy__step");
    if (!step) return;
    const sku = step.closest("[data-for]").dataset.for;
    site.setQty(sku, site.qty(sku) + (step.classList.contains("is-inc") ? 1 : -1));
  });
  document.addEventListener("keydown", (e) => {
    if ((e.key === "Enter" || e.key === " ") && e.target.closest?.(".s-buy__step")) {
      e.preventDefault();
      e.target.click();
    }
  });
  document.addEventListener("dragstart", (e) => {
    if (e.target.closest && e.target.closest(".s-piece__pic, .s-acc__pic, .s-strip__item")) e.preventDefault();
  });

  // ---- Guide line: tells you to press the dummy when closed, a piece when open ----
  const hint = document.querySelector(".s-hint");
  site.syncHint = () => {
    if (!hint) return;
    const open = !!document.querySelector('.s-wall[data-state="open"]');
    const text = open ? "Tap a piece to add" : "Pressing down a pile to pack it";
    if (hint.textContent !== text) hint.textContent = text;
  };
  document.addEventListener("fx:state", site.syncHint);

  // ---- Waitlist window ----
  const veil = document.querySelector(".s-wl");
  if (veil) {
    const form = veil.querySelector(".s-wl__form");
    const msg = veil.querySelector(".s-wl__msg");
    const title = veil.querySelector(".s-wl__title");
    const copy = veil.querySelector(".s-wl__copy");
    const close = () => {
      veil.classList.remove("is-open");
      root.style.overflow = "";
      if (site.lenis) site.lenis.start();
    };
    site.openWaitlist = (product) => {
      veil.dataset.product = product || "";
      title.textContent = "Waitlist";
      copy.textContent = "Your one-line notice here. We’ll let you know by email when it’s ready.";
      msg.textContent = "";
      form.style.display = "";
      form.reset();
      veil.classList.add("is-open");
      root.style.overflow = "hidden";
      if (site.lenis) site.lenis.stop();
      setTimeout(() => veil.querySelector(".s-wl__input").focus(), 0);
    };
    veil.addEventListener("click", (e) => { if (e.target === veil) close(); });
    veil.querySelector(".s-wl__close").addEventListener("click", close);
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && veil.classList.contains("is-open")) close(); });
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = form.querySelector(".s-wl__input").value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        msg.textContent = "Please check your email address.";
        return;
      }
      // Nothing is sent — this sample has no recipient, so it only pretends to receive
      title.textContent = "Added to the list";
      copy.textContent = email + " We will let you know via this.";
      form.style.display = "none";
    });
  }

  render();
})();
