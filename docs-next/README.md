# docs-next (Glueful)

This is a parallel documentation workspace to rebuild the Glueful docs using the proposed IA. It does not affect the current site until cutover.

## Structure

- `content/`
  - `1.start/`
  - `2.tutorials/`
  - `3.guides/`
  - `4.concepts/`
  - `5.reference/`
  - `6.operations/`
  - `7.security/`
  - `8.extensions/`
  - `9.recipes/`
  - `10.contribute/`

Each section contains:
- `.navigation.yml` for section title/icon
- `index.md` as the landing page (stub)

## Workflow

- Author new content under `docs-next/content/*`.
- Keep current docs untouched for stability.
- When IA and content are ready, cut over by replacing `src/content` (or migrating section-by-section), and add redirects for changed URLs.

### Cookbook sync (optional during rewrite)

- You can mirror the framework cookbook into `docs-next/content/9.recipes`:
  - With env var: `GLUEFUL_FRAMEWORK_DIR=/path/to/glueful/framework node scripts/sync-cookbook.js`
  - Or explicit paths: `node scripts/sync-cookbook.js --from /path/to/glueful/framework/docs/cookbook --to docs-next/content/9.recipes`
  - The script copies all `.md` files; re-run to refresh.

## Notes

- Icons use the Lucide naming (e.g., `i-lucide-rocket`).
- Keep frontmatter minimal for now; we can enrich SEO later.
- Cookbook integration can remain links during the rewrite and be synced at cutover.
