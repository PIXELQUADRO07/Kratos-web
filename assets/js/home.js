/**
 * Kratos OS — homepage package count badge.
 * Reads assets/data/packages.json so the count updates automatically
 * whenever new packages are published, with no HTML edits.
 */
(function () {
  "use strict";

  const el = document.getElementById("home-package-count");
  if (!el) return;

  fetch("assets/data/packages.json", { cache: "no-store" })
    .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
    .then((data) => {
      const count = Array.isArray(data.packages) ? data.packages.length : 0;
      if (count > 0) {
        el.textContent = `${count} .kpkg package${count === 1 ? "" : "s"} available today`;
      }
    })
    .catch(() => {
      /* silently ignore — badge is a nice-to-have, not critical */
    });
})();
