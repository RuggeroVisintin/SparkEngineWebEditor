#!/bin/bash

# Load feature flags from appropriate env file
# Use .env.production in CI, otherwise use .env.development
ENV_FILE=".env.development"

if [ -n "$CI" ] || [ -n "$GITHUB_ACTIONS" ]; then
    ENV_FILE=".env.production"
fi

if [ -f "$ENV_FILE" ]; then
    export $(grep -v '^#' "$ENV_FILE" | xargs)
fi

# Run e2e tests with feature flags
jest --config=jest-e2e.config.js "$@"
