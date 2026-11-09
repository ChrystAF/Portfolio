/* Chryst Afangbedji resume site
   Progressive enhancement: theme toggle, smooth scroll, active-section nav, name decrypt,
   simulated SOC feed, ATT&CK map, interactive shell, scroll reveal.
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

  function toggleTheme() {
    var next = current() === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem(KEY, next); } catch (e) {}
    return next;
  }

  if (btn) btn.addEventListener("click", toggleTheme);

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

  // Interactive shell. Nothing typed here is ever executed: input only selects one of the fixed
  // commands in CMDS, and all output is written with textContent, never parsed as HTML.
  var out = document.getElementById("termout");
  var form = document.getElementById("termform");
  var input = document.getElementById("termin");
  if (out && form && input) {
    var history = [];
    var hpos = 0;

    var print = function (text, cls) {
      var d = document.createElement("div");
      if (cls) d.className = cls;
      d.textContent = text;
      out.appendChild(d);
      return d;
    };
    var go = function (id) {
      var t = document.getElementById(id);
      if (t) setTimeout(function () { t.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" }); }, 600);
    };

    var CMDS = {
      help: function () {
        print([
          "whoami     who I am",
          "certs      certifications",
          "exp        experience",
          "labs       home labs",
          "skills     toolset",
          "attack     ATT&CK techniques I've worked",
          "resume     open my résumé (PDF)",
          "contact    how to reach me",
          "theme      toggle light / dark",
          "clear      clear the screen"
        ].join("\n"));
      },
      whoami: function () {
        print("Chryst Afangbedji: senior Cybersecurity student at Slippery Rock University (NSA CAE program),\n" +
              "aspiring SOC / Cybersecurity Analyst on the way to detection engineering. Pittsburgh, PA.\n" +
              "Graduating May 2027. Status: ", null).appendChild(Object.assign(document.createElement("span"), { className: "ok", textContent: "open to work" }));
      },
      certs: function () {
        print("[✓] eJPT (INE)              Aug 2025\n[✓] CompTIA Security+        Feb 2026\n[…] CompTIA CySA+ (CS0-004)  in progress");
      },
      exp: function () {
        print("2026  IT&S Intern · Pitt Ohio\n      alert triage, phishing analysis in Mimecast, access in Azure / Entra ID / AD\n" +
              "2025+ IT Help Desk Technician · Slippery Rock University\n      30+ tickets/week at 95% satisfaction\n" +
              "2025  Blue Team · CyberForce Competition (U.S. DOE)\n      defended AWS-hosted infrastructure in a live attack simulation");
      },
      labs: function () {
        print("01  Network Perimeter Defense & SIEM   pfSense · Snort · Splunk\n" +
              "02  Cloud Threat Monitoring & Honeypot  Azure · Sentinel · KQL\n" +
              "03  Active Directory Enterprise         Windows Server 2022 · PowerShell\n" +
              "04  Exploitation of Web & Net Services  Kali · Nmap · Metasploit");
        print("→ scrolling to labs", "hl"); go("projects");
      },
      skills: function () {
        print("siem      Splunk, Sentinel, KQL, Snort, MITRE ATT&CK\n" +
              "network   pfSense, Wireshark, Nmap, TCP/IP, DNS\n" +
              "identity  Active Directory, Entra ID, Azure, AWS, Mimecast\n" +
              "scripts   Python, PowerShell, Bash");
      },
      attack: function () {
        print("T1595 Active Scanning · T1190 Exploit Public-Facing App · T1566 Phishing\n" +
              "T1068 Priv-Esc · T1110 Brute Force · T1046 Service Discovery · T1078 Valid Accounts");
        print("→ scrolling to the map", "hl"); go("attack");
      },
      resume: function () {
        print("opening resume.pdf …", "ok");
        window.open("resume.pdf", "_blank", "noopener");
      },
      contact: function () {
        print("email     afangbedjichryst05@gmail.com\nphone     (412) 320-6422\nlinkedin  linkedin.com/in/chryst-afangbedji\ngithub    github.com/ChrystAF");
      },
      theme: function () { print("theme set to " + toggleTheme(), "ok"); },
      clear: function () { out.textContent = ""; },
      ls: function () { print("resume.pdf  labs/  certs/  detections/"); },
      cat: function (arg) {
        if (/resume/i.test(arg)) return CMDS.resume();
        print(arg ? "cat: " + arg + ": permission denied (nice try)" : "usage: cat <file>", "err");
      },
      sudo: function (arg) {
        if (/hire/i.test(arg)) { print("[sudo] access granted. Routing you to contact …", "ok"); go("contact"); }
        else print("chryst is not in the sudoers file. This incident will be reported. …to my SIEM.", "err");
      },
      date: function () { print(new Date().toString()); },
      history: function () { print(history.map(function (h, i) { return (i + 1) + "  " + h; }).join("\n") || "(empty)"); },
      exit: function () { print("there is no escape. try 'contact' instead.", "hl"); }
    };
    var VISIBLE = ["help", "whoami", "certs", "exp", "labs", "skills", "attack", "resume", "contact", "theme", "clear"];

    var MAX_INPUT = 64;
    var run = function (raw) {
      var cmd = String(raw).slice(0, MAX_INPUT).trim();
      print("chryst@soc:~$ " + cmd, "echo");
      if (cmd) {
        history.push(cmd);
        if (history.length > 50) history.shift();
        hpos = history.length;
        var parts = cmd.split(/\s+/);
        var name = parts[0].toLowerCase();
        // Only plain lowercase words can name a command (rules out __proto__, constructor, etc.)
        if (/^[a-z]+$/.test(name) && Object.prototype.hasOwnProperty.call(CMDS, name)) CMDS[name](parts.slice(1).join(" "));
        else print("command not found: " + name + " · try 'help'", "err");
      }
      out.scrollTop = out.scrollHeight;
    };

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      run(input.value);
      input.value = "";
    });

    input.addEventListener("keydown", function (ev) {
      if (ev.key === "ArrowUp" && hpos > 0) {
        ev.preventDefault(); input.value = history[--hpos];
      } else if (ev.key === "ArrowDown") {
        ev.preventDefault();
        hpos = Math.min(hpos + 1, history.length);
        input.value = history[hpos] || "";
      } else if (ev.key === "Tab" && input.value) {
        var hits = VISIBLE.filter(function (c) { return c.indexOf(input.value.toLowerCase()) === 0; });
        if (hits.length === 1) { ev.preventDefault(); input.value = hits[0]; }
      }
    });

    Array.prototype.forEach.call(document.querySelectorAll(".term-quick button"), function (b) {
      b.addEventListener("click", function () { run(b.getAttribute("data-cmd")); });
    });

    // "/" jumps into the shell from anywhere on the page
    document.addEventListener("keydown", function (ev) {
      var tag = (ev.target && ev.target.tagName) || "";
      if (ev.key === "/" && tag !== "INPUT" && tag !== "TEXTAREA") {
        ev.preventDefault();
        input.focus({ preventScroll: true });
        form.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
      }
    });
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
