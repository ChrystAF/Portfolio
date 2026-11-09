/* Chryst Afangbedji resume site
   Progressive enhancement: theme toggle, smooth scroll, active-section nav, name decrypt,
   simulated SOC feed, ATT&CK map, scroll reveal.
   The page renders and reads fully with JavaScript disabled. */
(function () {
  "use strict";
  var root = document.documentElement;
  var btn = document.getElementById("themebtn");
  var KEY = "caf-theme";
  var reduce = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  root.classList.add("js");

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

  // Side panel becomes a slide-out drawer on small screens
  var side = document.getElementById("side");
  var toggle = document.getElementById("navtoggle");
  var scrim = document.getElementById("scrim");
  if (side && toggle) {
    var setOpen = function (open) {
      side.classList.toggle("open", open);
      if (scrim) scrim.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    };
    toggle.addEventListener("click", function () { setOpen(!side.classList.contains("open")); });
    if (scrim) scrim.addEventListener("click", function () { setOpen(false); });
    side.addEventListener("click", function (ev) {
      if (ev.target.closest && ev.target.closest("a")) setOpen(false);
    });
    document.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape" && side.classList.contains("open")) { setOpen(false); toggle.focus(); }
    });
  }

  // Smooth-scroll for in-page anchors
  var links = document.querySelectorAll('a[href^="#"]');
  Array.prototype.forEach.call(links, function (a) {
    a.addEventListener("click", function (ev) {
      var id = a.getAttribute("href");
      if (id.length < 2) return;
      var el = document.querySelector(id);
      if (el) { ev.preventDefault(); el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" }); }
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

  // Name "decrypts" from noise on load
  var nameEl = document.getElementById("name");
  if (nameEl && !reduce) {
    var target = nameEl.textContent;
    var glyphs = "0123456789ABCDEF#$%&*<>/";
    var frame = 0;
    (function tick() {
      var out = "";
      for (var i = 0; i < target.length; i++) {
        var ch = target.charAt(i);
        out += (ch === " " || i < frame / 2) ? ch : glyphs.charAt(Math.floor(Math.random() * glyphs.length));
      }
      nameEl.textContent = out;
      if (frame++ < target.length * 2) setTimeout(tick, 30);
      else nameEl.textContent = target;
    })();
  }

  // Simulated SOC feed replaying the home-lab detections (documentation-range IPs only)
  var feed = document.getElementById("feed");
  if (feed && !reduce) {
    var EVENTS = [
      ["h", "snort", "ET SCAN Nmap SYN scan from 203.0.113.66", "→ splunk"],
      ["m", "pfsense", "blocked inbound 445/tcp on WAN", "dropped"],
      ["h", "splunk", "IDS + firewall hits share src 203.0.113.66", "escalated"],
      ["h", "sentinel", "4625 failed logon ×312 from 198.51.100.23", "IOC extracted"],
      ["l", "sentinel", "watchlist geo-enrich: 14 countries", "workbook updated"],
      ["m", "mimecast", "credential-harvest link in inbound mail", "held · user notified"],
      ["l", "ad", "user provisioned → OU=Employees", "ok"],
      ["m", "snort", "SMB null-session attempt on 10.0.20.15", "→ splunk"],
      ["h", "sentinel", "brute force: 41 IPs over threshold", "escalated"],
      ["l", "entra", "access request resolved in ServiceNow", "closed"]
    ];
    var SEV = { h: "HIGH", m: "MED", l: "LOW" };
    var stEv = document.getElementById("st-ev");
    var stHi = document.getElementById("st-hi");
    var stEsc = document.getElementById("st-esc");
    var n = 0;

    var el = function (tag, cls, text) {
      var e = document.createElement(tag);
      if (cls) e.className = cls;
      if (text) e.textContent = text;
      return e;
    };
    var pad = function (v) { return (v < 10 ? "0" : "") + v; };
    var bump = function (node) { if (node) node.textContent = String(+node.textContent + 1); };

    setInterval(function () {
      if (document.hidden) return;
      var ev = EVENTS[n++ % EVENTS.length];
      var d = new Date();
      var li = el("li");
      li.appendChild(el("span", "t", pad(d.getHours()) + ":" + pad(d.getMinutes()) + ":" + pad(d.getSeconds())));
      li.appendChild(el("span", "sev " + ev[0], SEV[ev[0]]));
      var msg = el("span");
      msg.appendChild(el("b", null, ev[1]));
      msg.appendChild(document.createTextNode(" " + ev[2] + " "));
      msg.appendChild(el("em", null, ev[3]));
      li.appendChild(msg);
      feed.appendChild(li);
      while (feed.children.length > 7) feed.removeChild(feed.firstElementChild);
      bump(stEv);
      if (ev[0] === "h") bump(stHi);
      if (ev[3] === "escalated") bump(stEsc);
    }, 2400);
  }

  // ATT&CK map: show the story behind a technique
  var info = document.getElementById("techinfo");
  var techs = document.querySelectorAll(".tech");
  if (info && techs.length) {
    var select = function (b) {
      Array.prototype.forEach.call(techs, function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      var name = b.lastChild.textContent;
      info.textContent = "";
      var tid = document.createElement("span"); tid.className = "tid"; tid.textContent = b.getAttribute("data-id");
      var bold = document.createElement("b"); bold.textContent = name;
      var p = document.createElement("p"); p.textContent = b.getAttribute("data-note");
      info.appendChild(tid); info.appendChild(bold); info.appendChild(p);
    };
    Array.prototype.forEach.call(techs, function (b) {
      b.addEventListener("click", function () { select(b); });
      b.addEventListener("mouseenter", function () { select(b); });
    });
    select(techs[0]);
  }

  // Cursor glow on lab cards
  Array.prototype.forEach.call(document.querySelectorAll(".proj"), function (card) {
    card.addEventListener("mousemove", function (ev) {
      var r = card.getBoundingClientRect();
      card.style.setProperty("--mx", (ev.clientX - r.left) + "px");
      card.style.setProperty("--my", (ev.clientY - r.top) + "px");
    });
  });

  // Reveal sections as they scroll into view
  if ("IntersectionObserver" in window && !reduce) {
    var reveals = document.querySelectorAll("main section > .wrap");
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); ro.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    Array.prototype.forEach.call(reveals, function (w) { w.classList.add("reveal"); ro.observe(w); });
  }
})();
