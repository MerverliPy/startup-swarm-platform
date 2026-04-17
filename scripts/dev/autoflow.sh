#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"
fail() { echo "ERROR: $*" >&2; exit 1; }
phase_json() {
python - <<'PY'
from pathlib import Path
import json, re
text = Path('.opencode/plans/current-phase.md').read_text()
lines = text.splitlines()
out = {'title':'','status':'','release':'','phase_file':'','validation_status':'','ready_to_ship':'','validation_command':'','primary_files':[]}
section = None
validation_command_lines = []
validation_lines = []
for line in lines:
    s = line.strip()
    if line.startswith('# ') and not out['title']: out['title'] = line[2:].strip()
    if line.startswith('Status:') and not out['status']: out['status'] = line.split(':',1)[1].strip()
    if line.startswith('Release:'): out['release'] = line.split(':',1)[1].strip()
    if line.startswith('Phase file:'): out['phase_file'] = line.split(':',1)[1].strip()
    if s == '## Primary files': section = 'primary'; continue
    if s == '## Validation command': section = 'validation_command'; continue
    if s == '## Validation': section = 'validation'; continue
    if line.startswith('## '): section = None; continue
    if section == 'primary' and line.lstrip().startswith('- '): out['primary_files'].append(line.lstrip()[2:].strip().strip('`'))
    elif section == 'validation_command' and s: validation_command_lines.append(line.rstrip())
    elif section == 'validation': validation_lines.append(line.rstrip())
for raw in validation_command_lines:
    s = raw.strip()
    if s and not s.startswith('```'): out['validation_command'] = s.strip('`').strip(); break
validation_block = '\n'.join(validation_lines)
m = re.search(r'(?mi)^Status:\s*(.+)$', validation_block)
if m: out['validation_status'] = m.group(1).strip()
ready = re.search(r'(?mi)^Ready to ship:\s*(yes|no)\s*$', validation_block)
if ready: out['ready_to_ship'] = ready.group(1).strip().lower()
else:
    marker = re.search(r'(?mi)^Ready to ship:\s*$', validation_block)
    if marker:
        tail = validation_block[marker.end():]
        bullet = re.search(r'(?mi)^-\s*(yes|no)\s*$', tail)
        if bullet: out['ready_to_ship'] = bullet.group(1).strip().lower()
print(json.dumps(out))
PY
}
backlog_json() {
python - <<'PY'
from pathlib import Path
import json, re
path = Path('.opencode/backlog/candidates.yaml')
if not path.exists(): print(json.dumps({'candidate_count':0,'candidate_ids':[]})); raise SystemExit(0)
text = path.read_text()
match = re.search(r'(?ms)^candidates:\s*(.*?)(?=^(?:deferred_local_first_candidates|archived):|\Z)', text)
block = match.group(1) if match else ''
ids = re.findall(r'(?m)^\s*-\s+id:\s*([A-Za-z0-9._:-]+)\s*$', block)
print(json.dumps({'candidate_count': len(ids), 'candidate_ids': ids}))
PY
}
manual_next_command_for() {
  case "$1" in
    repair-phase-metadata) echo 'bash scripts/dev/repair-phase-metadata.sh && bash scripts/dev/workflow-check.sh' ;;
    repair-backlog-phase-ref) echo 'bash scripts/dev/repair-backlog-phase-ref.sh && bash scripts/dev/workflow-check.sh' ;;
    run-phase|validate-phase|fix-validation|ship-phase|next-phase) echo '/autoflow' ;;
    stop-no-candidates) echo 'none' ;;
    *) echo '/phase-status' ;;
  esac
}
collect_state() {
  local phase backlog
  phase="$(phase_json)"
  backlog="$(backlog_json)"
  local current_title current_status release phase_file validation_status ready_to_ship validation_command active_candidate_count phase_ref_type backlog_exists backlog_id next_action blocker manual_next_command
  current_title="$(python -c 'import json,sys; print(json.loads(sys.argv[1])["title"])' "$phase")"
  current_status="$(python -c 'import json,sys; print(json.loads(sys.argv[1])["status"])' "$phase")"
  release="$(python -c 'import json,sys; print(json.loads(sys.argv[1])["release"])' "$phase")"
  phase_file="$(python -c 'import json,sys; print(json.loads(sys.argv[1])["phase_file"])' "$phase")"
  validation_status="$(python -c 'import json,sys; print(json.loads(sys.argv[1])["validation_status"])' "$phase")"
  ready_to_ship="$(python -c 'import json,sys; print(json.loads(sys.argv[1])["ready_to_ship"])' "$phase")"
  validation_command="$(python -c 'import json,sys; print(json.loads(sys.argv[1])["validation_command"])' "$phase")"
  active_candidate_count="$(python -c 'import json,sys; print(json.loads(sys.argv[1])["candidate_count"])' "$backlog")"
  phase_ref_type=file; backlog_exists=n/a; backlog_id=''
  if [[ "$phase_file" == backlog:* ]]; then phase_ref_type=backlog; backlog_id="${phase_file#backlog:}"; if grep -Eq "^[[:space:]]*-[[:space:]]+id:[[:space:]]*${backlog_id}[[:space:]]*$" .opencode/backlog/candidates.yaml; then backlog_exists=yes; else backlog_exists=no; fi; fi
  next_action=stop-blocked; blocker=''
  if [[ ! "$validation_status" =~ ^(pending|PASS|FAIL)$ ]]; then next_action=repair-phase-metadata; blocker="unexpected validation status value: $validation_status";
  elif [[ "$phase_ref_type" == backlog && "$backlog_exists" == no ]]; then next_action=repair-backlog-phase-ref; blocker="backlog phase reference is missing from candidates.yaml: $phase_file";
  elif [[ "$current_status" == complete && "$validation_status" == PASS && "$ready_to_ship" == yes ]]; then next_action=ship-phase;
  elif [[ "$validation_status" == FAIL ]]; then next_action=fix-validation; blocker='validator blockers are present';
  elif [[ "$current_status" == complete && "$validation_status" == pending ]]; then next_action=validate-phase;
  elif [[ "$current_status" == pending || "$current_status" == in_progress || "$current_status" == in-progress ]]; then next_action=run-phase;
  elif [[ "$active_candidate_count" -gt 0 ]]; then next_action=next-phase;
  else next_action=stop-no-candidates; blocker='no active backlog candidates remain'; fi
  manual_next_command="$(manual_next_command_for "$next_action")"
  cat <<EOF
CURRENT_PHASE_TITLE=$current_title
CURRENT_STATUS=$current_status
RELEASE=$release
PHASE_FILE=$phase_file
PHASE_REFERENCE_TYPE=$phase_ref_type
BACKLOG_ID=$backlog_id
BACKLOG_REFERENCE_EXISTS=$backlog_exists
VALIDATION_STATUS=$validation_status
READY_TO_SHIP=$ready_to_ship
VALIDATION_COMMAND=$validation_command
ACTIVE_CANDIDATE_COUNT=$active_candidate_count
NEXT_ACTION=$next_action
BLOCKER=$blocker
MANUAL_NEXT_COMMAND=$manual_next_command
EOF
}
inspect() { collect_state; }
inspect_json() { local kv; kv="$(collect_state)"; python - <<'PY' "$kv"
import json, sys
out={}
for raw in sys.argv[1].splitlines():
    if '=' in raw:
        k,v = raw.split('=',1)
        out[k.lower()] = v
print(json.dumps(out))
PY
}
next_action_only() { collect_state | awk -F= '$1 == "NEXT_ACTION" { print $2 }'; }
manual_next_command() { collect_state | awk -F= '$1 == "MANUAL_NEXT_COMMAND" { print substr($0, index($0, "=") + 1) }'; }
rerun_gate() { case "${2:-}" in workflow-check) bash scripts/dev/workflow-check.sh ;; doctor) bash scripts/dev/doctor.sh ;; *) fail "unsupported gate: ${2:-}" ;; esac; }
case "${1:-inspect}" in inspect) inspect ;; inspect-json) inspect_json ;; next-action) next_action_only ;; manual-next-command) manual_next_command ;; rerun-gate) rerun_gate "$@" ;; *) fail 'usage: bash scripts/dev/autoflow.sh [inspect|inspect-json|next-action|manual-next-command|rerun-gate <gate>]' ;; esac
