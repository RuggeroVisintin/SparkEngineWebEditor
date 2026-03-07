#!/bin/bash
set -e

# Run react-doctor and get the score
THRESHOLD=${REACT_DOCTOR_THRESHOLD:-90}
DIFF_BASE=${REACT_DOCTOR_DIFF_BASE:-}
DIFF_ARGS=()

if [ -n "$DIFF_BASE" ]; then
    DIFF_ARGS=(--diff "$DIFF_BASE")
    echo "Running react-doctor in PR diff mode against: $DIFF_BASE"
else
    echo "Running react-doctor in full scan mode"
fi

echo "Running react-doctor with threshold: $THRESHOLD"

# First get just the score
SCORE=$(npx react-doctor --offline -y "${DIFF_ARGS[@]}" --score 2>&1 | tail -1)

if [ -z "$SCORE" ]; then
    echo "Error: Could not extract score from react-doctor output"
    exit 1
fi

echo "React Doctor Score: $SCORE/100 (threshold: $THRESHOLD)"

# Check if score meets threshold
if [ "$SCORE" -lt "$THRESHOLD" ]; then
    echo "❌ Score $SCORE is below threshold $THRESHOLD"
    # Now run with full output to show details
    npx react-doctor --offline -y "${DIFF_ARGS[@]}" 2>&1 || true
    exit 1
else
    echo "✅ Score $SCORE meets or exceeds threshold $THRESHOLD"
    # Still run with full output for visibility
    npx react-doctor --offline -y "${DIFF_ARGS[@]}" 2>&1 || true
    exit 0
fi
