#!/usr/bin/env bash

# Script to process commits with Feature-Flag footers
# Adds "Release-As: skip" to commits where the flag is disabled in production
#
# Usage:
#   ./scripts/process-feature-flags.sh [commit-range]
#
# Examples:
#   ./scripts/process-feature-flags.sh              # Process last commit
#   ./scripts/process-feature-flags.sh HEAD~3..HEAD # Process last 3 commits
#   ./scripts/process-feature-flags.sh main..HEAD   # Process commits from main to HEAD

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

log_success() {
    echo -e "${GREEN}✓${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

log_error() {
    echo -e "${RED}✗${NC} $1"
}

# Change to project root
cd "$PROJECT_ROOT"

# Check if .env.production exists
if [ ! -f .env.production ]; then
    log_warning "No .env.production file found"
    exit 0
fi

log_info "Loading production feature flags from .env.production"

# Parse production flags into associative array
declare -A prod_flags
while IFS='=' read -r key value; do
    # Skip comments and empty lines
    [[ "$key" =~ ^[[:space:]]*#.*$ ]] && continue
    [[ "$key" =~ ^[[:space:]]*$ ]] && continue
    
    # Remove leading/trailing whitespace
    key=$(echo "$key" | xargs)
    value=$(echo "$value" | xargs)
    
    # Only process FEATURE_ prefixed variables
    if [[ "$key" =~ ^FEATURE_ ]]; then
        flag_name="${key#FEATURE_}"
        prod_flags["$flag_name"]="$value"
        log_info "Production flag: ${BLUE}$flag_name${NC} = ${YELLOW}$value${NC}"
    fi
done < .env.production

# Determine commits to check
if [ -n "$1" ]; then
    commit_range="$1"
    log_info "Processing commits in range: $commit_range"
    commits=$(git log --format="%H" "$commit_range")
else
    log_info "Processing last commit"
    commits=$(git log --format="%H" -n 1)
fi

if [ -z "$commits" ]; then
    log_warning "No commits to process"
    exit 0
fi

modified=false
commit_count=0

# Process each commit
for commit in $commits; do
    commit_count=$((commit_count + 1))
    short_commit=$(git rev-parse --short "$commit")
    commit_subject=$(git log --format=%s -n 1 "$commit")
    
    log_info "[$commit_count] Processing ${BLUE}$short_commit${NC}: $commit_subject"
    
    # Get full commit message
    msg=$(git log --format=%B -n 1 "$commit")
    
    # Check if commit has Feature-Flag footer
    if echo "$msg" | grep -q "^Feature-Flag:"; then
        flag_name=$(echo "$msg" | grep "^Feature-Flag:" | head -1 | cut -d':' -f2- | xargs)
        log_info "    Found feature flag: ${YELLOW}$flag_name${NC}"
        
        # Check if flag exists in production config
        if [ -z "${prod_flags[$flag_name]+x}" ]; then
            log_warning "    Flag ${YELLOW}$flag_name${NC} not found in .env.production - skipping"
            continue
        fi
        
        # Check if flag is disabled in production
        if [ "${prod_flags[$flag_name]}" = "false" ]; then
            log_info "    Flag is ${RED}disabled${NC} in production"
            
            # Check if commit already has Release-As: skip
            if echo "$msg" | grep -q "^Release-As: skip"; then
                log_success "    Already has ${BLUE}Release-As: skip${NC}"
            else
                log_warning "    Needs ${BLUE}Release-As: skip${NC} footer"
                
                # Check if this is the HEAD commit (only HEAD can be amended)
                if [ "$commit" = "$(git rev-parse HEAD)" ]; then
                    log_info "    Adding ${BLUE}Release-As: skip${NC} to HEAD commit"
                    
                    # Prepare new commit message with Release-As: skip footer
                    # Insert after Feature-Flag: line
                    new_msg=$(echo "$msg" | awk '/^Feature-Flag:/ {print; print "Release-As: skip"; next} 1')
                    
                    # Amend the commit
                    echo "$new_msg" | git commit --amend -F -
                    modified=true
                    log_success "    Commit amended with ${BLUE}Release-As: skip${NC}"
                else
                    log_error "    Cannot amend commit $short_commit (not HEAD)"
                    log_warning "    Please use interactive rebase: ${BLUE}git rebase -i $commit~1${NC}"
                fi
            fi
        else
            log_success "    Flag is ${GREEN}enabled${NC} in production - no action needed"
        fi
    else
        log_info "    No Feature-Flag footer found"
    fi
done

echo ""
if [ "$modified" = true ]; then
    log_success "Commits were modified - use ${BLUE}git push --force-with-lease${NC} if already pushed"
    exit 0
else
    log_success "No modifications needed"
    exit 0
fi
