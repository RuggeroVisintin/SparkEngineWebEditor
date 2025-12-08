#!/bin/bash
set -euo pipefail

# Integration test for release-please changelog verification

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }

cd "$REPO_ROOT"

log_info "Setting up test environment..."

# Save current state
ORIGINAL_BRANCH=$(git rev-parse --abbrev-ref HEAD)
STASH_OUTPUT=$(git stash push -u -m "test-changelog-verification" 2>&1 || echo "")

cleanup() {
    log_info "Cleaning up..."
    git checkout "$ORIGINAL_BRANCH" 2>/dev/null || true
    if [[ "$STASH_OUTPUT" != *"No local changes"* ]]; then
        git stash pop 2>/dev/null || true
    fi
}

trap cleanup EXIT

# Create a temporary test branch
TEST_BRANCH="test-changelog-verify-$$"
git checkout -b "$TEST_BRANCH"

# Create test commits
log_info "Creating test commits..."
bash tests/ci/create-test-commits.sh

# Create mock release-please output
log_info "Creating mock release-please output..."
cat > /tmp/mock-release-output.txt << 'EOF'
## [1.2.0](https://github.com/test/test/compare/v1.1.0...v1.2.0) (2025-12-07)

### Features

* test with enabled flag ([abc123](https://github.com/test/test/commit/abc123))
* test without flag ([def456](https://github.com/test/test/commit/def456))
EOF

log_info "Running verification..."
if cat /tmp/mock-release-output.txt | bash tests/ci/verify-changelog.sh; then
    log_success "Verification passed!"
    exit 0
else
    log_error "Verification failed!"
    exit 1
fi
