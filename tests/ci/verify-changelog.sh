#!/bin/bash
set -euo pipefail

# Verifies that release-please changelog only contains expected commits
# based on feature flag filtering rules

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
ENV_FILE="${ENV_FILE:-$REPO_ROOT/.env.production}"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }

# Test commits created by create-test-commits.sh
# Format: "commit_subject|feature_flag"
# Note: Changelog strips the conventional commit prefix (feat:, fix:, etc.)
TEST_COMMITS=(
    "test with disabled flag|FEATURE_TEST_FLAG_DISABLED"
    "test with enabled flag|FEATURE_TEST_FLAG_ENABLED"
    "test without flag|"
)

# Load enabled feature flags from environment variables or .env.production
load_enabled_flags() {
    local flags=()
    
    # First check environment variables (for testing)
    for var in $(compgen -e | grep '^FEATURE_' || true); do
        value="${!var}"
        if [[ "$value" == "true" ]]; then
            flags+=("$var")
        fi
    done
    
    # If no flags from environment, read from .env.production
    if [[ ${#flags[@]} -eq 0 ]] && [[ -f "$ENV_FILE" ]]; then
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
    echo "${flags[@]:-}"
}

# Determine if a commit should appear in changelog
should_appear_in_changelog() {
    local feature_flag=$1
    shift
    local enabled_flags=("$@")
    
    # No feature flag = always appear
    [[ -z "$feature_flag" ]] && return 0
    
    # Check if flag is enabled
    if [[ ${#enabled_flags[@]} -gt 0 ]]; then
        for flag in "${enabled_flags[@]}"; do
            [[ "$flag" == "$feature_flag" ]] && return 0  # Enabled = should appear
        done
    fi
    
    return 1  # Disabled = should NOT appear
}

main() {
    cd "$REPO_ROOT"
    
    log_info "Starting changelog verification"
    
    # Get enabled flags
    local enabled_flags=($(load_enabled_flags))
    log_info "Enabled flags: ${enabled_flags[*]:-none}"
    
    # Build expected commits list
    local expected_commits=()
    local filtered_commits=()
    
    for entry in "${TEST_COMMITS[@]}"; do
        local commit=$(echo "$entry" | cut -d'|' -f1)
        local feature_flag=$(echo "$entry" | cut -d'|' -f2)
        
        if should_appear_in_changelog "$feature_flag" "${enabled_flags[@]:-}"; then
            expected_commits+=("$commit")
            log_info "Expected in changelog: $commit"
        else
            filtered_commits+=("$commit")
            log_info "Should be filtered: $commit (flag: $feature_flag)"
        fi
    done
    
    # Check if we have stdin input (release-please output)
    if [ -t 0 ]; then
        log_warn "No release-please output provided via stdin"
        log_info "Run this script by piping release-please output:"
        log_info "  release-please ... | bash tests/ci/verify-changelog.sh"
        log_info ""
        log_info "Expected commits (${#expected_commits[@]}):"
        if [[ ${#expected_commits[@]} -gt 0 ]]; then
            printf '  - %s\n' "${expected_commits[@]}"
        fi
        log_info ""
        log_info "Should be filtered (${#filtered_commits[@]}):"
        if [[ ${#filtered_commits[@]} -gt 0 ]]; then
            printf '  - %s\n' "${filtered_commits[@]}"
        fi
        exit 0
    fi
    
    # Read changelog from stdin
    log_info "Parsing release-please output..."
    local changelog_output=$(cat)
    
    # Verify each expected commit appears
    local all_passed=true
    
    log_info ""
    log_info "Verification Results:"
    log_info "===================="
    
    for commit in "${expected_commits[@]}"; do
        if echo "$changelog_output" | grep -qF "$commit"; then
            log_success "✓ Found expected: $commit"
        else
            log_error "✗ Missing expected: $commit"
            all_passed=false
        fi
    done
    
    # Verify filtered commits do NOT appear
    if [[ ${#filtered_commits[@]} -gt 0 ]]; then
        for commit in "${filtered_commits[@]}"; do
            if echo "$changelog_output" | grep -qF "$commit"; then
                log_error "✗ Unexpected commit found: $commit"
                all_passed=false
            else
                log_success "✓ Correctly filtered: $commit"
            fi
        done
    fi
    
    log_info ""
    
    if [[ "$all_passed" == true ]]; then
        log_success "===================="
        log_success "All checks passed! ✓"
        log_success "===================="
        exit 0
    else
        log_error "===================="
        log_error "Verification failed ✗"
        log_error "===================="
        exit 1
    fi
}

main "$@"
