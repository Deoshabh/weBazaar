# CORS and CSP Policy

## Purpose

Defines the production policy for cross-origin access and baseline header hardening on the API.

## CORS Behavior

Implementation is in `backend/server.js`.

- Always allowed:
  - `https://weBazaar.in`
  - `https://www.weBazaar.in`
  - `FRONTEND_URL` (if set)
  - values from `CORS_ALLOWED_ORIGINS` (comma-separated)
- Development mode: all origins are allowed for local testing.
- Optional wildcard subdomains: disabled by default.
  - Enable only when required by setting:
    - `CORS_ALLOW_WILDCARD_SUBDOMAINS=true`
  - When enabled, only `https://<subdomain>.weBazaar.in` is accepted.

## CSP and Security Headers

`helmet()` is enabled with default protections and `crossOriginResourcePolicy: "cross-origin"`.

- Content Security Policy is **not disabled**.
- If future API behavior requires policy changes, modify `helmet()` configuration in `backend/server.js` and document rationale in PR notes.

## Operational Guidance

- Prefer explicit allowlists over wildcard settings.
- Keep `CORS_ALLOW_WILDCARD_SUBDOMAINS` unset/false in production unless there is a validated business need.
- Any change to CORS or header policy should include:
  - security review,
  - staging verification,
  - rollback note.

## Quick Validation

- Browser request from approved storefront origin succeeds.
- Browser request from unapproved origin fails with CORS error.
- Response headers include Helmet defaults.
