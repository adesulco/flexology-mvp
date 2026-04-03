# Flexology v2 Audit Verification & Fix Prompt
## For use in Google Antigravity

Copy everything below the line and paste it into Antigravity as your prompt. Attach the `Flexology_Deployment_Audit_v2.docx` and/or `Flexology_Findings_Tracker_v2.xlsx` file alongside it.

---

## PROMPT START

You are a senior full-stack engineer and QA specialist. I am attaching a comprehensive deployment readiness audit document for **Flexology** — a premium sports recovery mobile booking system built with Next.js (Turbopack), PWA ServiceWorker, deployed on Vercel.

The v2 audit scored the current build at **5.4/10** for deployment readiness (improved from 4.8/10 in v1) and identified **24 findings** across 4 severity levels. Of the v1 findings, 8 were fixed, 11 remain open, 13 are new issues, and 1 regressed. Your job is to systematically verify every finding, implement fixes where possible, and confirm the application meets deployment standards.

### CONTEXT: What was fixed in v2

Before diving in, note these 8 items were confirmed FIXED since v1:
- **v1-HSTS**: HSTS header now present (max-age=63072000)
- **v1-SIDEBAR**: Admin sidebar navigation now works (was broken SPA routing)
- **v1-BOOKING-BYPASS**: Booking properly blocked when no therapist available
- **v1-AUTH-CHECK**: Admin redirects to home when not authenticated
- **v1-LOCALSTORAGE**: No sensitive data stored in localStorage
- **v1-CORS**: CORS not wildcard (same-origin policy enforced)
- **v1-DEBUG-ENDPOINTS**: No exposed debug/config API endpoints
- **v1-HOMEPAGE-CONTENT**: Featured Services section added to homepage

Do NOT break these fixes while implementing new ones.

### YOUR MISSION

Go through the attached audit document and for **each of the 24 findings**, do the following:

1. **LOCATE** the relevant code in the codebase
2. **VERIFY** the bug exists exactly as described
3. **FIX** the root cause (not just the symptom)
4. **TEST** that the fix works and doesn't break any of the 8 previously fixed items
5. **LOG** what you did in a checklist format

### PRIORITY ORDER

Fix in this exact order (Critical first, then High, Medium, Low):

#### CRITICAL BLOCKERS (5 findings — fix these first, they block deployment)

- [ ] **FLX-001: FCP 11,660ms — 6.5x above 1,800ms target**
  - Server TTFB is acceptable (310-440ms) but client-side rendering blocks for 11+ seconds.
  - Page appears as a black screen for ~10 seconds before content renders.
  - **Fix approach**: Profile the critical rendering path. Implement SSR/SSG for the initial HTML shell. Code-split aggressively with `next/dynamic`. Lazy load below-fold components (Featured Services, category tabs). Defer non-critical JS. Add `<link rel="preload">` for critical resources. Target: FCP < 1,800ms.
  - **Verification**: Run Lighthouse, check `performance.getEntriesByType('paint')` for FCP < 1,800ms.

- [ ] **FLX-002: 5 security headers missing**
  - Only HSTS is present. Missing: CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy.
  - **Fix approach**: Add in `next.config.js` headers or Vercel middleware:
    ```javascript
    { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;" },
    { key: 'X-Frame-Options', value: 'DENY' },
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' }
    ```
  - **Verification**: `fetch(url, {method:'HEAD'})` returns all 6 security headers.

- [ ] **FLX-003: /services route returns 404**
  - "SEE ALL" link on homepage Featured Services navigates to /services which shows "Not Found".
  - **Fix approach**: Create `app/services/page.tsx` with a services listing page, or update the "SEE ALL" href to point to the correct existing route (e.g., /book step 2).
  - **Verification**: Navigate to /services — page loads with services list. Homepage "SEE ALL" link works.

- [ ] **FLX-004: Trivial admin credentials (0000/admin)**
  - **Fix approach**: Change default admin credentials to a strong password (min 12 chars, mixed case, numbers, symbols). Implement rate limiting (max 5 attempts per 15 minutes). Add account lockout after 10 failed attempts. Consider MFA for admin access.
  - **Verification**: Weak passwords rejected. Account locks after failed attempts. Existing creds no longer work.

- [ ] **FLX-005: Tech stack exposed in response headers**
  - Server: Vercel, X-Powered-By: Next.js
  - **Fix approach**: In `next.config.js`: `poweredByHeader: false`. For Vercel Server header, add `{ key: 'Server', value: 'Flexology' }` in custom headers to override.
  - **Verification**: Response headers no longer contain "Next.js" or "Vercel".

