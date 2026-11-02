#!/usr/bin/env bash
# Ships this folder to the server and rebuilds the site there: ./deploy/deploy.sh
# Server settings and secrets live in /opt/zee/.env on the server and are never copied from here.
set -euo pipefail

host="${DEPLOY_HOST:-deploy@2.31.170.44}"
cd "$(dirname "$0")/.."

if [ -n "$(git status --porcelain 2>/dev/null)" ]; then
  echo "Note: deploying uncommitted changes from this folder."
fi

rsync -az --delete \
  --exclude node_modules --exclude dist --exclude dist-server --exclude .git \
  --exclude '.env*' --exclude '*.local' --exclude .DS_Store \
  ./ "$host:/opt/zee/app/"

# --wait fails the deploy if a service doesn't come up healthy. Caddy reloads its config without
# dropping connections (a no-op when deploy/caddy/Caddyfile hasn't changed).
ssh "$host" 'zee up -d --build --remove-orphans --wait \
  && zee exec -T caddy caddy reload --config /etc/caddy/Caddyfile \
  && docker image prune -f >/dev/null && zee ps'
