#!/bin/bash
set -e

OUTPUT_FILE=${REACT_DOCTOR_OUTPUT_FILE:-"react-doctor-output.txt"}
THRESHOLD=${REACT_DOCTOR_THRESHOLD:-90}

# Report script must consume existing output from the check step
if [ ! -f "$OUTPUT_FILE" ]; then
    echo "Error: react-doctor output file not found: $OUTPUT_FILE" >&2
    echo "Run the check step first with REACT_DOCTOR_OUTPUT_FILE set." >&2
    exit 1
fi

# Extract score from output - handle both "94/100" and "94 / 100" formats
SCORE=$(grep -Eo '[0-9]{1,3}[[:space:]]*/[[:space:]]*100' "$OUTPUT_FILE" | sed -E 's/[[:space:]]*\/[[:space:]]*100//' | tail -1 || echo "0")

# Generate the markdown report
REACT_DOCTOR_SCORE="$SCORE" REACT_DOCTOR_THRESHOLD="$THRESHOLD" REACT_DOCTOR_OUTPUT_FILE="$OUTPUT_FILE" REACT_DOCTOR_GITHUB_REPOSITORY="${GITHUB_REPOSITORY:-}" REACT_DOCTOR_GITHUB_SHA="${GITHUB_SHA:-}" node -e '
const fs = require("fs");
const { buildReactDoctorMarkdownReport } = require("./scripts/react-doctor-report-formatter");

const score = Number(process.env.REACT_DOCTOR_SCORE || 0);
const threshold = Number(process.env.REACT_DOCTOR_THRESHOLD || 90);
const rawOutput = fs.readFileSync(process.env.REACT_DOCTOR_OUTPUT_FILE, "utf8");

const report = buildReactDoctorMarkdownReport({
    score,
    threshold,
    rawOutput,
    repository: process.env.REACT_DOCTOR_GITHUB_REPOSITORY || "",
    commitSha: process.env.REACT_DOCTOR_GITHUB_SHA || "",
});

process.stdout.write(report);
'
