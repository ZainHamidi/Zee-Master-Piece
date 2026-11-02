#!/bin/sh
# docker compose for the live site, with the server's settings from /opt/zee/.env.
# Installed on the server as the `zee` command: zee ps, zee logs -f app, zee restart app…
exec docker compose --env-file /opt/zee/.env -f /opt/zee/app/deploy/docker-compose.yml "$@"
