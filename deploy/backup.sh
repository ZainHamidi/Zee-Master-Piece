#!/bin/sh
# Daily database backup (cron on the server, /etc/cron.d/zee-backup). Keeps 14 days in /opt/zee/backups.
# These stay on the same disk: also turn on the hosting provider's server backups.
set -eu
dir=/opt/zee/backups
file="$dir/zee-$(date +%F).archive.gz"
mkdir -p "$dir"
/usr/local/bin/zee exec -T mongo sh -c \
  'mongodump --quiet --username "$MONGO_INITDB_ROOT_USERNAME" --password "$MONGO_INITDB_ROOT_PASSWORD" --authenticationDatabase admin --db "$MONGODB_DB" --archive --gzip' \
  >"$file.tmp"
mv "$file.tmp" "$file"
find "$dir" -name 'zee-*.archive.gz' -mtime +14 -delete
