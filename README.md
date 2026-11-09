# Chryst Afangbedji - Personal Resume Site

A fast, single-page portfolio/resume site for an aspiring **SOC / Cybersecurity Analyst** working toward **Detection Engineering**. No build step, no dependencies, just one `index.html` you can drop on any static host.

**Live site:** https://chrystaf.github.io/Resume-Website/

<!-- Add a screenshot: save one to docs/preview.png, then uncomment the next line.
![Site preview](docs/preview.png)
-->


## About

I'm a cybersecurity student at Slippery Rock University (NSA CAE program) with hands-on SOC experience from an enterprise internship and home labs built around Splunk and Microsoft Sentinel. This repo hosts my personal site: experience, certifications, and the labs I've built.

## Highlights

- **Zero dependencies:** plain semantic HTML + CSS + one small vanilla-JS file, loads instantly.
- **Security-hardened:** strict Content Security Policy, no inline scripts, `noopener noreferrer` on outbound links, HTTPS-only. See [SECURITY.md](SECURITY.md).
- **Light & dark themes:** follows the visitor's system theme with a manual toggle (saved to `localStorage`).
- **Responsive:** works from a 400px phone to a wide desktop; no horizontal scroll.
- **Accessible:** keyboard focus states, active-section nav, reduced-motion support, real contrast in both themes.

## Résumé PDF

The hero's **Download résumé** button links to [`resume.pdf`](resume.pdf) at the repo root. To update it, export the new resume to PDF, overwrite `resume.pdf`, and push.

## Tech

| | |
|---|---|
| Markup | HTML5 (`index.html`) |
| Styling | Hand-written CSS (custom properties, Grid, Flexbox) |
| Behavior | Vanilla JS (`app.js`): theme toggle, smooth scroll, active-nav |
| Fonts | IBM Plex Sans + IBM Plex Mono (Google Fonts) |
| Security | Content Security Policy, `noopener noreferrer`, HTTPS |
| Hosting | GitHub Pages |

## License

Code is released under the [MIT License](LICENSE). Resume content and personal information are © Chryst Afangbedji.

## Contact

- Email: afangbedjichryst05@gmail.com
- LinkedIn: [in/chryst-afangbedji](https://www.linkedin.com/in/chryst-afangbedji)
- GitHub: [@ChrystAF](https://github.com/ChrystAF)
