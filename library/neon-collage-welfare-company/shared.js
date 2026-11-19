// Spans multiple pages — plugs in the header · yellow menu panel · careers notice box · yellow contact section · dark footer, and rebuilds the original scripts.js devices (title reveal · menu · notice box · wordmark rise) with the same values.
(() => {
  const page = document.body.dataset.page || "home";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const NAV = [
    ["about.html", "Our Thoughts"], ["works.html", "Creative work"], ["about.html#strategy", "Structure and Strategy"], ["about.html#message", "Key message"],
    ["service.html", "Business introduction"], ["service.html#base", "Locations List"], ["about.html#company", "Company info"], ["recruit.html", "Hiring Info"],
  ];
  const PANEL = [["index.html", "TOP"], ...NAV.slice(0, 2), ["about.html#strategy", "Structure and Strategy"], ["service.html", "Business introduction"], ["service.html#base", "Locations List"], ["about.html#number", "Benefits by the numbers"], ["about.html#message", "Key message"], ["about.html#member", "Meet the Members"], ["about.html#company", "Company info"], ["news.html", "News"], ["recruit.html", "Hiring Info"], ["#contact", "Contact Us"]];
  const ARW = '<svg viewBox="0 0 10 10" aria-hidden="true"><circle cx="2.5" cy="2.5" r="1.5"/><circle cx="7.5" cy="2.5" r="1.5"/><circle cx="2.5" cy="7.5" r="1.5"/><circle cx="7.5" cy="7.5" r="1.5"/></svg>';
  const MARK = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 1.5h4v5.5h6V1.5h4v5.5h1.5v4H17v7.5h-4V11H7v7.5H3V11H1.5V7H3z"/></svg>';
  const logo = (cls = "") => `<span class="l-logo ${cls}" data-label="Brand logo — mark + English name">${MARK}BRAND NAME</span>`;
  window.ldArw = ARW;
  window.ldLogo = logo;

  // Collage patterns (dots · hatching): image-slot SVGs use them as url(#cg-dots)
  document.body.insertAdjacentHTML("afterbegin", '<svg class="cg-defs" aria-hidden="true"><defs><pattern id="cg-dots" width="9" height="9" patternUnits="userSpaceOnUse"><circle class="cg-ink" cx="2.5" cy="2.5" r="1.6"/></pattern><pattern id="cg-stripes" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect class="cg-ink" width="4" height="10"/></pattern></defs></svg>');

  // ── Header line
  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.id = "commonHeader";
    head.className = `commonHeader${page === "home" ? " is-top" : ""}`;
    head.innerHTML = `<div class="commonHeader__inner">
      <a class="header-logo" href="index.html">${logo()}</a>
      <nav class="global">${NAV.map(([h, t]) => `<a href="${h}" data-text="${t}"><span>${t}</span></a>`).join("")}<a class="btn-box" href="#contact">Contact Us</a></nav>
      <nav class="global-panel"><div class="global-panel__inner"><svg class="l-eq" viewBox="0 0 113 120" aria-hidden="true"><circle class="cg-ink" cx="30" cy="30" r="18"/><rect class="cg-dots" x="52" y="10" width="50" height="50"/><path class="cg-line" d="M8 92q20-24 40 0t40 0" stroke-width="4"/></svg>
        <div class="p-logo"><a href="index.html">${logo()}</a></div>
        <ul class="global-panel__list">${PANEL.map(([h, t]) => `<li><a href="${h}">${t}</a></li>`).join("")}</ul></div></nav>
      <button class="navToggle" type="button" aria-label="Menu"><span></span><span></span><span></span></button>
    </div>`;
    const btn = head.querySelector(".navToggle"), panel = head.querySelector(".global-panel");
    btn.addEventListener("click", () => {
      const open = btn.classList.toggle("active");
      panel.classList.toggle("is-open", open);
      document.body.classList.toggle("fixed", open);
    });
    panel.addEventListener("click", (e) => { if (e.target.closest("a")) { btn.classList.remove("active"); panel.classList.remove("is-open"); document.body.classList.remove("fixed"); } });
    // On the first page, you scroll down one screen for the header row to come down
    if (page === "home") {
      const upd = () => head.classList.toggle("is-show", scrollY >= innerHeight);
      addEventListener("scroll", upd, { passive: true });
      addEventListener("resize", upd);
      upd();
    }
  }

  // ── Contact Section + Footer
  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.className = "commonFooter";
    const WORD = "Wordmarks!!";
    foot.innerHTML = `<section class="commonContact" id="contact" data-slot="contact"><div class="container">
        <header class="contactHeader js-reveal"><h2><span class="reveal__inner">Contact Us</span></h2><p class="description"><span class="reveal__inner">Your one-line contact note here. Choose where to reach us below.</span></p></header>
        <div class="container-mid">
          <div class="contact__grid">
            <a class="grid" href="#contact"><label>Contact<i>${ARW}</i></label><p>Facility inquiries and collaboration talks go here</p></a>
            <a class="grid" href="recruit.html"><label>Recruit<i>${ARW}</i></label><p>Job info and listings here</p></a>
          </div>
          <div class="media__col"><header><h3>Social Media</h3><p class="description">Find our official social media here</p></header>
            <div class="media-grid"><a href="#"><svg viewBox="0 0 24 24"><path d="M2 7c0-2 1-3 3-3h14c2 0 3 1 3 3v10c0 2-1 3-3 3H5c-2 0-3-1-3-3zm8 1v8l6-4z"/></svg>Video</a><a href="#"><svg viewBox="0 0 24 24"><path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm5 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm5.5-3.5a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/></svg>Photo</a><a href="#"><svg viewBox="0 0 24 24"><path d="M3 3h5l4 6 5-6h3l-6.5 8L21 21h-5l-4.5-6.5L6 21H3l7-8.5z"/></svg>Post</a></div>
          </div>
        </div></div></section>
      <div class="footer__inner"><div class="container-large">
        <h3 class="f-logo"><a href="index.html">${logo()}</a></h3>
        <div class="footer-top"><nav class="footer__nav">${[...NAV, ["about.html#number", "Benefits by the numbers"], ["about.html#member", "Meet the Members"], ["news.html", "News"], ["#contact", "Contact Us"]].map(([h, t]) => `<a href="${h}" data-text="${t}"><span>${t}</span></a>`).join("")}</nav></div>
        <div class="footer-bottom"><div><p>Postal code 000-0000<br>Your one-line address, building name, floor 0 here<br>TEL : 000-000-0000　FAX : 000-000-0000</p>
          <div class="footer-sns"><a href="#" aria-label="SNS 1"><svg viewBox="0 0 24 24"><path d="M3 3h5l4 6 5-6h3l-6.5 8L21 21h-5l-4.5-6.5L6 21H3l7-8.5z"/></svg></a><a href="#" aria-label="SNS 2"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="6"/></svg></a><a href="#" aria-label="SNS 3"><svg viewBox="0 0 24 24"><path d="M8 6v12l10-6z"/></svg></a></div></div>
          <p class="footer-copy"><a href="#">Privacy policy</a>© COMPANY NAME Inc. All rights reserved.</p></div>
      </div>
      <p class="footer__groooover" aria-label="${WORD}" data-label="Brand slogan in large English letters">${[...WORD].map((c, i) => `<span class="char" style="--i:${i}">${c}</span>`).join("")}</p></div>`;
  }

  // ── Hiring notice box — while the curtain (#opening) runs, wait 300ms at a time (max 60 times) then turn on after .6s. Closing with × hides it for 7 days
  const join = document.querySelector('[data-slot="join"]');
  if (join) {
    join.id = "ldJoin";
    join.className = "ldJoin";
    join.innerHTML = `<button class="ldJoin__close" type="button" aria-label="Close">×</button>
      <p class="ldJoin__ttl">RECRUIT<span>Hiring guide</span></p>
      <div class="ldJoin__btns"><a class="ldJoin__btn is-new" href="recruit.html"><i class="ldJoin__arw">&gt;</i>New Grad Hiring</a><a class="ldJoin__btn is-mid" href="recruit.html"><i class="ldJoin__arw">&gt;</i>Experienced hiring</a><a class="ldJoin__btn is-line" href="#"><span class="ldJoin__t">Easy inquiries via messenger</span><span class="ldJoin__ts">Messenger chat support</span></a></div>`;
    let closed = false;
    try { const v = parseInt(localStorage.getItem("ldJoinClosed") || "0", 10); closed = !!v && Date.now() - v < 7 * 864e5; } catch (e) {}
    if (closed) join.style.display = "none";
    else {
      join.querySelector(".ldJoin__close").addEventListener("click", () => { join.classList.remove("is-show"); try { localStorage.setItem("ldJoinClosed", String(Date.now())); } catch (e) {} });
      let tries = 0;
      const wait = () => {
        const op = document.getElementById("opening");
        const playing = op && op.offsetParent !== null && getComputedStyle(op).opacity !== "0" && getComputedStyle(op).visibility !== "hidden";
        if (playing && tries++ < 60) { setTimeout(wait, 300); return; }
        setTimeout(() => join.classList.add("is-show"), 600);
      };
      wait();
    }
  }

  // ── Title reveal — once 20% is visible, is-active just once
  const reveal = (root = document) => {
    const els = [...root.querySelectorAll(".js-reveal")];
    if (reduce || !("IntersectionObserver" in window)) { els.forEach((e) => e.classList.add("is-active")); return; }
    const io = new IntersectionObserver((ents) => ents.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("is-active"); io.unobserve(en.target); } }), { threshold: 0.2 });
    els.forEach((e) => io.observe(e));
  };
  window.ldReveal = reveal;
  reveal();

  // ── Big wordmark — when 40% is visible, letters rise one by one
  const groove = document.querySelector(".footer__groooover");
  if (groove && !reduce) {
    groove.classList.add("is-ready");
    const io = new IntersectionObserver((ents) => ents.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("is-animate"); io.unobserve(en.target); } }), { threshold: 0.4 });
    io.observe(groove);
  }

  document.querySelectorAll("i[data-arw]").forEach((i) => (i.innerHTML = ARW));
})();

// On phone, pressing the yellow table-of-contents box title slides the list open and closed in 400ms (original jQuery slideToggle)
(() => {
  document.querySelectorAll(".content__block h3").forEach((h) => h.addEventListener("click", () => {
    if (!matchMedia("(max-width: 640px)").matches) return;
    const ul = h.nextElementSibling;
    if (!ul) return;
    const open = !h.classList.contains("active");
    h.classList.toggle("active", open);
    ul.style.display = "block";
    const full = ul.scrollHeight;
    const a = ul.animate({ height: open ? ["0px", `${full}px`] : [`${full}px`, "0px"], overflow: ["hidden", "hidden"] }, { duration: 400, easing: "cubic-bezier(.45,.05,.55,.95)" });
    a.onfinish = () => { ul.style.display = open ? "block" : "none"; };
  }));
})();
