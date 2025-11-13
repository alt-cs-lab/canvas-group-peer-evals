A Canvas LTI tool for offering assignments to conduct peer evaluations on group members.

## Deployment

A sample [docker-compose.yml](docker-compose.yml) file is provided to build and run the application. 

A pre-built package is availble on [GitHub](https://github.com/alt-cs-lab/canvas-group-peer-evals/pkgs/container/canvas-group-peer-evals).

## Environment Variables

**Logging**

See [logger.js](src/configs/logger.js)

* `LOG_LEVEL` - the logging level (one of `error`, `warn`, `info`, `http`, `verbose`, `lti`, `debug`, `sql`, `silly`). 

**Database**

See [database.js](src/configs/database.js)

* `DB_HOST` - the database hostname (default `db`)
* `DB_PORT` - the database port (default `5432` for Postgres)
* `DB_NAME` - the database name (default `postgres`)
* `DB_USER` - the database username (default `postgres`) 
* `DB_PASSWORD` - the database password (default `postgres`)

**Sessions**

See [sessions.js](src/configs/sessions.js)

* `SESSION_KEY` - signing key for session cookies **REQUIRED** (no default)
   * You can use `require('crypto').randomBytes(64).toString('hex')` in Node to generate this
* `SESSION_NAME` - name for session cookie (default `connect.sid`)

**LTI**

See [lti.js](src/configs/lti.js)

* `DOMAIN_NAME` - the full domain name where the tool is hosted (e.g. `https://peereval.domain.tld`) **REQUIRED** (no default)
* `LTI_CONSUMER_KEY` - an LTI 1.0 consumer key (for a single LTI consumer setup) **REQUIRED** (no default)
* `LTI_SHARED_SECRET` - an LTI 1.0 shared  secret (for a single LTI consumer setup) **REQUIRED** (no default)

**Canvas**

See [canvas-api.js](src/services/canvas-api.js)

* `CANVAS_ACCESS_TOKEN` - a Canvas LMS API Key **REQUIRED** (no default)
* `CANVAS_HOST` - the hostname of the Canvas instance (e.g. `canvas.instructure.com`) **REQUIRED** (no default)

**Other**

See [index.js](index.js)

* `TRUST_PROXY` - `true` to trust any proxy, an IP address of a proxy to trust, or `false` to disable proxy trust

## Development

A full [devcontainer](.devcontainer) setup is provided with this project. It assumes it will be used with a working [Traefik](https://traefik.io/traefik) proxy set up on the `traefik` Docker network for testing with Canvas. Those lines can be removed from the [.devcontainer/docker-compose.yml](.devcontainer/docker-compose.yml) file for development elsewhere. 