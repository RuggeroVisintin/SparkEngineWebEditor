import fs from 'fs';
import os from 'os';
import path from 'path';
import { spawnSync } from 'child_process';

describe('react-doctor-report.sh', () => {
    it('fails fast when output file is missing and does not re-run check', () => {
        const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rd-report-test-'));
        const fakeBinDir = path.join(tempDir, 'bin');
        const markerFile = path.join(tempDir, 'npm-called.txt');
        const missingOutputFile = path.join(tempDir, 'missing-output.txt');

        fs.mkdirSync(fakeBinDir, { recursive: true });
        fs.writeFileSync(
            path.join(fakeBinDir, 'npm'),
            `#!/bin/bash\necho called > "${markerFile}"\nexit 0\n`,
            { mode: 0o755 },
        );

        const scriptPath = path.join(__dirname, 'react-doctor-report.sh');
        const result = spawnSync('bash', [scriptPath], {
            encoding: 'utf8',
            env: {
                ...process.env,
                PATH: `${fakeBinDir}:${process.env.PATH || ''}`,
                REACT_DOCTOR_OUTPUT_FILE: missingOutputFile,
            },
        });

        expect(result.status).toBe(1);
        expect(result.stdout + result.stderr).toContain('Error: react-doctor output file not found');
        expect(fs.existsSync(markerFile)).toBe(false);
    });
});
