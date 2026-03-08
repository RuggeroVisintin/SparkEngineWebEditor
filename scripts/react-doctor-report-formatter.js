function stripAnsi(value) {
    return value.replace(/\u001b\[[0-9;]*m/g, '');
}

function normalizeSpaces(value) {
    return value.replace(/\s+/g, ' ').trim();
}

function escapeTable(value) {
    return value.replace(/\\/g, '\\\\').replace(/\|/g, '\\|');
}

function normalizePath(value) {
    return value.replace(/^\.\//, '').trim();
}

function parseSummary(rawOutput) {
    const summaryMatch = rawOutput.match(/✗\s*(\d+)\s*error[s]?\s*⚠\s*(\d+)\s*warning[s]?\s*across\s*(\d+\/\d+)\s*files/i);

    if (!summaryMatch) {
        return {
            errors: 0,
            warnings: 0,
            filesWithFindings: '0/0',
        };
    }

    return {
        errors: Number(summaryMatch[1]),
        warnings: Number(summaryMatch[2]),
        filesWithFindings: summaryMatch[3],
    };
}

function parseFindings(rawOutput) {
    const lines = stripAnsi(rawOutput).split('\n');
    const findings = [];
    let currentFinding = null;

    for (const line of lines) {
        const markerMatch = line.match(/^\s*([✗⚠])\s+(.+)$/);

        if (markerMatch) {
            const marker = markerMatch[1];
            const severity = marker === '✗' ? 'Error' : 'Warning';
            let message = markerMatch[2].trim();
            let count = 1;

            const countMatch = message.match(/\((\d+)\)\s*$/);
            if (countMatch) {
                count = Number(countMatch[1]);
                message = message.replace(/\(\d+\)\s*$/, '').trim();
            }

            message = normalizeSpaces(message.split(/\s{2,}/)[0] || message);

            currentFinding = { severity, message, count, files: [] };
            findings.push(currentFinding);
            continue;
        }

        if (!currentFinding) {
            continue;
        }

        const fileMatch = line.match(/^\s+([A-Za-z0-9_./\-]+\.[A-Za-z0-9]+):\s*(\d+)\s*$/);
        if (fileMatch) {
            currentFinding.files.push({
                path: normalizePath(fileMatch[1]),
                line: Number(fileMatch[2]),
            });
        }
    }

    return findings;
}

function buildFileLink(path, line, repository, commitSha) {
    if (!repository || !commitSha) {
        return path;
    }

    return `[${path}](https://github.com/${repository}/blob/${commitSha}/${path}#L${line})`;
}

function flattenRows(findings) {
    const rows = [];

    for (const finding of findings) {
        if (finding.files.length === 0) {
            rows.push({
                severity: finding.severity,
                finding: finding.message,
                file: '-',
                line: '-',
                count: finding.count,
            });
            continue;
        }

        for (const fileRef of finding.files) {
            rows.push({
                severity: finding.severity,
                finding: finding.message,
                file: fileRef.path,
                line: fileRef.line,
                count: finding.count,
            });
        }
    }

    return rows;
}

function buildReactDoctorMarkdownReport({
    score,
    threshold,
    rawOutput,
    repository = '',
    commitSha = '',
}) {
    const summary = parseSummary(rawOutput);
    const findings = parseFindings(rawOutput);
    const rows = flattenRows(findings);
    const status = score >= threshold ? '✅ Pass' : '⚠️ Below Threshold';
    const reportLines = [
        '## 🩺 React Doctor Report',
        '',
        `**Score:** ${score} / 100`,
        '',
        '### Summary',
        '',
        '| Metric | Value |',
        '| --- | --- |',
        `| Status | ${status} |`,
        `| Threshold | ${threshold} |`,
        `| Errors | ${summary.errors} |`,
        `| Warnings | ${summary.warnings} |`,
        `| Files With Findings | ${summary.filesWithFindings} |`,
        '',
        '### Findings',
        '',
    ];

    if (rows.length === 0) {
        reportLines.push('No findings detected.');
        return `${reportLines.join('\n')}\n`;
    }

    reportLines.push('| Severity | Finding | File | Line | Count |');
    reportLines.push('| --- | --- | --- | --- | --- |');

    for (const row of rows) {
        const fileCell = row.file === '-'
            ? '-'
            : buildFileLink(row.file, row.line, repository, commitSha);

        reportLines.push(
            `| ${row.severity} | ${escapeTable(row.finding)} | ${escapeTable(fileCell)} | ${row.line} | ${row.count} |`,
        );
    }

    return `${reportLines.join('\n')}\n`;
}

module.exports = {
    buildReactDoctorMarkdownReport,
};