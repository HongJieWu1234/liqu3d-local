#!/bin/sh
set -eu

script_dir=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
cd "$script_dir"

usage() {
  printf 'Usage: %s your.domain.com\n' "$0" >&2
  exit 2
}

[ "$#" -eq 1 ] || usage
domain=$(printf '%s' "$1" | tr '[:upper:]' '[:lower:]')
printf '%s' "$domain" | grep -Eq '^([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$' || {
  printf 'Enter a hostname only, such as maker.example.com (no https:// or path).\n' >&2
  exit 2
}

PMM_RESEND_API_KEY=${PMM_RESEND_API_KEY:-}
PMM_SMTP_HOST=${PMM_SMTP_HOST:-}
[ -n "$PMM_RESEND_API_KEY" ] || [ -n "$PMM_SMTP_HOST" ] || {
  printf 'Export PMM_RESEND_API_KEY or PMM_SMTP_HOST before deployment.\n' >&2
  exit 2
}
: "${PMM_EMAIL_FROM:?Export PMM_EMAIL_FROM before deployment.}"
if [ -n "${PMM_SMTP_USER:-}" ] && [ -z "${PMM_SMTP_PASS:-}" ]; then
  printf 'PMM_SMTP_PASS is required when PMM_SMTP_USER is set.\n' >&2
  exit 2
fi
if [ -z "${PMM_SMTP_USER:-}" ] && [ -n "${PMM_SMTP_PASS:-}" ]; then
  printf 'PMM_SMTP_USER is required when PMM_SMTP_PASS is set.\n' >&2
  exit 2
fi

command -v docker >/dev/null 2>&1 || {
  printf 'Docker is required. Install Docker Engine with the Compose plugin first.\n' >&2
  exit 1
}
docker compose version >/dev/null 2>&1 || {
  printf 'The Docker Compose plugin is required.\n' >&2
  exit 1
}
# Docker Desktop exposes a root-group socket; Linux commonly uses docker's GID.
if [ -z "${PMM_DOCKER_GID:-}" ]; then
  PMM_DOCKER_GID=$(stat -Lc '%g' /var/run/docker.sock 2>/dev/null || printf '0')
fi
export PMM_DOCKER_GID

umask 077
mkdir -p secrets bambu-profiles/BBL
# On macOS, import Bambu Studio's local vendor presets when available.
mac_bambu=/Applications/BambuStudio.app/Contents/Resources/profiles/BBL
if [ -d "$mac_bambu" ] && [ -z "$(find bambu-profiles/BBL -type f -name '*.json' -print -quit 2>/dev/null)" ]; then
  cp -R "$mac_bambu/." bambu-profiles/BBL/
  printf 'Imported Bambu Studio profiles from %s.\n' "$mac_bambu"
fi

{
  printf 'DOMAIN=%s\n' "$domain"
  printf 'APP_CPU_LIMIT=2.0\n'
  printf 'APP_MEMORY_LIMIT=2g\n'
  printf 'RENDERER_CPU_LIMIT=2.0\n'
  printf 'RENDERER_MEMORY_LIMIT=1g\n'
  printf 'PMM_WORKER_MEMORY=1g\n'
  printf 'PMM_WORKER_CPUS=1\n'
  printf 'PMM_ACCOUNT_STORAGE_MB=2048\n'
  printf 'OPENSCAD_MAX_JOBS=2\n'
  printf 'OPENSCAD_MAX_QUEUE=24\n'
} > .env
chmod 600 .env

docker compose config --quiet
docker compose pull caddy
docker compose up -d --build --remove-orphans --force-recreate

printf '\nDeployment started. HTTPS is issued automatically after DNS reaches this server.\n'
printf 'URL:      https://%s\n' "$domain"
printf 'Open the URL, create your account, and enter the workspace.\n'
if [ -n "$PMM_RESEND_API_KEY" ]; then
  printf 'Email two-factor authentication is enabled through the Resend API.\n'
else
  printf 'Email two-factor authentication is enabled through %s.\n' "$PMM_SMTP_HOST"
fi
