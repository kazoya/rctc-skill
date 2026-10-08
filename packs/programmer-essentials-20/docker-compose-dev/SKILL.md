---
name: docker-compose-dev
description: "Run local dependencies with Docker Compose without putting the app's production secrets in the compose file. Use when a programmer needs Postgres, Redis, or a worker on localhost."
---

# docker-compose-dev

1. Compose is for local dependencies. The app can still run on the host if that is simpler.
2. Pin image tags. Map ports only to `127.0.0.1`.
3. Passwords for local databases are dev-only and come from a gitignored env file, not from a committed default that matches production.
4. Add a healthcheck for any service the app waits on.
5. Document one command: `docker compose up -d` and the matching URL.

Do not mount the Docker socket into the app container.
