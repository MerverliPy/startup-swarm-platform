#!/usr/bin/env bash
set -euo pipefail
fail() { echo "FAIL: $1"; exit 1; }
pass() { echo "PASS: $1"; }

backlog_candidate_exists() {
  local backlog_id="$1"
  BACKLOG_ID="$backlog_id" python - <<'PY'
import os, re
from pathlib import Path
text = Path('.opencode/backlog/candidates.yaml').read_text()
pattern = rf'(?m)^\s*-\s+id:\s*{re.escape(os.environ["BACKLOG_ID"])}\s*$'
raise SystemExit(0 if re.search(pattern, text) else 1)
PY
}

[[ -f .opencode/plans/current-phase.md ]] || fail 'missing .opencode/plans/current-phase.md'
[[ -f docs/releases/phase-registry.md ]] || fail 'missing docs/releases/phase-registry.md'
[[ -f AGENTS.md ]] || fail 'missing AGENTS.md'
[[ -f .opencode/backlog/candidates.yaml ]] || fail 'missing .opencode/backlog/candidates.yaml'
[[ -f .opencode/AGENTS.md ]] || fail 'missing .opencode/AGENTS.md'
[[ -f opencode.json ]] || fail 'missing opencode.json'

phase_file=$(grep -E '^Phase file:' .opencode/plans/current-phase.md | sed 's/^Phase file:[[:space:]]*//')
release_value=$(grep -E '^Release:' .opencode/plans/current-phase.md | sed 's/^Release:[[:space:]]*//')
phase_status=$(grep -E '^Status:' .opencode/plans/current-phase.md | head -1 | sed 's/^Status:[[:space:]]*//')
validation_value=$(python - <<'PY'
from pathlib import Path
lines = Path('.opencode/plans/current-phase.md').read_text().splitlines()
in_validation = False
for line in lines:
    if line.strip() == '## Validation':
        in_validation = True
        continue
    if in_validation and line.startswith('## '):
        break
    if in_validation and line.startswith('Status:'):
        print(line.split(':',1)[1].strip())
        break
else:
    print('')
PY
)
validation_command=$(python - <<'PY'
from pathlib import Path
lines = Path('.opencode/plans/current-phase.md').read_text().splitlines()
in_section = False
buffer = []
for line in lines:
    if line.strip() == '## Validation command':
        in_section = True
        continue
    if in_section and line.startswith('## '):
        break
    if in_section and line.strip() and not line.strip().startswith('```'):
        buffer.append(line.strip().strip('`'))
print(' '.join(buffer).strip())
PY
)

[[ -n "${phase_file:-}" ]] || fail 'could not resolve phase file from current phase'
[[ -n "${release_value:-}" ]] || fail 'missing Release value in current phase'
[[ -n "${phase_status:-}" ]] || fail 'missing top-level Status value in current phase'
[[ "${phase_status}" =~ ^(pending|in_progress|in-progress|complete|blocked)$ ]] || fail "unexpected top-level phase status value: ${phase_status}"
[[ "${validation_value}" =~ ^(pending|PASS|FAIL)$ ]] || fail "unexpected validation status value: ${validation_value}"
[[ -n "${validation_command:-}" ]] || fail 'missing Validation command content'
[[ "${validation_command}" != *'replace-with-real-validation-command'* ]] || fail 'validation command still contains placeholder text'

if [[ "${phase_file}" == backlog:* ]]; then
  backlog_candidate_exists "${phase_file#backlog:}" || fail "referenced backlog phase does not exist: ${phase_file}"
else
  [[ -f "${phase_file}" ]] || fail "referenced phase file does not exist: ${phase_file}"
fi

python - <<'PY'
from pathlib import Path
import json, re

agents = Path('AGENTS.md').read_text()
workflow_agents = Path('.opencode/AGENTS.md').read_text()
registry = Path('docs/releases/phase-registry.md').read_text()
backlog = Path('.opencode/backlog/candidates.yaml').read_text()
config = json.loads(Path('opencode.json').read_text())

required_agent_phrases = [
    'internal workflow',
    'must **not** become',
    'apps/web/**',
    'apps/api/**',
    'apps/copilot-cli/**',
]
for phrase in required_agent_phrases:
    if phrase not in agents:
        raise SystemExit(f'AGENTS.md is missing required boundary phrase: {phrase}')

required_workflow_phrases = [
    'internal-only',
    'Protected path rules',
    'release-manager may finalize workflow metadata only after PASS and must not push by default',
]
for phrase in required_workflow_phrases:
    if phrase not in workflow_agents:
        raise SystemExit(f'.opencode/AGENTS.md is missing required workflow phrase: {phrase}')

placeholder_patterns = [
    r'Replace with',
    r'replace-with-real-validation-command',
    r'Bootstrap the portable workflow into the target repository',
]
for rel in [
    'AGENTS.md',
    '.opencode/AGENTS.md',
    '.opencode/plans/current-phase.md',
    '.opencode/backlog/candidates.yaml',
    'docs/releases/phase-registry.md',
]:
    text = Path(rel).read_text()
    for pat in placeholder_patterns:
        if re.search(pat, text):
            raise SystemExit(f'placeholder text remains in {rel}: {pat}')

phase_refs = re.findall(r'`(docs/releases/phase-[^`]+\.md)`', registry)
if len(phase_refs) < 4:
    raise SystemExit('phase registry must reference at least four concrete phase docs')
for rel in phase_refs:
    if not Path(rel).exists():
        raise SystemExit(f'phase registry references missing phase doc: {rel}')

candidate_ids = re.findall(r'(?m)^\s*-\s+id:\s*([A-Za-z0-9._:-]+)\s*$', backlog)
if len(candidate_ids) < 2:
    raise SystemExit('backlog must contain at least two internal-only candidates')

if config.get('default_agent') != 'orchestrator':
    raise SystemExit('opencode.json default_agent must remain orchestrator')
if 'AGENTS.md' not in config.get('instructions', []):
    raise SystemExit('opencode.json must reference AGENTS.md in instructions')
ignore = set(config.get('watcher', {}).get('ignore', []))
for required in {'runs/**', 'data/**', '*.zip'}:
    if required not in ignore:
        raise SystemExit(f'opencode.json watcher.ignore is missing {required}')
PY

pass 'workflow invariants look consistent'
