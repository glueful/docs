#!/usr/bin/env bash
set -euo pipefail

# Sync Glueful framework cookbook docs into the site at content/6.cookbook
# Usage:
#   scripts/sync_cookbook.sh [PATH_TO_FRAMEWORK_COOKBOOK]
#
# Defaults:
#   - If no path is provided, uses sibling framework at ../framework/docs/cookbook

script_dir="$(cd "$(dirname "$0")" && pwd)"
repo_root="$(cd "$script_dir/.." && pwd)"

SRC_DIR="${1:-}"
if [[ -z "${SRC_DIR}" ]]; then
  # Assume framework is a sibling to the docs repo root
  SRC_DIR="$repo_root/../framework/docs/cookbook"
fi

OUT_DIR="$repo_root/content/6.cookbook"
TMP_DIR="$(mktemp -d 2>/dev/null || mktemp -d -t glueful_cookbook)"

if [[ ! -d "$SRC_DIR" ]]; then
  echo "Error: Cookbook source directory not found: $SRC_DIR" >&2
  exit 1
fi

echo "Syncing cookbook from: $SRC_DIR"
echo "Target: $OUT_DIR"

process_file() {
  local src="$1"
  local base name_noext slug dst title
  base="$(basename "$src")"
  name_noext="${base%.md}"

  # slug: lowercase, strip leading numeric prefixes (e.g., 01-), replace spaces with dashes
  slug="$(printf "%s" "$name_noext" | tr '[:upper:]' '[:lower:]')"
  slug="$(printf "%s" "$slug" | sed -E 's/^[0-9]{1,2}-//')"
  slug="${slug// /-}"
  dst="$TMP_DIR/${slug}.md"

  # Title from first H1 or prettified slug
  title="$(grep -m1 -E '^# ' "$src" | sed -E 's/^#\s*//')"
  if [[ -z "$title" ]]; then
    title="$(printf "%s" "$slug" | sed -E 's/-/ /g; s/\b([a-z])/\U\1/g')"
  fi

  {
    cat <<EOF
---
title: ${title}
description: 
---

EOF
    # Drop first-level H1 and rewrite internal cookbook links
    awk 'NR==1 && $0 ~ /^# / {next} {print}' "$src" \
      | sed -E "s#\(docs/cookbook/#(/cookbook/#g" \
      | sed -E "s#\(\./([0-9]{1,2}-)?#(./#g"
  } > "$dst"
}

# Process all Markdown files
shopt -s nullglob
for f in "$SRC_DIR"/*.md; do
  process_file "$f"
done
shopt -u nullglob

# Ensure output directory exists
mkdir -p "$OUT_DIR"

# Replace existing cookbook pages
rm -f "$OUT_DIR"/*.md || true
cp "$TMP_DIR"/*.md "$OUT_DIR"/

# Generate index page
{
  cat <<'EOF'
---
title: Cookbook
description: Practical recipes for common tasks
---

Explore practical Glueful recipes by topic:

EOF
  for f in "$OUT_DIR"/*.md; do
    bf=$(basename "$f")
    [[ "$bf" == "index.md" ]] && continue
    slug="${bf%.md}"
    t=$(awk '/^title: /{print substr($0,8); exit}' "$f")
    echo "- [${t:-$slug}](/cookbook/$slug)"
  done | sort -f
} > "$OUT_DIR/index.md"

echo "Cookbook sync complete. Files written to $OUT_DIR"

