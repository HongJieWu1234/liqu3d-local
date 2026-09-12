#!/bin/sh
set -eu

script_dir=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
cd "$script_dir"

env_file=.env.cloudflare
tunnel_secret=secrets/cloudflare-tunnel-token
resend_secret=secrets/resend-api-key

command -v docker >/dev/null 2>&1 || {
  printf 'Docker Desktop is required.\n' >&2
  exit 1
}
docker compose version >/dev/null 2>&1 || {
  printf 'Docker Compose is required.\n' >&2
  exit 1
}
[ -s "$env_file" ] || {
  printf 'Copy .env.cloudflare.example to .env.cloudflare and enter your sender address.\n' >&2
  exit 1
}
[ -s "$tunnel_secret" ] || {
  printf 'Save the Cloudflare tunnel token in %s.\n' "$tunnel_secret" >&2
  exit 1
}
[ -s "$resend_secret" ] || {
  printf 'Replace re_xxxxxxxxx with your real Resend API key in %s.\n' "$resend_secret" >&2
  exit 1
}

# Docker Desktop exposes a root-group socket; Linux commonly uses docker's GID.
if [ -z "${PMM_DOCKER_GID:-}" ]; then
  PMM_DOCKER_GID=$(stat -Lc '%g' /var/run/docker.sock 2>/dev/null || printf '0')
fi
export PMM_DOCKER_GID

umask 077
mkdir -p bambu-profiles/BBL
mac_bambu=/Applications/BambuStudio.app/Contents/Resources/profiles/BBL
if [ -d "$mac_bambu" ] && [ -z "$(find bambu-profiles/BBL -type f -name '*.json' -print -quit 2>/dev/null)" ]; then
  cp -R "$mac_bambu/." bambu-profiles/BBL/
  printf 'Imported Bambu Studio profiles from %s.\n' "$mac_bambu"
fi
chmod 600 "$env_file" "$tunnel_secret" "$resend_secret"

domain=$(sed -n 's/^DOMAIN=//p' "$env_file" | tail -1 | tr '[:upper:]' '[:lower:]')
printf '%s' "$domain" | grep -Eq '^([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$' || {
  printf 'DOMAIN in .env.cloudflare must be a hostname such as liqu3d.com.\n' >&2
  exit 2
}

docker compose --env-file "$env_file" -f compose.cloudflare.yml config --quiet
docker compose --env-file "$env_file" -f compose.cloudflare.yml pull tunnel
docker compose --env-file "$env_file" -f compose.cloudflare.yml up -d --build --remove-orphans

printf '\nThe private app and Cloudflare connector are running.\n'
printf 'Public URL: https://%s\n' "$domain"
printf 'Cloudflare route service: http://app:4173\n'
printf 'No host ports were published.\n'
