// Checks whether tools this project vendors/depends on have a newer version
// upstream, and prints a short, friendly notice if so. Runs automatically
// before `npm run build` / `npm run build:all` (via the "prebuild"/
// "prebuild:all" npm hooks) so it's part of the normal rebuild flow without
// needing to be remembered as a separate step.
//
// This never fails the build: network errors, rate limits, or being offline
// all degrade to a one-line "couldn't check" notice rather than blocking
// anything. It also never modifies files — it only reports.
//
// To track another tool, add an entry to CHECKS below with a way to read the
// currently-vendored version and a way to fetch the latest one.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const TIMEOUT_MS = 4000;

function parseVersion(v) {
  const m = String(v || '').trim().match(/(\d+)\.(\d+)\.(\d+)/);
  return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null;
}
function isNewer(a, b) {
  // true if a > b
  for (let i = 0; i < 3; i++) {
    if (a[i] !== b[i]) return a[i] > b[i];
  }
  return false;
}
async function fetchText(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

const CHECKS = [
  {
    name: 'Arcager',
    repo: 'bert2020-dev/Arcager',
    currentVersion() {
      const src = fs.readFileSync(path.join(ROOT, 'vendor', 'Arcager', 'arcager.py'), 'utf8');
      const m = src.match(/^VERSION\s*=\s*['"]([\d.]+)['"]/m);
      return m ? m[1] : null;
    },
    async latestVersion() {
      // Arcager has no tagged releases as of this writing (git ls-remote --tags
      // returns nothing) — its only version marker is the VERSION string in the
      // file itself, so that's what we compare against main.
      const text = await fetchText('https://raw.githubusercontent.com/bert2020-dev/Arcager/main/arcager.py');
      const m = text.match(/^VERSION\s*=\s*['"]([\d.]+)['"]/m);
      if (!m) throw new Error('VERSION marker not found upstream');
      return m[1];
    },
    releaseUrl: 'https://github.com/bert2020-dev/Arcager',
  },
];

async function checkOne(check) {
  let current;
  try {
    current = check.currentVersion();
  } catch (err) {
    return { ...check, status: 'error', message: `couldn't read vendored version (${err.message})` };
  }
  if (!current) {
    return { ...check, status: 'error', message: 'vendored version string not found' };
  }
  let latest;
  try {
    latest = await check.latestVersion();
  } catch (err) {
    return { ...check, status: 'unknown', current, message: `couldn't check for updates (${err.message})` };
  }
  const c = parseVersion(current), l = parseVersion(latest);
  if (!c || !l) {
    return { ...check, status: 'unknown', current, latest, message: 'version string did not parse as x.y.z' };
  }
  if (isNewer(l, c)) {
    return { ...check, status: 'outdated', current, latest };
  }
  return { ...check, status: 'current', current, latest };
}

export async function checkLatest({ quiet = false } = {}) {
  const results = await Promise.all(CHECKS.map(checkOne));
  for (const r of results) {
    if (r.status === 'current') {
      if (!quiet) console.log(`[check:updates] ${r.name} ${r.current} — up to date.`);
    } else if (r.status === 'outdated') {
      console.log(`[check:updates] ${r.name} ${r.current} is vendored; ${r.latest} is available.`);
      console.log(`                 Update: npm run setup:arcager -- (or re-vendor manually) — ${r.releaseUrl}`);
    } else if (r.status === 'unknown') {
      if (!quiet) console.log(`[check:updates] ${r.name} ${r.current}: ${r.message}`);
    } else {
      if (!quiet) console.log(`[check:updates] ${r.name}: ${r.message}`);
    }
  }
  return results;
}

// Run directly (as opposed to imported) when invoked via `npm run check:updates`
// or as a prebuild hook.
if (import.meta.url === `file://${process.argv[1]}`) {
  checkLatest().catch((err) => {
    // Never fail a build over this — just say so and move on.
    console.log(`[check:updates] skipped (${err.message})`);
  });
}
