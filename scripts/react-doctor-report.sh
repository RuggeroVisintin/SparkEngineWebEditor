#!/bin/bash
set -e

# Get score
SCORE=$(npx react-doctor --offline -y --score 2>&1 | tail -1)

# Run react-doctor in verbose mode and capture output to a file
OUTPUT_FILE="react-doctor-output.txt"
npx react-doctor --offline -y --verbose > "$OUTPUT_FILE" 2>&1 || true

THRESHOLD=${REACT_DOCTOR_THRESHOLD:-90}

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

# Cleanup
rm -f "$OUTPUT_FILE"
