// Sub pages: fill only the diamond arrow (menu · footer · Lenis are in shared.js)
document.querySelectorAll("[data-diamond]").forEach((el) => { el.innerHTML = TNM.diamond(el.dataset.diamond); });
