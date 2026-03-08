#!/bin/bash
set -e

# Run react-doctor and get the score
THRESHOLD=${REACT_DOCTOR_THRESHOLD:-90}
DIFF_BASE=${REACT_DOCTOR_DIFF_BASE:-}
OUTPUT_FILE=${REACT_DOCTOR_OUTPUT_FILE:-}
DIFF_ARGS=()

if [ -n "$DIFF_BASE" ]; then
    DIFF_ARGS=(--diff "$DIFF_BASE")
    echo "Running react-doctor in PR diff mode against: $DIFF_BASE"
else
    echo "Running react-doctor in full scan mode"
fi

echo "Running react-doctor with threshold: $THRESHOLD"

# Run react-doctor with verbose output and capture to file if specified
if [ -n "$OUTPUT_FILE" ]; then
    npx react-doctor --offline -y "${DIFF_ARGS[@]}" --verbose > "$OUTPUT_FILE" 2>&1 || true
    RAW_OUTPUT=$(cat "$OUTPUT_FILE")
else
    RAW_OUTPUT=$(npx react-doctor --offline -y "${DIFF_ARGS[@]}" --verbose 2>&1 || true)
fi

# Extract score from output - handle both "94/100" and "94 / 100" formats
SCORE=$(echo "$RAW_OUTPUT" | grep -o '[0-9][0-9]* */ *100' | sed 's/ *\/ *100//' | tail -1 || echo "")

if [ -z "$SCORE" ]; then
    echo "Error: Could not extract score from react-doctor output"
    echo "$RAW_OUTPUT"
    exit 1
fi

echo "React Doctor Score: $SCORE/100 (threshold: $THRESHOLD)"
echo "$RAW_OUTPUT"

# Check if score meets threshold
if [ "$SCORE" -lt "$THRESHOLD" ]; then
    echo "❌ Score $SCORE is below threshold $THRESHOLD"
    exit 1
else
    echo "✅ Score $SCORE meets or exceeds threshold $THRESHOLD"
    exit 0
fi
