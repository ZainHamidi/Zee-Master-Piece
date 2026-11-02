# Running the live site

One server (`2.31.170.44`, Ubuntu 26.04 ARM64) runs three containers with Docker Compose:

```
visitor ──▶ Caddy :80/:443 (HTTPS, compression) ──▶ app :3000 (Node: site + /api) ──▶ MongoDB 7.0
```

| Address | What |
|---|---|
| https://zeemasterpiece.com | The store. `/admin` redirects to the subdomain; the dashboard API answers 404 here |
| https://admin.zeemasterpiece.com | The dashboard (same app, `/` → `/admin`; store pages redirect to the main domain) |
| https://www.zeemasterpiece.com | Redirects to the store |

Only Caddy is reachable from the internet. On the server:

| Path | What |
|---|---|
| `/opt/zee/app/` | The code, copied by `deploy.sh` (don't edit here; it's overwritten on each deploy) |
| `/opt/zee/.env` | Settings and database passwords (owner-only). Template: `deploy/env.example` |
| `/opt/zee/backups/` | Daily database backups, 14 days kept |
| `zee` | `docker compose` for the site, e.g. `zee ps`, `zee logs -f app`, `zee restart app` |

SSH as `deploy@2.31.170.44` for everything site-related (root also works, keys only).

## Deploy

From this folder on your machine:

```sh
./deploy/deploy.sh
```

It copies the working folder to the server, rebuilds the app image and restarts what changed, and
fails if anything doesn't come up healthy. It deploys the folder as it is, uncommitted changes included.

## First-time database setup

Indexes, the starting products and settings, and the first dashboard admin (asks for an email and password):

```sh
ssh -t deploy@2.31.170.44 zee exec app node dist-server/setup-db.js
```

Add an admin or reset a password later:

```sh
ssh -t deploy@2.31.170.44 zee exec app node dist-server/create-admin.js
```

## Domain and DNS

DNS is at Hostinger (hPanel → Domains → zeemasterpiece.com → DNS records):

| Type | Name | Value |
|---|---|---|
| A / AAAA | `@` | `2.31.170.44` / `2a01:4f8:c016:1516::1` |
| A / AAAA | `admin` | `2.31.170.44` / `2a01:4f8:c016:1516::1` |
| CNAME | `www` | `zeemasterpiece.com` |

Caddy gets and renews the HTTPS certificates by itself. Password-reset links use `SITE_URL` in
`/opt/zee/.env` (`https://admin.zeemasterpiece.com`).

Password-reset emails: verify zeemasterpiece.com in Resend (it gives TXT records to add at Hostinger), then set
`RESEND_API_KEY` and `RESEND_FROM` in `/opt/zee/.env` and run `zee up -d`. Until then, reset links are printed
in `zee logs app`.

## Backups

Daily at 03:30 server time (`/etc/cron.d/zee-backup`), log in `/opt/zee/backups/backup.log`. Run one now:
`/opt/zee/app/deploy/backup.sh`. Restore one (replaces the site's data):

```sh
zee exec -T mongo sh -c 'mongorestore --username "$MONGO_INITDB_ROOT_USERNAME" --password "$MONGO_INITDB_ROOT_PASSWORD" --authenticationDatabase admin --archive --gzip --drop' < /opt/zee/backups/zee-YYYY-MM-DD.archive.gz
```

These backups are on the same disk as the database. Turn on the hosting provider's server backups too.

## Why MongoDB 7.0

MongoDB 8.0 and newer crash or refuse to start on Linux kernels 6.19–7.0.13
([SERVER-121912](https://jira.mongodb.org/browse/SERVER-121912)), and Ubuntu 26.04's kernel is in that range.
7.0 isn't affected and is supported until August 2027. To move to 8.x once the kernel is fixed:
check that `docker run --rm mongo:8.0 --version` prints a version instead of the kernel error, take a backup,
then change the image in `deploy/docker-compose.yml` and deploy.

## Server setup (already done)

Docker from Docker's apt repo with log rotation, 2 GB swap, ufw (22, 80, 443 only), SSH keys only,
automatic security updates, `deploy` user in the `docker` group.
