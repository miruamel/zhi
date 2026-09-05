#!/usr/bin/env bash
# release.sh — Create and push a version tag to trigger publish.yml
# Usage: ./release.sh [patch|minor|major]

set -e

BUMP="${1:-patch}"
CURRENT=$(node -e "console.log(require('./package.json').version)")
MAJOR=$(echo "$CURRENT" | cut -d. -f1)
MINOR=$(echo "$CURRENT" | cut -d. -f2)
PATCH=$(echo "$CURRENT" | cut -d. -f3)

case "$BUMP" in
  major) NEW="${MAJOR}.$((MINOR+1)).0" ;;
  minor) NEW="${MAJOR}.$((MINOR+1)).0" ;;
  patch) NEW="${MAJOR}.${MINOR}.$((PATCH+1))" ;;
  *)     echo "Usage: $0 [patch|minor|major]"; exit 1 ;;
esac

echo "=== release: bumping $CURRENT → $NEW ==="
echo "1) Update package.json version (do this manually, then commit + push)"
echo "2) git tag v$NEW && git push origin v$NEW"
echo ""
echo "This script does NOT auto-bump to avoid unintended changes."
echo "After updating version, run:"
echo "  git add package.json CHANGES.md"
echo "  git commit -m 'chore: bump to $NEW'"
echo "  ./release.sh  # to push tag"
