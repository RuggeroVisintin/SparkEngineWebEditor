#!/bin/bash

# Load feature flags from .env.development
if [ -f .env.development ]; then
    export $(grep -v '^#' .env.development | xargs)
fi

# Run e2e tests with feature flags
jest --config=jest-e2e.config.js "$@"
