#!/bin/bash
set -e

DIFF_BASE=${REACT_DOCTOR_DIFF_BASE:-}
CHANGED_FILES=""
if [ -n "$DIFF_BASE" ]; then
    CHANGED_FILES=$(git diff --name-only "$DIFF_BASE"...HEAD || true)
fi

# Get score first (always full codebase)
SCORE=$(npx react-doctor --offline -y --score 2>&1 | tail -1)

# Run react-doctor in verbose mode and capture output to a file
OUTPUT_FILE="react-doctor-output.txt"
npx react-doctor --offline -y --verbose > "$OUTPUT_FILE" 2>&1 || true

THRESHOLD=${REACT_DOCTOR_THRESHOLD:-90}

REACT_DOCTOR_SCORE="$SCORE" REACT_DOCTOR_THRESHOLD="$THRESHOLD" REACT_DOCTOR_OUTPUT_FILE="$OUTPUT_FILE" REACT_DOCTOR_CHANGED_FILES="$CHANGED_FILES" REACT_DOCTOR_GITHUB_REPOSITORY="${GITHUB_REPOSITORY:-}" REACT_DOCTOR_GITHUB_SHA="${GITHUB_SHA:-}" node -e '
const fs = require("fs");
const { buildReactDoctorMarkdownReport } = require("./scripts/react-doctor-report-formatter");

const score = Number(process.env.REACT_DOCTOR_SCORE || 0);
const threshold = Number(process.env.REACT_DOCTOR_THRESHOLD || 90);
const rawOutput = fs.readFileSync(process.env.REACT_DOCTOR_OUTPUT_FILE, "utf8");
const changedFiles = (process.env.REACT_DOCTOR_CHANGED_FILES || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

const report = buildReactDoctorMarkdownReport({
    score,
    threshold,
    rawOutput,
    changedFiles,
    repository: process.env.REACT_DOCTOR_GITHUB_REPOSITORY || "",
    commitSha: process.env.REACT_DOCTOR_GITHUB_SHA || "",
});

process.stdout.write(report);
'

# Cleanup
rm -f "$OUTPUT_FILE"
