# Agent guide — CIViC v2

Curated knowledgebase for clinical interpretation of variants in cancer.
Monorepo: `client/` (Angular 22 + Apollo/GraphQL) and `server/` (Rails +
GraphQL + Searchkick/OpenSearch). Area-specific guides: `client/AGENTS.md`,
`server/AGENTS.md`.

## Working agreements

- **Commits**: one concern per commit; stage files by name (never
  `git add -A`); no `Co-Authored-By`/AI trailers; never amend or rewrite
  history without being asked. Messages document what was found and why the
  change took its shape — they are the project's detailed record.
- Commits may pause on 1Password commit signing — that is a human approving;
  wait, don't retry or bypass.
- Never commit `.angular/` caches or edit `server/public` build artifacts
  (deploy builds are committed deliberately by maintainers; clobbers of
  `server/public` are routinely reverted).
- Prefer targeted lookups (resolvers, `git grep` in-repo) over broad
  recursive searches; stay inside the repo unless asked.
- Secrets: the root `.env` is a 1Password-backed fifo. Never snapshot it to
  a file. To load it for CLI work: `set -a; eval "$(cat ../.env)"; set +a`
  (from `server/`; adjust the relative path).

## Dev processes (typically already running — ask before starting/killing)

- `yarn start` (client, :4200 — the human's serve; never take it over. Run
  your own on `--port 4201` for verification), GraphQL codegen watcher,
  Rails on :3000 (client proxies `/api` to it), OpenSearch on :9200.
- `ng serve --hmr` can serve stale lazy chunks after large edits — verify
  what is *served* (sentinel-check a marker in your new code), not what is
  on disk; ask for a :4200 restart rather than killing it.

## Verification gates (client)

```
yarn ng test --no-watch          # vitest suite
yarn tsc -p tsconfig.spec.json --noEmit
yarn lint                        # 0 errors; warning budget in CI
yarn check:cycles
yarn generate-apollo             # codegen no-drift after .gql edits
```

Bundle work: `yarn build:stats` + `node scripts/analyze-bundle.mjs`
(`--save`/`--diff` snapshots) — measure, don't reason; removing a "dead"
lazy import can hoist 60 kB+ into `main`.

## CI / PR checks

- Every PR needs **exactly one** release label (`bugfix`, `housekeeping`,
  `new-feature`, `enhancement`, `ignore-for-release`, `dependencies`) or the
  `label` check fails.
- `server/bin/brakeman` passes `--ensure-latest`: any new upstream brakeman
  release fails **all** PRs (exit 5; sole output "X is not the latest
  version Y", no scan). Fix by bumping the gem — `bundle lock
  --update=brakeman` in `server/` — not by debugging the PR.
- Rubocop sweeps the whole server tree (omakase style — e.g. trailing
  commas in multiline hashes). Exact file/line for a CI failure:
  `gh api repos/griffithlab/civic-v2/check-runs/<job-id>/annotations`.

## Server quick notes

- Searchkick dev indices go stale after DB resets:
  `bundle exec rails searchkick:reindex:all` (env loaded as above).
- `rails dev:restore_images` repopulates user/org avatars after a reset.
  Fixed per-user exceptions live in `USER_AVATAR_OVERRIDES`
  (`server/lib/tasks/dev.rake`); a plain re-run self-corrects an overridden
  user whose attached file doesn't match — no `FORCE=1` needed.
- GraphQL schema dumps are a manual step after schema changes.
