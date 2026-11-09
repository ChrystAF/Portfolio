/* Chryst Afangbedji resume site
   Small progressive-enhancement script: theme toggle + smooth scroll + active-section nav.
   The page renders and reads fully with JavaScript disabled. */
(function () {
  "use strict";
  var root = document.documentElement;
  var btn = document.getElementById("themebtn");
  var KEY = "caf-theme";

  try {
    var saved = localStorage.getItem(KEY);
    if (saved === "light" || saved === "dark") root.setAttribute("data-theme", saved);
  } catch (e) {}

  function current() {
    var attr = root.getAttribute("data-theme");
    if (attr) return attr;
    return (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) ? "light" : "dark";
  }

  if (btn) {
    btn.addEventListener("click", function () {
      var next = current() === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem(KEY, next); } catch (e) {}
    });
  }

  // Smooth-scroll for in-page anchors
  var links = document.querySelectorAll('a[href^="#"]');
  Array.prototype.forEach.call(links, function (a) {
    a.addEventListener("click", function (ev) {
      var id = a.getAttribute("href");
      if (id.length < 2) return;
      var el = document.querySelector(id);
      if (el) { ev.preventDefault(); el.scrollIntoView({ behavior: "smooth", block: "start" }); }
    });
  });

  // Highlight the nav link for the section in view
  var navLinks = document.querySelectorAll(".nav a[href^='#']");
  if ("IntersectionObserver" in window && navLinks.length) {
    var map = {};
    Array.prototype.forEach.call(navLinks, function (a) { map[a.getAttribute("href").slice(1)] = a; });
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var a = map[en.target.id];
        if (a && en.isIntersecting) {
          Array.prototype.forEach.call(navLinks, function (x) { x.removeAttribute("aria-current"); });
          a.setAttribute("aria-current", "true");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Array.prototype.forEach.call(Object.keys(map), function (id) {
      var sec = document.getElementById(id);
      if (sec) obs.observe(sec);
    });
  }
})();
