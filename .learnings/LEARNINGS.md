# Learnings

## [LRN-20260820-001] best_practice

**Logged**: 2026-08-20T00:00:00+08:00
**Priority**: medium
**Status**: resolved
**Area**: frontend

### Summary
Every layout control in an editor must visibly affect a final audience-facing output, not only the editor thumbnail.

### Details
The first composer made full/half width visible only inside its editing grid. Order and visibility reached presentation mode, but width did not reach any final report view. A dedicated composed HTML view now consumes all three layout properties while the canonical reading view preserves source order.

### Suggested Action
For future composer controls, trace each property from persistence through every intended consumer and add an audience-facing preview before calling the feature complete.

### Metadata
- Source: review
- Related Files: app/components/ReportReader.tsx, app/globals.css
- Tags: composer, layout, preview, data-flow
- Pattern-Key: harden.editor_output_parity

---
