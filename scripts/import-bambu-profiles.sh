#!/bin/sh
set -eu
script_dir=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
source_dir=${1:-}
if [ -z "$source_dir" ]; then
  for candidate in \
    "/Applications/BambuStudio.app/Contents/Resources/profiles/BBL" \
    "$HOME/.config/BambuStudio/resources/profiles/BBL" \
    "$HOME/.local/share/BambuStudio/resources/profiles/BBL"; do
    if [ -d "$candidate" ]; then source_dir=$candidate; break; fi
  done
fi
[ -n "$source_dir" ] && [ -d "$source_dir" ] || {
  printf 'Usage: %s /path/to/BambuStudio/resources/profiles/BBL\n' "$0" >&2
  exit 2
}
dest="$script_dir/bambu-profiles/BBL"
mkdir -p "$dest"
cp -R "$source_dir/." "$dest/"
printf 'Imported Bambu profiles into %s\n' "$dest"
