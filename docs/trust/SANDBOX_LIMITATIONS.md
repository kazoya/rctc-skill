# Capability Sandbox v1 — Enforced vs Policy

## Technically enforced (in-process)
- Boolean capability gates before `adapter.run` (process_exec, network, git_write, github_write, deploy, secrets)
- `secrets` always denied in engine v1
- `deploy` / `github_write` require owner publish flag (still no auto-deploy)
- Post-run `write_paths` check on `files_changed` reported by adapter

## Policy-checked / not OS-enforced
- Actual filesystem reads outside `read_paths` (Node can still read if adapter lies)
- Real network sockets if adapter ignores `network: false`
- Child processes if adapter shells out despite denial (we do not wrap `child_process` globally in v1)
- Adapter that omits files from `files_changed` can evade write check

## Honest summary
This is a **capability declaration + trust boundary**, not a hypervisor.
Hostile adapters are out of scope until a stronger runtime sandbox exists.
