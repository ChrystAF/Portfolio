/* Chryst Afangbedji resume site
   Progressive enhancement: theme toggle, one-view-at-a-time pages, home-view decrypt,
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

  // Every line of text on the home view "decrypts" from noise each time the view is shown.
  // The live feed and its counters are left alone so the replay keeps its own state.
  var decryptHome = function () {};
  var home = document.getElementById("home");
  if (home && !reduce && document.createTreeWalker) {
    var glyphs = "0123456789ABCDEF#$%&*<>/";
    var walker = document.createTreeWalker(home, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        var skip = !/\S/.test(n.nodeValue) || n.parentNode.closest("svg, #feed, .console-stats");
        return skip ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
      }
    });
    var parts = [];
    for (var tn = walker.nextNode(); tn; tn = walker.nextNode()) parts.push({ node: tn, text: tn.nodeValue });
    var run = 0;
    decryptHome = function () {
      var id = ++run, t0 = Date.now();
      var step = function () {
        if (id !== run) return;
        var ts = Date.now();
        var done = true;
        parts.forEach(function (p, k) {
          var prog = Math.min(Math.max((ts - t0 - k * 20) / Math.min(500 + p.text.length * 8, 1100), 0), 1);
          if (prog < 1) done = false;
          var keep = Math.floor(prog * p.text.length);
          var out = p.text.slice(0, keep);
          for (var i = keep; i < p.text.length; i++) {
            var ch = p.text.charAt(i);
            out += /\s/.test(ch) ? ch : glyphs.charAt(Math.floor(Math.random() * glyphs.length));
          }
          p.node.nodeValue = out;
        });
        if (!done) setTimeout(step, 35);
      };
      step();
    };
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
      if (target === home) decryptHome();
    };
    window.addEventListener("hashchange", function () { show(true); });
    show(false);
  } else {
    decryptHome();
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
