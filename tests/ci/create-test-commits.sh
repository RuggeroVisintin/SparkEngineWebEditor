#!/bin/bash
set -euo pipefail

# Creates test commits for release-please feature flag filtering tests

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Colors
GREEN='\033[0;32m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }

cd "$REPO_ROOT"

log_info "Creating test commits..."

echo "test-disabled" > .test-1.txt
git add .test-1.txt
git commit -m "feat: test with disabled flag

This should be FILTERED OUT

Feature-Flag: FEATURE_TEST_FLAG_DISABLED" --no-verify

echo "test-enabled" > .test-2.txt
git add .test-2.txt
git commit -m "feat: test with enabled flag

This should APPEAR in changelog

Feature-Flag: FEATURE_TEST_FLAG_ENABLED" --no-verify

echo "test-no-flag" > .test-3.txt
git add .test-3.txt
git commit -m "feat: test without flag

This should ALWAYS APPEAR" --no-verify

log_info "✅ Test commits created"
