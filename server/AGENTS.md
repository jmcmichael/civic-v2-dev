# Agent guide — server (Rails + GraphQL)

Read the root `AGENTS.md` first for repo-wide agreements (commit rules,
gates, dev processes).

- GraphQL API under `app/graphql/`; browse tables are backed by
  `resolvers/browse_*.rb`. Adding a filter/sort argument for the client is
  a resolver + type change here, then a schema dump and client codegen.
- Schema dumps are manual after schema changes (the client's codegen
  watcher does not trigger them).
- Searchkick models (Variant, Feature, MolecularProfile, EvidenceItem,
  Assertion, Disease, Therapy, VariantGroup, Revision) back the
  search-style filters; dev indices go stale after DB resets —
  `bundle exec rails searchkick:reindex:all` (OpenSearch on :9200).
- Text filters like `molecular_profile_name` 500 when the index is empty —
  that is index staleness, not a code bug.
- `rails dev:restore_images` repopulates user/org avatars after a dev DB
  reset (dumps leave orphaned blobs, so `attached?` alone is not proof).
- `profile_image_path` resolvers (user_type/organization_type; inherited
  by the Browse/Leaderboard types) must return **stable proxy URLs**
  (`rails_storage_proxy_url(variant)`, no `.processed`): raw
  `variant.processed.url` disk-service URLs are signed with a 5-minute
  ms-precision expiry — a unique, uncacheable URL every resolution, and
  inline image derivation in the GraphQL response. The proxy controller
  derives on first GET and serves `Cache-Control: public, max-age≈100y`.
  rack-mini-profiler would rewrite that to `no-store` in dev; the
  initializer `rack_mini_profiler.rb` skips `/rails/active_storage`.
