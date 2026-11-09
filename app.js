/* Chryst Afangbedji resume site
   Progressive enhancement: theme toggle, one-view-at-a-time pages, name decrypt,
   simulated SOC feed, ATT&CK map, certificate lightbox.
   The page renders and reads fully (as one long scroll) with JavaScript disabled. */
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

  // One page on screen at a time: the URL hash (#about, #certs, ...) picks which view shows
  var views = Array.prototype.slice.call(document.querySelectorAll(".view"));
  var navLinks = document.querySelectorAll(".nav a[href^='#']");
  if (views.length) {
    root.classList.add("paged");
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";

    var label = function (v) { return v.getAttribute("data-label") || v.id; };
    var pageLink = function (v, cls, hint) {
      var a = document.createElement("a");
      a.href = "#" + v.id;
      a.className = cls;
      var s = document.createElement("span");
      s.textContent = hint;
      a.appendChild(s);
      a.appendChild(document.createTextNode(label(v)));
      return a;
    };
    views.forEach(function (v, i) {
      v.setAttribute("tabindex", "-1");
      var pager = document.createElement("nav");
      pager.className = "pager";
      pager.setAttribute("aria-label", "Page");
      if (i > 0) pager.appendChild(pageLink(views[i - 1], "prev", "← previous"));
      if (i < views.length - 1) pager.appendChild(pageLink(views[i + 1], "next", "next →"));
      (v.querySelector(".wrap") || v).appendChild(pager);
    });

    var show = function (moveFocus) {
      var id = decodeURIComponent(location.hash.slice(1));
      var target = views.filter(function (v) { return v.id === id; })[0] || views[0];
      views.forEach(function (v) { v.classList.toggle("active", v === target); });
      root.setAttribute("data-view", target.id);
      Array.prototype.forEach.call(navLinks, function (a) {
        if (a.getAttribute("href") === "#" + target.id) a.setAttribute("aria-current", "page");
        else a.removeAttribute("aria-current");
      });
      window.scrollTo(0, 0);
      if (moveFocus) target.focus({ preventScroll: true });
    };
    window.addEventListener("hashchange", function () { show(true); });
    show(false);
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
      ["m", "snort", "ET SCAN Nmap SYN scan from 203.0.113.66", "→ splunk"],
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
    // One full cycle is 40% medium, 30% low, 30% high
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

  // Count the hero stats up the first time they come into view
  var counters = document.querySelectorAll("[data-count]");
  if (counters.length && "IntersectionObserver" in window && !reduce && window.requestAnimationFrame) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        co.unobserve(en.target);
        var el = en.target;
        var end = +el.getAttribute("data-count");
        var suffix = el.getAttribute("data-suffix") || "";
        var t0 = null;
        var step = function (ts) {
          if (t0 === null) t0 = ts;
          var p = Math.min((ts - t0) / 1200, 1);
          el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + suffix;
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    }, { threshold: 0.5 });
    Array.prototype.forEach.call(counters, function (c) { co.observe(c); });
  }

  // Cursor glow on lab cards
  Array.prototype.forEach.call(document.querySelectorAll(".proj"), function (card) {
    card.addEventListener("mousemove", function (ev) {
      var r = card.getBoundingClientRect();
      card.style.setProperty("--mx", (ev.clientX - r.left) + "px");
      card.style.setProperty("--my", (ev.clientY - r.top) + "px");
    });
  });

  // Certificate images open full size in a lightbox (without JS the link opens the image)
  var lb = document.getElementById("lightbox");
  if (lb && typeof lb.showModal === "function") {
    var lbImg = document.getElementById("lb-img");
    var lbCap = document.getElementById("lb-cap");
    Array.prototype.forEach.call(document.querySelectorAll("a.cert-img"), function (a) {
      a.addEventListener("click", function (ev) {
        ev.preventDefault();
        var thumb = a.querySelector("img");
        lbImg.src = a.getAttribute("href");
        lbImg.alt = thumb ? thumb.alt : "";
        lbCap.textContent = a.getAttribute("data-caption") || "";
        lb.showModal();
      });
    });
    document.getElementById("lb-close").addEventListener("click", function () { lb.close(); });
    lb.addEventListener("click", function (ev) { if (ev.target === lb) lb.close(); });
  }
})();
