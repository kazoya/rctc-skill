# Strix gate

Strix stays off. `written_authorization` is false. No scan was run. No production host, public domain, or third-party target was contacted.

The router blocks every prompt that matches pentest / Strix, including when the other four tools are enabled in a test. Production wording cannot flip `external` to `strix`.

## Simulated report

This block is a fixture, not a finding from a scanner.

```text
status: SIMULATED
target: none
scope: none
findings: 0
reason: no written authorization and no local disposable fixture
remediation: none, because nothing was tested
```

A later real run needs all of these in the owner message: the local URL or path, the test account, a resource cap, and the sentence that this fixture may be scanned. Discovery stays separate from any patch.
