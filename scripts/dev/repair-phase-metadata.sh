#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"
python - <<'PY'
from pathlib import Path
path = Path('.opencode/plans/current-phase.md')
lines = path.read_text().splitlines()
in_validation = False
found_status = False
found_ready = False
changed = False
for i, line in enumerate(lines):
    if line.strip() == '## Validation':
        in_validation = True
        continue
    if in_validation and line.startswith('## '):
        if not found_status:
            lines[i:i] = ['Status: pending', 'Evidence:', '- not run yet', 'Blockers:', '- not validated yet', 'Ready to ship:', '- no']
            changed = True
        elif not found_ready:
            lines[i:i] = ['Ready to ship:', '- no']
            changed = True
        break
    if in_validation and line.startswith('Status:'):
        if line.split(':', 1)[1].strip() not in {'pending', 'PASS', 'FAIL'}:
            lines[i] = 'Status: pending'
            changed = True
        found_status = True
    if in_validation and line.strip() == 'Ready to ship:':
        found_ready = True
if changed:
    path.write_text('\n'.join(lines) + '\n')
    print('repair-phase-metadata: normalized .opencode/plans/current-phase.md')
else:
    print('repair-phase-metadata: no changes needed')
PY
