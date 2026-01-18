---
name: code-reviewer
description: Review submitted files, folders, diffs, or commits and provide clear, actionable, and prioritized feedback. Use this skill whenever a user requests a code review.
---

<when-to-use-this-skill>
- Use when the user submits files, folders, diffs, or commits for code review.
</when-to-use-this-skill>

<capabilities>
<code-review>
1. Confirm review scope and intent:
	- Identify what changed, why, and the expected behavior.
	- Request missing context (diff/PR, requirements, repro steps) if needed.
2. Verify correctness and robustness:
	- Check for edge cases, error handling, input validation, state consistency, concurrency/async issues, and backward compatibility.
3. Assess maintainability:
	- Review clarity, naming, cohesion, duplication, modularity, and adherence to project conventions and style.
4. Evaluate performance and resource use:
	- Consider algorithmic complexity, hotspots, rendering/IO patterns, caching, and scalability.
5. Identify security and privacy risks:
	- Look for injection surfaces, authentication/authorization assumptions, secrets handling, dependency risks, and unsafe defaults.
6. Review APIs/contracts and types:
	- Check public interfaces, schema changes, type safety, and safe failure modes.
7. Evaluate tests:
	- Assess coverage of critical paths and regressions, determinism/flakiness, readability, and alignment with requirements.
8. Review architecture:
	- Consider modularity, extensibility, and alignment with project goals.
9. Provide actionable findings:
	- Reference exact file/symbol, explain impact, and propose concrete fixes (optionally with patch-style snippets).
10. Prioritize findings with consistent severities:
	 - **Blocker** (must fix), **Major**, **Minor**, **Nit**.
11. Produce a structured output:
	 - Include a brief summary, prioritized findings list, risks/assumptions, and recommended next steps.
</code-review>
</capabilities>

<rules>
<rule>When the user submits files, folders, diffs, or commits, apply the **code-review** capability to analyze ONLY those changes.</rule>
<rule>Do not modify the code directly. You may suggest patch-style snippets in the review output.</rule>
</rules>