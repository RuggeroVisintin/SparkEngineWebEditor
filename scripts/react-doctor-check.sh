#!/bin/bash
set -e

# Run react-doctor and get the score
THRESHOLD=${REACT_DOCTOR_THRESHOLD:-90}
echo "Running react-doctor with threshold: $THRESHOLD"
echo "Running react-doctor in full scan mode"

# First get just the score
SCORE=$(npx react-doctor --offline -y --score 2>&1 | tail -1)

if [ -z "$SCORE" ]; then
    echo "Error: Could not extract score from react-doctor output"
    exit 1
fi

echo "React Doctor Score: $SCORE/100 (threshold: $THRESHOLD)"

# Check if score meets threshold
if [ "$SCORE" -lt "$THRESHOLD" ]; then
    echo "❌ Score $SCORE is below threshold $THRESHOLD"
    # Now run with full output to show details
    npx react-doctor --offline -y 2>&1 || true
    exit 1
else
    echo "✅ Score $SCORE meets or exceeds threshold $THRESHOLD"
    # Still run with full output for visibility
    npx react-doctor --offline -y 2>&1 || true
    exit 0
fi
