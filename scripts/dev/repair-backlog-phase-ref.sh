#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"
python - <<'PY'
from pathlib import Path
import re
phase_text = Path('.opencode/plans/current-phase.md').read_text()
backlog_path = Path('.opencode/backlog/candidates.yaml')
backlog_text = backlog_path.read_text() if backlog_path.exists() else ''
m = re.search(r'(?m)^Phase file:\s*(.+)\s*$', phase_text)
if not m:
    raise SystemExit('repair-backlog-phase-ref: missing Phase file line')
phase_file = m.group(1).strip()
if not phase_file.startswith('backlog:'):
    print('repair-backlog-phase-ref: current phase is not a backlog reference; no changes needed')
    raise SystemExit(0)
backlog_id = phase_file.split(':', 1)[1].strip()
if re.search(rf'(?m)^\s*-\s+id:\s*{re.escape(backlog_id)}\s*$', backlog_text):
    print(f'repair-backlog-phase-ref: backlog id already present: {backlog_id}')
    raise SystemExit(0)
if 'archived:' not in backlog_text:
    backlog_text = backlog_text.rstrip() + '\n\narchived:\n'
backlog_text = backlog_text.rstrip() + f"\n  - id: {backlog_id}\n    title: {backlog_id}\n    module: workflow\n    shipped: false\n"
backlog_path.write_text(backlog_text.rstrip() + '\n')
print(f'repair-backlog-phase-ref: appended archived stub for backlog:{backlog_id}')
PY
