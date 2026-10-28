# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with
code in this repository.

## Overview

A Gleam web app built on the [Glimr](https://github.com/glimr-org/glimr)
framework (cloned from the Glimr bootstrap template). It runs on Erlang/OTP via
Mist, uses SQLite (`glimr_sqlite`) for the database, sessions, and cache, and
Vite + Tailwind for frontend assets. `README.md` covers project setup. Framework
documentation is in the
[upstream Glimr README](https://github.com/glimr-org/glimr#readme).

## Toolchain & Setup

Tool versions are pinned in `mise.toml` (Erlang, Gleam, rebar3, Node). `.envrc`
runs `mise install` through direnv. CI (`.github/workflows/test.yml`) uses the
same versions via `jdx/mise-action`. `.envrc` also installs the git hooks
defined in `lefthook.yml` (pre-commit runs `gleam format` on staged `.gleam`
files and Prettier on staged `.md` files, then re-stages them).

```sh
mise install
gleam deps download
npm install
cp .env.example .env   # APP_KEY must be set or the app crashes on boot
```

## Commands

```sh
./glimr run            # dev: auto-compiles routes/loom/commands/db models, starts Vite, hot reloads
./glimr build          # compile generated code + gleam build, then post-build hook (gleam format)
gleam run              # run without codegen, proxy, or hot reload
gleam test             # run all tests (gleeunit: any pub fn ending in `_test` under test/)
format                 # .local/bin helper (on PATH via direnv): gleam format src test + Prettier on Markdown
format --check         # check both without changing files (CI runs this)
npm run build          # production assets -> priv/static/ (gitignored)
```

`./glimr` is a shim that sources `build/packages/glimr/priv/cli.sh`, so run
`gleam build` (or `gleam deps download` + build) once before the first use.

gleeunit cannot run a single test. To focus on one, temporarily narrow the test
module or run it from `gleam shell`.

Useful generators and db commands:
`./glimr make_controller <name> [--resource]`, `make_model`, `make_action`,
`make_validator`, `make_middleware`, `make_command`,
`db_gen [--migrate] [--model=a,b]`, `migrate`. Pass `--database=<conn>` for a
connection other than `main`.

## Architecture

**Code generation is central.** Most of the wiring lives in `src/compiled/`,
which is generated and must not be edited by hand. `./glimr run` /
`./glimr build` regenerate it, based on the `auto_compile` / `auto_gen` flags in
`config/glimr.toml`:

- **Routes:** Controllers declare routes with doc-comment annotations
  (`/// @get "/path/:param"`) above handler functions. These compile into
  pattern-matching routers in `src/compiled/routes/{group}.gleam`. Any file
  named `*_controller.gleam` or `controller.gleam` anywhere under `src/` is
  discovered.
- **Route groups:** `config/route_group.toml` maps a URL prefix to a middleware
  group. `/api` goes to `api` and everything else to `web`. A new group needs
  three changes: an entry in that TOML, a case clause in `route_groups()` in
  `src/glimr_app.gleam`, and (optionally) a middleware stack in
  `src/app/http/kernel.gleam`.
- **Loom templates:** `src/resources/views/**/*.loom.html` compile to
  `src/compiled/loom/**.gleam`, each with a `render(...)` function that
  controllers call (`home.render() |> response.string_tree(200)`). A template
  with `l-on:*` handlers becomes a server-driven reactive component over
  WebSocket, similar to LiveView.
- **Database:** `src/database/<connection>/models/<model>/<model>_schema.gleam`
  defines the schema, and `queries/*.sql` in the same folder defines queries.
  `db_gen` diffs the schemas against a snapshot, writes SQL migrations to
  `src/database/<connection>/_migrations/`, and generates typed query modules
  under `models/<model>/gen/`. Migrations are forward-only.

**Request flow:** `glimr_app.main` loads config, builds the `App` record,
registers the session store, and starts Mist. For each request:
`context.new(req, app)` → `router.handle` picks the route group →
`kernel.handle` applies that group's middleware list → the compiled router → the
controller. Controllers get `ctx: Context(App)` and reach shared resources
through `ctx.app` (`db`, `cache`).

**Shared state:** Add new app-wide resources (pools, clients) as fields on `App`
in `src/app/app.gleam` and initialize them in `app()` in `src/glimr_app.gleam`.
Put business logic in actions (`src/app/actions/`). Actions take a `Pool` rather
than the whole `App` so console commands can reuse them.

**Config:** `config/*.toml` is loaded at startup, supports `${VAR}` /
`${VAR:-default}` env interpolation, and is read with
`config.get_string("file.key")` and similar functions. `.env` supplies the
variables. `DB_DATABASE` points at the SQLite file (`src/database/main/data.db`
by default).

**Frontend:** The entry point is `src/resources/ts/app.ts`, which imports
`@glimr/loom` (the reactive client runtime) and `src/resources/css/app.css`
(Tailwind v4). Layouts include assets with
`{{{ vite.tags("src/resources/ts/app.ts") }}}`. Static files in `priv/static/`
are served under `/static/`.
