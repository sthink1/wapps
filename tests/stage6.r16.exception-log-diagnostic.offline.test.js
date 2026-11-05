'use strict';

// Stage 6 R16 — offline diagnostic for the current safe fatal logger.
// Loads the ACTUAL logger.js in a child process with narrowly mocked Winston and
// filesystem write functions. All file writes are redirected to OS temporary
// storage; no WA project files, server, database, network, or email are touched.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const loggerFile = path.resolve(__dirname, '../logger.js');
const source = fs.readFileSync(loggerFile, 'utf8');

// Fail closed if the logger's integration points or fatal design change.
assert.equal((source.match(/path\.join\(__dirname,\s*['"]logs['"],/g) || []).length, 2,
    'Expected exactly two ordinary Winston file transport paths');
assert.equal((source.match(/path\.join\(__dirname,\s*['"]logs['"]\)/g) || []).length, 1,
    'Expected exactly one fatal-log directory declaration');
assert.match(source, /const fs = require\(['"]fs['"]\)/,
    'Unexpected filesystem dependency: review isolation before running');
assert.match(source, /process\.on\(['"]uncaughtException['"]/);
assert.match(source, /process\.on\(['"]unhandledRejection['"]/);
assert.match(source, /process\.exit\(1\)/);
assert.match(source, /details omitted/);

const worker = String.raw`
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const filename = process.env.WA_R16_LOGGER_FILE;
const temp = process.env.WA_R16_LOG_SANDBOX;
const original = fs.readFileSync(filename, 'utf8');
const projectLogs = path.join(path.dirname(filename), 'logs');
const expectedFiles = new Set(['error.log','combined.log','exceptions.log','rejections.log']);
let unexpected = false;
const safeFile = (p) => {
  if (typeof p !== 'string' || path.dirname(p) !== projectLogs || !expectedFiles.has(path.basename(p))) {
    unexpected = true;
    throw Error('Unrecognized logger path; refusing project write');
  }
  return path.join(temp, path.basename(p));
};
const safeFs = Object.freeze({
  mkdirSync(p, opts) {
    if (p !== projectLogs) { unexpected = true; throw Error('Unrecognized mkdir path'); }
    return fs.mkdirSync(temp, opts);
  },
  appendFileSync(p, content, opts) { return fs.appendFileSync(safeFile(p), content, opts); }
});
const nop = () => {};
const winston = {
  format: {combine: nop, timestamp: nop, printf: nop, colorize: nop},
  transports: {
    File: class { constructor(opts) { safeFile(opts.filename); } },
    Console: class { constructor() {} }
  },
  createLogger: () => ({})
};
const priorLoad = Module._load;
Module._load = function(id, parent, isMain) {
  if (parent && parent.filename === filename) {
    if (id === 'fs') return safeFs;
    if (id === 'winston') return winston;
  }
  return priorLoad.apply(this, arguments);
};
const loaded = new Module(filename, module);
loaded.filename = filename;
loaded.paths = Module._nodeModulePaths(path.dirname(filename));
loaded._compile(original, filename);
Module._load = priorLoad;
if (unexpected) process.exit(93);
const marker = process.env.WA_R16_SYNTHETIC_MARKER;
if (process.env.WA_R16_SCENARIO === 'exception') {
  setImmediate(() => { throw Error('SYNTHETIC_R16_TEST_SECRET=' + marker); });
} else if (process.env.WA_R16_SCENARIO === 'rejection') {
  Promise.reject(Error('SYNTHETIC_R16_TEST_SECRET=' + marker));
} else {
  process.exit(92);
}
`;

function runScenario(kind, logName) {
    const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'wa-r16-safe-log-'));
    const marker = `FAKE_NOT_REAL_${kind.toUpperCase()}_R16_12345`;
    try {
        const env = {
            PATH: process.env.PATH || '',
            Path: process.env.Path || '',
            SystemRoot: process.env.SystemRoot || '',
            WA_R16_LOGGER_FILE: loggerFile,
            WA_R16_LOG_SANDBOX: temp,
            WA_R16_SCENARIO: kind,
            WA_R16_SYNTHETIC_MARKER: marker
        };
        const result = spawnSync(process.execPath, ['-e', worker], {
            cwd: temp, timeout: 12000, maxBuffer: 2 * 1024 * 1024,
            encoding: 'utf8', windowsHide: true, env
        });
        assert.equal(result.error, undefined, `${kind} worker execution error`);
        assert.equal(result.status, 1, `${kind} must exit with fatal status 1; stderr: ${result.stderr}`);
        const logPath = path.join(temp, logName);
        assert.equal(fs.existsSync(logPath), true, `${logName} must exist in temporary sandbox`);
        const data = fs.readFileSync(logPath, 'utf8');
        const output = `${result.stdout || ''}\n${result.stderr || ''}`;
        assert.ok(data.length > 0, 'Fatal log must contain a diagnostic');
        assert.equal(data.includes(marker), false, 'Synthetic marker disclosed in fatal log');
        assert.equal(output.includes(marker), false, 'Synthetic marker disclosed on stdout/stderr');
        assert.doesNotMatch(data, /SYNTHETIC_R16_TEST_SECRET=|Error:|\bat\s+.+:\d+/,
            'Fatal log must not contain exception details or a stack');
        const label = kind === 'exception' ? 'Uncaught exception' : 'Unhandled promise rejection';
        assert.match(data, new RegExp(`${label} \\(details omitted\\)`));
        assert.match(output, new RegExp(`${label} \\(details omitted\\)`));
        console.log(`R16 ${kind}: safe fatal log in temporary folder, no synthetic disclosure, exit 1`);
    } finally {
        fs.rmSync(temp, { recursive: true, force: true });
    }
}

test('R16 diagnostic: uncaught exception is sanitized in isolated fatal log and stderr', () => {
    runScenario('exception', 'exceptions.log');
});

test('R16 diagnostic: unhandled rejection is sanitized in isolated fatal log and stderr', () => {
    runScenario('rejection', 'rejections.log');
});
