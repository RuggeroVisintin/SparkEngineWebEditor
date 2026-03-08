// eslint-disable-next-line @typescript-eslint/no-require-imports
const { buildReactDoctorMarkdownReport } = require('./react-doctor-report-formatter');

describe('buildReactDoctorMarkdownReport', () => {
    it('renders score, summary, and findings as markdown tables with file links', () => {
        const output = `react-doctor v0.0.30

✔ Running lint checks.
  ✗ Component "Wrapper" defined inside "WithMemoryRouter" — creates new instance every render, destroying state
    src/hooks/withMemoryRouter.tsx: 9

  ⚠ Array index "index" used as key — causes bugs when list is reordered or filtered (2)
    src/templates/EntityPropsPanel/index.tsx: 30
    src/components/PopupMenu/index.tsx: 44

  │ ✗ 1 error  ⚠ 2 warnings  across 3/160 files  in 502ms │
`;

        const report = buildReactDoctorMarkdownReport({
            score: 94,
            threshold: 90,
            rawOutput: output,
            repository: 'RuggeroVisintin/SparkEngineWebEditor',
            commitSha: 'abc123',
        });

        expect(report).toContain('## 🩺 React Doctor Report');
        expect(report).toContain('**Score:** 94 / 100');
        expect(report).toContain('### Summary');
        expect(report).toContain('| Metric | Value |');
        expect(report).toContain('| Status | ✅ Pass |');
        expect(report).toContain('| Errors | 1 |');
        expect(report).toContain('| Warnings | 2 |');
        expect(report).toContain('| Files With Findings | 3/160 |');
        expect(report).toContain('### Findings');
        expect(report).toContain('| Severity | Finding | File | Line | Count |');
        expect(report).toContain('[src/hooks/withMemoryRouter.tsx](https://github.com/RuggeroVisintin/SparkEngineWebEditor/blob/abc123/src/hooks/withMemoryRouter.tsx#L9)');
        expect(report).toContain('[src/templates/EntityPropsPanel/index.tsx](https://github.com/RuggeroVisintin/SparkEngineWebEditor/blob/abc123/src/templates/EntityPropsPanel/index.tsx#L30)');
        expect(report).toContain('[src/components/PopupMenu/index.tsx](https://github.com/RuggeroVisintin/SparkEngineWebEditor/blob/abc123/src/components/PopupMenu/index.tsx#L44)');
    });

    it('renders findings when no repository or commit info provided', () => {
        const output = `react-doctor v0.0.30

✔ Running lint checks.
  ⚠ Array index "index" used as key — causes bugs when list is reordered or filtered (2)
    src/templates/EntityPropsPanel/index.tsx: 30
    src/components/PopupMenu/index.tsx: 44

  │ ✗ 0 errors  ⚠ 2 warnings  across 2/160 files  in 502ms │
`;

        const report = buildReactDoctorMarkdownReport({
            score: 94,
            threshold: 90,
            rawOutput: output,
        });

        expect(report).toContain('src/templates/EntityPropsPanel/index.tsx');
        expect(report).toContain('src/components/PopupMenu/index.tsx');
        expect(report).not.toContain('https://github.com');
    });

    it('does not apply formatter-side changed files filtering', () => {
        const output = `react-doctor v0.0.30

✔ Running lint checks.
  ⚠ Array index "index" used as key — causes bugs when list is reordered or filtered (2)
    src/templates/EntityPropsPanel/index.tsx: 30
    src/components/PopupMenu/index.tsx: 44

  │ ✗ 0 errors  ⚠ 2 warnings  across 2/160 files  in 502ms │
`;

        const report = buildReactDoctorMarkdownReport({
            score: 94,
            threshold: 90,
            rawOutput: output,
            changedFiles: ['src/templates/EntityPropsPanel/index.tsx'],
        });

        expect(report).toContain('src/templates/EntityPropsPanel/index.tsx');
        expect(report).toContain('src/components/PopupMenu/index.tsx');
        expect(report).not.toContain('_Showing findings only for files changed in this PR._');
    });

    it('renders a warning status when score is below threshold', () => {
        const report = buildReactDoctorMarkdownReport({
            score: 82,
            threshold: 90,
            rawOutput: '  │ ✗ 0 errors  ⚠ 5 warnings  across 3/160 files  in 450ms │',
        });

        expect(report).toContain('| Status | ⚠️ Below Threshold |');
        expect(report).toContain('| Threshold | 90 |');
    });
});