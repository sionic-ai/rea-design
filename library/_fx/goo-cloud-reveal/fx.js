(() => {
  const NS = "http://www.w3.org/2000/svg";
  // Blur the blobs and then boost alpha strongly (slope 20, intercept −7) to turn them into a cloud whose edges stick gooey — insert only once per document
  function ensureFilter(id, blur) {
    if (document.getElementById(id)) return;
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("width", "0"); svg.setAttribute("height", "0");
    svg.style.position = "absolute";
    svg.innerHTML = `<filter id="${id}"><feGaussianBlur in="SourceGraphic" stdDeviation="${blur}" result="b"/><feComponentTransfer result="g"><feFuncA type="linear" slope="20" intercept="-7"/></feComponentTransfer><feComposite in="SourceGraphic" in2="g" operator="atop"/></filter>`;
    document.body.append(svg);
  }

  kfFx.register("goo-cloud-reveal", (el, { options, reduce }) => {
    ensureFilter("fx-goo-cloud", 30);
    ensureFilter("fx-goo-cloud-large", 70);
    let cloud = el.querySelector(':scope > [data-fx-part="cloud"]'), made = false;
    if (!cloud) {
      cloud = document.createElement("span");
      cloud.setAttribute("data-fx-part", "cloud");
      cloud.setAttribute("aria-hidden", "true");
      el.prepend(cloud);
      made = true;
    }
    const count = Math.max(1, Math.round(+(options.count || 8)));
    const added = [];
    while (cloud.children.length < count) { const i = document.createElement("i"); cloud.append(i); added.push(i); }
    let io;
    if (options.on === "view") {
      const repeat = options.repeat !== "off";
      io = new IntersectionObserver((entries) => entries.forEach((e) => {
        if (e.isIntersecting) { el.classList.add("is-open"); if (!repeat) io.disconnect(); }
        else if (repeat) el.classList.remove("is-open");
      }), { rootMargin: options.margin || "0% 10% -33% 10%", threshold: 0 });
      io.observe(el);
    }
    if (reduce) el.classList.add("is-fx-still");
    return () => {
      io?.disconnect();
      if (made) cloud.remove(); else added.forEach((n) => n.remove());
      el.classList.remove("is-fx-still");
    };
  });
})();
