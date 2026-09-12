/**
 * Auto-commit + push po każdej zmianie w repozytorium.
 *
 * Uruchom:  node scripts/auto-commit-push.mjs
 *    lub:   npm run git:auto
 *
 * Działanie:
 *   1. Obserwuje całe drzewo repo (fs.watch, recursive).
 *   2. Ignoruje zmiany w .git, node_modules oraz pliki ignorowane przez git.
 *   3. Po ustaniu zmian (debounce) robi: git add -A -> git commit -> git push.
 *   4. Jeśli push zostanie odrzucony (zdalna gałąź poszła do przodu),
 *      robi `git pull --rebase` i próbuje ponownie.
 *   5. Czeka, aż zniknie .git/index.lock (inne procesy git mogą pracować).
 *
 * Log: .git/auto-commit.log (poza drzewem roboczynym, nie wywołuje pętli).
 *
 * Zatrzymanie: Ctrl+C.
 */
import fs from 'fs';
import path from 'path';
import { execFile } from 'child_process';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const LOG = path.join(ROOT, '.git', 'auto-commit.log');
const DEBOUNCE_MS = Number(process.env.AUTOCOMMIT_DEBOUNCE_MS || 2500);
const MAX_PUSH_RETRIES = 3;

const IGNORE_SEGMENTS = new Set(['.git', 'node_modules']);
const IGNORE_SUFFIXES = ['.log'];

function log(msg) {
    const line = '[' + new Date().toISOString() + '] ' + msg;
    process.stdout.write(line + '\n');
    try { fs.appendFileSync(LOG, line + '\n'); } catch (e) { /* ignore */ }
}

function run(args, opts = {}) {
    return new Promise((resolve) => {
        execFile('git', args, {
            cwd: ROOT,
            env: { ...process.env, GIT_TERMINAL_PROMPT: '0' },
            maxBuffer: 32 * 1024 * 1024,
            ...opts
        }, (err, stdout, stderr) => {
            resolve({ code: err ? (err.code || 1) : 0, stdout: stdout || '', stderr: stderr || '' });
        });
    });
}

function isIgnored(rel) {
    const norm = rel.replace(/\\/g, '/');
    const parts = norm.split('/');
    if (parts.some((p) => IGNORE_SEGMENTS.has(p))) return true;
    if (IGNORE_SUFFIXES.some((s) => norm.endsWith(s))) return true;
    if (/^_/.test(parts[parts.length - 1])) return true;
    return false;
}

async function waitForLock() {
    const lock = path.join(ROOT, '.git', 'index.lock');
    for (let i = 0; i < 40; i++) {
        if (!fs.existsSync(lock)) return true;
        await new Promise((r) => setTimeout(r, 250));
    }
    return !fs.existsSync(lock);
}

async function changedFiles() {
    const res = await run(['status', '--porcelain=v1']);
    return res.stdout.split('\n').map((l) => l.slice(3).trim()).filter(Boolean);
}

async function sync() {
    if (!(await waitForLock())) { log('pominieto: .git/index.lock nadal istnieje'); return; }

    const status = await run(['status', '--porcelain=v1']);
    if (!status.stdout.trim()) return; // nic do zrobienia

    const files = await changedFiles();
    const add = await run(['add', '-A']);
    if (add.code !== 0) { log('BLAD git add: ' + add.stderr.trim()); return; }

    const stamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const head = files.length <= 6
        ? files.join(', ')
        : files.slice(0, 6).join(', ') + ' (+' + (files.length - 6) + ' wiecej)';
    const message = 'auto: zmiany ' + stamp + ' — ' + head;

    const commit = await run(['commit', '-m', message, '--no-verify']);
    if (commit.code !== 0) {
        const out = (commit.stdout + commit.stderr).trim();
        if (/nothing to commit/i.test(out)) return;
        log('BLAD git commit: ' + out);
        return;
    }
    log('commit OK: ' + message);

    for (let attempt = 1; attempt <= MAX_PUSH_RETRIES; attempt++) {
        const push = await run(['push']);
        if (push.code === 0) { log('push OK (proba ' + attempt + ')'); return; }

        const err = (push.stdout + push.stderr).trim();
        log('push odrzucony (proba ' + attempt + '): ' + err.split('\n').slice(-2).join(' | '));

        if (attempt < MAX_PUSH_RETRIES) {
            const pull = await run(['pull', '--rebase', '--autostash']);
            if (pull.code !== 0) {
                log('BLAD git pull --rebase: ' + (pull.stdout + pull.stderr).trim().split('\n').slice(-2).join(' | '));
                return;
            }
        }
    }
}

// --- watcher ---------------------------------------------------------------
let timer = null;
let running = false;
let queued = false;

async function trigger() {
    if (running) { queued = true; return; }
    running = true;
    try { await sync(); } catch (e) { log('BLAD: ' + (e && e.message ? e.message : String(e))); }
    running = false;
    if (queued) { queued = false; trigger(); }
}

function onEvent(event, rel) {
    if (!rel) return;
    if (isIgnored(rel)) return;
    clearTimeout(timer);
    timer = setTimeout(trigger, DEBOUNCE_MS);
}

log('watcher start: ' + ROOT + ' (debounce ' + DEBOUNCE_MS + 'ms)');
sync().catch((e) => log('BLAD inicjalny: ' + e.message));

fs.watch(ROOT, { recursive: true }, (event, rel) => onEvent(event, rel));

process.on('SIGINT', () => { log('watcher stop (SIGINT)'); process.exit(0); });
process.on('SIGTERM', () => { log('watcher stop (SIGTERM)'); process.exit(0); });
