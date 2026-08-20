# Errors

## [ERR-20260820-001] vinext-dev-sandbox-port

**Logged**: 2026-08-20T00:00:00+08:00
**Priority**: medium
**Status**: resolved
**Area**: infra

### Summary
The Sites vinext development server could not bind Cloudflare's inspector port inside the restricted filesystem/process sandbox.

### Error

```text
Error: listen EPERM: operation not permitted 0.0.0.0:9229
```

### Context
- Command: `npm run dev`
- Runtime: vinext with `@cloudflare/vite-plugin`
- The failure happened while probing the inspector port, before application rendering.

### Suggested Fix
Run the same development command in the approved host environment where local port binding is allowed, then keep the returned session alive for preview and publishing.

### Metadata
- Reproducible: yes
- Related Files: package.json, vite.config.ts
- Tags: sites, vinext, sandbox, preview

### Resolution
- **Resolved**: 2026-08-20T00:00:00+08:00
- **Notes**: The same command started successfully in the approved host environment, and the root and report routes returned HTTP 200.

---

## [ERR-20260820-007] github-push-sandbox-proxy

**Logged**: 2026-08-20T00:00:00+08:00
**Priority**: medium
**Status**: resolved
**Area**: infra

### Summary
The first push to the user-owned GitHub repository could not reach GitHub through the sandboxed local proxy.

### Error

```text
Failed to connect to 127.0.0.1 port 7897
```

### Context
- Command: `git push origin main`
- Remote: the existing credential-free HTTPS origin.
- The failure happened before GitHub authentication or repository negotiation.

### Suggested Fix
Retry the same push in the approved host network without changing or embedding credentials in the remote URL.

### Metadata
- Reproducible: yes
- Related Files: .git/config
- Tags: git, github, push, sandbox, proxy

### Resolution
- **Resolved**: 2026-08-20T00:00:00+08:00
- **Notes**: The approved host-network push completed successfully to origin/main.

---

## [ERR-20260820-006] sites-list-limit

**Logged**: 2026-08-20T00:00:00+08:00
**Priority**: low
**Status**: resolved
**Area**: infra

### Summary
The Sites list connector rejected a page size above the workspace-admin maximum.

### Error

```text
limit 100 > maximum 50
```

### Context
- Operation: list owner Sites before creating a new project.
- The public tool description did not state the workspace-specific maximum.

### Suggested Fix
Use a page size of 50 and follow the opaque cursor if another page is needed.

### Metadata
- Reproducible: yes
- Related Files: .openai/hosting.json
- Tags: sites, connector, pagination

### Resolution
- **Resolved**: 2026-08-20T00:00:00+08:00
- **Notes**: Retried with the accepted maximum page size.

---

## [ERR-20260820-005] npm-audit-sandbox-proxy

**Logged**: 2026-08-20T00:00:00+08:00
**Priority**: low
**Status**: resolved
**Area**: infra

### Summary
The production dependency audit could not reach the npm audit endpoint through the sandboxed local proxy.

### Error

```text
npm audit request failed: connect EPERM 127.0.0.1:7897
```

### Context
- Command: `npm audit --omit=dev`
- The failure is a network boundary and does not indicate a dependency finding.

### Suggested Fix
Rerun the same read-only audit in the approved host network environment.

### Metadata
- Reproducible: yes
- Related Files: package.json, package-lock.json
- Tags: npm, audit, sandbox, proxy

### Resolution
- **Resolved**: 2026-08-20T00:00:00+08:00
- **Notes**: The approved host-network run completed and reported zero production vulnerabilities.

---

## [ERR-20260820-004] react-effect-local-storage

**Logged**: 2026-08-20T00:00:00+08:00
**Priority**: low
**Status**: resolved
**Area**: frontend

### Summary
The first local-layout hydration effect synchronously set React state and violated the React 19 hooks lint rule.

### Error

```text
Calling setState synchronously within an effect can trigger cascading renders.
react-hooks/set-state-in-effect
```

### Context
- Command: `npm run lint`
- Layout state must start with the server-safe default, then synchronize from browser local storage after hydration.

### Suggested Fix
Schedule the external-storage read after the current effect turn and cancel the scheduled work during cleanup.

### Metadata
- Reproducible: yes
- Related Files: app/components/ReportReader.tsx
- Tags: react, local-storage, hydration

### Resolution
- **Resolved**: 2026-08-20T00:00:00+08:00
- **Notes**: Moved local-storage synchronization into a cancellable zero-delay timer and kept the server default deterministic.

---

## [ERR-20260820-003] og-metadata-test-origin

**Logged**: 2026-08-20T00:00:00+08:00
**Priority**: low
**Status**: resolved
**Area**: tests

### Summary
The first OG-image assertion assumed a root-relative metadata URL, while vinext serializes Open Graph images as absolute URLs.

### Error

```text
The input did not match /property="og:image" content="\/og\.png"/.
Actual content was http://localhost:3000/og.png.
```

### Context
- Command: `npm test`
- The generated metadata was present; the assertion encoded the wrong URL form.
- A hard-coded local fallback would also be unsafe for production sharing metadata.

### Suggested Fix
Resolve `metadataBase` from the request host, test with a production-like HTTPS origin, and assert the resulting absolute OG URL.

### Metadata
- Reproducible: yes
- Related Files: app/layout.tsx, tests/rendered-html.test.mjs
- Tags: metadata, og-image, vinext

### Resolution
- **Resolved**: 2026-08-20T00:00:00+08:00
- **Notes**: Added request-aware metadata base resolution and a production-origin route test.

---

## [ERR-20260820-002] eslint-generate-reports

**Logged**: 2026-08-20T00:00:00+08:00
**Priority**: low
**Status**: resolved
**Area**: tests

### Summary
ESLint rejected an unnecessary quote escape in the external-link rewrite regex.

### Error

```text
scripts/generate-reports.mjs:72:29  error  Unnecessary escape character: \"  no-useless-escape
```

### Context
- Command: `npm run lint`
- The expression behaved correctly at runtime but violated the repository lint rule.

### Suggested Fix
Use `[^"]` without escaping the double quote inside a regex literal.

### Metadata
- Reproducible: yes
- Related Files: scripts/generate-reports.mjs
- Tags: eslint, generator

### Resolution
- **Resolved**: 2026-08-20T00:00:00+08:00
- **Notes**: Removed the redundant escape and reran the validation suite.

---
