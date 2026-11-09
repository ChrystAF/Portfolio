# Security

This is a static, client-only site: no backend, no database, no user accounts, and no form that submits data anywhere. That removes most common web risk by design. On top of that, a few hardening measures are in place:

## What's in place

- **HTTPS everywhere.** Served over TLS by GitHub Pages. Enable **Settings → Pages → Enforce HTTPS** so HTTP is redirected.
- **Content Security Policy.** A strict CSP (`<meta http-equiv="Content-Security-Policy">` in `index.html`) that:
  - blocks all plugins and embedding (`object-src 'none'`, `frame-ancestors 'none'`, which stops clickjacking),
  - pins scripts to same-origin only (`script-src 'self'`, so no inline script execution, which blocks the most common XSS vector),
  - restricts styles/fonts to this origin and Google Fonts,
  - locks down `base-uri` and `form-action`, and upgrades any insecure requests.
- **No inline JavaScript.** All behavior lives in `app.js`, so the CSP can forbid inline scripts outright.
- **Referrer policy** set to `strict-origin-when-cross-origin`.
- **Safe outbound links.** Every external link uses `rel="noopener noreferrer"` so linked pages can't touch `window.opener` or read the referrer.
- **No secrets, no tracking, no third-party scripts.** The only external resource is the Google Fonts stylesheet.

## Note on headers

GitHub Pages doesn't let you set custom HTTP response headers (e.g. `X-Content-Type-Options`, `Strict-Transport-Security`). The policies above are delivered via `<meta>` where the platform supports it. For full header control, host behind a CDN/proxy such as Cloudflare Pages or Netlify.

## Reporting

Found an issue with this site? Email **afangbedjichryst05@gmail.com**.
