// Contact — splits the big title into characters and sets up the original chars-in as is: each character from 50% below·skew(-10°, 8°)·rotateX(-30°)·transparent
// In place (bottom-left of the axis) over 1s cubic-bezier(.075,.82,.165,1), .08s × letter index. Scrolling down pushes the upper line off the top of the screen, so the lower line looks bigger.
AM.page(({ reduce, clamp }) => {
  const chars = [...document.querySelectorAll(".ct-ch")];
  const top = document.querySelector(".ct-heading__top"), bottom = document.querySelector(".ct-heading__bottom");
  const ease = CustomEase.create("am-chars", "M0,0 C0.075,0.82 0.165,1 1,1");
  return {
    fv() {
      if (reduce) return;
      // The original Contact page doesn’t change the screen for 3.1s after opening (the site-wide opening phase), then the title stands — the plate is hidden for the measured length
      const main = document.querySelector(".ct-main");
      gsap.set(main, { autoAlpha: 0 });
      gsap.set(chars, { yPercent: 50, skewX: -10, skewY: 8, rotationX: -30, opacity: 0, transformOrigin: "0% 100%" });
      // 3.1s counts from when the page opened — subtract the time spent waiting for the font
      gsap.delayedCall(Math.max(0, 3.1 - performance.now() / 1000), () => {
        gsap.set(main, { autoAlpha: 1 });
        gsap.to(chars, { yPercent: 0, skewX: 0, skewY: 0, rotationX: 0, opacity: 1, duration: 1, ease, stagger: 0.08 });
      });
    },
    enter() {
      if (reduce) return;
      const hero = document.querySelector(".ct-hero");
      const tick = () => {
        const p = clamp(AM.scroll.y / hero.offsetHeight, 0, 1);
        top.style.transform = `translate3d(0, ${-30 * p}%, 0)`;
        bottom.style.transform = `scale(${1 + 0.15 * p})`;
      };
      AM.onScroll.push(tick);
      tick();
    },
  };
});