#### HIGH PRIORITY (6 findings — fix these next)

- [ ] **FLX-006: Booking page content above viewport on load**
  - /book loads with Step 1 content scrolled above visible area. Users see blank page.
  - Not fixed from v1 audit.
  - **Fix approach**: Add `window.scrollTo(0, 0)` in the booking page `useEffect` on mount. Or use CSS `scroll-snap-align: start` on the content container. Ensure the "Service Type" header is the first visible element.
  - **Verification**: Navigate to /book — content is immediately visible without scrolling.

- [ ] **FLX-007: Dashboard Gross Settled Revenue shows Rp 0 vs Rp 675K in leaderboard**
  - Executive Dashboard revenue card contradicts leaderboard data on same page.
  - **Fix approach**: Debug the revenue aggregation query. Likely filtered by "settled" status while bookings are in "confirmed" status. Ensure both widgets query the same data source.
  - **Verification**: Revenue card total matches sum of leaderboard Gross Intake Volume values.

- [ ] **FLX-008: Currency format inconsistency (3 different formats)**
  - Consumer: "IDR 200K", Admin: "Rp 475,000" (commas), Indonesian convention: "Rp 200.000" (periods).
  - **Fix approach**: Create shared `formatCurrency(amount)` utility:
    ```javascript
    const formatCurrency = (amount) => `Rp ${amount.toLocaleString('id-ID')}`;
    ```
    Apply everywhere: homepage services, booking flow, admin dashboard, leaderboard. Indonesian convention uses period as thousands separator.
  - **Verification**: All prices across consumer and admin show "Rp X.XXX.XXX" format with period separators.

- [ ] **FLX-009: No therapists assigned to Dash Padel outlet**
  - Both therapists at Pondok Indah. Dash Padel has zero staff.
  - **Fix approach**: Either reassign a therapist to Dash Padel, or add logic to hide outlets with no available staff from the booking outlet selection. Add admin warning when an outlet has zero active staff.
  - **Verification**: Only outlets with active staff appear in booking. Or Dash Padel has therapists assigned.

- [ ] **FLX-010: Staff specialty typo "sports masasge"**
  - **Fix approach**: Correct to "sports massage" in the database.
  - **Verification**: indra's card shows "sports massage" (correct spelling).

- [ ] **FLX-011: Time format inconsistency (period vs colon)**
  - Forms use 09.00, cards use 09:00.
  - **Fix approach**: Standardize to colon format (HH:MM) throughout admin. Update form inputs and display formatting.
  - **Verification**: All time displays across admin use colon format (09:00).

#### MEDIUM PRIORITY (8 findings)

- [ ] **FLX-012**: Fix whitespace void below homepage content — add bottom nav or constrain page height
- [ ] **FLX-013**: Make "24 people looking" dynamic from real data, or remove the fake urgency indicator
- [ ] **FLX-014**: Fix duplicate logo.png network request — debug component re-render causing double fetch
- [ ] **FLX-015**: Make service ratings dynamic or remove hardcoded 4.9/5 until real reviews exist
- [ ] **FLX-016**: Fix credit card rate decimal format — standardize comma/period usage with validation
- [ ] **FLX-017**: Align outlet operating hours with therapist shift hours, or filter time slots by actual staff availability
- [ ] **FLX-018**: Fix "No grid columns available" in Pipeline — show staff columns or explain no staff assigned
- [ ] **FLX-019**: Auto-capitalize staff names on save ("indra" → "Indra")

#### LOW PRIORITY (5 findings)

- [ ] **FLX-020**: Clear pre-filled test data from Add Therapist form, use proper HTML placeholders
- [ ] **FLX-021**: Add confirmation modals for System Variable save actions
- [ ] **FLX-022**: Add persistent bottom navigation bar to consumer app (Home, Services, Book, Profile)
- [ ] **FLX-023**: Customize 404 page with Flexology branding instead of "Powered by Jemari App"
- [ ] **FLX-024**: Implement audit logging for all admin write operations (staff changes, outlet changes, system variable changes)

### VERIFICATION PROTOCOL

After implementing all fixes, run these verification checks:

