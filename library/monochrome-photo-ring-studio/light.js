(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $$ = (s) => [...document.querySelectorAll(s)];

  // Line cover — <br> Wraps each split line and staggers them by .15s
  const block = (el) => {
    const parts = el.innerHTML.split(/<br\s*\/?>/i);
    el.innerHTML = "";
    return parts.map((h) => {
      const rb = document.createElement("span"), inner = document.createElement("span");
      rb.className = "rb"; inner.className = "rb-inner"; inner.innerHTML = h;
      rb.append(inner); el.append(rb);
      return rb;
    });
  };
  const play = (rbs) => rbs.forEach((rb, i) => setTimeout(() => rb.classList.add("in"), i * 150));
  const heads = $$(".lt-sec-title, .lt-page-hero h1, .lt-cta h2");
  heads.forEach((h) => { h.removeAttribute("data-reveal"); h._rb = block(h); });
  if (reduce) heads.forEach((h) => h._rb.forEach((rb) => rb.classList.add("in")));
  else {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { play(e.target._rb); io.unobserve(e.target); } }), { threshold: 0.25, rootMargin: "0px 0px -10% 0px" });
    heads.forEach((h) => io.observe(h));
  }

  // Body — split at each phrase (、。！？·…), set in over .65s starting after 120ms at 90ms intervals.
  const paras = $$(".lt-page-hero .sub, .lt-cta .lead");
  const split = (el) => {
    const segs = [];
    [...el.childNodes].forEach((node) => {
      if (node.nodeType === 3) {
        node.textContent.split(/(?<=[、。！？·…,.])/).filter((p) => p.length).forEach((p) => { const s = document.createElement("span"); s.className = "bw"; s.textContent = p; segs.push(s); });
      } else if (node.nodeType === 1) { node.classList.add("bw"); segs.push(node); }
    });
    el.innerHTML = "";
    segs.forEach((s) => el.append(s));
    return segs;
  };
  paras.forEach((p) => { p.removeAttribute("data-reveal"); p._bw = split(p); });
  if (reduce) paras.forEach((p) => p._bw.forEach((s) => s.classList.add("in")));
  else {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target._bw.forEach((s, i) => setTimeout(() => s.classList.add("in"), 120 + i * 90)); io.unobserve(e.target); } }), { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
    paras.forEach((p) => io.observe(p));
  }

  // The rest — at 12% visible, 1s up from 40px below
  if (reduce) $$("[data-reveal]").forEach((el) => el.classList.add("in"));
  else {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    $$("[data-reveal]").forEach((el) => io.observe(el));
  }

  // Phone menu
  const btn = document.querySelector(".lt-menu");
  if (btn) {
    btn.addEventListener("click", () => document.body.classList.toggle("nav-open"));
    $$(".lt-mnav a").forEach((a) => a.addEventListener("click", () => document.body.classList.remove("nav-open")));
  }

  // Floating consult button
  const f = document.createElement("a");
  f.className = "lt-float";
  f.href = "about.html#contact";
  f.dataset.t = "Contact";
  f.setAttribute("aria-label", "Inquiry");
  f.innerHTML = '<span class="jp">Consultations start here</span> <span>→</span>';
  document.body.append(f);
  const tog = () => f.classList.toggle("show", scrollY > 560);
  addEventListener("scroll", tog, { passive: true });
  tog();
})();
