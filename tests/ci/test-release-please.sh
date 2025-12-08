#!/bin/bash
set -euo pipefail

# Test script for release-please with feature flag filtering
# Creates test commits, runs the filtering script, then cleans up

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }

cd "$REPO_ROOT"

log_info "🧪 Testing release-please with feature flag filtering"
echo "======================================================"

# Create test commits
log_info "Creating test commits..."

echo "test-disabled" > .test-1.txt
git add .test-1.txt
git commit -m "feat: test with disabled flag

This should be FILTERED OUT

Feature-Flag: FEATURE_DISABLED_TEST" --no-verify

echo "test-enabled" > .test-2.txt
git add .test-2.txt
git commit -m "feat: test with enabled flag

This should APPEAR in changelog

Feature-Flag: FEATURE_ADD_COMPONENTS" --no-verify

echo "test-no-flag" > .test-3.txt
git add .test-3.txt
git commit -m "feat: test without flag

This should ALWAYS APPEAR" --no-verify

log_info "Test commits created"
echo ""

# Check if GITHUB_TOKEN is set
if [[ -z "${GITHUB_TOKEN:-}" ]]; then
    log_warn "GITHUB_TOKEN not set - API requests will fail"
    log_warn "Set GITHUB_TOKEN to test with real GitHub API"
    echo ""
fi

# Run the actual script
log_info "Running git history filtering with --dry-run..."
echo ""

# Run the filtering script with dry-run flag
export REPO_ROOT="$REPO_ROOT"
export DRY_RUN=1
"$REPO_ROOT/scripts/release-please-with-feature-flags.sh"

echo ""
log_info "✅ Test completed"
