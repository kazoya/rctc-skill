"""Run all conversation benchmarks and persist a reproducibility manifest."""

from __future__ import annotations

import json
import os
import platform
import subprocess
import sys
import time
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
RESULTS = ROOT / "backend" / "data" / "evaluation" / "results"


def run(args: list[str]) -> dict[str, object]:
    started = time.perf_counter()
    completed = subprocess.run(
        [sys.executable, *args],
        cwd=ROOT,
        text=True,
        encoding="utf-8",
        capture_output=True,
        check=False,
    )
    return {
        "command": [sys.executable, *args],
        "exit_code": completed.returncode,
        "elapsed_seconds": round(time.perf_counter() - started, 3),
        "stdout": completed.stdout,
        "stderr": completed.stderr,
    }


def main() -> int:
    RESULTS.mkdir(parents=True, exist_ok=True)
    started_at = datetime.now(timezone.utc)
    pip_freeze = subprocess.run(
        [sys.executable, "-m", "pip", "freeze"],
        cwd=ROOT,
        text=True,
        encoding="utf-8",
        capture_output=True,
        check=False,
    )
    jobs = [
        run(["-m", "backend.app.evaluation.conversation_benchmark", "--acceptance"]),
        run(["-m", "backend.app.evaluation.conversation_benchmark", "--split", "development"]),
        run(["-m", "backend.app.evaluation.conversation_benchmark", "--split", "holdout"]),
    ]
    manifest = {
        "started_at_utc": started_at.isoformat(),
        "finished_at_utc": datetime.now(timezone.utc).isoformat(),
        "python_executable": sys.executable,
        "python_version": sys.version,
        "platform": platform.platform(),
        "container": Path("/.dockerenv").exists(),
        "git_commit": os.environ.get("GIT_COMMIT", ""),
        "packages": pip_freeze.stdout.splitlines(),
        "jobs": jobs,
        "all_jobs_passed": all(job["exit_code"] == 0 for job in jobs),
    }
    output = RESULTS / "benchmark_run_manifest.json"
    output.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    for job in jobs:
        print(job["stdout"], end="")
        if job["stderr"]:
            print(job["stderr"], file=sys.stderr, end="")
    print(f"Manifest: {output}")
    return 0 if all(job["exit_code"] == 0 for job in jobs) else 1


if __name__ == "__main__":
    raise SystemExit(main())