**Performance Verification:**
```
- [ ] FCP < 1,800ms on fresh load (use Lighthouse or Performance API)
- [ ] TTFB < 500ms on all pages (currently passing: 309-440ms)
- [ ] All pages return HTTP 200 (fix /services 404)
- [ ] No duplicate resource requests (fix logo.png double load)
- [ ] Page load under 3 seconds on 4G throttled connection
- [ ] No black screen phase during initial render
```

**Security Verification:**
```
- [ ] HSTS header present on all responses (maintain v1→v2 fix)
- [ ] CSP header present with restrictive policy
- [ ] X-Frame-Options: DENY present
- [ ] X-Content-Type-Options: nosniff present
- [ ] Referrer-Policy: strict-origin-when-cross-origin present
- [ ] Permissions-Policy present restricting camera/microphone/geolocation
- [ ] Server header does NOT say "Vercel"
- [ ] X-Powered-By header removed
- [ ] Admin credentials changed from 0000/admin to strong password
- [ ] Rate limiting active on admin login (max 5 attempts per 15 min)
- [ ] No sensitive data in localStorage (maintain fix)
- [ ] CORS remains same-origin (maintain fix)
- [ ] No debug endpoints exposed (maintain fix)
```

**Data Integrity Verification:**
```
- [ ] Dashboard revenue matches leaderboard sum
- [ ] Currency format "Rp X.XXX" with period separators EVERYWHERE
- [ ] Staff specialty shows "sports massage" (not "masasge")
- [ ] Staff names properly capitalized
- [ ] Service ratings either dynamic or removed
- [ ] "24 people looking" either dynamic or removed
- [ ] Test data cleared from Add Therapist form
```

**UX Verification:**
```
- [ ] /book content visible immediately (no scroll-up required)
- [ ] /services page loads with services list
- [ ] Homepage "SEE ALL" link navigates to valid page
- [ ] No whitespace void below homepage
- [ ] Time format consistent (colon HH:MM) across admin
- [ ] Credit card rate field format matches label example
- [ ] Only staffed outlets appear in booking selection
- [ ] Pipeline grid shows staff columns for staffed outlets
- [ ] Bottom navigation on consumer app (if implemented)
```

**Regression Checks (DO NOT break these v1→v2 fixes):**
```
- [ ] HSTS header still present
- [ ] Admin sidebar navigation still works
- [ ] Booking still blocked when no therapist available
- [ ] Admin still redirects to home when not authenticated
- [ ] No sensitive data in localStorage
- [ ] CORS still same-origin
- [ ] Debug endpoints still return 404
- [ ] Featured Services section still on homepage
```

### OUTPUT FORMAT

When you're done, produce a summary in this format:

```
## Fix Report — v2 Audit Resolution
- Total findings addressed: X/24
- Critical fixes: X/5
- High fixes: X/6
- Medium fixes: X/8
- Low fixes: X/5
- Regressions introduced: X (target: 0)
- Previously fixed items confirmed intact: X/8

## Remaining Issues
[List any items you could NOT fix and why]

## New Deployment Readiness Score
[Your assessment — target: 8.0/10 minimum for deployment]
[Score breakdown: Performance, Security, Functionality, UX, Data Integrity]

## Security Posture Summary
[Confirm all 6 security headers properly configured]
[Confirm admin credentials strengthened]
[Confirm rate limiting active]
[Confirm tech stack headers removed]

## Performance Summary
[FCP measurement after fixes — must be < 1,800ms]
[TTFB maintained < 500ms]
[All pages returning 200]

## Regression Check Results
[Confirm all 8 previously fixed items remain intact]

## Files Changed
[List of all files modified with a one-line description of each change]
```

### IMPORTANT NOTES

- The app is built with **Next.js** (with Turbopack) and deployed on **Vercel** as a PWA with ServiceWorker
- Two outlets: Flexology at Dash Padel (Jakarta) and Flexology at Pondok Indah (Jakarta Selatan)
- Currency is Indonesian Rupiah (IDR) — use "Rp" prefix with period separators (Indonesian convention: Rp 200.000)
- The consumer app renders in a fixed-width mobile container with dark theme
- Admin panel uses light theme with sidebar navigation
- Run `npm run build` and verify zero build errors after all changes
- Do NOT break the 8 previously fixed items — run regression checks
- **Security fixes are deployment blockers** — all 6 headers, strong admin creds, and tech stack hiding are non-negotiable
- After all fixes, the target deployment readiness score is **8.0/10 minimum**
- Current score breakdown: Performance 3/10, Security 4/10, Functionality 6/10, UX 6/10, Data Integrity 5/10

## PROMPT END
