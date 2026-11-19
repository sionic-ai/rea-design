// The original runs on jQuery, AOS 2.3.4 and Swiper — AOS and Swiper use the same stack, while jQuery’s fadeIn/Out and animate (jquery.easing swaps swing for easeOutQuad) are ported to WAAPI with the same length and curve.
// Header bar, drawer, booking strip, footer and booking pill are identical on all pages, so they are inserted here.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const body = document.body;
  const quad = "cubic-bezier(0.25, 0.46, 0.45, 0.94)";
  const NAV = [["About", "About", "about.html"], ["Lodging", "Stay", "stay.html"], ["Meal", "Restaurant", "index.html#home05"], ["Experience · Walk", "Experience", "index.html#home06"]];
  const arrow = '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.2"><path d="m8 4 6 6-6 6"/></svg>';
  const down = '<svg viewBox="0 0 26 7" fill="none" stroke="currentColor"><path d="M0 1l13 5 13-5"/></svg>';
  const logo = '<svg viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="square" aria-hidden="true"><path d="M20 40 60 14l40 26M30 64l30-20 30 20M40 88l20-14 20 14"/><path d="M60 92v18" stroke-width="3"/></svg>';
  const insta = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor"><rect x="1.5" y="1.5" width="13" height="13" rx="4"/><circle cx="8" cy="8" r="3"/></svg>';
  window.skArrow = arrow;
  window.skDown = down;
  window.skLogo = logo;
  const lang = '<div class="langBox"><p class="en ja">KO</p><span>/</span><a class="en" href="#">EN</a></div>';

  document.querySelectorAll("[data-slot='header']").forEach((el) => {
    el.id = "header";
    el.innerHTML = `<p class="logo"><a href="index.html" aria-label="Brand Title">${logo}</a></p>
      <nav class="pcNav"><ul>${NAV.map(([k, , h]) => `<li><a href="${h}">${k}</a></li>`).join("")}<li><a href="index.html#home08">Getting here</a></li></ul></nav>
      ${lang}<div class="blur-overlay"></div>
      <nav class="hNav" aria-label="Menu">${lang}
        <div class="top"><ul><li><a href="index.html">Home<span class="en">Home</span></a></li>${NAV.map(([k, e, h]) => `<li><a href="${h}">${k}<span class="en">${e}</span></a></li>`).join("")}<li><a href="news.html">News<span class="en">News</span></a></li><li class="mb4"><a href="index.html#home08">Getting here<span class="en">Access</span></a></li></ul>
          <div class="btns"><a class="circle-btn mb1 fs16" href="#">Stay Booking<span class="ico">${arrow}</span></a><a class="circle-btn mb4 fs16" href="#">Meal Reservation<span class="ico">${arrow}</span></a><div class="other fs13 mb6"><a href="#">Contact Us</a></div></div></div>
        <div class="bottom"><div class="infoBox"><div><p class="fs13">000-0000<br>Your address line here 000</p><div class="sns"><a class="en fs13" href="#">${insta}Instagram</a></div></div><div class="info-logo">${logo}</div></div></div>
      </nav>`;
    const t = document.createElement("button");
    t.className = "navToggle";
    t.type = "button";
    t.setAttribute("aria-label", "Menu");
    t.innerHTML = "<span></span><span></span>";
    el.append(t);
  });

  document.querySelectorAll("[data-slot='reserve']").forEach((el) => {
    el.id = "aside01";
    el.innerHTML = `<div class="wf-img sk-ph is-dark" data-label="Wooden-floor room with table and chairs beyond a paper sliding door · daylight from the window · landscape rounded panel"></div>
      <div class="box"><div class="ttlBox mb12"><h2 class="ttl fs56">Reservation<span class="en fs20">Reservation</span></h2></div>
      <a class="circle-btn mb1 fs16" href="#">Stay Booking<span class="ico">${arrow}</span></a><a class="circle-btn mb1 fs16" href="#">Meal Reservation<span class="ico">${arrow}</span></a>
      <div class="contactBox"><p class="tel-txt">Phone Reservation</p><div class="telBox fs18"><p class="tel">Tel: <a href="#">000-00-0000</a></p><p class="open">(00:00~00:00)</p></div></div></div>`;
  });

  document.querySelectorAll("[data-slot='footer']").forEach((el) => {
    el.id = "footer";
    el.innerHTML = `<div class="boxs mb4"><div class="flogo"><a href="index.html" class="logo" aria-label="Brand Title">${logo}</a>${lang}</div>
      <nav class="fNav"><ul><li><a href="about.html">About</a></li><li><a href="news.html">News</a></li><li><a href="stay.html">Lodging</a></li><li><a href="index.html#home08">Getting here</a></li><li><a href="index.html#home05">Meal</a></li><li><a href="#" class="contact">Contact Us</a></li><li><a href="index.html#home06">Experience · Walk</a></li></ul></nav>
      <div class="rBox"><p class="mb1">Brand Title</p><div class="adressBox mb2"><p class="adress">000-0000<br>Your address line here 000</p><a href="#" class="en google-link">Map</a></div><div class="sns"><a class="en" href="#">${insta}Instagram</a></div></div></div>
      <p class="copy">© Company Name</p>`;
    const fc = document.createElement("div");
    fc.id = "fContact";
    fc.innerHTML = '<a href="#">Stay Booking<span class="en">Reservation</span></a>';
    el.after(fc);
  });

  document.querySelectorAll(".ico:empty").forEach((el) => { el.innerHTML = el.classList.contains("is-down") ? down : arrow; });

  // Drawer — original navToggle: drawer · blur curtain active, and on close it leaves fade-out for 0.3s so it does not vanish at once. Locks body scroll.
  const toggle = document.querySelector(".navToggle");
  const hNav = document.querySelector(".hNav");
  const blur = document.querySelector(".blur-overlay");
  if (toggle && hNav) {
    toggle.addEventListener("click", () => {
      const on = toggle.classList.toggle("active");
      hNav.classList.toggle("active", on);
      blur?.classList.toggle("active", on);
      document.querySelectorAll(".pcNav a, #header .logo a").forEach((a) => { a.style.pointerEvents = on ? "none" : "auto"; });
      if (on) hNav.classList.remove("fade-out");
      else { hNav.classList.add("fade-out"); setTimeout(() => hNav.classList.remove("fade-out"), 300); }
      body.style.height = on ? "100%" : "";
      body.style.overflow = on ? "hidden" : "";
    });
  }

  // Booking pill — shown when the top of the booking strip is below the bottom of the screen, and fades out in 0.3s when the strip comes in (jQuery fadeIn/Out 300)
  const fc = document.getElementById("fContact");
  const aside = document.getElementById("aside01");
  if (fc) {
    let shown = true;
    const fade = (on) => {
      if (on === shown) return;
      shown = on;
      if (on) fc.style.display = "";
      const a = fc.animate({ opacity: on ? [0, 1] : [1, 0] }, { duration: reduce ? 0 : 300, easing: quad, fill: "forwards" });
      if (!on) a.onfinish = () => { if (!shown) fc.style.display = "none"; };
    };
    const check = () => { if (aside) fade(aside.getBoundingClientRect().top > innerHeight); };
    addEventListener("scroll", check, { passive: true });
    check();
  }

  // Appearance — original fade-box: set AOS attributes from data-value, then AOS.init
  document.querySelectorAll(".fade-box").forEach((box) => {
    const v = box.dataset.value;
    let type = "fade-in", delay = 50, dur = 600, off = 100, ease = "ease";
    if (v === "DF") { type = "fade-up"; delay += 50; dur = 1000; off = 120; }
    else if (v === "SA") { type = "fade-up_custom"; delay += 100; dur = 600; off = 150; ease = "fade-up_custom_easing"; }
    else if (v === "SAHL") { type = "clip-fade"; delay += 100; dur = 1200; off = 150; ease = "clip-fade_easing"; }
    Object.entries({ aos: type, "aos-delay": delay, "aos-duration": dur, "aos-offset": off, "aos-easing": ease, "aos-once": "true" }).forEach(([k, val]) => box.setAttribute("data-" + k, val));
  });
  if (window.AOS) {
    AOS.init({ disable: reduce });
    addEventListener("resize", () => AOS.refresh());
    addEventListener("scroll", () => AOS.refresh(), { passive: true });
  }

  // Subpage header photo — dark overlay over 0.6s via show after 0.1s
  const kv = document.getElementById("subKv");
  if (kv) setTimeout(() => kv.classList.add("show"), 100);

  // Anchor — the original uses behavior: smooth, stopping 60px above the target
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    const h = a.getAttribute("href");
    if (h.length < 2) return;
    a.addEventListener("click", (e) => {
      const t = document.getElementById(h.slice(1));
      if (!t) return;
      e.preventDefault();
      scrollTo({ top: t.getBoundingClientRect().top + scrollY - 60, behavior: reduce ? "auto" : "smooth" });
    });
  });

  const done = () => { body.classList.remove("is-loading"); };
  if (document.readyState === "complete") done(); else addEventListener("load", done);
})();
