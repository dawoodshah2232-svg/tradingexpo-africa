#!/bin/bash
# Auto-deploy Trading Expo Africa: when origin/main has new commits under
# frontend/, rebuild and publish frontend/dist to the gh-pages branch.
# Safe to run every 15 minutes. Exits quietly when nothing changed.
set -u
REPO="$HOME/workspace/repos/tradingexpo-africa"
MARK="$REPO/.last-deployed-main"
cd "$REPO" || exit 0

# Only operate when tracked files are clean; never clobber uncommitted work.
# The watermark file is managed by this script, so ignore its own changes.
if [ -n "$(git status --porcelain --untracked-files=no -- . ':!.last-deployed-main')" ]; then exit 0; fi

git fetch origin main -q || exit 0
REMOTE="$(git rev-parse origin/main)"
LAST="$(cat "$MARK" 2>/dev/null || echo none)"
if [ "$REMOTE" = "$LAST" ]; then exit 0; fi

git checkout -q main || exit 0
git pull -q --ff-only origin main || { git checkout -q main; exit 0; }

# Rebuild (only if something under frontend/ changed — cheap guard)
if git diff --quiet "$LAST" "$REMOTE" -- frontend/ 2>/dev/null; then
  echo "$REMOTE" > "$MARK"; exit 0
fi
(cd frontend && npm run build) || { git checkout -q main; exit 0; }

git checkout -q gh-pages
git checkout -q -- .
git checkout main -- frontend/dist
cp -r frontend/dist/. .
rm -rf frontend
git add -A
git commit -q -m "deploy: auto $(date -u +%Y-%m-%dT%H:%M:%SZ)" || true
git push -q origin gh-pages
git checkout -q main
echo "$REMOTE" > "$MARK"
echo "deployed $REMOTE"
