# Glimr Job Chat

A web app written in [Gleam](https://gleam.run) on the
[Glimr](https://github.com/glimr-org/glimr) framework. It runs on Erlang/OTP,
stores its data in SQLite, and builds its frontend assets with Vite and Tailwind
CSS.

The project is at an early stage. It currently has a bare home page at `/`.

## Prerequisites

Install these first:

- **[mise](https://mise.jdx.dev/getting-started.html)** installs the pinned
  versions of Erlang, Gleam, rebar3, Node, and lefthook from `mise.toml`.
- **[direnv](https://direnv.net/docs/installation.html)** (recommended) loads
  the toolchain and installs the git hooks when you enter the project directory.

## Initial setup

1. Clone the repo:

   ```sh
   git clone git@github.com:developerSid/glimr-job-chat.git
   cd glimr-job-chat
   ```

2. Install the toolchain.

   With direnv, this installs the tools and git hooks:

   ```sh
   direnv allow
   ```

   Without direnv, make sure
   [mise is activated](https://mise.jdx.dev/getting-started.html#activate-mise)
   in your shell, then run:

   ```sh
   mise trust
   mise install
   lefthook install
   ```

3. Install the dependencies:

   ```sh
   gleam deps download
   npm install
   ```

4. Create your environment file:

   ```sh
   cp .env.example .env
   ```

   `APP_KEY` must be set or the app crashes on boot. Replace the placeholder
   value with your own secret.

5. Compile the project. The `./glimr` script depends on the compiled packages,
   so this has to happen before you first use it:

   ```sh
   gleam build
   ```

6. Create the SQLite database and run the migrations:

   ```sh
   ./glimr migrate
   ```

## Running the app

```sh
./glimr run
```

Open <http://localhost:8000>. This command regenerates routes, templates, and
models, starts the Vite dev server, and reloads the app when files change.

To run the app without code generation, the dev proxy, or hot reload, use
`gleam run`.

## Common commands

| Command                    | What it does                                                              |
| -------------------------- | ------------------------------------------------------------------------- |
| `./glimr run`              | Start the dev server with hot reload                                      |
| `./glimr build`            | Regenerate compiled code and build the app                                |
| `./glimr migrate`          | Run pending database migrations                                           |
| `./glimr db_gen --migrate` | Generate migrations from schema changes and run them                      |
| `gleam test`               | Run the tests                                                             |
| `format`                   | Format Gleam and Markdown files (without direnv, run `.local/bin/format`) |
| `format --check`           | Check Gleam and Markdown formatting without changing files, as CI does    |
| `npm run build`            | Build production assets into `priv/static/`                               |

CI runs the tests and the formatting check on pushes to `main` and on pull
requests.

## Project layout

```text
config/                 TOML configuration, with env var interpolation
src/
  glimr_app.gleam       Application entry point
  app/                  Controllers, middleware, and application code
  compiled/             Generated routes and templates (do not edit)
  database/             Schemas, queries, and migrations
  resources/            Loom templates, TypeScript, and CSS
test/                   Tests
```

## Learn more

- [Glimr documentation](https://github.com/glimr-org/glimr#readme) covers
  routing, templates, sessions, the database layer, and the rest of the
  framework.
- [`CLAUDE.md`](CLAUDE.md) has more detail on this project's architecture and
  code generation.

## License

[MIT](LICENSE)
