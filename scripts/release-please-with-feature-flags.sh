#!/bin/bash
set -euo pipefail

# Run release-please with feature flag filtering by rewriting git history
# This creates a temporary branch with filtered commits, runs release-please, then restores original branch

REPO_ROOT="${REPO_ROOT:-$(git rev-parse --show-toplevel)}"
ORIGINAL_BRANCH=$(git rev-parse --abbrev-ref HEAD)
TEMP_BRANCH="release-please-filtered-$(date +%s)"
ENV_FILE="$REPO_ROOT/.env.production"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

cleanup() {
    log_info "Cleaning up..."
    git checkout "$ORIGINAL_BRANCH" 2>/dev/null || true
    git branch -D "$TEMP_BRANCH" 2>/dev/null || true
}

trap cleanup EXIT

# Check for uncommitted changes
if [[ -n $(git status --porcelain) ]]; then
    log_error "You have uncommitted changes"
    echo "Please commit or stash your changes before running this script"
    git status --short
    exit 1
fi

cd "$REPO_ROOT"

log_info "Starting release-please with feature flag filtering"
log_info "Current branch: $ORIGINAL_BRANCH"

# Load enabled feature flags from .env.production
load_enabled_flags() {
    local flags=()
    if [[ -f "$ENV_FILE" ]]; then
        while IFS='=' read -r key value; do
            [[ "$key" =~ ^#.*$ ]] && continue
            [[ -z "$key" ]] && continue
            key=$(echo "$key" | xargs)
            value=$(echo "$value" | xargs)
            if [[ "$key" =~ ^FEATURE_ && "$value" == "true" ]]; then
                flags+=("$key")
            fi
        done < "$ENV_FILE"
    fi
    echo "${flags[@]}"
}

enabled_flags=($(load_enabled_flags))
log_info "Enabled flags: ${enabled_flags[*]:-none}"

# Find commits that need rewriting
last_release=$(git describe --tags --abbrev=0 2>/dev/null | xargs git rev-list -n 1 || echo "")
commit_range="${last_release:+$last_release..}HEAD"

log_info "Analyzing commits in range: $commit_range"

# Create filtered branch
git checkout -b "$TEMP_BRANCH"

# Rewrite commit messages using git filter-branch
log_info "Filtering commits based on feature flags..."
log_info "Enabled flags list: '${enabled_flags[*]:-}'"

# Build enabled flags string for the filter
enabled_flags_str="${enabled_flags[*]:-}"

# Create filter script
filter_script=$(cat << 'FILTER_EOF'
msg=$(cat)

# Extract feature flag from commit message
feature_flag=$(echo "$msg" | grep -i "^Feature-Flag:" | sed "s/^Feature-Flag: *//i" | xargs || echo "")

# Debug output to stderr (visible in CI logs)
echo "[DEBUG] Processing commit with feature_flag: '$feature_flag'" >&2
echo "[DEBUG] Enabled flags: 'ENABLED_FLAGS_PLACEHOLDER'" >&2

# Check if feature flag is enabled (only if feature flag exists)
should_filter=0
if [ -n "$feature_flag" ]; then
    # Has a feature flag - check if it is enabled
    is_enabled=0
    for flag in ENABLED_FLAGS_PLACEHOLDER; do
        echo "[DEBUG] Comparing '$flag' with '$feature_flag'" >&2
        if [ "$flag" = "$feature_flag" ]; then
            is_enabled=1
            echo "[DEBUG] Match found! Keeping commit." >&2
            break
        fi
    done
    
    # If not enabled, mark for filtering
    if [ $is_enabled -eq 0 ]; then
        should_filter=1
        echo "[DEBUG] No match found. Filtering commit." >&2
    fi
else
    echo "[DEBUG] No feature flag. Keeping commit." >&2
fi

# Apply filtering if needed
if [ $should_filter -eq 1 ]; then
    # Rewrite: change conventional commit type to chore and add [filtered] marker
    # release-please ignores chore commits by default in most configs
    echo "$msg" | sed "s/^\(feat\|fix\|refactor\|perf\|test\|build\|ci\):/chore: [filtered]/"
else
    # Keep original (either no feature flag, or feature flag is enabled)
    echo "$msg"
fi
FILTER_EOF
)

# Replace placeholder with actual enabled flags
filter_script=$(echo "$filter_script" | sed "s/ENABLED_FLAGS_PLACEHOLDER/$enabled_flags_str/g")
    
# Use git filter-branch to rewrite messages
FILTER_BRANCH_SQUELCH_WARNING=1 git filter-branch -f --msg-filter "$filter_script" "$commit_range"

# Run release-please if not in dry-run mode or CI
if [[ "${DRY_RUN:-0}" == "1" ]] || [[ "${CI:-false}" == "true" ]]; then
    log_info "Skipping release-please execution (DRY_RUN=${DRY_RUN:-0}, CI=${CI:-false})"
    log_info "Git history filtered successfully on branch: $TEMP_BRANCH"
else
    log_info "Running release-please on filtered branch..."
    
    # Check if GITHUB_TOKEN is set
    if [[ -z "${GITHUB_TOKEN:-}" ]]; then
        log_warn "GITHUB_TOKEN not set - this may cause API errors"
    fi
    
    # Install if needed
    if ! command -v release-please &> /dev/null && ! npx --no-install release-please --version &> /dev/null; then
        log_info "Installing release-please..."
        npm install --no-save release-please >/dev/null 2>&1
    fi
    
    # Run release-please with provided arguments
    npx release-please release-pr \
        --repo-url="${REPO_URL:-$(git config --get remote.origin.url | sed 's/.*github.com[:/]\(.*\)\.git/\1/')}" \
        --target-branch="${TARGET_BRANCH:-main}" \
        ${GITHUB_TOKEN:+--token="$GITHUB_TOKEN"} \
        "$@"
    
    exit_code=$?
    log_info "Release-please completed with exit code: $exit_code"
    exit $exit_code
fi
